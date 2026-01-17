-- Recrear vista view_solicitantes_completo para incluir la nueva columna direccion_habitacion
-- La vista usa s.* pero PostgreSQL no actualiza automáticamente las vistas cuando se agregan columnas

-- Eliminar la vista existente
DROP VIEW IF EXISTS view_solicitantes_completo CASCADE;

-- Recrear la vista
CREATE VIEW view_solicitantes_completo AS
SELECT 
    s.*,
    -- Edad derivada: calculada desde fecha_nacimiento
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, s.fecha_nacimiento))::INTEGER AS edad
FROM solicitantes s;
