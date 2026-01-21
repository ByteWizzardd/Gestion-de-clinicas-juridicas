-- 1. Determinar el límite de tiempo (Fecha de inicio de hace 2 semestres)
WITH fecha_corte AS (
    SELECT fecha_inicio as limite
    FROM semestres
    WHERE fecha_inicio <= CURRENT_DATE
    ORDER BY fecha_inicio DESC
    OFFSET 2 LIMIT 1
),
-- 2. Consolidar todas las fechas de actividad de todas las tablas en una sola lista
fechas_actividad AS (
    SELECT id_caso, fecha_inicio_caso as fecha FROM casos
    UNION ALL SELECT id_caso, fecha FROM cambio_estatus
    UNION ALL SELECT id_caso, fecha_encuentro FROM citas
    UNION ALL SELECT id_caso, fecha_registro FROM acciones
    UNION ALL SELECT id_caso, fecha_consignacion FROM soportes
    UNION ALL SELECT id_caso, fecha_actualizacion::date FROM auditoria_actualizacion_casos
    UNION ALL SELECT id_caso, fecha_registro FROM atienden
    UNION ALL SELECT id_caso, fecha_ejecucion FROM ejecutan
    UNION ALL SELECT id_caso, fecha_registro::date FROM auditoria_insercion_beneficiarios
    UNION ALL SELECT id_caso, fecha_actualizacion::date FROM auditoria_actualizacion_beneficiarios
),
-- 3. Obtener la fecha más reciente por cada caso
ultima_actividad AS (
    SELECT id_caso, MAX(fecha) as fecha_maxima
    FROM fechas_actividad
    GROUP BY id_caso
)
-- 4. Seleccionar los casos que no han tenido actividad desde la fecha de corte
SELECT 
    vc.*, 
    ua.fecha_maxima as fecha_ultima_actividad,
    (EXTRACT(YEAR FROM age(CURRENT_DATE, ua.fecha_maxima)) * 12 + 
     EXTRACT(MONTH FROM age(CURRENT_DATE, ua.fecha_maxima))) as meses_inactividad
FROM view_casos_detalle vc
JOIN ultima_actividad ua ON vc.id_caso = ua.id_caso
CROSS JOIN fecha_corte fc
WHERE vc.estatus != 'Archivado' 
  AND vc.fecha_fin_caso IS NULL
  AND ua.fecha_maxima < fc.limite
ORDER BY ua.fecha_maxima ASC;