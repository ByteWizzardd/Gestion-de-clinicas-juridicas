-- Creación de la tabla de auditoría para habilitación (reactivación) de usuarios
CREATE TABLE IF NOT EXISTS auditoria_habilitacion_usuario (
    id SERIAL PRIMARY KEY,
    usuario_habilitado VARCHAR(20) NOT NULL, -- Cédula del usuario reactivado
    nombres_usuario_habilitado VARCHAR(100), -- Nombre del usuario reactivado
    apellidos_usuario_habilitado VARCHAR(100), -- Apellido del usuario reactivado
    habilitado_por VARCHAR(20) NOT NULL, -- Cédula del usuario que realizó la habilitación
    motivo TEXT NOT NULL, -- Motivo de la habilitación
    fecha TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Comentario para el registro de migraciones
-- Migration: Add auditoria_habilitacion_usuario table
