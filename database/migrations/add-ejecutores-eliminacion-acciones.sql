-- Migración: Agregar campos ejecutores a auditoría de eliminación de acciones (NORMALIZADO)
-- Fecha: 2026-01-17
-- Descripción: Crea tabla normalizada para ejecutores de acciones eliminadas
--              Los ejecutores se insertan desde el servicio DESPUÉS de crear el registro de auditoría

-- Crear tabla normalizada de ejecutores si no existe
CREATE TABLE IF NOT EXISTS auditoria_eliminacion_acciones_ejecutores (
    id SERIAL PRIMARY KEY,
    id_auditoria_eliminacion INTEGER NOT NULL REFERENCES auditoria_eliminacion_acciones(id) ON DELETE CASCADE,
    id_usuario_ejecutor VARCHAR(20) NOT NULL,
    nombres_ejecutor VARCHAR(100),
    apellidos_ejecutor VARCHAR(100),
    fecha_ejecucion DATE
);

-- Actualizar el trigger para no usar variables de sesión de ejecutores
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

-- Remover columnas JSON antiguas si existen
ALTER TABLE auditoria_eliminacion_acciones DROP COLUMN IF EXISTS ejecutores;
ALTER TABLE auditoria_eliminacion_acciones DROP COLUMN IF EXISTS fecha_ejecucion;
