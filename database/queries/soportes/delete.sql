-- Eliminar un soporte específico
-- Parámetros: $1 = id_caso, $2 = num_soporte
-- 
-- Nota: El trigger trigger_auditoria_eliminacion_soporte se encarga de registrar
-- quién eliminó el archivo antes de que se elimine físicamente.
-- La variable de sesión app.usuario_elimina_soporte debe establecerse antes del DELETE
-- en el código TypeScript usando SET LOCAL dentro de una transacción.

-- Eliminar el registro (el trigger capturará la auditoría antes de eliminar usando OLD)
DELETE FROM soportes
WHERE id_caso = $1 AND num_soporte = $2
RETURNING num_soporte, id_caso, nombre_archivo;
