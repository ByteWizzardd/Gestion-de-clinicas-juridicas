-- Obtener todos los casos agrupados por ámbito legal (sin agrupar por materia)
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional)
SELECT 
    al.nombre_ambito_legal,
    COUNT(DISTINCT c.id_caso) AS cantidad_casos
FROM casos c
INNER JOIN ambitos_legales al ON c.id_materia = al.id_materia
    AND c.num_categoria = al.num_categoria
    AND c.num_subcategoria = al.num_subcategoria
    AND c.num_ambito_legal = al.num_ambito_legal
WHERE 
    ($1::DATE IS NULL OR c.fecha_solicitud >= $1)
    AND ($2::DATE IS NULL OR c.fecha_solicitud <= $2)
GROUP BY al.nombre_ambito_legal
ORDER BY cantidad_casos DESC, al.nombre_ambito_legal;

