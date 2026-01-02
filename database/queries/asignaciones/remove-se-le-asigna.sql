-- Deshabilitar o eliminar asignación de estudiante
-- Parámetros:
--   $1 = term
--   $2 = cedula_estudiante
--   $3 = id_caso
UPDATE se_le_asigna 
SET habilitado = false
WHERE term = $1 
  AND cedula_estudiante = $2 
  AND id_caso = $3;

