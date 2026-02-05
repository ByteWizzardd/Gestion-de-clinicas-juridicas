-- Obtener semestres de un caso
SELECT 
    o.term,
    s.fecha_inicio,
    s.fecha_fin
FROM ocurren_en o
JOIN semestres s ON o.term = s.term
WHERE o.id_caso = $1
ORDER BY s.fecha_inicio DESC;
