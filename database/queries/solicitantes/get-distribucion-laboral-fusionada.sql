-- Obtener solicitantes agrupados por situación socio-laboral fusionada
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional)
WITH laboral AS (
    SELECT 
        s.cedula,
        ct.nombre_trabajo,
        ca.nombre_actividad
    FROM solicitantes s
    LEFT JOIN condicion_trabajo ct ON s.id_trabajo = ct.id_trabajo
    LEFT JOIN condicion_actividad ca ON s.id_actividad = ca.id_actividad
    WHERE (
        ($1::DATE IS NULL AND $2::DATE IS NULL)
        OR EXISTS (
            SELECT 1 
            FROM casos c 
            WHERE c.cedula = s.cedula
            AND ($1::DATE IS NULL OR c.fecha_inicio_caso >= $1)
            AND ($2::DATE IS NULL OR c.fecha_inicio_caso <= $2)
        )
    )
),
categorias AS (
    SELECT 
        CASE 
            WHEN nombre_trabajo IN ('Patrono', 'Empleado', 'Obrero', 'Cuenta propia') THEN 'Trabaja'
            WHEN nombre_actividad = 'Estudiante' THEN 'Estudiante'
            WHEN nombre_actividad = 'Ama de Casa' THEN 'Ama de Casa'
            WHEN nombre_actividad = 'Pensionado/Jubilado' THEN 'Pensionado'
            WHEN nombre_actividad = 'Buscando trabajo' OR nombre_trabajo = 'No trabaja' THEN 'Desempleado'
            ELSE 'Otra'
        END AS categoria
    FROM laboral
)
SELECT 
    categoria,
    COUNT(*) AS cantidad_solicitantes
FROM categorias
GROUP BY categoria
ORDER BY 
    CASE categoria
        WHEN 'Trabaja' THEN 1
        WHEN 'Desempleado' THEN 2
        WHEN 'Estudiante' THEN 3
        WHEN 'Ama de Casa' THEN 4
        WHEN 'Pensionado' THEN 5
        ELSE 6
    END ASC;
