-- Verificar si un solicitante existe por su cédula
-- Parámetros: $1 = cedula
SELECT cedula FROM solicitantes WHERE cedula = $1;

