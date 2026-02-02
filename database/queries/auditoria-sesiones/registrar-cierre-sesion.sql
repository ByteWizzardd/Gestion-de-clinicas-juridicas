UPDATE auditoria_sesiones
SET fecha_cierre = NOW()
WHERE id_sesion = $1 AND fecha_cierre IS NULL;
