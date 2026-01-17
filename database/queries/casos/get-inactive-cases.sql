-- Obtener casos candidatos a archivar por inactividad
-- Un caso es candidato si:
-- 1. No está ya archivado
-- 2. No ha tenido NINGUNA actividad en los últimos 2 semestres (~12 meses)
-- 
-- Actividades consideradas:
-- - Cambios de estatus (cambio_estatus)
-- - Nuevas citas (citas)
-- - Nuevas acciones (acciones)
-- - Subida de soportes (soportes)
-- - Cambios en beneficiarios (beneficiarios) - solo insert si hay algún campo de auditoría
-- - Asignaciones (se_le_asigna, supervisa)
-- - Actualizaciones del caso (auditoria_actualizacion_casos)
--
-- Parámetros:
--   Ninguno (Usa la tabla semestres para determinar el rango de tiempo)

WITH fecha_corte_semestres AS (
    -- Obtenemos la fecha de inicio del penúltimo semestre registrado
    -- Esto define el límite de "hace 2 semestres"
    SELECT fecha_inicio as fecha_limite
    FROM semestres
    ORDER BY fecha_inicio DESC
    OFFSET 1 LIMIT 1
),
ultima_actividad AS (
    SELECT 
        c.id_caso,
        GREATEST(
            -- Última actividad del caso
            COALESCE(
                (SELECT MAX(fecha) FROM cambio_estatus ce WHERE ce.id_caso = c.id_caso),
                c.fecha_inicio_caso
            ),
            COALESCE(
                (SELECT MAX(fecha_encuentro) FROM citas ct WHERE ct.id_caso = c.id_caso),
                c.fecha_inicio_caso
            ),
            COALESCE(
                (SELECT MAX(fecha_registro) FROM acciones a WHERE a.id_caso = c.id_caso),
                c.fecha_inicio_caso
            ),
            COALESCE(
                (SELECT MAX(fecha_consignacion) FROM soportes s WHERE s.id_caso = c.id_caso),
                c.fecha_inicio_caso
            ),
            COALESCE(
                (SELECT MAX(fecha_actualizacion)::date FROM auditoria_actualizacion_casos aac WHERE aac.id_caso = c.id_caso),
                c.fecha_inicio_caso
            )
        ) as fecha_ultima_actividad
    FROM casos c
)
SELECT 
    vc.id_caso,
    vc.fecha_inicio_caso,
    vc.fecha_fin_caso,
    vc.fecha_solicitud,
    vc.tramite,
    vc.estatus,
    vc.cant_beneficiarios,
    vc.observaciones,
    vc.id_nucleo,
    vc.id_materia,
    vc.num_categoria,
    vc.num_subcategoria,
    vc.num_ambito_legal,
    vc.cedula,
    vc.nombres_solicitante,
    vc.apellidos_solicitante,
    vc.nombre_completo_solicitante,
    vc.nombre_nucleo,
    vc.nombre_materia,
    vc.nombre_categoria,
    vc.nombre_subcategoria,
    ua.fecha_ultima_actividad,
    -- Calcular meses de inactividad (diferencia entre hoy y última actividad)
    (EXTRACT(YEAR FROM age(CURRENT_DATE, ua.fecha_ultima_actividad)) * 12 + 
     EXTRACT(MONTH FROM age(CURRENT_DATE, ua.fecha_ultima_actividad))) as meses_inactividad,
    -- Info para depuración
    (SELECT fecha_limite FROM fecha_corte_semestres) as fecha_corte_usada
FROM view_casos_detalle vc
INNER JOIN ultima_actividad ua ON vc.id_caso = ua.id_caso
CROSS JOIN fecha_corte_semestres fcs
WHERE 
    -- Excluir casos ya archivados
    vc.estatus != 'Archivado'
    -- Solo casos que NO tienen fecha de fin (aún abiertos)
    AND vc.fecha_fin_caso IS NULL
    -- La última actividad fue ANTES de la fecha de corte (hace más de 2 semestres)
    AND ua.fecha_ultima_actividad < fcs.fecha_limite
ORDER BY ua.fecha_ultima_actividad ASC;