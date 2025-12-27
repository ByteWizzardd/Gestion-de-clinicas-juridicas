-- =========================================================
-- FUNCION: eliminar_usuario_fisico
-- Elimina físicamente un usuario y todas sus referencias asociadas.
-- Parámetros:
--   p_cedula_usuario VARCHAR(20): Usuario a eliminar
--   p_cedula_actor   VARCHAR(20): Usuario que realiza la acción
--   p_motivo         TEXT: Motivo de la eliminación (obligatorio)
--
-- NOTA: Usar solo en casos excepcionales. Se recomienda preferir el soft delete.
-- =========================================================

CREATE OR REPLACE FUNCTION eliminar_usuario_fisico(
    p_cedula_usuario VARCHAR,
    p_cedula_actor VARCHAR,
    p_motivo TEXT
) RETURNS VOID AS $$
DECLARE
    casos_count INTEGER;
    acciones_count INTEGER;
    datos_usuario JSONB;
BEGIN
    -- Validar motivo
    IF p_motivo IS NULL OR TRIM(p_motivo) = '' THEN
        RAISE EXCEPTION 'El motivo es obligatorio para eliminaciones físicas de usuarios';
    END IF;

    -- Verificar existencia del usuario
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE cedula = p_cedula_usuario) THEN
        RAISE EXCEPTION 'Usuario con cédula % no encontrado', p_cedula_usuario;
    END IF;

    -- Obtener datos del usuario para auditoría
    SELECT row_to_json(u.*)::jsonb INTO datos_usuario
    FROM usuarios u
    WHERE u.cedula = p_cedula_usuario;

    -- Contar casos y acciones asociadas
    SELECT COUNT(*) INTO casos_count FROM (
        SELECT 1 FROM casos c INNER JOIN supervisa s ON c.id_caso = s.id_caso WHERE s.cedula_profesor = p_cedula_usuario
        UNION ALL
        SELECT 1 FROM casos c INNER JOIN se_le_asigna sla ON c.id_caso = sla.id_caso WHERE sla.cedula_estudiante = p_cedula_usuario
    ) t;

    SELECT COUNT(*) INTO acciones_count FROM acciones WHERE id_usuario_registra = p_cedula_usuario;

    IF casos_count > 0 OR acciones_count > 0 THEN
        RAISE WARNING 'Este usuario tiene % caso(s) y % acción(es) asociados. Esta información se perderá.', casos_count, acciones_count;
    END IF;

    BEGIN
        -- Establecer el usuario actual para el trigger de auditoría
        PERFORM set_config('app.current_user', p_cedula_actor, true);

        -- 1. Eliminar tokens de recuperación de contraseña
        DELETE FROM password_reset_tokens WHERE cedula_usuario = p_cedula_usuario;

        -- 2. Eliminar de atienden
        DELETE FROM atienden WHERE id_usuario = p_cedula_usuario;

        -- 3. Eliminar de ejecutan
        DELETE FROM ejecutan WHERE id_usuario_ejecuta = p_cedula_usuario;

        -- 4. Eliminar de supervisa
        DELETE FROM supervisa WHERE cedula_profesor = p_cedula_usuario;

        -- 5. Eliminar de se_le_asigna
        DELETE FROM se_le_asigna WHERE cedula_estudiante = p_cedula_usuario;

        -- 6. Actualizar acciones (id_usuario_registra = NULL)
        UPDATE acciones SET id_usuario_registra = NULL WHERE id_usuario_registra = p_cedula_usuario;

        -- 7. Actualizar cambio_estatus (id_usuario_cambia = NULL)
        UPDATE cambio_estatus SET id_usuario_cambia = NULL WHERE id_usuario_cambia = p_cedula_usuario;

        -- 8. Eliminar de coordinadores
        DELETE FROM coordinadores WHERE id_coordinador = p_cedula_usuario;

        -- 9. Eliminar de estudiantes
        DELETE FROM estudiantes WHERE cedula_estudiante = p_cedula_usuario;

        -- 10. Eliminar de profesores
        DELETE FROM profesores WHERE cedula_profesor = p_cedula_usuario;

        -- 12. Eliminar de usuarios (Esto disparará el trigger)
        DELETE FROM usuarios WHERE cedula = p_cedula_usuario;

        RAISE NOTICE 'Usuario % eliminado completamente del sistema por usuario %', p_cedula_usuario, p_cedula_actor;

    EXCEPTION
        WHEN foreign_key_violation THEN
            RAISE EXCEPTION 'No se puede eliminar el usuario porque aún tiene referencias activas. Use disable.sql (Soft Delete) en su lugar.';
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Error al eliminar usuario: %', SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql;
