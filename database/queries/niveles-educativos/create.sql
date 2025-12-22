-- Crear un nuevo nivel educativo
-- Parámetros:
-- $1 = descripcion

INSERT INTO niveles_educativos (
    descripcion
) VALUES ($1)
RETURNING *;

