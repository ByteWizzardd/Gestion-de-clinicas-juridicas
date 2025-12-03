-- Crear un nuevo caso
-- Parámetros: 
--   $1 = tramite
--   $2 = estatus
--   $3 = observaciones
--   $4 = cedula_cliente
--   $5 = id_nucleo (opcional, puede ser NULL)
--   $6 = id_ambito_legal (opcional, puede ser NULL)
--   $7 = id_expediente (opcional, puede ser NULL)
INSERT INTO casos (
    tramite,
    estatus,
    observaciones,
    cedula_cliente,
    id_nucleo,
    id_ambito_legal,
    id_expediente
) VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

