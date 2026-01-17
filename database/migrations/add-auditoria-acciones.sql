-- Migración: Agregar tablas y triggers de auditoría para acciones en casos
-- Fecha: 2026-01-17
-- Descripción: Crea tablas de auditoría para registrar inserciones, actualizaciones y eliminaciones de acciones

-- =========================================================
-- TABLA PARA AUDITORÍA DE INSERCIONES DE ACCIONES
-- =========================================================
CREATE TABLE IF NOT EXISTS auditoria_insercion_acciones (
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

-- =========================================================
-- TABLA PARA AUDITORÍA DE ACTUALIZACIONES DE ACCIONES
-- =========================================================
CREATE TABLE IF NOT EXISTS auditoria_actualizacion_acciones (
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

-- =========================================================
-- TABLA PARA AUDITORÍA DE ELIMINACIONES DE ACCIONES
-- =========================================================
CREATE TABLE IF NOT EXISTS auditoria_eliminacion_acciones (
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

-- =========================================================
-- TRIGGER PARA AUDITORÍA DE INSERCIÓN DE ACCIONES
-- =========================================================
CREATE OR REPLACE FUNCTION trigger_auditoria_insercion_accion()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_registra', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := NEW.id_usuario_registra;
    END IF;
    
    INSERT INTO auditoria_insercion_acciones (
        num_accion,
        id_caso,
        detalle_accion,
        comentario,
        id_usuario_registra,
        fecha_registro,
        id_usuario_creo
    ) VALUES (
        NEW.num_accion,
        NEW.id_caso,
        NEW.detalle_accion,
        NEW.comentario,
        NEW.id_usuario_registra,
        NEW.fecha_registro,
        v_usuario
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auditoria_insercion_accion ON acciones;
CREATE TRIGGER trigger_auditoria_insercion_accion
    AFTER INSERT ON acciones
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_insercion_accion();

-- =========================================================
-- TRIGGER PARA AUDITORÍA DE ACTUALIZACIÓN DE ACCIONES
-- =========================================================
CREATE OR REPLACE FUNCTION trigger_auditoria_actualizacion_accion()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_actualiza_accion', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    IF (OLD.detalle_accion IS DISTINCT FROM NEW.detalle_accion OR
        OLD.comentario IS DISTINCT FROM NEW.comentario OR
        OLD.id_usuario_registra IS DISTINCT FROM NEW.id_usuario_registra OR
        OLD.fecha_registro IS DISTINCT FROM NEW.fecha_registro) THEN
        
        INSERT INTO auditoria_actualizacion_acciones (
            num_accion,
            id_caso,
            detalle_accion_anterior, detalle_accion_nuevo,
            comentario_anterior, comentario_nuevo,
            id_usuario_registra_anterior, id_usuario_registra_nuevo,
            fecha_registro_anterior, fecha_registro_nuevo,
            id_usuario_actualizo
        ) VALUES (
            NEW.num_accion,
            NEW.id_caso,
            OLD.detalle_accion, NEW.detalle_accion,
            OLD.comentario, NEW.comentario,
            OLD.id_usuario_registra, NEW.id_usuario_registra,
            OLD.fecha_registro, NEW.fecha_registro,
            v_usuario
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auditoria_actualizacion_accion ON acciones;
CREATE TRIGGER trigger_auditoria_actualizacion_accion
    BEFORE UPDATE ON acciones
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_actualizacion_accion();

-- =========================================================
-- TRIGGER PARA AUDITORÍA DE ELIMINACIÓN DE ACCIONES
-- =========================================================
CREATE OR REPLACE FUNCTION trigger_auditoria_eliminacion_accion()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
    v_motivo TEXT;
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_elimina_accion', true);
        v_motivo := current_setting('app.motivo_eliminacion_accion', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
            v_motivo := NULL;
    END;
    
    IF v_motivo IS NULL OR v_motivo = '' THEN
        v_motivo := 'Sin motivo especificado';
    END IF;
    
    INSERT INTO auditoria_eliminacion_acciones (
        num_accion,
        id_caso,
        detalle_accion,
        comentario,
        id_usuario_registra,
        fecha_registro,
        eliminado_por,
        motivo
    ) VALUES (
        OLD.num_accion,
        OLD.id_caso,
        OLD.detalle_accion,
        OLD.comentario,
        OLD.id_usuario_registra,
        OLD.fecha_registro,
        v_usuario,
        v_motivo
    );
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auditoria_eliminacion_accion ON acciones;
CREATE TRIGGER trigger_auditoria_eliminacion_accion
    BEFORE DELETE ON acciones
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_eliminacion_accion();
