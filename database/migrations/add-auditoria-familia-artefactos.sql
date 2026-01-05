-- Migración: Agregar campos de familia y artefactos a auditoría de actualizaciones
-- Fecha: 2026-01-04
-- Descripción: Agrega campos para rastrear cambios en familia, jefe del hogar y artefactos (normalizado)

-- Agregar columnas para datos de familia (anterior y nuevo)
ALTER TABLE auditoria_actualizacion_solicitantes
ADD COLUMN IF NOT EXISTS jefe_hogar_anterior BOOLEAN,
ADD COLUMN IF NOT EXISTS jefe_hogar_nuevo BOOLEAN,
ADD COLUMN IF NOT EXISTS nivel_educativo_jefe_anterior VARCHAR(100),
ADD COLUMN IF NOT EXISTS nivel_educativo_jefe_nuevo VARCHAR(100),
ADD COLUMN IF NOT EXISTS ingresos_mensuales_anterior NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS ingresos_mensuales_nuevo NUMERIC(10,2);

-- Crear tabla normalizada para auditoría de artefactos domésticos
CREATE TABLE IF NOT EXISTS auditoria_artefactos_domesticos (
    id SERIAL PRIMARY KEY,
    id_auditoria_solicitante INTEGER REFERENCES auditoria_actualizacion_solicitantes(id) ON DELETE CASCADE,
    artefacto VARCHAR(100) NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('anterior', 'nuevo', 'sin_cambio')),
    -- 'anterior': existía antes pero ya no
    -- 'nuevo': no existía antes pero ahora sí
    -- 'sin_cambio': existía antes y sigue existiendo
    created_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_auditoria_artefactos_id_auditoria ON auditoria_artefactos_domesticos(id_auditoria_solicitante);

