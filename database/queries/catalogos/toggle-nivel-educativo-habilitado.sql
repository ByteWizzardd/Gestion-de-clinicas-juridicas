-- Toggle habilitado status of nivel educativo
-- Parámetros:
-- $1 = id_nivel_educativo

UPDATE niveles_educativos 
SET habilitado = NOT habilitado 
WHERE id_nivel_educativo = $1
RETURNING *;
