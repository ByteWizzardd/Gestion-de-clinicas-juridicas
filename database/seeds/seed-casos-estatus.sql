-- ==========================================================
-- SEED DE CASOS CON DIFERENTES ESTATUS
-- ==========================================================
-- Este script inserta casos con diferentes estatus para pruebas
-- de reportes y visualización de gráficos

BEGIN;

-- ==========================================================
-- 1. CASOS CON ESTATUS "En proceso"
-- ==========================================================

-- Caso 1: En proceso - Divorcio contencioso
WITH nuevo_caso AS (
    INSERT INTO casos (
        fecha_solicitud, fecha_inicio_caso, fecha_fin_caso, tramite, observaciones,
        id_nucleo, cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal
    )
    SELECT 
        '2024-11-15'::DATE, '2024-11-15'::DATE, NULL, 'Asesoría', 
        'Caso de divorcio contencioso en proceso. Cliente requiere asesoría legal.',
        (SELECT id_nucleo FROM nucleos WHERE nombre_nucleo = 'UCAB Caracas' LIMIT 1),
        (SELECT cedula FROM solicitantes LIMIT 1),
        al.id_materia, al.num_categoria, al.num_subcategoria, al.num_ambito_legal
    FROM ambitos_legales al
    WHERE al.nombre_ambito_legal LIKE '%Divorcio%' OR al.nombre_ambito_legal LIKE '%divorcio%'
    LIMIT 1
    ON CONFLICT DO NOTHING
    RETURNING id_caso
)
INSERT INTO cambio_estatus (num_cambio, id_caso, nuevo_estatus, id_usuario_cambia, motivo, fecha)
SELECT 
    1, 
    nc.id_caso,
    'En proceso',
    (SELECT cedula FROM usuarios WHERE tipo_usuario = 'Coordinador' LIMIT 1),
    'Caso iniciado y en proceso de atención',
    '2024-11-15'::DATE
FROM nuevo_caso nc;

-- Caso 2: En proceso - Obligación de Manutención
WITH nuevo_caso AS (
    INSERT INTO casos (
        fecha_solicitud, fecha_inicio_caso, fecha_fin_caso, tramite, observaciones,
        id_nucleo, cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal
    )
    SELECT 
        '2024-12-01'::DATE, '2024-12-01'::DATE, NULL, 'Conciliación y Mediación', 
        'Proceso de mediación para pensión alimentaria en curso.',
        (SELECT id_nucleo FROM nucleos WHERE nombre_nucleo = 'UCAB Guayana' LIMIT 1),
        (SELECT cedula FROM solicitantes LIMIT 1 OFFSET 1),
        al.id_materia, al.num_categoria, al.num_subcategoria, al.num_ambito_legal
    FROM ambitos_legales al
    WHERE al.nombre_ambito_legal LIKE '%Manutención%' OR al.nombre_ambito_legal LIKE '%manutención%'
    LIMIT 1
    ON CONFLICT DO NOTHING
    RETURNING id_caso
)
INSERT INTO cambio_estatus (num_cambio, id_caso, nuevo_estatus, id_usuario_cambia, motivo, fecha)
SELECT 
    1, 
    nc.id_caso,
    'En proceso',
    (SELECT cedula FROM usuarios WHERE tipo_usuario = 'Coordinador' LIMIT 1),
    'Caso iniciado',
    '2024-12-01'::DATE
FROM nuevo_caso nc;

-- ==========================================================
-- 2. CASOS CON ESTATUS "Archivado"
-- ==========================================================

-- Caso 3: Archivado - Rectificación de Actas
WITH nuevo_caso AS (
    INSERT INTO casos (
        fecha_solicitud, fecha_inicio_caso, fecha_fin_caso, tramite, observaciones,
        id_nucleo, cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal
    )
    SELECT 
        '2024-10-01'::DATE, '2024-10-01'::DATE, '2024-11-30'::DATE, 'Asesoría', 
        'Caso resuelto y archivado. Cliente satisfecho con la asesoría.',
        (SELECT id_nucleo FROM nucleos WHERE nombre_nucleo = 'UCAB Caracas' LIMIT 1),
        (SELECT cedula FROM solicitantes LIMIT 1 OFFSET 2),
        al.id_materia, al.num_categoria, al.num_subcategoria, al.num_ambito_legal
    FROM ambitos_legales al
    WHERE al.nombre_ambito_legal LIKE '%Rectificación%' OR al.nombre_ambito_legal LIKE '%rectificación%'
    LIMIT 1
    ON CONFLICT DO NOTHING
    RETURNING id_caso
)
INSERT INTO cambio_estatus (num_cambio, id_caso, nuevo_estatus, id_usuario_cambia, motivo, fecha)
SELECT 
    num_cambio,
    nc.id_caso,
    nuevo_estatus,
    (SELECT cedula FROM usuarios WHERE tipo_usuario = 'Coordinador' LIMIT 1),
    motivo,
    fecha
FROM nuevo_caso nc
CROSS JOIN (VALUES 
    (1, 'En proceso', 'Caso iniciado', '2024-10-01'::DATE),
    (2, 'Archivado', 'Caso resuelto y cerrado', '2024-11-30'::DATE)
) AS cambios(num_cambio, nuevo_estatus, motivo, fecha);

-- Caso 4: Archivado - Compra-venta de bienes
WITH nuevo_caso AS (
    INSERT INTO casos (
        fecha_solicitud, fecha_inicio_caso, fecha_fin_caso, tramite, observaciones,
        id_nucleo, cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal
    )
    SELECT 
        '2024-09-15'::DATE, '2024-09-15'::DATE, '2024-11-15'::DATE, 'Redacción documentos y/o convenio', 
        'Documento redactado y entregado. Caso archivado.',
        (SELECT id_nucleo FROM nucleos WHERE nombre_nucleo = 'UCAB Guayana' LIMIT 1),
        (SELECT cedula FROM solicitantes LIMIT 1 OFFSET 3),
        al.id_materia, al.num_categoria, al.num_subcategoria, al.num_ambito_legal
    FROM ambitos_legales al
    WHERE al.nombre_ambito_legal LIKE '%Compra-venta%' OR al.nombre_ambito_legal LIKE '%compra%'
    LIMIT 1
    ON CONFLICT DO NOTHING
    RETURNING id_caso
)
INSERT INTO cambio_estatus (num_cambio, id_caso, nuevo_estatus, id_usuario_cambia, motivo, fecha)
SELECT 
    num_cambio,
    nc.id_caso,
    nuevo_estatus,
    (SELECT cedula FROM usuarios WHERE tipo_usuario = 'Coordinador' LIMIT 1),
    motivo,
    fecha
FROM nuevo_caso nc
CROSS JOIN (VALUES 
    (1, 'En proceso', 'Caso iniciado', '2024-09-15'::DATE),
    (2, 'Archivado', 'Documento entregado y caso cerrado', '2024-11-15'::DATE)
) AS cambios(num_cambio, nuevo_estatus, motivo, fecha);

-- ==========================================================
-- 3. CASOS CON ESTATUS "Entregado"
-- ==========================================================

-- Caso 5: Entregado - Mediación exitosa
WITH nuevo_caso AS (
    INSERT INTO casos (
        fecha_solicitud, fecha_inicio_caso, fecha_fin_caso, tramite, observaciones,
        id_nucleo, cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal
    )
    SELECT 
        '2024-11-01'::DATE, '2024-11-01'::DATE, NULL, 'Conciliación y Mediación', 
        'Mediación exitosa. Acuerdo firmado por ambas partes.',
        (SELECT id_nucleo FROM nucleos WHERE nombre_nucleo = 'UCAB Caracas' LIMIT 1),
        (SELECT cedula FROM solicitantes LIMIT 1 OFFSET 4),
        al.id_materia, al.num_categoria, al.num_subcategoria, al.num_ambito_legal
    FROM ambitos_legales al
    WHERE al.nombre_ambito_legal LIKE '%Manutención%' OR al.nombre_ambito_legal LIKE '%manutención%'
    LIMIT 1
    ON CONFLICT DO NOTHING
    RETURNING id_caso
)
INSERT INTO cambio_estatus (num_cambio, id_caso, nuevo_estatus, id_usuario_cambia, motivo, fecha)
SELECT 
    num_cambio,
    nc.id_caso,
    nuevo_estatus,
    (SELECT cedula FROM usuarios WHERE tipo_usuario = 'Coordinador' LIMIT 1),
    motivo,
    fecha
FROM nuevo_caso nc
CROSS JOIN (VALUES 
    (1, 'En proceso', 'Caso iniciado', '2024-11-01'::DATE),
    (2, 'Entregado', 'Mediación exitosa, acuerdo entregado', '2024-12-15'::DATE)
) AS cambios(num_cambio, nuevo_estatus, motivo, fecha);

-- Caso 6: Entregado - Documento redactado
WITH nuevo_caso AS (
    INSERT INTO casos (
        fecha_solicitud, fecha_inicio_caso, fecha_fin_caso, tramite, observaciones,
        id_nucleo, cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal
    )
    SELECT 
        '2024-11-20'::DATE, '2024-11-20'::DATE, NULL, 'Redacción documentos y/o convenio', 
        'Documento redactado y entregado al cliente.',
        (SELECT id_nucleo FROM nucleos WHERE nombre_nucleo = 'UCAB Guayana' LIMIT 1),
        (SELECT cedula FROM solicitantes LIMIT 1 OFFSET 5),
        al.id_materia, al.num_categoria, al.num_subcategoria, al.num_ambito_legal
    FROM ambitos_legales al
    WHERE al.nombre_ambito_legal LIKE '%Compra-venta%' OR al.nombre_ambito_legal LIKE '%compra%'
    LIMIT 1
    ON CONFLICT DO NOTHING
    RETURNING id_caso
)
INSERT INTO cambio_estatus (num_cambio, id_caso, nuevo_estatus, id_usuario_cambia, motivo, fecha)
SELECT 
    num_cambio,
    nc.id_caso,
    nuevo_estatus,
    (SELECT cedula FROM usuarios WHERE tipo_usuario = 'Coordinador' LIMIT 1),
    motivo,
    fecha
FROM nuevo_caso nc
CROSS JOIN (VALUES 
    (1, 'En proceso', 'Caso iniciado', '2024-11-20'::DATE),
    (2, 'Entregado', 'Documento entregado al cliente', '2024-12-20'::DATE)
) AS cambios(num_cambio, nuevo_estatus, motivo, fecha);

-- ==========================================================
-- 4. CASOS CON ESTATUS "Asesoría"
-- ==========================================================

-- Caso 7: Asesoría - Consulta inicial
WITH nuevo_caso AS (
    INSERT INTO casos (
        fecha_solicitud, fecha_inicio_caso, fecha_fin_caso, tramite, observaciones,
        id_nucleo, cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal
    )
    SELECT 
        '2024-12-10'::DATE, '2024-12-10'::DATE, NULL, 'Asesoría', 
        'Consulta inicial sobre derechos laborales. Pendiente documentación.',
        (SELECT id_nucleo FROM nucleos WHERE nombre_nucleo = 'UCAB Caracas' LIMIT 1),
        (SELECT cedula FROM solicitantes LIMIT 1 OFFSET 6),
        al.id_materia, al.num_categoria, al.num_subcategoria, al.num_ambito_legal
    FROM ambitos_legales al
    WHERE al.id_materia = 3 -- Laboral
    LIMIT 1
    ON CONFLICT DO NOTHING
    RETURNING id_caso
)
INSERT INTO cambio_estatus (num_cambio, id_caso, nuevo_estatus, id_usuario_cambia, motivo, fecha)
SELECT 
    1, 
    nc.id_caso,
    'Asesoría',
    (SELECT cedula FROM usuarios WHERE tipo_usuario = 'Coordinador' LIMIT 1),
    'Consulta inicial de asesoría',
    '2024-12-10'::DATE
FROM nuevo_caso nc;

-- Caso 8: Asesoría - Consulta sobre divorcio
WITH nuevo_caso AS (
    INSERT INTO casos (
        fecha_solicitud, fecha_inicio_caso, fecha_fin_caso, tramite, observaciones,
        id_nucleo, cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal
    )
    SELECT 
        '2024-12-15'::DATE, '2024-12-15'::DATE, NULL, 'Asesoría', 
        'Primera consulta sobre proceso de divorcio.',
        (SELECT id_nucleo FROM nucleos WHERE nombre_nucleo = 'UCAB Guayana' LIMIT 1),
        (SELECT cedula FROM solicitantes LIMIT 1 OFFSET 7),
        al.id_materia, al.num_categoria, al.num_subcategoria, al.num_ambito_legal
    FROM ambitos_legales al
    WHERE al.nombre_ambito_legal LIKE '%Divorcio%' OR al.nombre_ambito_legal LIKE '%divorcio%'
    LIMIT 1
    ON CONFLICT DO NOTHING
    RETURNING id_caso
)
INSERT INTO cambio_estatus (num_cambio, id_caso, nuevo_estatus, id_usuario_cambia, motivo, fecha)
SELECT 
    1, 
    nc.id_caso,
    'Asesoría',
    (SELECT cedula FROM usuarios WHERE tipo_usuario = 'Coordinador' LIMIT 1),
    'Consulta inicial',
    '2024-12-15'::DATE
FROM nuevo_caso nc;

-- ==========================================================
-- 5. CASOS ADICIONALES CON MÚLTIPLES CAMBIOS DE ESTATUS
-- ==========================================================

-- Caso 9: En proceso -> Entregado -> Archivado
WITH nuevo_caso AS (
    INSERT INTO casos (
        fecha_solicitud, fecha_inicio_caso, fecha_fin_caso, tramite, observaciones,
        id_nucleo, cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal
    )
    SELECT 
        '2024-10-15'::DATE, '2024-10-15'::DATE, '2024-12-20'::DATE, 'Asistencia Judicial - Casos externos', 
        'Caso con múltiples cambios de estatus para pruebas.',
        (SELECT id_nucleo FROM nucleos WHERE nombre_nucleo = 'UCAB Caracas' LIMIT 1),
        (SELECT cedula FROM solicitantes LIMIT 1 OFFSET 8),
        al.id_materia, al.num_categoria, al.num_subcategoria, al.num_ambito_legal
    FROM ambitos_legales al
    WHERE al.id_materia = 3 -- Laboral
    LIMIT 1
    ON CONFLICT DO NOTHING
    RETURNING id_caso
)
INSERT INTO cambio_estatus (num_cambio, id_caso, nuevo_estatus, id_usuario_cambia, motivo, fecha)
SELECT 
    num_cambio,
    nc.id_caso,
    nuevo_estatus,
    (SELECT cedula FROM usuarios WHERE tipo_usuario = 'Coordinador' LIMIT 1),
    motivo,
    fecha
FROM nuevo_caso nc
CROSS JOIN (VALUES 
    (1, 'En proceso', 'Caso iniciado', '2024-10-15'::DATE),
    (2, 'Entregado', 'Documento entregado', '2024-11-30'::DATE),
    (3, 'Archivado', 'Caso cerrado', '2024-12-20'::DATE)
) AS cambios(num_cambio, nuevo_estatus, motivo, fecha);

-- Caso 10: Asesoría -> En proceso
WITH nuevo_caso AS (
    INSERT INTO casos (
        fecha_solicitud, fecha_inicio_caso, fecha_fin_caso, tramite, observaciones,
        id_nucleo, cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal
    )
    SELECT 
        '2024-12-05'::DATE, '2024-12-05'::DATE, NULL, 'Asesoría', 
        'Caso que pasó de asesoría a en proceso.',
        (SELECT id_nucleo FROM nucleos WHERE nombre_nucleo = 'UCAB Guayana' LIMIT 1),
        (SELECT cedula FROM solicitantes LIMIT 1 OFFSET 9),
        al.id_materia, al.num_categoria, al.num_subcategoria, al.num_ambito_legal
    FROM ambitos_legales al
    WHERE al.nombre_ambito_legal LIKE '%Divorcio%' OR al.nombre_ambito_legal LIKE '%divorcio%'
    LIMIT 1
    ON CONFLICT DO NOTHING
    RETURNING id_caso
)
INSERT INTO cambio_estatus (num_cambio, id_caso, nuevo_estatus, id_usuario_cambia, motivo, fecha)
SELECT 
    num_cambio,
    nc.id_caso,
    nuevo_estatus,
    (SELECT cedula FROM usuarios WHERE tipo_usuario = 'Coordinador' LIMIT 1),
    motivo,
    fecha
FROM nuevo_caso nc
CROSS JOIN (VALUES 
    (1, 'Asesoría', 'Consulta inicial', '2024-12-05'::DATE),
    (2, 'En proceso', 'Caso promovido a proceso activo', '2024-12-18'::DATE)
) AS cambios(num_cambio, nuevo_estatus, motivo, fecha);

COMMIT;

-- ==========================================================
-- RESUMEN
-- ==========================================================
-- Casos insertados:
-- - 2 casos con estatus "En proceso"
-- - 2 casos con estatus "Archivado"
-- - 2 casos con estatus "Entregado"
-- - 2 casos con estatus "Asesoría"
-- - 1 caso con múltiples cambios: En proceso -> Entregado -> Archivado
-- - 1 caso con cambio: Asesoría -> En proceso
--
-- Total: 10 casos con diferentes estatus para pruebas de reportes
