// weBlogger - salida PDF de imprenta.
//
// El navegador imprime cada pagina de la publicacion a un PDF que ya mide el
// formato final mas el sangrado. Aqui se rehace ese PDF para la imprenta:
//   - se agranda la hoja con la zona de marcas y se fijan TrimBox y BleedBox,
//   - se dibujan marcas de corte, dianas de registro y tira de control,
//   - se pasa a CMYK todo lo que venga en RGB (colores, imagenes, degradados,
//     grupos de transparencia),
//   - se comprueba que todas las fuentes van incrustadas,
// y al final se unen todas las paginas en un solo PDF 1.6.

use std::collections::{BTreeMap, BTreeSet};
use std::io::{Read, Write};
use std::path::Path;

use lopdf::content::Content;
use lopdf::{dictionary, Dictionary, Document, Object, ObjectId, Stream, StringFormat};
use serde::{Deserialize, Serialize};

/// Puntos por milimetro.
pub const MM: f64 = 72.0 / 25.4;

#[derive(Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct PressOpts {
    pub trim_w: f64,
    pub trim_h: f64,
    pub bleed: f64,
    pub slug: f64,
    pub crop_marks: bool,
    pub registration: bool,
    pub color_bar: bool,
    pub cmyk: bool,
    pub title: String,
}

#[derive(Serialize, Default, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct PressReport {
    pub pages: u32,
    pub trim_mm: [f64; 2],
    pub bleed_mm: f64,
    pub fonts_total: u32,
    pub fonts_embedded: u32,
    pub fonts_missing: Vec<String>,
    pub images_total: u32,
    pub images_cmyk: u32,
    pub images_left_rgb: u32,
    pub colors_converted: u32,
    pub shadings_converted: u32,
    pub shadings_left: u32,
    pub warnings: Vec<String>,
}

impl PressReport {
    fn new(opts: &PressOpts) -> Self {
        PressReport {
            trim_mm: [opts.trim_w, opts.trim_h],
            bleed_mm: opts.bleed,
            ..Default::default()
        }
    }
    fn warn(&mut self, w: String) {
        if !self.warnings.contains(&w) {
            self.warnings.push(w);
        }
    }
}

fn e<E: std::fmt::Display>(x: E) -> String {
    x.to_string()
}

/* ------------------------------------------------------------- proceso -- */

/// Imprime cada HTML con el navegador, postprocesa cada PDF y los une en `pdf`.
pub fn press(pages: &[String], pdf: &str, opts: &PressOpts) -> Result<PressReport, String> {
    if pages.is_empty() {
        return Err("no hay paginas que imprimir".into());
    }
    if !(opts.trim_w > 0.0 && opts.trim_h > 0.0 && opts.bleed >= 0.0 && opts.slug >= 0.0) {
        return Err("medidas de imprenta no validas".into());
    }
    let stamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_nanos())
        .unwrap_or(0);
    let dir = std::env::temp_dir().join(format!("weblogger-imprenta-{}-{stamp}", std::process::id()));
    std::fs::create_dir_all(&dir).map_err(e)?;
    let result = press_in(&dir, pages, pdf, opts);
    let _ = std::fs::remove_dir_all(&dir);
    result
}

fn press_in(dir: &Path, pages: &[String], pdf: &str, opts: &PressOpts) -> Result<PressReport, String> {
    let mut rep = PressReport::new(opts);
    let mut docs = Vec::with_capacity(pages.len());
    for (i, html) in pages.iter().enumerate() {
        let h = dir.join(format!("pagina-{:04}.html", i + 1));
        let p = dir.join(format!("pagina-{:04}.pdf", i + 1));
        std::fs::write(&h, html.as_bytes()).map_err(e)?;
        crate::print_html_file(&h, &p).map_err(|x| format!("pagina {}: {x}", i + 1))?;
        let mut doc = Document::load(&p).map_err(|x| format!("pagina {}: PDF ilegible: {x}", i + 1))?;
        let n = doc.get_pages().len();
        if n > 1 {
            rep.warn(format!(
                "la pagina {} de la publicacion no cabe en una hoja y ha salido en {n}",
                i + 1
            ));
        }
        postprocess(&mut doc, opts, &mut rep)?;
        docs.push(doc);
        let _ = std::fs::remove_file(&h);
        let _ = std::fs::remove_file(&p);
    }
    let mut out = merge(docs)?;
    finish(&mut out, opts, &mut rep);
    let _ = std::fs::remove_file(pdf);
    out.save(pdf).map_err(|x| format!("no se puede escribir {pdf}: {x}"))?;
    Ok(rep)
}

/// Postproceso de un PDF salido del navegador: CMYK, cajas y marcas.
pub fn postprocess(doc: &mut Document, opts: &PressOpts, rep: &mut PressReport) -> Result<(), String> {
    if opts.cmyk {
        convert_objects(doc, rep);
    }
    let pages: Vec<ObjectId> = doc.get_pages().into_values().collect();
    for (n, pid) in pages.into_iter().enumerate() {
        page_boxes_and_marks(doc, pid, n + 1, opts, rep)?;
    }
    Ok(())
}

/// Datos finales del documento unido: informacion, version y fuentes.
pub fn finish(doc: &mut Document, opts: &PressOpts, rep: &mut PressReport) {
    doc.version = "1.6".into();
    let title = if opts.title.trim().is_empty() { "weBlogger" } else { opts.title.trim() };
    let now = pdf_date();
    let info = doc.add_object(dictionary! {
        "Title" => pdf_text(title),
        "Creator" => Object::string_literal("weBlogger"),
        "Producer" => pdf_text("weBlogger - imprenta"),
        "CreationDate" => Object::string_literal(now.clone()),
        "ModDate" => Object::string_literal(now),
        "Trapped" => Object::Name(b"False".to_vec()),
    });
    doc.trailer.set("Info", info);
    doc.trailer.remove(b"ID");
    rep.pages = doc.get_pages().len() as u32;
    audit_fonts(doc, rep);
}

/* --------------------------------------------------------------- color -- */

/// RGB (0..1) a CMYK. Los grises van solo a negro; el resto con GCR y la
/// carga total de tinta limitada al 300 %.
pub fn rgb_to_cmyk(r: f64, g: f64, b: f64) -> [f64; 4] {
    let (r, g, b) = (r.clamp(0.0, 1.0), g.clamp(0.0, 1.0), b.clamp(0.0, 1.0));
    let mx = r.max(g).max(b);
    let mn = r.min(g).min(b);
    if mx - mn <= 0.02 {
        let gray = (r + g + b) / 3.0;
        return [0.0, 0.0, 0.0, round4(1.0 - gray)];
    }
    let k = 1.0 - mx;
    let d = 1.0 - k; // = mx > 0, porque no es gris
    let mut c = (1.0 - r - k) / d;
    let mut m = (1.0 - g - k) / d;
    let mut y = (1.0 - b - k) / d;
    let total = c + m + y + k;
    if total > 3.0 {
        let cmy = c + m + y;
        let f = ((cmy - (total - 3.0)) / cmy).max(0.0);
        c *= f;
        m *= f;
        y *= f;
    }
    [round4(c), round4(m), round4(y), round4(k)]
}

fn round4(v: f64) -> f64 {
    let v = (v.clamp(0.0, 1.0) * 10000.0).round() / 10000.0;
    if v == 0.0 {
        0.0
    } else {
        v
    }
}

fn rgb8_to_cmyk8(src: &[u8], out: &mut Vec<u8>) {
    let mut last: Option<([u8; 3], [u8; 4])> = None;
    for px in src.chunks_exact(3) {
        let key = [px[0], px[1], px[2]];
        let v = match last {
            Some((k, v)) if k == key => v,
            _ => {
                let c = rgb_to_cmyk(px[0] as f64 / 255.0, px[1] as f64 / 255.0, px[2] as f64 / 255.0);
                let v = [
                    (c[0] * 255.0).round() as u8,
                    (c[1] * 255.0).round() as u8,
                    (c[2] * 255.0).round() as u8,
                    (c[3] * 255.0).round() as u8,
                ];
                last = Some((key, v));
                v
            }
        };
        out.extend_from_slice(&v);
    }
}

fn num(o: &Object) -> Option<f64> {
    match o {
        Object::Integer(i) => Some(*i as f64),
        Object::Real(r) => Some(*r as f64),
        _ => None,
    }
}

fn real(v: f64) -> Object {
    if v == v.trunc() && v.abs() < 1e9 {
        Object::Integer(v as i64)
    } else {
        Object::Real(v as f32)
    }
}

/// Convierte un array de 3 numeros RGB en 4 CMYK.
fn convert_triplet(a: &[Object]) -> Option<Vec<Object>> {
    if a.len() != 3 {
        return None;
    }
    let (r, g, b) = (num(&a[0])?, num(&a[1])?, num(&a[2])?);
    Some(rgb_to_cmyk(r, g, b).iter().map(|v| real(*v)).collect())
}

fn deref<'a>(doc: &'a Document, o: &'a Object) -> &'a Object {
    doc.dereference(o).map(|(_, o)| o).unwrap_or(o)
}

fn name_of(o: &Object) -> Option<&[u8]> {
    o.as_name().ok()
}

fn icc_n(doc: &Document, o: &Object) -> Option<i64> {
    let s = deref(doc, o).as_stream().ok()?;
    s.dict.get(b"N").ok().and_then(|n| n.as_i64().ok())
}

/// Espacio de color con tres componentes RGB.
fn is_rgb_cs(doc: &Document, o: &Object) -> bool {
    match deref(doc, o) {
        Object::Name(n) => n == b"DeviceRGB" || n == b"RGB" || n == b"CalRGB",
        Object::Array(a) if !a.is_empty() => match name_of(&a[0]) {
            Some(b"ICCBased") => a.len() > 1 && icc_n(doc, &a[1]) == Some(3),
            Some(b"CalRGB") => true,
            _ => false,
        },
        _ => false,
    }
}

fn is_cmyk_cs(doc: &Document, o: &Object) -> bool {
    match deref(doc, o) {
        Object::Name(n) => n == b"DeviceCMYK" || n == b"CMYK",
        Object::Array(a) if a.len() > 1 => name_of(&a[0]) == Some(b"ICCBased") && icc_n(doc, &a[1]) == Some(4),
        _ => false,
    }
}

fn is_gray_cs(doc: &Document, o: &Object) -> bool {
    match deref(doc, o) {
        Object::Name(n) => n == b"DeviceGray" || n == b"G" || n == b"CalGray",
        Object::Array(a) if !a.is_empty() => match name_of(&a[0]) {
            Some(b"ICCBased") => a.len() > 1 && icc_n(doc, &a[1]) == Some(1),
            Some(b"CalGray") => true,
            _ => false,
        },
        _ => false,
    }
}

fn cmyk_name() -> Object {
    Object::Name(b"DeviceCMYK".to_vec())
}

/* ----------------------------------------------------- datos de streams -- */

fn inflate(data: &[u8]) -> Result<Vec<u8>, String> {
    let mut out = Vec::new();
    let mut z = flate2::read::ZlibDecoder::new(data);
    match z.read_to_end(&mut out) {
        Ok(_) => Ok(out),
        Err(x) => {
            // zlib sin cabecera, por si acaso
            let mut out2 = Vec::new();
            let mut d = flate2::read::DeflateDecoder::new(data);
            if d.read_to_end(&mut out2).is_ok() && !out2.is_empty() {
                Ok(out2)
            } else if !out.is_empty() {
                Ok(out)
            } else {
                Err(format!("FlateDecode: {x}"))
            }
        }
    }
}

fn deflate(data: &[u8]) -> Vec<u8> {
    let mut z = flate2::write::ZlibEncoder::new(Vec::new(), flate2::Compression::default());
    let _ = z.write_all(data);
    z.finish().unwrap_or_default()
}

fn dict_i64(d: &Dictionary, k: &[u8], def: i64) -> i64 {
    d.get(k).ok().and_then(|o| o.as_i64().ok()).unwrap_or(def)
}

/// Deshace los predictores TIFF (2) y PNG (10-15).
fn unpredict(data: &[u8], parms: &Dictionary) -> Result<Vec<u8>, String> {
    let pred = dict_i64(parms, b"Predictor", 1);
    if pred <= 1 {
        return Ok(data.to_vec());
    }
    let colors = dict_i64(parms, b"Colors", 1).max(1) as usize;
    let bpc = dict_i64(parms, b"BitsPerComponent", 8).max(1) as usize;
    let cols = dict_i64(parms, b"Columns", 1).max(1) as usize;
    let bpp = (colors * bpc).div_ceil(8).max(1);
    let row = (colors * bpc * cols).div_ceil(8);
    if pred == 2 {
        if bpc != 8 {
            return Err("predictor TIFF con bits distintos de 8".into());
        }
        let mut out = data.to_vec();
        for r in out.chunks_mut(row) {
            for i in colors..r.len() {
                r[i] = r[i].wrapping_add(r[i - colors]);
            }
        }
        return Ok(out);
    }
    if pred < 10 {
        return Err(format!("predictor {pred} no soportado"));
    }
    let mut out = Vec::with_capacity(data.len());
    let mut prev = vec![0u8; row];
    for chunk in data.chunks(row + 1) {
        if chunk.len() < 2 {
            break;
        }
        let ft = chunk[0];
        let mut cur = chunk[1..].to_vec();
        cur.resize(row, 0);
        for i in 0..row {
            let a = if i >= bpp { cur[i - bpp] as i16 } else { 0 };
            let b = prev[i] as i16;
            let c = if i >= bpp { prev[i - bpp] as i16 } else { 0 };
            let add = match ft {
                0 => 0,
                1 => a,
                2 => b,
                3 => (a + b) / 2,
                4 => {
                    let p = a + b - c;
                    let (pa, pb, pc) = ((p - a).abs(), (p - b).abs(), (p - c).abs());
                    if pa <= pb && pa <= pc {
                        a
                    } else if pb <= pc {
                        b
                    } else {
                        c
                    }
                }
                _ => return Err(format!("filtro PNG {ft} no valido")),
            };
            cur[i] = cur[i].wrapping_add(add as u8);
        }
        out.extend_from_slice(&cur);
        prev = cur;
    }
    Ok(out)
}

fn filters(s: &Stream) -> Vec<Vec<u8>> {
    match s.dict.get(b"Filter") {
        Ok(Object::Name(n)) => vec![n.clone()],
        Ok(Object::Array(a)) => a.iter().filter_map(|o| name_of(o).map(|n| n.to_vec())).collect(),
        _ => vec![],
    }
}

fn decode_parms(doc: &Document, s: &Stream) -> Option<Dictionary> {
    match s.dict.get(b"DecodeParms").map(|o| deref(doc, o)) {
        Ok(Object::Dictionary(d)) => Some(d.clone()),
        Ok(Object::Array(a)) => a.iter().find_map(|o| deref(doc, o).as_dict().ok().cloned()),
        _ => None,
    }
}

/// Datos sin filtros (solo sin filtro o FlateDecode, con predictor).
fn stream_bytes(doc: &Document, s: &Stream) -> Result<Vec<u8>, String> {
    let f = filters(s);
    match f.as_slice() {
        [] => Ok(s.content.clone()),
        [one] if one == b"FlateDecode" || one == b"Fl" => {
            let raw = inflate(&s.content)?;
            match decode_parms(doc, s) {
                Some(p) => unpredict(&raw, &p),
                None => Ok(raw),
            }
        }
        _ => Err(format!(
            "filtro {} no soportado",
            f.iter().map(|x| String::from_utf8_lossy(x).into_owned()).collect::<Vec<_>>().join("+")
        )),
    }
}

/// Stream nuevo comprimido con Flate.
fn flate_stream(mut dict: Dictionary, data: &[u8]) -> Stream {
    dict.remove(b"DecodeParms");
    dict.remove(b"Filter");
    dict.remove(b"DL");
    dict.remove(b"ColorTransform"); // parametro de DCTDecode: ya no aplica
    dict.set("Filter", Object::Name(b"FlateDecode".to_vec()));
    Stream::new(dict, deflate(data))
}

/* --------------------------------------------- conversion de objetos -- */

#[derive(Default)]
struct Conv {
    repl: BTreeMap<ObjectId, Object>,
    funcs: BTreeMap<ObjectId, Object>,
    smasks: BTreeSet<ObjectId>,
    matte: BTreeSet<ObjectId>,
}

/// Recorre todos los objetos del documento y pasa a CMYK imagenes,
/// sombreados, formularios, patrones y grupos de transparencia.
fn convert_objects(doc: &mut Document, rep: &mut PressReport) {
    let mut cv = Conv::default();
    // las mascaras suaves no son imagenes de la pagina
    for o in doc.objects.values() {
        if let Ok(s) = o.as_stream() {
            if let Ok(Object::Reference(id)) = s.dict.get(b"SMask") {
                cv.smasks.insert(*id);
            }
        }
    }
    let ids: Vec<ObjectId> = doc.objects.keys().cloned().collect();
    for id in ids {
        let d: &Document = doc;
        let obj = &d.objects[&id];
        let new = match obj {
            Object::Stream(s) => convert_stream(d, id, s, &mut cv, rep),
            other => transform(d, other, &mut cv, rep),
        };
        if let Some(n) = new {
            cv.repl.insert(id, n);
        }
    }
    let Conv { repl, funcs, matte, .. } = cv;
    for (id, o) in repl.into_iter().chain(funcs) {
        doc.objects.insert(id, o);
    }
    for id in matte {
        if let Some(Object::Stream(s)) = doc.objects.get_mut(&id) {
            if let Ok(Object::Array(a)) = s.dict.get(b"Matte") {
                if let Some(n) = convert_triplet(a) {
                    s.dict.set("Matte", n);
                }
            }
        }
    }
}

fn subtype(d: &Dictionary) -> &[u8] {
    d.get(b"Subtype").ok().and_then(name_of).unwrap_or(b"")
}

fn convert_stream(doc: &Document, id: ObjectId, s: &Stream, cv: &mut Conv, rep: &mut PressReport) -> Option<Object> {
    let d = &s.dict;
    if subtype(d) == b"Image" {
        return convert_image(doc, id, s, cv, rep);
    }
    if d.has(b"ShadingType") {
        let nd = convert_shading(doc, d, cv, rep)?;
        let mut ns = s.clone();
        ns.dict = nd;
        return Some(Object::Stream(ns));
    }
    let is_form = subtype(d) == b"Form" || dict_i64(d, b"PatternType", 0) == 1;
    if !is_form {
        return None;
    }
    let mut changed = false;
    let mut ns = s.clone();
    let res = d.get(b"Resources").ok().map(|r| deref(doc, r)).and_then(|r| r.as_dict().ok());
    match stream_bytes(doc, s) {
        Ok(bytes) => match convert_content(doc, &bytes, res, rep) {
            Ok(Some(nb)) => {
                ns = flate_stream(d.clone(), &nb);
                changed = true;
            }
            Ok(None) => {}
            Err(x) => rep.warn(format!("formulario {} {}: {x}", id.0, id.1)),
        },
        Err(x) => rep.warn(format!("formulario {} {}: {x}", id.0, id.1)),
    }
    if let Some(Object::Dictionary(nd)) = transform(doc, &Object::Dictionary(ns.dict.clone()), cv, rep) {
        ns.dict = nd;
        changed = true;
    }
    changed.then_some(Object::Stream(ns))
}

/// Recorre diccionarios y arrays sueltos: sombreados en linea, grupos de
/// transparencia y fondos de mascaras suaves.
fn transform(doc: &Document, o: &Object, cv: &mut Conv, rep: &mut PressReport) -> Option<Object> {
    match o {
        Object::Dictionary(d) => {
            if d.has(b"ShadingType") {
                return convert_shading(doc, d, cv, rep).map(Object::Dictionary);
            }
            let mut nd: Option<Dictionary> = None;
            for (k, v) in d.iter() {
                if let Some(nv) = transform(doc, v, cv, rep) {
                    nd.get_or_insert_with(|| d.clone()).set(k.clone(), nv);
                }
            }
            let is_group = d.get(b"S").ok().and_then(name_of) == Some(b"Transparency");
            if is_group {
                if let Ok(cs) = d.get(b"CS") {
                    if is_rgb_cs(doc, cs) {
                        nd.get_or_insert_with(|| d.clone()).set("CS", cmyk_name());
                    }
                }
            }
            if d.get(b"S").ok().and_then(name_of) == Some(b"Luminosity") {
                if let Ok(Object::Array(bc)) = d.get(b"BC") {
                    if let Some(n) = convert_triplet(bc) {
                        nd.get_or_insert_with(|| d.clone()).set("BC", n);
                    }
                }
            }
            nd.map(Object::Dictionary)
        }
        Object::Array(a) => {
            let mut na: Option<Vec<Object>> = None;
            for (i, v) in a.iter().enumerate() {
                if let Some(nv) = transform(doc, v, cv, rep) {
                    na.get_or_insert_with(|| a.clone())[i] = nv;
                }
            }
            na.map(Object::Array)
        }
        _ => None,
    }
}

/* ---------------------------------------------------------- imagenes -- */

fn convert_image(doc: &Document, id: ObjectId, s: &Stream, cv: &mut Conv, rep: &mut PressReport) -> Option<Object> {
    let d = &s.dict;
    if cv.smasks.contains(&id) || d.get(b"ImageMask").and_then(|o| o.as_bool()).unwrap_or(false) {
        return None;
    }
    rep.images_total += 1;
    let Ok(cs) = d.get(b"ColorSpace") else {
        return None; // JPX con espacio propio: no se toca
    };
    if is_cmyk_cs(doc, cs) {
        rep.images_cmyk += 1;
        return None;
    }
    // indexada sobre RGB: basta con convertir la paleta
    if let Object::Array(a) = deref(doc, cs) {
        if a.len() == 4 && name_of(&a[0]) == Some(b"Indexed") {
            if !is_rgb_cs(doc, &a[1]) {
                return None;
            }
            let lut: Option<Vec<u8>> = match deref(doc, &a[3]) {
                Object::String(b, _) => Some(b.clone()),
                Object::Stream(ls) => stream_bytes(doc, ls).ok(),
                _ => None,
            };
            if let Some(lut) = lut {
                let mut out = Vec::with_capacity(lut.len() / 3 * 4);
                rgb8_to_cmyk8(&lut[..lut.len() / 3 * 3], &mut out);
                let mut nd = d.clone();
                nd.set(
                    "ColorSpace",
                    vec![
                        Object::Name(b"Indexed".to_vec()),
                        cmyk_name(),
                        a[2].clone(),
                        Object::String(out, StringFormat::Hexadecimal),
                    ],
                );
                rep.images_cmyk += 1;
                let mut ns = s.clone();
                ns.dict = nd;
                return Some(Object::Stream(ns));
            }
            return left_image(id, "paleta ilegible", rep);
        }
    }
    if !is_rgb_cs(doc, cs) {
        // escala de grises (p. ej. las mascaras de las sombras): va a una
        // sola tinta, el negro, y no hay que convertirla
        if is_gray_cs(doc, cs) {
            rep.images_cmyk += 1;
        }
        return None;
    }
    if dict_i64(d, b"BitsPerComponent", 8) != 8 {
        return left_image(id, "no es de 8 bits", rep);
    }
    if let Ok(Object::Array(_)) = d.get(b"Mask") {
        return left_image(id, "lleva mascara de color", rep);
    }
    if let Ok(Object::Array(dec)) = d.get(b"Decode") {
        let std = dec.iter().enumerate().all(|(i, v)| num(v) == Some((i % 2) as f64));
        if !std {
            return left_image(id, "lleva /Decode", rep);
        }
    }
    let w = dict_i64(d, b"Width", 0).max(0) as usize;
    let h = dict_i64(d, b"Height", 0).max(0) as usize;
    let f = filters(s);
    let rgb: Result<Vec<u8>, String> = match f.as_slice() {
        [one] if one == b"DCTDecode" || one == b"DCT" => {
            let mut dec = jpeg_decoder::Decoder::new(s.content.as_slice());
            match dec.decode() {
                Ok(px) => match dec.info().map(|i| i.pixel_format) {
                    Some(jpeg_decoder::PixelFormat::RGB24) => Ok(px),
                    Some(other) => Err(format!("JPEG en formato {other:?}")),
                    None => Err("JPEG sin datos".into()),
                },
                Err(x) => Err(format!("JPEG: {x}")),
            }
        }
        _ => stream_bytes(doc, s),
    };
    let rgb = match rgb {
        Ok(v) => v,
        Err(x) => return left_image(id, &x, rep),
    };
    if w == 0 || h == 0 || rgb.len() < w * h * 3 {
        return left_image(id, "datos incompletos", rep);
    }
    let mut out = Vec::with_capacity(w * h * 4);
    rgb8_to_cmyk8(&rgb[..w * h * 3], &mut out);
    let mut nd = d.clone();
    nd.set("ColorSpace", cmyk_name());
    nd.remove(b"Decode");
    nd.remove(b"Intent");
    if let Ok(Object::Reference(sm)) = d.get(b"SMask") {
        cv.matte.insert(*sm);
    }
    rep.images_cmyk += 1;
    Some(Object::Stream(flate_stream(nd, &out)))
}

fn left_image(id: ObjectId, why: &str, rep: &mut PressReport) -> Option<Object> {
    rep.images_left_rgb += 1;
    rep.warn(format!("imagen {} {} sigue en RGB: {why}", id.0, id.1));
    None
}

/* -------------------------------------------------------- sombreados -- */

fn convert_shading(doc: &Document, d: &Dictionary, cv: &mut Conv, rep: &mut PressReport) -> Option<Dictionary> {
    let cs = d.get(b"ColorSpace").ok()?;
    if !is_rgb_cs(doc, cs) {
        return None;
    }
    let st = dict_i64(d, b"ShadingType", 0);
    let res = match d.get(b"Function") {
        Ok(Object::Array(_)) => Err("una funcion por componente".to_string()),
        Ok(f) => convert_function(doc, f, cv, 0),
        Err(_) => Err(format!("sombreado tipo {st} sin funcion (colores en los vertices)")),
    };
    match res {
        Ok(f) => {
            let mut nd = d.clone();
            nd.set("ColorSpace", cmyk_name());
            nd.set("Function", f);
            if let Ok(Object::Array(bg)) = d.get(b"Background") {
                if let Some(n) = convert_triplet(bg) {
                    nd.set("Background", n);
                }
            }
            rep.shadings_converted += 1;
            Some(nd)
        }
        Err(x) => {
            rep.shadings_left += 1;
            rep.warn(format!("degradado tipo {st} sigue en RGB: {x}"));
            None
        }
    }
}

/// Devuelve la funcion convertida (si va en linea) o la misma referencia
/// (y apunta el objeto convertido en `cv.funcs`).
fn convert_function(doc: &Document, f: &Object, cv: &mut Conv, depth: u32) -> Result<Object, String> {
    if depth > 8 {
        return Err("funciones anidadas en exceso".into());
    }
    if let Object::Reference(id) = f {
        if cv.funcs.contains_key(id) {
            return Ok(f.clone());
        }
        let target = doc.get_object(*id).map_err(e)?;
        let n = convert_function(doc, target, cv, depth + 1)?;
        cv.funcs.insert(*id, n);
        return Ok(f.clone());
    }
    let (dict, stream) = match f {
        Object::Dictionary(d) => (d, None),
        Object::Stream(s) => (&s.dict, Some(s)),
        _ => return Err("funcion no valida".into()),
    };
    let ft = dict_i64(dict, b"FunctionType", -1);
    let mut nd = dict.clone();
    if let Ok(Object::Array(r)) = dict.get(b"Range") {
        if r.len() == 6 {
            nd.set("Range", unit_range(4));
        }
    }
    match ft {
        2 => {
            let c0 = dict.get(b"C0").ok().and_then(|o| o.as_array().ok().cloned()).unwrap_or(vec![real(0.0)]);
            let c1 = dict.get(b"C1").ok().and_then(|o| o.as_array().ok().cloned()).unwrap_or(vec![real(1.0)]);
            let (n0, n1) = (convert_triplet(&c0), convert_triplet(&c1));
            match (n0, n1) {
                (Some(a), Some(b)) => {
                    nd.set("C0", a);
                    nd.set("C1", b);
                    Ok(Object::Dictionary(nd))
                }
                _ => Err("funcion tipo 2 sin tres componentes".into()),
            }
        }
        3 => {
            let fs = dict.get(b"Functions").map(|o| deref(doc, o)).and_then(|o| o.as_array()).map_err(e)?;
            let mut nf = Vec::with_capacity(fs.len());
            for sub in fs {
                nf.push(convert_function(doc, sub, cv, depth + 1)?);
            }
            nd.set("Functions", nf);
            Ok(Object::Dictionary(nd))
        }
        0 => {
            let s = stream.ok_or("funcion tipo 0 sin datos")?;
            if dict_i64(dict, b"BitsPerSample", 0) != 8 {
                return Err("funcion muestreada que no es de 8 bits".into());
            }
            let range = dict.get(b"Range").and_then(|o| o.as_array()).map_err(e)?;
            if range.len() != 6 || !range.iter().enumerate().all(|(i, v)| num(v) == Some((i % 2) as f64)) {
                return Err("funcion muestreada con rango no normal".into());
            }
            if let Ok(Object::Array(dec)) = dict.get(b"Decode") {
                if dec.len() != 6 || !dec.iter().enumerate().all(|(i, v)| num(v) == Some((i % 2) as f64)) {
                    return Err("funcion muestreada con /Decode".into());
                }
                nd.set("Decode", unit_range(4));
            }
            let size: usize = dict
                .get(b"Size")
                .and_then(|o| o.as_array())
                .map_err(e)?
                .iter()
                .map(|v| v.as_i64().unwrap_or(0).max(0) as usize)
                .product();
            let data = stream_bytes(doc, s)?;
            if data.len() < size * 3 {
                return Err("funcion muestreada incompleta".into());
            }
            let mut out = Vec::with_capacity(size * 4);
            rgb8_to_cmyk8(&data[..size * 3], &mut out);
            Ok(Object::Stream(flate_stream(nd, &out)))
        }
        4 => {
            let s = stream.ok_or("funcion tipo 4 sin datos")?;
            let code = stream_bytes(doc, s)?;
            let close = code.iter().rposition(|c| *c == b'}').ok_or("funcion PostScript sin llaves")?;
            let mut nc = code[..close].to_vec();
            nc.extend_from_slice(PS_RGB_TO_CMYK.as_bytes());
            nc.extend_from_slice(b" }");
            if !dict.has(b"Range") {
                return Err("funcion PostScript sin rango".into());
            }
            Ok(Object::Stream(flate_stream(nd, &nc)))
        }
        _ => Err(format!("funcion tipo {ft}")),
    }
}

/// Se anade al final de una funcion PostScript que deja r g b en la pila:
/// la deja con c m y k (GCR, la misma formula que `rgb_to_cmyk`).
const PS_RGB_TO_CMYK: &str = " 3 copy 2 copy lt {exch} if pop 2 copy lt {exch} if pop 1 exch sub \
dup 0.9999 gt { pop pop pop pop 0 0 0 1 } { 1 1 index sub \
5 -1 roll 1 exch sub 2 index sub 1 index div 5 1 roll \
4 -1 roll 1 exch sub 2 index sub 1 index div 4 1 roll \
3 -1 roll 1 exch sub 2 index sub 1 index div 3 1 roll pop } ifelse";

fn unit_range(n: usize) -> Vec<Object> {
    (0..n).flat_map(|_| [Object::Integer(0), Object::Integer(1)]).collect()
}

/* ------------------------------------------------ streams de contenido -- */

/// Pasa a CMYK los operadores de color de un stream de contenido.
/// Devuelve None si no habia nada que cambiar.
fn convert_content(
    doc: &Document,
    bytes: &[u8],
    res: Option<&Dictionary>,
    rep: &mut PressReport,
) -> Result<Option<Vec<u8>>, String> {
    let mut content = Content::decode(bytes).map_err(|x| format!("contenido ilegible: {x}"))?;
    let named = res
        .and_then(|r| r.get(b"ColorSpace").ok())
        .map(|o| deref(doc, o))
        .and_then(|o| o.as_dict().ok());
    // (relleno RGB, trazo RGB) con su pila q/Q
    let mut st = (false, false);
    let mut stack: Vec<(bool, bool)> = Vec::new();
    let mut changed = 0u32;
    let mut colors = 0u32;
    for op in content.operations.iter_mut() {
        match op.operator.as_str() {
            "q" => stack.push(st),
            "Q" => st = stack.pop().unwrap_or((false, false)),
            "rg" | "RG" => {
                if let Some(n) = convert_triplet(&op.operands) {
                    let stroke = op.operator == "RG";
                    op.operator = if stroke { "K" } else { "k" }.into();
                    op.operands = n;
                    changed += 1;
                    colors += 1;
                    if stroke {
                        st.1 = true;
                    } else {
                        st.0 = true;
                    }
                }
            }
            "g" | "k" => st.0 = false,
            "G" | "K" => st.1 = false,
            "cs" | "CS" => {
                let rgb = op
                    .operands
                    .first()
                    .and_then(name_of)
                    .map(|n| {
                        n == b"DeviceRGB"
                            || n == b"RGB"
                            || named.and_then(|cs| cs.get(n).ok()).map(|o| is_rgb_cs(doc, o)).unwrap_or(false)
                    })
                    .unwrap_or(false);
                if rgb {
                    op.operands = vec![cmyk_name()];
                    changed += 1;
                }
                if op.operator == "cs" {
                    st.0 = rgb;
                } else {
                    st.1 = rgb;
                }
            }
            "sc" | "scn" | "SC" | "SCN" => {
                let rgb = if op.operator.starts_with('s') { st.0 } else { st.1 };
                if rgb {
                    if let Some(n) = convert_triplet(&op.operands) {
                        op.operands = n;
                        changed += 1;
                        colors += 1;
                    }
                }
            }
            _ => {}
        }
    }
    if changed == 0 {
        return Ok(None);
    }
    rep.colors_converted += colors;
    content.encode().map(Some).map_err(|x| format!("no se puede reescribir el contenido: {x}"))
}

fn qq_balance(bytes: &[u8]) -> i64 {
    match Content::decode(bytes) {
        Ok(c) => {
            let mut depth = 0i64;
            for op in &c.operations {
                match op.operator.as_str() {
                    "q" => depth += 1,
                    "Q" if depth > 0 => depth -= 1,
                    _ => {}
                }
            }
            depth
        }
        Err(_) => 0,
    }
}

/* ------------------------------------------------- cajas y marcas -- */

/// Atributo de pagina, heredado de los /Pages si hace falta.
fn inherited(doc: &Document, pid: ObjectId, key: &[u8]) -> Option<Object> {
    let mut id = pid;
    for _ in 0..32 {
        let d = doc.get_dictionary(id).ok()?;
        if let Ok(v) = d.get(key) {
            return Some(v.clone());
        }
        id = d.get(b"Parent").ok()?.as_reference().ok()?;
    }
    None
}

fn rect(doc: &Document, o: &Object) -> Option<[f64; 4]> {
    let a = deref(doc, o).as_array().ok()?;
    if a.len() != 4 {
        return None;
    }
    let v: Vec<f64> = a.iter().filter_map(|x| num(deref(doc, x))).collect();
    (v.len() == 4).then(|| [v[0].min(v[2]), v[1].min(v[3]), v[0].max(v[2]), v[1].max(v[3])])
}

fn box_obj(r: [f64; 4]) -> Object {
    Object::Array(r.iter().map(|v| Object::Real(((v * 1000.0).round() / 1000.0) as f32)).collect())
}

fn page_boxes_and_marks(
    doc: &mut Document,
    pid: ObjectId,
    pno: usize,
    opts: &PressOpts,
    rep: &mut PressReport,
) -> Result<(), String> {
    let s = opts.slug * MM;
    let b = opts.bleed * MM;
    let ew = (opts.trim_w + 2.0 * opts.bleed) * MM;
    let eh = (opts.trim_h + 2.0 * opts.bleed) * MM;
    let mb = inherited(doc, pid, b"MediaBox")
        .and_then(|o| rect(doc, &o))
        .unwrap_or([0.0, 0.0, ew, eh]);
    let (in_w, in_h) = (mb[2] - mb[0], mb[3] - mb[1]);
    let fits = (in_w - ew).abs() <= 1.0 && (in_h - eh).abs() <= 1.0;
    // El navegador redondea la hoja (p. ej. a puntos enteros). Si coincide
    // dentro de la tolerancia se usa la medida nominal, para que la TrimBox
    // sea exactamente el formato pedido, y el contenido se centra en ella.
    let (bw, bh) = if fits { (ew, eh) } else { (in_w, in_h) };
    let (cx, cy) = ((bw - in_w) / 2.0, (bh - in_h) / 2.0);
    if !fits {
        let (bw, bh) = (in_w, in_h);
        rep.warn(format!(
            "hoja {pno}: el navegador ha dado {:.1} x {:.1} mm y se esperaban {:.1} x {:.1} mm; se usa la que viene",
            bw / MM,
            bh / MM,
            ew / MM,
            eh / MM
        ));
    }
    let resources = inherited(doc, pid, b"Resources");
    let rotate = inherited(doc, pid, b"Rotate");

    // contenido original, en CMYK si se pide
    let mut bytes = doc.get_page_content(pid).map_err(|x| format!("hoja {pno}: {x}"))?;
    if opts.cmyk {
        let res = resources.as_ref().map(|r| deref(doc, r)).and_then(|r| r.as_dict().ok());
        match convert_content(doc, &bytes, res, rep) {
            Ok(Some(nb)) => bytes = nb,
            Ok(None) => {}
            Err(x) => rep.warn(format!("hoja {pno}: {x}")),
        }
    }
    let open = qq_balance(&bytes);
    let (dx, dy) = (s - mb[0] + cx, s - mb[1] + cy);
    // recorte a la BleedBox: nada del contenido puede invadir la zona de marcas
    let mut main = format!(
        "q {} {} {} {} re W n 1 0 0 1 {} {} cm\n",
        fmt(s),
        fmt(s),
        fmt(bw),
        fmt(bh),
        fmt(dx),
        fmt(dy)
    )
    .into_bytes();
    main.extend_from_slice(&bytes);
    main.push(b'\n');
    for _ in 0..open {
        main.extend_from_slice(b"Q\n");
    }
    main.extend_from_slice(b"Q\n");

    let sw = bw + 2.0 * s;
    let sh = bh + 2.0 * s;
    let marks = marks_content(sw, sh, s, b, bw, bh, pno, opts, rep);

    let main_id = doc.add_object(flate_stream(Dictionary::new(), &main));
    let marks_id = doc.add_object(flate_stream(Dictionary::new(), marks.as_bytes()));

    // enlaces y demas anotaciones: se desplazan con el contenido
    let annots: Vec<ObjectId> = match doc.get_dictionary(pid).ok().and_then(|d| d.get(b"Annots").ok()) {
        Some(a) => deref(doc, a)
            .as_array()
            .map(|v| v.iter().filter_map(|o| o.as_reference().ok()).collect())
            .unwrap_or_default(),
        None => vec![],
    };
    for aid in annots {
        if let Ok(ad) = doc.get_dictionary_mut(aid) {
            if let Ok(Object::Array(r)) = ad.get(b"Rect") {
                let v: Vec<f64> = r.iter().filter_map(num).collect();
                if v.len() == 4 {
                    ad.set("Rect", box_obj([v[0] + dx, v[1] + dy, v[2] + dx, v[3] + dy]));
                }
            }
            if let Ok(Object::Array(q)) = ad.get(b"QuadPoints") {
                let v: Vec<Object> = q
                    .iter()
                    .enumerate()
                    .map(|(i, o)| real(num(o).unwrap_or(0.0) + if i % 2 == 0 { dx } else { dy }))
                    .collect();
                ad.set("QuadPoints", v);
            }
        }
    }

    let page = doc.get_dictionary_mut(pid).map_err(e)?;
    let media = [0.0, 0.0, sw, sh];
    page.set("MediaBox", box_obj(media));
    page.set("CropBox", box_obj(media));
    page.set("BleedBox", box_obj([s, s, s + bw, s + bh]));
    page.set("TrimBox", box_obj([s + b, s + b, s + bw - b, s + bh - b]));
    page.remove(b"ArtBox");
    page.remove(b"StructParents");
    page.set("Contents", vec![Object::Reference(main_id), Object::Reference(marks_id)]);
    if let Some(r) = resources {
        page.set("Resources", r);
    } else {
        page.set("Resources", Dictionary::new());
    }
    if let Some(r) = rotate {
        page.set("Rotate", r);
    }
    Ok(())
}

fn fmt(v: f64) -> String {
    let s = format!("{:.3}", v);
    let s = s.trim_end_matches('0').trim_end_matches('.');
    if s.is_empty() || s == "-0" {
        "0".into()
    } else {
        s.into()
    }
}

/// Stream de marcas: corte, registro y tira de color. Sin texto.
#[allow(clippy::too_many_arguments)]
fn marks_content(
    sw: f64,
    sh: f64,
    s: f64,
    b: f64,
    bw: f64,
    bh: f64,
    pno: usize,
    opts: &PressOpts,
    rep: &mut PressReport,
) -> String {
    let mut c = String::from("q\n0.25 w 0 J 0 j []0 d\n");
    let (stroke, fill) = if opts.cmyk { ("1 1 1 1 K", "1 1 1 1 k") } else { ("0 G", "0 g") };
    c.push_str(stroke);
    c.push('\n');
    c.push_str(fill);
    c.push('\n');
    let gap = MM;
    let line = |c: &mut String, x0: f64, y0: f64, x1: f64, y1: f64| {
        c.push_str(&format!("{} {} m {} {} l S\n", fmt(x0), fmt(y0), fmt(x1), fmt(y1)));
    };
    let (xl, xr) = (s + b, s + bw - b);
    let (yb, yt) = (s + b, s + bh - b);

    if opts.crop_marks {
        if s - gap > gap + 0.5 * MM {
            for y in [yb, yt] {
                line(&mut c, s - gap, y, gap, y);
                line(&mut c, s + bw + gap, y, sw - gap, y);
            }
            for x in [xl, xr] {
                line(&mut c, x, s - gap, x, gap);
                line(&mut c, x, s + bh + gap, x, sh - gap);
            }
        } else if pno == 1 {
            rep.warn("no caben las marcas de corte: hace falta una zona de marcas de 3 mm o mas".into());
        }
    }

    let reg_r = 1.5 * MM;
    let reg_half = 2.0 * MM;
    let reg_ok = opts.registration && s >= 2.0 * reg_half + 0.5 * MM;
    if opts.registration && !reg_ok && pno == 1 {
        rep.warn("no caben las dianas de registro: hace falta una zona de marcas de 4,5 mm o mas".into());
    }
    if reg_ok {
        for (cx, cy) in [(sw / 2.0, s / 2.0), (sw / 2.0, sh - s / 2.0), (s / 2.0, sh / 2.0), (sw - s / 2.0, sh / 2.0)] {
            circle(&mut c, cx, cy, reg_r);
            line(&mut c, cx - reg_half, cy, cx + reg_half, cy);
            line(&mut c, cx, cy - reg_half, cx, cy + reg_half);
        }
    }

    if opts.color_bar {
        let p = 5.0 * MM;
        let len = 9.0 * p;
        let mut placed = None;
        if s >= 7.0 * MM - 0.01 {
            let center_lo = if reg_ok { sw / 2.0 - reg_half - 2.0 * MM } else { f64::INFINITY };
            let center_hi = if reg_ok { sw / 2.0 + reg_half + 2.0 * MM } else { f64::NEG_INFINITY };
            let lo = xl + 6.0 * MM;
            let hi = xr - 6.0 * MM;
            if lo + len <= hi.min(center_lo) {
                placed = Some(lo);
            } else if center_hi.max(lo) + len <= hi {
                placed = Some(center_hi.max(lo));
            }
        }
        match placed {
            Some(x0) => {
                let y0 = (s - p) / 2.0;
                let patches: [[f64; 4]; 9] = [
                    [1.0, 0.0, 0.0, 0.0],
                    [0.0, 1.0, 0.0, 0.0],
                    [0.0, 0.0, 1.0, 0.0],
                    [0.0, 0.0, 0.0, 1.0],
                    [0.5, 0.0, 0.0, 0.0],
                    [0.0, 0.5, 0.0, 0.0],
                    [0.0, 0.0, 0.5, 0.0],
                    [0.0, 0.0, 0.0, 0.5],
                    [0.0, 0.0, 0.0, 0.25],
                ];
                for (i, k) in patches.iter().enumerate() {
                    c.push_str(&format!(
                        "{} {} {} {} k {} {} {} {} re f\n",
                        fmt(k[0]),
                        fmt(k[1]),
                        fmt(k[2]),
                        fmt(k[3]),
                        fmt(x0 + i as f64 * p),
                        fmt(y0),
                        fmt(p),
                        fmt(p)
                    ));
                }
            }
            None if pno == 1 => {
                rep.warn("no cabe la tira de color: hace falta una zona de marcas de 7 mm o mas".into())
            }
            None => {}
        }
    }
    c.push_str("Q\n");
    c
}

fn circle(c: &mut String, cx: f64, cy: f64, r: f64) {
    let k = 0.552_284_75 * r;
    c.push_str(&format!("{} {} m\n", fmt(cx + r), fmt(cy)));
    let segs = [
        (cx + r, cy + k, cx + k, cy + r, cx, cy + r),
        (cx - k, cy + r, cx - r, cy + k, cx - r, cy),
        (cx - r, cy - k, cx - k, cy - r, cx, cy - r),
        (cx + k, cy - r, cx + r, cy - k, cx + r, cy),
    ];
    for (a, b, cc, d, e2, f) in segs {
        c.push_str(&format!(
            "{} {} {} {} {} {} c\n",
            fmt(a),
            fmt(b),
            fmt(cc),
            fmt(d),
            fmt(e2),
            fmt(f)
        ));
    }
    c.push_str("S\n");
}

/* ----------------------------------------------------------- fuentes -- */

fn has_font_file(doc: &Document, font: &Dictionary) -> bool {
    font.get(b"FontDescriptor")
        .ok()
        .map(|o| deref(doc, o))
        .and_then(|o| o.as_dict().ok())
        .map(|fd| fd.has(b"FontFile") || fd.has(b"FontFile2") || fd.has(b"FontFile3"))
        .unwrap_or(false)
}

fn audit_fonts(doc: &Document, rep: &mut PressReport) {
    for o in doc.objects.values() {
        let Ok(d) = o.as_dict() else { continue };
        if !d.has_type(b"Font") {
            continue;
        }
        let sub = subtype(d);
        if sub == b"CIDFontType0" || sub == b"CIDFontType2" {
            continue; // descendiente de una Type0: se cuenta con ella
        }
        rep.fonts_total += 1;
        let embedded = match sub {
            b"Type3" => true,
            b"Type0" => d
                .get(b"DescendantFonts")
                .ok()
                .map(|o| deref(doc, o))
                .and_then(|o| o.as_array().ok())
                .and_then(|a| a.first())
                .map(|o| deref(doc, o))
                .and_then(|o| o.as_dict().ok())
                .map(|df| has_font_file(doc, df))
                .unwrap_or(false),
            _ => has_font_file(doc, d),
        };
        if embedded {
            rep.fonts_embedded += 1;
        } else {
            let name = d
                .get(b"BaseFont")
                .ok()
                .and_then(name_of)
                .map(|n| {
                    let n = String::from_utf8_lossy(n).into_owned();
                    match n.split_once('+') {
                        Some((tag, rest)) if tag.len() == 6 => rest.to_string(),
                        _ => n,
                    }
                })
                .unwrap_or_else(|| "(sin nombre)".into());
            if !rep.fonts_missing.contains(&name) {
                rep.fonts_missing.push(name);
            }
        }
    }
    if !rep.fonts_missing.is_empty() {
        rep.warn(format!("fuentes sin incrustar: {}", rep.fonts_missing.join(", ")));
    }
}

/* ------------------------------------------------------------- union -- */

/// Une varios PDF en uno, en orden, con un solo arbol /Pages.
pub fn merge(docs: Vec<Document>) -> Result<Document, String> {
    let mut max_id = 1;
    let mut page_ids: Vec<ObjectId> = Vec::new();
    let mut objects: BTreeMap<ObjectId, Object> = BTreeMap::new();
    for mut d in docs {
        d.renumber_objects_with(max_id);
        max_id = d.max_id + 1;
        page_ids.extend(d.get_pages().into_values());
        objects.extend(d.objects);
    }
    if page_ids.is_empty() {
        return Err("no hay paginas que unir".into());
    }
    let mut out = Document::with_version("1.6");
    for (id, o) in objects {
        match o.type_name().unwrap_or(b"") {
            b"Catalog" | b"Pages" | b"ObjStm" | b"XRef" | b"Outlines" | b"StructTreeRoot" => {}
            _ => {
                out.objects.insert(id, o);
            }
        }
    }
    let pages_id = (max_id, 0);
    let catalog_id = (max_id + 1, 0);
    out.max_id = max_id + 1;
    for pid in &page_ids {
        if let Some(Object::Dictionary(d)) = out.objects.get_mut(pid) {
            d.set("Parent", pages_id);
            d.remove(b"StructParents");
        }
    }
    out.objects.insert(
        pages_id,
        Object::Dictionary(dictionary! {
            "Type" => "Pages",
            "Kids" => page_ids.iter().map(|id| Object::Reference(*id)).collect::<Vec<_>>(),
            "Count" => page_ids.len() as i64,
        }),
    );
    out.objects.insert(
        catalog_id,
        Object::Dictionary(dictionary! {
            "Type" => "Catalog",
            "Pages" => pages_id,
        }),
    );
    out.trailer.set("Root", catalog_id);
    out.prune_objects();
    out.renumber_objects();
    Ok(out)
}

/* ------------------------------------------------------------ varios -- */

fn pdf_text(s: &str) -> Object {
    if s.is_ascii() {
        Object::string_literal(s)
    } else {
        let mut v = vec![0xFE, 0xFF];
        for u in s.encode_utf16() {
            v.extend_from_slice(&u.to_be_bytes());
        }
        Object::String(v, StringFormat::Hexadecimal)
    }
}

/// Fecha PDF (UTC) de ahora: D:AAAAMMDDhhmmssZ
fn pdf_date() -> String {
    let secs = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0);
    let days = secs.div_euclid(86400);
    let rem = secs.rem_euclid(86400);
    // civil_from_days (H. Hinnant)
    let z = days + 719_468;
    let era = z.div_euclid(146_097);
    let doe = z - era * 146_097;
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146_096) / 365;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if mp < 10 { mp + 3 } else { mp - 9 };
    let y = yoe + era * 400 + i64::from(m <= 2);
    format!(
        "D:{y:04}{m:02}{d:02}{:02}{:02}{:02}Z",
        rem / 3600,
        rem % 3600 / 60,
        rem % 60
    )
}

/* ----------------------------------------------------------- pruebas -- */

#[cfg(test)]
mod tests {
    use super::*;
    use lopdf::content::Operation;

    fn opts(cmyk: bool) -> PressOpts {
        PressOpts {
            trim_w: 100.0,
            trim_h: 150.0,
            bleed: 3.0,
            slug: 10.0,
            crop_marks: true,
            registration: true,
            color_bar: true,
            cmyk,
            title: "Prueba ñ".into(),
        }
    }

    /// Una pagina de prueba con todo lo que hay que convertir.
    fn sample_doc(o: &PressOpts, marker: &str) -> Document {
        let mut doc = Document::with_version("1.4");
        let pages_id = doc.new_object_id();
        let font_id = doc.add_object(dictionary! {
            "Type" => "Font", "Subtype" => "Type1", "BaseFont" => "Helvetica",
        });
        let form = Stream::new(
            dictionary! {
                "Type" => "XObject", "Subtype" => "Form",
                "BBox" => vec![0.into(), 0.into(), 50.into(), 50.into()],
                "Group" => dictionary! { "Type" => "Group", "S" => "Transparency", "CS" => "DeviceRGB" },
            },
            b"1 0 0 RG 0 0 m 50 50 l S".to_vec(),
        );
        let form_id = doc.add_object(form);
        // imagen 2x2 RGB con predictor PNG (Sub)
        let raw: Vec<u8> = vec![
            1, 255, 0, 0, 1, 255, 0, // fila 1: rojo, verde (diferencias)
            1, 0, 0, 255, 255, 255, 255, // fila 2: azul, blanco
        ];
        let img = Stream::new(
            dictionary! {
                "Type" => "XObject", "Subtype" => "Image", "Width" => 2, "Height" => 2,
                "ColorSpace" => "DeviceRGB", "BitsPerComponent" => 8, "Filter" => "FlateDecode",
                "DecodeParms" => dictionary! { "Predictor" => 15, "Colors" => 3, "Columns" => 2, "BitsPerComponent" => 8 },
            },
            deflate(&raw),
        );
        let img_id = doc.add_object(img);
        let func_id = doc.add_object(dictionary! {
            "FunctionType" => 2, "Domain" => vec![0.into(), 1.into()],
            "C0" => vec![1.into(), 0.into(), 0.into()], "C1" => vec![0.into(), 0.into(), 1.into()], "N" => 1,
        });
        let sh_id = doc.add_object(dictionary! {
            "ShadingType" => 2, "ColorSpace" => "DeviceRGB",
            "Coords" => vec![0.into(), 0.into(), 100.into(), 0.into()],
            "Function" => func_id, "Extend" => vec![true.into(), true.into()],
        });
        let resources_id = doc.add_object(dictionary! {
            "Font" => dictionary! { "F1" => font_id },
            "XObject" => dictionary! { "Fm1" => form_id, "Im1" => img_id },
            "Shading" => dictionary! { "Sh1" => sh_id },
        });
        let content = format!(
            "0.2 0.4 0.6 rg 0 0 100 100 re f BT /F1 12 Tf 0 0 0 rg 10 10 Td ({marker}) Tj ET \
             q /Fm1 Do Q q 20 0 0 20 0 0 cm /Im1 Do Q q /Sh1 sh Q"
        );
        let content_id = doc.add_object(Stream::new(dictionary! {}, content.into_bytes()));
        let w = (o.trim_w + 2.0 * o.bleed) * MM;
        let h = (o.trim_h + 2.0 * o.bleed) * MM;
        let page_id = doc.add_object(dictionary! {
            "Type" => "Page", "Parent" => pages_id, "Contents" => content_id,
            "Group" => dictionary! { "Type" => "Group", "S" => "Transparency", "CS" => "DeviceRGB" },
        });
        doc.objects.insert(
            pages_id,
            Object::Dictionary(dictionary! {
                "Type" => "Pages", "Kids" => vec![page_id.into()], "Count" => 1,
                "Resources" => resources_id,
                "MediaBox" => vec![0.into(), 0.into(), Object::Real(w as f32), Object::Real(h as f32)],
            }),
        );
        let catalog_id = doc.add_object(dictionary! { "Type" => "Catalog", "Pages" => pages_id });
        doc.trailer.set("Root", catalog_id);
        doc
    }

    fn all_ops(doc: &Document) -> Vec<Operation> {
        let mut ops = vec![];
        for o in doc.objects.values() {
            if let Ok(s) = o.as_stream() {
                let d = &s.dict;
                let is_content = subtype(d) == b"Form" || (!d.has(b"Subtype") && !d.has(b"FunctionType"));
                if is_content {
                    if let Ok(b) = stream_bytes(doc, s) {
                        if let Ok(c) = Content::decode(&b) {
                            ops.extend(c.operations);
                        }
                    }
                }
            }
        }
        ops
    }

    fn mentions_rgb(o: &Object) -> bool {
        match o {
            Object::Name(n) => n == b"DeviceRGB",
            Object::Array(a) => a.iter().any(mentions_rgb),
            Object::Dictionary(d) => d.iter().any(|(_, v)| mentions_rgb(v)),
            Object::Stream(s) => d_mentions(&s.dict),
            _ => false,
        }
    }
    fn d_mentions(d: &Dictionary) -> bool {
        d.iter().any(|(_, v)| mentions_rgb(v))
    }

    fn page_box(doc: &Document, pid: ObjectId, key: &[u8]) -> [f64; 4] {
        rect(doc, doc.get_dictionary(pid).unwrap().get(key).unwrap()).unwrap()
    }

    fn near(a: [f64; 4], b: [f64; 4]) -> bool {
        a.iter().zip(b.iter()).all(|(x, y)| (x - y).abs() < 0.01)
    }

    #[test]
    fn formula_cmyk() {
        assert_eq!(rgb_to_cmyk(0.0, 0.0, 0.0), [0.0, 0.0, 0.0, 1.0]);
        assert_eq!(rgb_to_cmyk(1.0, 1.0, 1.0), [0.0, 0.0, 0.0, 0.0]);
        assert_eq!(rgb_to_cmyk(0.5, 0.51, 0.5), [0.0, 0.0, 0.0, 0.4967]);
        let c = rgb_to_cmyk(0.2, 0.4, 0.6);
        assert_eq!(c, [0.6667, 0.3333, 0.0, 0.4]);
        let c = rgb_to_cmyk(1.0, 0.0, 0.0);
        assert_eq!(c, [0.0, 1.0, 1.0, 0.0]);
        for (r, g, b) in [(0.0, 0.0, 0.05), (0.01, 0.0, 0.03), (0.2, 0.0, 0.0)] {
            let c = rgb_to_cmyk(r, g, b);
            assert!(c.iter().sum::<f64>() <= 3.0001, "{c:?}");
        }
    }

    #[test]
    fn postproceso_cmyk_cajas_y_marcas() {
        let o = opts(true);
        let mut doc = sample_doc(&o, "Hola");
        let mut rep = PressReport::new(&o);
        postprocess(&mut doc, &o, &mut rep).unwrap();
        let mut out = merge(vec![doc]).unwrap();
        finish(&mut out, &o, &mut rep);
        let mut bytes = Vec::new();
        out.save_to(&mut bytes).unwrap();
        let doc = Document::load_mem(&bytes).unwrap();
        assert_eq!(doc.version, "1.6");

        // ningun rg/RG ni DeviceRGB
        let ops = all_ops(&doc);
        assert!(!ops.is_empty());
        assert!(!ops.iter().any(|op| op.operator == "rg" || op.operator == "RG"));
        for o in doc.objects.values() {
            assert!(!mentions_rgb(o), "queda DeviceRGB en {o:?}");
        }
        // negro a una sola tinta
        let black = ops.iter().any(|op| {
            op.operator == "k" && op.operands.iter().filter_map(num).collect::<Vec<_>>() == vec![0.0, 0.0, 0.0, 1.0]
        });
        assert!(black, "el negro no es 0 0 0 1 k");
        // 0.2 0.4 0.6
        assert!(ops.iter().any(|op| {
            op.operator == "k"
                && op.operands.iter().filter_map(num).map(|v| (v * 1000.0).round() / 1000.0).collect::<Vec<_>>()
                    == vec![0.667, 0.333, 0.0, 0.4]
        }));
        assert!(ops.iter().any(|op| op.operator == "K"));
        // marcas en registro
        assert!(ops.iter().any(|op| op.operator == "K"
            && op.operands.iter().filter_map(num).collect::<Vec<_>>() == vec![1.0, 1.0, 1.0, 1.0]));

        // imagen en CMYK: rojo, verde, azul, blanco
        let img = doc
            .objects
            .values()
            .filter_map(|o| o.as_stream().ok())
            .find(|s| subtype(&s.dict) == b"Image")
            .unwrap();
        assert_eq!(img.dict.get(b"ColorSpace").unwrap().as_name().unwrap(), b"DeviceCMYK");
        assert!(!img.dict.has(b"DecodeParms"));
        let px = stream_bytes(&doc, img).unwrap();
        assert_eq!(px, vec![0, 255, 255, 0, 255, 0, 255, 0, 255, 255, 0, 0, 0, 0, 0, 0]);

        // sombreado
        let sh = doc
            .objects
            .values()
            .filter_map(|o| o.as_dict().ok())
            .find(|d| d.has(b"ShadingType"))
            .unwrap();
        assert_eq!(sh.get(b"ColorSpace").unwrap().as_name().unwrap(), b"DeviceCMYK");
        let f = deref(&doc, sh.get(b"Function").unwrap()).as_dict().unwrap();
        assert_eq!(f.get(b"C0").unwrap().as_array().unwrap().len(), 4);

        // cajas
        let s = 10.0 * MM;
        let b = 3.0 * MM;
        let (w, h) = (100.0 * MM, 150.0 * MM);
        let pid = *doc.get_pages().get(&1).unwrap();
        assert!(near(page_box(&doc, pid, b"MediaBox"), [0.0, 0.0, w + 2.0 * b + 2.0 * s, h + 2.0 * b + 2.0 * s]));
        assert!(near(page_box(&doc, pid, b"CropBox"), [0.0, 0.0, w + 2.0 * b + 2.0 * s, h + 2.0 * b + 2.0 * s]));
        assert!(near(page_box(&doc, pid, b"BleedBox"), [s, s, s + w + 2.0 * b, s + h + 2.0 * b]));
        assert!(near(page_box(&doc, pid, b"TrimBox"), [s + b, s + b, s + b + w, s + b + h]));
        assert!(doc.get_dictionary(pid).unwrap().has(b"Resources"));

        // informe
        assert_eq!(rep.pages, 1);
        assert_eq!(rep.colors_converted, 3);
        assert_eq!(rep.images_total, 1);
        assert_eq!(rep.images_cmyk, 1);
        assert_eq!(rep.images_left_rgb, 0);
        assert_eq!(rep.shadings_converted, 1);
        assert_eq!(rep.shadings_left, 0);
        assert_eq!(rep.fonts_total, 1);
        assert_eq!(rep.fonts_embedded, 0);
        assert_eq!(rep.fonts_missing, vec!["Helvetica".to_string()]);
        assert!(rep.warnings.iter().all(|w| !w.contains("hoja")), "{:?}", rep.warnings);

        let info = deref(&doc, doc.trailer.get(b"Info").unwrap()).as_dict().unwrap();
        assert_eq!(info.get(b"Trapped").unwrap().as_name().unwrap(), b"False");
        assert_eq!(info.get(b"Creator").unwrap().as_str().unwrap(), b"weBlogger");
    }

    #[test]
    fn sin_cmyk_las_marcas_van_en_negro() {
        let o = opts(false);
        let mut doc = sample_doc(&o, "Hola");
        let mut rep = PressReport::new(&o);
        postprocess(&mut doc, &o, &mut rep).unwrap();
        let ops = all_ops(&doc);
        assert!(ops.iter().any(|op| op.operator == "rg"));
        assert!(ops.iter().any(|op| op.operator == "G"));
        assert_eq!(rep.colors_converted, 0);
    }

    #[test]
    fn aviso_si_la_hoja_no_coincide() {
        let o = opts(true);
        let mut doc = sample_doc(&o, "x");
        let mut rep = PressReport::new(&o);
        let o2 = PressOpts { trim_w: 120.0, ..o.clone() };
        postprocess(&mut doc, &o2, &mut rep).unwrap();
        assert!(rep.warnings.iter().any(|w| w.contains("hoja 1")));
    }

    #[test]
    fn funcion_postscript() {
        // la funcion deja 1 0 0 (rojo): tras la conversion debe dar 0 1 1 0
        let code = format!("{{ pop 1 0 0 {} }}", PS_RGB_TO_CMYK);
        // evaluador minimo para comprobar la secuencia
        let mut st: Vec<f64> = vec![0.5];
        let spaced = code.replace('{', " { ").replace('}', " } ");
        let toks: Vec<&str> = spaced.split_whitespace().collect();
        fn run(t: &[&str], st: &mut Vec<f64>) {
            let mut i = 0;
            while i < t.len() {
                let tok = t[i];
                if tok == "{" {
                    // bloque: buscar su cierre
                    let mut depth = 0;
                    let mut j = i;
                    loop {
                        if t[j] == "{" {
                            depth += 1;
                        }
                        if t[j] == "}" {
                            depth -= 1;
                            if depth == 0 {
                                break;
                            }
                        }
                        j += 1;
                    }
                    let body = &t[i + 1..j];
                    // siguiente: otro bloque (ifelse) o "if"
                    if t.get(j + 1) == Some(&"if") {
                        let c = st.pop().unwrap();
                        if c != 0.0 {
                            run(body, st);
                        }
                        i = j + 2;
                    } else if t.get(j + 1) == Some(&"{") {
                        let mut k = j + 1;
                        let mut depth = 0;
                        loop {
                            if t[k] == "{" {
                                depth += 1;
                            }
                            if t[k] == "}" {
                                depth -= 1;
                                if depth == 0 {
                                    break;
                                }
                            }
                            k += 1;
                        }
                        let body2 = &t[j + 2..k];
                        assert_eq!(t[k + 1], "ifelse");
                        let c = st.pop().unwrap();
                        if c != 0.0 {
                            run(body, st);
                        } else {
                            run(body2, st);
                        }
                        i = k + 2;
                    } else {
                        run(body, st);
                        i = j + 1;
                    }
                    continue;
                }
                match tok {
                    "}" => {}
                    "pop" => {
                        st.pop();
                    }
                    "dup" => {
                        let v = *st.last().unwrap();
                        st.push(v)
                    }
                    "exch" => {
                        let n = st.len();
                        st.swap(n - 1, n - 2)
                    }
                    "copy" => {
                        let n = st.pop().unwrap() as usize;
                        let l = st.len();
                        let v: Vec<f64> = st[l - n..].to_vec();
                        st.extend(v)
                    }
                    "index" => {
                        let n = st.pop().unwrap() as usize;
                        let v = st[st.len() - 1 - n];
                        st.push(v)
                    }
                    "roll" => {
                        let j = st.pop().unwrap() as i64;
                        let n = st.pop().unwrap() as usize;
                        let l = st.len();
                        let s = &mut st[l - n..];
                        let j = j.rem_euclid(n as i64) as usize;
                        s.rotate_right(j);
                    }
                    "sub" | "div" | "lt" | "gt" => {
                        let b = st.pop().unwrap();
                        let a = st.pop().unwrap();
                        st.push(match tok {
                            "sub" => a - b,
                            "div" => a / b,
                            "lt" => (a < b) as i32 as f64,
                            _ => (a > b) as i32 as f64,
                        })
                    }
                    n => st.push(n.parse().unwrap()),
                }
                i += 1;
            }
        }
        run(&toks, &mut st);
        assert_eq!(st, vec![0.0, 1.0, 1.0, 0.0]);
        let mut st = vec![0.2, 0.4, 0.6];
        let spaced2 = PS_RGB_TO_CMYK.replace('{', " { ").replace('}', " } ");
        let toks2: Vec<&str> = spaced2.split_whitespace().collect();
        run(&toks2, &mut st);
        let want = rgb_to_cmyk(0.2, 0.4, 0.6);
        for (a, b) in st.iter().zip(want.iter()) {
            assert!((a - b).abs() < 0.001, "{st:?}");
        }
    }

    #[test]
    fn union_de_dos_documentos() {
        let o = opts(true);
        let mut rep = PressReport::new(&o);
        let mut a = sample_doc(&o, "PRIMERA");
        let mut b = sample_doc(&o, "SEGUNDA");
        postprocess(&mut a, &o, &mut rep).unwrap();
        postprocess(&mut b, &o, &mut rep).unwrap();
        let mut out = merge(vec![a, b]).unwrap();
        finish(&mut out, &o, &mut rep);
        let file = std::env::temp_dir().join(format!("weblogger-union-{}.pdf", std::process::id()));
        out.save(&file).unwrap();
        let doc = Document::load(&file).unwrap();
        let pages = doc.get_pages();
        assert_eq!(pages.len(), 2);
        let first = String::from_utf8_lossy(&doc.get_page_content(pages[&1]).unwrap()).into_owned();
        let second = String::from_utf8_lossy(&doc.get_page_content(pages[&2]).unwrap()).into_owned();
        assert!(first.contains("PRIMERA") && !first.contains("SEGUNDA"));
        assert!(second.contains("SEGUNDA"));
        assert_eq!(doc.catalog().unwrap().get(b"Pages").unwrap().as_reference().unwrap(), {
            let p = doc.get_dictionary(pages[&1]).unwrap();
            p.get(b"Parent").unwrap().as_reference().unwrap()
        });
        assert_eq!(rep.pages, 2);
        assert_eq!(rep.fonts_total, 2);
        println!("PDF de union: {}", file.display());
    }

    /// Extremo a extremo con el navegador del equipo.
    #[test]
    #[ignore]
    fn extremo_a_extremo_con_navegador() {
        use base64::Engine;
        // JPEG pequeno con un degradado de colores
        let (w, h) = (64u16, 48u16);
        let mut px = Vec::with_capacity(w as usize * h as usize * 3);
        for y in 0..h {
            for x in 0..w {
                px.extend_from_slice(&[(x * 4) as u8, (y * 5) as u8, 160]);
            }
        }
        let mut jpg = Vec::new();
        jpeg_encoder::Encoder::new(&mut jpg, 90)
            .encode(&px, w, h, jpeg_encoder::ColorType::Rgb)
            .unwrap();
        let b64 = base64::engine::general_purpose::STANDARD.encode(&jpg);
        let html = format!(
            r#"<!doctype html><html><head><meta charset="utf-8"><style>
@page {{ size: 286mm 436mm; margin: 0; }}
html,body {{ margin:0; padding:0; }}
body {{ width:286mm; height:436mm; background:#f3e9d2; font-family: "Segoe UI", Arial, sans-serif; color:#000; }}
.grad {{ position:absolute; left:3mm; top:3mm; width:280mm; height:80mm; background: linear-gradient(90deg, #c0392b, #2c7fb8); }}
h1 {{ position:absolute; top:100mm; left:20mm; font-size:40pt; margin:0; }}
p {{ position:absolute; top:130mm; left:20mm; font-family: Georgia, serif; font-size:12pt; color:#333; }}
img {{ position:absolute; top:160mm; left:20mm; width:120mm; }}
.sombra {{ position:absolute; top:160mm; left:160mm; width:80mm; height:60mm; background:rgba(20,120,60,.6); }}
</style></head><body><div class="grad"></div><h1>Diario de prueba</h1>
<p>Texto negro y gris con acentos: camión, pingüino, año.</p>
<img src="data:image/jpeg;base64,{b64}"><div class="sombra"></div></body></html>"#
        );
        let o = PressOpts {
            trim_w: 280.0,
            trim_h: 430.0,
            bleed: 3.0,
            slug: 12.0,
            crop_marks: true,
            registration: true,
            color_bar: true,
            cmyk: true,
            title: "Prueba de imprenta".into(),
        };
        let out = std::env::temp_dir().join("weblogger-imprenta-prueba.pdf");
        let out_s = out.to_string_lossy().into_owned();
        let rep = press(&[html.clone(), html], &out_s, &o).unwrap();
        println!("informe: {rep:#?}");
        println!("PDF de imprenta: {}", out.display());

        assert_eq!(rep.pages, 2);
        assert!(rep.fonts_total >= 2);
        assert_eq!(rep.fonts_embedded, rep.fonts_total, "{:?}", rep.fonts_missing);
        assert!(rep.images_total >= 2);
        assert_eq!(rep.images_left_rgb, 0, "{:?}", rep.warnings);
        assert!(rep.images_cmyk >= 2);
        assert!(rep.colors_converted > 0);
        assert!(rep.shadings_converted >= 1, "{:?}", rep.warnings);
        assert_eq!(rep.shadings_left, 0, "{:?}", rep.warnings);
        assert!(!rep.warnings.iter().any(|w| w.contains("hoja")), "{:?}", rep.warnings);

        let doc = Document::load(&out).unwrap();
        assert_eq!(doc.version, "1.6");
        let (s, b) = (12.0 * MM, 3.0 * MM);
        let (tw, th) = (280.0 * MM, 430.0 * MM);
        for pid in doc.get_pages().values() {
            let tb = page_box(&doc, *pid, b"TrimBox");
            let mb = page_box(&doc, *pid, b"MediaBox");
            assert!((tb[2] - tb[0] - tw).abs() < 1.0 && (tb[3] - tb[1] - th).abs() < 1.0, "{tb:?}");
            assert!((mb[2] - tw - 2.0 * b - 2.0 * s).abs() < 1.0, "{mb:?}");
            assert!((tb[0] - s - b).abs() < 0.01);
        }
        let ops = all_ops(&doc);
        assert!(!ops.iter().any(|op| op.operator == "rg" || op.operator == "RG"));
        for o in doc.objects.values() {
            assert!(!mentions_rgb(o), "queda DeviceRGB en {:?}", o.type_name());
        }
    }

    /* ---- auditoria de jefe de produccion ---- */

    fn crc32(data: &[u8]) -> u32 {
        let mut c = 0xFFFF_FFFFu32;
        for &b in data {
            c ^= b as u32;
            for _ in 0..8 {
                c = if c & 1 != 0 { 0xEDB8_8320 ^ (c >> 1) } else { c >> 1 };
            }
        }
        !c
    }

    /// PNG RGBA minimo (circulo rojo translucido sobre fondo transparente).
    fn png_rgba(w: u32, h: u32) -> Vec<u8> {
        let mut raw = Vec::new();
        for y in 0..h {
            raw.push(0);
            for x in 0..w {
                let (dx, dy) = (x as f64 - w as f64 / 2.0, y as f64 - h as f64 / 2.0);
                let inside = (dx * dx + dy * dy).sqrt() < w as f64 / 2.5;
                raw.extend_from_slice(&[200, 30, (x * 4) as u8, if inside { 180 } else { 0 }]);
            }
        }
        let mut png = b"\x89PNG\r\n\x1a\n".to_vec();
        let chunk = |png: &mut Vec<u8>, t: &[u8], d: &[u8]| {
            png.extend_from_slice(&(d.len() as u32).to_be_bytes());
            let mut td = t.to_vec();
            td.extend_from_slice(d);
            png.extend_from_slice(&td);
            png.extend_from_slice(&crc32(&td).to_be_bytes());
        };
        let mut ihdr = Vec::new();
        ihdr.extend_from_slice(&w.to_be_bytes());
        ihdr.extend_from_slice(&h.to_be_bytes());
        ihdr.extend_from_slice(&[8, 6, 0, 0, 0]);
        chunk(&mut png, b"IHDR", &ihdr);
        chunk(&mut png, b"IDAT", &deflate(&raw));
        chunk(&mut png, b"IEND", &[]);
        png
    }

    /// Cualquier espacio RGB (DeviceRGB, CalRGB o ICCBased N 3) en un objeto.
    fn rgb_space_in(doc: &Document, o: &Object, depth: u32) -> bool {
        if depth > 6 {
            return false;
        }
        match o {
            Object::Name(n) => n == b"DeviceRGB" || n == b"CalRGB",
            Object::Array(a) => {
                (a.len() > 1 && name_of(&a[0]) == Some(b"ICCBased") && icc_n(doc, &a[1]) == Some(3))
                    || a.iter().any(|v| rgb_space_in(doc, v, depth + 1))
            }
            Object::Dictionary(d) => d.iter().any(|(_, v)| rgb_space_in(doc, v, depth + 1)),
            Object::Stream(s) => s.dict.iter().any(|(_, v)| rgb_space_in(doc, v, depth + 1)),
            _ => false,
        }
    }

    #[test]
    #[ignore]
    fn auditoria_imprenta_con_navegador() {
        use base64::Engine;
        let enc = |b: &[u8]| base64::engine::general_purpose::STANDARD.encode(b);
        let (w, h) = (64u16, 48u16);
        let mut px = Vec::new();
        for y in 0..h {
            for x in 0..w {
                px.extend_from_slice(&[(x * 4) as u8, (y * 5) as u8, 160]);
            }
        }
        let mut jpg = Vec::new();
        jpeg_encoder::Encoder::new(&mut jpg, 90).encode(&px, w, h, jpeg_encoder::ColorType::Rgb).unwrap();
        let png = png_rgba(40, 40);
        let page = |n: u32| {
            format!(
                r#"<!doctype html><html><head><meta charset="utf-8"><style>
@page {{ size: 286mm 436mm; margin: 0; }}
html,body {{ margin:0; padding:0; }}
body {{ width:286mm; height:436mm; background:#fdf6e3; font-family:"Segoe UI",sans-serif; color:#000; position:relative; }}
.g {{ position:absolute; left:0; top:0; width:286mm; height:60mm; background:linear-gradient(135deg,#e74c3c,#8e44ad 50%,#3498db); }}
.r {{ position:absolute; left:20mm; top:220mm; width:100mm; height:40mm; background:radial-gradient(circle,#f1c40f,#16a085); }}
h1 {{ position:absolute; top:70mm; left:20mm; font-size:44pt; margin:0; color:#000; }}
h2 {{ position:absolute; top:95mm; left:20mm; font-size:24pt; margin:0; color:#c0392b; font-family:Georgia,serif; }}
.caja {{ position:absolute; top:120mm; left:20mm; width:120mm; height:50mm; background:#2ecc71; border:2mm solid #2c3e50;
        box-shadow: 4mm 4mm 6mm rgba(0,0,0,.45); border-radius:4mm; color:#fff; padding:3mm; }}
.trans {{ position:absolute; top:120mm; left:160mm; width:80mm; height:50mm; background:rgba(52,152,219,.5); opacity:.8; }}
.ts {{ position:absolute; top:180mm; left:160mm; font-size:30pt; color:#e67e22; text-shadow:1mm 1mm 1mm #555; }}
img.j {{ position:absolute; top:280mm; left:20mm; width:100mm; }}
img.p {{ position:absolute; top:280mm; left:150mm; width:60mm; }}
</style></head><body><div class="g"></div><div class="r"></div>
<h1>Diario {n} negro puro</h1><h2>Titular en color</h2>
<div class="caja">Texto blanco en caja con borde y sombra</div><div class="trans"></div>
<div class="ts">Sombra de texto</div>
<img class="j" src="data:image/jpeg;base64,{}"><img class="p" src="data:image/png;base64,{}">
<a href="https://example.com" style="position:absolute;top:400mm;left:20mm">enlace</a>
</body></html>"#,
                enc(&jpg),
                enc(&png)
            )
        };
        let o = PressOpts {
            trim_w: 280.0,
            trim_h: 430.0,
            bleed: 3.0,
            slug: 12.0,
            crop_marks: true,
            registration: true,
            color_bar: true,
            cmyk: true,
            title: "Auditoría de imprenta".into(),
        };
        let out = std::env::temp_dir().join("weblogger-imprenta-auditoria.pdf");
        let rep = press(&[page(1), page(2), page(3)], &out.to_string_lossy(), &o).unwrap();
        println!("informe: {rep:#?}");
        println!("PDF de auditoria: {}", out.display());
        let tmp_left = std::fs::read_dir(std::env::temp_dir())
            .unwrap()
            .filter_map(|e| e.ok())
            .any(|e| e.file_name().to_string_lossy().starts_with(&format!("weblogger-imprenta-{}-", std::process::id())));
        assert!(!tmp_left, "quedan temporales");
        assert!(rep.warnings.is_empty(), "{:?}", rep.warnings);
        assert_eq!(rep.images_cmyk + rep.images_left_rgb, rep.images_total);
        assert_eq!(rep.images_left_rgb, 0);
        assert_eq!(rep.shadings_left, 0);
        assert_eq!(rep.fonts_embedded, rep.fonts_total, "{:?}", rep.fonts_missing);
        assert!(rep.fonts_total >= 2);

        let doc = Document::load(&out).expect("el PDF final se vuelve a leer");
        assert_eq!(doc.get_pages().len(), 3);

        // 1. ningun RG de tres componentes ni espacio RGB en ningun stream
        let mut bad = Vec::new();
        for (id, o) in &doc.objects {
            if rgb_space_in(&doc, o, 0) {
                bad.push(format!("{id:?}: espacio RGB en {:?}", o.type_name().ok().map(String::from_utf8_lossy)));
            }
            let Ok(s) = o.as_stream() else { continue };
            assert!(!filters(s).iter().any(|f| f != b"FlateDecode" && f != b"DCTDecode"), "{id:?}");
            if subtype(&s.dict) == b"Image" || s.dict.has(b"FunctionType") || s.dict.has(b"Length1") {
                continue;
            }
            let Ok(b) = stream_bytes(&doc, s) else { continue };
            let Ok(c) = Content::decode(&b) else { continue };
            for op in &c.operations {
                let nums = op.operands.iter().filter(|v| num(v).is_some()).count();
                match op.operator.as_str() {
                    "rg" | "RG" => bad.push(format!("{id:?}: {} {:?}", op.operator, op.operands)),
                    "sc" | "scn" | "SC" | "SCN" if nums == 3 => {
                        bad.push(format!("{id:?}: {} {:?}", op.operator, op.operands))
                    }
                    "BI" | "ID" => bad.push(format!("{id:?}: imagen en linea")),
                    _ => {}
                }
            }
        }
        assert!(bad.is_empty(), "queda RGB:\n{}", bad.join("\n"));

        let (s, b) = (12.0 * MM, 3.0 * MM);
        let (tw, th) = (280.0 * MM, 430.0 * MM);
        let (sw, sh) = (tw + 2.0 * b + 2.0 * s, th + 2.0 * b + 2.0 * s);
        for (pn, pid) in doc.get_pages() {
            let pd = doc.get_dictionary(pid).unwrap();
            let tb = page_box(&doc, pid, b"TrimBox");
            assert!(near(tb, [s + b, s + b, s + b + tw, s + b + th]), "{tb:?}");
            assert!(near(page_box(&doc, pid, b"MediaBox"), [0.0, 0.0, sw, sh]));
            assert!(near(page_box(&doc, pid, b"BleedBox"), [s, s, sw - s, sh - s]));

            // 2. negro del texto a una tinta
            let content = Content::decode(&doc.get_page_content(pid).unwrap()).unwrap();
            let mut fill: Vec<f64> = vec![];
            let mut text_fills: Vec<Vec<f64>> = vec![];
            for op in &content.operations {
                match op.operator.as_str() {
                    "k" => fill = op.operands.iter().filter_map(num).collect(),
                    "Tj" | "TJ" | "'" | "\"" => text_fills.push(fill.clone()),
                    _ => {}
                }
            }
            assert!(text_fills.contains(&vec![0.0, 0.0, 0.0, 1.0]), "pagina {pn}: {text_fills:?}");
            for f in &text_fills {
                if f.len() == 4 && f[3] > 0.95 {
                    assert!(f[..3].iter().all(|v| *v == 0.0), "negro en cuatricomia: {f:?}");
                }
            }

            // 3. marcas: coordenadas exactas y nada dentro de la TrimBox
            let contents = pd.get(b"Contents").unwrap().as_array().unwrap();
            let marks_id = contents.last().unwrap().as_reference().unwrap();
            let ms = doc.get_object(marks_id).unwrap().as_stream().unwrap();
            let mc = Content::decode(&stream_bytes(&doc, ms).unwrap()).unwrap();
            let mut lines = vec![];
            let mut cur = (0.0, 0.0);
            for op in &mc.operations {
                let v: Vec<f64> = op.operands.iter().filter_map(num).collect();
                let pts: Vec<(f64, f64)> = match op.operator.as_str() {
                    "m" | "l" | "c" => v.chunks(2).map(|p| (p[0], p[1])).collect(),
                    "re" => vec![(v[0], v[1]), (v[0] + v[2], v[1] + v[3])],
                    _ => vec![],
                };
                for (x, y) in &pts {
                    let inside = *x > tb[0] + 0.01 && *x < tb[2] - 0.01 && *y > tb[1] + 0.01 && *y < tb[3] - 0.01;
                    assert!(!inside, "marca dentro del formato: {} {:?}", op.operator, v);
                    assert!(*x >= -0.01 && *x <= sw + 0.01 && *y >= -0.01 && *y <= sh + 0.01);
                }
                if op.operator == "re" {
                    // la tira de color no puede invadir el sangrado
                    assert!(v[1] + v[3] <= s + 0.01, "tira dentro del sangrado: {v:?}");
                }
                match op.operator.as_str() {
                    "m" => cur = (v[0], v[1]),
                    "l" => {
                        lines.push([cur.0, cur.1, v[0], v[1]]);
                        cur = (v[0], v[1]);
                    }
                    _ => {}
                }
            }
            let g = MM;
            let (xl, xr, yb, yt) = (s + b, s + b + tw, s + b, s + b + th);
            let want = [
                [s - g, yb, g, yb],
                [sw - s + g, yb, sw - g, yb],
                [s - g, yt, g, yt],
                [sw - s + g, yt, sw - g, yt],
                [xl, s - g, xl, g],
                [xl, sh - s + g, xl, sh - g],
                [xr, s - g, xr, g],
                [xr, sh - s + g, xr, sh - g],
            ];
            for wl in want {
                assert!(
                    lines.iter().any(|l| l.iter().zip(wl.iter()).all(|(a, b)| (a - b).abs() < 0.01)),
                    "falta la marca de corte {wl:?}"
                );
            }
            // ninguna marca toca el sangrado
            for l in &lines {
                let in_bleed = |x: f64, y: f64| x > s + 0.01 && x < sw - s - 0.01 && y > s + 0.01 && y < sh - s - 0.01;
                assert!(!in_bleed(l[0], l[1]) && !in_bleed(l[2], l[3]), "marca en el sangrado {l:?}");
            }

            // 4. recursos de cada pagina: todo lo que se usa existe
            let res = deref(&doc, pd.get(b"Resources").unwrap()).as_dict().unwrap();
            let names = |k: &[u8]| -> Vec<Vec<u8>> {
                res.get(k)
                    .ok()
                    .map(|o| deref(&doc, o))
                    .and_then(|o| o.as_dict().ok())
                    .map(|d| {
                        d.iter()
                            .map(|(n, v)| {
                                if let Object::Reference(r) = v {
                                    assert!(doc.get_object(*r).is_ok(), "pagina {pn}: recurso {r:?} perdido");
                                }
                                n.clone()
                            })
                            .collect()
                    })
                    .unwrap_or_default()
            };
            let (fonts, xobjs) = (names(b"Font"), names(b"XObject"));
            for op in &content.operations {
                match op.operator.as_str() {
                    "Tf" => {
                        let n = op.operands[0].as_name().unwrap();
                        assert!(fonts.iter().any(|f| f == n), "pagina {pn}: falta la fuente");
                    }
                    "Do" => {
                        let n = op.operands[0].as_name().unwrap();
                        assert!(xobjs.iter().any(|f| f == n), "pagina {pn}: falta el XObject");
                    }
                    _ => {}
                }
            }
        }
    }
}
