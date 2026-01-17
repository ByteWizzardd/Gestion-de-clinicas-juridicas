-- Establecer variable de sesión para el trigger de auditoría
SELECT set_config('app.usuario_actualiza_solicitante', $6, true);

UPDATE solicitantes
SET nombres = $2, apellidos = $3, correo_electronico = $4, telefono_celular = $5
WHERE cedula = $1;
