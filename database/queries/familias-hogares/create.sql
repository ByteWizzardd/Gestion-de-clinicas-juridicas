-- Crear un nuevo hogar familiar
-- Parámetros:
-- $1 = cant_personas
-- $2 = cant_trabajadores
-- $3 = cant_ninos
-- $4 = cant_ninos_estudiando
-- $5 = jefe_hogar (BOOLEAN)
-- $6 = id_nivel_educativo (puede ser NULL si es jefe de hogar)
-- $7 = ingresos_mensuales

INSERT INTO familias_hogares (
    cant_personas,
    cant_trabajadores,
    cant_ninos,
    cant_ninos_estudiando,
    jefe_hogar,
    id_nivel_educativo,
    ingresos_mensuales
) VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

