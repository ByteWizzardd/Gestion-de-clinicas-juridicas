-- Obtener la última fecha de actividad para cada entidad de auditoría
-- Todas las fechas se devuelven en formato ISO 8601 para parseo consistente en JS
SELECT
    -- Sesiones
    to_char(COALESCE((SELECT MAX(fecha_inicio) FROM auditoria_sesiones), '1970-01-01'::timestamp), 'YYYY-MM-DD"T"HH24:MI:SS') as sesiones,
    -- Soportes
    to_char(GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_soportes), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_eliminacion) FROM auditoria_eliminacion_soportes), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_descarga) FROM auditoria_descarga_soportes), '1970-01-01'::timestamp)
    ), 'YYYY-MM-DD"T"HH24:MI:SS') as soportes,
    -- Citas
    to_char(GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_citas), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_citas), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_eliminacion) FROM auditoria_eliminacion_citas), '1970-01-01'::timestamp)
    ), 'YYYY-MM-DD"T"HH24:MI:SS') as citas,
    -- Usuarios
    to_char(GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_usuarios), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_usuarios), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha) FROM auditoria_eliminacion_usuario), '1970-01-01'::timestamp)
    ), 'YYYY-MM-DD"T"HH24:MI:SS') as usuarios,
    -- Casos
    to_char(GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_casos), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_casos), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha) FROM cambio_estatus WHERE num_cambio > 1), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha) FROM auditoria_eliminacion_casos), '1970-01-01'::timestamp)
    ), 'YYYY-MM-DD"T"HH24:MI:SS') as casos,
    -- Solicitantes
    to_char(GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_solicitantes), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_solicitantes), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha) FROM auditoria_eliminacion_solicitantes), '1970-01-01'::timestamp)
    ), 'YYYY-MM-DD"T"HH24:MI:SS') as solicitantes,
    -- Beneficiarios
    to_char(GREATEST(
        COALESCE((SELECT MAX(fecha_registro) FROM auditoria_insercion_beneficiarios), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_beneficiarios), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_eliminacion) FROM auditoria_eliminacion_beneficiarios), '1970-01-01'::timestamp)
    ), 'YYYY-MM-DD"T"HH24:MI:SS') as beneficiarios,
    -- Acciones
    to_char(GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_acciones), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_acciones), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha) FROM auditoria_eliminacion_acciones), '1970-01-01'::timestamp)
    ), 'YYYY-MM-DD"T"HH24:MI:SS') as acciones,
    -- Equipo
    to_char(COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_equipo), '1970-01-01'::timestamp), 'YYYY-MM-DD"T"HH24:MI:SS') as equipo,
    -- Catálogos
    to_char(GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_estados), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_estados), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_eliminacion) FROM auditoria_eliminacion_estados), '1970-01-01'::timestamp)
    ), 'YYYY-MM-DD"T"HH24:MI:SS') as estados,
    to_char(GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_materias), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_materias), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_eliminacion) FROM auditoria_eliminacion_materias), '1970-01-01'::timestamp)
    ), 'YYYY-MM-DD"T"HH24:MI:SS') as materias,
    to_char(GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_nucleos), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_nucleos), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_eliminacion) FROM auditoria_eliminacion_nucleos), '1970-01-01'::timestamp)
    ), 'YYYY-MM-DD"T"HH24:MI:SS') as nucleos,
    to_char(GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_semestres), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_semestres), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_eliminacion) FROM auditoria_eliminacion_semestres), '1970-01-01'::timestamp)
    ), 'YYYY-MM-DD"T"HH24:MI:SS') as semestres,
    to_char(GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_municipios), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_municipios), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_eliminacion) FROM auditoria_eliminacion_municipios), '1970-01-01'::timestamp)
    ), 'YYYY-MM-DD"T"HH24:MI:SS') as municipios,
    to_char(GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_parroquias), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_parroquias), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_eliminacion) FROM auditoria_eliminacion_parroquias), '1970-01-01'::timestamp)
    ), 'YYYY-MM-DD"T"HH24:MI:SS') as parroquias,
    to_char(GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_caracteristicas), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_caracteristicas), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_eliminacion) FROM auditoria_eliminacion_caracteristicas), '1970-01-01'::timestamp)
    ), 'YYYY-MM-DD"T"HH24:MI:SS') as caracteristicas,
    to_char(GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_categorias), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_categorias), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_eliminacion) FROM auditoria_eliminacion_categorias), '1970-01-01'::timestamp)
    ), 'YYYY-MM-DD"T"HH24:MI:SS') as categorias,
    to_char(GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_subcategorias), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_subcategorias), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_eliminacion) FROM auditoria_eliminacion_subcategorias), '1970-01-01'::timestamp)
    ), 'YYYY-MM-DD"T"HH24:MI:SS') as subcategorias,
    to_char(GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_ambitos_legales), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_ambitos_legales), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_eliminacion) FROM auditoria_eliminacion_ambitos_legales), '1970-01-01'::timestamp)
    ), 'YYYY-MM-DD"T"HH24:MI:SS') as ambitos_legales,
    to_char(GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_niveles_educativos), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_niveles_educativos), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_eliminacion) FROM auditoria_eliminacion_niveles_educativos), '1970-01-01'::timestamp)
    ), 'YYYY-MM-DD"T"HH24:MI:SS') as niveles_educativos,
    to_char(GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_condiciones_trabajo), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_condiciones_trabajo), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_eliminacion) FROM auditoria_eliminacion_condiciones_trabajo), '1970-01-01'::timestamp)
    ), 'YYYY-MM-DD"T"HH24:MI:SS') as condiciones_trabajo,
    to_char(GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_condiciones_actividad), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_condiciones_actividad), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_eliminacion) FROM auditoria_eliminacion_condiciones_actividad), '1970-01-01'::timestamp)
    ), 'YYYY-MM-DD"T"HH24:MI:SS') as condiciones_actividad,
    to_char(GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_tipos_caracteristicas), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_tipos_caracteristicas), '1970-01-01'::timestamp),
        COALESCE((SELECT MAX(fecha_eliminacion) FROM auditoria_eliminacion_tipos_caracteristicas), '1970-01-01'::timestamp)
    ), 'YYYY-MM-DD"T"HH24:MI:SS') as tipos_caracteristicas,
    -- Reportes
    to_char(COALESCE((SELECT MAX(fecha_generacion) FROM auditoria_reportes), '1970-01-01'::timestamp), 'YYYY-MM-DD"T"HH24:MI:SS') as reportes;
