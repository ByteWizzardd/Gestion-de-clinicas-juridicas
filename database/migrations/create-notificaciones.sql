-- Migración: Crear tabla notificaciones
-- Descripción: Crea la tabla de notificaciones del sistema

-- Crear la tabla solo si no existe (idempotente)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'notificaciones'
    ) THEN
        CREATE TABLE notificaciones (
            id_notificacion INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            cedula_receptor VARCHAR(20) NOT NULL,
            cedula_emisor VARCHAR(20) NOT NULL,
            titulo VARCHAR(100) NOT NULL,
            mensaje TEXT NOT NULL,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            leida BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (cedula_receptor) REFERENCES usuarios(cedula) ON DELETE CASCADE,
            FOREIGN KEY (cedula_emisor) REFERENCES usuarios(cedula) ON DELETE CASCADE
        );
    END IF;
END $$;