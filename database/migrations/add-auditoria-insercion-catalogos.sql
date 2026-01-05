-- Migración: Agregar tablas de auditoría para inserciones de catálogos
-- Fecha: 2026-01-03
-- Descripción: Crea tablas de auditoría para inserciones (creaciones) de todos los catálogos

-- =========================================================
-- AUDITORÍA DE INSERCIONES DE CATÁLOGOS
-- =========================================================

-- Estados insertados
CREATE TABLE IF NOT EXISTS auditoria_insercion_estados (
    id SERIAL PRIMARY KEY,
    id_estado INTEGER NOT NULL,
    nombre_estado VARCHAR(100) NOT NULL,
    habilitado BOOLEAN,
    id_usuario_creo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Materias insertadas
CREATE TABLE IF NOT EXISTS auditoria_insercion_materias (
    id SERIAL PRIMARY KEY,
    id_materia INTEGER NOT NULL,
    nombre_materia VARCHAR(100) NOT NULL,
    habilitado BOOLEAN,
    id_usuario_creo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Niveles Educativos insertados
CREATE TABLE IF NOT EXISTS auditoria_insercion_niveles_educativos (
    id SERIAL PRIMARY KEY,
    id_nivel_educativo INTEGER NOT NULL,
    descripcion VARCHAR(100) NOT NULL,
    habilitado BOOLEAN,
    id_usuario_creo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Nucleos insertados
CREATE TABLE IF NOT EXISTS auditoria_insercion_nucleos (
    id SERIAL PRIMARY KEY,
    id_nucleo INTEGER NOT NULL,
    nombre_nucleo VARCHAR(100) NOT NULL,
    habilitado BOOLEAN,
    id_estado INTEGER,
    num_municipio INTEGER,
    num_parroquia INTEGER,
    id_usuario_creo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Condiciones Trabajo insertadas
CREATE TABLE IF NOT EXISTS auditoria_insercion_condiciones_trabajo (
    id SERIAL PRIMARY KEY,
    id_trabajo INTEGER NOT NULL,
    nombre_trabajo VARCHAR(100) NOT NULL,
    habilitado BOOLEAN,
    id_usuario_creo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Condiciones Actividad insertadas
CREATE TABLE IF NOT EXISTS auditoria_insercion_condiciones_actividad (
    id SERIAL PRIMARY KEY,
    id_actividad INTEGER NOT NULL,
    nombre_actividad VARCHAR(100) NOT NULL,
    habilitado BOOLEAN,
    id_usuario_creo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Tipos Caracteristicas insertados
CREATE TABLE IF NOT EXISTS auditoria_insercion_tipos_caracteristicas (
    id SERIAL PRIMARY KEY,
    id_tipo INTEGER NOT NULL,
    nombre_tipo_caracteristica VARCHAR(100) NOT NULL,
    habilitado BOOLEAN,
    id_usuario_creo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Semestres insertados
CREATE TABLE IF NOT EXISTS auditoria_insercion_semestres (
    id SERIAL PRIMARY KEY,
    term VARCHAR(20) NOT NULL,
    fecha_inicio DATE,
    fecha_fin DATE,
    habilitado BOOLEAN,
    id_usuario_creo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Municipios insertados
CREATE TABLE IF NOT EXISTS auditoria_insercion_municipios (
    id SERIAL PRIMARY KEY,
    id_estado INTEGER NOT NULL,
    num_municipio INTEGER NOT NULL,
    nombre_municipio VARCHAR(100) NOT NULL,
    habilitado BOOLEAN,
    id_usuario_creo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Parroquias insertadas
CREATE TABLE IF NOT EXISTS auditoria_insercion_parroquias (
    id SERIAL PRIMARY KEY,
    id_estado INTEGER NOT NULL,
    num_municipio INTEGER NOT NULL,
    num_parroquia INTEGER NOT NULL,
    nombre_parroquia VARCHAR(100) NOT NULL,
    habilitado BOOLEAN,
    id_usuario_creo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Categorias insertadas
CREATE TABLE IF NOT EXISTS auditoria_insercion_categorias (
    id SERIAL PRIMARY KEY,
    id_materia INTEGER NOT NULL,
    num_categoria INTEGER NOT NULL,
    nombre_categoria VARCHAR(100) NOT NULL,
    habilitado BOOLEAN,
    id_usuario_creo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Subcategorias insertadas
CREATE TABLE IF NOT EXISTS auditoria_insercion_subcategorias (
    id SERIAL PRIMARY KEY,
    id_materia INTEGER NOT NULL,
    num_categoria INTEGER NOT NULL,
    num_subcategoria INTEGER NOT NULL,
    nombre_subcategoria VARCHAR(100) NOT NULL,
    habilitado BOOLEAN,
    id_usuario_creo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Ambitos Legales insertados
CREATE TABLE IF NOT EXISTS auditoria_insercion_ambitos_legales (
    id SERIAL PRIMARY KEY,
    id_materia INTEGER NOT NULL,
    num_categoria INTEGER NOT NULL,
    num_subcategoria INTEGER NOT NULL,
    num_ambito_legal INTEGER NOT NULL,
    nombre_ambito_legal VARCHAR(100) NOT NULL,
    habilitado BOOLEAN,
    id_usuario_creo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Caracteristicas insertadas
CREATE TABLE IF NOT EXISTS auditoria_insercion_caracteristicas (
    id SERIAL PRIMARY KEY,
    id_tipo_caracteristica INTEGER NOT NULL,
    num_caracteristica INTEGER NOT NULL,
    descripcion TEXT NOT NULL,
    habilitado BOOLEAN,
    id_usuario_creo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);
