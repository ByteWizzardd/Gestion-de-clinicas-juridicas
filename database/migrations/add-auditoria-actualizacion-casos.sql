-- Migración: Agregar tabla de auditoría para actualizaciones de casos
-- Fecha: 2026-01-03
-- Descripción: Crea una tabla para registrar todas las actualizaciones de casos con información de auditoría

-- Crear tabla de auditoría para actualizaciones de casos
CREATE TABLE IF NOT EXISTS auditoria_actualizacion_casos (
    id SERIAL PRIMARY KEY,
    id_caso INTEGER,
    -- Valores anteriores (antes de la actualización)
    fecha_solicitud_anterior DATE,
    fecha_inicio_caso_anterior DATE,
    fecha_fin_caso_anterior DATE,
    tramite_anterior VARCHAR(200),
    observaciones_anterior TEXT,
    id_nucleo_anterior INTEGER,
    cedula_solicitante_anterior VARCHAR(20),
    id_materia_anterior INTEGER,
    num_categoria_anterior INTEGER,
    num_subcategoria_anterior INTEGER,
    num_ambito_legal_anterior INTEGER,
    -- Valores nuevos (después de la actualización)
    fecha_solicitud_nuevo DATE,
    fecha_inicio_caso_nuevo DATE,
    fecha_fin_caso_nuevo DATE,
    tramite_nuevo VARCHAR(200),
    observaciones_nuevo TEXT,
    id_nucleo_nuevo INTEGER,
    cedula_solicitante_nuevo VARCHAR(20),
    id_materia_nuevo INTEGER,
    num_categoria_nuevo INTEGER,
    num_subcategoria_nuevo INTEGER,
    num_ambito_legal_nuevo INTEGER,
    -- Información de auditoría
    id_usuario_actualizo VARCHAR(20) REFERENCES usuarios(cedula) ON DELETE SET NULL,
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Crear índices para búsquedas
CREATE INDEX IF NOT EXISTS idx_auditoria_actualizacion_casos_id_caso ON auditoria_actualizacion_casos(id_caso);
CREATE INDEX IF NOT EXISTS idx_auditoria_actualizacion_casos_usuario ON auditoria_actualizacion_casos(id_usuario_actualizo);
CREATE INDEX IF NOT EXISTS idx_auditoria_actualizacion_casos_fecha ON auditoria_actualizacion_casos(fecha_actualizacion);
