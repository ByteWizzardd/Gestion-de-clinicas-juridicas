-- Obtener todas las eliminaciones de solicitantes con filtros opcionales
-- Parámetros opcionales:
-- $1 = fecha_inicio (DATE, opcional)
-- $2 = fecha_fin (DATE, opcional)
-- $3 = eliminado_por (VARCHAR, opcional)
-- $4 = busqueda (TEXT, opcional) - busca en nombres, apellidos, cedula
-- $5 = orden (TEXT, opcional) - 'asc' o 'desc' (por defecto 'desc')
SELECT 
    a.id,
    a.solicitante_eliminado,
    a.nombres_solicitante_eliminado,
    a.apellidos_solicitante_eliminado,
    CONCAT(a.nombres_solicitante_eliminado, ' ', a.apellidos_solicitante_eliminado) AS nombre_completo_solicitante_eliminado,
    -- Datos personales
    a.fecha_nacimiento,
    a.telefono_local,
    a.telefono_celular,
    a.correo_electronico,
    a.sexo,
    a.nacionalidad,
    a.estado_civil,
    a.concubinato,
    a.tipo_tiempo_estudio,
    a.tiempo_estudio,
    a.nivel_educativo,
    a.condicion_trabajo,
    a.condicion_actividad,
    -- Ubicación
    a.estado,
    a.municipio,
    a.parroquia,
    -- Vivienda
    a.cant_habitaciones,
    a.cant_banos,
    a.caracteristicas_vivienda,
    -- Familia y hogar
    a.cant_personas,
    a.cant_trabajadores,
    a.cant_no_trabajadores,
    a.cant_ninos,
    a.cant_ninos_estudiando,
    a.jefe_hogar,
    a.ingresos_mensuales,
    a.nivel_educativo_jefe,
    -- Auditoría
    a.eliminado_por,
    u.nombres AS nombres_usuario_elimino,
    u.apellidos AS apellidos_usuario_elimino,
    CONCAT(u.nombres, ' ', u.apellidos) AS nombre_completo_usuario_elimino,
    encode(u.foto_perfil, 'base64') AS foto_perfil_usuario_elimino,
    a.motivo,
    a.fecha
FROM public.auditoria_eliminacion_solicitantes a
LEFT JOIN public.usuarios u ON a.eliminado_por = u.cedula
WHERE 
    ($1::DATE IS NULL OR a.fecha::DATE >= $1)
    AND ($2::DATE IS NULL OR a.fecha::DATE <= $2)
    AND ($3::VARCHAR IS NULL OR a.eliminado_por = $3)
    AND (
        $4::TEXT IS NULL 
        OR a.nombres_solicitante_eliminado ILIKE '%' || $4 || '%'
        OR a.apellidos_solicitante_eliminado ILIKE '%' || $4 || '%'
        OR a.solicitante_eliminado ILIKE '%' || $4 || '%'
    )
ORDER BY 
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') THEN a.fecha END DESC NULLS LAST,
    CASE WHEN $5::TEXT = 'asc' THEN a.fecha END ASC NULLS FIRST;
