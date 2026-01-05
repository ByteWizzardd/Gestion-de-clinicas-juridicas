-- Get all niveles educativos
SELECT 
    id_nivel_educativo,
    descripcion,
    habilitado
FROM niveles_educativos
ORDER BY id_nivel_educativo DESC;
