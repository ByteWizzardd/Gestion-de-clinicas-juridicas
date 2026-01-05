-- Crear un nuevo coordinador
-- Parámetros:
-- $1 = id_coordinador (cedula)
-- $2 = term

INSERT INTO coordinadores (
    id_coordinador,
    term,
    habilitado
) VALUES ($1, $2, TRUE)
RETURNING *;
