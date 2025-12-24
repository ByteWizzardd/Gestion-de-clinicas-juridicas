-- Obtener ámbitos legales de una materia, categoría y subcategoría específicas
-- Parámetros: $1 = id_materia, $2 = num_categoria, $3 = num_subcategoria
SELECT 
    num_ambito_legal,
    nombre_ambito_legal
FROM ambitos_legales
WHERE id_materia = $1 
  AND num_categoria = $2 
  AND num_subcategoria = $3
ORDER BY num_ambito_legal;

