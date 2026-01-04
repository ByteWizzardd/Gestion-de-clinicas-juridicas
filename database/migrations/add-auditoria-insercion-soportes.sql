-- Tabla para registrar metadatos de soportes creados (sin guardar el archivo completo)
CREATE TABLE IF NOT EXISTS auditoria_insercion_soportes (
    id SERIAL PRIMARY KEY,
    num_soporte INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    nombre_archivo VARCHAR(150) NOT NULL,
    tipo_mime VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_consignacion DATE NOT NULL,
    tamano_bytes INTEGER, -- Tamaño del archivo en bytes (sin guardar el archivo)
    id_usuario_subio VARCHAR(20) REFERENCES usuarios(cedula),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Crear índices para búsquedas por caso y usuario que subió
CREATE INDEX IF NOT EXISTS idx_auditoria_insercion_soportes_caso ON auditoria_insercion_soportes(id_caso);
CREATE INDEX IF NOT EXISTS idx_auditoria_insercion_soportes_usuario_subio ON auditoria_insercion_soportes(id_usuario_subio);
CREATE INDEX IF NOT EXISTS idx_auditoria_insercion_soportes_fecha ON auditoria_insercion_soportes(fecha_creacion);

-- Función trigger para capturar inserciones de soportes
CREATE OR REPLACE FUNCTION trigger_auditoria_insercion_soporte()
RETURNS TRIGGER AS $$
BEGIN
    -- Insertar en la tabla de auditoría de inserciones
    INSERT INTO auditoria_insercion_soportes (
        num_soporte,
        id_caso,
        nombre_archivo,
        tipo_mime,
        descripcion,
        fecha_consignacion,
        tamano_bytes,
        id_usuario_subio
    ) VALUES (
        NEW.num_soporte,
        NEW.id_caso,
        NEW.nombre_archivo,
        NEW.tipo_mime,
        NEW.descripcion,
        NEW.fecha_consignacion,
        LENGTH(NEW.documento_data), -- Calcular tamaño del archivo
        NEW.id_usuario_subio
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger
DROP TRIGGER IF EXISTS trigger_auditoria_insercion_soporte ON soportes;
CREATE TRIGGER trigger_auditoria_insercion_soporte
    AFTER INSERT ON soportes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_insercion_soporte();
