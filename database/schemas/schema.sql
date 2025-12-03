-- ==========================================================
-- 1. TABLAS MAESTRAS
-- ==========================================================

CREATE TABLE estados (
    id_estado SERIAL PRIMARY KEY,
    nombre_estado VARCHAR(100) NOT NULL
);

CREATE TABLE niveles_educativos (
    id_nivel_educativo SERIAL PRIMARY KEY,
    nivel INTEGER CHECK (nivel BETWEEN 0 AND 14),
    anos_cursados INTEGER,
    semestres_cursados INTEGER,
    trimestres_cursados INTEGER
);

CREATE TABLE trabajos (
    id_trabajo SERIAL PRIMARY KEY,
    condicion_actividad VARCHAR(50) CHECK (condicion_actividad IN ('Ama de Casa', 'Estudiante', 'Pensionado', 'Jubilado', 'Otra')),
    buscando_trabajo BOOLEAN,
    condicion_trabajo VARCHAR(50) CHECK (condicion_trabajo IN ('Patrono', 'Empleado', 'Obrero', 'Cuenta propia'))
);

CREATE TABLE familias_hogares (
    id_hogar SERIAL PRIMARY KEY,
    cant_personas INTEGER,
    cant_trabajadores INTEGER,
    cant_ninos INTEGER,
    cant_ninos_estudiando INTEGER,
    jefe_hogar BOOLEAN
);

CREATE TABLE tribunales (
    id_tribunal SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    tipo VARCHAR(50)
);

CREATE TABLE ambitos_legales (
    id_ambito_legal SERIAL PRIMARY KEY,
    materia VARCHAR(100), 
    tipo VARCHAR(50),
    descripcion TEXT
);

CREATE TABLE semestres (
    term VARCHAR(20) PRIMARY KEY, 
    periodo_meses VARCHAR(50),
    anos_academicos VARCHAR(20)
);

CREATE TABLE materias (
    nrc VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(100)
);

-- ==========================================================
-- 2. VIVIENDAS (VALIDACIONES ESTRICTAS)
-- ==========================================================

CREATE TABLE viviendas (
    id_vivienda SERIAL PRIMARY KEY,
    
    tipo_vivienda VARCHAR(50) CHECK (tipo_vivienda IN ('Quinta', 'Casa Urb', 'Apartamento', 'Bloque', 'Casa de Barrio', 'Casa Rural', 'Rancho', 'Refugio', 'Otros')),
    cant_habitaciones INTEGER,
    cant_banos INTEGER,
    
    material_piso VARCHAR(50) CHECK (material_piso IN ('Tierra', 'Cemento', 'Cerámica', 'Granito', 'Parquet', 'Mármol')),
    material_paredes VARCHAR(50) CHECK (material_paredes IN ('Cartón', 'Palma', 'Desechos', 'Bahareque', 'Bloque sin frizar', 'Bloque frizado')),
    material_techo VARCHAR(50) CHECK (material_techo IN ('Madera', 'Cartón', 'Palma/Zinc', 'Acerolit', 'Platabanda', 'Tejas')),
    agua_potable VARCHAR(50) CHECK (agua_potable IN ('Dentro de la vivienda', 'Fuera de la vivienda', 'No tiene servicio')),
    eliminacion_aguas_n VARCHAR(50) CHECK (eliminacion_aguas_n IN ('Poceta a cloaca', 'Pozo séptico', 'Poceta sin conexión', 'Excusado a hoyo o letrina', 'No tiene')),
    aseo VARCHAR(50) CHECK (aseo IN ('Llega a la vivienda', 'No llega a la vivienda', 'Container', 'No tiene')),
    
    artefactos_domesticos TEXT[], 
    CONSTRAINT check_artefactos_dominio CHECK (
        artefactos_domesticos <@ ARRAY[
            'Nevera', 'Lavadora', 'Computadora', 'Cable Satelital', 'Internet', 'Carro', 'Moto'
        ]
    )
);

-- ==========================================================
-- 3. UBICACIÓN GEOGRÁFICA
-- ==========================================================

CREATE TABLE municipios (
    id_municipio SERIAL,
    id_estado INTEGER REFERENCES estados(id_estado),
    nombre_municipio VARCHAR(100),
    PRIMARY KEY (id_municipio, id_estado),
    CONSTRAINT uq_municipio_id UNIQUE (id_municipio) 
);

CREATE TABLE parroquias (
    id_parroquia SERIAL,
    id_municipio INTEGER REFERENCES municipios(id_municipio),
    nombre_parroquia VARCHAR(100),
    PRIMARY KEY (id_parroquia, id_municipio),
    CONSTRAINT uq_parroquia_id UNIQUE (id_parroquia) 
);

CREATE TABLE nucleos (
    id_nucleo SERIAL PRIMARY KEY,
    nombre_nucleo VARCHAR(100),
    id_parroquia INTEGER REFERENCES parroquias(id_parroquia) 
);

-- ==========================================================
-- 4. CLIENTES
-- ==========================================================

CREATE TABLE clientes (
    cedula VARCHAR(20) PRIMARY KEY, 
    nombres VARCHAR(100),
    apellidos VARCHAR(100),
    fecha_nacimiento DATE,
    fecha_solicitud DATE DEFAULT CURRENT_DATE,
    telefono_local VARCHAR(20),
    telefono_celular VARCHAR(20),
    correo_electronico VARCHAR(100),
    
    sexo VARCHAR(1) CHECK (sexo IN ('M', 'F')),
    nacionalidad VARCHAR(10) CHECK (nacionalidad IN ('V', 'E', 'Ext')),
    estado_civil VARCHAR(20) CHECK (estado_civil IN ('Soltero', 'Casado', 'Divorciado', 'Viudo')),
    concubinato BOOLEAN,
    
    id_hogar INTEGER REFERENCES familias_hogares(id_hogar),
    id_nivel_educativo INTEGER REFERENCES niveles_educativos(id_nivel_educativo),
    id_trabajo INTEGER REFERENCES trabajos(id_trabajo),
    id_vivienda INTEGER REFERENCES viviendas(id_vivienda),
    id_parroquia INTEGER REFERENCES parroquias(id_parroquia)
);

CREATE VIEW view_clientes_info AS
SELECT t.*, EXTRACT(YEAR FROM AGE(CURRENT_DATE, t.fecha_nacimiento))::INTEGER AS edad_calculada FROM clientes t;

-- ==========================================================
-- 5. USUARIOS Y ACADÉMICO (ELIMINADO TIPO VINCULACIÓN)
-- ==========================================================

CREATE TABLE usuarios (
    cedula VARCHAR(20) PRIMARY KEY REFERENCES clientes(cedula), 
    habilitado BOOLEAN DEFAULT TRUE,
    rol_sistema VARCHAR(20) CHECK (rol_sistema IN ('Estudiante', 'Profesor', 'Coordinador')),
    foto_perfil BYTEA
);

CREATE TABLE coordinadores (
    cedula_coordinador VARCHAR(20) PRIMARY KEY REFERENCES usuarios(cedula)
);

CREATE TABLE profesores (
    cedula_profesor VARCHAR(20) PRIMARY KEY REFERENCES usuarios(cedula)
);

CREATE TABLE secciones (
    num_seccion INTEGER, -- Autoincrementado por TRIGGER
    nrc_materia VARCHAR(20) REFERENCES materias(nrc),
    cedula_profesor VARCHAR(20) REFERENCES profesores(cedula_profesor),
    cedula_coordinador VARCHAR(20) REFERENCES coordinadores(cedula_coordinador),
    
    PRIMARY KEY (num_seccion, nrc_materia)
);

CREATE TABLE estudiantes (
    cedula_estudiante VARCHAR(20) PRIMARY KEY REFERENCES usuarios(cedula),
    
    -- CAMBIO REALIZADO: Eliminado 'tipo_vinculacion'. Solo queda este:
    tipo_estudiante VARCHAR(50) CHECK (tipo_estudiante IN ('Voluntario', 'Inscrito', 'Egresado')),
    
    num_seccion INTEGER, 
    nrc_materia VARCHAR(20),
    FOREIGN KEY (num_seccion, nrc_materia) REFERENCES secciones(num_seccion, nrc_materia)
);

-- ==========================================================
-- 6. CASOS LEGALES
-- ==========================================================

CREATE TABLE expedientes (
    id_expediente VARCHAR(50) PRIMARY KEY,
    id_tribunal INTEGER REFERENCES tribunales(id_tribunal)
);

CREATE TABLE casos (
    id_caso SERIAL PRIMARY KEY,
    fecha_inicio_caso DATE DEFAULT CURRENT_DATE,
    fecha_fin_caso DATE,
    
    tramite VARCHAR(100) CHECK (tramite IN (
        'Asesoría', 
        'Conciliación y Mediación', 
        '(Redacción documentos y/o convenio)', 
        'Asistencia Judicial - Casos externos'
    )),
    
    estatus VARCHAR(50) CHECK (estatus IN ('En proceso', 'Archivado', 'Entregado', 'Asesoría')),
    
    observaciones TEXT,
    id_nucleo INTEGER REFERENCES nucleos(id_nucleo),
    id_ambito_legal INTEGER REFERENCES ambitos_legales(id_ambito_legal),
    id_expediente VARCHAR(50) REFERENCES expedientes(id_expediente),
    cedula_cliente VARCHAR(20) REFERENCES clientes(cedula)
);

-- ==========================================================
-- 7. DETALLES DEL CASO (BYTEA Y PKs COMPUESTAS)
-- ==========================================================

CREATE TABLE soportes (
    num_soporte INTEGER, 
    id_caso INTEGER REFERENCES casos(id_caso),
    
    documento_data BYTEA, 
    nombre_archivo VARCHAR(150),
    tipo_mime VARCHAR(100),
    
    fecha_consignacion DATE,
    PRIMARY KEY (num_soporte, id_caso)
);

CREATE TABLE documentos (
    num_documento INTEGER, 
    id_expediente VARCHAR(50) REFERENCES expedientes(id_expediente),
    folio_inicio INTEGER,
    folio_fin INTEGER,
    tipo VARCHAR(50),
    fecha DATE,
    PRIMARY KEY (num_documento, id_expediente)
);

CREATE TABLE citas (
    fecha_cita TIMESTAMP,
    id_caso INTEGER REFERENCES casos(id_caso),
    proxima_cita DATE,
    PRIMARY KEY (fecha_cita, id_caso)
);

CREATE TABLE acciones (
    num_accion INTEGER,
    id_caso INTEGER REFERENCES casos(id_caso),
    detalle_accion TEXT, 
    cedula_usuario_registra VARCHAR(20) REFERENCES usuarios(cedula),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cedula_usuario_ejecuta VARCHAR(20) REFERENCES usuarios(cedula),
    fecha_accion TIMESTAMP,
    PRIMARY KEY (num_accion, id_caso)
);

CREATE TABLE asignaciones (
    fecha_inicio DATE,
    id_caso INTEGER REFERENCES casos(id_caso),
    term VARCHAR(20) REFERENCES semestres(term),
    cedula_estudiante VARCHAR(20) REFERENCES estudiantes(cedula_estudiante),
    cedula_profesor VARCHAR(20) REFERENCES profesores(cedula_profesor),
    fecha_fin DATE,
    PRIMARY KEY (fecha_inicio, id_caso, term, cedula_estudiante)
);

CREATE TABLE beneficiarios (
    cedula VARCHAR(20) REFERENCES clientes(cedula),
    id_caso INTEGER REFERENCES casos(id_caso),
    tipo_beneficiario VARCHAR(50) CHECK (tipo_beneficiario IN ('Directo', 'Indirecto')),
    parentesco VARCHAR(50),
    PRIMARY KEY (cedula, id_caso)
);

CREATE TABLE cambios_estatus (
    cedula_usuario VARCHAR(20) REFERENCES usuarios(cedula),
    id_caso INTEGER REFERENCES casos(id_caso),
    estatus_nuevo VARCHAR(50),
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cedula_usuario, id_caso, estatus_nuevo, fecha_cambio)
);

CREATE TABLE orientaciones (
    cedula_usuario VARCHAR(20) REFERENCES usuarios(cedula),
    fecha_cita TIMESTAMP,
    id_caso INTEGER,
    orientacion TEXT,
    FOREIGN KEY (fecha_cita, id_caso) REFERENCES citas(fecha_cita, id_caso),
    PRIMARY KEY (cedula_usuario, fecha_cita, id_caso)
);

