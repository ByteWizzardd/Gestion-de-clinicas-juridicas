-- Asignar cambio de estatus inicial a casos que no tienen ningún registro en cambio_estatus
-- QUERY TEMPORAL

WITH casos_sin_estatus AS (
    -- Encontrar casos que no tienen ningún registro en cambio_estatus
    SELECT c.id_caso, c.fecha_solicitud
    FROM casos c
    WHERE NOT EXISTS (
        SELECT 1 
        FROM cambio_estatus ce 
        WHERE ce.id_caso = c.id_caso
    )
),
usuario_fallback AS (
    -- Usar la cédula especificada o un coordinador como fallback
    SELECT COALESCE(
        'V-77777777'::VARCHAR,
        (SELECT cedula FROM usuarios WHERE tipo_usuario = 'Coordinador' LIMIT 1)
    ) AS cedula_usuario
),
nuevos_cambios AS (
    -- Insertar el cambio de estatus inicial para cada caso sin estatus
    INSERT INTO cambio_estatus (
        num_cambio,
        id_caso,
        nuevo_estatus,
        id_usuario_cambia,
        motivo
    )
    SELECT 
        1 AS num_cambio,
        cse.id_caso,
        'Asesoría' AS nuevo_estatus,
        uf.cedula_usuario AS id_usuario_cambia,
        'Registro del caso (asignado retroactivamente)' AS motivo
    FROM casos_sin_estatus cse
    CROSS JOIN usuario_fallback uf
    RETURNING id_caso, nuevo_estatus, id_usuario_cambia
)
SELECT 
    COUNT(*) AS casos_actualizados,
    STRING_AGG(id_caso::TEXT, ', ') AS ids_casos_actualizados
FROM nuevos_cambios;

