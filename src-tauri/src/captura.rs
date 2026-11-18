//! Descarga de paginas para «Capturar estilo de pagina».
//!
//! El frontend pide el HTML de un enlace y despues sus hojas CSS y sus
//! scripts para analizarlos. Aqui solo se descarga: con limite de tamaño y de
//! tiempo, solo http/https, siguiendo redirecciones, y sin enviar nada del
//! usuario (ni cookies ni datos: un agente generico).

use serde::Serialize;
use std::io::Read;
use std::time::Duration;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Fetched {
    /// direccion final, despues de las redirecciones
    pub url: String,
    pub status: u16,
    pub content_type: String,
    pub text: String,
    pub bytes: usize,
    pub truncated: bool,
}

const AGENT: &str = "Mozilla/5.0 (compatible; weBlogger/1.2; +analisis de estilo)";

/// Descarga un enlace como texto. `max_kb` limita lo que se lee (4 MB por defecto, 16 MB como mucho).
#[tauri::command]
pub async fn fetch_url(url: String, max_kb: Option<u64>) -> Result<Fetched, String> {
    let max = max_kb.unwrap_or(4096).clamp(16, 16384) * 1024;
    tauri::async_runtime::spawn_blocking(move || get(&url, max))
        .await
        .map_err(|e| e.to_string())?
}

fn get(url: &str, max: u64) -> Result<Fetched, String> {
    let low = url.trim().to_ascii_lowercase();
    if !(low.starts_with("http://") || low.starts_with("https://")) {
        return Err("solo se pueden analizar enlaces http:// o https://".into());
    }
    let agent = ureq::AgentBuilder::new()
        .timeout_connect(Duration::from_secs(10))
        .timeout(Duration::from_secs(30))
        .redirects(8)
        .user_agent(AGENT)
        .build();
    let resp = match agent
        .get(url.trim())
        .set("Accept", "text/html,application/xhtml+xml,text/css,*/*;q=0.8")
        .set("Accept-Language", "es,en;q=0.8")
        .call()
    {
        Ok(r) => r,
        // 404, 403...: se devuelve igual, con su codigo, para que se pueda explicar
        Err(ureq::Error::Status(_, r)) => r,
        Err(e) => return Err(format!("no se pudo descargar {url}: {e}")),
    };
    let final_url = resp.get_url().to_string();
    let status = resp.status();
    let content_type = resp.content_type().to_string();
    let charset = resp.charset().to_ascii_lowercase();
    let mut buf = Vec::new();
    resp.into_reader()
        .take(max + 1)
        .read_to_end(&mut buf)
        .map_err(|e| format!("error al leer {url}: {e}"))?;
    let truncated = buf.len() as u64 > max;
    if truncated {
        buf.truncate(max as usize);
    }
    let bytes = buf.len();
    let text = decode(&buf, &charset);
    Ok(Fetched { url: final_url, status, content_type, text, bytes, truncated })
}

/// UTF-8 por defecto; Latin-1 / Windows-1252 si la cabecera lo dice.
fn decode(buf: &[u8], charset: &str) -> String {
    if charset.contains("8859") || charset.contains("1252") || charset == "latin1" {
        buf.iter().map(|&b| b as char).collect()
    } else {
        String::from_utf8_lossy(buf).into_owned()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rechaza_esquemas_raros() {
        assert!(get("file:///c:/windows/win.ini", 1024).is_err());
        assert!(get("javascript:alert(1)", 1024).is_err());
    }

    #[test]
    fn latin1() {
        assert_eq!(decode(&[0x61, 0xf1, 0x6f], "iso-8859-1"), "año");
        assert_eq!(decode("año".as_bytes(), "utf-8"), "año");
    }
}
