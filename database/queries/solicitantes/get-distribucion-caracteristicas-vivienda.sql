-- Obtener solicitantes agrupados por todos los tipos de características de vivienda
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional), $3 = term (opcional)
SELECT 
    tc.nombre_tipo_caracteristica,
    c.descripcion AS caracteristica,
    COUNT(DISTINCT s.cedula) AS cantidad_solicitantes
FROM solicitantes s
JOIN viviendas v ON s.cedula = v.cedula_solicitante
JOIN asignadas_a aa ON v.cedula_solicitante = aa.cedula_solicitante
JOIN caracteristicas c ON aa.id_tipo_caracteristica = c.id_tipo_caracteristica 
    AND aa.num_caracteristica = c.num_caracteristica
JOIN tipo_caracteristicas tc ON c.id_tipo_caracteristica = tc.id_tipo
WHERE (
    ($1::DATE IS NULL AND $2::DATE IS NULL AND $3::TEXT IS NULL)
    OR EXISTS (
        SELECT 1 
        FROM casos c_casos 
        WHERE c_casos.cedula = s.cedula
        AND ($3::TEXT IS NULL OR EXISTS (
            SELECT 1 FROM ocurren_en oe2 WHERE oe2.id_caso = c_casos.id_caso AND oe2.term = $3
        ))
        AND (
            ($1::DATE IS NULL AND $2::DATE IS NULL)
            OR EXISTS (
                SELECT 1 FROM ocurren_en oe2
                JOIN semestres sem ON oe2.term = sem.term
                WHERE oe2.id_caso = c_casos.id_caso
                AND ($2::DATE IS NULL OR sem.fecha_inicio <= $2)
                AND ($1::DATE IS NULL OR sem.fecha_fin >= $1)
            )
        )
    )
)
GROUP BY tc.nombre_tipo_caracteristica, c.num_caracteristica, c.descripcion
ORDER BY tc.nombre_tipo_caracteristica, c.num_caracteristica ASC;
