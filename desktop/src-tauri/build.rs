fn main() {
    // Cargo no reconstruye cuando cambia una variable de entorno salvo que se
    // lo pidan: sin esto, rotar CLINICA_DESKTOP_TOKEN dejaria el binario viejo.
    println!("cargo:rerun-if-env-changed=CLINICA_DESKTOP_TOKEN");
    tauri_build::build()
}
