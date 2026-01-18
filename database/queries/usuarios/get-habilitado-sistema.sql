-- Obtiene el estado habilitado_sistema de un usuario
-- Parámetros: $1 = cedula

SELECT habilitado_sistema
FROM usuarios
WHERE cedula = $1;
