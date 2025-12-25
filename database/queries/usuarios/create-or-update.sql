-- Crear o actualizar un usuario
-- Parámetros:
-- $1 = cedula
-- $2 = nombres
-- $3 = apellidos
-- $4 = correo_electronico
-- $5 = nombre_usuario
-- $6 = contrasena (hash)
-- $7 = telefono_celular (puede ser NULL)

INSERT INTO usuarios (
    cedula, 
    nombres, 
    apellidos, 
    correo_electronico, 
    nombre_usuario, 
    contrasena, 
    telefono_celular, 
    habilitado_sistema, 
    tipo_usuario
)
VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, 'Estudiante')
ON CONFLICT (cedula) DO UPDATE
SET nombres = EXCLUDED.nombres,
    apellidos = EXCLUDED.apellidos,
    correo_electronico = EXCLUDED.correo_electronico,
    nombre_usuario = EXCLUDED.nombre_usuario,
    contrasena = EXCLUDED.contrasena,
    telefono_celular = EXCLUDED.telefono_celular
RETURNING *;

