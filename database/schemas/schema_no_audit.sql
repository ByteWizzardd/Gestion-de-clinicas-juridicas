-- 1) ESTADOS
CREATE TABLE estados (
    id_estado SERIAL PRIMARY KEY,
    nombre_estado VARCHAR(100) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT TRUE
);

-- 2) NIVELES EDUCATIVOS
CREATE TABLE niveles_educativos (
    id_nivel_educativo SERIAL PRIMARY KEY,
    descripcion VARCHAR(100) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT TRUE
);

-- 3) CONDICIÓN TRABAJO
CREATE TABLE condicion_trabajo (
    id_trabajo SERIAL PRIMARY KEY,
    nombre_trabajo VARCHAR(100) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT TRUE
);

-- 4) CONDICIÓN ACTIVIDAD
CREATE TABLE condicion_actividad (
    id_actividad SERIAL PRIMARY KEY,
    nombre_actividad VARCHAR(100) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT TRUE
);

-- 5) TIPO CARACTERÍSTICAS
CREATE TABLE tipo_caracteristicas (
    id_tipo SERIAL PRIMARY KEY,
    nombre_tipo_caracteristica VARCHAR(100) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT TRUE
);
-- Tipos: tipo_vivienda, material_piso, material_paredes, material_techo, 
--        agua_potable, aseo, eliminacion_aguas_n, artefactos_domesticos

-- 6) MATERIAS
CREATE TABLE materias (
    id_materia SERIAL PRIMARY KEY,
    nombre_materia VARCHAR(100) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT TRUE
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

-- 8) USUARIOS
CREATE TABLE usuarios (
    cedula VARCHAR(20) PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo_electronico VARCHAR(100) NOT NULL UNIQUE,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    telefono_celular VARCHAR(20),
    habilitado_sistema BOOLEAN NOT NULL DEFAULT TRUE,
    tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('Estudiante', 'Profesor', 'Coordinador'))
);

-- 9) MUNICIPIOS
CREATE TABLE municipios (
    id_estado INTEGER NOT NULL,
    num_municipio INTEGER NOT NULL, 
    nombre_municipio VARCHAR(100) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT TRUE,
    
    PRIMARY KEY (id_estado, num_municipio),
    FOREIGN KEY (id_estado) REFERENCES estados(id_estado)
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

-- 13) VIVIENDAS
CREATE TABLE viviendas (
    cedula_solicitante VARCHAR(20) PRIMARY KEY,
    cant_habitaciones INTEGER NOT NULL CHECK (cant_habitaciones >= 0),
    cant_banos INTEGER NOT NULL CHECK (cant_banos >= 0),
    FOREIGN KEY (cedula_solicitante) REFERENCES solicitantes(cedula)
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
    
    -- Validaciones de relación entre campos
    CHECK (cant_ninos_estudiando <= cant_ninos),
    CHECK (cant_ninos < cant_personas),
    CHECK (cant_trabajadores <= cant_personas)
);

-- 15) CARACTERÍSTICAS
CREATE TABLE caracteristicas (
    id_tipo_caracteristica INTEGER NOT NULL,
    num_caracteristica INTEGER NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT TRUE,
    descripcion VARCHAR(200) NOT NULL,
    PRIMARY KEY (id_tipo_caracteristica, num_caracteristica),
    FOREIGN KEY (id_tipo_caracteristica) REFERENCES tipo_caracteristicas(id_tipo)
);

-- 16) ASIGNADAS_A (Relación entre Viviendas y Características)
CREATE TABLE asignadas_a (
    cedula_solicitante VARCHAR(20) NOT NULL,
    id_tipo_caracteristica INTEGER NOT NULL,
    num_caracteristica INTEGER NOT NULL,
    
    PRIMARY KEY (cedula_solicitante, id_tipo_caracteristica, num_caracteristica),
    FOREIGN KEY (cedula_solicitante) REFERENCES viviendas(cedula_solicitante),
    FOREIGN KEY (id_tipo_caracteristica, num_caracteristica) 
        REFERENCES caracteristicas(id_tipo_caracteristica, num_caracteristica)
);

-- 17) CATEGORÍAS
CREATE TABLE categorias (
    id_materia INTEGER NOT NULL,
    num_categoria INTEGER NOT NULL,
    nombre_categoria VARCHAR(100) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id_materia, num_categoria),
    FOREIGN KEY (id_materia) REFERENCES materias(id_materia)
);

-- 18) SUBCATEGORÍAS
CREATE TABLE subcategorias (
    id_materia INTEGER NOT NULL,
    num_categoria INTEGER NOT NULL,
    num_subcategoria INTEGER NOT NULL,
    nombre_subcategoria VARCHAR(100) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id_materia, num_categoria, num_subcategoria),
    FOREIGN KEY (id_materia, num_categoria) REFERENCES categorias(id_materia, num_categoria)
);

-- 19) ÁMBITOS LEGALES
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

-- 20) COORDINADORES
CREATE TABLE coordinadores (
    id_coordinador VARCHAR(20) PRIMARY KEY,
    term VARCHAR(20) NOT NULL,
    FOREIGN KEY (term) REFERENCES semestres(term),
    FOREIGN KEY (id_coordinador) REFERENCES usuarios(cedula)
);

-- 21) ESTUDIANTES
CREATE TABLE estudiantes (
    term VARCHAR(20) NOT NULL,
    cedula_estudiante VARCHAR(20) NOT NULL,
    tipo_estudiante VARCHAR(50) NOT NULL CHECK (tipo_estudiante IN ('Voluntario', 'Inscrito', 'Egresado', 'Servicio Comunitario')),
    nrc VARCHAR(20) NOT NULL,
    PRIMARY KEY (term, cedula_estudiante),
    FOREIGN KEY (term) REFERENCES semestres(term),
    FOREIGN KEY (cedula_estudiante) REFERENCES usuarios(cedula)
);

-- 22) PROFESORES
CREATE TABLE profesores (
    term VARCHAR(20) NOT NULL,
    cedula_profesor VARCHAR(20) NOT NULL,
    tipo_profesor VARCHAR(50) NOT NULL CHECK (tipo_profesor IN ('Voluntario', 'Asesor')),
    PRIMARY KEY (term, cedula_profesor),
    FOREIGN KEY (term) REFERENCES semestres(term),
    FOREIGN KEY (cedula_profesor) REFERENCES usuarios(cedula)
);

-- 23) CASOS
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
    REFERENCES ambitos_legales(id_materia, num_categoria, num_subcategoria, num_ambito_legal),
    
    CONSTRAINT chk_casos_inicio_post_solicitud CHECK (fecha_inicio_caso >= fecha_solicitud),
    CONSTRAINT chk_casos_fin_post_inicio CHECK (fecha_fin_caso IS NULL OR fecha_fin_caso >= fecha_inicio_caso)
);

-- 24) CITAS
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

-- 25) ATIENDEN
CREATE TABLE atienden (
    id_usuario VARCHAR(20) NOT NULL,
    num_cita INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE CHECK (fecha_registro <= CURRENT_DATE),
    
    PRIMARY KEY (num_cita, id_caso, id_usuario),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(cedula),
    FOREIGN KEY (num_cita, id_caso) REFERENCES citas(num_cita, id_caso)
);

-- 26) ACCIONES
CREATE TABLE acciones (
    num_accion INTEGER NOT NULL,
    id_caso INTEGER NOT NULL REFERENCES casos(id_caso),
    detalle_accion TEXT NOT NULL,
    comentario TEXT,
    id_usuario_registra VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE CHECK (fecha_registro <= CURRENT_DATE),
    PRIMARY KEY (num_accion, id_caso)
);

-- 27) EJECUTAN (Relación entre Usuarios y Acciones)
CREATE TABLE ejecutan (
    id_usuario_ejecuta VARCHAR(20) NOT NULL,
    num_accion INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    fecha_ejecucion DATE NOT NULL DEFAULT CURRENT_DATE CHECK (fecha_ejecucion <= CURRENT_DATE),
    
    PRIMARY KEY (id_usuario_ejecuta, num_accion, id_caso),
    FOREIGN KEY (id_usuario_ejecuta) REFERENCES usuarios(cedula),
    FOREIGN KEY (num_accion, id_caso) REFERENCES acciones(num_accion, id_caso)
);

-- 28) CAMBIO ESTATUS
CREATE TABLE cambio_estatus (
    num_cambio INTEGER NOT NULL,
    id_caso INTEGER NOT NULL REFERENCES casos(id_caso),
    motivo TEXT,
    nuevo_estatus VARCHAR(50) NOT NULL CHECK (nuevo_estatus IN ('En proceso', 'Archivado', 'Entregado', 'Asesoría')),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE CHECK (fecha <= CURRENT_DATE),
    id_usuario_cambia VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    PRIMARY KEY (num_cambio, id_caso)
);

-- 29) SOPORTES
CREATE TABLE soportes (
    num_soporte INTEGER NOT NULL,
    id_caso INTEGER NOT NULL REFERENCES casos(id_caso),
    
    documento_data BYTEA,
    nombre_archivo VARCHAR(150) NOT NULL,
    tipo_mime VARCHAR(100) NOT NULL,
    descripcion TEXT,
    
    fecha_consignacion DATE NOT NULL DEFAULT CURRENT_DATE CHECK (fecha_consignacion <= CURRENT_DATE),
    
    id_usuario_subio VARCHAR(20) REFERENCES usuarios(cedula),
    
    PRIMARY KEY (num_soporte, id_caso)
);

-- 30) BENEFICIARIOS 
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

-- 31) SUPERVISA 
CREATE TABLE supervisa (
    term VARCHAR(20) NOT NULL,
    cedula_profesor VARCHAR(20) NOT NULL,
    id_caso INTEGER NOT NULL REFERENCES casos(id_caso),
    
    habilitado BOOLEAN NOT NULL DEFAULT TRUE,
    
    PRIMARY KEY (term, cedula_profesor, id_caso),
    FOREIGN KEY (term, cedula_profesor) REFERENCES profesores(term, cedula_profesor)
);

-- 32) SE LE ASIGNA 
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
