-- Migración: Agregar soporte para auditoría de ejecutores en acciones
-- Fecha: 2026-01-17

-- 1. Agregar columnas para almacenar cambios en ejecutores
ALTER TABLE auditoria_actualizacion_acciones
ADD COLUMN IF NOT EXISTS ejecutores_anterior TEXT,
ADD COLUMN IF NOT EXISTS ejecutores_nuevo TEXT;

-- 2. Actualizar el trigger para capturar cambios en ejecutores desde variables de sesión
CREATE OR REPLACE FUNCTION trigger_auditoria_actualizacion_accion()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
    v_ejecutores_anterior TEXT;
    v_ejecutores_nuevo TEXT;
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_actualiza_accion', true);
        v_ejecutores_anterior := current_setting('app.ejecutores_anterior', true);
        v_ejecutores_nuevo := current_setting('app.ejecutores_nuevo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
            v_ejecutores_anterior := NULL;
            v_ejecutores_nuevo := NULL;
    END;
    
    -- Normalizar cadenas vacías a NULL
    IF v_ejecutores_anterior = '' THEN v_ejecutores_anterior := NULL; END IF;
    IF v_ejecutores_nuevo = '' THEN v_ejecutores_nuevo := NULL; END IF;
    
    -- Detectar cambios en campos nativos O en ejecutores (pasados por sesión)
    IF (OLD.detalle_accion IS DISTINCT FROM NEW.detalle_accion OR
        OLD.comentario IS DISTINCT FROM NEW.comentario OR
        OLD.id_usuario_registra IS DISTINCT FROM NEW.id_usuario_registra OR
        OLD.fecha_registro IS DISTINCT FROM NEW.fecha_registro OR
        v_ejecutores_anterior IS DISTINCT FROM v_ejecutores_nuevo) THEN
        
        INSERT INTO auditoria_actualizacion_acciones (
            num_accion,
            id_caso,
            detalle_accion_anterior, detalle_accion_nuevo,
            comentario_anterior, comentario_nuevo,
            id_usuario_registra_anterior, id_usuario_registra_nuevo,
            fecha_registro_anterior, fecha_registro_nuevo,
            ejecutores_anterior, ejecutores_nuevo,
            id_usuario_actualizo
        ) VALUES (
            NEW.num_accion,
            NEW.id_caso,
            OLD.detalle_accion, NEW.detalle_accion,
            OLD.comentario, NEW.comentario,
            OLD.id_usuario_registra, NEW.id_usuario_registra,
            OLD.fecha_registro, NEW.fecha_registro,
            v_ejecutores_anterior, v_ejecutores_nuevo,
            v_usuario
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
