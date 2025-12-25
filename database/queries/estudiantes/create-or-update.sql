-- Crear o actualizar un estudiante
-- Parámetros:
-- $1 = term (semestre)
-- $2 = cedula_estudiante
-- $3 = tipo_estudiante
-- $4 = nrc

INSERT INTO estudiantes (
    term,
    cedula_estudiante,
    tipo_estudiante,
    nrc
)
VALUES ($1, $2, $3, $4)
ON CONFLICT (term, cedula_estudiante) DO UPDATE
SET tipo_estudiante = EXCLUDED.tipo_estudiante,
    nrc = EXCLUDED.nrc
RETURNING *;

