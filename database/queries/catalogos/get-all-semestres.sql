-- Get all semestres
SELECT 
    term,
    fecha_inicio,
    fecha_fin
FROM semestres
ORDER BY term DESC;
