UPDATE solicitantes
SET nombres = $2, apellidos = $3, fecha_nacimiento = $4, sexo = $5
WHERE cedula = $1;
