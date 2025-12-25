-- ============================================================
-- CONSULTAS PARA LISTAR MUNICIPIOS DE UN ESTADO
-- ============================================================

-- Opción 1: Listar municipios por ID del estado
-- Reemplaza 24 con el ID del estado que necesites
SELECT 
    id_estado,
    num_municipio,
    nombre_municipio
FROM municipios
WHERE id_estado = 24  -- Cambia este número por el ID del estado
ORDER BY num_municipio, nombre_municipio;

-- Opción 2: Listar municipios por nombre del estado
-- Reemplaza 'Distrito Capital' con el nombre del estado que necesites
SELECT 
    m.id_estado,
    m.num_municipio,
    m.nombre_municipio,
    e.nombre_estado
FROM municipios m
JOIN estados e ON m.id_estado = e.id_estado
WHERE e.nombre_estado = 'Distrito Capital'  -- Cambia este nombre por el estado que necesites
ORDER BY m.num_municipio, m.nombre_municipio;

-- Opción 3: Listar todos los estados disponibles (para saber qué IDs usar)
SELECT 
    id_estado,
    nombre_estado
FROM estados
ORDER BY id_estado;

-- Opción 4: Listar municipios de todos los estados con conteo
SELECT 
    e.id_estado,
    e.nombre_estado,
    COUNT(m.num_municipio) as total_municipios
FROM estados e
LEFT JOIN municipios m ON e.id_estado = m.id_estado
GROUP BY e.id_estado, e.nombre_estado
ORDER BY e.id_estado;

