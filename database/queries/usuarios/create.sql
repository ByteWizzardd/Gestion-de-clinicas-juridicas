-- Crear un nuevo usuario
-- Parámetros:
-- $1 = cedula
-- $2 = nombres
-- $3 = apellidos
-- $4 = correo_electronico
-- $5 = nombre_usuario
-- $6 = contrasena (hash)
-- $7 = telefono_celular (puede ser NULL)
-- $8 = tipo_usuario ('Estudiante', 'Profesor', 'Coordinador')

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
) VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, $8)
RETURNING *;
