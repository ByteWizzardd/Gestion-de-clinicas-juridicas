-- Política de retención + cuántos eventos de cada clase ya cumplieron su plazo.
-- No borra nada: es la vista previa de la pestaña de Mantenimiento y lo que
-- revisa el chequeo que dispara la notificación.
-- Ver database/migrations/20260921_120000_purga_manual_auditoria.sql
SELECT
    clase,
    etiqueta,
    descripcion,
    meses_retencion,
    meses_minimo,
    to_char(fecha_corte, 'YYYY-MM-DD') AS fecha_corte,
    eventos_purgables,
    eventos_totales,
    to_char(evento_mas_viejo, 'YYYY-MM-DD') AS evento_mas_viejo,
    to_char(evento_mas_nuevo, 'YYYY-MM-DD') AS evento_mas_nuevo
FROM auditoria_retencion_resumen();
