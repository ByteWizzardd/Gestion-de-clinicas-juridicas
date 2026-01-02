-- Actualizar una cita existente
-- Parámetros:
-- $1 = num_cita
-- $2 = id_caso
-- $3 = fecha_encuentro (opcional, puede ser NULL para no actualizar)
-- $4 = fecha_proxima_cita (puede ser NULL para no actualizar, o el string 'NULL' para establecer como NULL)
-- $5 = orientacion (opcional, puede ser NULL para no actualizar)
-- 
-- Nota: Para establecer fecha_proxima_cita como NULL explícitamente,
-- se debe pasar el string 'NULL' como texto. Para no actualizar, pasar NULL.
-- 
-- Nota: La variable de sesión 'app.usuario_actualiza_cita' debe establecerse antes
-- de ejecutar esta query para que el trigger de auditoría funcione correctamente.

UPDATE citas
SET 
    fecha_encuentro = COALESCE($3, fecha_encuentro),
    fecha_proxima_cita = CASE 
        WHEN $4::text = 'NULL' THEN NULL::DATE
        WHEN $4 IS NOT NULL THEN $4::DATE
        ELSE fecha_proxima_cita
    END,
    orientacion = COALESCE($5, orientacion)
WHERE num_cita = $1::INTEGER 
  AND id_caso = $2::INTEGER
RETURNING num_cita, id_caso;
