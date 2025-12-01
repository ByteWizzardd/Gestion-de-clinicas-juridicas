-- Actualizar un caso existente
-- Parámetros:
--   $1 = id_caso
--   $2 = tramite (opcional)
--   $3 = estatus (opcional)
--   $4 = observaciones (opcional)
--   $5 = fecha_fin_caso (opcional)
--   $6 = id_nucleo (opcional)
--   $7 = id_ambito_legal (opcional)
--   $8 = id_expediente (opcional)
UPDATE casos
SET 
    tramite = COALESCE($2, tramite),
    estatus = COALESCE($3, estatus),
    observaciones = COALESCE($4, observaciones),
    fecha_fin_caso = COALESCE($5, fecha_fin_caso),
    id_nucleo = COALESCE($6, id_nucleo),
    id_ambito_legal = COALESCE($7, id_ambito_legal),
    id_expediente = COALESCE($8, id_expediente)
WHERE id_caso = $1
RETURNING *;

