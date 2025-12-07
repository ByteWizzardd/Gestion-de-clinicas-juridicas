-- Migración: Agregar campo password_hash a la tabla usuarios
-- Fecha: 2024-12-06

-- Agregar columna password_hash a la tabla usuarios
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Agregar columna correo_institucional si no existe (para login)
-- Nota: Asumimos que el correo está en la tabla clientes
-- Si necesitas un campo específico en usuarios, descomenta:
-- ALTER TABLE usuarios 
-- ADD COLUMN IF NOT EXISTS correo_institucional VARCHAR(100) UNIQUE;

