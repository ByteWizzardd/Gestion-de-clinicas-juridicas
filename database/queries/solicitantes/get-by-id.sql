-- Obtener un solicitante completo por cédula con toda su información relacionada
-- Usa la vista view_solicitantes_completo para obtener edad derivada
-- Parámetros: $1 = cedula

SELECT 
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
    vs.direccion_habitacion,
    
    -- Información educativa
    ne.id_nivel_educativo,
    ne.descripcion AS nivel_educativo,
    
    -- Información laboral
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
    
    -- Información de vivienda
    v.cant_habitaciones,
    v.cant_banos,
    
    -- Ubicación
    p.id_estado,
    p.num_municipio,
    p.num_parroquia,
    p.nombre_parroquia,
    m.nombre_municipio,
    e.nombre_estado,
    
    -- Núcleo (obtenido del caso más reciente)
    (
        SELECT n.id_nucleo
        FROM casos ca
        INNER JOIN nucleos n ON ca.id_nucleo = n.id_nucleo
        WHERE ca.cedula = vs.cedula
        ORDER BY ca.fecha_solicitud DESC, ca.id_caso DESC
        LIMIT 1
    ) AS id_nucleo,
    (
        SELECT n.nombre_nucleo
        FROM casos ca
        INNER JOIN nucleos n ON ca.id_nucleo = n.id_nucleo
        WHERE ca.cedula = vs.cedula
        ORDER BY ca.fecha_solicitud DESC, ca.id_caso DESC
        LIMIT 1
    ) AS nombre_nucleo,
    
    -- Casos asociados
    (
        SELECT COUNT(*) 
        FROM casos ca 
        WHERE ca.cedula = vs.cedula
    ) AS total_casos

FROM view_solicitantes_completo vs
LEFT JOIN niveles_educativos ne ON vs.id_nivel_educativo = ne.id_nivel_educativo
LEFT JOIN condicion_trabajo ct ON vs.id_trabajo = ct.id_trabajo
LEFT JOIN condicion_actividad ca ON vs.id_actividad = ca.id_actividad
LEFT JOIN familias_y_hogares fh ON vs.cedula = fh.cedula_solicitante
LEFT JOIN viviendas v ON vs.cedula = v.cedula_solicitante
LEFT JOIN parroquias p ON vs.id_estado = p.id_estado 
    AND vs.num_municipio = p.num_municipio 
    AND vs.num_parroquia = p.num_parroquia
LEFT JOIN municipios m ON p.id_estado = m.id_estado AND p.num_municipio = m.num_municipio
LEFT JOIN estados e ON m.id_estado = e.id_estado
WHERE vs.cedula = $1;

