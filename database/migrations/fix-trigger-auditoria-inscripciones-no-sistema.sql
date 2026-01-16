-- Migración: Corregir triggers de auditoría para no usar 'SISTEMA'
-- Descripción: Elimina el fallback a 'SISTEMA' y usa NULL cuando no hay usuario activo

-- 1. Actualizar Trigger para Estudiantes
CREATE OR REPLACE FUNCTION trigger_auditoria_insercion_estudiante()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION WHEN OTHERS THEN
        v_usuario := NULL;
    END;
    
    -- Si es vacío, usar NULL (siempre debe venir un usuario válido)
    IF v_usuario = '' THEN
        v_usuario := NULL;
    END IF;

    INSERT INTO auditoria_insercion_estudiantes (
        cedula_estudiante, term, tipo_estudiante, nrc, id_usuario_creo, fecha_creacion
    ) VALUES (
        NEW.cedula_estudiante, NEW.term, NEW.tipo_estudiante, NEW.nrc, v_usuario, (NOW() AT TIME ZONE 'America/Caracas')
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Actualizar Trigger para Profesores
CREATE OR REPLACE FUNCTION trigger_auditoria_insercion_profesor()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION WHEN OTHERS THEN
        v_usuario := NULL;
    END;
    
    -- Si es vacío, usar NULL en lugar de 'SISTEMA'
    IF v_usuario = '' THEN
        v_usuario := NULL;
    END IF;

    INSERT INTO auditoria_insercion_profesores (
        cedula_profesor, tipo_profesor, id_usuario_creo, fecha_creacion
    ) VALUES (
        NEW.cedula_profesor, NEW.tipo_profesor, v_usuario, (NOW() AT TIME ZONE 'America/Caracas')
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Limpiar registros existentes con 'SISTEMA' (cambiar a NULL)
UPDATE auditoria_insercion_estudiantes SET id_usuario_creo = NULL WHERE id_usuario_creo = 'SISTEMA';
UPDATE auditoria_insercion_profesores SET id_usuario_creo = NULL WHERE id_usuario_creo = 'SISTEMA';
