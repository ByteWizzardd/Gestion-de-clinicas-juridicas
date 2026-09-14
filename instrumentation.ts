/**
 * Se ejecuta una vez al arrancar el servidor de Next.js, antes de atender
 * peticiones.
 *
 * Zona horaria del proceso = la de la clínica. La BD guarda fechas y horas de
 * pared de Caracas (auditoria_eventos.fecha_evento, columnas DATE) y `pg`
 * convierte DATE/TIMESTAMP a Date usando la zona del proceso: en un servidor
 * en UTC (Docker, Vercel) una cita del 13/09 llegaba al navegador como el 12/09
 * a las 8 p. m. Node aplica el cambio de process.env.TZ en caliente.
 */
export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    process.env.TZ = 'America/Caracas';
  }
}
