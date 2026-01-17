-- Migración: Normalizar tablas de auditoría de acciones (ejecutores)
-- Fecha: 2026-01-17
-- Descripción: Crea tablas relacionadas para ejecutores en lugar de usar campos JSON

-- ========================
-- TABLAS DE EJECUTORES DE AUDITORÍA (NORMALIZADAS)
-- ========================

-- Ejecutores de auditoría de inserción
CREATE TABLE IF NOT EXISTS auditoria_insercion_acciones_ejecutores (
    id SERIAL PRIMARY KEY,
    id_auditoria_insercion INTEGER NOT NULL REFERENCES auditoria_insercion_acciones(id) ON DELETE CASCADE,
    id_usuario_ejecutor VARCHAR(20) NOT NULL,
    nombres_ejecutor VARCHAR(100),
    apellidos_ejecutor VARCHAR(100),
    fecha_ejecucion DATE
);

-- Ejecutores de auditoría de actualización (con tipo anterior/nuevo)
CREATE TABLE IF NOT EXISTS auditoria_actualizacion_acciones_ejecutores (
    id SERIAL PRIMARY KEY,
    id_auditoria_actualizacion INTEGER NOT NULL REFERENCES auditoria_actualizacion_acciones(id) ON DELETE CASCADE,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('anterior', 'nuevo')),
    id_usuario_ejecutor VARCHAR(20) NOT NULL,
    nombres_ejecutor VARCHAR(100),
    apellidos_ejecutor VARCHAR(100),
    fecha_ejecucion DATE
);

-- Ejecutores de auditoría de eliminación
CREATE TABLE IF NOT EXISTS auditoria_eliminacion_acciones_ejecutores (
    id SERIAL PRIMARY KEY,
    id_auditoria_eliminacion INTEGER NOT NULL REFERENCES auditoria_eliminacion_acciones(id) ON DELETE CASCADE,
    id_usuario_ejecutor VARCHAR(20) NOT NULL,
    nombres_ejecutor VARCHAR(100),
    apellidos_ejecutor VARCHAR(100),
    fecha_ejecucion DATE
);

-- Remover columnas JSON si existen (para migración de datos existentes)
ALTER TABLE auditoria_insercion_acciones DROP COLUMN IF EXISTS ejecutores;
ALTER TABLE auditoria_insercion_acciones DROP COLUMN IF EXISTS fecha_ejecucion;
ALTER TABLE auditoria_eliminacion_acciones DROP COLUMN IF EXISTS ejecutores;
ALTER TABLE auditoria_eliminacion_acciones DROP COLUMN IF EXISTS fecha_ejecucion;
ALTER TABLE auditoria_actualizacion_acciones DROP COLUMN IF EXISTS ejecutores_anterior;
ALTER TABLE auditoria_actualizacion_acciones DROP COLUMN IF EXISTS ejecutores_nuevo;
ALTER TABLE auditoria_actualizacion_acciones DROP COLUMN IF EXISTS fecha_ejecucion_anterior;
ALTER TABLE auditoria_actualizacion_acciones DROP COLUMN IF EXISTS fecha_ejecucion_nuevo;

-- ========================
-- TRIGGERS ACTUALIZADOS (Sin columnas de ejecutores)
-- ========================

-- Trigger de actualización simplificado
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

-- Trigger de eliminación simplificado
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

