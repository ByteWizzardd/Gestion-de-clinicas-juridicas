-- Toggle habilitado for estado
UPDATE estados SET habilitado = NOT habilitado WHERE id_estado = $1 RETURNING *;
