-- Crear un nuevo nivel educativo
-- Parámetros:
-- $1 = nivel (0-14)
-- $2 = anos_cursados
-- $3 = semestres_cursados
-- $4 = trimestres_cursados

INSERT INTO niveles_educativos (
    nivel,
    anos_cursados,
    semestres_cursados,
    trimestres_cursados
) VALUES ($1, $2, $3, $4)
RETURNING *;

