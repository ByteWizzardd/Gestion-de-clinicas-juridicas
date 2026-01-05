-- Actualizar TODA la información de un solicitante
-- Parámetros:
-- $1 = cedula
-- $2 = nombres
-- $3 = apellidos
-- $4 = correo_electronico
-- $5 = telefono_local
-- $6 = telefono_celular (con código de país)
-- $7 = fecha_nacimiento
-- $8 = sexo
-- $9 = estado_civil
-- $10 = concubinato (BOOLEAN)
-- $11 = tipo_tiempo_estudio
-- $12 = tiempo_estudio (INTEGER)
-- $13 = id_nivel_educativo
-- $14 = id_trabajo
-- $15 = id_actividad
-- $16 = id_estado
-- $17 = num_municipio
-- $18 = num_parroquia

UPDATE solicitantes
SET 
    nombres = $2,
    apellidos = $3,
    correo_electronico = $4,
    telefono_local = $5,
    telefono_celular = $6,
    fecha_nacimiento = $7,
    sexo = $8,
    estado_civil = $9,
    concubinato = $10,
    tipo_tiempo_estudio = $11,
    tiempo_estudio = $12,
    id_nivel_educativo = $13,
    id_trabajo = $14,
    id_actividad = $15,
    id_estado = $16,
    num_municipio = $17,
    num_parroquia = $18
WHERE cedula = $1
RETURNING *;
