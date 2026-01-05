-- Migración: Agregar tabla de auditoría para eliminaciones de solicitantes
-- Fecha: 2026-01-03
-- Descripción: Crea una tabla para registrar todas las eliminaciones de solicitantes con información de auditoría

-- Crear tabla de auditoría para eliminaciones de solicitantes
CREATE TABLE IF NOT EXISTS auditoria_eliminacion_solicitantes (
    id SERIAL PRIMARY KEY,
    solicitante_eliminado VARCHAR(20) NOT NULL, -- Cédula del solicitante eliminado
    nombres_solicitante_eliminado VARCHAR(100), -- Nombre del solicitante eliminado (guardado antes de eliminar)
    apellidos_solicitante_eliminado VARCHAR(100), -- Apellido del solicitante eliminado (guardado antes de eliminar)
    eliminado_por VARCHAR(20) REFERENCES usuarios(cedula) ON DELETE SET NULL, -- Cédula del usuario que realizó la eliminación
    motivo TEXT NOT NULL, -- Motivo de la eliminación
    fecha TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Crear índices para búsquedas
CREATE INDEX IF NOT EXISTS idx_auditoria_eliminacion_solicitantes_cedula ON auditoria_eliminacion_solicitantes(solicitante_eliminado);
CREATE INDEX IF NOT EXISTS idx_auditoria_eliminacion_solicitantes_usuario ON auditoria_eliminacion_solicitantes(eliminado_por);
CREATE INDEX IF NOT EXISTS idx_auditoria_eliminacion_solicitantes_fecha ON auditoria_eliminacion_solicitantes(fecha);
