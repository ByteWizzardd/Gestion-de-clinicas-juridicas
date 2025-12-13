-- Actualizar un cliente con todos los datos completos
-- Parámetros:
-- $1 = cedula
-- $2 = telefono_local
-- $3 = telefono_celular (con código de país)
-- $4 = estado_civil
-- $5 = concubinato (BOOLEAN)
-- $6 = id_hogar
-- $7 = id_nivel_educativo
-- $8 = id_trabajo
-- $9 = id_vivienda

UPDATE clientes
SET 
    telefono_local = $2,
    telefono_celular = $3,
    estado_civil = $4,
    concubinato = $5,
    id_hogar = $6,
    id_nivel_educativo = $7,
    id_trabajo = $8,
    id_vivienda = $9
WHERE cedula = $1
RETURNING *;

