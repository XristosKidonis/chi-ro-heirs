use std::fs;
use tauri::path::BaseDirectory;
use tauri::Manager;

/// Copia la base bíblica incluida en la app a la carpeta donde el plugin SQL abre sus bases.
/// Solo copia la primera vez o cuando cambia la versión de la app (datos nuevos).
fn instalar_biblias(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let origen = app.path().resolve("biblias.db", BaseDirectory::Resource)?;
    let carpeta = app.path().app_config_dir()?;
    fs::create_dir_all(&carpeta)?;
    let destino = carpeta.join("biblias.db");
    let marca = carpeta.join("biblias.version");
    let version = app.package_info().version.to_string();
    let instalada = fs::read_to_string(&marca).unwrap_or_default();
    if !destino.exists() || instalada.trim() != version {
        fs::copy(&origen, &destino)?;
        fs::write(&marca, &version)?;
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            instalar_biblias(app)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error al iniciar Chi-Ro Heirs");
}
