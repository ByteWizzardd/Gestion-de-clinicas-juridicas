-- Obtener un semestre por su term
-- Parámetros: $1 = term
SELECT 
    term, 
    fecha_inicio, 
    fecha_fin
FROM semestres 
WHERE term = $1;