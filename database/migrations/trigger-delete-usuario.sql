CREATE TABLE IF NOT EXISTS auditoria_eliminacion_usuario (
    id SERIAL PRIMARY KEY,
    usuario_eliminado VARCHAR(255) NOT NULL,
    eliminado_por VARCHAR(255) NOT NULL,
    motivo VARCHAR(250) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);