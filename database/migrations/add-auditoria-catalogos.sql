-- Migración: Agregar tablas de auditoría para catálogos
-- Fecha: 2026-01-03
-- Descripción: Crea tablas de auditoría para eliminaciones y actualizaciones de todos los catálogos

-- =========================================================
-- AUDITORÍA DE ELIMINACIONES DE CATÁLOGOS
-- =========================================================

-- Estados eliminados
CREATE TABLE IF NOT EXISTS auditoria_eliminacion_estados (
    id SERIAL PRIMARY KEY,
    id_estado INTEGER NOT NULL,
    nombre_estado VARCHAR(100) NOT NULL,
    habilitado BOOLEAN,
    id_usuario_elimino VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    motivo TEXT,
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Materias eliminadas
CREATE TABLE IF NOT EXISTS auditoria_eliminacion_materias (
    id SERIAL PRIMARY KEY,
    id_materia INTEGER NOT NULL,
    nombre_materia VARCHAR(100) NOT NULL,
    habilitado BOOLEAN,
    id_usuario_elimino VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    motivo TEXT,
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Niveles Educativos eliminados
CREATE TABLE IF NOT EXISTS auditoria_eliminacion_niveles_educativos (
    id SERIAL PRIMARY KEY,
    id_nivel_educativo INTEGER NOT NULL,
    descripcion VARCHAR(100) NOT NULL,
    habilitado BOOLEAN,
    id_usuario_elimino VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    motivo TEXT,
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Nucleos eliminados
CREATE TABLE IF NOT EXISTS auditoria_eliminacion_nucleos (
    id SERIAL PRIMARY KEY,
    id_nucleo INTEGER NOT NULL,
    nombre_nucleo VARCHAR(100) NOT NULL,
    habilitado BOOLEAN,
    id_estado INTEGER,
    num_municipio INTEGER,
    num_parroquia INTEGER,
    id_usuario_elimino VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    motivo TEXT,
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Condiciones Trabajo eliminadas
CREATE TABLE IF NOT EXISTS auditoria_eliminacion_condiciones_trabajo (
    id SERIAL PRIMARY KEY,
    id_trabajo INTEGER NOT NULL,
    nombre_trabajo VARCHAR(100) NOT NULL,
    habilitado BOOLEAN,
    id_usuario_elimino VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    motivo TEXT,
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Condiciones Actividad eliminadas
CREATE TABLE IF NOT EXISTS auditoria_eliminacion_condiciones_actividad (
    id SERIAL PRIMARY KEY,
    id_actividad INTEGER NOT NULL,
    nombre_actividad VARCHAR(100) NOT NULL,
    habilitado BOOLEAN,
    id_usuario_elimino VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    motivo TEXT,
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Tipos Caracteristicas eliminados
CREATE TABLE IF NOT EXISTS auditoria_eliminacion_tipos_caracteristicas (
    id SERIAL PRIMARY KEY,
    id_tipo INTEGER NOT NULL,
    nombre_tipo_caracteristica VARCHAR(100) NOT NULL,
    habilitado BOOLEAN,
    id_usuario_elimino VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    motivo TEXT,
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Semestres eliminados
CREATE TABLE IF NOT EXISTS auditoria_eliminacion_semestres (
    id SERIAL PRIMARY KEY,
    term VARCHAR(20) NOT NULL,
    fecha_inicio DATE,
    fecha_fin DATE,
    habilitado BOOLEAN,
    id_usuario_elimino VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    motivo TEXT,
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Municipios eliminados
CREATE TABLE IF NOT EXISTS auditoria_eliminacion_municipios (
    id SERIAL PRIMARY KEY,
    id_estado INTEGER NOT NULL,
    num_municipio INTEGER NOT NULL,
    nombre_municipio VARCHAR(100) NOT NULL,
    habilitado BOOLEAN,
    id_usuario_elimino VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    motivo TEXT,
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Parroquias eliminadas
CREATE TABLE IF NOT EXISTS auditoria_eliminacion_parroquias (
    id SERIAL PRIMARY KEY,
    id_estado INTEGER NOT NULL,
    num_municipio INTEGER NOT NULL,
    num_parroquia INTEGER NOT NULL,
    nombre_parroquia VARCHAR(100) NOT NULL,
    habilitado BOOLEAN,
    id_usuario_elimino VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    motivo TEXT,
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Categorias eliminadas
CREATE TABLE IF NOT EXISTS auditoria_eliminacion_categorias (
    id SERIAL PRIMARY KEY,
    id_materia INTEGER NOT NULL,
    num_categoria INTEGER NOT NULL,
    nombre_categoria VARCHAR(100) NOT NULL,
    habilitado BOOLEAN,
    id_usuario_elimino VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    motivo TEXT,
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Subcategorias eliminadas
CREATE TABLE IF NOT EXISTS auditoria_eliminacion_subcategorias (
    id SERIAL PRIMARY KEY,
    id_materia INTEGER NOT NULL,
    num_categoria INTEGER NOT NULL,
    num_subcategoria INTEGER NOT NULL,
    nombre_subcategoria VARCHAR(100) NOT NULL,
    habilitado BOOLEAN,
    id_usuario_elimino VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    motivo TEXT,
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Ambitos Legales eliminados
CREATE TABLE IF NOT EXISTS auditoria_eliminacion_ambitos_legales (
    id SERIAL PRIMARY KEY,
    id_materia INTEGER NOT NULL,
    num_categoria INTEGER NOT NULL,
    num_subcategoria INTEGER NOT NULL,
    num_ambito_legal INTEGER NOT NULL,
    nombre_ambito_legal VARCHAR(200) NOT NULL,
    habilitado BOOLEAN,
    id_usuario_elimino VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    motivo TEXT,
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Caracteristicas eliminadas
CREATE TABLE IF NOT EXISTS auditoria_eliminacion_caracteristicas (
    id SERIAL PRIMARY KEY,
    id_tipo_caracteristica INTEGER NOT NULL,
    num_caracteristica INTEGER NOT NULL,
    descripcion VARCHAR(200) NOT NULL,
    habilitado BOOLEAN,
    id_usuario_elimino VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    motivo TEXT,
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- =========================================================
-- AUDITORÍA DE ACTUALIZACIONES DE CATÁLOGOS
-- =========================================================

-- Estados actualizados
CREATE TABLE IF NOT EXISTS auditoria_actualizacion_estados (
    id SERIAL PRIMARY KEY,
    id_estado INTEGER NOT NULL,
    nombre_estado_anterior VARCHAR(100),
    nombre_estado_nuevo VARCHAR(100),
    habilitado_anterior BOOLEAN,
    habilitado_nuevo BOOLEAN,
    id_usuario_actualizo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Materias actualizadas
CREATE TABLE IF NOT EXISTS auditoria_actualizacion_materias (
    id SERIAL PRIMARY KEY,
    id_materia INTEGER NOT NULL,
    nombre_materia_anterior VARCHAR(100),
    nombre_materia_nuevo VARCHAR(100),
    habilitado_anterior BOOLEAN,
    habilitado_nuevo BOOLEAN,
    id_usuario_actualizo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Niveles Educativos actualizados
CREATE TABLE IF NOT EXISTS auditoria_actualizacion_niveles_educativos (
    id SERIAL PRIMARY KEY,
    id_nivel_educativo INTEGER NOT NULL,
    descripcion_anterior VARCHAR(100),
    descripcion_nuevo VARCHAR(100),
    habilitado_anterior BOOLEAN,
    habilitado_nuevo BOOLEAN,
    id_usuario_actualizo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Nucleos actualizados
CREATE TABLE IF NOT EXISTS auditoria_actualizacion_nucleos (
    id SERIAL PRIMARY KEY,
    id_nucleo INTEGER NOT NULL,
    nombre_nucleo_anterior VARCHAR(100),
    nombre_nucleo_nuevo VARCHAR(100),
    habilitado_anterior BOOLEAN,
    habilitado_nuevo BOOLEAN,
    id_estado_anterior INTEGER,
    id_estado_nuevo INTEGER,
    num_municipio_anterior INTEGER,
    num_municipio_nuevo INTEGER,
    num_parroquia_anterior INTEGER,
    num_parroquia_nuevo INTEGER,
    id_usuario_actualizo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Condiciones Trabajo actualizadas
CREATE TABLE IF NOT EXISTS auditoria_actualizacion_condiciones_trabajo (
    id SERIAL PRIMARY KEY,
    id_trabajo INTEGER NOT NULL,
    nombre_trabajo_anterior VARCHAR(100),
    nombre_trabajo_nuevo VARCHAR(100),
    habilitado_anterior BOOLEAN,
    habilitado_nuevo BOOLEAN,
    id_usuario_actualizo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Condiciones Actividad actualizadas
CREATE TABLE IF NOT EXISTS auditoria_actualizacion_condiciones_actividad (
    id SERIAL PRIMARY KEY,
    id_actividad INTEGER NOT NULL,
    nombre_actividad_anterior VARCHAR(100),
    nombre_actividad_nuevo VARCHAR(100),
    habilitado_anterior BOOLEAN,
    habilitado_nuevo BOOLEAN,
    id_usuario_actualizo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Tipos Caracteristicas actualizados
CREATE TABLE IF NOT EXISTS auditoria_actualizacion_tipos_caracteristicas (
    id SERIAL PRIMARY KEY,
    id_tipo INTEGER NOT NULL,
    nombre_tipo_caracteristica_anterior VARCHAR(100),
    nombre_tipo_caracteristica_nuevo VARCHAR(100),
    habilitado_anterior BOOLEAN,
    habilitado_nuevo BOOLEAN,
    id_usuario_actualizo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Semestres actualizados
CREATE TABLE IF NOT EXISTS auditoria_actualizacion_semestres (
    id SERIAL PRIMARY KEY,
    term VARCHAR(20) NOT NULL,
    fecha_inicio_anterior DATE,
    fecha_inicio_nuevo DATE,
    fecha_fin_anterior DATE,
    fecha_fin_nuevo DATE,
    habilitado_anterior BOOLEAN,
    habilitado_nuevo BOOLEAN,
    id_usuario_actualizo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Municipios actualizados
CREATE TABLE IF NOT EXISTS auditoria_actualizacion_municipios (
    id SERIAL PRIMARY KEY,
    id_estado INTEGER NOT NULL,
    num_municipio INTEGER NOT NULL,
    nombre_municipio_anterior VARCHAR(100),
    nombre_municipio_nuevo VARCHAR(100),
    habilitado_anterior BOOLEAN,
    habilitado_nuevo BOOLEAN,
    id_usuario_actualizo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Parroquias actualizadas
CREATE TABLE IF NOT EXISTS auditoria_actualizacion_parroquias (
    id SERIAL PRIMARY KEY,
    id_estado INTEGER NOT NULL,
    num_municipio INTEGER NOT NULL,
    num_parroquia INTEGER NOT NULL,
    nombre_parroquia_anterior VARCHAR(100),
    nombre_parroquia_nuevo VARCHAR(100),
    habilitado_anterior BOOLEAN,
    habilitado_nuevo BOOLEAN,
    id_usuario_actualizo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Categorias actualizadas
CREATE TABLE IF NOT EXISTS auditoria_actualizacion_categorias (
    id SERIAL PRIMARY KEY,
    id_materia INTEGER NOT NULL,
    num_categoria INTEGER NOT NULL,
    nombre_categoria_anterior VARCHAR(100),
    nombre_categoria_nuevo VARCHAR(100),
    habilitado_anterior BOOLEAN,
    habilitado_nuevo BOOLEAN,
    id_materia_anterior INTEGER,
    id_materia_nuevo INTEGER,
    num_categoria_anterior INTEGER,
    num_categoria_nuevo INTEGER,
    id_usuario_actualizo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Subcategorias actualizadas
CREATE TABLE IF NOT EXISTS auditoria_actualizacion_subcategorias (
    id SERIAL PRIMARY KEY,
    id_materia INTEGER NOT NULL,
    num_categoria INTEGER NOT NULL,
    num_subcategoria INTEGER NOT NULL,
    nombre_subcategoria_anterior VARCHAR(100),
    nombre_subcategoria_nuevo VARCHAR(100),
    habilitado_anterior BOOLEAN,
    habilitado_nuevo BOOLEAN,
    id_materia_anterior INTEGER,
    id_materia_nuevo INTEGER,
    num_categoria_anterior INTEGER,
    num_categoria_nuevo INTEGER,
    num_subcategoria_anterior INTEGER,
    num_subcategoria_nuevo INTEGER,
    id_usuario_actualizo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Ambitos Legales actualizados
CREATE TABLE IF NOT EXISTS auditoria_actualizacion_ambitos_legales (
    id SERIAL PRIMARY KEY,
    id_materia INTEGER NOT NULL,
    num_categoria INTEGER NOT NULL,
    num_subcategoria INTEGER NOT NULL,
    num_ambito_legal INTEGER NOT NULL,
    nombre_ambito_legal_anterior VARCHAR(200),
    nombre_ambito_legal_nuevo VARCHAR(200),
    habilitado_anterior BOOLEAN,
    habilitado_nuevo BOOLEAN,
    id_materia_anterior INTEGER,
    id_materia_nuevo INTEGER,
    num_categoria_anterior INTEGER,
    num_categoria_nuevo INTEGER,
    num_subcategoria_anterior INTEGER,
    num_subcategoria_nuevo INTEGER,
    num_ambito_legal_anterior INTEGER,
    num_ambito_legal_nuevo INTEGER,
    id_usuario_actualizo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Caracteristicas actualizadas
CREATE TABLE IF NOT EXISTS auditoria_actualizacion_caracteristicas (
    id SERIAL PRIMARY KEY,
    id_tipo_caracteristica INTEGER NOT NULL,
    num_caracteristica INTEGER NOT NULL,
    descripcion_anterior VARCHAR(200),
    descripcion_nuevo VARCHAR(200),
    habilitado_anterior BOOLEAN,
    habilitado_nuevo BOOLEAN,
    id_tipo_caracteristica_anterior INTEGER,
    id_tipo_caracteristica_nuevo INTEGER,
    num_caracteristica_anterior INTEGER,
    num_caracteristica_nuevo INTEGER,
    id_usuario_actualizo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_audit_elim_estados_usuario ON auditoria_eliminacion_estados(id_usuario_elimino);
CREATE INDEX IF NOT EXISTS idx_audit_elim_estados_fecha ON auditoria_eliminacion_estados(fecha_eliminacion);
CREATE INDEX IF NOT EXISTS idx_audit_act_estados_usuario ON auditoria_actualizacion_estados(id_usuario_actualizo);
CREATE INDEX IF NOT EXISTS idx_audit_act_estados_fecha ON auditoria_actualizacion_estados(fecha_actualizacion);

CREATE INDEX IF NOT EXISTS idx_audit_elim_materias_usuario ON auditoria_eliminacion_materias(id_usuario_elimino);
CREATE INDEX IF NOT EXISTS idx_audit_elim_materias_fecha ON auditoria_eliminacion_materias(fecha_eliminacion);
CREATE INDEX IF NOT EXISTS idx_audit_act_materias_usuario ON auditoria_actualizacion_materias(id_usuario_actualizo);
CREATE INDEX IF NOT EXISTS idx_audit_act_materias_fecha ON auditoria_actualizacion_materias(fecha_actualizacion);

CREATE INDEX IF NOT EXISTS idx_audit_elim_niveles_usuario ON auditoria_eliminacion_niveles_educativos(id_usuario_elimino);
CREATE INDEX IF NOT EXISTS idx_audit_elim_niveles_fecha ON auditoria_eliminacion_niveles_educativos(fecha_eliminacion);
CREATE INDEX IF NOT EXISTS idx_audit_act_niveles_usuario ON auditoria_actualizacion_niveles_educativos(id_usuario_actualizo);
CREATE INDEX IF NOT EXISTS idx_audit_act_niveles_fecha ON auditoria_actualizacion_niveles_educativos(fecha_actualizacion);

CREATE INDEX IF NOT EXISTS idx_audit_elim_nucleos_usuario ON auditoria_eliminacion_nucleos(id_usuario_elimino);
CREATE INDEX IF NOT EXISTS idx_audit_elim_nucleos_fecha ON auditoria_eliminacion_nucleos(fecha_eliminacion);
CREATE INDEX IF NOT EXISTS idx_audit_act_nucleos_usuario ON auditoria_actualizacion_nucleos(id_usuario_actualizo);
CREATE INDEX IF NOT EXISTS idx_audit_act_nucleos_fecha ON auditoria_actualizacion_nucleos(fecha_actualizacion);

CREATE INDEX IF NOT EXISTS idx_audit_elim_cond_trabajo_usuario ON auditoria_eliminacion_condiciones_trabajo(id_usuario_elimino);
CREATE INDEX IF NOT EXISTS idx_audit_elim_cond_trabajo_fecha ON auditoria_eliminacion_condiciones_trabajo(fecha_eliminacion);
CREATE INDEX IF NOT EXISTS idx_audit_act_cond_trabajo_usuario ON auditoria_actualizacion_condiciones_trabajo(id_usuario_actualizo);
CREATE INDEX IF NOT EXISTS idx_audit_act_cond_trabajo_fecha ON auditoria_actualizacion_condiciones_trabajo(fecha_actualizacion);

CREATE INDEX IF NOT EXISTS idx_audit_elim_cond_actividad_usuario ON auditoria_eliminacion_condiciones_actividad(id_usuario_elimino);
CREATE INDEX IF NOT EXISTS idx_audit_elim_cond_actividad_fecha ON auditoria_eliminacion_condiciones_actividad(fecha_eliminacion);
CREATE INDEX IF NOT EXISTS idx_audit_act_cond_actividad_usuario ON auditoria_actualizacion_condiciones_actividad(id_usuario_actualizo);
CREATE INDEX IF NOT EXISTS idx_audit_act_cond_actividad_fecha ON auditoria_actualizacion_condiciones_actividad(fecha_actualizacion);

CREATE INDEX IF NOT EXISTS idx_audit_elim_tipos_caract_usuario ON auditoria_eliminacion_tipos_caracteristicas(id_usuario_elimino);
CREATE INDEX IF NOT EXISTS idx_audit_elim_tipos_caract_fecha ON auditoria_eliminacion_tipos_caracteristicas(fecha_eliminacion);
CREATE INDEX IF NOT EXISTS idx_audit_act_tipos_caract_usuario ON auditoria_actualizacion_tipos_caracteristicas(id_usuario_actualizo);
CREATE INDEX IF NOT EXISTS idx_audit_act_tipos_caract_fecha ON auditoria_actualizacion_tipos_caracteristicas(fecha_actualizacion);

CREATE INDEX IF NOT EXISTS idx_audit_elim_semestres_usuario ON auditoria_eliminacion_semestres(id_usuario_elimino);
CREATE INDEX IF NOT EXISTS idx_audit_elim_semestres_fecha ON auditoria_eliminacion_semestres(fecha_eliminacion);
CREATE INDEX IF NOT EXISTS idx_audit_act_semestres_usuario ON auditoria_actualizacion_semestres(id_usuario_actualizo);
CREATE INDEX IF NOT EXISTS idx_audit_act_semestres_fecha ON auditoria_actualizacion_semestres(fecha_actualizacion);

CREATE INDEX IF NOT EXISTS idx_audit_elim_municipios_usuario ON auditoria_eliminacion_municipios(id_usuario_elimino);
CREATE INDEX IF NOT EXISTS idx_audit_elim_municipios_fecha ON auditoria_eliminacion_municipios(fecha_eliminacion);
CREATE INDEX IF NOT EXISTS idx_audit_act_municipios_usuario ON auditoria_actualizacion_municipios(id_usuario_actualizo);
CREATE INDEX IF NOT EXISTS idx_audit_act_municipios_fecha ON auditoria_actualizacion_municipios(fecha_actualizacion);

CREATE INDEX IF NOT EXISTS idx_audit_elim_parroquias_usuario ON auditoria_eliminacion_parroquias(id_usuario_elimino);
CREATE INDEX IF NOT EXISTS idx_audit_elim_parroquias_fecha ON auditoria_eliminacion_parroquias(fecha_eliminacion);
CREATE INDEX IF NOT EXISTS idx_audit_act_parroquias_usuario ON auditoria_actualizacion_parroquias(id_usuario_actualizo);
CREATE INDEX IF NOT EXISTS idx_audit_act_parroquias_fecha ON auditoria_actualizacion_parroquias(fecha_actualizacion);

CREATE INDEX IF NOT EXISTS idx_audit_elim_categorias_usuario ON auditoria_eliminacion_categorias(id_usuario_elimino);
CREATE INDEX IF NOT EXISTS idx_audit_elim_categorias_fecha ON auditoria_eliminacion_categorias(fecha_eliminacion);
CREATE INDEX IF NOT EXISTS idx_audit_act_categorias_usuario ON auditoria_actualizacion_categorias(id_usuario_actualizo);
CREATE INDEX IF NOT EXISTS idx_audit_act_categorias_fecha ON auditoria_actualizacion_categorias(fecha_actualizacion);

CREATE INDEX IF NOT EXISTS idx_audit_elim_subcategorias_usuario ON auditoria_eliminacion_subcategorias(id_usuario_elimino);
CREATE INDEX IF NOT EXISTS idx_audit_elim_subcategorias_fecha ON auditoria_eliminacion_subcategorias(fecha_eliminacion);
CREATE INDEX IF NOT EXISTS idx_audit_act_subcategorias_usuario ON auditoria_actualizacion_subcategorias(id_usuario_actualizo);
CREATE INDEX IF NOT EXISTS idx_audit_act_subcategorias_fecha ON auditoria_actualizacion_subcategorias(fecha_actualizacion);

CREATE INDEX IF NOT EXISTS idx_audit_elim_ambitos_usuario ON auditoria_eliminacion_ambitos_legales(id_usuario_elimino);
CREATE INDEX IF NOT EXISTS idx_audit_elim_ambitos_fecha ON auditoria_eliminacion_ambitos_legales(fecha_eliminacion);
CREATE INDEX IF NOT EXISTS idx_audit_act_ambitos_usuario ON auditoria_actualizacion_ambitos_legales(id_usuario_actualizo);
CREATE INDEX IF NOT EXISTS idx_audit_act_ambitos_fecha ON auditoria_actualizacion_ambitos_legales(fecha_actualizacion);

CREATE INDEX IF NOT EXISTS idx_audit_elim_caracteristicas_usuario ON auditoria_eliminacion_caracteristicas(id_usuario_elimino);
CREATE INDEX IF NOT EXISTS idx_audit_elim_caracteristicas_fecha ON auditoria_eliminacion_caracteristicas(fecha_eliminacion);
CREATE INDEX IF NOT EXISTS idx_audit_act_caracteristicas_usuario ON auditoria_actualizacion_caracteristicas(id_usuario_actualizo);
CREATE INDEX IF NOT EXISTS idx_audit_act_caracteristicas_fecha ON auditoria_actualizacion_caracteristicas(fecha_actualizacion);
