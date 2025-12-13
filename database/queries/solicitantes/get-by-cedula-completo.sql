-- Obtener información completa de un cliente/solicitante con todas sus relaciones
-- Parámetros: $1 = cedula
SELECT 
    -- Datos básicos del cliente
    c.cedula,
    c.nombres,
    c.apellidos,
    c.fecha_nacimiento,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, c.fecha_nacimiento))::INTEGER AS edad,
    c.telefono_local,
    c.telefono_celular,
    c.correo_electronico,
    c.sexo,
    c.nacionalidad,
    c.estado_civil,
    c.concubinato,
    
    -- Información del núcleo
    n.id_nucleo,
    n.nombre_nucleo,
    p.id_parroquia,
    p.nombre_parroquia,
    m.id_municipio,
    m.nombre_municipio,
    e.id_estado,
    e.nombre_estado,
    
    -- Información del nivel educativo
    ne.id_nivel_educativo,
    ne.nivel,
    ne.anos_cursados,
    ne.semestres_cursados,
    ne.trimestres_cursados,
    
    -- Información del trabajo
    t.id_trabajo,
    t.condicion_actividad,
    t.buscando_trabajo,
    t.condicion_trabajo,
    
    -- Información del hogar
    h.id_hogar,
    h.cant_personas,
    h.cant_trabajadores,
    h.cant_ninos,
    h.cant_ninos_estudiando,
    h.jefe_hogar,
    
    -- Información de la vivienda
    v.id_vivienda,
    v.tipo_vivienda,
    v.cant_habitaciones,
    v.cant_banos,
    v.material_piso,
    v.material_paredes,
    v.material_techo,
    v.agua_potable,
    v.eliminacion_aguas_n,
    v.aseo
FROM clientes c
LEFT JOIN nucleos n ON c.id_nucleo = n.id_nucleo
LEFT JOIN parroquias p ON c.id_parroquia = p.id_parroquia
LEFT JOIN municipios m ON p.id_municipio = m.id_municipio
LEFT JOIN estados e ON m.id_estado = e.id_estado
LEFT JOIN niveles_educativos ne ON c.id_nivel_educativo = ne.id_nivel_educativo
LEFT JOIN trabajos t ON c.id_trabajo = t.id_trabajo
LEFT JOIN familias_hogares h ON c.id_hogar = h.id_hogar
LEFT JOIN viviendas v ON c.id_vivienda = v.id_vivienda
WHERE c.cedula = $1;

