-- Crear un nuevo cliente (mínimo requerido para registro)
-- Parámetros: 
-- $1 = cedula
-- $2 = nombres
-- $3 = apellidos
-- $4 = correo_electronico
-- $5 = telefono_celular (mínimo requerido)
-- $6 = fecha_nacimiento (requerido)
-- $7 = sexo (requerido: 'M' o 'F')
-- $8 = nacionalidad (requerido: 'V' o 'Ext')

INSERT INTO clientes (
    cedula,
    nombres,
    apellidos,
    correo_electronico,
    telefono_celular,
    fecha_nacimiento,
    sexo,
    nacionalidad
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
ON CONFLICT (cedula) DO UPDATE
SET nombres = EXCLUDED.nombres,
    apellidos = EXCLUDED.apellidos,
    correo_electronico = EXCLUDED.correo_electronico,
    telefono_celular = EXCLUDED.telefono_celular
RETURNING *;

