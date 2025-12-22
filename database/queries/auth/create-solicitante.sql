-- Crear un nuevo solicitante (mínimo requerido para registro)
-- Parámetros: 
-- $1 = cedula
-- $2 = nombres
-- $3 = apellidos
-- $4 = correo_electronico
-- $5 = telefono_celular (mínimo requerido)
-- $6 = fecha_nacimiento (requerido)
-- $7 = sexo (requerido: 'M' o 'F')
-- $8 = nacionalidad (requerido: 'V' o 'E')
-- Nota: Este query crea un solicitante básico. Los campos adicionales se actualizan después.

INSERT INTO solicitantes (
    cedula,
    nombres,
    apellidos,
    correo_electronico,
    telefono_celular,
    fecha_nacimiento,
    sexo,
    nacionalidad,
    estado_civil,
    concubinato,
    tiempo_estudio,
    id_nivel_educativo,
    id_trabajo,
    id_actividad,
    id_estado,
    num_municipio,
    num_parroquia
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 
    'Soltero', -- Valor por defecto, se actualizará después
    false, -- Valor por defecto, se actualizará después
    '', -- Valor por defecto, se actualizará después
    1, -- ID por defecto, se actualizará después
    1, -- ID por defecto, se actualizará después
    1, -- ID por defecto, se actualizará después
    1, -- ID por defecto, se actualizará después
    1, -- ID por defecto, se actualizará después
    1  -- ID por defecto, se actualizará después
)
ON CONFLICT (cedula) DO UPDATE
SET nombres = EXCLUDED.nombres,
    apellidos = EXCLUDED.apellidos,
    correo_electronico = EXCLUDED.correo_electronico,
    telefono_celular = EXCLUDED.telefono_celular
RETURNING *;

