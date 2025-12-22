-- Crear un nuevo hogar familiar para un solicitante
-- Parámetros:
-- $1 = cedula_solicitante
-- $2 = cant_personas
-- $3 = cant_trabajadores
-- $4 = cant_no_trabajadores
-- $5 = cant_ninos
-- $6 = cant_ninos_estudiando
-- $7 = jefe_hogar (BOOLEAN)
-- $8 = ingresos_mensuales
-- $9 = tiempo_estudio_jefe (opcional)
-- $10 = id_nivel_educativo_jefe (opcional)

INSERT INTO familias_y_hogares (
    cedula_solicitante,
    cant_personas,
    cant_trabajadores,
    cant_no_trabajadores,
    cant_ninos,
    cant_ninos_estudiando,
    jefe_hogar,
    ingresos_mensuales,
    tiempo_estudio_jefe,
    id_nivel_educativo_jefe
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
RETURNING *;

