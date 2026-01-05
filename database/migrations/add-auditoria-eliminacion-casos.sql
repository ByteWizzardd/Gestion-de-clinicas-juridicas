-- Migración: Agregar tabla de auditoría para eliminaciones de casos
-- Fecha: 2026-01-03
-- Descripción: Crea una tabla para registrar todas las eliminaciones de casos con información de auditoría

-- Crear tabla de auditoría para eliminaciones de casos
CREATE TABLE IF NOT EXISTS auditoria_eliminacion_casos (
    id SERIAL PRIMARY KEY,
    caso_eliminado INTEGER NOT NULL, -- ID del caso eliminado
    fecha_solicitud DATE,
    fecha_inicio_caso DATE,
    fecha_fin_caso DATE,
    tramite VARCHAR(200),
    observaciones TEXT,
    id_nucleo INTEGER,
    cedula_solicitante VARCHAR(20),
    id_materia INTEGER,
    num_categoria INTEGER,
    num_subcategoria INTEGER,
    num_ambito_legal INTEGER,
    eliminado_por VARCHAR(20) REFERENCES usuarios(cedula) ON DELETE SET NULL, -- Cédula del usuario que realizó la eliminación
    motivo TEXT NOT NULL, -- Motivo de la eliminación
    fecha TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Crear índices para búsquedas
CREATE INDEX IF NOT EXISTS idx_auditoria_eliminacion_casos_id_caso ON auditoria_eliminacion_casos(caso_eliminado);
CREATE INDEX IF NOT EXISTS idx_auditoria_eliminacion_casos_cedula ON auditoria_eliminacion_casos(cedula_solicitante);
CREATE INDEX IF NOT EXISTS idx_auditoria_eliminacion_casos_usuario ON auditoria_eliminacion_casos(eliminado_por);
CREATE INDEX IF NOT EXISTS idx_auditoria_eliminacion_casos_fecha ON auditoria_eliminacion_casos(fecha);
