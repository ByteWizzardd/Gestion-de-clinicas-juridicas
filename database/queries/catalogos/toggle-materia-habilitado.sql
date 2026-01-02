-- Toggle habilitado for materia
-- Parameters:
--   $1 = id_materia
UPDATE materias
SET habilitado = NOT habilitado
WHERE id_materia = $1
RETURNING *;
