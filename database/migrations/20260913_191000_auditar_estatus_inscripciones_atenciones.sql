-- =============================================================================
-- Fix: tablas cuyos cambios no quedaban en auditoria_eventos.
--
--   cambio_estatus -> 'cambio_estatus'  (cambios de estatus de un caso: En
--                      proceso, Archivado, Entregado, Asesoría; incluye el
--                      archivado masivo de casos inactivos)
--   estudiantes    -> 'estudiante'      (inscripción de un estudiante en un
--                      semestre y cambios de tipo/NRC/habilitado)
--   profesores     -> 'profesor'        (asignación de un profesor en un
--                      semestre y cambios de tipo/habilitado)
--   atienden       -> 'atencion_cita'   (personas que atienden una cita)
--
-- Todas usan fn_auditoria_generica (requiere la migración
-- 20260913_190000_ocultar_columnas_sensibles_auditoria.sql, que agrega el
-- respaldo de actor para cambio_estatus, cuyo INSERT no pasa por
-- withAuditTransaction). La lectura (get-unified-logs.sql /
-- filtro-eventos.sql) fusiona estos eventos con el del caso, cita o usuario
-- de la misma transacción para mostrar una sola tarjeta.
--
-- Sin trigger a propósito:
--   - UPDATE/DELETE de cambio_estatus: el historial de estatus solo crece; se
--     borra únicamente junto con el caso, que ya se audita.
--   - UPDATE de atienden: la app nunca actualiza filas, solo borra e inserta.
--   - DELETE de estudiantes/profesores: solo ocurre al eliminar el usuario
--     (usuarios/delete-user.sql), que ya se audita como 'usuario'.
--
-- Idempotente: DROP TRIGGER IF EXISTS + CREATE TRIGGER.
--
-- Uso:
--   psql "$DATABASE_URL" -f database/migrations/20260913_191000_auditar_estatus_inscripciones_atenciones.sql
-- =============================================================================

DROP TRIGGER IF EXISTS trg_audit_cambio_estatus ON cambio_estatus;
CREATE TRIGGER trg_audit_cambio_estatus
AFTER INSERT ON cambio_estatus
FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('cambio_estatus', 'num_cambio,id_caso');

DROP TRIGGER IF EXISTS trg_audit_estudiantes ON estudiantes;
CREATE TRIGGER trg_audit_estudiantes
AFTER INSERT OR UPDATE ON estudiantes
FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('estudiante', 'term,cedula_estudiante');

DROP TRIGGER IF EXISTS trg_audit_profesores ON profesores;
CREATE TRIGGER trg_audit_profesores
AFTER INSERT OR UPDATE ON profesores
FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('profesor', 'term,cedula_profesor');

DROP TRIGGER IF EXISTS trg_audit_atienden ON atienden;
CREATE TRIGGER trg_audit_atienden
AFTER INSERT OR DELETE ON atienden
FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('atencion_cita', 'num_cita,id_caso,id_usuario');
