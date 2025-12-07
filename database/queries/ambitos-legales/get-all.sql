-- Obtener todos los ámbitos legales únicos
-- Usa DISTINCT ON para eliminar duplicados basándose en materia
-- Si hay múltiples registros con la misma materia, toma el primero
SELECT DISTINCT ON (materia)
    id_ambito_legal,
    materia,
    tipo,
    descripcion
FROM ambitos_legales
ORDER BY materia, id_ambito_legal;

