-- Eliminar ocurrencia de caso en semestre
DELETE FROM ocurren_en
WHERE id_caso = $1 AND term = $2
RETURNING *;
