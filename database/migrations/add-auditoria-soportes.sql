-- Migración: Agregar campos de auditoría a la tabla soportes
-- Fecha: 2026-01-02
-- Descripción: Agrega campos para registrar quién subió y eliminó cada soporte

-- Agregar campo para registrar quién subió el archivo
ALTER TABLE soportes
ADD COLUMN IF NOT EXISTS id_usuario_subio VARCHAR(20) REFERENCES usuarios(cedula);

-- Agregar campo para registrar la fecha de subida (si no existe ya)
-- Nota: fecha_consignacion ya existe, pero agregamos fecha_subida para claridad
ALTER TABLE soportes
ADD COLUMN IF NOT EXISTS fecha_subida DATE DEFAULT CURRENT_DATE;

-- Actualizar registros existentes: establecer fecha_subida igual a fecha_consignacion
UPDATE soportes
SET fecha_subida = fecha_consignacion
WHERE fecha_subida IS NULL;

-- Crear índice para búsquedas por usuario que subió
CREATE INDEX IF NOT EXISTS idx_soportes_usuario_subio ON soportes(id_usuario_subio);

-- Crear tabla de auditoría para eliminaciones de soportes
-- Nota: No guardamos el documento_data para ahorrar espacio, solo metadatos
CREATE TABLE IF NOT EXISTS auditoria_eliminacion_soportes (
    id SERIAL PRIMARY KEY,
    num_soporte INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    nombre_archivo VARCHAR(150) NOT NULL,
    tipo_mime VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_consignacion DATE NOT NULL,
    fecha_subida DATE,
    tamano_bytes INTEGER, -- Tamaño del archivo en bytes (sin guardar el archivo)
    id_usuario_subio VARCHAR(20) REFERENCES usuarios(cedula),
    id_usuario_elimino VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    motivo TEXT, -- Motivo de la eliminación
    fecha_eliminacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice para búsquedas por caso y usuario que eliminó
CREATE INDEX IF NOT EXISTS idx_auditoria_soportes_caso ON auditoria_eliminacion_soportes(id_caso);
CREATE INDEX IF NOT EXISTS idx_auditoria_soportes_usuario_elimino ON auditoria_eliminacion_soportes(id_usuario_elimino);
CREATE INDEX IF NOT EXISTS idx_auditoria_soportes_fecha ON auditoria_eliminacion_soportes(fecha_eliminacion);
