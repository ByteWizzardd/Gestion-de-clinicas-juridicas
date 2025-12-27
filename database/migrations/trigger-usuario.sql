CREATE TABLE auditoria_eliminacion_usuario (
    id SERIAL PRIMARY KEY,
    usuario_eliminado VARCHAR(255) NOT NULL,
    eliminado_por VARCHAR(255) NOT NULL,
    motivo VARCHAR(250) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP FUNCTION IF EXISTS log_eliminacion_usuario() CASCADE;

CREATE FUNCTION log_eliminacion_usuario()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO auditoria_eliminacion_usuario (usuario_eliminado, eliminado_por, motivo)
    VALUES (
        OLD.cedula,
        current_setting('app.current_user', true),
        coalesce(current_setting('app.delete_reason', true), 'No especificado')
    );
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_eliminacion_usuario
AFTER DELETE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION log_eliminacion_usuario();