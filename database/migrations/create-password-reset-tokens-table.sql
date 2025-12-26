-- Migración: Crear tabla password_reset_tokens
-- Fecha: 2025-01-XX
-- Descripción: Crea la tabla para almacenar tokens de recuperación de contraseña

-- Crear la tabla password_reset_tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id_token SERIAL PRIMARY KEY,
    cedula_usuario VARCHAR(20) NOT NULL,
    codigo_verificacion VARCHAR(10) NOT NULL,
    fecha_expiracion DATE NOT NULL,
    usado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion DATE NOT NULL DEFAULT CURRENT_DATE,
    
    FOREIGN KEY (cedula_usuario) REFERENCES usuarios(cedula)
);

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_password_reset_cedula ON password_reset_tokens(cedula_usuario);
CREATE INDEX IF NOT EXISTS idx_password_reset_code ON password_reset_tokens(codigo_verificacion);
CREATE INDEX IF NOT EXISTS idx_password_reset_expired ON password_reset_tokens(fecha_expiracion, usado);

