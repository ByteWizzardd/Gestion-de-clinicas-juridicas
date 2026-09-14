-- Obtener solicitantes agrupados por tipo de vivienda
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional), $3 = term (opcional)
SELECT 
    c.descripcion AS tipo_vivienda,
    COUNT(DISTINCT s.cedula) AS cantidad_solicitantes
FROM solicitantes s
JOIN viviendas v ON s.cedula = v.cedula_solicitante
JOIN asignadas_a aa ON v.cedula_solicitante = aa.cedula_solicitante
JOIN caracteristicas c ON aa.id_tipo_caracteristica = c.id_tipo_caracteristica 
    AND aa.num_caracteristica = c.num_caracteristica
JOIN tipo_caracteristicas tc ON c.id_tipo_caracteristica = tc.id_tipo
WHERE (LOWER(tc.nombre_tipo_caracteristica) = 'tipo_vivienda' OR LOWER(tc.nombre_tipo_caracteristica) = 'tipo de vivienda')
AND (
    ($1::DATE IS NULL AND $2::DATE IS NULL AND $3::TEXT IS NULL)
    OR EXISTS (
        SELECT 1 
        FROM casos c_casos 
        WHERE c_casos.cedula = s.cedula
        AND (
            ($1::DATE IS NULL AND $2::DATE IS NULL)
            OR caso_con_actividad_en_rango(c_casos.id_caso, $1::DATE, $2::DATE)
        )
        AND ($3::TEXT IS NULL OR EXISTS (
            SELECT 1 FROM ocurren_en oe WHERE oe.id_caso = c_casos.id_caso AND oe.term = $3
        ))
    )
)
GROUP BY c.num_caracteristica, c.descripcion
ORDER BY c.num_caracteristica ASC;
