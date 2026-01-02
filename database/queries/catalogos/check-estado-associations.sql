-- Check if estado has associations
SELECT EXISTS (
    SELECT 1 FROM municipios WHERE id_estado = $1
    UNION
    SELECT 1 FROM clientes WHERE id_estado = $1
) AS has_associations;
