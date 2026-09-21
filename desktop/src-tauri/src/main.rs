// Evita que se abra una consola adicional en Windows en modo release.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    clinica_juridica_desktop_lib::run()
}
