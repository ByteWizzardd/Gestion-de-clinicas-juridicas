-- Obtener todos los usuarios participantes en un caso donde el profesor supervisa el caso
-- Parámetros: $1 = id_caso

SELECT 
    s.cedula_profesor
FROM supervisa s
JOIN usuarios u ON s.cedula_profesor = u.cedula
WHERE s.id_caso = $1;