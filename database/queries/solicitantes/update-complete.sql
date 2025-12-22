-- Actualizar un solicitante con todos los datos completos
-- Parámetros:
-- $1 = cedula
-- $2 = telefono_local
-- $3 = telefono_celular (con código de país)
-- $4 = estado_civil
-- $5 = concubinato (BOOLEAN)
-- $6 = tiempo_estudio
-- $7 = id_nivel_educativo
-- $8 = id_trabajo
-- $9 = id_actividad
-- $10 = id_estado
-- $11 = num_municipio
-- $12 = num_parroquia

UPDATE solicitantes
SET 
    telefono_local = $2,
    telefono_celular = $3,
    estado_civil = $4,
    concubinato = $5,
    tiempo_estudio = $6,
    id_nivel_educativo = $7,
    id_trabajo = $8,
    id_actividad = $9,
    id_estado = $10,
    num_municipio = $11,
    num_parroquia = $12
WHERE cedula = $1
RETURNING *;

