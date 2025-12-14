-- Migración: Agregar campo password_hash a la tabla usuarios
-- Fecha: 2024-12-06

-- Paso 1: Agregar columna password_hash a la tabla usuarios (nullable inicialmente)
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Paso 2: Si hay usuarios existentes sin contraseña, asignar un hash por defecto
-- NOTA: Ajusta esto según tus necesidades. Esto es solo un ejemplo.
-- UPDATE usuarios 
-- SET password_hash = '$2a$10$defaultHashHere' -- Reemplaza con un hash válido
-- WHERE password_hash IS NULL;

-- Paso 3: Hacer password_hash NOT NULL
ALTER TABLE usuarios 
ALTER COLUMN password_hash SET NOT NULL;

-- Agregar columna correo_institucional si no existe (para login)
-- Nota: Asumimos que el correo está en la tabla clientes
-- Si necesitas un campo específico en usuarios, descomenta:
-- ALTER TABLE usuarios 
-- ADD COLUMN IF NOT EXISTS correo_institucional VARCHAR(100) UNIQUE;

