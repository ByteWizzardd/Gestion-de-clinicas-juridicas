-- Obtener categorías de una materia específica
-- Parámetro: $1 = id_materia
SELECT 
    num_categoria,
    nombre_categoria
FROM categorias
WHERE id_materia = $1
ORDER BY num_categoria;

