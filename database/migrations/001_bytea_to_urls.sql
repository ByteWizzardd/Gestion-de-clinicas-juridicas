-- =========================================================
-- MIGRACIÓN: Cambiar BYTEA a VARCHAR (URLs)
-- =========================================================
-- Este script convierte el almacenamiento de archivos binarios
-- a URLs (Vercel Blob)
-- 
-- ADVERTENCIA: Los datos binarios existentes se perderán.
-- Ejecutar solo después de hacer backup o en desarrollo.
-- =========================================================

-- 1) Modificar tabla USUARIOS: foto_perfil de BYTEA a VARCHAR
-- Primero eliminar los datos existentes (BYTEA no se puede convertir directamente)
UPDATE usuarios SET foto_perfil = NULL;

-- Cambiar el tipo de la columna
ALTER TABLE usuarios 
ALTER COLUMN foto_perfil TYPE VARCHAR(500) USING NULL;

-- Agregar comentario descriptivo
COMMENT ON COLUMN usuarios.foto_perfil IS 'URL de la foto de perfil almacenada en Vercel Blob';

-- 2) Modificar tabla SOPORTES: documento_data de BYTEA a url_documento VARCHAR
-- Primero, agregar la nueva columna
ALTER TABLE soportes 
ADD COLUMN url_documento VARCHAR(500);

-- Eliminar la columna documento_data (los archivos binarios se perderán)
ALTER TABLE soportes 
DROP COLUMN documento_data;

-- Agregar comentario descriptivo
COMMENT ON COLUMN soportes.url_documento IS 'URL del documento almacenado en Vercel Blob';

-- =========================================================
-- Verificar estructura final
-- =========================================================
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'usuarios' AND column_name = 'foto_perfil';

SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'soportes';
