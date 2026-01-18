-- Crear un nuevo solicitante básico
-- Parámetros: 
-- $1 = cedula
-- $2 = nombres
-- $3 = apellidos
-- $4 = correo_electronico
-- $5 = telefono_celular
-- $6 = fecha_nacimiento
-- $7 = sexo ('M' o 'F')
-- $8 = nacionalidad ('V' o 'E')
-- $9 = id_trabajo (opcional, puede ser NULL)
-- $10 = id_actividad (opcional, puede ser NULL)
-- $11 = direccion_habitacion
-- 
-- Nota: Este query crea un solicitante con valores por defecto para los campos requeridos.
-- Los valores por defecto deben existir en las tablas de referencia.
-- IMPORTANTE: Asegúrate de que existan registros con id=1 en:
-- - niveles_educativos
-- - estados, municipios, parroquias (id_estado=1, num_municipio=1, num_parroquia=1)

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
    tipo_tiempo_estudio,
    tiempo_estudio,
    id_nivel_educativo,
    id_trabajo,
    id_actividad,
    id_estado,
    num_municipio,
    num_parroquia,
    direccion_habitacion
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 
    'Soltero', -- estado_civil por defecto
    false, -- concubinato por defecto
    NULL, -- tipo_tiempo_estudio por defecto (NULL)
    NULL, -- tiempo_estudio por defecto (NULL, INTEGER)
    1, -- id_nivel_educativo (debe existir en niveles_educativos)
    $9, -- id_trabajo (puede ser NULL)
    $10, -- id_actividad (puede ser NULL)
    1, -- id_estado (debe existir en estados)
    1, -- num_municipio (debe existir en municipios con id_estado=1)
    1, -- num_parroquia (debe existir en parroquias con id_estado=1, num_municipio=1)
    $11 -- direccion_habitacion
)
ON CONFLICT (cedula) DO UPDATE
SET nombres = EXCLUDED.nombres,
    apellidos = EXCLUDED.apellidos,
    correo_electronico = EXCLUDED.correo_electronico,
    telefono_celular = EXCLUDED.telefono_celular,
    direccion_habitacion = EXCLUDED.direccion_habitacion
RETURNING *;

