-- Deshabilitar o eliminar asignación de profesor supervisor
-- Parámetros:
--   $1 = term
--   $2 = cedula_profesor
--   $3 = id_caso
UPDATE supervisa 
SET habilitado = false
WHERE term = $1 
  AND cedula_profesor = $2 
  AND id_caso = $3;

