-- Ejecutar este script para agregar la tabla de auditoría de descargas de soportes
-- a una base de datos existente

-- 26.3) AUDITORÍA DE DESCARGA DE SOPORTES
CREATE TABLE IF NOT EXISTS auditoria_descarga_soportes (
    id SERIAL PRIMARY KEY,
    num_soporte INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    nombre_archivo VARCHAR(150) NOT NULL,
    cedula_descargo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    ip_direccion VARCHAR(45), -- Soporta IPv4 e IPv6
    fecha_descarga TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Índices para mejorar rendimiento de consultas
CREATE INDEX IF NOT EXISTS idx_auditoria_descarga_soportes_caso ON auditoria_descarga_soportes(id_caso);
CREATE INDEX IF NOT EXISTS idx_auditoria_descarga_soportes_usuario ON auditoria_descarga_soportes(cedula_descargo);
CREATE INDEX IF NOT EXISTS idx_auditoria_descarga_soportes_fecha ON auditoria_descarga_soportes(fecha_descarga DESC);
