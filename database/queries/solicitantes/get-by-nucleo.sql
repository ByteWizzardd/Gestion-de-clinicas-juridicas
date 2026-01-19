-- Retorna los solicitantes cuyo núcleo (último caso) coincide con el nombre indicado
-- Retorna todos los datos de los solicitantes cuyo núcleo (último caso) coincide con el nombre indicado
SELECT 
    s.*,
    vs.edad,
    n.nombre_nucleo AS nucleo,
    ca.fecha_solicitud,
    (
        SELECT COUNT(*) FROM casos ca2 WHERE ca2.cedula = s.cedula
    ) AS cantidad_casos
FROM solicitantes s
INNER JOIN view_solicitantes_completo vs ON s.cedula = vs.cedula
INNER JOIN casos ca ON ca.cedula = s.cedula
INNER JOIN nucleos n ON ca.id_nucleo = n.id_nucleo
WHERE ca.id_caso = (
    SELECT ca2.id_caso FROM casos ca2 WHERE ca2.cedula = s.cedula ORDER BY ca2.fecha_solicitud DESC, ca2.id_caso DESC LIMIT 1
)
AND n.nombre_nucleo = $1
ORDER BY s.cedula;