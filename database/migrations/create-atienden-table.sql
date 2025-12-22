-- Migración: Crear tabla atienden
-- Descripción: Crea la nueva tabla atienden para registrar quién atendió cada cita

-- Crear la tabla atienden
CREATE TABLE IF NOT EXISTS atienden (
    id_usuario VARCHAR(20) NOT NULL,
    num_cita INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE,
    
    PRIMARY KEY (num_cita, id_caso, id_usuario),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(cedula),
    FOREIGN KEY (num_cita, id_caso) REFERENCES citas(num_cita, id_caso)
);


