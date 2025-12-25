-- Verificar si un correo electrónico ya existe en otro solicitante
-- Parámetros:
-- $1 = correo_electronico

SELECT cedula, nombres, apellidos
FROM solicitantes
WHERE correo_electronico = $1
LIMIT 1;

