-- Migración: Agregar campo nombre_usuario a la tabla usuarios
-- Fecha: 2025-01-XX
-- Descripción: Agrega nombre_usuario que contiene el nombre del correo UCAB sin el dominio

-- Paso 1: Agregar columna nombre_usuario a la tabla usuarios (nullable inicialmente)
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS nombre_usuario VARCHAR(100);

-- Paso 2: Extraer automáticamente el nombre_usuario desde el correo de clientes
-- para usuarios existentes. Maneja tanto @ucab.edu.ve como @est.ucab.edu.ve
UPDATE usuarios u
SET nombre_usuario = SPLIT_PART(c.correo_electronico, '@', 1)
FROM clientes c
WHERE u.cedula = c.cedula
  AND (c.correo_electronico LIKE '%@ucab.edu.ve' OR c.correo_electronico LIKE '%@est.ucab.edu.ve')
  AND u.nombre_usuario IS NULL;

-- Paso 3: Verificar que todos los usuarios tengan nombre_usuario antes de establecer NOT NULL
DO $$
DECLARE
    usuarios_sin_nombre INTEGER;
BEGIN
    SELECT COUNT(*) INTO usuarios_sin_nombre
    FROM usuarios
    WHERE nombre_usuario IS NULL;
    
    IF usuarios_sin_nombre > 0 THEN
        RAISE EXCEPTION 'No se puede establecer nombre_usuario como NOT NULL. Hay % usuario(s) sin correo UCAB (@ucab.edu.ve o @est.ucab.edu.ve). Por favor, actualiza los correos de estos usuarios primero.', usuarios_sin_nombre;
    END IF;
END $$;

-- Paso 4: Hacer nombre_usuario NOT NULL
ALTER TABLE usuarios 
ALTER COLUMN nombre_usuario SET NOT NULL;

