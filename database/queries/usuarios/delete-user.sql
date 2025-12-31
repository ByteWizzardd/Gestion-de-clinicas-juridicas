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
BEGIN
    -- Validar motivo
    IF p_motivo IS NULL OR TRIM(p_motivo) = '' THEN
        RAISE EXCEPTION 'El motivo es obligatorio para eliminaciones físicas de usuarios';
    END IF;

    -- Verificar existencia del usuario
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE cedula = p_cedula_usuario) THEN
        RAISE EXCEPTION 'Usuario con cédula % no encontrado', p_cedula_usuario;
    END IF;

    -- Se podría mandar esto para que el usuario conozca las implicaciones
    -- Contar casos y acciones asociadas (solo informativo)
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
        -- Eliminar referencias
        DELETE FROM password_reset_tokens WHERE cedula_usuario = p_cedula_usuario;
        DELETE FROM atienden WHERE id_usuario = p_cedula_usuario;
        DELETE FROM ejecutan WHERE id_usuario_ejecuta = p_cedula_usuario;
        DELETE FROM supervisa WHERE cedula_profesor = p_cedula_usuario;
        DELETE FROM se_le_asigna WHERE cedula_estudiante = p_cedula_usuario;
        UPDATE acciones SET id_usuario_registra = NULL WHERE id_usuario_registra = p_cedula_usuario;
        UPDATE cambio_estatus SET id_usuario_cambia = NULL WHERE id_usuario_cambia = p_cedula_usuario;
        DELETE FROM coordinadores WHERE id_coordinador = p_cedula_usuario;
        DELETE FROM estudiantes WHERE cedula_estudiante = p_cedula_usuario;
        DELETE FROM profesores WHERE cedula_profesor = p_cedula_usuario;

        -- Eliminar de usuarios
        DELETE FROM usuarios WHERE cedula = p_cedula_usuario;

        -- Auditoría de eliminación
        INSERT INTO auditoria_eliminacion_usuario (
            usuario_eliminado, eliminado_por, motivo, fecha
        ) VALUES (
            p_cedula_usuario,
            p_cedula_actor,
            p_motivo,
            CURRENT_TIMESTAMP
        );

    EXCEPTION
        WHEN foreign_key_violation THEN
            RAISE EXCEPTION 'No se puede eliminar el usuario porque aún tiene referencias activas. Use disable.sql (Soft Delete) en su lugar.';
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Error al eliminar usuario: %', SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql;