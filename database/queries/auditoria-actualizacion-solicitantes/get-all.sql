-- Obtener todas las actualizaciones de solicitantes con filtros opcionales
-- Parámetros opcionales:
-- $1 = fecha_inicio (DATE, opcional)
-- $2 = fecha_fin (DATE, opcional)
-- $3 = cedula_solicitante (VARCHAR, opcional)
-- $4 = id_usuario_actualizo (VARCHAR, opcional)
-- $5 = orden (TEXT, opcional) - 'asc' o 'desc' (por defecto 'desc')
SELECT 
    a.id,
    a.cedula_solicitante,
    COALESCE(s.nombres, a.nombres_nuevo, a.nombres_anterior, 'Solicitante Desconocido') AS nombres_solicitante,
    COALESCE(s.apellidos, a.apellidos_nuevo, a.apellidos_anterior, '') AS apellidos_solicitante,
    COALESCE(
        CONCAT(s.nombres, ' ', s.apellidos), 
        CONCAT(a.nombres_nuevo, ' ', a.apellidos_nuevo),
        CONCAT(a.nombres_anterior, ' ', a.apellidos_anterior),
        'Solicitante Desconocido'
    ) AS nombre_completo_solicitante,
    a.nombres_anterior, a.nombres_nuevo,
    a.apellidos_anterior, a.apellidos_nuevo,
    a.fecha_nacimiento_anterior, a.fecha_nacimiento_nuevo,
    a.telefono_local_anterior, a.telefono_local_nuevo,
    a.telefono_celular_anterior, a.telefono_celular_nuevo,
    a.correo_electronico_anterior, a.correo_electronico_nuevo,
    a.sexo_anterior, a.sexo_nuevo,
    a.nacionalidad_anterior, a.nacionalidad_nuevo,
    a.estado_civil_anterior, a.estado_civil_nuevo,
    a.concubinato_anterior, a.concubinato_nuevo,
    a.tipo_tiempo_estudio_anterior, a.tipo_tiempo_estudio_nuevo,
    a.tiempo_estudio_anterior, a.tiempo_estudio_nuevo,
    a.id_nivel_educativo_anterior, a.id_nivel_educativo_nuevo,
    ne_ant.descripcion AS nivel_educativo_anterior,
    ne_nue.descripcion AS nivel_educativo_nuevo,
    a.id_trabajo_anterior, a.id_trabajo_nuevo,
    ct_ant.nombre_trabajo AS condicion_trabajo_anterior,
    ct_nue.nombre_trabajo AS condicion_trabajo_nuevo,
    a.id_actividad_anterior, a.id_actividad_nuevo,
    ca_ant.nombre_actividad AS condicion_actividad_anterior,
    ca_nue.nombre_actividad AS condicion_actividad_nuevo,
    a.id_estado_anterior, a.id_estado_nuevo,
    e_ant.nombre_estado AS estado_anterior,
    e_nue.nombre_estado AS estado_nuevo,
    a.num_municipio_anterior, a.num_municipio_nuevo,
    m_ant.nombre_municipio AS municipio_anterior,
    m_nue.nombre_municipio AS municipio_nuevo,
    a.num_parroquia_anterior, a.num_parroquia_nuevo,
    p_ant.nombre_parroquia AS parroquia_anterior,
    p_nue.nombre_parroquia AS parroquia_nuevo,
    a.jefe_hogar_anterior, a.jefe_hogar_nuevo,
    a.nivel_educativo_jefe_anterior, a.nivel_educativo_jefe_nuevo,
    a.ingresos_mensuales_anterior, a.ingresos_mensuales_nuevo,
    -- Datos de vivienda
    a.cant_habitaciones_anterior, a.cant_habitaciones_nuevo,
    a.cant_banos_anterior, a.cant_banos_nuevo,
    -- Datos de familia/hogar
    a.cant_personas_anterior, a.cant_personas_nuevo,
    a.cant_trabajadores_anterior, a.cant_trabajadores_nuevo,
    a.cant_no_trabajadores_anterior, a.cant_no_trabajadores_nuevo,
    a.cant_ninos_anterior, a.cant_ninos_nuevo,
    a.cant_ninos_estudiando_anterior, a.cant_ninos_estudiando_nuevo,
    -- Tiempo de estudio del jefe
    a.tipo_tiempo_estudio_jefe_anterior, a.tipo_tiempo_estudio_jefe_nuevo,
    a.tiempo_estudio_jefe_anterior, a.tiempo_estudio_jefe_nuevo,
    -- Dirección
    a.direccion_habitacion_anterior, a.direccion_habitacion_nuevo,
    -- Características de vivienda
    a.tipo_vivienda_anterior, a.tipo_vivienda_nuevo,
    a.material_piso_anterior, a.material_piso_nuevo,
    a.material_paredes_anterior, a.material_paredes_nuevo,
    a.material_techo_anterior, a.material_techo_nuevo,
    a.agua_potable_anterior, a.agua_potable_nuevo,
    a.eliminacion_aguas_negras_anterior, a.eliminacion_aguas_negras_nuevo,
    a.aseo_anterior, a.aseo_nuevo,
    -- Artefactos agregados por estado
    COALESCE(
        (SELECT json_agg(artefacto ORDER BY artefacto)
         FROM auditoria_artefactos_domesticos
         WHERE id_auditoria_solicitante = a.id AND estado = 'anterior'),
        '[]'::json
    ) AS artefactos_eliminados,
    COALESCE(
        (SELECT json_agg(artefacto ORDER BY artefacto)
         FROM auditoria_artefactos_domesticos
         WHERE id_auditoria_solicitante = a.id AND estado = 'nuevo'),
        '[]'::json
    ) AS artefactos_agregados,
    COALESCE(
        (SELECT json_agg(artefacto ORDER BY artefacto)
         FROM auditoria_artefactos_domesticos
         WHERE id_auditoria_solicitante = a.id AND estado = 'sin_cambio'),
        '[]'::json
    ) AS artefactos_sin_cambio,
    a.fecha_actualizacion,
    a.id_usuario_actualizo,
    u.nombres AS nombres_usuario_actualizo,
    u.apellidos AS apellidos_usuario_actualizo,
    CONCAT(u.nombres, ' ', u.apellidos) AS nombre_completo_usuario_actualizo,
    u.foto_perfil AS foto_perfil_usuario_actualizo
FROM public.auditoria_actualizacion_solicitantes a
LEFT JOIN public.solicitantes s ON a.cedula_solicitante = s.cedula
LEFT JOIN public.usuarios u ON a.id_usuario_actualizo = u.cedula
LEFT JOIN public.niveles_educativos ne_ant ON a.id_nivel_educativo_anterior = ne_ant.id_nivel_educativo
LEFT JOIN public.niveles_educativos ne_nue ON a.id_nivel_educativo_nuevo = ne_nue.id_nivel_educativo
LEFT JOIN public.condicion_trabajo ct_ant ON a.id_trabajo_anterior = ct_ant.id_trabajo
LEFT JOIN public.condicion_trabajo ct_nue ON a.id_trabajo_nuevo = ct_nue.id_trabajo
LEFT JOIN public.condicion_actividad ca_ant ON a.id_actividad_anterior = ca_ant.id_actividad
LEFT JOIN public.condicion_actividad ca_nue ON a.id_actividad_nuevo = ca_nue.id_actividad
LEFT JOIN public.estados e_ant ON a.id_estado_anterior = e_ant.id_estado
LEFT JOIN public.estados e_nue ON a.id_estado_nuevo = e_nue.id_estado
LEFT JOIN public.municipios m_ant ON a.id_estado_anterior = m_ant.id_estado AND a.num_municipio_anterior = m_ant.num_municipio
LEFT JOIN public.municipios m_nue ON a.id_estado_nuevo = m_nue.id_estado AND a.num_municipio_nuevo = m_nue.num_municipio
LEFT JOIN public.parroquias p_ant ON a.id_estado_anterior = p_ant.id_estado AND a.num_municipio_anterior = p_ant.num_municipio AND a.num_parroquia_anterior = p_ant.num_parroquia
LEFT JOIN public.parroquias p_nue ON a.id_estado_nuevo = p_nue.id_estado AND a.num_municipio_nuevo = p_nue.num_municipio AND a.num_parroquia_nuevo = p_nue.num_parroquia
WHERE 
    ($1::DATE IS NULL OR a.fecha_actualizacion::DATE >= $1)
    AND ($2::DATE IS NULL OR a.fecha_actualizacion::DATE <= $2)
    AND ($3::VARCHAR IS NULL OR a.cedula_solicitante = $3)
    AND ($4::VARCHAR IS NULL OR a.id_usuario_actualizo = $4)
ORDER BY 
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') THEN a.fecha_actualizacion END DESC NULLS LAST,
    CASE WHEN $5::TEXT = 'asc' THEN a.fecha_actualizacion END ASC NULLS FIRST;

