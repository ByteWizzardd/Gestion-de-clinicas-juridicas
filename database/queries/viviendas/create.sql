-- Crear una nueva vivienda para un solicitante
-- Parámetros:
-- $1 = cedula_solicitante
-- $2 = cant_habitaciones
-- $3 = cant_banos

INSERT INTO viviendas (
    cedula_solicitante,
    cant_habitaciones,
    cant_banos
) VALUES ($1, $2, $3)
RETURNING *;

