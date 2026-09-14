-- Crear una notificación solo si el receptor no tiene ya una idéntica
-- (mismo título y mensaje). La usa scripts/send-cita-reminders.mjs para no
-- repetir un recordatorio si el script corre más de una vez el mismo día.
-- Parámetros: $1 = cedula_receptor, $2 = cedula_emisor, $3 = titulo, $4 = mensaje
-- Devuelve la fila creada, o ninguna si ya existía.
INSERT INTO notificaciones (cedula_receptor, cedula_emisor, titulo, mensaje)
SELECT $1::VARCHAR, $2::VARCHAR, $3::VARCHAR, $4::TEXT
WHERE NOT EXISTS (
    SELECT 1
    FROM notificaciones
    WHERE cedula_receptor = $1::VARCHAR
      AND titulo = $3::VARCHAR
      AND mensaje = $4::TEXT
)
RETURNING id_notificacion;
