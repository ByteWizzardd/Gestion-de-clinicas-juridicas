-- Obtener todos los niveles educativos
-- Ordenados por id_nivel_educativo

SELECT 
    id_nivel_educativo,
    descripcion,
    habilitado
FROM niveles_educativos
ORDER BY id_nivel_educativo;

