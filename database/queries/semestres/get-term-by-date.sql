-- Obtener el term del semestre dada una fecha
SELECT term
FROM semestres
WHERE $1 BETWEEN fecha_inicio AND fecha_fin
LIMIT 1;
