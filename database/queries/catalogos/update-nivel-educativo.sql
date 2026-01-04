-- Update nivel educativo
-- Parámetros:
-- $1 = id_nivel_educativo
-- $2 = descripcion

UPDATE niveles_educativos 
SET descripcion = $2
WHERE id_nivel_educativo = $1
RETURNING *;
