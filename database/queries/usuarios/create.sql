-- Crear nuevo usuario completo en la tabla usuarios
-- Parámetros: 
-- $1 = cedula
-- $2 = nombres
-- $3 = apellidos
-- $4 = correo_electronico
-- $5 = password_hash (contrasena)
-- $6 = tipo_usuario (rol_sistema)
-- $7 = telefono_celular (opcional)
-- Nota: nombre_usuario se asigna automáticamente mediante trigger basado en el correo

INSERT INTO usuarios (
    cedula,
    nombres,
    apellidos,
    correo_electronico,
    contrasena,
    tipo_usuario,
    telefono_celular,
    habilitado_sistema
) VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
RETURNING cedula, nombre_usuario, habilitado_sistema AS habilitado, tipo_usuario AS rol_sistema;

