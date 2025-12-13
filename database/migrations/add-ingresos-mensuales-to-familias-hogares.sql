-- Migración: Agregar campo ingresos_mensuales a familias_hogares
-- Fecha: 2025-12-13
-- Descripción: Agrega el campo ingresos_mensuales a la tabla familias_hogares

ALTER TABLE familias_hogares
ADD COLUMN ingresos_mensuales DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- Actualizar el valor por defecto después de agregar la columna
ALTER TABLE familias_hogares
ALTER COLUMN ingresos_mensuales DROP DEFAULT;

