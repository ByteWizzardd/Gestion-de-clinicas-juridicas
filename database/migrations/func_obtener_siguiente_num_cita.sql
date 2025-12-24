-- Migración: Crear función obtener_siguiente_num_cita
-- Esta función retorna el siguiente número de cita para un caso específico
-- Debe ejecutarse después de tener la tabla 'citas' creada

CREATE OR REPLACE FUNCTION obtener_siguiente_num_cita(id_caso_param INTEGER)
RETURNS INTEGER AS $$
DECLARE
    siguiente_num_cita INTEGER;
BEGIN
    SELECT COALESCE(MAX(num_cita), 0) + 1 INTO siguiente_num_cita
    FROM citas
    WHERE id_caso = id_caso_param;
    RETURN siguiente_num_cita;
END;
$$ LANGUAGE plpgsql;
