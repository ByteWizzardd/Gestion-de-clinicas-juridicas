-- Check if materia has associations
-- Parameters:
--   $1 = id_materia
-- Returns: true if has associations, false otherwise
SELECT EXISTS (
    SELECT 1 FROM categorias WHERE id_materia = $1
    UNION
    SELECT 1 FROM casos WHERE id_materia = $1
) AS has_associations;
