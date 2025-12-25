-- Obtener todos los semestres ordenados por term descendente
SELECT 
    term,
    fecha_inicio,
    fecha_fin
FROM semestres
ORDER BY term DESC;

