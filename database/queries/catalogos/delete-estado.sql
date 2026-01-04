-- Delete estado
DELETE FROM estados WHERE id_estado = $1 RETURNING *;
