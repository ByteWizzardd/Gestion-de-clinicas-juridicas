-- Agregar campo de dirección de habitación al solicitante
-- Este campo almacena la dirección específica de residencia (calle, edificio, piso, etc.)

ALTER TABLE solicitantes 
ADD COLUMN direccion_habitacion TEXT;
