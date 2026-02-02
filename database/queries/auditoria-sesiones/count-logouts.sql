SELECT COUNT(*) as count 
FROM auditoria_sesiones 
WHERE fecha_cierre IS NOT NULL;
