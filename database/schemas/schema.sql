-- Estructura de tablas: tablas, claves foráneas e índices.
-- Orden de ejecución: schema.sql → vistas.sql → funciones.sql → triggers.sql → permisos.sql

CREATE EXTENSION IF NOT EXISTS unaccent;

-- 1) ESTADOS
CREATE TABLE estados (
    id_estado SERIAL,
    nombre_estado VARCHAR(100) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT true,
    id_usuario_registro VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT (now() AT TIME ZONE 'America/Caracas'::text),
    CONSTRAINT estados_pkey PRIMARY KEY (id_estado)
);

-- 2) NIVELES EDUCATIVOS
CREATE TABLE niveles_educativos (
    id_nivel_educativo SERIAL,
    descripcion VARCHAR(100) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT true,
    id_usuario_registro VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT (now() AT TIME ZONE 'America/Caracas'::text),
    CONSTRAINT niveles_educativos_pkey PRIMARY KEY (id_nivel_educativo)
);

-- 3) CONDICIÓN TRABAJO
CREATE TABLE condicion_trabajo (
    id_trabajo SERIAL,
    nombre_trabajo VARCHAR(100) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT true,
    id_usuario_registro VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT (now() AT TIME ZONE 'America/Caracas'::text),
    CONSTRAINT condicion_trabajo_pkey PRIMARY KEY (id_trabajo)
);

-- 4) CONDICIÓN ACTIVIDAD
CREATE TABLE condicion_actividad (
    id_actividad SERIAL,
    nombre_actividad VARCHAR(100) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT true,
    id_usuario_registro VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT (now() AT TIME ZONE 'America/Caracas'::text),
    CONSTRAINT condicion_actividad_pkey PRIMARY KEY (id_actividad)
);

-- 5) TIPO CARACTERÍSTICAS
CREATE TABLE tipo_caracteristicas (
    id_tipo SERIAL,
    nombre_tipo_caracteristica VARCHAR(100) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT true,
    id_usuario_registro VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT (now() AT TIME ZONE 'America/Caracas'::text),
    CONSTRAINT tipo_caracteristicas_pkey PRIMARY KEY (id_tipo)
);

-- 6) MATERIAS
CREATE TABLE materias (
    id_materia SERIAL,
    nombre_materia VARCHAR(100) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT true,
    id_usuario_registro VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT (now() AT TIME ZONE 'America/Caracas'::text),
    CONSTRAINT materias_pkey PRIMARY KEY (id_materia)
);

-- 7) SEMESTRES
CREATE TABLE semestres (
    term VARCHAR(20) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT true,
    id_usuario_registro VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT (now() AT TIME ZONE 'America/Caracas'::text),
    CONSTRAINT semestres_pkey PRIMARY KEY (term),
    CONSTRAINT chk_fechas CHECK ((fecha_fin >= fecha_inicio)),
    CONSTRAINT semestres_term_check CHECK (((term)::text ~ '^\d{4}-(15|25)$'::text))
);

-- 8) USUARIOS
CREATE TABLE usuarios (
    cedula VARCHAR(20) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo_electronico VARCHAR(100) NOT NULL,
    nombre_usuario VARCHAR(50) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    telefono_celular VARCHAR(20),
    habilitado_sistema BOOLEAN NOT NULL DEFAULT true,
    tipo_usuario VARCHAR(20) NOT NULL,
    foto_perfil VARCHAR(500),
    id_usuario_registro VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT (now() AT TIME ZONE 'America/Caracas'::text),
    CONSTRAINT usuarios_pkey PRIMARY KEY (cedula),
    CONSTRAINT usuarios_correo_electronico_key UNIQUE (correo_electronico),
    CONSTRAINT usuarios_nombre_usuario_key UNIQUE (nombre_usuario),
    CONSTRAINT usuarios_tipo_usuario_check CHECK (((tipo_usuario)::text = ANY ((ARRAY['Estudiante'::character varying, 'Profesor'::character varying, 'Coordinador'::character varying])::text[])))
);

-- PASSWORD RESET TOKENS
CREATE TABLE password_reset_tokens (
    id_token SERIAL,
    cedula_usuario VARCHAR(20) NOT NULL,
    codigo_verificacion VARCHAR(10) NOT NULL,
    -- TIMESTAMP y no DATE: con DATE la caducidad se truncaba al final del dia,
    -- asi que un codigo de 15 minutos era imposible de expresar.
    fecha_expiracion TIMESTAMP NOT NULL,
    usado BOOLEAN NOT NULL DEFAULT false,
    -- Intentos fallidos de verificacion. Al llegar al limite el codigo se anula.
    intentos SMALLINT NOT NULL DEFAULT 0,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT (now() AT TIME ZONE 'America/Caracas'::text),
    CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id_token)
);

-- NOTIFICACIONES
CREATE TABLE notificaciones (
    id_notificacion INTEGER GENERATED ALWAYS AS IDENTITY NOT NULL,
    cedula_receptor VARCHAR(20) NOT NULL,
    cedula_emisor VARCHAR(20) NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    leida BOOLEAN DEFAULT false,
    CONSTRAINT notificaciones_pkey PRIMARY KEY (id_notificacion)
);

-- 9) MUNICIPIOS
CREATE TABLE municipios (
    id_estado INTEGER NOT NULL,
    num_municipio INTEGER NOT NULL,
    nombre_municipio VARCHAR(100) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT true,
    id_usuario_registro VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT (now() AT TIME ZONE 'America/Caracas'::text),
    CONSTRAINT municipios_pkey PRIMARY KEY (id_estado, num_municipio)
);

-- 10) PARROQUIAS
CREATE TABLE parroquias (
    id_estado INTEGER NOT NULL,
    num_municipio INTEGER NOT NULL,
    num_parroquia INTEGER NOT NULL,
    nombre_parroquia VARCHAR(100) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT true,
    id_usuario_registro VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT (now() AT TIME ZONE 'America/Caracas'::text),
    CONSTRAINT parroquias_pkey PRIMARY KEY (id_estado, num_municipio, num_parroquia)
);

-- 11) NÚCLEOS
CREATE TABLE nucleos (
    id_nucleo SERIAL,
    nombre_nucleo VARCHAR(100) NOT NULL,
    id_estado INTEGER NOT NULL,
    num_municipio INTEGER NOT NULL,
    num_parroquia INTEGER NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT true,
    id_usuario_registro VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT (now() AT TIME ZONE 'America/Caracas'::text),
    CONSTRAINT nucleos_pkey PRIMARY KEY (id_nucleo)
);

-- 12) SOLICITANTES
CREATE TABLE solicitantes (
    cedula VARCHAR(20) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    telefono_local VARCHAR(20),
    telefono_celular VARCHAR(20) NOT NULL,
    correo_electronico VARCHAR(100) NOT NULL,
    sexo VARCHAR(20) NOT NULL,
    nacionalidad VARCHAR(20) NOT NULL,
    estado_civil VARCHAR(20) NOT NULL,
    concubinato BOOLEAN NOT NULL,
    tiempo_estudio INTEGER,
    id_nivel_educativo INTEGER NOT NULL,
    id_trabajo INTEGER,
    id_actividad INTEGER,
    id_estado INTEGER NOT NULL,
    num_municipio INTEGER NOT NULL,
    num_parroquia INTEGER NOT NULL,
    tipo_tiempo_estudio VARCHAR(20),
    id_usuario_registro VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT (now() AT TIME ZONE 'America/Caracas'::text),
    direccion_habitacion TEXT,
    CONSTRAINT solicitantes_pkey PRIMARY KEY (cedula),
    CONSTRAINT solicitantes_correo_electronico_unique UNIQUE (correo_electronico),
    CONSTRAINT chk_solicitantes_nacimiento_pasado CHECK ((fecha_nacimiento <= CURRENT_DATE)),
    CONSTRAINT solicitantes_estado_civil_check CHECK (((estado_civil)::text = ANY ((ARRAY['Soltero'::character varying, 'Casado'::character varying, 'Divorciado'::character varying, 'Viudo'::character varying])::text[]))),
    CONSTRAINT solicitantes_nacionalidad_check CHECK (((nacionalidad)::text = ANY ((ARRAY['V'::character varying, 'E'::character varying])::text[]))),
    CONSTRAINT solicitantes_sexo_check CHECK (((sexo)::text = ANY ((ARRAY['M'::character varying, 'F'::character varying])::text[]))),
    CONSTRAINT solicitantes_telefono_local_check CHECK (((telefono_local IS NULL) OR ((telefono_local)::text ~ '^[0-9]{7,11}$'::text))),
    CONSTRAINT solicitantes_tiempo_estudio_check CHECK (((tiempo_estudio IS NULL) OR (tiempo_estudio >= 0))),
    CONSTRAINT solicitantes_tipo_tiempo_estudio_check CHECK (((tipo_tiempo_estudio)::text = ANY ((ARRAY['Años'::character varying, 'Semestres'::character varying, 'Trimestres'::character varying])::text[])))
);

-- 13) VIVIENDAS
CREATE TABLE viviendas (
    cedula_solicitante VARCHAR(20) NOT NULL,
    cant_habitaciones INTEGER NOT NULL,
    cant_banos INTEGER NOT NULL,
    id_usuario_registro VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT (now() AT TIME ZONE 'America/Caracas'::text),
    CONSTRAINT viviendas_pkey PRIMARY KEY (cedula_solicitante),
    CONSTRAINT viviendas_cant_banos_check CHECK ((cant_banos >= 0)),
    CONSTRAINT viviendas_cant_habitaciones_check CHECK ((cant_habitaciones >= 0))
);

-- 14) FAMILIAS Y HOGARES
CREATE TABLE familias_y_hogares (
    cedula_solicitante VARCHAR(20) NOT NULL,
    cant_personas INTEGER NOT NULL,
    cant_trabajadores INTEGER NOT NULL,
    cant_no_trabajadores INTEGER NOT NULL,
    cant_ninos INTEGER NOT NULL,
    cant_ninos_estudiando INTEGER NOT NULL,
    jefe_hogar BOOLEAN NOT NULL,
    ingresos_mensuales DECIMAL(10,2) NOT NULL,
    tiempo_estudio_jefe INTEGER,
    id_nivel_educativo_jefe INTEGER,
    tipo_tiempo_estudio_jefe VARCHAR(20),
    id_usuario_registro VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT (now() AT TIME ZONE 'America/Caracas'::text),
    CONSTRAINT familias_y_hogares_pkey PRIMARY KEY (cedula_solicitante),
    CONSTRAINT chk_al_menos_un_adulto CHECK ((cant_ninos < cant_personas)),
    CONSTRAINT chk_cant_personas_minimo CHECK ((cant_personas >= 1)),
    CONSTRAINT chk_ninos_estudiando_menor_igual_ninos CHECK ((cant_ninos_estudiando <= cant_ninos)),
    CONSTRAINT chk_trabajadores_menor_igual_personas CHECK ((cant_trabajadores <= cant_personas)),
    CONSTRAINT familias_tiempo_estudio_jefe_check CHECK (((tiempo_estudio_jefe IS NULL) OR (tiempo_estudio_jefe >= 0))),
    CONSTRAINT familias_y_hogares_cant_ninos_check CHECK ((cant_ninos >= 0)),
    CONSTRAINT familias_y_hogares_cant_ninos_estudiando_check CHECK ((cant_ninos_estudiando >= 0)),
    CONSTRAINT familias_y_hogares_cant_no_trabajadores_check CHECK ((cant_no_trabajadores >= 0)),
    CONSTRAINT familias_y_hogares_cant_trabajadores_check CHECK ((cant_trabajadores >= 0)),
    CONSTRAINT familias_y_hogares_ingresos_mensuales_check CHECK ((ingresos_mensuales >= (0)::numeric)),
    CONSTRAINT familias_y_hogares_tipo_tiempo_estudio_jefe_check CHECK (((tipo_tiempo_estudio_jefe)::text = ANY ((ARRAY['Años'::character varying, 'Semestres'::character varying, 'Trimestres'::character varying])::text[])))
);

-- 15) CARACTERÍSTICAS
CREATE TABLE caracteristicas (
    id_tipo_caracteristica INTEGER NOT NULL,
    num_caracteristica INTEGER NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT true,
    descripcion VARCHAR(200) NOT NULL,
    id_usuario_registro VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT (now() AT TIME ZONE 'America/Caracas'::text),
    CONSTRAINT caracteristicas_pkey PRIMARY KEY (id_tipo_caracteristica, num_caracteristica)
);

-- 16) ASIGNADAS_A
CREATE TABLE asignadas_a (
    cedula_solicitante VARCHAR(20) NOT NULL,
    id_tipo_caracteristica INTEGER NOT NULL,
    num_caracteristica INTEGER NOT NULL,
    CONSTRAINT asignadas_a_pkey PRIMARY KEY (cedula_solicitante, id_tipo_caracteristica, num_caracteristica)
);

-- 17) CATEGORÍAS
CREATE TABLE categorias (
    id_materia INTEGER NOT NULL,
    num_categoria INTEGER NOT NULL,
    nombre_categoria VARCHAR(100) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT true,
    id_usuario_registro VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT (now() AT TIME ZONE 'America/Caracas'::text),
    CONSTRAINT categorias_pkey PRIMARY KEY (id_materia, num_categoria)
);

-- 18) SUBCATEGORÍAS
CREATE TABLE subcategorias (
    id_materia INTEGER NOT NULL,
    num_categoria INTEGER NOT NULL,
    num_subcategoria INTEGER NOT NULL,
    nombre_subcategoria VARCHAR(100) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT true,
    id_usuario_registro VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT (now() AT TIME ZONE 'America/Caracas'::text),
    CONSTRAINT subcategorias_pkey PRIMARY KEY (id_materia, num_categoria, num_subcategoria)
);

-- 19) ÁMBITOS LEGALES
CREATE TABLE ambitos_legales (
    id_materia INTEGER NOT NULL,
    num_categoria INTEGER NOT NULL,
    num_subcategoria INTEGER NOT NULL,
    num_ambito_legal INTEGER NOT NULL,
    nombre_ambito_legal VARCHAR(200) NOT NULL DEFAULT 'Sin nombre'::character varying,
    habilitado BOOLEAN NOT NULL DEFAULT true,
    id_usuario_registro VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT (now() AT TIME ZONE 'America/Caracas'::text),
    CONSTRAINT ambitos_legales_pkey PRIMARY KEY (id_materia, num_categoria, num_subcategoria, num_ambito_legal)
);

-- 20) COORDINADORES
CREATE TABLE coordinadores (
    id_coordinador VARCHAR(20) NOT NULL,
    term VARCHAR(20) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT true,
    id_usuario_registro VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT (now() AT TIME ZONE 'America/Caracas'::text),
    CONSTRAINT coordinadores_pkey PRIMARY KEY (id_coordinador)
);

-- 21) ESTUDIANTES
CREATE TABLE estudiantes (
    term VARCHAR(20) NOT NULL,
    cedula_estudiante VARCHAR(20) NOT NULL,
    tipo_estudiante VARCHAR(50) NOT NULL,
    nrc VARCHAR(20) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT true,
    id_usuario_registro VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT (now() AT TIME ZONE 'America/Caracas'::text),
    CONSTRAINT estudiantes_pkey PRIMARY KEY (term, cedula_estudiante),
    CONSTRAINT estudiantes_tipo_estudiante_check CHECK (((tipo_estudiante)::text = ANY ((ARRAY['Voluntario'::character varying, 'Inscrito'::character varying, 'Egresado'::character varying, 'Servicio Comunitario'::character varying])::text[])))
);

-- 22) PROFESORES
CREATE TABLE profesores (
    term VARCHAR(20) NOT NULL,
    cedula_profesor VARCHAR(20) NOT NULL,
    tipo_profesor VARCHAR(50) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT true,
    id_usuario_registro VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT (now() AT TIME ZONE 'America/Caracas'::text),
    CONSTRAINT profesores_pkey PRIMARY KEY (term, cedula_profesor),
    CONSTRAINT profesores_tipo_profesor_check CHECK (((tipo_profesor)::text = ANY ((ARRAY['Voluntario'::character varying, 'Asesor'::character varying])::text[])))
);

-- 23) CASOS
CREATE TABLE casos (
    id_caso SERIAL,
    fecha_solicitud DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_inicio_caso DATE NOT NULL,
    fecha_fin_caso DATE,
    tramite VARCHAR(200) NOT NULL,
    observaciones TEXT,
    id_nucleo INTEGER NOT NULL,
    cedula VARCHAR(20) NOT NULL,
    id_materia INTEGER NOT NULL,
    num_categoria INTEGER NOT NULL,
    num_subcategoria INTEGER NOT NULL,
    num_ambito_legal INTEGER NOT NULL,
    id_usuario_registro VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT (now() AT TIME ZONE 'America/Caracas'::text),
    CONSTRAINT casos_pkey PRIMARY KEY (id_caso),
    CONSTRAINT casos_tramite_check CHECK (((tramite)::text = ANY ((ARRAY['Asesoría'::character varying, 'Conciliación y Mediación'::character varying, 'Redacción documentos y/o convenio'::character varying, 'Asistencia Judicial - Casos externos'::character varying])::text[]))),
    CONSTRAINT chk_casos_fin_post_inicio CHECK (((fecha_fin_caso IS NULL) OR (fecha_fin_caso >= fecha_inicio_caso))),
    CONSTRAINT chk_casos_inicio_pasado CHECK ((fecha_inicio_caso <= CURRENT_DATE)),
    CONSTRAINT chk_casos_inicio_post_solicitud CHECK ((fecha_inicio_caso >= fecha_solicitud)),
    CONSTRAINT chk_casos_solicitud_pasada CHECK ((fecha_solicitud <= CURRENT_DATE))
);

-- 24) CITAS
CREATE TABLE citas (
    num_cita INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    fecha_proxima_cita DATE,
    fecha_encuentro DATE NOT NULL,
    orientacion TEXT NOT NULL,
    id_usuario_registro VARCHAR(20),
    id_usuario_actualizo VARCHAR(20),
    fecha_actualizacion TIMESTAMP,
    fecha_registro TIMESTAMP DEFAULT (now() AT TIME ZONE 'America/Caracas'::text),
    CONSTRAINT citas_pkey PRIMARY KEY (num_cita, id_caso),
    CONSTRAINT chk_citas_proxima_posterior CHECK (((fecha_proxima_cita IS NULL) OR (fecha_proxima_cita > fecha_encuentro)))
);

-- 25) ATIENDEN
CREATE TABLE atienden (
    id_usuario VARCHAR(20) NOT NULL,
    num_cita INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE,
    id_usuario_registro VARCHAR(20),
    CONSTRAINT atienden_pkey PRIMARY KEY (num_cita, id_caso, id_usuario),
    CONSTRAINT chk_atienden_registro_pasado CHECK ((fecha_registro <= CURRENT_DATE))
);

-- 26) ACCIONES
CREATE TABLE acciones (
    num_accion INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    detalle_accion TEXT NOT NULL,
    comentario TEXT,
    id_usuario_registra VARCHAR(20),
    fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE,
    id_usuario_registro VARCHAR(20),
    CONSTRAINT acciones_pkey PRIMARY KEY (num_accion, id_caso),
    CONSTRAINT chk_acciones_registro_pasado CHECK ((fecha_registro <= CURRENT_DATE))
);

-- 27) EJECUTAN
CREATE TABLE ejecutan (
    id_usuario_ejecuta VARCHAR(20) NOT NULL,
    num_accion INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    fecha_ejecucion DATE NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT ejecutan_pkey PRIMARY KEY (id_usuario_ejecuta, num_accion, id_caso),
    CONSTRAINT chk_ejecutan_fecha_pasada CHECK ((fecha_ejecucion <= CURRENT_DATE))
);

-- 28) CAMBIO ESTATUS
CREATE TABLE cambio_estatus (
    num_cambio INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    motivo TEXT,
    nuevo_estatus VARCHAR(50) NOT NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    id_usuario_cambia VARCHAR(20),
    id_usuario_registro VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT (now() AT TIME ZONE 'America/Caracas'::text),
    CONSTRAINT cambio_estatus_pkey PRIMARY KEY (num_cambio, id_caso),
    CONSTRAINT cambio_estatus_nuevo_estatus_check CHECK (((nuevo_estatus)::text = ANY ((ARRAY['En proceso'::character varying, 'Archivado'::character varying, 'Entregado'::character varying, 'Asesoría'::character varying])::text[]))),
    CONSTRAINT chk_cambio_estatus_fecha_pasada CHECK ((fecha <= CURRENT_DATE))
);

-- 29) SOPORTES
CREATE TABLE soportes (
    num_soporte INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    nombre_archivo VARCHAR(150) NOT NULL,
    tipo_mime VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_consignacion TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'America/Caracas'::text),
    id_usuario_subio VARCHAR(20),
    url_documento VARCHAR(500) NOT NULL,
    CONSTRAINT soportes_pkey PRIMARY KEY (num_soporte, id_caso),
    CONSTRAINT chk_soportes_consignacion_pasada CHECK ((fecha_consignacion <= (CURRENT_TIMESTAMP + '00:01:00'::interval)))
);

-- 30) BENEFICIARIOS
CREATE TABLE beneficiarios (
    num_beneficiario INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    cedula VARCHAR(20),
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    fecha_nac DATE NOT NULL,
    sexo VARCHAR(20) NOT NULL,
    tipo_beneficiario VARCHAR(50) NOT NULL,
    parentesco VARCHAR(50) NOT NULL,
    id_usuario_registro VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT (now() AT TIME ZONE 'America/Caracas'::text),
    id_usuario_actualizo VARCHAR(20),
    CONSTRAINT beneficiarios_pkey PRIMARY KEY (num_beneficiario, id_caso),
    CONSTRAINT beneficiarios_sexo_check CHECK (((sexo)::text = ANY ((ARRAY['M'::character varying, 'F'::character varying])::text[]))),
    CONSTRAINT beneficiarios_tipo_beneficiario_check CHECK (((tipo_beneficiario)::text = ANY ((ARRAY['Directo'::character varying, 'Indirecto'::character varying])::text[]))),
    CONSTRAINT chk_beneficiarios_nac_pasado CHECK ((fecha_nac <= CURRENT_DATE))
);

-- 31) SUPERVISA
CREATE TABLE supervisa (
    term VARCHAR(20) NOT NULL,
    cedula_profesor VARCHAR(20) NOT NULL,
    id_caso INTEGER NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT true,
    id_usuario_registro VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT (now() AT TIME ZONE 'America/Caracas'::text),
    CONSTRAINT supervisa_pkey PRIMARY KEY (term, cedula_profesor, id_caso)
);

-- 32) SE LE ASIGNA
CREATE TABLE se_le_asigna (
    term VARCHAR(20) NOT NULL,
    cedula_estudiante VARCHAR(20) NOT NULL,
    id_caso INTEGER NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT true,
    id_usuario_registro VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT (now() AT TIME ZONE 'America/Caracas'::text),
    CONSTRAINT se_le_asigna_pkey PRIMARY KEY (term, cedula_estudiante, id_caso)
);

-- 33) OCURREN_EN
CREATE TABLE ocurren_en (
    id_caso INTEGER NOT NULL,
    term VARCHAR(20) NOT NULL,
    CONSTRAINT ocurren_en_pkey PRIMARY KEY (id_caso, term)
);


CREATE TABLE auditoria_eventos (
    id BIGSERIAL,
    id_transaccion BIGINT DEFAULT txid_current(),
    entidad VARCHAR(50) NOT NULL,
    operacion VARCHAR(30) NOT NULL,
    id_entidad TEXT,
    id_usuario VARCHAR(20),
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    metadata JSONB,
    fecha_evento TIMESTAMP NOT NULL DEFAULT (now() AT TIME ZONE 'America/Caracas'::text),
    CONSTRAINT auditoria_eventos_pkey PRIMARY KEY (id)
);

-- =========================================================
-- CLAVES FORÁNEAS
-- =========================================================
-- Declaradas aparte para que el orden de creación de las tablas no importe
-- (p. ej. id_usuario_registro de los catálogos apunta a usuarios).
ALTER TABLE estados ADD CONSTRAINT estados_id_usuario_registro_fkey FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(cedula);
ALTER TABLE niveles_educativos ADD CONSTRAINT niveles_educativos_id_usuario_registro_fkey FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(cedula);
ALTER TABLE condicion_trabajo ADD CONSTRAINT condicion_trabajo_id_usuario_registro_fkey FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(cedula);
ALTER TABLE condicion_actividad ADD CONSTRAINT condicion_actividad_id_usuario_registro_fkey FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(cedula);
ALTER TABLE tipo_caracteristicas ADD CONSTRAINT tipo_caracteristicas_id_usuario_registro_fkey FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(cedula);
ALTER TABLE materias ADD CONSTRAINT materias_id_usuario_registro_fkey FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(cedula);
ALTER TABLE semestres ADD CONSTRAINT semestres_id_usuario_registro_fkey FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(cedula);
ALTER TABLE usuarios ADD CONSTRAINT usuarios_id_usuario_registro_fkey FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(cedula);
ALTER TABLE password_reset_tokens ADD CONSTRAINT password_reset_tokens_cedula_usuario_fkey FOREIGN KEY (cedula_usuario) REFERENCES usuarios(cedula);
ALTER TABLE notificaciones ADD CONSTRAINT notificaciones_cedula_emisor_fkey FOREIGN KEY (cedula_emisor) REFERENCES usuarios(cedula) ON DELETE CASCADE;
ALTER TABLE notificaciones ADD CONSTRAINT notificaciones_cedula_receptor_fkey FOREIGN KEY (cedula_receptor) REFERENCES usuarios(cedula) ON DELETE CASCADE;
ALTER TABLE municipios ADD CONSTRAINT municipios_id_estado_fkey FOREIGN KEY (id_estado) REFERENCES estados(id_estado) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE municipios ADD CONSTRAINT municipios_id_usuario_registro_fkey FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(cedula);
ALTER TABLE parroquias ADD CONSTRAINT parroquias_id_estado_num_municipio_fkey FOREIGN KEY (id_estado, num_municipio) REFERENCES municipios(id_estado, num_municipio) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE parroquias ADD CONSTRAINT parroquias_id_usuario_registro_fkey FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(cedula);
ALTER TABLE nucleos ADD CONSTRAINT nucleos_id_estado_num_municipio_num_parroquia_fkey FOREIGN KEY (id_estado, num_municipio, num_parroquia) REFERENCES parroquias(id_estado, num_municipio, num_parroquia) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE nucleos ADD CONSTRAINT nucleos_id_usuario_registro_fkey FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(cedula);
ALTER TABLE solicitantes ADD CONSTRAINT solicitantes_id_actividad_fkey FOREIGN KEY (id_actividad) REFERENCES condicion_actividad(id_actividad) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE solicitantes ADD CONSTRAINT solicitantes_id_estado_num_municipio_num_parroquia_fkey FOREIGN KEY (id_estado, num_municipio, num_parroquia) REFERENCES parroquias(id_estado, num_municipio, num_parroquia) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE solicitantes ADD CONSTRAINT solicitantes_id_nivel_educativo_fkey FOREIGN KEY (id_nivel_educativo) REFERENCES niveles_educativos(id_nivel_educativo) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE solicitantes ADD CONSTRAINT solicitantes_id_trabajo_fkey FOREIGN KEY (id_trabajo) REFERENCES condicion_trabajo(id_trabajo) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE solicitantes ADD CONSTRAINT solicitantes_id_usuario_registro_fkey FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(cedula);
ALTER TABLE viviendas ADD CONSTRAINT viviendas_cedula_solicitante_fkey FOREIGN KEY (cedula_solicitante) REFERENCES solicitantes(cedula) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE viviendas ADD CONSTRAINT viviendas_id_usuario_registro_fkey FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(cedula);
ALTER TABLE familias_y_hogares ADD CONSTRAINT familias_y_hogares_cedula_solicitante_fkey FOREIGN KEY (cedula_solicitante) REFERENCES solicitantes(cedula) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE familias_y_hogares ADD CONSTRAINT familias_y_hogares_id_nivel_educativo_jefe_fkey FOREIGN KEY (id_nivel_educativo_jefe) REFERENCES niveles_educativos(id_nivel_educativo) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE familias_y_hogares ADD CONSTRAINT familias_y_hogares_id_usuario_registro_fkey FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(cedula);
ALTER TABLE caracteristicas ADD CONSTRAINT caracteristicas_id_tipo_caracteristica_fkey FOREIGN KEY (id_tipo_caracteristica) REFERENCES tipo_caracteristicas(id_tipo) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE caracteristicas ADD CONSTRAINT caracteristicas_id_usuario_registro_fkey FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(cedula);
ALTER TABLE asignadas_a ADD CONSTRAINT asignadas_a_cedula_solicitante_fkey FOREIGN KEY (cedula_solicitante) REFERENCES viviendas(cedula_solicitante) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE asignadas_a ADD CONSTRAINT asignadas_a_id_tipo_caracteristica_num_caracteristica_fkey FOREIGN KEY (id_tipo_caracteristica, num_caracteristica) REFERENCES caracteristicas(id_tipo_caracteristica, num_caracteristica) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE categorias ADD CONSTRAINT categorias_id_materia_fkey FOREIGN KEY (id_materia) REFERENCES materias(id_materia) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE categorias ADD CONSTRAINT categorias_id_usuario_registro_fkey FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(cedula);
ALTER TABLE subcategorias ADD CONSTRAINT subcategorias_id_materia_num_categoria_fkey FOREIGN KEY (id_materia, num_categoria) REFERENCES categorias(id_materia, num_categoria) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE subcategorias ADD CONSTRAINT subcategorias_id_usuario_registro_fkey FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(cedula);
ALTER TABLE ambitos_legales ADD CONSTRAINT ambitos_legales_id_materia_num_categoria_num_subcategoria_fkey FOREIGN KEY (id_materia, num_categoria, num_subcategoria) REFERENCES subcategorias(id_materia, num_categoria, num_subcategoria) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ambitos_legales ADD CONSTRAINT ambitos_legales_id_usuario_registro_fkey FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(cedula);
ALTER TABLE coordinadores ADD CONSTRAINT coordinadores_id_coordinador_fkey FOREIGN KEY (id_coordinador) REFERENCES usuarios(cedula) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE coordinadores ADD CONSTRAINT coordinadores_id_usuario_registro_fkey FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(cedula);
ALTER TABLE coordinadores ADD CONSTRAINT coordinadores_term_fkey FOREIGN KEY (term) REFERENCES semestres(term) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE estudiantes ADD CONSTRAINT estudiantes_cedula_estudiante_fkey FOREIGN KEY (cedula_estudiante) REFERENCES usuarios(cedula) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE estudiantes ADD CONSTRAINT estudiantes_id_usuario_registro_fkey FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(cedula);
ALTER TABLE estudiantes ADD CONSTRAINT estudiantes_term_fkey FOREIGN KEY (term) REFERENCES semestres(term) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE profesores ADD CONSTRAINT profesores_cedula_profesor_fkey FOREIGN KEY (cedula_profesor) REFERENCES usuarios(cedula) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE profesores ADD CONSTRAINT profesores_id_usuario_registro_fkey FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(cedula);
ALTER TABLE profesores ADD CONSTRAINT profesores_term_fkey FOREIGN KEY (term) REFERENCES semestres(term) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE casos ADD CONSTRAINT casos_cedula_fkey FOREIGN KEY (cedula) REFERENCES solicitantes(cedula) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE casos ADD CONSTRAINT casos_id_materia_num_categoria_num_subcategoria_num_ambito_fkey FOREIGN KEY (id_materia, num_categoria, num_subcategoria, num_ambito_legal) REFERENCES ambitos_legales(id_materia, num_categoria, num_subcategoria, num_ambito_legal) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE casos ADD CONSTRAINT casos_id_nucleo_fkey FOREIGN KEY (id_nucleo) REFERENCES nucleos(id_nucleo) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE casos ADD CONSTRAINT casos_id_usuario_registro_fkey FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(cedula);
ALTER TABLE citas ADD CONSTRAINT citas_id_caso_fkey FOREIGN KEY (id_caso) REFERENCES casos(id_caso) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE citas ADD CONSTRAINT citas_id_usuario_actualizo_fkey FOREIGN KEY (id_usuario_actualizo) REFERENCES usuarios(cedula);
ALTER TABLE citas ADD CONSTRAINT citas_id_usuario_registro_fkey FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(cedula) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE atienden ADD CONSTRAINT atienden_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuarios(cedula) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE atienden ADD CONSTRAINT atienden_id_usuario_registro_fkey FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(cedula);
ALTER TABLE atienden ADD CONSTRAINT atienden_num_cita_id_caso_fkey FOREIGN KEY (num_cita, id_caso) REFERENCES citas(num_cita, id_caso) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE acciones ADD CONSTRAINT acciones_id_caso_fkey FOREIGN KEY (id_caso) REFERENCES casos(id_caso) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE acciones ADD CONSTRAINT acciones_id_usuario_registra_fkey FOREIGN KEY (id_usuario_registra) REFERENCES usuarios(cedula) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE acciones ADD CONSTRAINT acciones_id_usuario_registro_fkey FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(cedula);
ALTER TABLE ejecutan ADD CONSTRAINT ejecutan_id_usuario_ejecuta_fkey FOREIGN KEY (id_usuario_ejecuta) REFERENCES usuarios(cedula) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ejecutan ADD CONSTRAINT ejecutan_num_accion_id_caso_fkey FOREIGN KEY (num_accion, id_caso) REFERENCES acciones(num_accion, id_caso) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE cambio_estatus ADD CONSTRAINT cambio_estatus_id_caso_fkey FOREIGN KEY (id_caso) REFERENCES casos(id_caso) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE cambio_estatus ADD CONSTRAINT cambio_estatus_id_usuario_cambia_fkey FOREIGN KEY (id_usuario_cambia) REFERENCES usuarios(cedula) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE cambio_estatus ADD CONSTRAINT cambio_estatus_id_usuario_registro_fkey FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(cedula);
ALTER TABLE soportes ADD CONSTRAINT soportes_id_caso_fkey FOREIGN KEY (id_caso) REFERENCES casos(id_caso) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE soportes ADD CONSTRAINT soportes_id_usuario_subio_fkey FOREIGN KEY (id_usuario_subio) REFERENCES usuarios(cedula) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE beneficiarios ADD CONSTRAINT beneficiarios_id_caso_fkey FOREIGN KEY (id_caso) REFERENCES casos(id_caso) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE beneficiarios ADD CONSTRAINT beneficiarios_id_usuario_actualizo_fkey FOREIGN KEY (id_usuario_actualizo) REFERENCES usuarios(cedula);
ALTER TABLE beneficiarios ADD CONSTRAINT beneficiarios_id_usuario_registro_fkey FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(cedula) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE supervisa ADD CONSTRAINT supervisa_id_caso_fkey FOREIGN KEY (id_caso) REFERENCES casos(id_caso) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE supervisa ADD CONSTRAINT supervisa_id_usuario_registro_fkey FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(cedula);
ALTER TABLE supervisa ADD CONSTRAINT supervisa_term_cedula_profesor_fkey FOREIGN KEY (term, cedula_profesor) REFERENCES profesores(term, cedula_profesor) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE se_le_asigna ADD CONSTRAINT se_le_asigna_id_caso_fkey FOREIGN KEY (id_caso) REFERENCES casos(id_caso) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE se_le_asigna ADD CONSTRAINT se_le_asigna_id_usuario_registro_fkey FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(cedula);
ALTER TABLE se_le_asigna ADD CONSTRAINT se_le_asigna_term_cedula_estudiante_fkey FOREIGN KEY (term, cedula_estudiante) REFERENCES estudiantes(term, cedula_estudiante) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ocurren_en ADD CONSTRAINT ocurren_en_id_caso_fkey FOREIGN KEY (id_caso) REFERENCES casos(id_caso) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ocurren_en ADD CONSTRAINT ocurren_en_term_fkey FOREIGN KEY (term) REFERENCES semestres(term) ON UPDATE CASCADE ON DELETE RESTRICT;

-- =========================================================
-- ÍNDICES
-- =========================================================
CREATE INDEX idx_password_reset_cedula ON password_reset_tokens USING btree (cedula_usuario);
CREATE INDEX idx_password_reset_code ON password_reset_tokens USING btree (codigo_verificacion);
CREATE INDEX idx_password_reset_expired ON password_reset_tokens USING btree (fecha_expiracion, usado);
CREATE INDEX idx_password_reset_cedula_activo ON password_reset_tokens USING btree (cedula_usuario, usado, fecha_expiracion);
CREATE INDEX idx_citas_usuario_actualizo ON citas USING btree (id_usuario_actualizo);
CREATE INDEX idx_citas_usuario_registro ON citas USING btree (id_usuario_registro);
CREATE INDEX idx_soportes_usuario_subio ON soportes USING btree (id_usuario_subio);
CREATE INDEX idx_beneficiarios_usuario_actualizo ON beneficiarios USING btree (id_usuario_actualizo);
CREATE INDEX idx_beneficiarios_usuario_registro ON beneficiarios USING btree (id_usuario_registro);
CREATE INDEX idx_auditoria_eventos_datos_nuevos_gin ON auditoria_eventos USING gin (datos_nuevos);
CREATE INDEX idx_auditoria_eventos_entidad_fecha ON auditoria_eventos USING btree (entidad, fecha_evento DESC);
CREATE INDEX idx_auditoria_eventos_id_entidad ON auditoria_eventos USING btree (entidad, id_entidad);
CREATE INDEX idx_auditoria_eventos_transaccion ON auditoria_eventos USING btree (id_transaccion);
CREATE INDEX idx_auditoria_eventos_usuario ON auditoria_eventos USING btree (id_usuario);
