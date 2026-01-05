-- Check if nivel educativo has associations
-- Parámetros:
-- $1 = id_nivel_educativo

SELECT EXISTS (
    SELECT 1 FROM solicitantes WHERE id_nivel_educativo = $1
    UNION
    SELECT 1 FROM familias_y_hogares WHERE id_nivel_educativo_jefe = $1
) AS has_associations;
