-- =========================================================
-- FUNCION: eliminar_caso_fisico
-- Elimina físicamente un caso y todas sus referencias asociadas.
-- Parámetros:
--   p_id_caso INTEGER: ID del caso a eliminar
--   p_cedula_actor VARCHAR(20): Usuario que realiza la acción
--   p_motivo TEXT: Motivo de la eliminación (obligatorio)
--
-- NOTA: El trigger trigger_auditoria_eliminacion_caso se encarga de registrar
-- la auditoría antes de eliminar usando OLD.
-- Las entidades relacionadas (citas, beneficiarios, acciones, soportes) 
-- también registran su auditoría con el motivo contextualizado.
-- Los ejecutores de acciones se capturan ANTES de eliminar para preservarlos
-- en la auditoría (tanto texto resumido como detalle por ejecutor).
-- =========================================================

CREATE OR REPLACE FUNCTION eliminar_caso_fisico(
    p_id_caso INTEGER,
    p_cedula_actor VARCHAR,
    p_motivo TEXT
) RETURNS VOID AS $$
DECLARE
    v_motivo_relacionados TEXT;
    v_ejecutores_json JSONB;
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
    
    -- =========================================================
    -- Capturar ejecutores de todas las acciones del caso ANTES de eliminarlos
    -- Incluye:
    --   - ejecutores_texto: String con nombres concatenados
    --   - fecha_ejecucion: Primera fecha de ejecución
    --   - ejecutores_detalle: Array JSON con datos de cada ejecutor
    -- =========================================================
    SELECT COALESCE(jsonb_object_agg(
        e.num_accion::text,
        jsonb_build_object(
            'ejecutores_texto', (
                SELECT string_agg(u.nombres || ' ' || u.apellidos, ', ')
                FROM ejecutan e2
                JOIN usuarios u ON e2.id_usuario_ejecuta = u.cedula
                WHERE e2.num_accion = e.num_accion AND e2.id_caso = e.id_caso
            ),
            'fecha_ejecucion', (
                SELECT MIN(e3.fecha_ejecucion)
                FROM ejecutan e3
                WHERE e3.num_accion = e.num_accion AND e3.id_caso = e.id_caso
            ),
            'ejecutores_detalle', (
                SELECT jsonb_agg(jsonb_build_object(
                    'cedula', e4.id_usuario_ejecuta,
                    'nombres', u2.nombres,
                    'apellidos', u2.apellidos,
                    'fecha', e4.fecha_ejecucion
                ))
                FROM ejecutan e4
                JOIN usuarios u2 ON e4.id_usuario_ejecuta = u2.cedula
                WHERE e4.num_accion = e.num_accion AND e4.id_caso = e.id_caso
            )
        )
    ), '{}'::jsonb)
    INTO v_ejecutores_json
    FROM (SELECT DISTINCT num_accion, id_caso FROM ejecutan WHERE id_caso = p_id_caso) e;

    BEGIN
        -- =========================================================
        -- Establecer variables de sesión para TODOS los triggers de auditoría
        -- =========================================================
        
        -- Variables para auditoría de CASOS (usa motivo original)
        PERFORM set_config('app.usuario_elimina_caso', p_cedula_actor, true);
        PERFORM set_config('app.motivo_eliminacion_caso', p_motivo, true);
        
        -- Variables para auditoría de CITAS (usa motivo con contexto)
        PERFORM set_config('app.usuario_elimina_cita', p_cedula_actor, true);
        PERFORM set_config('app.motivo_eliminacion_cita', v_motivo_relacionados, true);
        
        -- Variables para auditoría de BENEFICIARIOS
        PERFORM set_config('app.current_user_id', p_cedula_actor, true);
        PERFORM set_config('app.motivo_eliminacion_beneficiario', v_motivo_relacionados, true);
        
        -- Variables para auditoría de ACCIONES (incluyendo ejecutores pre-capturados)
        PERFORM set_config('app.usuario_elimina_accion', p_cedula_actor, true);
        PERFORM set_config('app.motivo_eliminacion_accion', v_motivo_relacionados, true);
        PERFORM set_config('app.ejecutores_acciones_json', v_ejecutores_json::text, true);
        
        -- Variables para auditoría de SOPORTES
        PERFORM set_config('app.usuario_elimina_soporte', p_cedula_actor, true);
        PERFORM set_config('app.motivo_eliminacion_soporte', v_motivo_relacionados, true);

        -- =========================================================
        -- Eliminar referencias en orden inverso de dependencias
        -- =========================================================
        
        -- 1. Eliminar ejecutores (depende de acciones)
        DELETE FROM ejecutan WHERE id_caso = p_id_caso;
        
        -- 2. Eliminar acciones (depende de casos) - trigger lee ejecutores del JSON
        DELETE FROM acciones WHERE id_caso = p_id_caso;
        
        -- 3. Eliminar atienden (depende de citas)
        DELETE FROM atienden WHERE id_caso = p_id_caso;
        
        -- 4. Eliminar citas (depende de casos)
        DELETE FROM citas WHERE id_caso = p_id_caso;
        
        -- 5. Eliminar cambios de estatus (depende de casos)
        DELETE FROM cambio_estatus WHERE id_caso = p_id_caso;
        
        -- 6. Eliminar soportes (depende de casos)
        DELETE FROM soportes WHERE id_caso = p_id_caso;
        
        -- 7. Eliminar beneficiarios (depende de casos)
        DELETE FROM beneficiarios WHERE id_caso = p_id_caso;
        
        -- 8. Eliminar supervisa (depende de casos)
        DELETE FROM supervisa WHERE id_caso = p_id_caso;
        
        -- 9. Eliminar se_le_asigna (depende de casos)
        DELETE FROM se_le_asigna WHERE id_caso = p_id_caso;

        -- 10. Eliminar el caso (el trigger registrará la auditoría antes de eliminar)
        DELETE FROM casos WHERE id_caso = p_id_caso;

    EXCEPTION
        WHEN foreign_key_violation THEN
            RAISE EXCEPTION 'No se puede eliminar el caso porque aún tiene referencias activas. Detalle: %', SQLERRM;
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Error al eliminar caso: %', SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql;
