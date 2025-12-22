-- Verificar si un ámbito legal existe por su clave compuesta
-- Parámetros: $1 = id_materia, $2 = num_categoria, $3 = num_subcategoria, $4 = num_ambito_legal
SELECT id_materia, num_categoria, num_subcategoria, num_ambito_legal 
FROM ambitos_legales 
WHERE id_materia = $1 
  AND num_categoria = $2 
  AND num_subcategoria = $3 
  AND num_ambito_legal = $4;

