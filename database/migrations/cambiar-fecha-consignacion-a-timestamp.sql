-- =========================================================
-- MIGRACIÓN: cambiar-fecha-consignacion-a-timestamp
-- Fecha: 2026-01-18
-- Descripción: Cambia fecha_consignacion de DATE a TIMESTAMP WITH TIME ZONE
--              en las tablas de soportes para registrar fecha y hora exacta
-- =========================================================

-- 1. Tabla principal de soportes
ALTER TABLE soportes 
ALTER COLUMN fecha_consignacion TYPE TIMESTAMP WITH TIME ZONE 
USING fecha_consignacion::timestamp with time zone;

ALTER TABLE soportes 
ALTER COLUMN fecha_consignacion SET DEFAULT (NOW() AT TIME ZONE 'America/Caracas');

-- 2. Tabla de auditoría de inserción de soportes
ALTER TABLE auditoria_insercion_soportes 
ALTER COLUMN fecha_consignacion TYPE TIMESTAMP WITH TIME ZONE 
USING fecha_consignacion::timestamp with time zone;

-- 3. Tabla de auditoría de eliminación de soportes
ALTER TABLE auditoria_eliminacion_soportes 
ALTER COLUMN fecha_consignacion TYPE TIMESTAMP WITH TIME ZONE 
USING fecha_consignacion::timestamp with time zone;
