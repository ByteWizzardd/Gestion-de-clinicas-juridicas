-- Migración: Remover campo id_nucleo de la tabla clientes
-- Fecha: 2025-12-13
-- Descripción: Elimina la columna id_nucleo de la tabla clientes ya que no debe tener núcleo

-- Paso 1: Eliminar la vista que depende de la columna
DROP VIEW IF EXISTS view_clientes_info;

-- Paso 2: Eliminar la foreign key constraint si existe
ALTER TABLE clientes
DROP CONSTRAINT IF EXISTS clientes_id_nucleo_fkey;

-- Paso 3: Eliminar la columna id_nucleo
ALTER TABLE clientes
DROP COLUMN IF EXISTS id_nucleo;

-- Paso 4: Recrear la vista sin la columna id_nucleo
CREATE VIEW view_clientes_info AS
SELECT t.*, EXTRACT(YEAR FROM AGE(CURRENT_DATE, t.fecha_nacimiento))::INTEGER AS edad_calculada 
FROM clientes t;

