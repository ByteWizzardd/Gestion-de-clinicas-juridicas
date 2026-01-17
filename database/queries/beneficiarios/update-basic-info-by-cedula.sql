-- Establecer variable de sesión para el trigger de auditoría
SELECT set_config('app.current_user_id', $6, true);

UPDATE beneficiarios
SET nombres = $2, apellidos = $3, fecha_nac = $4, sexo = $5
WHERE cedula = $1;
