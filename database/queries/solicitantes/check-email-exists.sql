-- Verificar si un correo electrónico ya existe en otro solicitante
-- Parámetros:
-- $1 = correo_electronico
-- $2 = cedula para excluir (opcional)

SELECT cedula, nombres, apellidos
FROM solicitantes
WHERE correo_electronico = $1
  AND ($2::VARCHAR IS NULL OR cedula != $2)
LIMIT 1;

