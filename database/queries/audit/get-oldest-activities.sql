-- Obtener la fecha de actividad más antigua para cada entidad de auditoría
SELECT
    -- Sesiones
    COALESCE((SELECT MIN(fecha_inicio) FROM auditoria_sesiones), '9999-12-31') as sesiones,
    -- Soportes
    LEAST(
        COALESCE((SELECT MIN(fecha_creacion) FROM auditoria_insercion_soportes), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_eliminacion) FROM auditoria_eliminacion_soportes), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_descarga) FROM auditoria_descarga_soportes), '9999-12-31')
    ) as soportes,
    -- Citas
    LEAST(
        COALESCE((SELECT MIN(fecha_creacion) FROM auditoria_insercion_citas), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_actualizacion) FROM auditoria_actualizacion_citas), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_eliminacion) FROM auditoria_eliminacion_citas), '9999-12-31')
    ) as citas,
    -- Usuarios
    LEAST(
        COALESCE((SELECT MIN(fecha_creacion) FROM auditoria_insercion_usuarios), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_actualizacion) FROM auditoria_actualizacion_usuarios), '9999-12-31'),
        COALESCE((SELECT MIN(fecha) FROM auditoria_eliminacion_usuario), '9999-12-31')
    ) as usuarios,
    -- Casos
    LEAST(
        COALESCE((SELECT MIN(fecha_creacion) FROM auditoria_insercion_casos), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_actualizacion) FROM auditoria_actualizacion_casos), '9999-12-31'),
        COALESCE((SELECT MIN(fecha) FROM auditoria_eliminacion_casos), '9999-12-31')
    ) as casos,
    -- Solicitantes
    LEAST(
        COALESCE((SELECT MIN(fecha_creacion) FROM auditoria_insercion_solicitantes), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_actualizacion) FROM auditoria_actualizacion_solicitantes), '9999-12-31'),
        COALESCE((SELECT MIN(fecha) FROM auditoria_eliminacion_solicitantes), '9999-12-31')
    ) as solicitantes,
    -- Beneficiarios
    LEAST(
        COALESCE((SELECT MIN(fecha_registro) FROM auditoria_insercion_beneficiarios), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_actualizacion) FROM auditoria_actualizacion_beneficiarios), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_eliminacion) FROM auditoria_eliminacion_beneficiarios), '9999-12-31')
    ) as beneficiarios,
    -- Acciones
    LEAST(
        COALESCE((SELECT MIN(fecha_creacion) FROM auditoria_insercion_acciones), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_actualizacion) FROM auditoria_actualizacion_acciones), '9999-12-31'),
        COALESCE((SELECT MIN(fecha) FROM auditoria_eliminacion_acciones), '9999-12-31')
    ) as acciones,
    -- Equipo
    COALESCE((SELECT MIN(fecha_actualizacion) FROM auditoria_actualizacion_equipo), '9999-12-31') as equipo,
    -- Catálogos
    LEAST(
        COALESCE((SELECT MIN(fecha_creacion) FROM auditoria_insercion_estados), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_actualizacion) FROM auditoria_actualizacion_estados), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_eliminacion) FROM auditoria_eliminacion_estados), '9999-12-31')
    ) as estados,
    LEAST(
        COALESCE((SELECT MIN(fecha_creacion) FROM auditoria_insercion_materias), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_actualizacion) FROM auditoria_actualizacion_materias), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_eliminacion) FROM auditoria_eliminacion_materias), '9999-12-31')
    ) as materias,
    LEAST(
        COALESCE((SELECT MIN(fecha_creacion) FROM auditoria_insercion_nucleos), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_actualizacion) FROM auditoria_actualizacion_nucleos), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_eliminacion) FROM auditoria_eliminacion_nucleos), '9999-12-31')
    ) as nucleos,
    LEAST(
        COALESCE((SELECT MIN(fecha_creacion) FROM auditoria_insercion_semestres), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_actualizacion) FROM auditoria_actualizacion_semestres), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_eliminacion) FROM auditoria_eliminacion_semestres), '9999-12-31')
    ) as semestres,
    LEAST(
        COALESCE((SELECT MIN(fecha_creacion) FROM auditoria_insercion_municipios), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_actualizacion) FROM auditoria_actualizacion_municipios), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_eliminacion) FROM auditoria_eliminacion_municipios), '9999-12-31')
    ) as municipios,
    LEAST(
        COALESCE((SELECT MIN(fecha_creacion) FROM auditoria_insercion_parroquias), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_actualizacion) FROM auditoria_actualizacion_parroquias), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_eliminacion) FROM auditoria_eliminacion_parroquias), '9999-12-31')
    ) as parroquias,
    LEAST(
        COALESCE((SELECT MIN(fecha_creacion) FROM auditoria_insercion_caracteristicas), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_actualizacion) FROM auditoria_actualizacion_caracteristicas), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_eliminacion) FROM auditoria_eliminacion_caracteristicas), '9999-12-31')
    ) as caracteristicas,
    LEAST(
        COALESCE((SELECT MIN(fecha_creacion) FROM auditoria_insercion_categorias), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_actualizacion) FROM auditoria_actualizacion_categorias), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_eliminacion) FROM auditoria_eliminacion_categorias), '9999-12-31')
    ) as categorias,
    LEAST(
        COALESCE((SELECT MIN(fecha_creacion) FROM auditoria_insercion_subcategorias), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_actualizacion) FROM auditoria_actualizacion_subcategorias), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_eliminacion) FROM auditoria_eliminacion_subcategorias), '9999-12-31')
    ) as subcategorias,
    LEAST(
        COALESCE((SELECT MIN(fecha_creacion) FROM auditoria_insercion_ambitos_legales), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_actualizacion) FROM auditoria_actualizacion_ambitos_legales), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_eliminacion) FROM auditoria_eliminacion_ambitos_legales), '9999-12-31')
    ) as ambitos_legales,
    LEAST(
        COALESCE((SELECT MIN(fecha_creacion) FROM auditoria_insercion_niveles_educativos), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_actualizacion) FROM auditoria_actualizacion_niveles_educativos), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_eliminacion) FROM auditoria_eliminacion_niveles_educativos), '9999-12-31')
    ) as niveles_educativos,
    LEAST(
        COALESCE((SELECT MIN(fecha_creacion) FROM auditoria_insercion_condiciones_trabajo), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_actualizacion) FROM auditoria_actualizacion_condiciones_trabajo), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_eliminacion) FROM auditoria_eliminacion_condiciones_trabajo), '9999-12-31')
    ) as condiciones_trabajo,
    LEAST(
        COALESCE((SELECT MIN(fecha_creacion) FROM auditoria_insercion_condiciones_actividad), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_actualizacion) FROM auditoria_actualizacion_condiciones_actividad), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_eliminacion) FROM auditoria_eliminacion_condiciones_actividad), '9999-12-31')
    ) as condiciones_actividad,
    LEAST(
        COALESCE((SELECT MIN(fecha_creacion) FROM auditoria_insercion_tipos_caracteristicas), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_actualizacion) FROM auditoria_actualizacion_tipos_caracteristicas), '9999-12-31'),
        COALESCE((SELECT MIN(fecha_eliminacion) FROM auditoria_eliminacion_tipos_caracteristicas), '9999-12-31')
    ) as tipos_caracteristicas;
