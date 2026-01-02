-- Crear o actualizar asignación de estudiante a un caso
-- Parámetros:
--   $1 = term
--   $2 = cedula_estudiante
--   $3 = id_caso
--   $4 = habilitado (opcional, por defecto true)
INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, habilitado)
VALUES ($1, $2, $3, COALESCE($4, true))
ON CONFLICT (term, cedula_estudiante, id_caso) 
DO UPDATE SET habilitado = COALESCE($4, true)
RETURNING *;

