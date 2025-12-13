-- Crear un nuevo trabajo
-- Parámetros:
-- $1 = condicion_actividad (puede ser NULL si trabaja)
-- $2 = buscando_trabajo (BOOLEAN)
-- $3 = condicion_trabajo (puede ser NULL si no trabaja)

INSERT INTO trabajos (
    condicion_actividad,
    buscando_trabajo,
    condicion_trabajo
) VALUES ($1, $2, $3)
RETURNING *;

