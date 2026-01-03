-- Get all semestres
SELECT 
    term,
    fecha_inicio,
    fecha_fin,
    habilitado
FROM semestres
ORDER BY term DESC;
