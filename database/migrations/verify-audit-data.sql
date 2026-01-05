-- Script de verificación: Ver los últimos registros de auditoría con los nuevos campos
-- Ejecuta esto para ver si los datos se están guardando

SELECT 
    id,
    cedula_solicitante,
    jefe_hogar_anterior,
    jefe_hogar_nuevo,
    nivel_educativo_jefe_anterior,
    nivel_educativo_jefe_nuevo,
    ingresos_mensuales_anterior,
    ingresos_mensuales_nuevo,
    fecha_actualizacion
FROM auditoria_actualizacion_solicitantes
ORDER BY fecha_actualizacion DESC
LIMIT 5;

-- También verificar si hay artefactos registrados
SELECT * FROM auditoria_artefactos_domesticos
ORDER BY id DESC
LIMIT 10;
