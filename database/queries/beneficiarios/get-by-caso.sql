-- Obtener todos los beneficiarios de un caso específico
-- Parámetros: $1 = id_caso
SELECT 
    b.num_beneficiario,
    b.id_caso,
    b.cedula,
    b.nombres,
    b.apellidos,
    b.fecha_nac,
    b.sexo,
    b.tipo_beneficiario,
    b.parentesco,
    b.nombres || ' ' || b.apellidos AS nombre_completo
FROM beneficiarios b
WHERE b.id_caso = $1
ORDER BY b.num_beneficiario;

