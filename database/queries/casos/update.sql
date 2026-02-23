-- Actualizar un caso existente
-- Nota: El estatus se actualiza mediante la tabla cambio_estatus, no directamente en casos
-- Parámetros:
--   $1 = id_caso
--   $2 = tramite (opcional)
--   $3 = observaciones (opcional)
--   $4 = fecha_fin_caso (opcional)
--   $5 = id_nucleo (opcional)
--   $6 = id_materia (opcional)
--   $7 = num_categoria (opcional)
--   $8 = num_subcategoria (opcional)
--   $9 = num_ambito_legal (opcional)
--   $10 = fecha_solicitud (opcional)
--   $11 = cedula (opcional)
UPDATE casos
SET 
    tramite = COALESCE($2, tramite),
    observaciones = COALESCE($3, observaciones),
    fecha_fin_caso = COALESCE($4, fecha_fin_caso),
    id_nucleo = COALESCE($5, id_nucleo),
    id_materia = COALESCE($6, id_materia),
    num_categoria = COALESCE($7, num_categoria),
    num_subcategoria = COALESCE($8, num_subcategoria),
    num_ambito_legal = COALESCE($9, num_ambito_legal),
    fecha_solicitud = COALESCE($10, fecha_solicitud),
    cedula = COALESCE($11, cedula)
WHERE id_caso = $1
RETURNING *;

