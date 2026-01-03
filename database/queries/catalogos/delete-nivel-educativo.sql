-- Delete nivel educativo
-- Parámetros:
-- $1 = id_nivel_educativo

DELETE FROM niveles_educativos 
WHERE id_nivel_educativo = $1
RETURNING *;
