--- Insert un recordatorio para una cita específica
INSERT INTO cita_recordatorios (appointment_id, recordatorio_tipo, recordatorio_para)
VALUES ($1, $2, $3::date)
ON CONFLICT (appointment_id, recordatorio_tipo, recordatorio_para) DO NOTHING
RETURNING appointment_id;