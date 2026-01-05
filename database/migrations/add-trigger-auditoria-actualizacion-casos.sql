-- Migración: Agregar trigger de auditoría para actualizaciones de casos
-- Fecha: 2026-01-03
-- Descripción: Crea un trigger BEFORE UPDATE que registra la auditoría usando OLD y NEW

-- Función trigger para registrar auditoría antes de actualizar un caso
CREATE OR REPLACE FUNCTION trigger_auditoria_actualizacion_caso()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    -- Obtener el usuario que actualiza desde la variable de sesión
    BEGIN
        v_usuario := current_setting('app.usuario_actualiza_caso', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
    
    -- Registrar la auditoría solo si hay cambios
    IF (OLD.fecha_solicitud IS DISTINCT FROM NEW.fecha_solicitud OR
        OLD.fecha_inicio_caso IS DISTINCT FROM NEW.fecha_inicio_caso OR
        OLD.fecha_fin_caso IS DISTINCT FROM NEW.fecha_fin_caso OR
        OLD.tramite IS DISTINCT FROM NEW.tramite OR
        OLD.observaciones IS DISTINCT FROM NEW.observaciones OR
        OLD.id_nucleo IS DISTINCT FROM NEW.id_nucleo OR
        OLD.cedula IS DISTINCT FROM NEW.cedula OR
        OLD.id_materia IS DISTINCT FROM NEW.id_materia OR
        OLD.num_categoria IS DISTINCT FROM NEW.num_categoria OR
        OLD.num_subcategoria IS DISTINCT FROM NEW.num_subcategoria OR
        OLD.num_ambito_legal IS DISTINCT FROM NEW.num_ambito_legal) THEN
        
        INSERT INTO auditoria_actualizacion_casos (
            id_caso,
            fecha_solicitud_anterior, fecha_solicitud_nuevo,
            fecha_inicio_caso_anterior, fecha_inicio_caso_nuevo,
            fecha_fin_caso_anterior, fecha_fin_caso_nuevo,
            tramite_anterior, tramite_nuevo,
            observaciones_anterior, observaciones_nuevo,
            id_nucleo_anterior, id_nucleo_nuevo,
            cedula_solicitante_anterior, cedula_solicitante_nuevo,
            id_materia_anterior, id_materia_nuevo,
            num_categoria_anterior, num_categoria_nuevo,
            num_subcategoria_anterior, num_subcategoria_nuevo,
            num_ambito_legal_anterior, num_ambito_legal_nuevo,
            id_usuario_actualizo
        ) VALUES (
            NEW.id_caso,
            OLD.fecha_solicitud, NEW.fecha_solicitud,
            OLD.fecha_inicio_caso, NEW.fecha_inicio_caso,
            OLD.fecha_fin_caso, NEW.fecha_fin_caso,
            OLD.tramite, NEW.tramite,
            OLD.observaciones, NEW.observaciones,
            OLD.id_nucleo, NEW.id_nucleo,
            OLD.cedula, NEW.cedula,
            OLD.id_materia, NEW.id_materia,
            OLD.num_categoria, NEW.num_categoria,
            OLD.num_subcategoria, NEW.num_subcategoria,
            OLD.num_ambito_legal, NEW.num_ambito_legal,
            v_usuario
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger
DROP TRIGGER IF EXISTS trigger_auditoria_actualizacion_caso ON casos;
CREATE TRIGGER trigger_auditoria_actualizacion_caso
    BEFORE UPDATE ON casos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_actualizacion_caso();
