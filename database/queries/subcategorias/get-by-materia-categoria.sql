-- Obtener subcategorías de una materia y categoría específicas
-- Parámetros: $1 = id_materia, $2 = num_categoria
SELECT 
    num_subcategoria,
    nombre_subcategoria
FROM subcategorias
WHERE id_materia = $1 AND num_categoria = $2 AND habilitado = true
ORDER BY num_subcategoria;

