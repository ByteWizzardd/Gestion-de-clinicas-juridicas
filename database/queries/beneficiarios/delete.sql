-- Eliminar un beneficiario
-- Parámetros:
-- $1: id_caso
-- $2: num_beneficiario

DELETE FROM beneficiarios
WHERE id_caso = $1 AND num_beneficiario = $2
RETURNING *;
