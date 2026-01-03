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