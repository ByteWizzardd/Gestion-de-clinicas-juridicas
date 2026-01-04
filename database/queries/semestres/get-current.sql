-- Obtener el semestre actual basado en la fecha actual
-- Retorna el semestre donde la fecha actual está entre fecha_inicio y fecha_fin
SELECT 
    term,
    fecha_inicio,
    fecha_fin
FROM semestres
WHERE CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin
ORDER BY term DESC
LIMIT 1;
