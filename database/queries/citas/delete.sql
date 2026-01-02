-- Eliminar una cita específica
-- Parámetros:
-- $1 = num_cita
-- $2 = id_caso
--
-- Nota: Esta query debe ejecutarse después de eliminar los registros de atienden
-- que referencian esta cita, debido a la foreign key constraint.

DELETE FROM citas
WHERE num_cita = $1::INTEGER 
  AND id_caso = $2::INTEGER
RETURNING num_cita, id_caso;
