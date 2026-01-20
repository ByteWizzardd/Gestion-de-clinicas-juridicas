-- =========================================================
-- BLOQUE 1: CATÁLOGOS GLOBALES (8 Tablas)
-- =========================================================

-- 1) ESTADOS
CREATE TABLE estados (
    id_estado SERIAL PRIMARY KEY,
    nombre_estado VARCHAR(100) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT TRUE
);

-- 1.1) AUDITORÍA DE INSERCIÓN DE ESTADOS
CREATE TABLE auditoria_insercion_estados (
    id SERIAL PRIMARY KEY,
    id_estado INTEGER NOT NULL,
    nombre_estado VARCHAR(100),
    habilitado BOOLEAN,
    id_usuario_creo VARCHAR(20),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 1.2) AUDITORÍA DE ACTUALIZACIÓN DE ESTADOS
CREATE TABLE auditoria_actualizacion_estados (
    id SERIAL PRIMARY KEY,
    id_estado INTEGER NOT NULL,
    nombre_estado_anterior VARCHAR(100),
    nombre_estado_nuevo VARCHAR(100),
    habilitado_anterior BOOLEAN,
    habilitado_nuevo BOOLEAN,
    id_usuario_actualizo VARCHAR(20),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 1.3) AUDITORÍA DE ELIMINACIÓN DE ESTADOS
CREATE TABLE auditoria_eliminacion_estados (
    id SERIAL PRIMARY KEY,
    id_estado INTEGER,
    nombre_estado VARCHAR(100),
    id_usuario_elimino VARCHAR(20),
    motivo TEXT,
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 2) NIVELES EDUCATIVOS
CREATE TABLE niveles_educativos (
    id_nivel_educativo SERIAL PRIMARY KEY,
    descripcion VARCHAR(100) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT TRUE
);

-- 2.1) AUDITORÍA DE INSERCIÓN DE NIVELES EDUCATIVOS
CREATE TABLE auditoria_insercion_niveles_educativos (
    id SERIAL PRIMARY KEY,
    id_nivel_educativo INTEGER NOT NULL,
    descripcion VARCHAR(100),
    habilitado BOOLEAN,
    id_usuario_creo VARCHAR(20),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 2.2) AUDITORÍA DE ACTUALIZACIÓN DE NIVELES EDUCATIVOS
CREATE TABLE auditoria_actualizacion_niveles_educativos (
    id SERIAL PRIMARY KEY,
    id_nivel_educativo INTEGER NOT NULL,
    descripcion_anterior VARCHAR(100),
    descripcion_nuevo VARCHAR(100),
    habilitado_anterior BOOLEAN,
    habilitado_nuevo BOOLEAN,
    id_usuario_actualizo VARCHAR(20),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 2.3) AUDITORÍA DE ELIMINACIÓN DE NIVELES EDUCATIVOS
CREATE TABLE auditoria_eliminacion_niveles_educativos (
    id SERIAL PRIMARY KEY,
    id_nivel_educativo INTEGER,
    descripcion VARCHAR(100),
    id_usuario_elimino VARCHAR(20),
    motivo TEXT,
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 3) CONDICIÓN TRABAJO
CREATE TABLE condicion_trabajo (
    id_trabajo SERIAL PRIMARY KEY,
    nombre_trabajo VARCHAR(100) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT TRUE
);

-- 3.1) AUDITORÍA DE INSERCIÓN DE CONDICIONES DE TRABAJO
CREATE TABLE auditoria_insercion_condiciones_trabajo (
    id SERIAL PRIMARY KEY,
    id_trabajo INTEGER NOT NULL,
    nombre_trabajo VARCHAR(100),
    habilitado BOOLEAN,
    id_usuario_creo VARCHAR(20),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 3.2) AUDITORÍA DE ACTUALIZACIÓN DE CONDICIONES DE TRABAJO
CREATE TABLE auditoria_actualizacion_condiciones_trabajo (
    id SERIAL PRIMARY KEY,
    id_trabajo INTEGER NOT NULL,
    nombre_trabajo_anterior VARCHAR(100),
    nombre_trabajo_nuevo VARCHAR(100),
    habilitado_anterior BOOLEAN,
    habilitado_nuevo BOOLEAN,
    id_usuario_actualizo VARCHAR(20),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 3.3) AUDITORÍA DE ELIMINACIÓN DE CONDICIONES DE TRABAJO
CREATE TABLE auditoria_eliminacion_condiciones_trabajo (
    id SERIAL PRIMARY KEY,
    id_trabajo INTEGER,
    nombre_trabajo VARCHAR(100),
    id_usuario_elimino VARCHAR(20),
    motivo TEXT,
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 4) CONDICIÓN ACTIVIDAD
CREATE TABLE condicion_actividad (
    id_actividad SERIAL PRIMARY KEY,
    nombre_actividad VARCHAR(100) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT TRUE
);

-- 4.1) AUDITORÍA DE INSERCIÓN DE CONDICIONES DE ACTIVIDAD
CREATE TABLE auditoria_insercion_condiciones_actividad (
    id SERIAL PRIMARY KEY,
    id_actividad INTEGER NOT NULL,
    nombre_actividad VARCHAR(100),
    habilitado BOOLEAN,
    id_usuario_creo VARCHAR(20),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 4.2) AUDITORÍA DE ACTUALIZACIÓN DE CONDICIONES DE ACTIVIDAD
CREATE TABLE auditoria_actualizacion_condiciones_actividad (
    id SERIAL PRIMARY KEY,
    id_actividad INTEGER NOT NULL,
    nombre_actividad_anterior VARCHAR(100),
    nombre_actividad_nuevo VARCHAR(100),
    habilitado_anterior BOOLEAN,
    habilitado_nuevo BOOLEAN,
    id_usuario_actualizo VARCHAR(20),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 4.3) AUDITORÍA DE ELIMINACIÓN DE CONDICIONES DE ACTIVIDAD
CREATE TABLE auditoria_eliminacion_condiciones_actividad (
    id SERIAL PRIMARY KEY,
    id_actividad INTEGER,
    nombre_actividad VARCHAR(100),
    id_usuario_elimino VARCHAR(20),
    motivo TEXT,
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 5) TIPO CARACTERÍSTICAS
CREATE TABLE tipo_caracteristicas (
    id_tipo SERIAL PRIMARY KEY,
    nombre_tipo_caracteristica VARCHAR(100) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT TRUE
);

-- 5.1) AUDITORÍA DE INSERCIÓN DE TIPOS DE CARACTERÍSTICAS
CREATE TABLE auditoria_insercion_tipos_caracteristicas (
    id SERIAL PRIMARY KEY,
    id_tipo INTEGER NOT NULL,
    nombre_tipo_caracteristica VARCHAR(100),
    habilitado BOOLEAN,
    id_usuario_creo VARCHAR(20),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 5.2) AUDITORÍA DE ACTUALIZACIÓN DE TIPOS DE CARACTERÍSTICAS
CREATE TABLE auditoria_actualizacion_tipos_caracteristicas (
    id SERIAL PRIMARY KEY,
    id_tipo INTEGER NOT NULL,
    nombre_tipo_caracteristica_anterior VARCHAR(100),
    nombre_tipo_caracteristica_nuevo VARCHAR(100),
    habilitado_anterior BOOLEAN,
    habilitado_nuevo BOOLEAN,
    id_usuario_actualizo VARCHAR(20),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 5.3) AUDITORÍA DE ELIMINACIÓN DE TIPOS DE CARACTERÍSTICAS
CREATE TABLE auditoria_eliminacion_tipos_caracteristicas (
    id SERIAL PRIMARY KEY,
    id_tipo INTEGER,
    nombre_tipo_caracteristica VARCHAR(100),
    id_usuario_elimino VARCHAR(20),
    motivo TEXT,
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);
-- Tipos: tipo_vivienda, material_piso, material_paredes, material_techo, 
--        agua_potable, aseo, eliminacion_aguas_n, artefactos_domesticos

-- 6) MATERIAS
CREATE TABLE materias (
    id_materia SERIAL PRIMARY KEY,
    nombre_materia VARCHAR(100) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT TRUE
);

-- 6.1) AUDITORÍA DE INSERCIÓN DE MATERIAS
CREATE TABLE auditoria_insercion_materias (
    id SERIAL PRIMARY KEY,
    id_materia INTEGER NOT NULL,
    nombre_materia VARCHAR(100),
    habilitado BOOLEAN,
    id_usuario_creo VARCHAR(20),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 6.2) AUDITORÍA DE ACTUALIZACIÓN DE MATERIAS
CREATE TABLE auditoria_actualizacion_materias (
    id SERIAL PRIMARY KEY,
    id_materia INTEGER NOT NULL,
    nombre_materia_anterior VARCHAR(100),
    nombre_materia_nuevo VARCHAR(100),
    habilitado_anterior BOOLEAN,
    habilitado_nuevo BOOLEAN,
    id_usuario_actualizo VARCHAR(20),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 6.3) AUDITORÍA DE ELIMINACIÓN DE MATERIAS
CREATE TABLE auditoria_eliminacion_materias (
    id SERIAL PRIMARY KEY,
    id_materia INTEGER,
    nombre_materia VARCHAR(100),
    id_usuario_elimino VARCHAR(20),
    motivo TEXT,
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 7) SEMESTRES
CREATE TABLE semestres (
    term VARCHAR(20) PRIMARY KEY,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT TRUE,
    CHECK (fecha_fin >= fecha_inicio),
    CHECK (term ~ '^\d{4}-(15|25)$')
);

-- 7.1) AUDITORÍA DE INSERCIÓN DE SEMESTRES
CREATE TABLE auditoria_insercion_semestres (
    id SERIAL PRIMARY KEY,
    term VARCHAR(20) NOT NULL,
    fecha_inicio DATE,
    fecha_fin DATE,
    habilitado BOOLEAN,
    id_usuario_creo VARCHAR(20),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 7.2) AUDITORÍA DE ACTUALIZACIÓN DE SEMESTRES
CREATE TABLE auditoria_actualizacion_semestres (
    id SERIAL PRIMARY KEY,
    term VARCHAR(20) NOT NULL,
    fecha_inicio_anterior DATE,
    fecha_inicio_nuevo DATE,
    fecha_fin_anterior DATE,
    fecha_fin_nuevo DATE,
    habilitado_anterior BOOLEAN,
    habilitado_nuevo BOOLEAN,
    id_usuario_actualizo VARCHAR(20),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 7.3) AUDITORÍA DE ELIMINACIÓN DE SEMESTRES
CREATE TABLE auditoria_eliminacion_semestres (
    id SERIAL PRIMARY KEY,
    term VARCHAR(20),
    id_usuario_elimino VARCHAR(20),
    motivo TEXT,
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 8) USUARIOS
CREATE TABLE usuarios (
    cedula VARCHAR(20) PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo_electronico VARCHAR(100) NOT NULL UNIQUE CHECK (correo_electronico LIKE '%@ucab.edu.ve' OR correo_electronico LIKE '%@est.ucab.edu.ve'),
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    telefono_celular VARCHAR(20),
    habilitado_sistema BOOLEAN NOT NULL DEFAULT TRUE,
    tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('Estudiante', 'Profesor', 'Coordinador'))
);

-- 8.1) AUDITORÍA DE INSERCIÓN DE USUARIOS
CREATE TABLE auditoria_insercion_usuarios (
    id SERIAL PRIMARY KEY,
    cedula VARCHAR(20) NOT NULL,
    nombres VARCHAR(100),
    apellidos VARCHAR(100),
    correo_electronico VARCHAR(100),
    nombre_usuario VARCHAR(50),
    tipo_usuario VARCHAR(20),
    id_usuario_registro VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 8.2) AUDITORÍA DE ACTUALIZACIÓN DE USUARIOS
CREATE TABLE auditoria_actualizacion_usuarios (
    id SERIAL PRIMARY KEY,
    ci_usuario VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    -- Valores anteriores (antes de la actualización)
    nombres_anterior VARCHAR(100),
    apellidos_anterior VARCHAR(100),
    correo_electronico_anterior VARCHAR(100),
    nombre_usuario_anterior VARCHAR(50),
    telefono_celular_anterior VARCHAR(20),
    habilitado_sistema_anterior BOOLEAN,
    tipo_usuario_anterior VARCHAR(20),
    tipo_estudiante_anterior VARCHAR(50),
    tipo_profesor_anterior VARCHAR(20),
    -- Valores nuevos (después de la actualización)
    nombres_nuevo VARCHAR(100),
    apellidos_nuevo VARCHAR(100),
    correo_electronico_nuevo VARCHAR(100),
    nombre_usuario_nuevo VARCHAR(50),
    telefono_celular_nuevo VARCHAR(20),
    habilitado_sistema_nuevo BOOLEAN,
    tipo_usuario_nuevo VARCHAR(20),
    tipo_estudiante_nuevo VARCHAR(50),
    tipo_profesor_nuevo VARCHAR(20),
    -- Información de auditoría
    id_usuario_actualizo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 8.3) AUDITORÍA DE ELIMINACIÓN DE USUARIOS
CREATE TABLE auditoria_eliminacion_usuario (
    id SERIAL PRIMARY KEY,
    usuario_eliminado VARCHAR(20) NOT NULL, -- Cédula del usuario eliminado
    nombres_usuario_eliminado VARCHAR(100), -- Nombre del usuario eliminado (guardado antes de eliminar)
    apellidos_usuario_eliminado VARCHAR(100), -- Apellido del usuario eliminado (guardado antes de eliminar)
    eliminado_por VARCHAR(20) NOT NULL, -- Cédula del usuario que realizó la eliminación
    motivo TEXT NOT NULL, -- Motivo de la eliminación
    fecha TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- =========================================================
-- BLOQUE 2: GEOGRAFÍA (Jerarquía Débil - 3 Tablas)
-- =========================================================

-- 9) MUNICIPIOS
CREATE TABLE municipios (
    id_estado INTEGER NOT NULL,
    num_municipio INTEGER NOT NULL, 
    nombre_municipio VARCHAR(100) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT TRUE,
    
    PRIMARY KEY (id_estado, num_municipio),
    FOREIGN KEY (id_estado) REFERENCES estados(id_estado)
);

-- 9.1) AUDITORÍA DE INSERCIÓN DE MUNICIPIOS
CREATE TABLE auditoria_insercion_municipios (
    id SERIAL PRIMARY KEY,
    id_estado INTEGER NOT NULL,
    num_municipio INTEGER NOT NULL,
    nombre_municipio VARCHAR(100),
    habilitado BOOLEAN,
    id_usuario_creo VARCHAR(20),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 9.2) AUDITORÍA DE ACTUALIZACIÓN DE MUNICIPIOS
CREATE TABLE auditoria_actualizacion_municipios (
    id SERIAL PRIMARY KEY,
    id_estado INTEGER NOT NULL,
    num_municipio INTEGER NOT NULL,
    nombre_municipio_anterior VARCHAR(100),
    nombre_municipio_nuevo VARCHAR(100),
    habilitado_anterior BOOLEAN,
    habilitado_nuevo BOOLEAN,
    id_usuario_actualizo VARCHAR(20),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 9.3) AUDITORÍA DE ELIMINACIÓN DE MUNICIPIOS
CREATE TABLE auditoria_eliminacion_municipios (
    id SERIAL PRIMARY KEY,
    id_estado INTEGER,
    num_municipio INTEGER,
    nombre_municipio VARCHAR(100),
    id_usuario_elimino VARCHAR(20),
    motivo TEXT,
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 10) PARROQUIAS
CREATE TABLE parroquias (
    id_estado INTEGER NOT NULL,
    num_municipio INTEGER NOT NULL,
    num_parroquia INTEGER NOT NULL,
    nombre_parroquia VARCHAR(100) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT TRUE,
    
    PRIMARY KEY (id_estado, num_municipio, num_parroquia),
    FOREIGN KEY (id_estado, num_municipio) REFERENCES municipios(id_estado, num_municipio)
);

-- 10.1) AUDITORÍA DE INSERCIÓN DE PARROQUIAS
CREATE TABLE auditoria_insercion_parroquias (
    id SERIAL PRIMARY KEY,
    id_estado INTEGER NOT NULL,
    num_municipio INTEGER NOT NULL,
    num_parroquia INTEGER NOT NULL,
    nombre_parroquia VARCHAR(100),
    habilitado BOOLEAN,
    id_usuario_creo VARCHAR(20),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 10.2) AUDITORÍA DE ACTUALIZACIÓN DE PARROQUIAS
CREATE TABLE auditoria_actualizacion_parroquias (
    id SERIAL PRIMARY KEY,
    id_estado INTEGER NOT NULL,
    num_municipio INTEGER NOT NULL,
    num_parroquia INTEGER NOT NULL,
    nombre_parroquia_anterior VARCHAR(100),
    nombre_parroquia_nuevo VARCHAR(100),
    habilitado_anterior BOOLEAN,
    habilitado_nuevo BOOLEAN,
    id_usuario_actualizo VARCHAR(20),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 10.3) AUDITORÍA DE ELIMINACIÓN DE PARROQUIAS
CREATE TABLE auditoria_eliminacion_parroquias (
    id SERIAL PRIMARY KEY,
    id_estado INTEGER,
    num_municipio INTEGER,
    num_parroquia INTEGER,
    nombre_parroquia VARCHAR(100),
    id_usuario_elimino VARCHAR(20),
    motivo TEXT,
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 11) NÚCLEOS
CREATE TABLE nucleos (
    id_nucleo SERIAL PRIMARY KEY,
    nombre_nucleo VARCHAR(100) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT TRUE,
    
    id_estado INTEGER NOT NULL,
    num_municipio INTEGER NOT NULL,
    num_parroquia INTEGER NOT NULL,
    
    FOREIGN KEY (id_estado, num_municipio, num_parroquia) 
    REFERENCES parroquias(id_estado, num_municipio, num_parroquia)
);

-- 11.1) AUDITORÍA DE INSERCIÓN DE NÚCLEOS
CREATE TABLE auditoria_insercion_nucleos (
    id SERIAL PRIMARY KEY,
    id_nucleo INTEGER NOT NULL,
    nombre_nucleo VARCHAR(100),
    habilitado BOOLEAN,
    id_estado INTEGER,
    num_municipio INTEGER,
    num_parroquia INTEGER,
    id_usuario_creo VARCHAR(20),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 11.2) AUDITORÍA DE ACTUALIZACIÓN DE NÚCLEOS
CREATE TABLE auditoria_actualizacion_nucleos (
    id SERIAL PRIMARY KEY,
    id_nucleo INTEGER NOT NULL,
    nombre_nucleo_anterior VARCHAR(100),
    nombre_nucleo_nuevo VARCHAR(100),
    habilitado_anterior BOOLEAN,
    habilitado_nuevo BOOLEAN,
    id_estado_anterior INTEGER,
    num_municipio_anterior INTEGER,
    num_parroquia_anterior INTEGER,
    id_estado_nuevo INTEGER,
    num_municipio_nuevo INTEGER,
    num_parroquia_nuevo INTEGER,
    id_usuario_actualizo VARCHAR(20),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 11.3) AUDITORÍA DE ELIMINACIÓN DE NÚCLEOS
CREATE TABLE auditoria_eliminacion_nucleos (
    id SERIAL PRIMARY KEY,
    id_nucleo INTEGER,
    nombre_nucleo VARCHAR(100),
    id_usuario_elimino VARCHAR(20),
    motivo TEXT,
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- =========================================================
-- BLOQUE 3: SOLICITANTES (3 Tablas)
-- =========================================================

-- 12) SOLICITANTES
CREATE TABLE solicitantes (
    cedula VARCHAR(20) PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL CHECK (fecha_nacimiento <= CURRENT_DATE),
    telefono_local VARCHAR(20),
    telefono_celular VARCHAR(20) NOT NULL,
    correo_electronico VARCHAR(100) NOT NULL UNIQUE,
    
    sexo VARCHAR(20) NOT NULL CHECK (sexo IN ('M', 'F')),
    nacionalidad VARCHAR(20) NOT NULL CHECK (nacionalidad IN ('V', 'E')),
    estado_civil VARCHAR(20) NOT NULL CHECK (estado_civil IN ('Soltero', 'Casado', 'Divorciado', 'Viudo')),
    
    concubinato BOOLEAN NOT NULL,
    tipo_tiempo_estudio VARCHAR(20) CHECK (tipo_tiempo_estudio IN ('Años', 'Semestres', 'Trimestres')),
    tiempo_estudio INTEGER CHECK (tiempo_estudio >= 0),
    
    id_nivel_educativo INTEGER NOT NULL REFERENCES niveles_educativos(id_nivel_educativo),
    id_trabajo INTEGER REFERENCES condicion_trabajo(id_trabajo),
    id_actividad INTEGER REFERENCES condicion_actividad(id_actividad),
    
    id_estado INTEGER NOT NULL,
    num_municipio INTEGER NOT NULL,
    num_parroquia INTEGER NOT NULL,
    direccion_habitacion VARCHAR(500),
    
    FOREIGN KEY (id_estado, num_municipio, num_parroquia) 
    REFERENCES parroquias(id_estado, num_municipio, num_parroquia)
);

-- 12.1) AUDITORÍA DE INSERCIÓN DE SOLICITANTES
CREATE TABLE auditoria_insercion_solicitantes (
    id SERIAL PRIMARY KEY,
    cedula VARCHAR(20) NOT NULL,
    nombres VARCHAR(100),
    apellidos VARCHAR(100),
    fecha_nacimiento DATE,
    telefono_celular VARCHAR(20),
    correo_electronico VARCHAR(100),
    id_usuario_registro VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 12.2) AUDITORÍA DE ACTUALIZACIÓN DE SOLICITANTES
CREATE TABLE auditoria_actualizacion_solicitantes (
    id SERIAL PRIMARY KEY,
    cedula_solicitante VARCHAR(20) NOT NULL,
    -- Anterior
    nombres_anterior VARCHAR(100),
    apellidos_anterior VARCHAR(100),
    fecha_nacimiento_anterior DATE,
    telefono_local_anterior VARCHAR(20),
    telefono_celular_anterior VARCHAR(20),
    correo_electronico_anterior VARCHAR(100),
    sexo_anterior VARCHAR(20),
    nacionalidad_anterior VARCHAR(20),
    estado_civil_anterior VARCHAR(20),
    concubinato_anterior BOOLEAN,
    tipo_tiempo_estudio_anterior VARCHAR(20),
    tiempo_estudio_anterior INTEGER,
    id_nivel_educativo_anterior INTEGER,
    id_trabajo_anterior INTEGER,
    id_actividad_anterior INTEGER,
    id_estado_anterior INTEGER,
    num_municipio_anterior INTEGER,
    num_parroquia_anterior INTEGER,
    -- Nuevo
    nombres_nuevo VARCHAR(100),
    apellidos_nuevo VARCHAR(100),
    fecha_nacimiento_nuevo DATE,
    telefono_local_nuevo VARCHAR(20),
    telefono_celular_nuevo VARCHAR(20),
    correo_electronico_nuevo VARCHAR(100),
    sexo_nuevo VARCHAR(20),
    nacionalidad_nuevo VARCHAR(20),
    estado_civil_nuevo VARCHAR(20),
    concubinato_nuevo BOOLEAN,
    tipo_tiempo_estudio_nuevo VARCHAR(20),
    tiempo_estudio_nuevo INTEGER,
    id_nivel_educativo_nuevo INTEGER,
    id_trabajo_nuevo INTEGER,
    id_actividad_nuevo INTEGER,
    id_estado_nuevo INTEGER,
    num_municipio_nuevo INTEGER,
    num_parroquia_nuevo INTEGER,
    
    id_usuario_actualizo VARCHAR(20),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 12.3) AUDITORÍA DE ELIMINACIÓN DE SOLICITANTES
CREATE TABLE auditoria_eliminacion_solicitantes (
    id SERIAL PRIMARY KEY,
    cedula VARCHAR(20) NOT NULL,
    nombres VARCHAR(100),
    apellidos VARCHAR(100),
    id_usuario_elimino VARCHAR(20),
    motivo TEXT,
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 13) VIVIENDAS
CREATE TABLE viviendas (
    cedula_solicitante VARCHAR(20) PRIMARY KEY,
    cant_habitaciones INTEGER NOT NULL CHECK (cant_habitaciones >= 0),
    cant_banos INTEGER NOT NULL CHECK (cant_banos >= 0),
    FOREIGN KEY (cedula_solicitante) REFERENCES solicitantes(cedula)
);

-- 31) ASIGNADAS_A (Relación entre Viviendas y Características)
CREATE TABLE asignadas_a (
    cedula_solicitante VARCHAR(20) NOT NULL,
    id_tipo_caracteristica INTEGER NOT NULL,
    num_caracteristica INTEGER NOT NULL,
    
    PRIMARY KEY (cedula_solicitante, id_tipo_caracteristica, num_caracteristica),
    FOREIGN KEY (cedula_solicitante) REFERENCES viviendas(cedula_solicitante),
    FOREIGN KEY (id_tipo_caracteristica, num_caracteristica) 
        REFERENCES caracteristicas(id_tipo_caracteristica, num_caracteristica)
);

-- 14) FAMILIAS Y HOGARES
CREATE TABLE familias_y_hogares (
    cedula_solicitante VARCHAR(20) PRIMARY KEY,
    cant_personas INTEGER NOT NULL CHECK (cant_personas >= 1),
    cant_trabajadores INTEGER NOT NULL CHECK (cant_trabajadores >= 0),
    cant_no_trabajadores INTEGER NOT NULL CHECK (cant_no_trabajadores >= 0),
    cant_ninos INTEGER NOT NULL CHECK (cant_ninos >= 0),
    cant_ninos_estudiando INTEGER NOT NULL CHECK (cant_ninos_estudiando >= 0),
    
    jefe_hogar BOOLEAN NOT NULL, 
    
    ingresos_mensuales DECIMAL(10,2) NOT NULL CHECK (ingresos_mensuales >= 0),
    tipo_tiempo_estudio_jefe VARCHAR(20) CHECK (tipo_tiempo_estudio_jefe IN ('Años', 'Semestres', 'Trimestres')),
    tiempo_estudio_jefe INTEGER CHECK (tiempo_estudio_jefe >= 0),
    id_nivel_educativo_jefe INTEGER REFERENCES niveles_educativos(id_nivel_educativo),
    FOREIGN KEY (cedula_solicitante) REFERENCES solicitantes(cedula),
    
    -- Validaciones de relación entre campos (deben estar a nivel de tabla)
    CHECK (cant_ninos_estudiando <= cant_ninos),
    CHECK (cant_ninos < cant_personas),
    CHECK (cant_trabajadores <= cant_personas)
);

-- =========================================================
-- BLOQUE 4: ACADÉMICO Y LEGAL (Jerarquías - 7 Tablas)
-- =========================================================

-- 15) CARACTERÍSTICAS
CREATE TABLE caracteristicas (
    id_tipo_caracteristica INTEGER NOT NULL,
    num_caracteristica INTEGER NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT TRUE,
    descripcion VARCHAR(200) NOT NULL,
    PRIMARY KEY (id_tipo_caracteristica, num_caracteristica),
    FOREIGN KEY (id_tipo_caracteristica) REFERENCES tipo_caracteristicas(id_tipo)
);

-- 15.1) AUDITORÍA DE INSERCIÓN DE CARACTERÍSTICAS
CREATE TABLE auditoria_insercion_caracteristicas (
    id SERIAL PRIMARY KEY,
    id_tipo_caracteristica INTEGER NOT NULL,
    num_caracteristica INTEGER NOT NULL,
    descripcion VARCHAR(200),
    habilitado BOOLEAN,
    id_usuario_creo VARCHAR(20),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 15.2) AUDITORÍA DE ACTUALIZACIÓN DE CARACTERÍSTICAS
CREATE TABLE auditoria_actualizacion_caracteristicas (
    id SERIAL PRIMARY KEY,
    id_tipo_caracteristica INTEGER NOT NULL,
    num_caracteristica INTEGER NOT NULL,
    descripcion_anterior VARCHAR(200),
    descripcion_nuevo VARCHAR(200),
    habilitado_anterior BOOLEAN,
    habilitado_nuevo BOOLEAN,
    id_usuario_actualizo VARCHAR(20),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 15.3) AUDITORÍA DE ELIMINACIÓN DE CARACTERÍSTICAS
CREATE TABLE auditoria_eliminacion_caracteristicas (
    id SERIAL PRIMARY KEY,
    id_tipo_caracteristica INTEGER,
    num_caracteristica INTEGER,
    descripcion VARCHAR(200),
    id_usuario_elimino VARCHAR(20),
    motivo TEXT,
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 16) CATEGORÍAS
CREATE TABLE categorias (
    id_materia INTEGER NOT NULL,
    num_categoria INTEGER NOT NULL,
    nombre_categoria VARCHAR(100) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id_materia, num_categoria),
    FOREIGN KEY (id_materia) REFERENCES materias(id_materia)
);

-- 16.1) AUDITORÍA DE INSERCIÓN DE CATEGORÍAS
CREATE TABLE auditoria_insercion_categorias (
    id SERIAL PRIMARY KEY,
    id_materia INTEGER NOT NULL,
    num_categoria INTEGER NOT NULL,
    nombre_categoria VARCHAR(100),
    habilitado BOOLEAN,
    id_usuario_creo VARCHAR(20),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 16.2) AUDITORÍA DE ACTUALIZACIÓN DE CATEGORÍAS
CREATE TABLE auditoria_actualizacion_categorias (
    id SERIAL PRIMARY KEY,
    id_materia INTEGER NOT NULL,
    num_categoria INTEGER NOT NULL,
    nombre_categoria_anterior VARCHAR(100),
    nombre_categoria_nuevo VARCHAR(100),
    habilitado_anterior BOOLEAN,
    habilitado_nuevo BOOLEAN,
    id_usuario_actualizo VARCHAR(20),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 16.3) AUDITORÍA DE ELIMINACIÓN DE CATEGORÍAS
CREATE TABLE auditoria_eliminacion_categorias (
    id SERIAL PRIMARY KEY,
    id_materia INTEGER,
    num_categoria INTEGER,
    nombre_categoria VARCHAR(100),
    id_usuario_elimino VARCHAR(20),
    motivo TEXT,
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 17) SUBCATEGORÍAS
CREATE TABLE subcategorias (
    id_materia INTEGER NOT NULL,
    num_categoria INTEGER NOT NULL,
    num_subcategoria INTEGER NOT NULL,
    nombre_subcategoria VARCHAR(100) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id_materia, num_categoria, num_subcategoria),
    FOREIGN KEY (id_materia, num_categoria) REFERENCES categorias(id_materia, num_categoria)
);

-- 17.1) AUDITORÍA DE INSERCIÓN DE SUBCATEGORÍAS
CREATE TABLE auditoria_insercion_subcategorias (
    id SERIAL PRIMARY KEY,
    id_materia INTEGER NOT NULL,
    num_categoria INTEGER NOT NULL,
    num_subcategoria INTEGER NOT NULL,
    nombre_subcategoria VARCHAR(100),
    habilitado BOOLEAN,
    id_usuario_creo VARCHAR(20),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 17.2) AUDITORÍA DE ACTUALIZACIÓN DE SUBCATEGORÍAS
CREATE TABLE auditoria_actualizacion_subcategorias (
    id SERIAL PRIMARY KEY,
    id_materia INTEGER NOT NULL,
    num_categoria INTEGER NOT NULL,
    num_subcategoria INTEGER NOT NULL,
    nombre_subcategoria_anterior VARCHAR(100),
    nombre_subcategoria_nuevo VARCHAR(100),
    habilitado_anterior BOOLEAN,
    habilitado_nuevo BOOLEAN,
    id_usuario_actualizo VARCHAR(20),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 17.3) AUDITORÍA DE ELIMINACIÓN DE SUBCATEGORÍAS
CREATE TABLE auditoria_eliminacion_subcategorias (
    id SERIAL PRIMARY KEY,
    id_materia INTEGER,
    num_categoria INTEGER,
    num_subcategoria INTEGER,
    nombre_subcategoria VARCHAR(100),
    id_usuario_elimino VARCHAR(20),
    motivo TEXT,
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 18) ÁMBITOS LEGALES
CREATE TABLE ambitos_legales (
    id_materia INTEGER NOT NULL,
    num_categoria INTEGER NOT NULL,
    num_subcategoria INTEGER NOT NULL,
    num_ambito_legal INTEGER NOT NULL,
    nombre_ambito_legal VARCHAR(200) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id_materia, num_categoria, num_subcategoria, num_ambito_legal),
    FOREIGN KEY (id_materia, num_categoria, num_subcategoria) 
    REFERENCES subcategorias(id_materia, num_categoria, num_subcategoria)
);

-- 18.1) AUDITORÍA DE INSERCIÓN DE ÁMBITOS LEGALES
CREATE TABLE auditoria_insercion_ambitos_legales (
    id SERIAL PRIMARY KEY,
    id_materia INTEGER NOT NULL,
    num_categoria INTEGER NOT NULL,
    num_subcategoria INTEGER NOT NULL,
    num_ambito_legal INTEGER NOT NULL,
    nombre_ambito_legal VARCHAR(200),
    habilitado BOOLEAN,
    id_usuario_creo VARCHAR(20),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 18.2) AUDITORÍA DE ACTUALIZACIÓN DE ÁMBITOS LEGALES
CREATE TABLE auditoria_actualizacion_ambitos_legales (
    id SERIAL PRIMARY KEY,
    id_materia INTEGER NOT NULL,
    num_categoria INTEGER NOT NULL,
    num_subcategoria INTEGER NOT NULL,
    num_ambito_legal INTEGER NOT NULL,
    nombre_ambito_legal_anterior VARCHAR(200),
    nombre_ambito_legal_nuevo VARCHAR(200),
    habilitado_anterior BOOLEAN,
    habilitado_nuevo BOOLEAN,
    id_usuario_actualizo VARCHAR(20),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 18.3) AUDITORÍA DE ELIMINACIÓN DE ÁMBITOS LEGALES
CREATE TABLE auditoria_eliminacion_ambitos_legales (
    id SERIAL PRIMARY KEY,
    id_materia INTEGER,
    num_categoria INTEGER,
    num_subcategoria INTEGER,
    num_ambito_legal INTEGER,
    nombre_ambito_legal VARCHAR(200),
    id_usuario_elimino VARCHAR(20),
    motivo TEXT,
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 19) COORDINADORES
CREATE TABLE coordinadores (
    id_coordinador VARCHAR(20) PRIMARY KEY,
    term VARCHAR(20) NOT NULL,
    FOREIGN KEY (term) REFERENCES semestres(term),
    FOREIGN KEY (id_coordinador) REFERENCES usuarios(cedula)
);

-- 20) ESTUDIANTES
CREATE TABLE estudiantes (
    term VARCHAR(20) NOT NULL,
    cedula_estudiante VARCHAR(20) NOT NULL,
    tipo_estudiante VARCHAR(50) NOT NULL CHECK (tipo_estudiante IN ('Voluntario', 'Inscrito', 'Egresado', 'Servicio Comunitario')),
    nrc VARCHAR(20) NOT NULL,
    PRIMARY KEY (term, cedula_estudiante),
    FOREIGN KEY (term) REFERENCES semestres(term),
    FOREIGN KEY (cedula_estudiante) REFERENCES usuarios(cedula)
);

-- 20.1) AUDITORÍA DE INSERCIÓN DE ESTUDIANTES
CREATE TABLE auditoria_insercion_estudiantes (
    id SERIAL PRIMARY KEY,
    term VARCHAR(20) NOT NULL,
    cedula_estudiante VARCHAR(20) NOT NULL,
    tipo_estudiante VARCHAR(50),
    nrc VARCHAR(20),
    id_usuario_creo VARCHAR(20),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 21) PROFESORES
CREATE TABLE profesores (
    term VARCHAR(20) NOT NULL,
    cedula_profesor VARCHAR(20) NOT NULL,
    tipo_profesor VARCHAR(50) NOT NULL CHECK (tipo_profesor IN ('Voluntario', 'Asesor')),
    PRIMARY KEY (term, cedula_profesor),
    FOREIGN KEY (term) REFERENCES semestres(term),
    FOREIGN KEY (cedula_profesor) REFERENCES usuarios(cedula)
);

-- 21.1) AUDITORÍA DE INSERCIÓN DE PROFESORES
CREATE TABLE auditoria_insercion_profesores (
    id SERIAL PRIMARY KEY,
    term VARCHAR(20) NOT NULL,
    cedula_profesor VARCHAR(20) NOT NULL,
    tipo_profesor VARCHAR(50),
    id_usuario_creo VARCHAR(20),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- =========================================================
-- BLOQUE 5: CASOS Y OPERACIONES (8 Tablas)
-- =========================================================

-- 22) CASOS
CREATE TABLE casos (
    id_caso SERIAL PRIMARY KEY,
    fecha_solicitud DATE NOT NULL DEFAULT CURRENT_DATE CHECK (fecha_solicitud <= CURRENT_DATE),
    fecha_inicio_caso DATE NOT NULL CHECK (fecha_inicio_caso <= CURRENT_DATE),
    fecha_fin_caso DATE,
    
    tramite VARCHAR(200) NOT NULL CHECK (tramite IN ('Asesoría', 'Conciliación y Mediación', 'Redacción documentos y/o convenio', 'Asistencia Judicial - Casos externos')),
    
    observaciones TEXT,
    
    id_nucleo INTEGER NOT NULL REFERENCES nucleos(id_nucleo),
    cedula VARCHAR(20) NOT NULL REFERENCES solicitantes(cedula),
    
    id_materia INTEGER NOT NULL,
    num_categoria INTEGER NOT NULL,
    num_subcategoria INTEGER NOT NULL,
    num_ambito_legal INTEGER NOT NULL,
    
    FOREIGN KEY (id_materia, num_categoria, num_subcategoria, num_ambito_legal)
    CONSTRAINT chk_casos_inicio_post_solicitud CHECK (fecha_inicio_caso >= fecha_solicitud),
    CONSTRAINT chk_casos_fin_post_inicio CHECK (fecha_fin_caso IS NULL OR fecha_fin_caso >= fecha_inicio_caso)
);

-- 22.1) AUDITORÍA DE INSERCIÓN DE CASOS
CREATE TABLE auditoria_insercion_casos (
    id SERIAL PRIMARY KEY,
    id_caso INTEGER NOT NULL,
    fecha_solicitud DATE,
    tramite VARCHAR(200),
    observaciones TEXT,
    id_nucleo INTEGER,
    cedula_solicitante VARCHAR(20),
    id_materia INTEGER,
    num_categoria INTEGER,
    num_subcategoria INTEGER,
    num_ambito_legal INTEGER,
    id_usuario_registro VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 22.2) AUDITORÍA DE ACTUALIZACIÓN DE CASOS
CREATE TABLE auditoria_actualizacion_casos (
    id SERIAL PRIMARY KEY,
    id_caso INTEGER NOT NULL,
    -- Valores anteriores
    fecha_solicitud_anterior DATE,
    tramite_anterior VARCHAR(200),
    observaciones_anterior TEXT,
    id_nucleo_anterior INTEGER,
    cedula_solicitante_anterior VARCHAR(20),
    id_materia_anterior INTEGER,
    num_categoria_anterior INTEGER,
    num_subcategoria_anterior INTEGER,
    num_ambito_legal_anterior INTEGER,
    -- Valores nuevos
    fecha_solicitud_nuevo DATE,
    tramite_nuevo VARCHAR(200),
    observaciones_nuevo TEXT,
    id_nucleo_nuevo INTEGER,
    cedula_solicitante_nuevo VARCHAR(20),
    id_materia_nuevo INTEGER,
    num_categoria_nuevo INTEGER,
    num_subcategoria_nuevo INTEGER,
    num_ambito_legal_nuevo INTEGER,
    
    id_usuario_actualizo VARCHAR(20),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 22.3) AUDITORÍA DE ELIMINACIÓN DE CASOS
CREATE TABLE auditoria_eliminacion_casos (
    id SERIAL PRIMARY KEY,
    id_caso INTEGER NOT NULL,
    cedula_solicitante VARCHAR(20),
    tramite VARCHAR(200),
    fecha_solicitud DATE,
    id_usuario_elimino VARCHAR(20),
    motivo TEXT,
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 22.4) AUDITORÍA DE INSERCIÓN/ACTUALIZACIÓN EQUIPO Y MIEMBROS
CREATE TABLE auditoria_actualizacion_equipo (
    id SERIAL PRIMARY KEY,
    id_caso INTEGER NOT NULL,
    id_usuario_responsable VARCHAR(20),
    fecha_cambio TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas'),
    tipo_cambio VARCHAR(50) -- 'equipo-actualizado'
);

-- Tablas hijas para detalle de equipo
CREATE TABLE auditoria_actualizacion_equipo_anterior (
    id SERIAL PRIMARY KEY,
    id_auditoria INTEGER REFERENCES auditoria_actualizacion_equipo(id) ON DELETE CASCADE,
    id_miembro VARCHAR(20),
    rol VARCHAR(50) -- 'estudiante', 'profesor'
);

CREATE TABLE auditoria_actualizacion_equipo_nuevo (
    id SERIAL PRIMARY KEY,
    id_auditoria INTEGER REFERENCES auditoria_actualizacion_equipo(id) ON DELETE CASCADE,
    id_miembro VARCHAR(20),
    rol VARCHAR(50)
);

-- 23) CITAS
CREATE TABLE citas (
    num_cita INTEGER NOT NULL,
    id_caso INTEGER NOT NULL REFERENCES casos(id_caso),
    fecha_proxima_cita DATE,
    fecha_encuentro DATE NOT NULL,
    orientacion TEXT NOT NULL,
    id_usuario_registro VARCHAR(20) REFERENCES usuarios(cedula),
    PRIMARY KEY (num_cita, id_caso),
    CHECK (fecha_proxima_cita IS NULL OR fecha_proxima_cita > fecha_encuentro)
);

-- 23.1) AUDITORÍA DE INSERCIÓN DE CITAS
CREATE TABLE auditoria_insercion_citas (
    id SERIAL PRIMARY KEY,
    num_cita INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    fecha_encuentro DATE NOT NULL,
    fecha_proxima_cita DATE,
    orientacion TEXT,
    id_usuario_registro VARCHAR(20),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 23.2) AUDITORÍA DE ACTUALIZACIÓN DE CITAS
CREATE TABLE auditoria_actualizacion_citas (
    id SERIAL PRIMARY KEY,
    num_cita INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    -- Valores anteriores (antes de la actualización)
    fecha_encuentro_anterior DATE,
    fecha_proxima_cita_anterior DATE,
    orientacion_anterior TEXT,
    -- Valores nuevos (después de la actualización)
    fecha_encuentro_nueva DATE,
    fecha_proxima_cita_nueva DATE,
    orientacion_nueva TEXT,
    -- Información de auditoría
    id_usuario_actualizo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 23.3) AUDITORÍA DE ELIMINACIÓN DE CITAS
CREATE TABLE auditoria_eliminacion_citas (
    id SERIAL PRIMARY KEY,
    num_cita INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    fecha_encuentro DATE NOT NULL,
    fecha_proxima_cita DATE,
    orientacion TEXT NOT NULL,
    id_usuario_registro VARCHAR(20) REFERENCES usuarios(cedula), -- Usuario que registró la cita originalmente
    id_usuario_elimino VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    motivo TEXT, -- Motivo de la eliminación
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 30) ATIENDEN
CREATE TABLE atienden (
    id_usuario VARCHAR(20) NOT NULL,
    num_cita INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE CHECK (fecha_registro <= CURRENT_DATE),
    
    PRIMARY KEY (num_cita, id_caso, id_usuario),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(cedula),
    FOREIGN KEY (num_cita, id_caso) REFERENCES citas(num_cita, id_caso)
);

-- 24) ACCIONES
CREATE TABLE acciones (
    num_accion INTEGER NOT NULL,
    id_caso INTEGER NOT NULL REFERENCES casos(id_caso),
    detalle_accion TEXT NOT NULL,
    comentario TEXT,
    id_usuario_registra VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE CHECK (fecha_registro <= CURRENT_DATE),
    PRIMARY KEY (num_accion, id_caso)
);

-- 24.1) AUDITORÍA DE INSERCIÓN DE ACCIONES
CREATE TABLE auditoria_insercion_acciones (
    id SERIAL PRIMARY KEY,
    num_accion INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    detalle_accion TEXT NOT NULL,
    comentario TEXT,
    id_usuario_registra VARCHAR(20),
    fecha_registro DATE,
    id_usuario_creo VARCHAR(20),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 24.1.1) EJECUTORES DE AUDITORÍA DE INSERCIÓN DE ACCIONES
CREATE TABLE auditoria_insercion_acciones_ejecutores (
    id SERIAL PRIMARY KEY,
    id_auditoria_insercion INTEGER NOT NULL REFERENCES auditoria_insercion_acciones(id) ON DELETE CASCADE,
    id_usuario_ejecutor VARCHAR(20) NOT NULL,
    nombres_ejecutor VARCHAR(100),
    apellidos_ejecutor VARCHAR(100),
    fecha_ejecucion DATE
);

-- 24.2) AUDITORÍA DE ACTUALIZACIÓN DE ACCIONES
CREATE TABLE auditoria_actualizacion_acciones (
    id SERIAL PRIMARY KEY,
    num_accion INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    -- Valores anteriores
    detalle_accion_anterior TEXT,
    comentario_anterior TEXT,
    id_usuario_registra_anterior VARCHAR(20),
    fecha_registro_anterior DATE,
    -- Valores nuevos
    detalle_accion_nuevo TEXT,
    comentario_nuevo TEXT,
    id_usuario_registra_nuevo VARCHAR(20),
    fecha_registro_nuevo DATE,
    -- Información de auditoría
    id_usuario_actualizo VARCHAR(20),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 24.2.1) EJECUTORES ANTERIORES DE AUDITORÍA DE ACTUALIZACIÓN
CREATE TABLE auditoria_actualizacion_acciones_ejecutores (
    id SERIAL PRIMARY KEY,
    id_auditoria_actualizacion INTEGER NOT NULL REFERENCES auditoria_actualizacion_acciones(id) ON DELETE CASCADE,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('anterior', 'nuevo')),
    id_usuario_ejecutor VARCHAR(20) NOT NULL,
    nombres_ejecutor VARCHAR(100),
    apellidos_ejecutor VARCHAR(100),
    fecha_ejecucion DATE
);

-- 24.3) AUDITORÍA DE ELIMINACIÓN DE ACCIONES
CREATE TABLE auditoria_eliminacion_acciones (
    id SERIAL PRIMARY KEY,
    num_accion INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    detalle_accion TEXT,
    comentario TEXT,
    id_usuario_registra VARCHAR(20),
    fecha_registro DATE,
    eliminado_por VARCHAR(20),
    motivo TEXT NOT NULL DEFAULT 'Sin motivo especificado',
    fecha TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 24.3.1) EJECUTORES DE AUDITORÍA DE ELIMINACIÓN DE ACCIONES
CREATE TABLE auditoria_eliminacion_acciones_ejecutores (
    id SERIAL PRIMARY KEY,
    id_auditoria_eliminacion INTEGER NOT NULL REFERENCES auditoria_eliminacion_acciones(id) ON DELETE CASCADE,
    id_usuario_ejecutor VARCHAR(20) NOT NULL,
    nombres_ejecutor VARCHAR(100),
    apellidos_ejecutor VARCHAR(100),
    fecha_ejecucion DATE
);

-- 32) EJECUTAN (Relación entre Usuarios y Acciones)
CREATE TABLE ejecutan (
    id_usuario_ejecuta VARCHAR(20) NOT NULL,
    num_accion INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    fecha_ejecucion DATE NOT NULL DEFAULT CURRENT_DATE CHECK (fecha_ejecucion <= CURRENT_DATE),
    
    PRIMARY KEY (id_usuario_ejecuta, num_accion, id_caso),
    FOREIGN KEY (id_usuario_ejecuta) REFERENCES usuarios(cedula),
    FOREIGN KEY (num_accion, id_caso) REFERENCES acciones(num_accion, id_caso)
);

-- 25) CAMBIO ESTATUS
CREATE TABLE cambio_estatus (
    num_cambio INTEGER NOT NULL,
    id_caso INTEGER NOT NULL REFERENCES casos(id_caso),
    motivo TEXT,
    nuevo_estatus VARCHAR(50) NOT NULL CHECK (nuevo_estatus IN ('En proceso', 'Archivado', 'Entregado', 'Asesoría')),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE CHECK (fecha <= CURRENT_DATE),
    id_usuario_cambia VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    PRIMARY KEY (num_cambio, id_caso)
);

-- 26) SOPORTES
CREATE TABLE soportes (
    num_soporte INTEGER NOT NULL,
    id_caso INTEGER NOT NULL REFERENCES casos(id_caso),
    
    documento_data BYTEA, -- Almacena el archivo directamente en la base de datos
    nombre_archivo VARCHAR(150) NOT NULL,
    tipo_mime VARCHAR(100) NOT NULL,
    descripcion TEXT,
    
    fecha_consignacion DATE NOT NULL DEFAULT CURRENT_DATE CHECK (fecha_consignacion <= CURRENT_DATE),
    
    -- Campos de auditoría: quién subió el archivo
    id_usuario_subio VARCHAR(20) REFERENCES usuarios(cedula),
    
    PRIMARY KEY (num_soporte, id_caso)
);

-- 26.1) AUDITORÍA DE INSERCIÓN DE SOPORTES
CREATE TABLE auditoria_insercion_soportes (
    id SERIAL PRIMARY KEY,
    num_soporte INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    nombre_archivo VARCHAR(150),
    tipo_mime VARCHAR(100),
    descripcion TEXT,
    id_usuario_subio VARCHAR(20),
    fecha_consignacion DATE NOT NULL,
    fecha_registro TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 26.2) AUDITORÍA DE ELIMINACIÓN DE SOPORTES
CREATE TABLE auditoria_eliminacion_soportes (
    id SERIAL PRIMARY KEY,
    num_soporte INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    nombre_archivo VARCHAR(150) NOT NULL,
    tipo_mime VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_consignacion DATE NOT NULL,
    tamano_bytes INTEGER, -- Tamaño del archivo en bytes (sin guardar el archivo)
    id_usuario_subio VARCHAR(20) REFERENCES usuarios(cedula),
    id_usuario_elimino VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    motivo TEXT, -- Motivo de la eliminación
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 27) BENEFICIARIOS (PARENTESCO LIBRE)
CREATE TABLE beneficiarios (
    num_beneficiario INTEGER NOT NULL,
    id_caso INTEGER NOT NULL REFERENCES casos(id_caso),
    cedula VARCHAR(20),
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    fecha_nac DATE NOT NULL CHECK (fecha_nac <= CURRENT_DATE),
    
    sexo VARCHAR(20) NOT NULL CHECK (sexo IN ('M', 'F')),
    tipo_beneficiario VARCHAR(50) NOT NULL CHECK (tipo_beneficiario IN ('Directo', 'Indirecto')),
    parentesco VARCHAR(50) NOT NULL, 
    PRIMARY KEY (num_beneficiario, id_caso)
);

-- 27.1) AUDITORÍA DE INSERCIÓN DE BENEFICIARIOS
CREATE TABLE auditoria_insercion_beneficiarios (
    id SERIAL PRIMARY KEY,
    num_beneficiario INTEGER,
    id_caso INTEGER,
    cedula VARCHAR(20),
    nombres VARCHAR(100),
    apellidos VARCHAR(100),
    parentesco VARCHAR(50),
    id_usuario_registro VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 27.2) AUDITORÍA DE ACTUALIZACIÓN DE BENEFICIARIOS
CREATE TABLE auditoria_actualizacion_beneficiarios (
    id SERIAL PRIMARY KEY,
    num_beneficiario INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    -- Anterior
    cedula_anterior VARCHAR(20),
    nombres_anterior VARCHAR(100),
    apellidos_anterior VARCHAR(100),
    fecha_nac_anterior DATE,
    sexo_anterior VARCHAR(20),
    tipo_beneficiario_anterior VARCHAR(50),
    parentesco_anterior VARCHAR(50),
    -- Nuevo
    cedula_nuevo VARCHAR(20),
    nombres_nuevo VARCHAR(100),
    apellidos_nuevo VARCHAR(100),
    fecha_nac_nuevo DATE,
    sexo_nuevo VARCHAR(20),
    tipo_beneficiario_nuevo VARCHAR(50),
    parentesco_nuevo VARCHAR(50),
    
    id_usuario_actualizo VARCHAR(20),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 27.3) AUDITORÍA DE ELIMINACIÓN DE BENEFICIARIOS
CREATE TABLE auditoria_eliminacion_beneficiarios (
    id SERIAL PRIMARY KEY,
    num_beneficiario INTEGER,
    id_caso INTEGER,
    nombres VARCHAR(100),
    apellidos VARCHAR(100),
    cedula VARCHAR(20),
    id_usuario_elimino VARCHAR(20),
    motivo TEXT,
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 28) SUPERVISA 
CREATE TABLE supervisa (
    term VARCHAR(20) NOT NULL,
    cedula_profesor VARCHAR(20) NOT NULL,
    id_caso INTEGER NOT NULL REFERENCES casos(id_caso),
    
    habilitado BOOLEAN NOT NULL DEFAULT TRUE,
    
    PRIMARY KEY (term, cedula_profesor, id_caso),
    FOREIGN KEY (term, cedula_profesor) REFERENCES profesores(term, cedula_profesor)
);

-- 29) SE LE ASIGNA 
CREATE TABLE se_le_asigna (
    term VARCHAR(20) NOT NULL,
    cedula_estudiante VARCHAR(20) NOT NULL,
    id_caso INTEGER NOT NULL REFERENCES casos(id_caso),
    
    habilitado BOOLEAN NOT NULL DEFAULT TRUE,
    
    PRIMARY KEY (term, cedula_estudiante, id_caso),
    FOREIGN KEY (term, cedula_estudiante) REFERENCES estudiantes(term, cedula_estudiante)
);

-- 33) TOKENS DE RECUPERACIÓN DE CONTRASEÑA
CREATE TABLE password_reset_tokens (
    id_token SERIAL PRIMARY KEY,
    cedula_usuario VARCHAR(20) NOT NULL,
    codigo_verificacion VARCHAR(10) NOT NULL,
    fecha_expiracion DATE NOT NULL,
    usado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion DATE NOT NULL DEFAULT CURRENT_DATE,
    
    FOREIGN KEY (cedula_usuario) REFERENCES usuarios(cedula)
);

-- 34) NOTIFICACIONES
CREATE TABLE notificaciones (
    id_notificacion INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cedula_receptor VARCHAR(20) NOT NULL,
    cedula_emisor VARCHAR(20) NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    leida BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (cedula_receptor) REFERENCES usuarios(cedula) ON DELETE CASCADE,
    FOREIGN KEY (cedula_emisor) REFERENCES usuarios(cedula) ON DELETE CASCADE
);
