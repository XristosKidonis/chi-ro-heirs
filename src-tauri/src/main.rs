// Evita una ventana de consola extra en Windows en las versiones de lanzamiento.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    chi_ro_heirs_lib::run()
}
