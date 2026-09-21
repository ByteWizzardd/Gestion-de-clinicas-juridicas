# Clínica Jurídica — App de escritorio

Ventana nativa (Tauri v2) que carga el despliegue de Vercel:
`https://clinicajuridica.vercel.app`

## Por qué así

La app **no** empaqueta un servidor Node ni copia de la base de datos. Toda la
lógica de servidor (Server Actions, Neon, Vercel Blob, SMTP) sigue corriendo en
Vercel. Consecuencias:

- Ningún secreto (`DATABASE_URL`, `JWT_SECRET`, `SMTP_PASS`,
  `BLOB_READ_WRITE_TOKEN`) llega al equipo del usuario.
- Actualizar la app = hacer deploy. No hay que redistribuir el instalador.
- El instalador pesa ~5 MB en vez de ~250 MB.
- Requiere internet, igual que la versión web (la BD ya está en la nube).

La página remota **no tiene acceso IPC**: `capabilities/default.json` no declara
ningún dominio en `remote`, así que el sitio no puede invocar comandos nativos.

## Requisitos para compilar

1. **Rust** — https://rustup.rs
   ```
   winget install Rustlang.Rustup
   ```
2. **Visual Studio Build Tools** con el workload "Desktop development with C++"
   ```
   winget install --id Microsoft.VisualStudio.2022.BuildTools --override "--wait --passive --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"
   ```
3. **WebView2** — ya viene con Windows 10/11.

Cierra y reabre la terminal después de instalar Rust para que `cargo` entre al PATH.

## Uso

```
npm install
npm run dev      # ventana de desarrollo
npm run build    # instalador en src-tauri/target/release/bundle/nsis/
npm run icon     # regenera los iconos desde app-icon.png
```

## Qué resuelve el shell

Un webview no es un navegador; estas cosas hubo que cablearlas a mano en
`src-tauri/src/lib.rs`:

| Problema | Solución |
|---|---|
| Sin barra de descargas: exportar un Excel/Word no daba ninguna señal | `on_download` guarda el archivo y abre el Explorador sobre él |
| `window.open` en `DocumentsTab.tsx` abría una ventana huérfana sin controles | Script de init lo convierte en navegación; `on_navigation` la manda al navegador del sistema |
| Enlaces externos secuestraban la ventana de la app | `on_navigation` solo permite el host de la app |
| Sin internet se veía el error crudo de WebView2 | Chequeo de conectividad al arrancar → `dist/index.html` |
| Abrir el .exe dos veces creaba dos ventanas | `tauri-plugin-single-instance` reenfoca la existente |

## Cambiar de entorno

El dominio está en dos sitios que deben coincidir:

- `src-tauri/src/lib.rs` → `APP_URL` y `APP_HOST`
- `dist/index.html` → `APP_URL`
