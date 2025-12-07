-- Obtener el último ID de caso registrado
-- Retorna el id_caso más alto o 0 si no hay casos
SELECT COALESCE(MAX(id_caso), 0) AS last_id
FROM casos;

