-- Obtener todas las materias
SELECT 
    id_materia,
    TRIM(REGEXP_REPLACE(nombre_materia, '^\s*Materia\s+', '', 'i')) AS nombre_materia
FROM materias
WHERE habilitado = true
ORDER BY id_materia;

