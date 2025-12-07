-- Obtener el profesor responsable activo de un caso específico
-- Retorna el primer profesor con asignación activa (fecha_fin NULL o >= hoy)
-- Incluye el nombre completo del profesor desde la tabla clientes
SELECT DISTINCT 
    a.cedula_profesor,
    c.nombres || ' ' || c.apellidos AS nombre_completo_profesor
FROM asignaciones a
INNER JOIN clientes c ON a.cedula_profesor = c.cedula
WHERE a.id_caso = $1
  AND (a.fecha_fin IS NULL OR a.fecha_fin >= CURRENT_DATE)
ORDER BY a.cedula_profesor
LIMIT 1;
