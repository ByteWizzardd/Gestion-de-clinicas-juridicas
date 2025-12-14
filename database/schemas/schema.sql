-- ==========================================================
-- 1. TABLAS MAESTRAS
-- ==========================================================

CREATE TABLE estados (
    id_estado SERIAL PRIMARY KEY,
    nombre_estado VARCHAR(100) NOT NULL
);

CREATE TABLE niveles_educativos (
    id_nivel_educativo SERIAL PRIMARY KEY,
    nivel INTEGER NOT NULL CHECK (nivel BETWEEN 0 AND 14),
    anos_cursados INTEGER NOT NULL,
    semestres_cursados INTEGER NOT NULL,
    trimestres_cursados INTEGER NOT NULL
);

CREATE TABLE trabajos (
    id_trabajo SERIAL PRIMARY KEY,
    condicion_actividad VARCHAR(50) CHECK (condicion_actividad IN ('Ama de Casa', 'Estudiante', 'Pensionado', 'Jubilado', 'Otra')),
    buscando_trabajo BOOLEAN NOT NULL,
    condicion_trabajo VARCHAR(50) CHECK (condicion_trabajo IN ('Patrono', 'Empleado', 'Obrero', 'Cuenta propia'))
);

CREATE TABLE familias_hogares (
    id_hogar SERIAL PRIMARY KEY,
    cant_personas INTEGER NOT NULL,
    cant_trabajadores INTEGER NOT NULL,
    cant_ninos INTEGER NOT NULL,
    cant_ninos_estudiando INTEGER NOT NULL,
    jefe_hogar BOOLEAN NOT NULL,
    id_nivel_educativo INTEGER REFERENCES niveles_educativos(id_nivel_educativo),
    ingresos_mensuales DECIMAL(10, 2) NOT NULL
);

CREATE TABLE tribunales (
    id_tribunal SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL
);

CREATE TABLE ambitos_legales (
    id_ambito_legal SERIAL PRIMARY KEY,
    materia VARCHAR(100) NOT NULL, 
    tipo VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL
);

CREATE TABLE semestres (
    term VARCHAR(20) PRIMARY KEY, 
    periodo_meses VARCHAR(50) NOT NULL,
    anos_academicos VARCHAR(20) NOT NULL
);

CREATE TABLE materias (
    nrc VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

-- ==========================================================
-- 2. VIVIENDAS (VALIDACIONES ESTRICTAS)
-- ==========================================================

CREATE TABLE viviendas (
    id_vivienda SERIAL PRIMARY KEY,
    
    tipo_vivienda VARCHAR(50) NOT NULL CHECK (tipo_vivienda IN ('Quinta', 'Casa Urb', 'Apartamento', 'Bloque', 'Casa de Barrio', 'Casa Rural', 'Rancho', 'Refugio', 'Otros')),
    cant_habitaciones INTEGER NOT NULL,
    cant_banos INTEGER NOT NULL,
    
    material_piso VARCHAR(50) NOT NULL CHECK (material_piso IN ('Tierra', 'Cemento', 'Cerámica', 'Granito / Parquet / Mármol')),
    material_paredes VARCHAR(50) NOT NULL CHECK (material_paredes IN ('Cartón / Palma / Desechos', 'Bahareque', 'Bloque sin frizar', 'Bloque frizado')),
    material_techo VARCHAR(50) NOT NULL CHECK (material_techo IN ('Madera / Cartón / Palma', 'Zinc / Acerolit', 'Platabanda / Tejas')),
    agua_potable VARCHAR(50) NOT NULL CHECK (agua_potable IN ('Dentro de la vivienda', 'Fuera de la vivienda', 'No tiene servicio')),
    eliminacion_aguas_n VARCHAR(50) NOT NULL CHECK (eliminacion_aguas_n IN ('Poceta a cloaca / Pozo séptico', 'Poceta sin conexión', 'Excusado de hoyo o letrina', 'No tiene')),
    aseo VARCHAR(50) NOT NULL CHECK (aseo IN ('Llega a la vivienda', 'No llega a la vivienda / Container', 'No tiene'))
);

CREATE TABLE artefactos_domesticos (
    id_hogar INTEGER NOT NULL REFERENCES familias_hogares(id_hogar),
    artefacto VARCHAR(50) NOT NULL CHECK (artefacto IN ('Nevera', 'Lavadora', 'Computadora', 'Cable Satelital', 'Internet', 'Carro', 'Moto')),
    PRIMARY KEY (id_hogar, artefacto)
);

-- ==========================================================
-- 3. UBICACIÓN GEOGRÁFICA
-- ==========================================================

CREATE TABLE municipios (
    id_municipio SERIAL,
    id_estado INTEGER NOT NULL REFERENCES estados(id_estado),
    nombre_municipio VARCHAR(100) NOT NULL,
    PRIMARY KEY (id_municipio, id_estado),
    CONSTRAINT uq_municipio_id UNIQUE (id_municipio) 
);

CREATE TABLE parroquias (
    id_parroquia SERIAL,
    id_municipio INTEGER NOT NULL REFERENCES municipios(id_municipio),
    nombre_parroquia VARCHAR(100) NOT NULL,
    PRIMARY KEY (id_parroquia, id_municipio),
    CONSTRAINT uq_parroquia_id UNIQUE (id_parroquia) 
);

CREATE TABLE nucleos (
    id_nucleo SERIAL PRIMARY KEY,
    nombre_nucleo VARCHAR(100) NOT NULL,
    id_parroquia INTEGER NOT NULL REFERENCES parroquias(id_parroquia) 
);

-- ==========================================================
-- 4. CLIENTES
-- ==========================================================

CREATE TABLE clientes (
    cedula VARCHAR(20) PRIMARY KEY, 
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    telefono_local VARCHAR(20),
    telefono_celular VARCHAR(20) NOT NULL,
    correo_electronico VARCHAR(100) NOT NULL,
    
    sexo VARCHAR(1) NOT NULL CHECK (sexo IN ('M', 'F')),
    nacionalidad VARCHAR(10) NOT NULL CHECK (nacionalidad IN ('V', 'E', 'Ext')),
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
    nombre_usuario VARCHAR(100) NOT NULL, -- Nombre del correo UCAB sin el dominio (ej: juan.perez de juan.perez@ucab.edu.ve)
    password_hash VARCHAR(255) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT TRUE,
    rol_sistema VARCHAR(20) NOT NULL CHECK (rol_sistema IN ('Estudiante', 'Profesor', 'Coordinador')),
    foto_perfil BYTEA
);

CREATE TABLE coordinadores (
    cedula_coordinador VARCHAR(20) PRIMARY KEY REFERENCES usuarios(cedula)
);

CREATE TABLE profesores (
    cedula_profesor VARCHAR(20) PRIMARY KEY REFERENCES usuarios(cedula)
);

CREATE TABLE secciones (
    num_seccion INTEGER NOT NULL, -- Autoincrementado por TRIGGER
    nrc_materia VARCHAR(20) NOT NULL REFERENCES materias(nrc),
    term_semestre VARCHAR(20) NOT NULL REFERENCES semestres(term),
    cedula_profesor VARCHAR(20) NOT NULL REFERENCES profesores(cedula_profesor),
    cedula_coordinador VARCHAR(20) NOT NULL REFERENCES coordinadores(cedula_coordinador),
    
    PRIMARY KEY (num_seccion, nrc_materia, term_semestre)
);

CREATE TABLE estudiantes (
    cedula_estudiante VARCHAR(20) PRIMARY KEY REFERENCES usuarios(cedula),
    tipo_estudiante VARCHAR(50) NOT NULL CHECK (tipo_estudiante IN ('Voluntario', 'Inscrito', 'Egresado')),
    
    num_seccion INTEGER NOT NULL, 
    nrc_materia VARCHAR(20) NOT NULL,
    term_semestre VARCHAR(20) NOT NULL,
    FOREIGN KEY (num_seccion, nrc_materia, term_semestre) REFERENCES secciones(num_seccion, nrc_materia, term_semestre)
);

-- ==========================================================
-- 6. CASOS LEGALES
-- ==========================================================

CREATE TABLE expedientes (
    id_expediente VARCHAR(50) PRIMARY KEY,
    id_tribunal INTEGER NOT NULL REFERENCES tribunales(id_tribunal)
);

CREATE TABLE casos (
    id_caso SERIAL PRIMARY KEY,
    fecha_inicio_caso DATE DEFAULT CURRENT_DATE,
    fecha_fin_caso DATE,
    fecha_solicitud DATE NOT NULL DEFAULT CURRENT_DATE,
    
    tramite VARCHAR(100) NOT NULL CHECK (tramite IN (
        'Asesoría', 
        'Conciliación y Mediación', 
        'Redacción documentos y/o convenio', 
        'Asistencia Judicial - Casos externos'
    )),
    
    estatus VARCHAR(50) NOT NULL CHECK (estatus IN ('En proceso', 'Archivado', 'Entregado', 'Asesoría')),
    
    observaciones TEXT,
    id_nucleo INTEGER NOT NULL REFERENCES nucleos(id_nucleo),
    id_ambito_legal INTEGER NOT NULL REFERENCES ambitos_legales(id_ambito_legal),
    id_expediente VARCHAR(50) REFERENCES expedientes(id_expediente),
    cedula_cliente VARCHAR(20) NOT NULL REFERENCES clientes(cedula)
);

-- ==========================================================
-- 7. DETALLES DEL CASO (BYTEA Y PKs COMPUESTAS)
-- ==========================================================

CREATE TABLE soportes (
    num_soporte INTEGER NOT NULL, 
    id_caso INTEGER NOT NULL REFERENCES casos(id_caso),
    
    documento_data BYTEA, 
    nombre_archivo VARCHAR(150) NOT NULL,
    tipo_mime VARCHAR(100) NOT NULL,
    descripcion TEXT,
    
    fecha_consignacion DATE NOT NULL,
    PRIMARY KEY (num_soporte, id_caso)
);

CREATE TABLE documentos (
    num_documento INTEGER NOT NULL, 
    id_expediente VARCHAR(50) NOT NULL REFERENCES expedientes(id_expediente),
    folio_inicio INTEGER NOT NULL,
    folio_fin INTEGER NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    fecha DATE NOT NULL,
    PRIMARY KEY (num_documento, id_expediente)
);

CREATE TABLE citas (
    fecha_cita TIMESTAMP NOT NULL,
    id_caso INTEGER NOT NULL REFERENCES casos(id_caso),
    proxima_cita DATE NOT NULL,
    PRIMARY KEY (fecha_cita, id_caso)
);

CREATE TABLE acciones (
    num_accion INTEGER NOT NULL,
    id_caso INTEGER NOT NULL REFERENCES casos(id_caso),
    detalle_accion TEXT NOT NULL, 
    cedula_usuario_registra VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cedula_usuario_ejecuta VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_accion TIMESTAMP NOT NULL,
    PRIMARY KEY (num_accion, id_caso)
);

CREATE TABLE asignaciones (
    fecha_inicio DATE NOT NULL,
    id_caso INTEGER NOT NULL REFERENCES casos(id_caso),
    term VARCHAR(20) NOT NULL REFERENCES semestres(term),
    cedula_estudiante VARCHAR(20) NOT NULL REFERENCES estudiantes(cedula_estudiante),
    cedula_profesor VARCHAR(20) NOT NULL REFERENCES profesores(cedula_profesor),
    fecha_fin DATE NOT NULL,
    PRIMARY KEY (fecha_inicio, id_caso, term, cedula_estudiante)
);

CREATE TABLE beneficiarios (
    cedula VARCHAR(20) NOT NULL REFERENCES clientes(cedula),
    id_caso INTEGER NOT NULL REFERENCES casos(id_caso),
    tipo_beneficiario VARCHAR(50) NOT NULL CHECK (tipo_beneficiario IN ('Directo', 'Indirecto')),
    parentesco VARCHAR(50) NOT NULL,
    PRIMARY KEY (cedula, id_caso)
);

CREATE TABLE cambios_estatus (
    cedula_usuario VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    id_caso INTEGER NOT NULL REFERENCES casos(id_caso),
    estatus_nuevo VARCHAR(50) NOT NULL,
    fecha_cambio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cedula_usuario, id_caso, estatus_nuevo, fecha_cambio)
);

CREATE TABLE orientaciones (
    cedula_usuario VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_cita TIMESTAMP NOT NULL,
    id_caso INTEGER NOT NULL,
    orientacion TEXT NOT NULL,
    FOREIGN KEY (fecha_cita, id_caso) REFERENCES citas(fecha_cita, id_caso),
    PRIMARY KEY (cedula_usuario, fecha_cita, id_caso)
);

-- ==========================================================
-- 8. FUNCIONES Y TRIGGERS PARA VALIDACIÓN DE SOLICITANTES
-- ==========================================================

-- Función para validar que un cliente solicitante tenga todos los campos completos
CREATE OR REPLACE FUNCTION validate_solicitante_completo()
RETURNS TRIGGER AS $$
BEGIN
    -- Si el cliente tiene al menos un caso, debe tener todos los campos relacionados
    -- (todos los casos tienen fecha_solicitud obligatoria, por lo que el cliente debe ser un solicitante completo)
    IF EXISTS (
        SELECT 1 FROM casos 
        WHERE cedula_cliente = NEW.cedula
    ) THEN
        IF NEW.id_nucleo IS NULL OR
           NEW.id_hogar IS NULL OR
           NEW.id_nivel_educativo IS NULL OR
           NEW.id_trabajo IS NULL OR
           NEW.id_vivienda IS NULL OR
           NEW.id_parroquia IS NULL THEN
            RAISE EXCEPTION 'El cliente es solicitante (tiene casos) y debe tener todos los campos relacionados completos: id_nucleo, id_hogar, id_nivel_educativo, id_trabajo, id_vivienda, id_parroquia';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar al insertar o actualizar clientes
CREATE TRIGGER trigger_validate_solicitante_completo
    BEFORE INSERT OR UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION validate_solicitante_completo();

-- Función para validar al insertar o actualizar casos
-- Como fecha_solicitud es obligatoria, siempre se debe validar que el cliente tenga todos los campos completos
CREATE OR REPLACE FUNCTION validate_cliente_solicitante_on_caso()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar que el cliente tenga todos los campos relacionados completos
    -- (todos los casos tienen fecha_solicitud, por lo que el cliente debe ser un solicitante completo)
    IF NOT EXISTS (
        SELECT 1 FROM clientes
        WHERE cedula = NEW.cedula_cliente
        AND id_nucleo IS NOT NULL
        AND id_hogar IS NOT NULL
        AND id_nivel_educativo IS NOT NULL
        AND id_trabajo IS NOT NULL
        AND id_vivienda IS NOT NULL
        AND id_parroquia IS NOT NULL
    ) THEN
        RAISE EXCEPTION 'No se puede crear un caso para un cliente que no tiene todos los campos relacionados completos (id_nucleo, id_hogar, id_nivel_educativo, id_trabajo, id_vivienda, id_parroquia)';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar al insertar o actualizar casos
CREATE TRIGGER trigger_validate_cliente_solicitante_on_caso
    BEFORE INSERT OR UPDATE ON casos
    FOR EACH ROW
    EXECUTE FUNCTION validate_cliente_solicitante_on_caso();

