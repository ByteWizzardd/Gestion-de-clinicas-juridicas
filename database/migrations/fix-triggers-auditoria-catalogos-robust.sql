-- Migración: Hacer los triggers de auditoría de catálogos más robustos
-- Fecha: 2026-01-03
-- Descripción: Actualiza los triggers para que no fallen si las tablas no existen o las variables no están configuradas

-- Función helper para obtener variable de sesión de forma segura
CREATE OR REPLACE FUNCTION get_session_var(var_name TEXT, default_value TEXT DEFAULT 'SISTEMA')
RETURNS TEXT AS $$
DECLARE
    v_value TEXT;
BEGIN
    BEGIN
        v_value := current_setting(var_name, true);
    EXCEPTION
        WHEN OTHERS THEN
            v_value := default_value;
    END;
    
    IF v_value IS NULL OR v_value = '' THEN
        v_value := default_value;
    END IF;
    
    RETURN v_value;
END;
$$ LANGUAGE plpgsql;

-- Actualizar trigger de eliminación de estados
CREATE OR REPLACE FUNCTION trigger_auditoria_eliminacion_estado()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
    v_motivo TEXT;
BEGIN
    v_usuario := get_session_var('app.usuario_elimina_catalogo', 'SISTEMA');
    v_motivo := get_session_var('app.motivo_eliminacion_catalogo', '');
    
    BEGIN
        INSERT INTO auditoria_eliminacion_estados (
            id_estado, nombre_estado, habilitado, id_usuario_elimino, motivo
        ) VALUES (
            OLD.id_estado, OLD.nombre_estado, OLD.habilitado, v_usuario, COALESCE(v_motivo, '')
        );
    EXCEPTION
        WHEN undefined_table THEN
            -- Tabla no existe, continuar sin error
            NULL;
        WHEN OTHERS THEN
            -- Otro error, continuar sin fallar la operación
            NULL;
    END;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Actualizar trigger de actualización de estados
CREATE OR REPLACE FUNCTION trigger_auditoria_actualizacion_estado()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    v_usuario := get_session_var('app.usuario_actualiza_catalogo', 'SISTEMA');
    
    -- Solo registrar si hay cambios reales
    IF OLD.nombre_estado IS DISTINCT FROM NEW.nombre_estado OR
       OLD.habilitado IS DISTINCT FROM NEW.habilitado THEN
        BEGIN
            INSERT INTO auditoria_actualizacion_estados (
                id_estado, nombre_estado_anterior, nombre_estado_nuevo,
                habilitado_anterior, habilitado_nuevo, id_usuario_actualizo
            ) VALUES (
                NEW.id_estado, OLD.nombre_estado, NEW.nombre_estado,
                OLD.habilitado, NEW.habilitado, v_usuario
            );
        EXCEPTION
            WHEN undefined_table THEN
                -- Tabla no existe, continuar sin error
                NULL;
            WHEN OTHERS THEN
                -- Otro error, continuar sin fallar la operación
                NULL;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
