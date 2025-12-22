-- Retorna todos los solicitantes
-- Un solicitante es una persona que tiene todos los datos completos requeridos
-- Y que tiene al menos un caso registrado

SELECT 
    s.cedula,
    s.nombres,
    s.apellidos,
    s.telefono_celular,
    vs.edad,
    (
        SELECT n.nombre_nucleo 
        FROM nucleos n 
        WHERE n.id_nucleo = (
            SELECT ca.id_nucleo FROM casos ca WHERE ca.cedula = s.cedula 
            LIMIT 1
        )
        LIMIT 1
    ) AS nucleo,
    (
        SELECT fecha_solicitud FROM casos ca WHERE ca.cedula = s.cedula 
        ORDER BY fecha_solicitud DESC
        LIMIT 1
    ) AS fecha_solicitud
FROM solicitantes s
INNER JOIN view_solicitantes_completo vs ON s.cedula = vs.cedula
WHERE EXISTS (
    SELECT 1 FROM casos ca WHERE ca.cedula = s.cedula
)
ORDER BY s.cedula;