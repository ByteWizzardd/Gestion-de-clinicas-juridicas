-- Obtener la última fecha de actividad para cada entidad de auditoría
SELECT
    -- Soportes
    GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_soportes), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_eliminacion) FROM auditoria_eliminacion_soportes), '1970-01-01')
    ) as soportes,
    -- Citas
    GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_citas), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_citas), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_eliminacion) FROM auditoria_eliminacion_citas), '1970-01-01')
    ) as citas,
    -- Usuarios
    GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_usuarios), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_usuarios), '1970-01-01'),
        COALESCE((SELECT MAX(fecha) FROM auditoria_eliminacion_usuario), '1970-01-01'),
        COALESCE((SELECT MAX(fecha) FROM auditoria_eliminacion_usuario), '1970-01-01')
    ) as usuarios,
    -- Casos
    GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_casos), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_casos), '1970-01-01'),
        COALESCE((SELECT MAX(fecha) FROM auditoria_eliminacion_casos), '1970-01-01')
    ) as casos,
    -- Solicitantes
    GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_solicitantes), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_solicitantes), '1970-01-01'),
        COALESCE((SELECT MAX(fecha) FROM auditoria_eliminacion_solicitantes), '1970-01-01')
    ) as solicitantes,
    -- Beneficiarios
    GREATEST(
        COALESCE((SELECT MAX(fecha_registro) FROM auditoria_insercion_beneficiarios), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_beneficiarios), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_eliminacion) FROM auditoria_eliminacion_beneficiarios), '1970-01-01')
    ) as beneficiarios,
    -- Acciones
    GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_acciones), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_acciones), '1970-01-01'),
        COALESCE((SELECT MAX(fecha) FROM auditoria_eliminacion_acciones), '1970-01-01')
    ) as acciones,
    -- Equipo
    COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_equipo), '1970-01-01') as equipo,
    -- Catálogos
    GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_estados), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_estados), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_eliminacion) FROM auditoria_eliminacion_estados), '1970-01-01')
    ) as estados,
    GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_materias), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_materias), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_eliminacion) FROM auditoria_eliminacion_materias), '1970-01-01')
    ) as materias,
    GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_nucleos), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_nucleos), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_eliminacion) FROM auditoria_eliminacion_nucleos), '1970-01-01')
    ) as nucleos,
    GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_semestres), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_semestres), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_eliminacion) FROM auditoria_eliminacion_semestres), '1970-01-01')
    ) as semestres,
    GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_municipios), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_municipios), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_eliminacion) FROM auditoria_eliminacion_municipios), '1970-01-01')
    ) as municipios,
    GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_parroquias), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_parroquias), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_eliminacion) FROM auditoria_eliminacion_parroquias), '1970-01-01')
    ) as parroquias,
    GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_caracteristicas), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_caracteristicas), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_eliminacion) FROM auditoria_eliminacion_caracteristicas), '1970-01-01')
    ) as caracteristicas,
    GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_categorias), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_categorias), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_eliminacion) FROM auditoria_eliminacion_categorias), '1970-01-01')
    ) as categorias,
    GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_subcategorias), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_subcategorias), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_eliminacion) FROM auditoria_eliminacion_subcategorias), '1970-01-01')
    ) as subcategorias,
    GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_ambitos_legales), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_ambitos_legales), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_eliminacion) FROM auditoria_eliminacion_ambitos_legales), '1970-01-01')
    ) as ambitos_legales,
    GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_niveles_educativos), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_niveles_educativos), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_eliminacion) FROM auditoria_eliminacion_niveles_educativos), '1970-01-01')
    ) as niveles_educativos,
    GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_condiciones_trabajo), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_condiciones_trabajo), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_eliminacion) FROM auditoria_eliminacion_condiciones_trabajo), '1970-01-01')
    ) as condiciones_trabajo,
    GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_condiciones_actividad), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_condiciones_actividad), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_eliminacion) FROM auditoria_eliminacion_condiciones_actividad), '1970-01-01')
    ) as condiciones_actividad,
    GREATEST(
        COALESCE((SELECT MAX(fecha_creacion) FROM auditoria_insercion_tipos_caracteristicas), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_actualizacion) FROM auditoria_actualizacion_tipos_caracteristicas), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_eliminacion) FROM auditoria_eliminacion_tipos_caracteristicas), '1970-01-01')
    ) as tipos_caracteristicas;
