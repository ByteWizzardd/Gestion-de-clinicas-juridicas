-- Agregar columna foto_perfil a la tabla usuarios
-- Almacena la foto de perfil como BYTEA (similar a soportes.documento_data)
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS foto_perfil BYTEA;
