-- Obtener todos los núcleos únicos
-- Usa DISTINCT ON para eliminar duplicados basándose en nombre_nucleo
-- Si hay múltiples registros con el mismo nombre_nucleo, toma el primero
SELECT DISTINCT ON (nombre_nucleo)
    id_nucleo,
    nombre_nucleo
FROM nucleos
ORDER BY nombre_nucleo, id_nucleo;

