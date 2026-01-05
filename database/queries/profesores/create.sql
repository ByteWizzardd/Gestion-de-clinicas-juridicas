-- Crear un nuevo profesor
-- Parámetros:
-- $1 = cedula_profesor
-- $2 = term
-- $3 = tipo_profesor

INSERT INTO profesores (
    cedula_profesor,
    term,
    tipo_profesor,
    habilitado
) VALUES ($1, $2, $3, TRUE)
RETURNING *;
