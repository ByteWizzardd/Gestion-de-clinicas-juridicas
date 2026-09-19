//! Shell de escritorio para Gestion de Clinicas Juridicas.
//!
//! La aplicacion NO contiene logica de negocio: es una ventana nativa que carga
//! el despliegue de Vercel. Toda la autenticacion, el acceso a Neon y el manejo
//! de archivos siguen ocurriendo en el servidor, por lo que ningun secreto
//! (DATABASE_URL, JWT_SECRET, SMTP_PASS, BLOB_READ_WRITE_TOKEN) viaja al equipo
//! del usuario.

use std::net::{TcpStream, ToSocketAddrs};
use std::path::PathBuf;
use std::time::Duration;

use tauri::webview::DownloadEvent;
use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_opener::OpenerExt;

/// Despliegue de produccion. Cambiar aqui para apuntar a otro entorno.
const APP_URL: &str = "https://clinicajuridica.vercel.app";
const APP_HOST: &str = "clinicajuridica.vercel.app";

/// En un webview `window.open` no abre nada util: no hay barra de pestanas.
/// Lo convertimos en una navegacion normal para que `on_navigation` decida si
/// corresponde abrirla en el navegador del sistema (ver DocumentsTab.tsx, que
/// abre los soportes con window.open hacia el host del blob).
const INIT_SCRIPT: &str = r#"
(function () {
  window.open = function (url) {
    if (url) { window.location.assign(String(url)); }
    return null;
  };
})();
"#;

/// Comprueba si el despliegue es alcanzable antes de cargarlo.
///
/// Sin esto, un equipo sin internet muestra la pagina de error cruda de
/// WebView2, que no dice nada util al usuario final.
fn backend_reachable() -> bool {
    let addrs = match (APP_HOST, 443u16).to_socket_addrs() {
        Ok(addrs) => addrs,
        Err(_) => return false,
    };

    for addr in addrs {
        if TcpStream::connect_timeout(&addr, Duration::from_secs(4)).is_ok() {
            return true;
        }
    }

    false
}

/// Evita sobrescribir un archivo ya descargado anadiendo " (n)" al nombre.
fn unique_path(path: PathBuf) -> PathBuf {
    if !path.exists() {
        return path;
    }

    let dir = path.parent().map(PathBuf::from).unwrap_or_default();
    let stem = path
        .file_stem()
        .map(|s| s.to_string_lossy().into_owned())
        .unwrap_or_else(|| "descarga".to_string());
    let ext = path.extension().map(|s| s.to_string_lossy().into_owned());

    for n in 1..1000 {
        let name = match &ext {
            Some(ext) => format!("{stem} ({n}).{ext}"),
            None => format!("{stem} ({n})"),
        };
        let candidate = dir.join(name);
        if !candidate.exists() {
            return candidate;
        }
    }

    path
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Una sola instancia: reenfoca la ventana existente en vez de abrir otra.
            #[cfg(desktop)]
            app.handle()
                .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.unminimize();
                        let _ = window.set_focus();
                    }
                }))?;

            let start_url = if backend_reachable() {
                WebviewUrl::External(APP_URL.parse().expect("APP_URL no es una URL valida"))
            } else {
                WebviewUrl::App("index.html".into())
            };

            let nav_handle = app.handle().clone();
            let download_handle = app.handle().clone();

            WebviewWindowBuilder::new(app, "main", start_url)
                .title("Clinica Juridica - UCAB")
                .inner_size(1440.0, 900.0)
                .min_inner_size(1024.0, 700.0)
                .center()
                .initialization_script(INIT_SCRIPT)
                // Todo lo que no sea la app se abre en el navegador del sistema.
                // Asi los soportes de Vercel Blob no secuestran la ventana.
                .on_navigation(move |url| {
                    let scheme = url.scheme();
                    if matches!(scheme, "tauri" | "blob" | "data" | "about") {
                        return true;
                    }

                    let is_internal = match url.host_str() {
                        // "tauri.localhost" es el host de la pagina de respaldo local.
                        Some(host) => host == APP_HOST || host.ends_with("localhost"),
                        None => true,
                    };

                    if is_internal {
                        return true;
                    }

                    let _ = nav_handle.opener().open_url(url.to_string(), None::<&str>);
                    false
                })
                // Un webview no tiene barra de descargas: sin esto el usuario
                // exporta un Excel o un Word y no ve ninguna senal de que paso.
                // Guardamos el archivo y abrimos el explorador sobre el.
                .on_download(move |webview, event| {
                    match event {
                        DownloadEvent::Requested { destination, .. } => {
                            if destination.as_os_str().is_empty() {
                                if let Ok(dir) = webview.path().download_dir() {
                                    *destination = dir.join("descarga");
                                }
                            }
                            *destination = unique_path(destination.clone());
                        }
                        DownloadEvent::Finished { path, success, .. } => {
                            if success {
                                if let Some(path) = path {
                                    let _ = download_handle.opener().reveal_item_in_dir(path);
                                }
                            }
                        }
                        _ => {}
                    }
                    true
                })
                .build()?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error al iniciar la aplicacion");
}
