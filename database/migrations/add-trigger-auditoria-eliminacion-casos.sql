-- Migración: Agregar trigger de auditoría para eliminaciones de casos
-- Fecha: 2026-01-03
-- Descripción: Crea un trigger BEFORE DELETE que registra la auditoría usando OLD

-- Función trigger para registrar auditoría antes de eliminar un caso
CREATE OR REPLACE FUNCTION trigger_auditoria_eliminacion_caso()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
    v_motivo TEXT;
BEGIN
    -- Obtener el usuario y motivo desde la variable de sesión
    BEGIN
        v_usuario := current_setting('app.usuario_elimina_caso', true);
        v_motivo := current_setting('app.motivo_eliminacion_caso', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
            v_motivo := NULL;
    END;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
    
    IF v_motivo IS NULL OR v_motivo = '' THEN
        v_motivo := 'Sin motivo especificado';
    END IF;
    
    -- Registrar la auditoría antes de eliminar
    INSERT INTO auditoria_eliminacion_casos (
        caso_eliminado,
        fecha_solicitud,
        fecha_inicio_caso,
        fecha_fin_caso,
        tramite,
        observaciones,
        id_nucleo,
        cedula_solicitante,
        id_materia,
        num_categoria,
        num_subcategoria,
        num_ambito_legal,
        eliminado_por,
        motivo
    ) VALUES (
        OLD.id_caso,
        OLD.fecha_solicitud,
        OLD.fecha_inicio_caso,
        OLD.fecha_fin_caso,
        OLD.tramite,
        OLD.observaciones,
        OLD.id_nucleo,
        OLD.cedula,
        OLD.id_materia,
        OLD.num_categoria,
        OLD.num_subcategoria,
        OLD.num_ambito_legal,
        v_usuario,
        v_motivo
    );
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger
DROP TRIGGER IF EXISTS trigger_auditoria_eliminacion_caso ON casos;
CREATE TRIGGER trigger_auditoria_eliminacion_caso
    BEFORE DELETE ON casos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_eliminacion_caso();
