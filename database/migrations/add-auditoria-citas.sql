-- Migración: Agregar tabla de auditoría para eliminaciones de citas
-- Fecha: 2026-01-02
-- Descripción: Crea una tabla para registrar las citas eliminadas con información de auditoría

-- Crear tabla de auditoría para eliminaciones de citas
-- Solo guarda metadatos de la cita eliminada, no información adicional del caso
CREATE TABLE IF NOT EXISTS auditoria_eliminacion_citas (
    id SERIAL PRIMARY KEY,
    num_cita INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    fecha_encuentro DATE NOT NULL,
    fecha_proxima_cita DATE,
    orientacion TEXT NOT NULL,
    id_usuario_registro VARCHAR(20) REFERENCES usuarios(cedula), -- Usuario que registró la cita originalmente
    id_usuario_elimino VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    motivo TEXT, -- Motivo de la eliminación
    fecha_eliminacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
