-- Obtener información completa de un solicitante con todas sus relaciones
-- Usa la vista view_solicitantes_completo para obtener edad derivada
-- Parámetros: $1 = cedula
-- Nota: El núcleo se obtiene desde los casos, no desde el solicitante directamente
SELECT 
    -- Datos básicos del solicitante (desde vista con edad derivada)
    vs.cedula,
    vs.nombres,
    vs.apellidos,
    vs.fecha_nacimiento,
    vs.edad,
    vs.telefono_local,
    vs.telefono_celular,
    vs.correo_electronico,
    vs.sexo,
    vs.nacionalidad,
    vs.estado_civil,
    vs.concubinato,
    vs.tiempo_estudio,
    vs.tipo_tiempo_estudio,
    
    -- Información del núcleo (obtenido del caso más reciente)
    n.id_nucleo,
    n.nombre_nucleo,
    -- Dirección del núcleo (desde la tabla nucleos)
    n_parr.id_estado AS nucleo_id_estado,
    n_parr.num_municipio AS nucleo_num_municipio,
    n_parr.num_parroquia AS nucleo_num_parroquia,
    n_parr.nombre_parroquia AS nucleo_nombre_parroquia,
    n_mun.nombre_municipio AS nucleo_nombre_municipio,
    n_est.nombre_estado AS nucleo_nombre_estado,
    -- Dirección del solicitante
    p.id_estado,
    p.num_municipio,
    p.num_parroquia,
    p.nombre_parroquia,
    m.nombre_municipio,
    e.nombre_estado,
    
    -- Información del nivel educativo
    ne.id_nivel_educativo,
    ne.descripcion AS nivel_educativo,
    
    -- Información del trabajo
    ct.id_trabajo,
    ct.nombre_trabajo,
    ca.id_actividad,
    ca.nombre_actividad,
    
    -- Información del hogar
    fh.cant_personas,
    fh.cant_trabajadores,
    fh.cant_no_trabajadores,
    fh.cant_ninos,
    fh.cant_ninos_estudiando,
    fh.jefe_hogar,
    fh.ingresos_mensuales,
    fh.tiempo_estudio_jefe,
    fh.id_nivel_educativo_jefe,
    ne_jefe.descripcion AS nivel_educativo_jefe,
    
    -- Información de la vivienda
    v.cant_habitaciones,
    v.cant_banos,
    
    -- Características de vivienda desde asignadas_a
    (SELECT c.descripcion 
     FROM asignadas_a aa 
     INNER JOIN caracteristicas c ON aa.id_tipo_caracteristica = c.id_tipo_caracteristica 
         AND aa.num_caracteristica = c.num_caracteristica 
     WHERE aa.cedula_solicitante = vs.cedula 
       AND aa.id_tipo_caracteristica = 1 
     LIMIT 1) AS tipo_vivienda,
    
    (SELECT c.descripcion 
     FROM asignadas_a aa 
     INNER JOIN caracteristicas c ON aa.id_tipo_caracteristica = c.id_tipo_caracteristica 
         AND aa.num_caracteristica = c.num_caracteristica 
     WHERE aa.cedula_solicitante = vs.cedula 
       AND aa.id_tipo_caracteristica = 2 
     LIMIT 1) AS material_piso,
    
    (SELECT c.descripcion 
     FROM asignadas_a aa 
     INNER JOIN caracteristicas c ON aa.id_tipo_caracteristica = c.id_tipo_caracteristica 
         AND aa.num_caracteristica = c.num_caracteristica 
     WHERE aa.cedula_solicitante = vs.cedula 
       AND aa.id_tipo_caracteristica = 3 
     LIMIT 1) AS material_paredes,
    
    (SELECT c.descripcion 
     FROM asignadas_a aa 
     INNER JOIN caracteristicas c ON aa.id_tipo_caracteristica = c.id_tipo_caracteristica 
         AND aa.num_caracteristica = c.num_caracteristica 
     WHERE aa.cedula_solicitante = vs.cedula 
       AND aa.id_tipo_caracteristica = 4 
     LIMIT 1) AS material_techo,
    
    (SELECT c.descripcion 
     FROM asignadas_a aa 
     INNER JOIN caracteristicas c ON aa.id_tipo_caracteristica = c.id_tipo_caracteristica 
         AND aa.num_caracteristica = c.num_caracteristica 
     WHERE aa.cedula_solicitante = vs.cedula 
       AND aa.id_tipo_caracteristica = 5 
     LIMIT 1) AS agua_potable,
    
    (SELECT c.descripcion 
     FROM asignadas_a aa 
     INNER JOIN caracteristicas c ON aa.id_tipo_caracteristica = c.id_tipo_caracteristica 
         AND aa.num_caracteristica = c.num_caracteristica 
     WHERE aa.cedula_solicitante = vs.cedula 
       AND aa.id_tipo_caracteristica = 6 
     LIMIT 1) AS aseo,
    
    (SELECT c.descripcion 
     FROM asignadas_a aa 
     INNER JOIN caracteristicas c ON aa.id_tipo_caracteristica = c.id_tipo_caracteristica 
         AND aa.num_caracteristica = c.num_caracteristica 
     WHERE aa.cedula_solicitante = vs.cedula 
       AND aa.id_tipo_caracteristica = 7 
     LIMIT 1) AS eliminacion_aguas_n,
    
    -- Artefactos domésticos (puede tener múltiples, se agregan como array JSON)
    COALESCE(
        (SELECT json_agg(c.descripcion ORDER BY c.descripcion)
         FROM asignadas_a aa 
         INNER JOIN caracteristicas c ON aa.id_tipo_caracteristica = c.id_tipo_caracteristica 
             AND aa.num_caracteristica = c.num_caracteristica 
         WHERE aa.cedula_solicitante = vs.cedula 
           AND aa.id_tipo_caracteristica = 8),
        '[]'::json
    ) AS artefactos_domesticos
FROM view_solicitantes_completo vs
-- Obtener núcleo desde el caso más reciente del solicitante
LEFT JOIN LATERAL (
    SELECT ca.id_nucleo
    FROM casos ca
    WHERE ca.cedula = vs.cedula
    ORDER BY ca.fecha_solicitud DESC, ca.id_caso DESC
    LIMIT 1
) caso_reciente ON true
LEFT JOIN nucleos n ON caso_reciente.id_nucleo = n.id_nucleo
-- Dirección del núcleo
LEFT JOIN parroquias n_parr ON n.id_estado = n_parr.id_estado 
    AND n.num_municipio = n_parr.num_municipio 
    AND n.num_parroquia = n_parr.num_parroquia
LEFT JOIN municipios n_mun ON n_parr.id_estado = n_mun.id_estado AND n_parr.num_municipio = n_mun.num_municipio
LEFT JOIN estados n_est ON n_mun.id_estado = n_est.id_estado
-- Dirección del solicitante
LEFT JOIN parroquias p ON vs.id_estado = p.id_estado 
    AND vs.num_municipio = p.num_municipio 
    AND vs.num_parroquia = p.num_parroquia
LEFT JOIN municipios m ON p.id_estado = m.id_estado AND p.num_municipio = m.num_municipio
LEFT JOIN estados e ON m.id_estado = e.id_estado
LEFT JOIN niveles_educativos ne ON vs.id_nivel_educativo = ne.id_nivel_educativo
LEFT JOIN condicion_trabajo ct ON vs.id_trabajo = ct.id_trabajo
LEFT JOIN condicion_actividad ca ON vs.id_actividad = ca.id_actividad
LEFT JOIN familias_y_hogares fh ON vs.cedula = fh.cedula_solicitante
LEFT JOIN niveles_educativos ne_jefe ON fh.id_nivel_educativo_jefe = ne_jefe.id_nivel_educativo
LEFT JOIN viviendas v ON vs.cedula = v.cedula_solicitante
WHERE vs.cedula = $1;

