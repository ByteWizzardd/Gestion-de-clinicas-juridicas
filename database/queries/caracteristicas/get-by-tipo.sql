SELECT 
    id_tipo_caracteristica,
    num_caracteristica,
    descripcion,
    habilitado
FROM caracteristicas
WHERE id_tipo_caracteristica = $1
  AND habilitado = TRUE
ORDER BY num_caracteristica;

