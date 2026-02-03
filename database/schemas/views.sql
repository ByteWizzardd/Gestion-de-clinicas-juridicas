-- Vista para casos con estatus derivado y cantidad de beneficiarios
CREATE VIEW view_casos_completo AS
SELECT 
    c.*,
    -- Estatus derivado: el último cambio de estatus registrado
    COALESCE(
        (SELECT nuevo_estatus 
         FROM cambio_estatus ce 
         WHERE ce.id_caso = c.id_caso 
         ORDER BY ce.fecha DESC, ce.num_cambio DESC 
         LIMIT 1),
        'En proceso' -- Estatus por defecto si no hay cambios registrados
    ) AS estatus,
    -- Cantidad de beneficiarios derivada: conteo de beneficiarios
    COALESCE(
        (SELECT COUNT(*) 
         FROM beneficiarios b 
         WHERE b.id_caso = c.id_caso),
        0
    ) AS cant_beneficiarios
FROM casos c;

-- Vista para solicitantes con edad derivada
CREATE VIEW view_solicitantes_completo AS
SELECT 
    s.*,
    -- Edad derivada: calculada desde fecha_nacimiento
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, s.fecha_nacimiento))::INTEGER AS edad
FROM solicitantes s;

-- Vista para beneficiarios con edad derivada
CREATE VIEW view_beneficiarios_completo AS
SELECT 
    b.*,
    -- Edad derivada: calculada desde fecha_nac
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, b.fecha_nac))::INTEGER AS edad
FROM beneficiarios b;

-- Vista combinada: casos con toda la información derivada y relacionada
CREATE VIEW view_casos_detalle AS
SELECT 
    c.*,
    -- Estatus derivado
    COALESCE(
        (SELECT nuevo_estatus 
         FROM cambio_estatus ce 
         WHERE ce.id_caso = c.id_caso 
         ORDER BY ce.fecha DESC, ce.num_cambio DESC 
         LIMIT 1),
        'En proceso'
    ) AS estatus,
    -- Cantidad de beneficiarios derivada
    COALESCE(
        (SELECT COUNT(*) 
         FROM beneficiarios b 
         WHERE b.id_caso = c.id_caso),
        0
    ) AS cant_beneficiarios,
    -- Información del solicitante
    s.nombres AS nombres_solicitante,
    s.apellidos AS apellidos_solicitante,
    s.nombres || ' ' || s.apellidos AS nombre_completo_solicitante,
    -- Información del núcleo
    n.nombre_nucleo,
    -- Información del ámbito legal
    m.nombre_materia,
    cat.nombre_categoria,
    sub.nombre_subcategoria,
    al.nombre_ambito_legal AS nombre_ambito_legal
FROM casos c
INNER JOIN solicitantes s ON c.cedula = s.cedula
INNER JOIN nucleos n ON c.id_nucleo = n.id_nucleo
INNER JOIN ambitos_legales al ON c.id_materia = al.id_materia 
    AND c.num_categoria = al.num_categoria 
    AND c.num_subcategoria = al.num_subcategoria 
    AND c.num_ambito_legal = al.num_ambito_legal
INNER JOIN materias m ON al.id_materia = m.id_materia
INNER JOIN categorias cat ON al.id_materia = cat.id_materia AND al.num_categoria = cat.num_categoria
INNER JOIN subcategorias sub ON al.id_materia = sub.id_materia 
    AND al.num_categoria = sub.num_categoria 
    AND al.num_subcategoria = sub.num_subcategoria;

