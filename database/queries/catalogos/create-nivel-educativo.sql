-- Create nivel educativo
-- Parámetros:
-- $1 = descripcion

INSERT INTO niveles_educativos (
    descripcion,
    habilitado
) VALUES ($1, TRUE)
RETURNING *;
