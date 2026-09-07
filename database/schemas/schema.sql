CREATE EXTENSION IF NOT EXISTS unaccent;

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
    CHECK (fecha_fin >= fecha_inicio)
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
    foto_perfil VARCHAR(500),
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
        ON UPDATE CASCADE ON DELETE RESTRICT
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
        ON UPDATE CASCADE ON DELETE RESTRICT
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
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 12) SOLICITANTES
CREATE TABLE solicitantes (
    cedula VARCHAR(20) PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL CHECK (fecha_nacimiento <= CURRENT_DATE),
    telefono_local VARCHAR(20) CHECK (LENGTH(telefono_local) <= 11),
    telefono_celular VARCHAR(20) NOT NULL CHECK (LENGTH(telefono_celular) <= 20),
    correo_electronico VARCHAR(100) NOT NULL UNIQUE,
    
    sexo VARCHAR(1) NOT NULL CHECK (sexo IN ('M', 'F')),
    nacionalidad VARCHAR(1) NOT NULL CHECK (nacionalidad IN ('V', 'E')),
    estado_civil VARCHAR(20) NOT NULL CHECK (estado_civil IN ('Soltero', 'Casado', 'Divorciado', 'Viudo')),
    
    concubinato BOOLEAN NOT NULL,
    tipo_tiempo_estudio VARCHAR(20) CHECK (tipo_tiempo_estudio IN ('Años', 'Semestres', 'Trimestres')),
    tiempo_estudio INTEGER CHECK (tiempo_estudio >= 0),
    
    id_nivel_educativo INTEGER NOT NULL, 
    id_trabajo INTEGER,
    id_actividad INTEGER,
    
    id_estado INTEGER NOT NULL,
    num_municipio INTEGER NOT NULL,
    num_parroquia INTEGER NOT NULL,
    direccion_habitacion VARCHAR(500),
    
    FOREIGN KEY (id_nivel_educativo) REFERENCES niveles_educativos(id_nivel_educativo) 
        ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_trabajo) REFERENCES condicion_trabajo(id_trabajo) 
        ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_actividad) REFERENCES condicion_actividad(id_actividad) 
        ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_estado, num_municipio, num_parroquia) 
        REFERENCES parroquias(id_estado, num_municipio, num_parroquia) 
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 13) VIVIENDAS
CREATE TABLE viviendas (
    cedula_solicitante VARCHAR(20) PRIMARY KEY,
    cant_habitaciones INTEGER NOT NULL CHECK (cant_habitaciones >= 0),
    cant_banos INTEGER NOT NULL CHECK (cant_banos >= 0),
    FOREIGN KEY (cedula_solicitante) REFERENCES solicitantes(cedula) 
        ON UPDATE CASCADE ON DELETE RESTRICT
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
    id_nivel_educativo_jefe INTEGER,
    
    FOREIGN KEY (id_nivel_educativo_jefe) REFERENCES niveles_educativos(id_nivel_educativo)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (cedula_solicitante) REFERENCES solicitantes(cedula) 
        ON UPDATE CASCADE ON DELETE RESTRICT,
    
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
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 16) ASIGNADAS_A
CREATE TABLE asignadas_a (
    cedula_solicitante VARCHAR(20) NOT NULL,
    id_tipo_caracteristica INTEGER NOT NULL,
    num_caracteristica INTEGER NOT NULL,
    
    PRIMARY KEY (cedula_solicitante, id_tipo_caracteristica, num_caracteristica),
    FOREIGN KEY (cedula_solicitante) REFERENCES viviendas(cedula_solicitante) 
        ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_tipo_caracteristica, num_caracteristica) 
        REFERENCES caracteristicas(id_tipo_caracteristica, num_caracteristica) 
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 17) CATEGORÍAS
CREATE TABLE categorias (
    id_materia INTEGER NOT NULL,
    num_categoria INTEGER NOT NULL,
    nombre_categoria VARCHAR(100) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id_materia, num_categoria),
    FOREIGN KEY (id_materia) REFERENCES materias(id_materia) 
        ON UPDATE CASCADE ON DELETE RESTRICT
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
        ON UPDATE CASCADE ON DELETE RESTRICT
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
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 20) COORDINADORES
CREATE TABLE coordinadores (
    id_coordinador VARCHAR(20) PRIMARY KEY,
    term VARCHAR(20) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT TRUE,
    
    FOREIGN KEY (term) REFERENCES semestres(term) 
        ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_coordinador) REFERENCES usuarios(cedula) 
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 21) ESTUDIANTES
CREATE TABLE estudiantes (
    term VARCHAR(20) NOT NULL,
    cedula_estudiante VARCHAR(20) NOT NULL,
    tipo_estudiante VARCHAR(50) NOT NULL CHECK (tipo_estudiante IN ('Voluntario', 'Inscrito', 'Egresado', 'Servicio Comunitario')),
    nrc VARCHAR(20) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (term, cedula_estudiante),
    FOREIGN KEY (term) REFERENCES semestres(term) 
        ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (cedula_estudiante) REFERENCES usuarios(cedula) 
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 22) PROFESORES
CREATE TABLE profesores (
    term VARCHAR(20) NOT NULL,
    cedula_profesor VARCHAR(20) NOT NULL,
    tipo_profesor VARCHAR(50) NOT NULL CHECK (tipo_profesor IN ('Voluntario', 'Asesor')),
    habilitado BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (term, cedula_profesor),
    FOREIGN KEY (term) REFERENCES semestres(term) 
        ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (cedula_profesor) REFERENCES usuarios(cedula) 
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 23) CASOS
CREATE TABLE casos (
    id_caso SERIAL PRIMARY KEY,
    fecha_solicitud DATE NOT NULL DEFAULT CURRENT_DATE CHECK (fecha_solicitud <= CURRENT_DATE),
    fecha_inicio_caso DATE NOT NULL CHECK (fecha_inicio_caso <= CURRENT_DATE),
    fecha_fin_caso DATE,
    
    tramite VARCHAR(200) NOT NULL CHECK (tramite IN ('Asesoría', 'Conciliación y Mediación', 'Redacción documentos y/o convenio', 'Asistencia Judicial - Casos externos')),
    observaciones TEXT,
    
    id_nucleo INTEGER NOT NULL,
    cedula VARCHAR(20) NOT NULL,
    
    id_materia INTEGER NOT NULL,
    num_categoria INTEGER NOT NULL,
    num_subcategoria INTEGER NOT NULL,
    num_ambito_legal INTEGER NOT NULL,
    
    FOREIGN KEY (id_nucleo) REFERENCES nucleos(id_nucleo) 
        ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (cedula) REFERENCES solicitantes(cedula) 
        ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_materia, num_categoria, num_subcategoria, num_ambito_legal)
        REFERENCES ambitos_legales(id_materia, num_categoria, num_subcategoria, num_ambito_legal) 
        ON UPDATE CASCADE ON DELETE RESTRICT,
    
    CONSTRAINT chk_casos_inicio_post_solicitud CHECK (fecha_inicio_caso >= fecha_solicitud),
    CONSTRAINT chk_casos_fin_post_inicio CHECK (fecha_fin_caso IS NULL OR fecha_fin_caso >= fecha_inicio_caso)
);

-- 24) CITAS
CREATE TABLE citas (
    num_cita INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    fecha_proxima_cita DATE,
    fecha_encuentro DATE NOT NULL,
    orientacion TEXT NOT NULL,
    id_usuario_registro VARCHAR(20),
    
    PRIMARY KEY (id_caso, num_cita),
    FOREIGN KEY (id_caso) REFERENCES casos(id_caso) 
        ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(cedula) 
        ON UPDATE RESTRICT ON DELETE RESTRICT,
        
    CHECK (fecha_proxima_cita IS NULL OR fecha_proxima_cita > fecha_encuentro)
);

-- 25) ATIENDEN
CREATE TABLE atienden (
    id_usuario VARCHAR(20) NOT NULL,
    num_cita INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE CHECK (fecha_registro <= CURRENT_DATE),
    
    PRIMARY KEY (id_caso, num_cita, id_usuario),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(cedula) 
        ON UPDATE RESTRICT ON DELETE RESTRICT,
    FOREIGN KEY (id_caso, num_cita) REFERENCES citas(id_caso, num_cita) 
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 26) ACCIONES
CREATE TABLE acciones (
    num_accion INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    detalle_accion TEXT NOT NULL,
    comentario TEXT,
    id_usuario_registra VARCHAR(20) NOT NULL,
    fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE CHECK (fecha_registro <= CURRENT_DATE),
    
    PRIMARY KEY (id_caso, num_accion),
    FOREIGN KEY (id_caso) REFERENCES casos(id_caso) 
        ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_usuario_registra) REFERENCES usuarios(cedula) 
        ON UPDATE RESTRICT ON DELETE RESTRICT
);

-- 27) EJECUTAN
CREATE TABLE ejecutan (
    id_usuario_ejecuta VARCHAR(20) NOT NULL,
    num_accion INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    fecha_ejecucion DATE NOT NULL DEFAULT CURRENT_DATE CHECK (fecha_ejecucion <= CURRENT_DATE),
    
    PRIMARY KEY (id_caso, num_accion, id_usuario_ejecuta),
    FOREIGN KEY (id_usuario_ejecuta) REFERENCES usuarios(cedula) 
        ON UPDATE RESTRICT ON DELETE RESTRICT,
    FOREIGN KEY (id_caso, num_accion) REFERENCES acciones(id_caso, num_accion) 
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 28) CAMBIO ESTATUS
CREATE TABLE cambio_estatus (
    num_cambio INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    motivo TEXT,
    nuevo_estatus VARCHAR(50) NOT NULL CHECK (nuevo_estatus IN ('En proceso', 'Archivado', 'Entregado', 'Asesoría')),
    fecha TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'America/Caracas'),
    id_usuario_cambia VARCHAR(20) NOT NULL,
    
    PRIMARY KEY (id_caso, num_cambio),
    FOREIGN KEY (id_caso) REFERENCES casos(id_caso) 
        ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_usuario_cambia) REFERENCES usuarios(cedula) 
        ON UPDATE RESTRICT ON DELETE RESTRICT
);

-- 29) SOPORTES
CREATE TABLE soportes (
    num_soporte INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    
    url_documento VARCHAR(500),
    nombre_archivo VARCHAR(150) NOT NULL,
    tipo_mime VARCHAR(100) NOT NULL,
    descripcion TEXT,
    
    fecha_consignacion DATE NOT NULL DEFAULT CURRENT_DATE CHECK (fecha_consignacion <= CURRENT_DATE),
    
    id_usuario_subio VARCHAR(20),
    
    PRIMARY KEY (id_caso, num_soporte),
    FOREIGN KEY (id_caso) REFERENCES casos(id_caso) 
        ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_usuario_subio) REFERENCES usuarios(cedula) 
        ON UPDATE RESTRICT ON DELETE RESTRICT
);

-- 30) BENEFICIARIOS 
CREATE TABLE beneficiarios (
    num_beneficiario INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    cedula VARCHAR(20),
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    fecha_nac DATE NOT NULL CHECK (fecha_nac <= CURRENT_DATE),
    
    sexo VARCHAR(20) NOT NULL CHECK (sexo IN ('M', 'F')),
    tipo_beneficiario VARCHAR(50) NOT NULL CHECK (tipo_beneficiario IN ('Directo', 'Indirecto')),
    parentesco VARCHAR(50) NOT NULL,
    
    id_usuario_registro VARCHAR(20),
    
    PRIMARY KEY (id_caso, num_beneficiario),
    FOREIGN KEY (id_caso) REFERENCES casos(id_caso) 
        ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(cedula)
        ON UPDATE RESTRICT ON DELETE RESTRICT
);

-- 31) SUPERVISA
CREATE TABLE supervisa (
    term VARCHAR(20) NOT NULL,
    cedula_profesor VARCHAR(20) NOT NULL,
    id_caso INTEGER NOT NULL,
    
    habilitado BOOLEAN NOT NULL DEFAULT TRUE,
    
    PRIMARY KEY (term, cedula_profesor, id_caso),
    FOREIGN KEY (term, cedula_profesor) REFERENCES profesores(term, cedula_profesor) 
        ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_caso) REFERENCES casos(id_caso) 
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 32) SE LE ASIGNA
CREATE TABLE se_le_asigna (
    term VARCHAR(20) NOT NULL,
    cedula_estudiante VARCHAR(20) NOT NULL,
    id_caso INTEGER NOT NULL,
    
    habilitado BOOLEAN NOT NULL DEFAULT TRUE,
    
    PRIMARY KEY (term, cedula_estudiante, id_caso),
    FOREIGN KEY (term, cedula_estudiante) REFERENCES estudiantes(term, cedula_estudiante) 
        ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_caso) REFERENCES casos(id_caso) 
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 33) OCURREN_EN
CREATE TABLE ocurren_en (
    id_caso INTEGER NOT NULL,
    term VARCHAR(20) NOT NULL,
    
    PRIMARY KEY (id_caso, term),
    FOREIGN KEY (id_caso) REFERENCES casos(id_caso) 
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (term) REFERENCES semestres(term) 
        ON UPDATE CASCADE ON DELETE RESTRICT
);


-- =========================================================
-- SISTEMA DE AUDITORÍA UNIFICADO
-- =========================================================

CREATE TABLE auditoria_eventos (
    id BIGSERIAL PRIMARY KEY,
    id_transaccion BIGINT DEFAULT txid_current(),
    entidad VARCHAR(50) NOT NULL,
    operacion VARCHAR(30) NOT NULL,
    id_entidad TEXT,
    id_usuario VARCHAR(20),
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    metadata JSONB,
    fecha_evento TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

CREATE INDEX idx_auditoria_eventos_entidad_fecha ON auditoria_eventos (entidad, fecha_evento DESC);
CREATE INDEX idx_auditoria_eventos_usuario ON auditoria_eventos (id_usuario);
CREATE INDEX idx_auditoria_eventos_id_entidad ON auditoria_eventos (entidad, id_entidad);
CREATE INDEX idx_auditoria_eventos_transaccion ON auditoria_eventos (id_transaccion);
CREATE INDEX idx_auditoria_eventos_datos_nuevos_gin ON auditoria_eventos USING GIN (datos_nuevos);

CREATE OR REPLACE FUNCTION public.fn_auditoria_generica()
RETURNS trigger LANGUAGE plpgsql AS $function$
DECLARE
    v_usuario   VARCHAR(20);
    v_entidad   TEXT := TG_ARGV[0];
    v_pk_cols   TEXT[] := string_to_array(TG_ARGV[1], ',');
    v_old       JSONB; v_new JSONB;
    v_before    JSONB := '{}'::jsonb; v_after JSONB := '{}'::jsonb;
    v_key       TEXT; v_id_entidad TEXT;
BEGIN
    IF current_setting('app.skip_audit_trigger', true) = 'true' THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    v_usuario := NULLIF(current_setting('app.current_user_id', true), '');

    IF TG_OP = 'INSERT' THEN
        v_after := to_jsonb(NEW);
        v_id_entidad := (SELECT string_agg(to_jsonb(NEW)->>c, '-') FROM unnest(v_pk_cols) c);
        
        INSERT INTO auditoria_eventos(entidad, operacion, id_entidad, id_usuario, datos_nuevos, metadata)
        VALUES (v_entidad, 'insercion', v_id_entidad, v_usuario, v_after, NULLIF(current_setting('app.audit_metadata', true), '')::jsonb);
                
    ELSIF TG_OP = 'DELETE' THEN
        v_before := to_jsonb(OLD);
        v_id_entidad := (SELECT string_agg(to_jsonb(OLD)->>c, '-') FROM unnest(v_pk_cols) c);
        
        INSERT INTO auditoria_eventos(entidad, operacion, id_entidad, id_usuario, datos_anteriores, metadata)
        VALUES (v_entidad, 'eliminacion', v_id_entidad, v_usuario, v_before, NULLIF(current_setting('app.audit_metadata', true), '')::jsonb);
                
    ELSE -- UPDATE
        v_old := to_jsonb(OLD); v_new := to_jsonb(NEW);
        
        FOR v_key IN SELECT key FROM jsonb_object_keys(v_new) key LOOP
            IF v_old->v_key IS DISTINCT FROM v_new->v_key THEN
                v_before := v_before || jsonb_build_object(v_key, v_old->v_key);
                v_after  := v_after  || jsonb_build_object(v_key, v_new->v_key);
            END IF;
        END LOOP;
        
        IF v_before <> '{}'::jsonb THEN
            v_id_entidad := (SELECT string_agg(v_new->>c, '-') FROM unnest(v_pk_cols) c);
            INSERT INTO auditoria_eventos(entidad, operacion, id_entidad, id_usuario, datos_anteriores, datos_nuevos, metadata)
            VALUES (v_entidad, 'actualizacion', v_id_entidad, v_usuario, v_before, v_after, NULLIF(current_setting('app.audit_metadata', true), '')::jsonb);
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END; $function$;


-- Vista para casos con estatus derivado y cantidad de beneficiarios
CREATE VIEW view_casos_completo AS
SELECT 
    c.*,
    -- Estatus derivado: el último cambio de estatus registrado
    COALESCE(
        (SELECT nuevo_estatus 
         FROM cambio_estatus ce 
         WHERE ce.id_caso = c.id_caso 
         ORDER BY ce.fecha DESC, ce.num_cambio DESC 
         LIMIT 1),
        'En proceso' -- Estatus por defecto si no hay cambios registrados
    ) AS estatus,
    -- Cantidad de beneficiarios derivada: conteo de beneficiarios
    COALESCE(
        (SELECT COUNT(*) 
         FROM beneficiarios b 
         WHERE b.id_caso = c.id_caso),
        0
    ) AS cant_beneficiarios
FROM casos c;

-- Vista para solicitantes con edad derivada
CREATE VIEW view_solicitantes_completo AS
SELECT 
    s.*,
    -- Edad derivada: calculada desde fecha_nacimiento
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, s.fecha_nacimiento))::INTEGER AS edad
FROM solicitantes s;

-- Vista para beneficiarios con edad derivada
CREATE VIEW view_beneficiarios_completo AS
SELECT 
    b.*,
    -- Edad derivada: calculada desde fecha_nac
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, b.fecha_nac))::INTEGER AS edad
FROM beneficiarios b;

-- Vista combinada: casos con toda la información derivada y relacionada
CREATE VIEW view_casos_detalle AS
SELECT 
    c.*,
    -- Estatus derivado
    COALESCE(
        (SELECT nuevo_estatus 
         FROM cambio_estatus ce 
         WHERE ce.id_caso = c.id_caso 
         ORDER BY ce.fecha DESC, ce.num_cambio DESC 
         LIMIT 1),
        'En proceso'
    ) AS estatus,
    -- Cantidad de beneficiarios derivada
    COALESCE(
        (SELECT COUNT(*) 
         FROM beneficiarios b 
         WHERE b.id_caso = c.id_caso),
        0
    ) AS cant_beneficiarios,
    -- Información del solicitante
    s.nombres AS nombres_solicitante,
    s.apellidos AS apellidos_solicitante,
    s.nombres || ' ' || s.apellidos AS nombre_completo_solicitante,
    -- Información del núcleo
    n.nombre_nucleo,
    -- Información del ámbito legal
    m.nombre_materia,
    cat.nombre_categoria,
    sub.nombre_subcategoria,
    al.nombre_ambito_legal AS nombre_ambito_legal
FROM casos c
INNER JOIN solicitantes s ON c.cedula = s.cedula
INNER JOIN nucleos n ON c.id_nucleo = n.id_nucleo
INNER JOIN ambitos_legales al ON c.id_materia = al.id_materia 
    AND c.num_categoria = al.num_categoria 
    AND c.num_subcategoria = al.num_subcategoria 
    AND c.num_ambito_legal = al.num_ambito_legal
INNER JOIN materias m ON al.id_materia = m.id_materia
INNER JOIN categorias cat ON al.id_materia = cat.id_materia AND al.num_categoria = cat.num_categoria
INNER JOIN subcategorias sub ON al.id_materia = sub.id_materia 
    AND al.num_categoria = sub.num_categoria 
    AND al.num_subcategoria = sub.num_subcategoria;



-- =========================================================
-- FUNCIONES DE BASE DE DATOS
-- Este archivo debe ejecutarse ANTES de roles_permissions.sql
-- =========================================================

-- =========================================================
-- FUNCION: eliminar_caso_fisico
-- Elimina físicamente un caso y todas sus referencias asociadas.
-- Parámetros:
--   p_id_caso INTEGER: ID del caso a eliminar
--   p_cedula_actor VARCHAR(20): Usuario que realiza la acción
--   p_motivo TEXT: Motivo de la eliminación (obligatorio)
--

CREATE OR REPLACE FUNCTION eliminar_caso_fisico(
    p_id_caso INTEGER,
    p_cedula_actor VARCHAR,
    p_motivo TEXT
) RETURNS VOID AS $$
DECLARE
    v_motivo_relacionados TEXT;
    v_ejecutores_json JSONB;
BEGIN
    -- Validar motivo
    IF p_motivo IS NULL OR TRIM(p_motivo) = '' THEN
        RAISE EXCEPTION 'El motivo es obligatorio para eliminaciones físicas de casos';
    END IF;

    -- Verificar existencia del caso
    IF NOT EXISTS (SELECT 1 FROM casos WHERE id_caso = p_id_caso) THEN
        RAISE EXCEPTION 'El caso con ID % no existe', p_id_caso;
    END IF;

    -- Construir motivo para entidades relacionadas
    v_motivo_relacionados := p_motivo || ' (Eliminado por eliminación del caso #' || p_id_caso || ')';
    
    -- =========================================================
    -- Capturar ejecutores de todas las acciones del caso ANTES de eliminarlos
    -- Incluye:
    --   - ejecutores_texto: String con nombres concatenados
    --   - fecha_ejecucion: Primera fecha de ejecución
    --   - ejecutores_detalle: Array JSON con datos de cada ejecutor
    -- =========================================================
    SELECT COALESCE(jsonb_object_agg(
        e.num_accion::text,
        jsonb_build_object(
            'ejecutores_texto', (
                SELECT string_agg(u.nombres || ' ' || u.apellidos, ', ')
                FROM ejecutan e2
                JOIN usuarios u ON e2.id_usuario_ejecuta = u.cedula
                WHERE e2.num_accion = e.num_accion AND e2.id_caso = e.id_caso
            ),
            'fecha_ejecucion', (
                SELECT MIN(e3.fecha_ejecucion)
                FROM ejecutan e3
                WHERE e3.num_accion = e.num_accion AND e3.id_caso = e.id_caso
            ),
            'ejecutores_detalle', (
                SELECT jsonb_agg(jsonb_build_object(
                    'cedula', e4.id_usuario_ejecuta,
                    'nombres', u2.nombres,
                    'apellidos', u2.apellidos,
                    'fecha', e4.fecha_ejecucion
                ))
                FROM ejecutan e4
                JOIN usuarios u2 ON e4.id_usuario_ejecuta = u2.cedula
                WHERE e4.num_accion = e.num_accion AND e4.id_caso = e.id_caso
            )
        )
    ), '{}'::jsonb)
    INTO v_ejecutores_json
    FROM (SELECT DISTINCT num_accion, id_caso FROM ejecutan WHERE id_caso = p_id_caso) e;

    BEGIN
        -- =========================================================
        -- Variables de sesión para el trigger genérico de auditoría: un solo
        -- actor y un solo motivo (con contexto) para toda la cascada de deletes.
        -- =========================================================
        PERFORM set_config('app.current_user_id', p_cedula_actor, true);
        PERFORM set_config('app.audit_metadata', jsonb_build_object('motivo', v_motivo_relacionados)::text, true);

        -- Registrar los ejecutores de cada acción como su propio evento de auditoría
        -- ANTES de borrarlos (una vez eliminado `ejecutan`, esta información se pierde).
        INSERT INTO auditoria_eventos (entidad, operacion, id_entidad, id_usuario, datos_anteriores, metadata)
        SELECT
            'accion_ejecutores',
            'eliminacion',
            num_accion,
            p_cedula_actor,
            jsonb_build_object('ejecutores', detalle -> 'ejecutores_detalle'),
            jsonb_build_object('motivo', v_motivo_relacionados)
        FROM jsonb_each(v_ejecutores_json) AS t(num_accion, detalle);

        -- =========================================================
        -- Eliminar referencias en orden inverso de dependencias
        -- =========================================================

        -- 1. Eliminar ejecutores (depende de acciones)
        DELETE FROM ejecutan WHERE id_caso = p_id_caso;

        -- 2. Eliminar acciones (depende de casos)
        DELETE FROM acciones WHERE id_caso = p_id_caso;
        
        -- 3. Eliminar atienden (depende de citas)
        DELETE FROM atienden WHERE id_caso = p_id_caso;
        
        -- 4. Eliminar citas (depende de casos)
        DELETE FROM citas WHERE id_caso = p_id_caso;
        
        -- 5. Eliminar cambios de estatus (depende de casos)
        DELETE FROM cambio_estatus WHERE id_caso = p_id_caso;
        
        -- 6. Eliminar soportes (depende de casos)
        DELETE FROM soportes WHERE id_caso = p_id_caso;
        
        -- 7. Eliminar beneficiarios (depende de casos)
        DELETE FROM beneficiarios WHERE id_caso = p_id_caso;
        
        -- 8. Eliminar supervisa (depende de casos)
        DELETE FROM supervisa WHERE id_caso = p_id_caso;
        
        -- 9. Eliminar se_le_asigna (depende de casos)
        DELETE FROM se_le_asigna WHERE id_caso = p_id_caso;

        -- 10. Eliminar el caso (el trigger registrará la auditoría antes de eliminar)
        DELETE FROM casos WHERE id_caso = p_id_caso;

    EXCEPTION
        WHEN foreign_key_violation THEN
            RAISE EXCEPTION 'No se puede eliminar el caso porque aún tiene referencias activas. Detalle: %', SQLERRM;
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Error al eliminar caso: %', SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- FUNCION: eliminar_usuario_fisico
-- Elimina físicamente un usuario y todas sus referencias asociadas.
-- Parámetros:
--   p_cedula_usuario VARCHAR(20): Usuario a eliminar
--   p_cedula_actor   VARCHAR(20): Usuario que realiza la acción
--   p_motivo         TEXT: Motivo de la eliminación (obligatorio)
--

CREATE OR REPLACE FUNCTION eliminar_usuario_fisico(
    p_cedula_usuario VARCHAR,
    p_cedula_actor VARCHAR,
    p_motivo TEXT
) RETURNS VOID AS $$
DECLARE
    casos_count INTEGER;
    acciones_count INTEGER;
    v_nombres_usuario VARCHAR(100);
    v_apellidos_usuario VARCHAR(100);
BEGIN
    -- Validar motivo
    IF p_motivo IS NULL OR TRIM(p_motivo) = '' THEN
        RAISE EXCEPTION 'El motivo es obligatorio para eliminaciones físicas de usuarios';
    END IF;

    -- Verificar existencia del usuario y obtener sus datos
    SELECT nombres, apellidos INTO STRICT v_nombres_usuario, v_apellidos_usuario
    FROM usuarios 
    WHERE cedula = p_cedula_usuario;

    -- Contar casos y acciones asociadas para mostrarlos al usuario
    SELECT COUNT(*) INTO casos_count FROM (
        SELECT 1 FROM casos c INNER JOIN supervisa s ON c.id_caso = s.id_caso WHERE s.cedula_profesor = p_cedula_usuario
        UNION ALL
        SELECT 1 FROM casos c INNER JOIN se_le_asigna sla ON c.id_caso = sla.id_caso WHERE sla.cedula_estudiante = p_cedula_usuario
    ) t;

    SELECT COUNT(*) INTO acciones_count FROM acciones WHERE id_usuario_registra = p_cedula_usuario;

    IF casos_count > 0 OR acciones_count > 0 THEN
        RAISE WARNING 'Este usuario tiene % caso(s) y % acción(es) asociados. Esta información se perderá.', casos_count, acciones_count;
    END IF;

    BEGIN
        -- Eliminar referencias operativas (no de auditoría)
        DELETE FROM password_reset_tokens WHERE cedula_usuario = p_cedula_usuario;
        DELETE FROM atienden WHERE id_usuario = p_cedula_usuario;
        DELETE FROM ejecutan WHERE id_usuario_ejecuta = p_cedula_usuario;
        DELETE FROM supervisa WHERE cedula_profesor = p_cedula_usuario;
        DELETE FROM se_le_asigna WHERE cedula_estudiante = p_cedula_usuario;
        UPDATE acciones SET id_usuario_registra = NULL WHERE id_usuario_registra = p_cedula_usuario;
        UPDATE cambio_estatus SET id_usuario_cambia = NULL WHERE id_usuario_cambia = p_cedula_usuario;
        DELETE FROM coordinadores WHERE id_coordinador = p_cedula_usuario;
        DELETE FROM estudiantes WHERE cedula_estudiante = p_cedula_usuario;
        DELETE FROM profesores WHERE cedula_profesor = p_cedula_usuario;
        
        -- Actualizar referencias en citas
        UPDATE citas SET id_usuario_registro = NULL WHERE id_usuario_registro = p_cedula_usuario;
        
        -- Actualizar referencias en soporte
        UPDATE soportes SET id_usuario_subio = NULL WHERE id_usuario_subio = p_cedula_usuario;



        -- Auditoría de eliminación: la captura el trigger genérico sobre `usuarios`,
        -- que lee el actor de app.current_user_id y el motivo de app.audit_metadata.
        PERFORM set_config('app.current_user_id', p_cedula_actor, true);
        PERFORM set_config('app.audit_metadata', jsonb_build_object('motivo', p_motivo)::text, true);

        -- Eliminar de usuarios (después de dejar seteadas las variables de auditoría)
        DELETE FROM usuarios WHERE cedula = p_cedula_usuario;

    EXCEPTION
        WHEN foreign_key_violation THEN
            -- Obtener más detalles sobre qué foreign key está causando el problema
            RAISE EXCEPTION 'No se puede eliminar el usuario porque aún tiene referencias activas en tablas operativas. Detalle: %. Use disable.sql (Soft Delete) en su lugar.', SQLERRM;
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Error al eliminar usuario: %', SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- FUNCION: toggle_habilitado_usuario
-- Habilita o deshabilita un usuario y registra en auditoría.
-- Parámetros:
--   p_cedula_usuario VARCHAR(20): Usuario a modificar
--   p_cedula_actor   VARCHAR(20): Usuario que realiza la acción
--

CREATE OR REPLACE FUNCTION toggle_habilitado_usuario(
    p_cedula_usuario VARCHAR,
    p_cedula_actor VARCHAR
) RETURNS VOID AS $$
DECLARE
    v_habilitado_anterior BOOLEAN;
    v_habilitado_nuevo BOOLEAN;
    v_nombres_anterior VARCHAR;
    v_apellidos_anterior VARCHAR;
    v_correo_electronico_anterior VARCHAR;
    v_nombre_usuario_anterior VARCHAR;
    v_telefono_celular_anterior VARCHAR;
    v_tipo_usuario_anterior VARCHAR;
    v_tipo_estudiante_anterior VARCHAR;
    v_tipo_profesor_anterior VARCHAR;
BEGIN
    -- Obtener valores anteriores
    SELECT nombres, apellidos, correo_electronico, nombre_usuario, telefono_celular, habilitado_sistema, tipo_usuario
    INTO v_nombres_anterior, v_apellidos_anterior, v_correo_electronico_anterior, v_nombre_usuario_anterior, v_telefono_celular_anterior, v_habilitado_anterior, v_tipo_usuario_anterior
    FROM usuarios WHERE cedula = p_cedula_usuario;

    -- Obtener tipo_estudiante anterior si aplica
    IF v_tipo_usuario_anterior = 'Estudiante' THEN
        SELECT tipo_estudiante INTO v_tipo_estudiante_anterior FROM estudiantes WHERE cedula_estudiante = p_cedula_usuario AND habilitado = TRUE;
    END IF;
    
    -- Obtener tipo_profesor anterior si aplica
    IF v_tipo_usuario_anterior = 'Profesor' THEN
        SELECT tipo_profesor INTO v_tipo_profesor_anterior FROM profesores WHERE cedula_profesor = p_cedula_usuario AND habilitado = TRUE;
    END IF;

    -- Auditoría de la actualización: la captura el trigger genérico sobre `usuarios`.
    IF p_cedula_actor IS NOT NULL AND p_cedula_actor != '' THEN
        PERFORM set_config('app.current_user_id', p_cedula_actor, true);
    END IF;

    -- Actualizar habilitado_sistema
    UPDATE usuarios
    SET habilitado_sistema = NOT habilitado_sistema
    WHERE cedula = p_cedula_usuario;

    -- Obtener el nuevo valor
    SELECT habilitado_sistema INTO v_habilitado_nuevo FROM usuarios WHERE cedula = p_cedula_usuario;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- PROCEDIMIENTO: update_all_by_cedula
-- Actualiza toda la información de un usuario filtrando por cédula
-- Incluye auditoría manual para capturar cambios en tipo_estudiante y tipo_profesor
-- =============================================
CREATE OR REPLACE PROCEDURE update_all_by_cedula(
    p_cedula                VARCHAR,
    p_nombres               VARCHAR DEFAULT NULL,
    p_apellidos             VARCHAR DEFAULT NULL,
    p_correo_electronico    VARCHAR DEFAULT NULL,
    p_nombre_usuario        VARCHAR DEFAULT NULL,
    p_telefono_celular      VARCHAR DEFAULT NULL,
    p_tipo_usuario          VARCHAR DEFAULT NULL,
    -- Estudiante
    p_estudiante_nrc        VARCHAR DEFAULT NULL,
    p_estudiante_term       VARCHAR DEFAULT NULL,
    p_estudiante_tipo       VARCHAR DEFAULT NULL,
    -- Profesor
    p_profesor_term         VARCHAR DEFAULT NULL,
    p_profesor_tipo         VARCHAR DEFAULT NULL,
    -- Coordinador
    p_coordinador_term      VARCHAR DEFAULT NULL,
    p_cedula_actor          VARCHAR DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
    DECLARE
        v_nombres_anterior VARCHAR;
        v_apellidos_anterior VARCHAR;
        v_correo_electronico_anterior VARCHAR;
        v_nombre_usuario_anterior VARCHAR;
        v_telefono_celular_anterior VARCHAR;
        v_habilitado_sistema_anterior BOOLEAN;
        v_tipo_usuario_anterior VARCHAR;
        v_tipo_estudiante_anterior VARCHAR;
        v_tipo_profesor_anterior VARCHAR;
        v_tipo_estudiante_nuevo VARCHAR;
        v_tipo_profesor_nuevo VARCHAR;
        v_hubo_cambios BOOLEAN := FALSE;
    BEGIN
        -- Obtener valores anteriores
        SELECT nombres, apellidos, correo_electronico, nombre_usuario, telefono_celular, habilitado_sistema, tipo_usuario
        INTO v_nombres_anterior, v_apellidos_anterior, v_correo_electronico_anterior, v_nombre_usuario_anterior, v_telefono_celular_anterior, v_habilitado_sistema_anterior, v_tipo_usuario_anterior
        FROM usuarios WHERE cedula = p_cedula;

        IF v_tipo_usuario_anterior = 'Estudiante' THEN
            SELECT tipo_estudiante INTO v_tipo_estudiante_anterior FROM estudiantes WHERE cedula_estudiante = p_cedula AND habilitado = TRUE;
        END IF;
        
        IF v_tipo_usuario_anterior = 'Profesor' THEN
            SELECT tipo_profesor INTO v_tipo_profesor_anterior FROM profesores WHERE cedula_profesor = p_cedula AND habilitado = TRUE;
        END IF;

        -- Auditoría de la actualización: la captura el trigger genérico sobre `usuarios`.
        IF p_cedula_actor IS NOT NULL AND p_cedula_actor != '' THEN
            PERFORM set_config('app.current_user_id', p_cedula_actor, true);
        END IF;

        -- Actualizar tabla usuarios
        UPDATE usuarios
        SET
            nombres = COALESCE(p_nombres, nombres),
            apellidos = COALESCE(p_apellidos, apellidos), 
            correo_electronico = COALESCE(p_correo_electronico, correo_electronico), 
            nombre_usuario = COALESCE(p_nombre_usuario, nombre_usuario),
            telefono_celular = COALESCE(p_telefono_celular, telefono_celular),
            tipo_usuario = COALESCE(p_tipo_usuario, tipo_usuario)
        WHERE cedula = p_cedula;

        -- Manejo de cambio de tipo_usuario
        IF p_tipo_usuario IS NOT NULL AND v_tipo_usuario_anterior IS DISTINCT FROM p_tipo_usuario THEN
            IF v_tipo_usuario_anterior = 'Estudiante' THEN
                UPDATE estudiantes SET habilitado = FALSE WHERE cedula_estudiante = p_cedula;
            ELSIF v_tipo_usuario_anterior = 'Profesor' THEN
                UPDATE profesores SET habilitado = FALSE WHERE cedula_profesor = p_cedula;
            ELSIF v_tipo_usuario_anterior = 'Coordinador' THEN
                UPDATE coordinadores SET habilitado = FALSE WHERE id_coordinador = p_cedula;
            END IF;

            IF p_tipo_usuario = 'Estudiante' THEN
                IF EXISTS (SELECT 1 FROM estudiantes WHERE cedula_estudiante = p_cedula) THEN
                    UPDATE estudiantes SET nrc = COALESCE(p_estudiante_nrc, nrc), term = COALESCE(p_estudiante_term, term), tipo_estudiante = COALESCE(p_estudiante_tipo, tipo_estudiante), habilitado = TRUE WHERE cedula_estudiante = p_cedula;
                ELSE
                    INSERT INTO estudiantes (cedula_estudiante, nrc, term, tipo_estudiante, habilitado) VALUES (p_cedula, p_estudiante_nrc, p_estudiante_term, p_estudiante_tipo, TRUE);
                END IF;
                v_tipo_estudiante_nuevo := p_estudiante_tipo;
            ELSIF p_tipo_usuario = 'Profesor' THEN
                IF EXISTS (SELECT 1 FROM profesores WHERE cedula_profesor = p_cedula) THEN
                    UPDATE profesores SET term = COALESCE(p_profesor_term, term), tipo_profesor = COALESCE(p_profesor_tipo, tipo_profesor), habilitado = TRUE WHERE cedula_profesor = p_cedula;
                ELSE
                    INSERT INTO profesores (cedula_profesor, term, tipo_profesor, habilitado) VALUES (p_cedula, p_profesor_term, p_profesor_tipo, TRUE);
                END IF;
                v_tipo_profesor_nuevo := p_profesor_tipo;
            ELSIF p_tipo_usuario = 'Coordinador' THEN
                IF EXISTS (SELECT 1 FROM coordinadores WHERE id_coordinador = p_cedula) THEN
                    UPDATE coordinadores SET term = COALESCE(p_coordinador_term, term), habilitado = TRUE WHERE id_coordinador = p_cedula;
                ELSE
                    INSERT INTO coordinadores (id_coordinador, term, habilitado) VALUES (p_cedula, p_coordinador_term, TRUE);
                END IF;
            END IF;
        ELSE
            IF COALESCE(p_tipo_usuario, v_tipo_usuario_anterior) = 'Estudiante' THEN
                UPDATE estudiantes SET nrc = COALESCE(p_estudiante_nrc, nrc), term = COALESCE(p_estudiante_term, term), tipo_estudiante = COALESCE(p_estudiante_tipo, tipo_estudiante) WHERE cedula_estudiante = p_cedula;
                SELECT tipo_estudiante INTO v_tipo_estudiante_nuevo FROM estudiantes WHERE cedula_estudiante = p_cedula AND habilitado = TRUE;
            ELSIF COALESCE(p_tipo_usuario, v_tipo_usuario_anterior) = 'Profesor' THEN
                UPDATE profesores SET term = COALESCE(p_profesor_term, term), tipo_profesor = COALESCE(p_profesor_tipo, tipo_profesor) WHERE cedula_profesor = p_cedula;
                SELECT tipo_profesor INTO v_tipo_profesor_nuevo FROM profesores WHERE cedula_profesor = p_cedula AND habilitado = TRUE;
            ELSIF COALESCE(p_tipo_usuario, v_tipo_usuario_anterior) = 'Coordinador' THEN
                UPDATE coordinadores SET term = COALESCE(p_coordinador_term, term) WHERE id_coordinador = p_cedula;
            END IF;
        END IF;
        
        -- Detectar si hubo cambios
        IF (v_nombres_anterior IS DISTINCT FROM COALESCE(p_nombres, v_nombres_anterior)) OR
           (v_apellidos_anterior IS DISTINCT FROM COALESCE(p_apellidos, v_apellidos_anterior)) OR
           (v_correo_electronico_anterior IS DISTINCT FROM COALESCE(p_correo_electronico, v_correo_electronico_anterior)) OR
           (v_nombre_usuario_anterior IS DISTINCT FROM COALESCE(p_nombre_usuario, v_nombre_usuario_anterior)) OR
           (v_telefono_celular_anterior IS DISTINCT FROM COALESCE(p_telefono_celular, v_telefono_celular_anterior)) OR
           (v_tipo_usuario_anterior IS DISTINCT FROM COALESCE(p_tipo_usuario, v_tipo_usuario_anterior)) OR
           (v_tipo_estudiante_anterior IS DISTINCT FROM v_tipo_estudiante_nuevo) OR
           (v_tipo_profesor_anterior IS DISTINCT FROM v_tipo_profesor_nuevo) THEN
            v_hubo_cambios := TRUE;
        END IF;
        
        -- La auditoría de los cambios en `usuarios` ya quedó registrada por el trigger
        -- genérico al hacer el UPDATE de arriba (con el actor seteado más arriba).
    END;
$$;

-- =========================================================
-- FUNCION: obtener_siguiente_num_cita
-- Obtiene el siguiente numero de cita para un caso especifico
-- Parametros:
--   p_id_caso INTEGER: ID del caso
--
CREATE OR REPLACE FUNCTION obtener_siguiente_num_cita(p_id_caso INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN COALESCE((SELECT MAX(num_cita) FROM citas WHERE id_caso = p_id_caso), 0) + 1;
END;
$$ LANGUAGE plpgsql;


-- =========================================================
-- FUNCIONES
-- =========================================================

-- Función: assign_nombre_usuario_from_email
CREATE OR REPLACE FUNCTION public.assign_nombre_usuario_from_email()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ 
DECLARE 
    nombre_usuario_extracted VARCHAR(100); 
BEGIN 
    IF NEW.nombre_usuario IS NOT NULL AND NEW.nombre_usuario != '' THEN 
        RETURN NEW; 
    END IF; 

    IF NEW.correo_electronico IS NULL OR NEW.correo_electronico = '' THEN 
        RAISE EXCEPTION 'No se puede asignar nombre_usuario: el usuario con cédula % no tiene correo electrónico', NEW.cedula; 
    END IF; 

    nombre_usuario_extracted := SPLIT_PART(NEW.correo_electronico, '@', 1); 

    IF nombre_usuario_extracted IS NULL OR nombre_usuario_extracted = '' THEN 
        RAISE EXCEPTION 'No se puede extraer nombre_usuario del correo: %', NEW.correo_electronico; 
    END IF; 

    NEW.nombre_usuario := nombre_usuario_extracted; 
    RETURN NEW; 
END; 
$function$
;

-- Función: trigger_crear_cambio_estatus_inicial
CREATE OR REPLACE FUNCTION public.trigger_crear_cambio_estatus_inicial()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    num_cambio_actual INTEGER;
    cedula_usuario VARCHAR(20);
BEGIN
    -- Obtener la cédula del usuario desde la variable de sesión
    -- Esta variable se establece antes de insertar el caso
    BEGIN
        cedula_usuario := current_setting('app.current_user_id', true);
    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'No se puede crear cambio de estatus: no se proporcionó la cédula del usuario que registra el caso. Error: %', SQLERRM;
    END;
    
    IF cedula_usuario IS NULL OR cedula_usuario = '' THEN
        RAISE EXCEPTION 'No se puede crear cambio de estatus: no se proporcionó la cédula del usuario que registra el caso (variable vacía)';
    END IF;
    
    -- Calcular el num_cambio (será 1 para el primer cambio)
    SELECT COALESCE(MAX(num_cambio), 0) + 1 INTO num_cambio_actual
    FROM cambio_estatus
    WHERE id_caso = NEW.id_caso;
    
    -- Insertar el cambio de estatus inicial con estatus 'Asesoría'
    INSERT INTO cambio_estatus (
        num_cambio,
        id_caso,
        nuevo_estatus,
        id_usuario_cambia,
        motivo
    ) VALUES (
        num_cambio_actual,
        NEW.id_caso,
        'Asesoría',
        cedula_usuario,
        'Registro del caso'
    );
    
    RETURN NEW;
END;
$function$
;

-- =========================================================
-- SINCRONIZACIÓN DE OCURREN_EN (semestre en que un caso tuvo actividad)
-- =========================================================

-- Función Auxiliar: ensure_case_semester_func
-- Busca el semestre para una fecha y lo asocia al caso si no existe
CREATE OR REPLACE FUNCTION public.ensure_case_semester_func(p_id_caso INT, p_fecha DATE)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_term VARCHAR(20);
BEGIN
    IF p_fecha IS NULL THEN RETURN; END IF;

    SELECT term INTO v_term
    FROM semestres
    WHERE p_fecha BETWEEN fecha_inicio AND fecha_fin
    LIMIT 1;

    IF v_term IS NOT NULL THEN
        INSERT INTO ocurren_en (id_caso, term)
        VALUES (p_id_caso, v_term)
        ON CONFLICT (id_caso, term) DO NOTHING;
    END IF;
END;
$function$
;

-- Trigger Function: sync_ocurren_en_asignacion (se_le_asigna / supervisa, que ya tienen 'term')
CREATE OR REPLACE FUNCTION public.trigger_sync_ocurren_en_asignacion()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    INSERT INTO ocurren_en (id_caso, term)
    VALUES (NEW.id_caso, NEW.term)
    ON CONFLICT (id_caso, term) DO NOTHING;
    RETURN NEW;
END;
$function$
;

-- Trigger Function: sync_ocurren_en_caso (casos.fecha_inicio_caso)
CREATE OR REPLACE FUNCTION public.trigger_sync_ocurren_en_caso()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM public.ensure_case_semester_func(NEW.id_caso, NEW.fecha_inicio_caso);
    RETURN NEW;
END;
$function$
;

-- Trigger Function: sync_ocurren_en_accion (acciones.fecha_registro)
CREATE OR REPLACE FUNCTION public.trigger_sync_ocurren_en_accion()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM public.ensure_case_semester_func(NEW.id_caso, NEW.fecha_registro::DATE);
    RETURN NEW;
END;
$function$
;

-- Trigger Function: sync_ocurren_en_cita (citas.fecha_encuentro)
CREATE OR REPLACE FUNCTION public.trigger_sync_ocurren_en_cita()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM public.ensure_case_semester_func(NEW.id_caso, NEW.fecha_encuentro::DATE);
    RETURN NEW;
END;
$function$
;

-- Trigger Function: sync_ocurren_en_estatus (cambio_estatus.fecha)
CREATE OR REPLACE FUNCTION public.trigger_sync_ocurren_en_estatus()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM public.ensure_case_semester_func(NEW.id_caso, NEW.fecha::DATE);
    RETURN NEW;
END;
$function$
;

-- Trigger Function: sync_ocurren_en_soporte (soportes.fecha_consignacion)
CREATE OR REPLACE FUNCTION public.trigger_sync_ocurren_en_soporte()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM public.ensure_case_semester_func(NEW.id_caso, NEW.fecha_consignacion);
    RETURN NEW;
END;
$function$
;

-- Trigger Function: sync_ocurren_en_beneficiario (sin fecha propia, usa CURRENT_DATE)
CREATE OR REPLACE FUNCTION public.trigger_sync_ocurren_en_beneficiario()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM public.ensure_case_semester_func(NEW.id_caso, CURRENT_DATE);
    RETURN NEW;
END;
$function$
;

-- Tabla: usuarios
DROP TRIGGER IF EXISTS trigger_assign_nombre_usuario ON usuarios;
CREATE TRIGGER trigger_assign_nombre_usuario BEFORE INSERT OR UPDATE ON public.usuarios FOR EACH ROW WHEN (((new.nombre_usuario IS NULL) OR ((new.nombre_usuario)::text = ''::text))) EXECUTE FUNCTION assign_nombre_usuario_from_email();

-- Tabla: casos
DROP TRIGGER IF EXISTS trigger_crear_cambio_estatus_inicial ON casos;
CREATE TRIGGER trigger_crear_cambio_estatus_inicial AFTER INSERT ON public.casos FOR EACH ROW EXECUTE FUNCTION trigger_crear_cambio_estatus_inicial();

-- =========================================================
-- TRIGGERS DE SINCRONIZACIÓN (OCURREN_EN)
-- =========================================================

DROP TRIGGER IF EXISTS trigger_sync_semestre_asignacion ON se_le_asigna;
CREATE TRIGGER trigger_sync_semestre_asignacion
AFTER INSERT ON se_le_asigna
FOR EACH ROW EXECUTE FUNCTION trigger_sync_ocurren_en_asignacion();

DROP TRIGGER IF EXISTS trigger_sync_semestre_supervision ON supervisa;
CREATE TRIGGER trigger_sync_semestre_supervision
AFTER INSERT ON supervisa
FOR EACH ROW EXECUTE FUNCTION trigger_sync_ocurren_en_asignacion();

DROP TRIGGER IF EXISTS trigger_sync_semestre_caso ON casos;
CREATE TRIGGER trigger_sync_semestre_caso
AFTER INSERT OR UPDATE OF fecha_inicio_caso ON casos
FOR EACH ROW EXECUTE FUNCTION trigger_sync_ocurren_en_caso();

DROP TRIGGER IF EXISTS trigger_sync_semestre_accion ON acciones;
CREATE TRIGGER trigger_sync_semestre_accion
AFTER INSERT ON acciones
FOR EACH ROW EXECUTE FUNCTION trigger_sync_ocurren_en_accion();

DROP TRIGGER IF EXISTS trigger_sync_semestre_cita ON citas;
CREATE TRIGGER trigger_sync_semestre_cita
AFTER INSERT OR UPDATE OF fecha_encuentro ON citas
FOR EACH ROW EXECUTE FUNCTION trigger_sync_ocurren_en_cita();

DROP TRIGGER IF EXISTS trigger_sync_semestre_estatus ON cambio_estatus;
CREATE TRIGGER trigger_sync_semestre_estatus
AFTER INSERT ON cambio_estatus
FOR EACH ROW EXECUTE FUNCTION trigger_sync_ocurren_en_estatus();

DROP TRIGGER IF EXISTS trigger_sync_semestre_soporte ON soportes;
CREATE TRIGGER trigger_sync_semestre_soporte
AFTER INSERT ON soportes
FOR EACH ROW EXECUTE FUNCTION trigger_sync_ocurren_en_soporte();

DROP TRIGGER IF EXISTS trigger_sync_semestre_beneficiario ON beneficiarios;
CREATE TRIGGER trigger_sync_semestre_beneficiario
AFTER INSERT ON beneficiarios
FOR EACH ROW EXECUTE FUNCTION trigger_sync_ocurren_en_beneficiario();


-- =========================================================
-- ASIGNACIÓN DE TRIGGERS DE AUDITORÍA
-- =========================================================

CREATE TRIGGER trg_audit_estados AFTER INSERT OR UPDATE OR DELETE ON estados FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('estado', 'id_estado');
CREATE TRIGGER trg_audit_niveles_educativos AFTER INSERT OR UPDATE OR DELETE ON niveles_educativos FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('nivel_educativo', 'id_nivel_educativo');
CREATE TRIGGER trg_audit_condicion_trabajo AFTER INSERT OR UPDATE OR DELETE ON condicion_trabajo FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('condicion_trabajo', 'id_trabajo');
CREATE TRIGGER trg_audit_condicion_actividad AFTER INSERT OR UPDATE OR DELETE ON condicion_actividad FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('condicion_actividad', 'id_actividad');
CREATE TRIGGER trg_audit_tipo_caracteristicas AFTER INSERT OR UPDATE OR DELETE ON tipo_caracteristicas FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('tipo_caracteristica', 'id_tipo');
CREATE TRIGGER trg_audit_materias AFTER INSERT OR UPDATE OR DELETE ON materias FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('materia', 'id_materia');
CREATE TRIGGER trg_audit_semestres AFTER INSERT OR UPDATE OR DELETE ON semestres FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('semestre', 'term');
CREATE TRIGGER trg_audit_usuarios AFTER INSERT OR UPDATE OR DELETE ON usuarios FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('usuario', 'cedula');
CREATE TRIGGER trg_audit_municipios AFTER INSERT OR UPDATE OR DELETE ON municipios FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('municipio', 'id_estado,num_municipio');
CREATE TRIGGER trg_audit_parroquias AFTER INSERT OR UPDATE OR DELETE ON parroquias FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('parroquia', 'id_estado,num_municipio,num_parroquia');
CREATE TRIGGER trg_audit_nucleos AFTER INSERT OR UPDATE OR DELETE ON nucleos FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('nucleo', 'id_nucleo');
CREATE TRIGGER trg_audit_solicitantes AFTER INSERT OR UPDATE OR DELETE ON solicitantes FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('solicitante', 'cedula');
CREATE TRIGGER trg_audit_viviendas AFTER INSERT OR UPDATE OR DELETE ON viviendas FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('vivienda', 'cedula_solicitante');
CREATE TRIGGER trg_audit_familias_y_hogares AFTER INSERT OR UPDATE OR DELETE ON familias_y_hogares FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('familia_y_hogar', 'cedula_solicitante');
CREATE TRIGGER trg_audit_caracteristicas AFTER INSERT OR UPDATE OR DELETE ON caracteristicas FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('caracteristica', 'id_tipo_caracteristica,num_caracteristica');
CREATE TRIGGER trg_audit_categorias AFTER INSERT OR UPDATE OR DELETE ON categorias FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('categoria', 'num_categoria,id_materia');
CREATE TRIGGER trg_audit_subcategorias AFTER INSERT OR UPDATE OR DELETE ON subcategorias FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('subcategoria', 'num_subcategoria,num_categoria,id_materia');
CREATE TRIGGER trg_audit_ambitos_legales AFTER INSERT OR UPDATE OR DELETE ON ambitos_legales FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('ambito_legal', 'id_materia,num_categoria,num_subcategoria,num_ambito_legal');
CREATE TRIGGER trg_audit_casos AFTER INSERT OR UPDATE OR DELETE ON casos FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('caso', 'id_caso');
CREATE TRIGGER trg_audit_citas AFTER INSERT OR UPDATE OR DELETE ON citas FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('cita', 'num_cita,id_caso');
CREATE TRIGGER trg_audit_acciones AFTER INSERT OR UPDATE OR DELETE ON acciones FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('accion', 'num_accion,id_caso');
CREATE TRIGGER trg_audit_soportes AFTER INSERT OR UPDATE OR DELETE ON soportes FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('soporte', 'num_soporte,id_caso');
CREATE TRIGGER trg_audit_beneficiarios AFTER INSERT OR UPDATE OR DELETE ON beneficiarios FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('beneficiario', 'num_beneficiario,id_caso');

-- NOTA: Las tablas asociativas (ejecutan, equipo, sesiones) NO llevan trigger aquí 
-- porque se auditarán manualmente desde el código de la aplicación.


-- Creación de roles si no existen
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'rol_coordinador') THEN CREATE ROLE rol_coordinador; END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'rol_profesor') THEN CREATE ROLE rol_profesor; END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'rol_estudiante') THEN CREATE ROLE rol_estudiante; END IF;
END
$$;

-- Permitir al usuario owner/conexión cambiar a estos roles
GRANT rol_coordinador TO current_user;
GRANT rol_profesor TO current_user;
GRANT rol_estudiante TO current_user;


-- Permisos sobre catálogos
GRANT ALL PRIVILEGES ON TABLE 
    estados, municipios, parroquias, nucleos,
    niveles_educativos, condicion_trabajo, condicion_actividad, tipo_caracteristicas,
    materias, categorias, subcategorias, ambitos_legales,
    caracteristicas, semestres
TO rol_coordinador;

GRANT SELECT ON TABLE 
    estados, municipios, parroquias, nucleos,
    niveles_educativos, condicion_trabajo, condicion_actividad, tipo_caracteristicas,
    materias, categorias, subcategorias, ambitos_legales,
    caracteristicas, semestres
TO rol_profesor, rol_estudiante;

-- Gestión de usuarios
GRANT ALL PRIVILEGES ON TABLE usuarios, coordinadores, profesores, estudiantes TO rol_coordinador;
GRANT SELECT ON TABLE usuarios, estudiantes, profesores TO rol_profesor;

-- Permisos básicos de vista de usuarios para estudiantes
GRANT SELECT(cedula, nombres, apellidos, correo_electronico, tipo_usuario) ON TABLE usuarios TO rol_estudiante;
GRANT SELECT ON TABLE estudiantes, profesores TO rol_estudiante;

-- Operativa (Casos, Solicitantes, Citas, Acciones, Soportes)
GRANT ALL PRIVILEGES ON TABLE 
    casos, solicitantes, viviendas, familias_y_hogares, asignadas_a,
    beneficiarios, citas, atienden, acciones, ejecutan, soportes, cambio_estatus,
    supervisa, se_le_asigna, ocurren_en
TO rol_coordinador;

-- Estudiantes y Profesores: CRUD en operativa (sujeto a FK)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE 
    casos, solicitantes, beneficiarios, citas, atienden, acciones, ejecutan, soportes, ocurren_en
TO rol_profesor, rol_estudiante;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE viviendas, familias_y_hogares, asignadas_a TO rol_profesor, rol_estudiante;
GRANT SELECT, INSERT, DELETE ON TABLE cambio_estatus TO rol_profesor, rol_estudiante;

-- Tablas de asignación de equipo: La app asigna/desasigna profesores y estudiantes a casos
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE supervisa, se_le_asigna TO rol_profesor, rol_estudiante;

-- Permisos de Auditoría (Insert para todos, Select solo coordinador)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rol_coordinador, rol_profesor, rol_estudiante;

-- Permisos de ejecución de funciones
GRANT EXECUTE ON FUNCTION eliminar_caso_fisico(INTEGER, VARCHAR, TEXT) TO rol_coordinador, rol_profesor, rol_estudiante;
GRANT EXECUTE ON FUNCTION eliminar_usuario_fisico(VARCHAR, VARCHAR, TEXT) TO rol_coordinador;
GRANT EXECUTE ON FUNCTION toggle_habilitado_usuario(VARCHAR, VARCHAR) TO rol_coordinador;

-- Permisos para la nueva tabla unificada de auditoría
GRANT INSERT, UPDATE ON auditoria_eventos TO rol_coordinador, rol_profesor, rol_estudiante;
GRANT SELECT ON auditoria_eventos TO rol_coordinador;
GRANT USAGE, SELECT ON SEQUENCE auditoria_eventos_id_seq TO rol_coordinador, rol_profesor, rol_estudiante;

-- Restaurando tablas especiales excluidas de la auditoría unificada
CREATE TABLE auditoria_reportes (
    id SERIAL PRIMARY KEY,
    tipo_reporte VARCHAR(100) NOT NULL,
    filtros_aplicados TEXT,
    id_usuario_genero VARCHAR(20),
    formato VARCHAR(20),
    cedula_solicitante VARCHAR(20),
    operacion VARCHAR(20) DEFAULT 'generacion' CHECK (operacion IN ('generacion', 'vista_previa')),
    fecha_generacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

CREATE TABLE auditoria_sesiones (
    id_sesion SERIAL PRIMARY KEY,
    cedula_usuario VARCHAR(20),
    ip_direccion VARCHAR(50),
    dispositivo TEXT,
    detalle TEXT,
    exitoso BOOLEAN DEFAULT TRUE,
    fecha_inicio TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas'),
    fecha_cierre TIMESTAMP
);

CREATE TABLE auditoria_descarga_soportes (
    id SERIAL PRIMARY KEY,
    num_soporte INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    nombre_archivo VARCHAR(150) NOT NULL,
    cedula_descargo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    ip_direccion VARCHAR(45),
    fecha_descarga TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

CREATE INDEX idx_auditoria_descarga_soportes_caso ON auditoria_descarga_soportes(id_caso);
CREATE INDEX idx_auditoria_descarga_soportes_usuario ON auditoria_descarga_soportes(cedula_descargo);
CREATE INDEX idx_auditoria_descarga_soportes_fecha ON auditoria_descarga_soportes(fecha_descarga DESC);

GRANT SELECT, INSERT ON auditoria_reportes TO rol_coordinador, rol_profesor, rol_estudiante;
GRANT SELECT, INSERT, UPDATE ON auditoria_sesiones TO rol_coordinador, rol_profesor, rol_estudiante;
