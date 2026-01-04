-- Delete materia (only if no associations)
-- Parameters:
--   $1 = id_materia
DELETE FROM materias
WHERE id_materia = $1
RETURNING *;
