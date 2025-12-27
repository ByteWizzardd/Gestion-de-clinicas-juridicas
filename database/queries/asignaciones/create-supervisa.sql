-- Crear o actualizar asignación de profesor supervisor a un caso
-- Parámetros:
--   $1 = term
--   $2 = cedula_profesor
--   $3 = id_caso
--   $4 = habilitado (opcional, por defecto true)
INSERT INTO supervisa (term, cedula_profesor, id_caso, habilitado)
VALUES ($1, $2, $3, COALESCE($4, true))
ON CONFLICT (term, cedula_profesor, id_caso) 
DO UPDATE SET habilitado = COALESCE($4, true)
RETURNING *;

