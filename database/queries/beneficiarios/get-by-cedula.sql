-- Obtener beneficiario completo por cédula (búsqueda exacta)
-- Parámetro: $1 = cédula exacta
SELECT 
    b.cedula,
    b.nombres,
    b.apellidos,
    b.fecha_nac AS fecha_nacimiento,
    b.sexo,
    b.nombres || ' ' || b.apellidos AS nombre_completo
FROM beneficiarios b
WHERE b.cedula = $1
LIMIT 1;

