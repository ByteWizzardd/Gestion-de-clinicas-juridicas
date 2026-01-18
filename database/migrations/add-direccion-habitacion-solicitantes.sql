-- Agregar columna direccion_habitacion a la tabla solicitantes
ALTER TABLE solicitantes
ADD COLUMN direccion_habitacion VARCHAR(500);

-- Actualizar la vista de solicitantes completos para incluir la nueva columna
-- (Aunque usa s.*, es buena práctica recrearla para asegurar que el cache de la vista se actualice)
CREATE OR REPLACE VIEW view_solicitantes_completo AS
SELECT 
    s.*,
    -- Edad derivada: calculada desde fecha_nacimiento
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, s.fecha_nacimiento))::INTEGER AS edad
FROM solicitantes s;
