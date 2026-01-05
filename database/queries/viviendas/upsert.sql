-- Insertar o actualizar vivienda para un solicitante
-- Parámetros iguales a create.sql
INSERT INTO viviendas (
    cedula_solicitante,
    cant_habitaciones,
    cant_banos
) VALUES ($1, $2, $3)
ON CONFLICT (cedula_solicitante) 
DO UPDATE SET 
    cant_habitaciones = EXCLUDED.cant_habitaciones,
    cant_banos = EXCLUDED.cant_banos
RETURNING *;
