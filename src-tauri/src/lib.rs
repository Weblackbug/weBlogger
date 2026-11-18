// weBlogger - backend.
//
// El frontend (dist/) es el editor; aqui solo vive lo que un navegador no puede
// hacer: leer y escribir las carpetas de los articulos, Setup.cfg, el selector
// de carpetas del sistema y el control de la ventana.

mod imprenta;
mod captura;

use std::fs;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::UNIX_EPOCH;

use base64::Engine;
use serde::Serialize;
use tauri::{Emitter, Manager, State, WindowEvent};

const EV_CLOSE: &str = "wb-close";

fn err<E: std::fmt::Display>(e: E) -> String {
    e.to_string()
}

struct AppState {
    /// Hay cambios sin guardar: al cerrar la ventana se pregunta antes.
    dirty: AtomicBool,
}

/* ------------------------------------------------------------ Setup.cfg -- */

/// Donde vive Setup.cfg:
///   1. variable de entorno `WEBLOGGER_CONFIG` (para pruebas),
///   2. en desarrollo (el exe esta bajo `target/`), la raiz del proyecto,
///   3. junto al ejecutable si ya existe alli (modo portable),
///   4. instalado, en la carpeta de datos del usuario (%APPDATA%/weBlogger).
fn cfg_path() -> PathBuf {
    if let Ok(p) = std::env::var("WEBLOGGER_CONFIG") {
        if !p.trim().is_empty() {
            return PathBuf::from(p);
        }
    }
    if let Ok(exe) = std::env::current_exe() {
        let in_target = exe.components().any(|c| c.as_os_str() == "target");
        if in_target {
            let root = Path::new(env!("CARGO_MANIFEST_DIR")).join("..");
            if root.is_dir() {
                return root.join("Setup.cfg");
            }
        }
        // Modo portable: si ya hay un Setup.cfg junto al exe, es ese.
        if let Some(dir) = exe.parent() {
            let beside = dir.join("Setup.cfg");
            if beside.is_file() {
                return beside;
            }
        }
    }
    // Instalado (Program Files no se puede escribir): carpeta del usuario.
    match std::env::var("APPDATA") {
        Ok(appdata) if !appdata.trim().is_empty() => {
            PathBuf::from(appdata).join("weBlogger").join("Setup.cfg")
        }
        _ => home_dir().join(".config").join("weBlogger").join("Setup.cfg"),
    }
}

/// Deshace el escapado HTML con el que el editor escribe titulo y descripcion.
fn unescape(s: &str) -> String {
    s.replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&quot;", "\"")
        .replace("&#39;", "'")
        .replace("&amp;", "&")
}

fn home_dir() -> PathBuf {
    std::env::var("USERPROFILE")
        .or_else(|_| std::env::var("HOME"))
        .map(PathBuf::from)
        .unwrap_or_else(|_| PathBuf::from("."))
}

/// Carpeta por defecto de la biblioteca: `Documentos/weBlogger`.
fn default_root() -> PathBuf {
    let home = home_dir();
    let docs = home.join("Documents");
    if docs.is_dir() {
        docs.join("weBlogger")
    } else {
        home.join("weBlogger")
    }
}

#[tauri::command]
fn cfg_read() -> String {
    fs::read_to_string(cfg_path()).unwrap_or_default()
}

#[tauri::command]
fn cfg_write(text: String) -> Result<(), String> {
    let path = cfg_path();
    if let Some(dir) = path.parent() {
        fs::create_dir_all(dir).map_err(err)?;
    }
    fs::write(path, text).map_err(err)
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct EnvInfo {
    version: String,
    cfg_path: String,
    default_root: String,
    os: String,
}

#[tauri::command]
fn env_info(app: tauri::AppHandle) -> EnvInfo {
    EnvInfo {
        version: app.package_info().version.to_string(),
        cfg_path: cfg_path().to_string_lossy().into_owned(),
        default_root: default_root().to_string_lossy().into_owned(),
        os: std::env::consts::OS.to_string(),
    }
}

/* ------------------------------------------------------------ biblioteca -- */

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Article {
    name: String,
    path: String,
    title: String,
    description: String,
    cover: String,
    modified: u64,
    /// "blog" (carpeta con su web) o "periodico" (archivo .weblog)
    kind: String,
}

fn modified_secs(path: &Path) -> u64 {
    fs::metadata(path)
        .and_then(|m| m.modified())
        .ok()
        .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
        .map(|d| d.as_secs())
        .unwrap_or(0)
}

/* ---- archivos .weblog: un ZIP sin comprimir con manifest.json ---- */

fn u16le(b: &[u8], at: usize) -> Option<usize> {
    Some(u16::from_le_bytes([*b.get(at)?, *b.get(at + 1)?]) as usize)
}

fn u32le(b: &[u8], at: usize) -> Option<usize> {
    Some(u32::from_le_bytes([*b.get(at)?, *b.get(at + 1)?, *b.get(at + 2)?, *b.get(at + 3)?]) as usize)
}

/// Contenido de un archivo guardado sin comprimir dentro de un ZIP.
fn zip_entry(bytes: &[u8], want: &str) -> Option<Vec<u8>> {
    if bytes.len() < 22 {
        return None;
    }
    let eocd = (0..=bytes.len() - 22).rev().find(|&i| bytes[i..i + 4] == [0x50, 0x4b, 0x05, 0x06])?;
    let count = u16le(bytes, eocd + 10)?;
    let mut p = u32le(bytes, eocd + 16)?;
    for _ in 0..count {
        if u32le(bytes, p)? != 0x0201_4b50 {
            return None;
        }
        let method = u16le(bytes, p + 10)?;
        let size = u32le(bytes, p + 20)?;
        let (nl, el, cl) = (u16le(bytes, p + 28)?, u16le(bytes, p + 30)?, u16le(bytes, p + 32)?);
        let off = u32le(bytes, p + 42)?;
        let name = std::str::from_utf8(bytes.get(p + 46..p + 46 + nl)?).ok()?;
        if name == want && method == 0 {
            let start = off + 30 + u16le(bytes, off + 26)? + u16le(bytes, off + 28)?;
            return bytes.get(start..start + size).map(|b| b.to_vec());
        }
        p += 46 + nl + el + cl;
    }
    None
}

fn weblog_manifest(path: &Path) -> Option<serde_json::Value> {
    let bytes = fs::read(path).ok()?;
    let data = zip_entry(&bytes, "manifest.json")?;
    serde_json::from_slice(&data).ok()
}

fn weblog_info(path: &Path) -> Option<Article> {
    let man = weblog_manifest(path)?;
    let stem = path.file_stem()?.to_string_lossy().into_owned();
    let pages = man.get("pages").and_then(|p| p.as_array()).map(|a| a.len()).unwrap_or(0);
    let paper = man.get("paperName").and_then(|v| v.as_str()).unwrap_or("");
    Some(Article {
        name: path.file_name()?.to_string_lossy().into_owned(),
        path: path.to_string_lossy().into_owned(),
        title: man.get("title").and_then(|v| v.as_str()).unwrap_or(&stem).to_string(),
        description: format!("Periódico · {paper} · {pages} páginas"),
        cover: String::new(),
        modified: modified_secs(path),
        kind: "periodico".into(),
    })
}

/// Texto entre `open` y `close` (sin distinguir mayusculas en `open`).
fn between<'a>(html: &'a str, lower: &str, open: &str, close: &str) -> Option<&'a str> {
    let start = lower.find(open)? + open.len();
    let end = lower[start..].find(close)? + start;
    html.get(start..end)
}

/// Valor de un atributo dentro de una etiqueta ya recortada.
fn attr(tag: &str, name: &str) -> Option<String> {
    let lower = tag.to_lowercase();
    let key = format!("{name}=\"");
    let start = lower.find(&key)? + key.len();
    let end = tag[start..].find('"')? + start;
    Some(tag[start..end].to_string())
}

fn article_info(dir: &Path) -> Option<Article> {
    let index = dir.join("index.html");
    let html = fs::read_to_string(&index).ok()?;
    let lower = html.to_lowercase();

    let title = between(&html, &lower, "<title>", "</title>")
        .map(|s| s.trim().to_string())
        .unwrap_or_default();

    let mut description = String::new();
    if let Some(pos) = lower.find("name=\"description\"") {
        let from = lower[..pos].rfind('<').unwrap_or(pos);
        if let Some(len) = lower[from..].find('>') {
            description = attr(&html[from..from + len], "content").unwrap_or_default();
        }
    }

    // Primera imagen de la pagina, como portada de la tarjeta.
    let mut cover = String::new();
    if let Some(pos) = lower.find("<img") {
        if let Some(len) = lower[pos..].find('>') {
            cover = attr(&html[pos..pos + len], "src").unwrap_or_default();
        }
    }

    // con varias paginas, el index.html es la lectura seguida y las paginas
    // estan en fuentes/: la fecha buena es la mas reciente de las dos
    let modified = modified_secs(&index).max(modified_secs(&dir.join("fuentes").join("pagina-1.html")));

    Some(Article {
        name: dir.file_name()?.to_string_lossy().into_owned(),
        path: dir.to_string_lossy().into_owned(),
        title: unescape(&title),
        description: unescape(&description),
        cover: unescape(&cover),
        modified,
        kind: "blog".into(),
    })
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct PageInfo {
    number: u32,
    file: String,
    title: String,
    name: String,
    style: String,
}

/// Paginas de una publicacion, en orden: index.html, pagina-2.html...
/// Lee de cada una el titulo, el nombre de pagina y el estilo de prensa.
#[tauri::command]
fn list_pages(folder: String) -> Result<Vec<PageInfo>, String> {
    let dir = PathBuf::from(&folder);
    let mut out = Vec::new();

    // periodico: las paginas estan en el manifiesto del .weblog
    if folder.to_lowercase().ends_with(".weblog") {
        let man = weblog_manifest(&dir).ok_or("no se puede leer el archivo .weblog")?;
        if let Some(pages) = man.get("pages").and_then(|p| p.as_array()) {
            for (i, p) in pages.iter().enumerate() {
                let s = |k: &str| p.get(k).and_then(|v| v.as_str()).unwrap_or("").to_string();
                out.push(PageInfo { number: i as u32 + 1, file: s("html"), title: s("name"), name: s("name"), style: s("style") });
            }
        }
        return Ok(out);
    }

    // blog de varias paginas: las paginas para editar estan en fuentes/
    let sources = dir.join("fuentes").join("pagina-1.html").is_file();
    for n in 1u32..=500 {
        let file = if sources {
            format!("fuentes/pagina-{n}.html")
        } else if n == 1 {
            "index.html".to_string()
        } else {
            format!("pagina-{n}.html")
        };
        let html = match fs::read_to_string(dir.join(&file)) {
            Ok(h) => h,
            Err(_) => break,
        };
        let lower = html.to_lowercase();
        let title = between(&html, &lower, "<title>", "</title>")
            .map(|s| unescape(s.trim()))
            .unwrap_or_default();
        let (mut name, mut style) = (String::new(), String::new());
        if let Some(pos) = lower.find("<html") {
            if let Some(len) = lower[pos..].find('>') {
                let tag = &html[pos..pos + len];
                name = attr(tag, "data-wb-page").map(|s| unescape(&s)).unwrap_or_default();
                style = attr(tag, "data-wb-style").unwrap_or_default();
            }
        }
        out.push(PageInfo { number: n, file, title, name, style });
    }
    Ok(out)
}

/// Articulos de la biblioteca: subcarpetas de `root` que tienen `index.html`.
#[tauri::command]
fn list_articles(root: String) -> Result<Vec<Article>, String> {
    let root = PathBuf::from(root);
    if !root.is_dir() {
        return Ok(Vec::new());
    }
    let mut out: Vec<Article> = fs::read_dir(&root)
        .map_err(err)?
        .filter_map(|e| e.ok())
        .map(|e| e.path())
        .filter_map(|p| {
            if p.is_dir() {
                article_info(&p)
            } else if p.extension().map(|e| e.eq_ignore_ascii_case("weblog")).unwrap_or(false) {
                weblog_info(&p)
            } else {
                None
            }
        })
        .collect();
    out.sort_by(|a, b| b.modified.cmp(&a.modified));
    Ok(out)
}

/* -------------------------------------------------------------- archivos -- */

fn ensure_parent(path: &Path) -> Result<(), String> {
    if let Some(dir) = path.parent() {
        fs::create_dir_all(dir).map_err(err)?;
    }
    Ok(())
}

#[tauri::command]
fn read_text(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("{path}: {e}"))
}

#[tauri::command]
fn write_text(path: String, text: String) -> Result<(), String> {
    let p = PathBuf::from(&path);
    ensure_parent(&p)?;
    fs::write(&p, text).map_err(|e| format!("{path}: {e}"))
}

#[tauri::command]
fn read_b64(path: String) -> Result<String, String> {
    let bytes = fs::read(&path).map_err(|e| format!("{path}: {e}"))?;
    Ok(base64::engine::general_purpose::STANDARD.encode(bytes))
}

#[tauri::command]
fn write_b64(path: String, data: String) -> Result<(), String> {
    let bytes = base64::engine::general_purpose::STANDARD
        .decode(data.as_bytes())
        .map_err(err)?;
    let p = PathBuf::from(&path);
    ensure_parent(&p)?;
    fs::write(&p, bytes).map_err(|e| format!("{path}: {e}"))
}

#[tauri::command]
fn path_exists(path: String) -> bool {
    Path::new(&path).exists()
}

/// Borra la carpeta de un articulo. Solo si de verdad lo es (tiene index.html):
/// asi una ruta equivocada no se lleva por delante otra cosa.
#[tauri::command]
fn remove_article(path: String) -> Result<(), String> {
    let dir = PathBuf::from(&path);
    if dir.is_file() && path.to_lowercase().ends_with(".weblog") {
        return fs::remove_file(&dir).map_err(|e| format!("{path}: {e}"));
    }
    if !dir.join("index.html").is_file() {
        return Err("esa carpeta no es un articulo (no tiene index.html)".into());
    }
    fs::remove_dir_all(&dir).map_err(|e| format!("{path}: {e}"))
}

/// Selector de carpetas del sistema.
#[tauri::command]
async fn pick_folder(start: Option<String>) -> Option<String> {
    let mut dlg = rfd::AsyncFileDialog::new().set_title("weBlogger - elegir carpeta");
    if let Some(s) = start {
        if Path::new(&s).is_dir() {
            dlg = dlg.set_directory(s);
        }
    }
    dlg.pick_folder()
        .await
        .map(|h| h.path().to_string_lossy().into_owned())
}

/// Borra los tres archivos de una pagina que se ha quitado de la publicacion
/// (pagina-N.html, css/pagina-N.css, js/pagina-N.js). Solo esos nombres.
#[tauri::command]
fn remove_page(folder: String, number: u32) -> Result<(), String> {
    if number < 2 {
        return Err("la primera pagina es index.html y no se borra asi".into());
    }
    let dir = PathBuf::from(&folder);
    if !dir.join("index.html").is_file() {
        return Err("esa carpeta no es una publicacion".into());
    }
    for rel in [
        format!("pagina-{number}.html"),
        format!("css/pagina-{number}.css"),
        format!("js/pagina-{number}.js"),
    ] {
        let p = dir.join(rel);
        if p.is_file() {
            fs::remove_file(&p).map_err(err)?;
        }
    }
    Ok(())
}

/// Deja en la carpeta de un blog solo los archivos de las paginas que existen:
/// fuentes/pagina-N.* por encima de `keep_sources` y pagina-N.* (N >= 2) de la
/// raiz por encima de `keep_root`. Sin fuentes, borra la carpeta si queda vacia.
#[tauri::command]
fn clean_pages(folder: String, keep_sources: u32, keep_root: u32) -> Result<(), String> {
    let dir = PathBuf::from(&folder);
    if !dir.join("index.html").is_file() {
        return Err("esa carpeta no es una publicacion".into());
    }
    for n in 1u32..=500 {
        let mut rels = Vec::new();
        if n > keep_sources {
            rels.extend([format!("fuentes/pagina-{n}.html"), format!("fuentes/pagina-{n}.css"), format!("fuentes/pagina-{n}.js")]);
        }
        if n >= 2 && n > keep_root {
            rels.extend([format!("pagina-{n}.html"), format!("css/pagina-{n}.css"), format!("js/pagina-{n}.js")]);
        }
        for rel in rels {
            let p = dir.join(rel);
            if p.is_file() {
                fs::remove_file(&p).map_err(err)?;
            }
        }
    }
    if keep_sources == 0 {
        let _ = fs::remove_dir(dir.join("fuentes")); // solo si ha quedado vacia
    }
    Ok(())
}

/// Archivo .weblog con el que se ha abierto la aplicacion (doble clic en el
/// explorador), si lo hay.
#[tauri::command]
fn startup_file() -> Option<String> {
    std::env::args()
        .skip(1)
        .find(|a| a.to_lowercase().ends_with(".weblog") && Path::new(a).is_file())
}

/// Dialogo «guardar como» del sistema, para las exportaciones.
#[tauri::command]
async fn pick_save(name: String, ext: String, start: Option<String>) -> Option<String> {
    let mut dlg = rfd::AsyncFileDialog::new()
        .set_title("weBlogger - exportar")
        .set_file_name(name)
        .add_filter(ext.to_uppercase(), &[ext.as_str()]);
    if let Some(s) = start {
        if Path::new(&s).is_dir() {
            dlg = dlg.set_directory(s);
        }
    }
    dlg.save_file()
        .await
        .map(|h| h.path().to_string_lossy().into_owned())
}

/// Navegador con motor Chromium instalado en el equipo: Edge viene con
/// Windows 10 y 11, asi que casi siempre existe.
fn find_browser() -> Option<PathBuf> {
    let mut roots: Vec<PathBuf> = Vec::new();
    for var in ["ProgramFiles(x86)", "ProgramFiles", "LOCALAPPDATA"] {
        if let Ok(v) = std::env::var(var) {
            roots.push(PathBuf::from(v));
        }
    }
    let rels = [
        "Microsoft/Edge/Application/msedge.exe",
        "Google/Chrome/Application/chrome.exe",
        "BraveSoftware/Brave-Browser/Application/brave.exe",
    ];
    for rel in rels {
        for root in &roots {
            let p = root.join(rel);
            if p.is_file() {
                return Some(p);
            }
        }
    }
    for p in [
        "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/usr/bin/microsoft-edge",
        "/usr/bin/google-chrome",
        "/usr/bin/chromium",
    ] {
        if Path::new(p).is_file() {
            return Some(PathBuf::from(p));
        }
    }
    None
}

/// Imprime un archivo HTML a PDF con el navegador del equipo en modo oculto.
/// El tamano de pagina lo fija la regla @page del HTML. Bloquea hasta que el
/// navegador termina.
pub(crate) fn print_html_file(html_path: &Path, pdf_path: &Path) -> Result<(), String> {
    static RUN: std::sync::atomic::AtomicU32 = std::sync::atomic::AtomicU32::new(0);
    let browser = find_browser()
        .ok_or("no se encuentra Microsoft Edge ni Chrome: hacen falta para crear el PDF")?;
    let html = html_path.to_string_lossy().into_owned();
    let url = format!(
        "file:///{}",
        html.replace('\\', "/")
            .trim_start_matches('/')
            .replace('%', "%25")
            .replace(' ', "%20")
            .replace('#', "%23")
    );
    let n = RUN.fetch_add(1, Ordering::Relaxed);
    let profile = std::env::temp_dir().join(format!("weblogger-pdf-{}-{n}", std::process::id()));
    let _ = fs::remove_file(pdf_path);

    let mut cmd = std::process::Command::new(browser);
    cmd.arg("--headless=new")
        .arg("--disable-gpu")
        .arg("--no-pdf-header-footer")
        .arg("--run-all-compositor-stages-before-draw")
        .arg("--virtual-time-budget=9000")
        .arg(format!("--user-data-dir={}", profile.to_string_lossy()))
        .arg(format!("--print-to-pdf={}", pdf_path.to_string_lossy()))
        .arg(url);
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x0800_0000); // sin ventana de consola
    }
    let status = cmd.status().map_err(err);
    let _ = fs::remove_dir_all(&profile);
    let status = status?;
    if pdf_path.is_file() {
        Ok(())
    } else {
        Err(format!("el navegador no ha creado el PDF (salida {status})"))
    }
}

/// Convierte un HTML (como texto) en PDF imprimiendolo con el navegador.
#[tauri::command]
async fn export_pdf(html: String, pdf: String) -> Result<(), String> {
    // el HTML llega como texto: se imprime desde un archivo temporal propio
    let stamp = std::time::SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_nanos())
        .unwrap_or(0);
    let tmp = std::env::temp_dir().join(format!("weblogger-{}-{stamp}.html", std::process::id()));
    fs::write(&tmp, html.as_bytes()).map_err(err)?;
    let tmp_arg = tmp.clone();
    let res = tauri::async_runtime::spawn_blocking(move || print_html_file(&tmp_arg, Path::new(&pdf)))
        .await
        .map_err(err);
    let _ = fs::remove_file(&tmp);
    res?
}

/// PDF de imprenta: cada HTML es una pagina de la publicacion que ya mide el
/// formato final mas el sangrado; se imprime, se pasa a CMYK, se le anaden
/// cajas y marcas y se unen todas en `pdf`.
#[tauri::command]
async fn export_press_pdf(
    pages: Vec<String>,
    pdf: String,
    opts: imprenta::PressOpts,
) -> Result<imprenta::PressReport, String> {
    tauri::async_runtime::spawn_blocking(move || imprenta::press(&pages, &pdf, &opts))
        .await
        .map_err(err)?
}

/// Abre un archivo o una carpeta con lo que el sistema tenga asociado
/// (el navegador para un .html, el explorador para una carpeta).
#[tauri::command]
fn open_external(path: String) -> Result<(), String> {
    if !Path::new(&path).exists() {
        return Err(format!("no existe: {path}"));
    }
    #[cfg(target_os = "windows")]
    let mut cmd = {
        let mut c = std::process::Command::new("explorer");
        c.arg(path.replace('/', "\\"));
        c
    };
    #[cfg(target_os = "macos")]
    let mut cmd = {
        let mut c = std::process::Command::new("open");
        c.arg(&path);
        c
    };
    #[cfg(all(unix, not(target_os = "macos")))]
    let mut cmd = {
        let mut c = std::process::Command::new("xdg-open");
        c.arg(&path);
        c
    };
    cmd.spawn().map(|_| ()).map_err(err)
}

/* --------------------------------------------------------------- ventana -- */

#[tauri::command]
fn set_dirty(value: bool, state: State<AppState>) {
    state.dirty.store(value, Ordering::Relaxed);
}

#[tauri::command]
fn win_fullscreen(window: tauri::WebviewWindow) -> Result<bool, String> {
    let now = window.is_fullscreen().map_err(err)?;
    window.set_fullscreen(!now).map_err(err)?;
    Ok(!now)
}

#[tauri::command]
fn win_toggle_maximize(window: tauri::WebviewWindow) -> Result<(), String> {
    if window.is_maximized().map_err(err)? {
        window.unmaximize().map_err(err)
    } else {
        window.maximize().map_err(err)
    }
}

#[tauri::command]
fn win_minimize(window: tauri::WebviewWindow) -> Result<(), String> {
    window.minimize().map_err(err)
}

#[tauri::command]
fn win_title(title: String, window: tauri::WebviewWindow) -> Result<(), String> {
    window.set_title(&title).map_err(err)
}

#[tauri::command]
fn app_exit(app: tauri::AppHandle, state: State<AppState>) {
    state.dirty.store(false, Ordering::Relaxed);
    app.exit(0);
}

/* ---------------------------------------------------------------- arranque -- */

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState {
            dirty: AtomicBool::new(false),
        })
        .invoke_handler(tauri::generate_handler![
            captura::fetch_url,
            cfg_read,
            cfg_write,
            env_info,
            list_articles,
            list_pages,
            clean_pages,
            startup_file,
            read_text,
            write_text,
            read_b64,
            write_b64,
            path_exists,
            remove_article,
            pick_folder,
            pick_save,
            remove_page,
            export_pdf,
            export_press_pdf,
            open_external,
            set_dirty,
            win_fullscreen,
            win_toggle_maximize,
            win_minimize,
            win_title,
            app_exit
        ])
        .setup(|app| {
            let window = app
                .get_webview_window("main")
                .ok_or("no se encuentra la ventana principal")?;
            let handle = app.handle().clone();
            window.on_window_event(move |event| {
                if let WindowEvent::CloseRequested { api, .. } = event {
                    // Con cambios sin guardar no se cierra: se avisa al
                    // frontend, que pregunta y llama a `app_exit`.
                    let dirty = handle.state::<AppState>().dirty.load(Ordering::Relaxed);
                    if dirty {
                        api.prevent_close();
                        let _ = handle.emit(EV_CLOSE, true);
                    }
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error al arrancar weBlogger");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn lee_titulo_descripcion_y_portada() {
        let dir = std::env::temp_dir().join(format!("weblogger-test-{}", std::process::id()));
        let art = dir.join("mi-articulo");
        fs::create_dir_all(&art).unwrap();
        fs::write(
            art.join("index.html"),
            "<html><head><meta name=\"description\" content=\"Una prueba\" />\
             <TITLE> Pan &amp; &quot;Vino&quot; </TITLE></head><body><img src=\"imagenes/a.jpg\" alt=\"\"></body></html>",
        )
        .unwrap();
        fs::create_dir_all(dir.join("no-es-articulo")).unwrap();

        let list = list_articles(dir.to_string_lossy().into_owned()).unwrap();
        assert_eq!(list.len(), 1);
        assert_eq!(list[0].name, "mi-articulo");
        assert_eq!(list[0].title, "Pan & \"Vino\"");
        assert_eq!(list[0].description, "Una prueba");
        assert_eq!(list[0].cover, "imagenes/a.jpg");

        assert!(remove_article(dir.join("no-es-articulo").to_string_lossy().into_owned()).is_err());
        assert!(remove_article(art.to_string_lossy().into_owned()).is_ok());
        let _ = fs::remove_dir_all(&dir);
    }

    #[test]
    fn base64_ida_y_vuelta() {
        let file = std::env::temp_dir().join(format!("weblogger-b64-{}.bin", std::process::id()));
        let p = file.to_string_lossy().into_owned();
        write_b64(p.clone(), "aG9sYQ==".into()).unwrap();
        assert_eq!(fs::read(&file).unwrap(), b"hola");
        assert_eq!(read_b64(p).unwrap(), "aG9sYQ==");
        let _ = fs::remove_file(&file);
    }

    /// export_pdf (PDF normal, no de imprenta) sigue funcionando tras
    /// llevar el lanzamiento del navegador a print_html_file.
    #[test]
    #[ignore]
    fn export_pdf_sigue_funcionando() {
        let pdf = std::env::temp_dir().join(format!("weblogger-export-{}.pdf", std::process::id()));
        let html = "<!doctype html><html><head><meta charset=\"utf-8\"><style>@page{size:A5;margin:10mm}</style>\
                    </head><body><h1 style=\"color:#c0392b\">Hola, camión</h1></body></html>";
        tauri::async_runtime::block_on(export_pdf(html.into(), pdf.to_string_lossy().into_owned())).unwrap();
        let bytes = fs::read(&pdf).unwrap();
        assert!(bytes.starts_with(b"%PDF-"));
        let doc = lopdf::Document::load_mem(&bytes).unwrap();
        assert_eq!(doc.get_pages().len(), 1);
        let left: Vec<_> = fs::read_dir(std::env::temp_dir())
            .unwrap()
            .filter_map(|e| e.ok())
            .map(|e| e.file_name().to_string_lossy().into_owned())
            .filter(|n| n.starts_with(&format!("weblogger-{}-", std::process::id())) && n.ends_with(".html"))
            .collect();
        assert!(left.is_empty(), "temporales sin borrar: {left:?}");
        let _ = fs::remove_file(&pdf);
    }
}
