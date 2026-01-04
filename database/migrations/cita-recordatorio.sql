CREATE TABLE IF NOT EXISTS cita_recordatorios (
  id_recordatorio BIGSERIAL PRIMARY KEY,
  appointment_id TEXT NOT NULL,
  recordatorio_tipo TEXT NOT NULL, -- ej: 'D-1'
  recordatorio_para DATE NOT NULL, -- fecha de la cita que se está recordando
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (appointment_id, recordatorio_tipo, recordatorio_para)
);