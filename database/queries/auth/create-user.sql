-- Crear nuevo usuario con contraseña hasheada
-- Parámetros: 
-- $1 = cedula
-- $2 = password_hash
-- $3 = rol_sistema
-- Nota: El usuario debe existir primero en la tabla clientes

-- Primero verificamos que el cliente existe
-- Luego insertamos en usuarios
INSERT INTO usuarios (cedula, password_hash, rol_sistema, habilitado)
VALUES ($1, $2, $3, TRUE)
ON CONFLICT (cedula) DO UPDATE
SET password_hash = $2,
    rol_sistema = $3
RETURNING cedula, habilitado, rol_sistema;

