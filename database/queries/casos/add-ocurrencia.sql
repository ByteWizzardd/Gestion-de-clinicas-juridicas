-- Agregar ocurrencia de caso en semestre
INSERT INTO ocurren_en (id_caso, term)
VALUES ($1, $2)
ON CONFLICT (id_caso, term) DO NOTHING
RETURNING *;
