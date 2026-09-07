-- Eliminar un soporte específico
-- Parámetros: $1 = id_caso, $2 = num_soporte
-- 
-- Nota: el trigger genérico de auditoría (trg_audit_soportes) se encarga de registrar
-- quién eliminó el archivo antes de que se elimine físicamente.
-- La variable de sesión app.current_user_id debe establecerse antes del DELETE
-- en el código TypeScript usando set_config(...) dentro de una transacción.

-- Eliminar el registro (el trigger capturará la auditoría antes de eliminar usando OLD)
DELETE FROM soportes
WHERE id_caso = $1 AND num_soporte = $2
RETURNING num_soporte, id_caso, nombre_archivo;
