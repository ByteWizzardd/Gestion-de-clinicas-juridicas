-- =========================================================
-- MIGRACIÓN: fix-auditoria-eliminacion-casos-completa
-- Fecha: 2026-01-18
-- Descripción: Corrige la auditoría de eliminación de casos para que
--              todas las entidades relacionadas (citas, beneficiarios,
--              acciones, soportes) registren correctamente:
--              1. El ID del usuario que realizó la eliminación
--              2. El motivo contextualizado (motivo original + referencia al caso)
-- =========================================================

-- 1. Agregar columna motivo a auditoria_eliminacion_beneficiarios si no existe
ALTER TABLE auditoria_eliminacion_beneficiarios ADD COLUMN IF NOT EXISTS motivo TEXT;

-- 2. Actualizar trigger de eliminación de beneficiarios para capturar motivo
CREATE OR REPLACE FUNCTION public.trigger_auditoria_eliminacion_beneficiario()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
    v_motivo TEXT;
BEGIN
    BEGIN
        v_usuario := current_setting('app.current_user_id', true);
        v_motivo := current_setting('app.motivo_eliminacion_beneficiario', true);
    EXCEPTION WHEN OTHERS THEN
        v_usuario := NULL;
        v_motivo := NULL;
    END;
    
    INSERT INTO auditoria_eliminacion_beneficiarios (
        num_beneficiario, cedula, nombres, apellidos, id_caso, id_usuario_elimino,
        fecha_nacimiento, sexo, tipo_beneficiario, parentesco, motivo
    ) VALUES (
        OLD.num_beneficiario, OLD.cedula, OLD.nombres, OLD.apellidos, OLD.id_caso, v_usuario,
        OLD.fecha_nac, OLD.sexo, OLD.tipo_beneficiario, OLD.parentesco, v_motivo
    );
    
    RETURN OLD;
END;
$function$;

-- 3. Actualizar trigger de eliminación de soportes para usar tabla correcta y capturar motivo
CREATE OR REPLACE FUNCTION public.trigger_auditar_eliminacion_soporte()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    cedula_usuario VARCHAR(20);
    v_motivo TEXT;
BEGIN
    BEGIN
        cedula_usuario := current_setting('app.usuario_elimina_soporte', true);
        v_motivo := current_setting('app.motivo_eliminacion_soporte', true);
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING 'No se pudo leer variables de sesión: %', SQLERRM;
            RETURN OLD;
    END;
    
    IF cedula_usuario IS NULL OR cedula_usuario = '' THEN
        RAISE WARNING 'Variable app.usuario_elimina_soporte está vacía o es NULL';
        RETURN OLD;
    END IF;
    
    BEGIN
        INSERT INTO auditoria_eliminacion_soportes (
            num_soporte,
            id_caso,
            nombre_archivo,
            tipo_mime,
            descripcion,
            fecha_consignacion,
            tamano_bytes,
            id_usuario_subio,
            id_usuario_elimino,
            motivo,
            fecha_eliminacion
        ) VALUES (
            OLD.num_soporte,
            OLD.id_caso,
            OLD.nombre_archivo,
            OLD.tipo_mime,
            OLD.descripcion,
            OLD.fecha_consignacion,
            OLD.tamano_bytes,
            OLD.id_usuario_subio,
            cedula_usuario,
            v_motivo,
            (NOW() AT TIME ZONE 'America/Caracas')
        );
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING 'Error al insertar en auditoría: %', SQLERRM;
            RETURN OLD;
    END;
    
    RETURN OLD;
END;
$function$;

-- 4. Actualizar función eliminar_caso_fisico con motivos contextualizados
CREATE OR REPLACE FUNCTION eliminar_caso_fisico(
    p_id_caso INTEGER,
    p_cedula_actor VARCHAR,
    p_motivo TEXT
) RETURNS VOID AS $$
DECLARE
    v_motivo_relacionados TEXT;
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

    BEGIN
        -- Variables para auditoría de CASOS (usa motivo original)
        PERFORM set_config('app.usuario_elimina_caso', p_cedula_actor, true);
        PERFORM set_config('app.motivo_eliminacion_caso', p_motivo, true);
        
        -- Variables para auditoría de CITAS (usa motivo con contexto)
        PERFORM set_config('app.usuario_elimina_cita', p_cedula_actor, true);
        PERFORM set_config('app.motivo_eliminacion_cita', v_motivo_relacionados, true);
        
        -- Variables para auditoría de BENEFICIARIOS
        PERFORM set_config('app.current_user_id', p_cedula_actor, true);
        PERFORM set_config('app.motivo_eliminacion_beneficiario', v_motivo_relacionados, true);
        
        -- Variables para auditoría de ACCIONES
        PERFORM set_config('app.usuario_elimina_accion', p_cedula_actor, true);
        PERFORM set_config('app.motivo_eliminacion_accion', v_motivo_relacionados, true);
        
        -- Variables para auditoría de SOPORTES
        PERFORM set_config('app.usuario_elimina_soporte', p_cedula_actor, true);
        PERFORM set_config('app.motivo_eliminacion_soporte', v_motivo_relacionados, true);

        -- Eliminar referencias en orden inverso de dependencias
        DELETE FROM ejecutan WHERE id_caso = p_id_caso;
        DELETE FROM acciones WHERE id_caso = p_id_caso;
        DELETE FROM atienden WHERE id_caso = p_id_caso;
        DELETE FROM citas WHERE id_caso = p_id_caso;
        DELETE FROM cambio_estatus WHERE id_caso = p_id_caso;
        DELETE FROM soportes WHERE id_caso = p_id_caso;
        DELETE FROM beneficiarios WHERE id_caso = p_id_caso;
        DELETE FROM supervisa WHERE id_caso = p_id_caso;
        DELETE FROM se_le_asigna WHERE id_caso = p_id_caso;
        DELETE FROM casos WHERE id_caso = p_id_caso;

    EXCEPTION
        WHEN foreign_key_violation THEN
            RAISE EXCEPTION 'No se puede eliminar el caso porque aún tiene referencias activas. Detalle: %', SQLERRM;
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Error al eliminar caso: %', SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql;
