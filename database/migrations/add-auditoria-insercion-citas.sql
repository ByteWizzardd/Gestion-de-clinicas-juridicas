-- Migración: Agregar tabla de auditoría para inserciones de citas
-- Fecha: 2026-01-03
-- Descripción: Crea una tabla para registrar las citas creadas con información de auditoría

-- Crear tabla de auditoría para inserciones de citas
CREATE TABLE IF NOT EXISTS auditoria_insercion_citas (
    id SERIAL PRIMARY KEY,
    num_cita INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    fecha_encuentro DATE NOT NULL,
    fecha_proxima_cita DATE,
    orientacion TEXT NOT NULL,
    id_usuario_creo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Crear índices para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_auditoria_insercion_citas_num_cita ON auditoria_insercion_citas(num_cita);
CREATE INDEX IF NOT EXISTS idx_auditoria_insercion_citas_id_caso ON auditoria_insercion_citas(id_caso);
CREATE INDEX IF NOT EXISTS idx_auditoria_insercion_citas_id_usuario_creo ON auditoria_insercion_citas(id_usuario_creo);
CREATE INDEX IF NOT EXISTS idx_auditoria_insercion_citas_fecha_creacion ON auditoria_insercion_citas(fecha_creacion);
