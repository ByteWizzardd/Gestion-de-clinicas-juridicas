-- Update estado
UPDATE estados SET nombre_estado = $2 WHERE id_estado = $1 RETURNING *;
