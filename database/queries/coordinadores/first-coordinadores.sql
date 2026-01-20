SELECT cedula 
FROM usuarios 
WHERE habilitado_sistema = TRUE 
ORDER BY CASE tipo_usuario 
WHEN 'Coordinador' THEN 1 
WHEN 'Profesor' THEN 2 
WHEN 'Estudiante' THEN 3 
ELSE 4 END, 
cedula LIMIT 1
