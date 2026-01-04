-- Tabla para auditar las actualizaciones de tipo_usuario
CREATE TABLE IF NOT EXISTS auditoria_actualizacion_tipo_usuario (
    id SERIAL PRIMARY KEY,
    ci_usuario VARCHAR(20) NOT NULL, 
    tipo_usuario_anterior VARCHAR(255) NOT NULL,
    tipo_usuario_nuevo VARCHAR(255) NOT NULL,
    actualizado_por VARCHAR(255) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

