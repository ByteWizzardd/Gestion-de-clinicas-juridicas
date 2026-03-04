-- Obtener el último valor asignado por la secuencia.
-- El servicio sumará +1 para obtener el próximo ID.
-- Se castea a INTEGER para evitar que node-postgres lo trate como string (bigint).
SELECT CASE WHEN is_called THEN last_value::INTEGER ELSE 0 END AS last_id
FROM casos_id_caso_seq;

