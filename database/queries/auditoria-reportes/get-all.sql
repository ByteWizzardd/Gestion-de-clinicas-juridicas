-- Obtener todos los registros de auditoría de reportes con filtros opcionales
-- Parámetros opcionales:
-- $1 = fecha_inicio (DATE, opcional)
-- $2 = fecha_fin (DATE, opcional)
-- $3 = id_usuario_genero (VARCHAR, opcional)
-- $4 = tipo_reporte (VARCHAR, opcional)
-- $5 = orden (TEXT, opcional) - 'asc' o 'desc' (por defecto 'desc')
-- $6 = operacion (VARCHAR, opcional) - 'generacion' o 'vista_previa'
SELECT 
    ar.id,
    ar.tipo_reporte,
    ar.filtros_aplicados,
    ar.formato,
    ar.cedula_solicitante,
    ar.operacion,
    to_char(ar.fecha_generacion, 'YYYY-MM-DD"T"HH24:MI:SS') as fecha_generacion,
    ar.id_usuario_genero,
    u.nombres AS nombres_usuario_genero,
    u.apellidos AS apellidos_usuario_genero,
    CONCAT(u.nombres, ' ', u.apellidos) AS nombre_completo_usuario_genero,
    u.foto_perfil AS foto_perfil_usuario_genero,
    -- Info del solicitante si aplica
    s.nombres AS nombres_solicitante,
    s.apellidos AS apellidos_solicitante,
    CONCAT(s.nombres, ' ', s.apellidos) AS nombre_completo_solicitante
FROM public.auditoria_reportes ar
LEFT JOIN public.usuarios u ON ar.id_usuario_genero = u.cedula
LEFT JOIN public.solicitantes s ON ar.cedula_solicitante = s.cedula
WHERE 
    ($1::DATE IS NULL OR ar.fecha_generacion::DATE >= $1)
    AND ($2::DATE IS NULL OR ar.fecha_generacion::DATE <= $2)
    AND ($3::VARCHAR IS NULL OR ar.id_usuario_genero = $3)
    AND ($4::VARCHAR IS NULL OR ar.tipo_reporte = $4)
    AND ($6::VARCHAR IS NULL OR ar.operacion = $6)
ORDER BY 
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') THEN ar.fecha_generacion END DESC NULLS LAST,
    CASE WHEN $5::TEXT = 'asc' THEN ar.fecha_generacion END ASC NULLS FIRST;
