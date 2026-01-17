UPDATE usuarios
SET nombres = $2, apellidos = $3
WHERE cedula = $1;
