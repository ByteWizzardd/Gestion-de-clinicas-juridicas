-- Retorna todos los datos de los solicitantes filtrados por nacionalidad
-- Incluye núcleo/fecha_solicitud/cantidad_casos (derivados del último caso)
SELECT 
    s.*,
    vs.edad,
    (
        SELECT n.nombre_nucleo
        FROM nucleos n
        WHERE n.id_nucleo = (
            SELECT ca.id_nucleo FROM casos ca
            WHERE ca.cedula = s.cedula
            ORDER BY ca.fecha_solicitud DESC, ca.id_caso DESC
            LIMIT 1
        )
        LIMIT 1
    ) AS nucleo,
    (
        SELECT ca.fecha_solicitud FROM casos ca
        WHERE ca.cedula = s.cedula
        ORDER BY ca.fecha_solicitud DESC, ca.id_caso DESC
        LIMIT 1
    ) AS fecha_solicitud,
    (
        SELECT COUNT(*) FROM casos ca
        WHERE ca.cedula = s.cedula
    ) AS cantidad_casos
FROM solicitantes s
INNER JOIN view_solicitantes_completo vs ON s.cedula = vs.cedula
WHERE s.nacionalidad = $1
ORDER BY s.cedula;
