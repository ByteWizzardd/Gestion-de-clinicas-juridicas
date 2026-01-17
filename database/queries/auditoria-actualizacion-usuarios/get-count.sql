-- Obtener el conteo total de actualizaciones de usuarios (excluyendo cambios de estatus puro)
SELECT COUNT(*) as count
FROM auditoria_actualizacion_usuarios a
-- Incluir todas las actualizaciones
;
