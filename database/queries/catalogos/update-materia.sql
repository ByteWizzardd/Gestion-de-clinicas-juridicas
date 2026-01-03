-- Update materia
-- Parameters:
--   $1 = id_materia
--   $2 = nombre_materia
UPDATE materias
SET nombre_materia = $2
WHERE id_materia = $1
RETURNING *;
