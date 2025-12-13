-- Obtener un solicitante completo por cédula con toda su información relacionada
-- Parámetros: $1 = cedula

SELECT 
    c.cedula,
    c.nombres,
    c.apellidos,
    c.fecha_nacimiento,
    c.telefono_local,
    c.telefono_celular,
    c.correo_electronico,
    c.sexo,
    c.nacionalidad,
    c.estado_civil,
    c.concubinato,
    
    -- Información del hogar
    fh.id_hogar,
    fh.cant_personas,
    fh.cant_trabajadores,
    fh.cant_ninos,
    fh.cant_ninos_estudiando,
    fh.jefe_hogar,
    
    -- Información educativa
    ne.id_nivel_educativo,
    ne.nivel AS nivel_educativo,
    ne.anos_cursados,
    ne.semestres_cursados,
    ne.trimestres_cursados,
    
    -- Información laboral
    t.id_trabajo,
    t.condicion_actividad,
    t.buscando_trabajo,
    t.condicion_trabajo,
    
    -- Información de vivienda
    v.id_vivienda,
    v.tipo_vivienda,
    v.cant_habitaciones,
    v.cant_banos,
    v.material_piso,
    v.material_paredes,
    v.material_techo,
    v.agua_potable,
    v.eliminacion_aguas_n,
    v.aseo,
    
    -- Ubicación
    p.id_parroquia,
    p.nombre_parroquia,
    m.id_municipio,
    m.nombre_municipio,
    e.id_estado,
    e.nombre_estado,
    
    -- Núcleo
    n.id_nucleo,
    n.nombre_nucleo,
    
    -- Casos asociados (agregado)
    (
        SELECT COUNT(*) 
        FROM casos ca 
        WHERE ca.cedula_cliente = c.cedula
    ) AS total_casos

FROM clientes c
LEFT JOIN familias_hogares fh ON c.id_hogar = fh.id_hogar
LEFT JOIN niveles_educativos ne ON c.id_nivel_educativo = ne.id_nivel_educativo
LEFT JOIN trabajos t ON c.id_trabajo = t.id_trabajo
LEFT JOIN viviendas v ON c.id_vivienda = v.id_vivienda
LEFT JOIN parroquias p ON c.id_parroquia = p.id_parroquia
LEFT JOIN municipios m ON p.id_municipio = m.id_municipio
LEFT JOIN estados e ON m.id_estado = e.id_estado
LEFT JOIN nucleos n ON c.id_nucleo = n.id_nucleo
WHERE c.cedula = $1;

