-- Obtener artefactos domésticos de un cliente
-- Parámetros: $1 = cedula
SELECT ad.artefacto
FROM artefactos_domesticos ad
INNER JOIN clientes c ON ad.id_hogar = c.id_hogar
WHERE c.cedula = $1
ORDER BY ad.artefacto;

