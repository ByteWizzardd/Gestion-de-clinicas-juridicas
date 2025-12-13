-- Crear artefactos domésticos para un hogar
-- Parámetros:
-- $1 = id_hogar
-- $2 = artefacto

INSERT INTO artefactos_domesticos (
    id_hogar,
    artefacto
) VALUES ($1, $2)
ON CONFLICT (id_hogar, artefacto) DO NOTHING
RETURNING *;

