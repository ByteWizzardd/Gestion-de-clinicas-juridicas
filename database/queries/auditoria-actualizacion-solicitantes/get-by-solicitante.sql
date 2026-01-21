-- Obtener todas las actualizaciones de un solicitante específico
-- Parámetros: $1 = cedula_solicitante
SELECT 
    a.id,
    a.cedula_solicitante,
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
    a.id_trabajo_anterior, a.id_trabajo_nuevo,
    a.id_actividad_anterior, a.id_actividad_nuevo,
    a.id_estado_anterior, a.id_estado_nuevo,
    a.num_municipio_anterior, a.num_municipio_nuevo,
    a.num_parroquia_anterior, a.num_parroquia_nuevo,
    -- Familia/Hogar
    a.cant_personas_anterior, a.cant_personas_nuevo,
    a.cant_trabajadores_anterior, a.cant_trabajadores_nuevo,
    a.cant_no_trabajadores_anterior, a.cant_no_trabajadores_nuevo,
    a.cant_ninos_anterior, a.cant_ninos_nuevo,
    a.cant_ninos_estudiando_anterior, a.cant_ninos_estudiando_nuevo,
    a.jefe_hogar_anterior, a.jefe_hogar_nuevo,
    a.ingresos_mensuales_anterior, a.ingresos_mensuales_nuevo,
    a.id_nivel_educativo_jefe_anterior, a.id_nivel_educativo_jefe_nuevo,
    a.tipo_tiempo_estudio_jefe_anterior, a.tipo_tiempo_estudio_jefe_nuevo,
    a.tiempo_estudio_jefe_anterior, a.tiempo_estudio_jefe_nuevo,
    -- Vivienda
    a.cant_habitaciones_anterior, a.cant_habitaciones_nuevo,
    a.cant_banos_anterior, a.cant_banos_nuevo,
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
    a.fecha_actualizacion,
    a.id_usuario_actualizo,
    u.nombres AS nombres_usuario_actualizo,
    u.apellidos AS apellidos_usuario_actualizo,
    CONCAT(u.nombres, ' ', u.apellidos) AS nombre_completo_usuario_actualizo
FROM public.auditoria_actualizacion_solicitantes a
LEFT JOIN public.usuarios u ON a.id_usuario_actualizo = u.cedula
WHERE a.cedula_solicitante = $1
ORDER BY a.fecha_actualizacion DESC;
