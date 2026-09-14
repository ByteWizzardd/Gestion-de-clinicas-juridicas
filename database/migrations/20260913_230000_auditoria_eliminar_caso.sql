-- =============================================================================
-- Auditoría completa al eliminar un caso
-- =============================================================================
-- eliminar_caso_fisico borra todo lo asociado al caso. Las citas, acciones,
-- ejecutores, personas que atendieron, beneficiarios y soportes ya quedaban
-- auditados, pero los cambios de estatus y el equipo (supervisa /
-- se_le_asigna) no tienen trigger de eliminación y se perdían del historial.
--
-- Ahora el evento de eliminación del caso guarda en metadata:
--   * motivo: el que escribió el usuario (las entidades relacionadas siguen con
--     "(Eliminado por eliminación del caso #N)"),
--   * estatus_final: último estatus del caso,
--   * equipo: profesores y estudiantes asignados (cédula, nombre, semestre),
--   * eliminados: cuántas citas, acciones, beneficiarios, soportes y cambios
--     de estatus se eliminaron con él.
--
-- Idempotente: CREATE OR REPLACE.
-- =============================================================================

CREATE OR REPLACE FUNCTION eliminar_caso_fisico(
    p_id_caso INTEGER,
    p_cedula_actor VARCHAR,
    p_motivo TEXT
) RETURNS VOID AS $$
DECLARE
    v_motivo_relacionados TEXT;
    v_ejecutores_json JSONB;
    v_estatus_final TEXT;
    v_equipo JSONB;
    v_resumen JSONB;
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

    -- =========================================================
    -- Estado del caso al eliminarse, para su evento de auditoría: los cambios
    -- de estatus y el equipo (supervisa / se_le_asigna) no tienen trigger de
    -- eliminación, así que sin esto se perdían del historial.
    -- =========================================================
    SELECT nuevo_estatus INTO v_estatus_final
    FROM cambio_estatus WHERE id_caso = p_id_caso
    ORDER BY num_cambio DESC LIMIT 1;

    v_equipo := jsonb_build_object(
        'profesores', COALESCE((
            SELECT jsonb_agg(jsonb_build_object('cedula', s.cedula_profesor, 'nombre', u.nombres || ' ' || u.apellidos, 'term', s.term)
                             ORDER BY s.term DESC, u.apellidos)
            FROM supervisa s JOIN usuarios u ON u.cedula = s.cedula_profesor
            WHERE s.id_caso = p_id_caso), '[]'::jsonb),
        'estudiantes', COALESCE((
            SELECT jsonb_agg(jsonb_build_object('cedula', a.cedula_estudiante, 'nombre', u.nombres || ' ' || u.apellidos, 'term', a.term)
                             ORDER BY a.term DESC, u.apellidos)
            FROM se_le_asigna a JOIN usuarios u ON u.cedula = a.cedula_estudiante
            WHERE a.id_caso = p_id_caso), '[]'::jsonb)
    );

    v_resumen := jsonb_build_object(
        'citas', (SELECT count(*) FROM citas WHERE id_caso = p_id_caso),
        'acciones', (SELECT count(*) FROM acciones WHERE id_caso = p_id_caso),
        'beneficiarios', (SELECT count(*) FROM beneficiarios WHERE id_caso = p_id_caso),
        'soportes', (SELECT count(*) FROM soportes WHERE id_caso = p_id_caso),
        'cambios_estatus', (SELECT count(*) FROM cambio_estatus WHERE id_caso = p_id_caso)
    );

    BEGIN
        -- =========================================================
        -- Variables de sesión para el trigger genérico de auditoría: un solo
        -- actor y un solo motivo (con contexto) para toda la cascada de deletes.
        -- =========================================================
        PERFORM set_config('app.current_user_id', p_cedula_actor, true);
        PERFORM set_config('app.audit_metadata', jsonb_build_object('motivo', v_motivo_relacionados)::text, true);

        -- Registrar los ejecutores de cada acción como su propio evento de auditoría
        -- ANTES de borrarlos (una vez eliminado `ejecutan`, esta información se pierde).
        INSERT INTO auditoria_eventos (entidad, operacion, id_entidad, id_usuario, datos_anteriores, metadata)
        SELECT
            'accion_ejecutores',
            'eliminacion',
            num_accion,
            p_cedula_actor,
            jsonb_build_object('ejecutores', detalle -> 'ejecutores_detalle'),
            jsonb_build_object('motivo', v_motivo_relacionados)
        FROM jsonb_each(v_ejecutores_json) AS t(num_accion, detalle);

        -- =========================================================
        -- Eliminar referencias en orden inverso de dependencias
        -- =========================================================

        -- 1. Eliminar ejecutores (depende de acciones)
        DELETE FROM ejecutan WHERE id_caso = p_id_caso;

        -- 2. Eliminar acciones (depende de casos)
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

        -- 10. Eliminar el caso. Su evento lleva el motivo tal como lo escribió el
        --     usuario (sin el "(Eliminado por eliminación del caso #N)" de las
        --     entidades relacionadas) y el estado del caso capturado arriba.
        PERFORM set_config('app.audit_metadata', jsonb_build_object(
            'motivo', p_motivo,
            'estatus_final', v_estatus_final,
            'equipo', v_equipo,
            'eliminados', v_resumen
        )::text, true);
        DELETE FROM casos WHERE id_caso = p_id_caso;

    EXCEPTION
        WHEN foreign_key_violation THEN
            RAISE EXCEPTION 'No se puede eliminar el caso porque aún tiene referencias activas. Detalle: %', SQLERRM;
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Error al eliminar caso: %', SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql;
