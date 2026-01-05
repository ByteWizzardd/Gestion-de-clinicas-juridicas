-- Insertar o actualizar hogar familiar para un solicitante
-- Parámetros iguales a create.sql
INSERT INTO familias_y_hogares (
    cedula_solicitante,
    cant_personas,
    cant_trabajadores,
    cant_no_trabajadores,
    cant_ninos,
    cant_ninos_estudiando,
    jefe_hogar,
    ingresos_mensuales,
    tipo_tiempo_estudio_jefe,
    tiempo_estudio_jefe,
    id_nivel_educativo_jefe
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
ON CONFLICT (cedula_solicitante)
DO UPDATE SET
    cant_personas = EXCLUDED.cant_personas,
    cant_trabajadores = EXCLUDED.cant_trabajadores,
    cant_no_trabajadores = EXCLUDED.cant_no_trabajadores,
    cant_ninos = EXCLUDED.cant_ninos,
    cant_ninos_estudiando = EXCLUDED.cant_ninos_estudiando,
    jefe_hogar = EXCLUDED.jefe_hogar,
    ingresos_mensuales = EXCLUDED.ingresos_mensuales,
    tipo_tiempo_estudio_jefe = EXCLUDED.tipo_tiempo_estudio_jefe,
    tiempo_estudio_jefe = EXCLUDED.tiempo_estudio_jefe,
    id_nivel_educativo_jefe = EXCLUDED.id_nivel_educativo_jefe
RETURNING *;
