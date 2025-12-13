-- Crear una nueva vivienda
-- Parámetros:
-- $1 = tipo_vivienda
-- $2 = cant_habitaciones
-- $3 = cant_banos
-- $4 = material_piso
-- $5 = material_paredes
-- $6 = material_techo
-- $7 = agua_potable
-- $8 = eliminacion_aguas_n
-- $9 = aseo

INSERT INTO viviendas (
    tipo_vivienda,
    cant_habitaciones,
    cant_banos,
    material_piso,
    material_paredes,
    material_techo,
    agua_potable,
    eliminacion_aguas_n,
    aseo
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING *;

