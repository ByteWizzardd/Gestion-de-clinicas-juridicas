-- ==========================================================
-- SCRIPT DE CARGA DE DATOS PARA MÓDULO DE PROGRAMACIÓN Y CONSULTAS
-- ==========================================================
-- Este script inserta los datos necesarios para que el módulo
-- de Programación y Consultas sea funcional.
-- 
-- IMPORTANTE: Las tablas con PRIMARY KEY SERIAL se autoincrementan,
-- por lo que NO debemos especificar el ID en el INSERT.
-- ==========================================================

-- ==========================================================
-- 1. ESTADOS (Tabla maestra, sin dependencias)
-- ==========================================================
INSERT INTO estados (nombre_estado) VALUES
('Distrito Capital'),
('Miranda'),
('Carabobo'),
('Zulia'),
('Lara');

-- ==========================================================
-- 2. MUNICIPIOS (Depende de estados)
-- ==========================================================
-- Nota: id_municipio es SERIAL, pero tiene PRIMARY KEY compuesta (id_municipio, id_estado)
-- Usamos subconsultas para obtener el id_estado por nombre
INSERT INTO municipios (id_estado, nombre_municipio) VALUES
((SELECT id_estado FROM estados WHERE nombre_estado = 'Distrito Capital'), 'Libertador'),
((SELECT id_estado FROM estados WHERE nombre_estado = 'Miranda'), 'Chacao'),
((SELECT id_estado FROM estados WHERE nombre_estado = 'Miranda'), 'Baruta'),
((SELECT id_estado FROM estados WHERE nombre_estado = 'Carabobo'), 'Valencia'),
((SELECT id_estado FROM estados WHERE nombre_estado = 'Zulia'), 'Maracaibo'),
((SELECT id_estado FROM estados WHERE nombre_estado = 'Lara'), 'Iribarren');

-- ==========================================================
-- 3. PARROQUIAS (Depende de municipios)
-- ==========================================================
-- Nota: id_parroquia es SERIAL, pero tiene PRIMARY KEY compuesta (id_parroquia, id_municipio)
-- Usamos subconsultas para obtener el id_municipio por nombre
INSERT INTO parroquias (id_municipio, nombre_parroquia) VALUES
((SELECT id_municipio FROM municipios WHERE nombre_municipio = 'Libertador' LIMIT 1), 'Catedral'),
((SELECT id_municipio FROM municipios WHERE nombre_municipio = 'Libertador' LIMIT 1), 'Altagracia'),
((SELECT id_municipio FROM municipios WHERE nombre_municipio = 'Chacao' LIMIT 1), 'Chacao'),
((SELECT id_municipio FROM municipios WHERE nombre_municipio = 'Baruta' LIMIT 1), 'Baruta'),
((SELECT id_municipio FROM municipios WHERE nombre_municipio = 'Valencia' LIMIT 1), 'Valencia'),
((SELECT id_municipio FROM municipios WHERE nombre_municipio = 'Maracaibo' LIMIT 1), 'Maracaibo'),
((SELECT id_municipio FROM municipios WHERE nombre_municipio = 'Iribarren' LIMIT 1), 'Iribarren');

-- ==========================================================
-- 4. NÚCLEOS (Depende de parroquias)
-- ==========================================================
-- Nota: id_nucleo es SERIAL PRIMARY KEY
-- Usamos subconsultas para obtener el id_parroquia por nombre
INSERT INTO nucleos (nombre_nucleo, id_parroquia) VALUES
('UCAB Guayana', (SELECT id_parroquia FROM parroquias WHERE nombre_parroquia = 'Catedral' LIMIT 1)),
('UCAB Caracas', (SELECT id_parroquia FROM parroquias WHERE nombre_parroquia = 'Altagracia' LIMIT 1)),
('UCAB Barquisimeto', (SELECT id_parroquia FROM parroquias WHERE nombre_parroquia = 'Iribarren' LIMIT 1));

-- ==========================================================
-- 5. NIVELES EDUCATIVOS (Tabla maestra, sin dependencias)
-- ==========================================================
-- Nota: id_nivel_educativo es SERIAL PRIMARY KEY
-- nivel debe estar entre 0 y 14
INSERT INTO niveles_educativos (nivel, anos_cursados, semestres_cursados, trimestres_cursados) VALUES
(0, 0, 0, 0),    -- Sin educación
(1, 1, 2, 3),    -- Primaria 1er año
(6, 6, 12, 18),  -- Primaria completa
(7, 1, 2, 3),    -- Secundaria 1er año
(12, 5, 10, 15), -- Secundaria completa
(13, 1, 2, 3),   -- Universitaria 1er año
(14, 5, 10, 15); -- Universitaria completa

-- ==========================================================
-- 6. TRABAJOS (Tabla maestra, sin dependencias)
-- ==========================================================
-- Nota: id_trabajo es SERIAL PRIMARY KEY
-- condicion_actividad: 'Ama de Casa', 'Estudiante', 'Pensionado', 'Jubilado', 'Otra'
-- condicion_trabajo: 'Patrono', 'Empleado', 'Obrero', 'Cuenta propia' (NO permite 'Otra')
-- IMPORTANTE: condicion_trabajo es NOT NULL, así que para personas sin trabajo activo,
-- usamos un valor por defecto como 'Empleado' o 'Cuenta propia'
INSERT INTO trabajos (condicion_actividad, buscando_trabajo, condicion_trabajo) VALUES
('Otra', false, 'Empleado'),        -- Persona empleada
('Ama de Casa', false, 'Cuenta propia'),     -- Ama de casa (sin trabajo activo, pero debe tener un valor)
('Estudiante', false, 'Empleado'),     -- Estudiante (puede tener trabajo part-time)
('Pensionado', false, 'Empleado'),     -- Pensionado (puede tener trabajo ocasional)
('Jubilado', false, 'Empleado'),        -- Jubilado (puede tener trabajo ocasional)
('Otra', true, 'Cuenta propia'),    -- Buscando trabajo, cuenta propia
('Otra', true, 'Obrero'),           -- Buscando trabajo, obrero
('Otra', false, 'Patrono');         -- Patrono/empresario

-- ==========================================================
-- 7. VIVIENDAS (Tabla maestra, sin dependencias)
-- ==========================================================
-- Nota: id_vivienda es SERIAL PRIMARY KEY
-- IMPORTANTE: Ya NO tiene el campo artefactos_domesticos (se normalizó)
INSERT INTO viviendas (
    tipo_vivienda,
    cant_habitaciones,
    cant_banos,
    material_piso,
    material_paredes,
    material_techo,
    agua_potable,
    eliminacion_aguas_n,
    aseo
) VALUES
('Apartamento', 3, 2, 'Cerámica', 'Bloque frizado', 'Platabanda', 'Dentro de la vivienda', 'Poceta a cloaca', 'Llega a la vivienda'),
('Casa Urb', 4, 2, 'Cemento', 'Bloque sin frizar', 'Tejas', 'Dentro de la vivienda', 'Pozo séptico', 'Llega a la vivienda'),
('Casa de Barrio', 2, 1, 'Cemento', 'Bloque sin frizar', 'Palma/Zinc', 'Fuera de la vivienda', 'Poceta sin conexión', 'No llega a la vivienda'),
('Rancho', 1, 0, 'Tierra', 'Bahareque', 'Palma/Zinc', 'No tiene servicio', 'Excusado a hoyo o letrina', 'No tiene'),
('Quinta', 5, 3, 'Granito', 'Bloque frizado', 'Tejas', 'Dentro de la vivienda', 'Poceta a cloaca', 'Llega a la vivienda');

-- ==========================================================
-- 8. FAMILIAS HOGARES (Depende de niveles_educativos)
-- ==========================================================
-- Nota: id_hogar es SERIAL PRIMARY KEY
-- id_nivel_educativo es OPCIONAL (puede ser NULL)
-- Usamos subconsultas para obtener el id_nivel_educativo por nivel
INSERT INTO familias_hogares (cant_personas, cant_trabajadores, cant_ninos, cant_ninos_estudiando, jefe_hogar, id_nivel_educativo) VALUES
(4, 2, 2, 2, true, (SELECT id_nivel_educativo FROM niveles_educativos WHERE nivel = 12 LIMIT 1)),   -- Familia con secundaria completa
(3, 1, 1, 1, true, (SELECT id_nivel_educativo FROM niveles_educativos WHERE nivel = 6 LIMIT 1)),    -- Familia con primaria completa
(5, 2, 3, 2, true, (SELECT id_nivel_educativo FROM niveles_educativos WHERE nivel = 14 LIMIT 1)),   -- Familia con universidad completa
(2, 1, 0, 0, true, (SELECT id_nivel_educativo FROM niveles_educativos WHERE nivel = 7 LIMIT 1)),    -- Pareja sin hijos
(6, 3, 3, 3, true, (SELECT id_nivel_educativo FROM niveles_educativos WHERE nivel = 12 LIMIT 1)),  -- Familia numerosa
(1, 0, 0, 0, true, NULL); -- Persona sola

-- ==========================================================
-- 9. ARTEFACTOS DOMÉSTICOS (Depende de familias_hogares)
-- ==========================================================
-- Nota: PRIMARY KEY compuesta (id_hogar, artefacto)
-- Cada hogar puede tener múltiples artefactos
-- Usamos subconsultas para obtener el id_hogar por características
INSERT INTO artefactos_domesticos (id_hogar, artefacto) VALUES
((SELECT id_hogar FROM familias_hogares WHERE cant_personas = 4 AND cant_trabajadores = 2 LIMIT 1), 'Nevera'),
((SELECT id_hogar FROM familias_hogares WHERE cant_personas = 4 AND cant_trabajadores = 2 LIMIT 1), 'Lavadora'),
((SELECT id_hogar FROM familias_hogares WHERE cant_personas = 4 AND cant_trabajadores = 2 LIMIT 1), 'Computadora'),
((SELECT id_hogar FROM familias_hogares WHERE cant_personas = 4 AND cant_trabajadores = 2 LIMIT 1), 'Internet'),
((SELECT id_hogar FROM familias_hogares WHERE cant_personas = 3 AND cant_trabajadores = 1 LIMIT 1), 'Nevera'),
((SELECT id_hogar FROM familias_hogares WHERE cant_personas = 3 AND cant_trabajadores = 1 LIMIT 1), 'Lavadora'),
((SELECT id_hogar FROM familias_hogares WHERE cant_personas = 5 AND cant_trabajadores = 2 LIMIT 1), 'Nevera'),
((SELECT id_hogar FROM familias_hogares WHERE cant_personas = 5 AND cant_trabajadores = 2 LIMIT 1), 'Lavadora'),
((SELECT id_hogar FROM familias_hogares WHERE cant_personas = 5 AND cant_trabajadores = 2 LIMIT 1), 'Computadora'),
((SELECT id_hogar FROM familias_hogares WHERE cant_personas = 5 AND cant_trabajadores = 2 LIMIT 1), 'Internet'),
((SELECT id_hogar FROM familias_hogares WHERE cant_personas = 5 AND cant_trabajadores = 2 LIMIT 1), 'Carro'),
((SELECT id_hogar FROM familias_hogares WHERE cant_personas = 2 AND cant_trabajadores = 1 LIMIT 1), 'Nevera'),
((SELECT id_hogar FROM familias_hogares WHERE cant_personas = 6 AND cant_trabajadores = 3 LIMIT 1), 'Nevera'),
((SELECT id_hogar FROM familias_hogares WHERE cant_personas = 6 AND cant_trabajadores = 3 LIMIT 1), 'Lavadora'),
((SELECT id_hogar FROM familias_hogares WHERE cant_personas = 6 AND cant_trabajadores = 3 LIMIT 1), 'Computadora'),
((SELECT id_hogar FROM familias_hogares WHERE cant_personas = 6 AND cant_trabajadores = 3 LIMIT 1), 'Internet'),
((SELECT id_hogar FROM familias_hogares WHERE cant_personas = 6 AND cant_trabajadores = 3 LIMIT 1), 'Carro'),
((SELECT id_hogar FROM familias_hogares WHERE cant_personas = 6 AND cant_trabajadores = 3 LIMIT 1), 'Moto');

-- ==========================================================
-- 10. ÁMBITOS LEGALES (Tabla maestra, sin dependencias)
-- ==========================================================
-- Nota: id_ambito_legal es SERIAL PRIMARY KEY
INSERT INTO ambitos_legales (materia, tipo, descripcion) VALUES
('Derecho de Familia', 'Civil', 'Asuntos relacionados con divorcio, custodia, pensión alimentaria'),
('Derecho Laboral', 'Laboral', 'Despidos injustificados, prestaciones sociales, condiciones de trabajo'),
('Derecho Penal', 'Penal', 'Defensa en procesos penales, asesoría legal'),
('Derecho Civil', 'Civil', 'Contratos, propiedad, sucesiones'),
('Derecho Administrativo', 'Administrativo', 'Trámites administrativos, recursos administrativos'),
('Derecho Mercantil', 'Mercantil', 'Asuntos comerciales, sociedades mercantiles');

-- ==========================================================
-- 11. CLIENTES (SOLICITANTES COMPLETOS)
-- ==========================================================
-- Nota: cedula es PRIMARY KEY (VARCHAR, NO es SERIAL)
-- IMPORTANTE: Si un cliente tiene casos con fecha_solicitud, TODOS los campos relacionados deben ser NOT NULL
-- Por eso, para solicitantes, debemos proporcionar: id_nucleo, id_hogar, id_nivel_educativo, id_trabajo, id_vivienda, id_parroquia
INSERT INTO clientes (
    cedula,
    nombres,
    apellidos,
    fecha_nacimiento,
    telefono_local,
    telefono_celular,
    correo_electronico,
    sexo,
    nacionalidad,
    estado_civil,
    concubinato,
    id_hogar,
    id_nivel_educativo,
    id_trabajo,
    id_vivienda,
    id_parroquia,
    id_nucleo
) VALUES
-- Solicitante 1: Completo (es solicitante porque tendrá casos con fecha_solicitud)
('V12345678', 'María', 'González', '1985-05-15', '0212-5551234', '0412-1234567', 'maria.gonzalez@email.com', 'F', 'V', 'Casado', false, 
 (SELECT id_hogar FROM familias_hogares WHERE cant_personas = 4 AND cant_trabajadores = 2 LIMIT 1),
 (SELECT id_nivel_educativo FROM niveles_educativos WHERE nivel = 12 LIMIT 1),
 (SELECT id_trabajo FROM trabajos WHERE condicion_actividad = 'Otra' AND condicion_trabajo = 'Empleado' LIMIT 1),
 (SELECT id_vivienda FROM viviendas WHERE tipo_vivienda = 'Apartamento' LIMIT 1),
 (SELECT id_parroquia FROM parroquias WHERE nombre_parroquia = 'Catedral' LIMIT 1),
 (SELECT id_nucleo FROM nucleos WHERE nombre_nucleo = 'UCAB Guayana' LIMIT 1)),
-- Solicitante 2: Completo
('V23456789', 'Juan', 'Pérez', '1990-08-20', NULL, '0414-2345678', 'juan.perez@email.com', 'M', 'V', 'Soltero', false,
 (SELECT id_hogar FROM familias_hogares WHERE cant_personas = 3 AND cant_trabajadores = 1 LIMIT 1),
 (SELECT id_nivel_educativo FROM niveles_educativos WHERE nivel = 6 LIMIT 1),
 (SELECT id_trabajo FROM trabajos WHERE condicion_actividad = 'Ama de Casa' LIMIT 1),
 (SELECT id_vivienda FROM viviendas WHERE tipo_vivienda = 'Casa Urb' LIMIT 1),
 (SELECT id_parroquia FROM parroquias WHERE nombre_parroquia = 'Altagracia' LIMIT 1),
 (SELECT id_nucleo FROM nucleos WHERE nombre_nucleo = 'UCAB Caracas' LIMIT 1)),
-- Solicitante 3: Completo
('V34567890', 'Carmen', 'Rodríguez', '1978-12-03', '0212-5555678', '0416-3456789', 'carmen.rodriguez@email.com', 'F', 'V', 'Divorciado', false,
 (SELECT id_hogar FROM familias_hogares WHERE cant_personas = 5 AND cant_trabajadores = 2 LIMIT 1),
 (SELECT id_nivel_educativo FROM niveles_educativos WHERE nivel = 14 LIMIT 1),
 (SELECT id_trabajo FROM trabajos WHERE condicion_actividad = 'Estudiante' LIMIT 1),
 (SELECT id_vivienda FROM viviendas WHERE tipo_vivienda = 'Casa de Barrio' LIMIT 1),
 (SELECT id_parroquia FROM parroquias WHERE nombre_parroquia = 'Chacao' LIMIT 1),
 (SELECT id_nucleo FROM nucleos WHERE nombre_nucleo = 'UCAB Guayana' LIMIT 1)),
-- Solicitante 4: Completo
('V45678901', 'Carlos', 'Martínez', '1992-03-25', NULL, '0424-4567890', 'carlos.martinez@email.com', 'M', 'V', 'Soltero', false,
 (SELECT id_hogar FROM familias_hogares WHERE cant_personas = 2 AND cant_trabajadores = 1 LIMIT 1),
 (SELECT id_nivel_educativo FROM niveles_educativos WHERE nivel = 7 LIMIT 1),
 (SELECT id_trabajo FROM trabajos WHERE condicion_actividad = 'Pensionado' LIMIT 1),
 (SELECT id_vivienda FROM viviendas WHERE tipo_vivienda = 'Rancho' LIMIT 1),
 (SELECT id_parroquia FROM parroquias WHERE nombre_parroquia = 'Baruta' LIMIT 1),
 (SELECT id_nucleo FROM nucleos WHERE nombre_nucleo = 'UCAB Caracas' LIMIT 1)),
-- Solicitante 5: Completo
('V56789012', 'Ana', 'López', '1987-07-10', '0212-5559012', '0412-5678901', 'ana.lopez@email.com', 'F', 'V', 'Casado', true,
 (SELECT id_hogar FROM familias_hogares WHERE cant_personas = 6 AND cant_trabajadores = 3 LIMIT 1),
 (SELECT id_nivel_educativo FROM niveles_educativos WHERE nivel = 12 LIMIT 1),
 (SELECT id_trabajo FROM trabajos WHERE condicion_actividad = 'Jubilado' LIMIT 1),
 (SELECT id_vivienda FROM viviendas WHERE tipo_vivienda = 'Quinta' LIMIT 1),
 (SELECT id_parroquia FROM parroquias WHERE nombre_parroquia = 'Maracaibo' LIMIT 1),
 (SELECT id_nucleo FROM nucleos WHERE nombre_nucleo = 'UCAB Guayana' LIMIT 1));

-- ==========================================================
-- 12. CASOS (Depende de: nucleos, ambitos_legales, clientes, expedientes opcional)
-- ==========================================================
-- Nota: id_caso es SERIAL PRIMARY KEY
-- tramite debe ser uno de: 'Asesoría', 'Conciliación y Mediación', '(Redacción documentos y/o convenio)', 'Asistencia Judicial - Casos externos'
-- estatus debe ser uno de: 'En proceso', 'Archivado', 'Entregado', 'Asesoría'
INSERT INTO casos (
    fecha_inicio_caso,
    fecha_fin_caso,
    fecha_solicitud,
    fecha_solicitud,
    tramite,
    estatus,
    observaciones,
    id_nucleo,
    id_ambito_legal,
    id_expediente,
    cedula_cliente
) VALUES
-- Caso 1: Asesoría en proceso (solicitante)
('2024-01-15', NULL, '2024-01-10', 'Asesoría', 'En proceso', 'Cliente solicita asesoría para proceso de divorcio. Primera consulta realizada.', 
 (SELECT id_nucleo FROM nucleos WHERE nombre_nucleo = 'UCAB Guayana' LIMIT 1),
 (SELECT id_ambito_legal FROM ambitos_legales WHERE materia = 'Derecho de Familia' LIMIT 1), NULL, 'V12345678'),
-- Caso 2: Conciliación en proceso (solicitante)
('2024-02-20', NULL, '2024-02-15', 'Conciliación y Mediación', 'En proceso', 'Proceso de mediación para pensión alimentaria. En espera de respuesta de la contraparte.',
 (SELECT id_nucleo FROM nucleos WHERE nombre_nucleo = 'UCAB Caracas' LIMIT 1),
 (SELECT id_ambito_legal FROM ambitos_legales WHERE materia = 'Derecho de Familia' LIMIT 1), NULL, 'V23456789'),
-- Caso 3: Redacción de documentos (solicitante)
('2024-03-05', NULL, '2024-03-01', '(Redacción documentos y/o convenio)', 'En proceso', 'Redacción de convenio de separación de bienes. Pendiente revisión.',
 (SELECT id_nucleo FROM nucleos WHERE nombre_nucleo = 'UCAB Guayana' LIMIT 1),
 (SELECT id_ambito_legal FROM ambitos_legales WHERE materia = 'Derecho Civil' LIMIT 1), NULL, 'V34567890'),
-- Caso 4: Asistencia Judicial (solicitante)
('2024-04-10', NULL, '2024-04-05', 'Asistencia Judicial - Casos externos', 'En proceso', 'Acompañamiento en audiencia de conciliación laboral.',
 (SELECT id_nucleo FROM nucleos WHERE nombre_nucleo = 'UCAB Caracas' LIMIT 1),
 (SELECT id_ambito_legal FROM ambitos_legales WHERE materia = 'Derecho Laboral' LIMIT 1), NULL, 'V45678901'),
-- Caso 5: Asesoría (solicitante)
('2024-05-15', NULL, '2024-05-12', 'Asesoría', 'Asesoría', 'Consulta inicial sobre derechos laborales. Pendiente documentación.',
 (SELECT id_nucleo FROM nucleos WHERE nombre_nucleo = 'UCAB Guayana' LIMIT 1),
 (SELECT id_ambito_legal FROM ambitos_legales WHERE materia = 'Derecho Laboral' LIMIT 1), NULL, 'V56789012'),
-- Caso 6: Caso archivado (solicitante)
('2023-12-01', '2024-01-30', '2024-01-10', 'Asesoría', 'Archivado', 'Caso resuelto. Cliente satisfecho con la asesoría proporcionada.',
 (SELECT id_nucleo FROM nucleos WHERE nombre_nucleo = 'UCAB Guayana' LIMIT 1),
 (SELECT id_ambito_legal FROM ambitos_legales WHERE materia = 'Derecho de Familia' LIMIT 1), NULL, 'V12345678'),
-- Caso 7: Caso entregado (solicitante)
('2023-11-15', '2024-02-28', '2024-02-15', 'Conciliación y Mediación', 'Entregado', 'Mediación exitosa. Acuerdo firmado por ambas partes.',
 (SELECT id_nucleo FROM nucleos WHERE nombre_nucleo = 'UCAB Caracas' LIMIT 1),
 (SELECT id_ambito_legal FROM ambitos_legales WHERE materia = 'Derecho de Familia' LIMIT 1), NULL, 'V23456789');

-- ==========================================================
-- 13. CITAS (Depende de casos) - TABLA PRINCIPAL DEL MÓDULO
-- ==========================================================
-- Nota: PRIMARY KEY compuesta (fecha_cita, id_caso)
-- fecha_cita es TIMESTAMP (incluye fecha y hora)
-- proxima_cita es DATE (solo fecha)
-- Usamos subconsultas para obtener el id_caso por cedula_cliente y fecha_inicio_caso
INSERT INTO citas (fecha_cita, id_caso, proxima_cita) VALUES
-- Citas para diciembre 2025
('2025-12-10 09:00:00', (SELECT id_caso FROM casos WHERE cedula_cliente = 'V12345678' AND fecha_inicio_caso = '2024-01-15' LIMIT 1), '2025-12-17'),
('2025-12-10 10:30:00', (SELECT id_caso FROM casos WHERE cedula_cliente = 'V23456789' AND fecha_inicio_caso = '2024-02-20' LIMIT 1), '2025-12-24'),
('2025-12-11 14:00:00', (SELECT id_caso FROM casos WHERE cedula_cliente = 'V34567890' AND fecha_inicio_caso = '2024-03-05' LIMIT 1), '2025-12-18'),
('2025-12-12 11:00:00', (SELECT id_caso FROM casos WHERE cedula_cliente = 'V45678901' AND fecha_inicio_caso = '2024-04-10' LIMIT 1), '2025-12-19'),
('2025-12-13 15:30:00', (SELECT id_caso FROM casos WHERE cedula_cliente = 'V56789012' AND fecha_inicio_caso = '2024-05-15' LIMIT 1), '2025-12-20'),
('2025-12-15 09:00:00', (SELECT id_caso FROM casos WHERE cedula_cliente = 'V12345678' AND fecha_inicio_caso = '2024-01-15' LIMIT 1), '2025-12-22'),
('2025-12-16 10:00:00', (SELECT id_caso FROM casos WHERE cedula_cliente = 'V23456789' AND fecha_inicio_caso = '2024-02-20' LIMIT 1), '2025-12-23'),
('2025-12-17 14:30:00', (SELECT id_caso FROM casos WHERE cedula_cliente = 'V34567890' AND fecha_inicio_caso = '2024-03-05' LIMIT 1), '2025-12-24'),
('2025-12-18 11:30:00', (SELECT id_caso FROM casos WHERE cedula_cliente = 'V45678901' AND fecha_inicio_caso = '2024-04-10' LIMIT 1), '2025-12-25'),
('2025-12-19 16:00:00', (SELECT id_caso FROM casos WHERE cedula_cliente = 'V56789012' AND fecha_inicio_caso = '2024-05-15' LIMIT 1), '2025-12-26'),
-- Citas para enero 2026
('2026-01-07 09:00:00', (SELECT id_caso FROM casos WHERE cedula_cliente = 'V12345678' AND fecha_inicio_caso = '2024-01-15' LIMIT 1), '2026-01-14'),
('2026-01-08 10:00:00', (SELECT id_caso FROM casos WHERE cedula_cliente = 'V23456789' AND fecha_inicio_caso = '2024-02-20' LIMIT 1), '2026-01-15'),
('2026-01-09 14:00:00', (SELECT id_caso FROM casos WHERE cedula_cliente = 'V34567890' AND fecha_inicio_caso = '2024-03-05' LIMIT 1), '2026-01-16'),
('2026-01-10 11:00:00', (SELECT id_caso FROM casos WHERE cedula_cliente = 'V45678901' AND fecha_inicio_caso = '2024-04-10' LIMIT 1), '2026-01-17'),
('2026-01-11 15:00:00', (SELECT id_caso FROM casos WHERE cedula_cliente = 'V56789012' AND fecha_inicio_caso = '2024-05-15' LIMIT 1), '2026-01-18');

-- ==========================================================
-- FIN DEL SCRIPT
-- ==========================================================
-- Verificación: Ejecuta estas consultas para verificar los datos insertados:
-- 
-- SELECT COUNT(*) FROM estados;
-- SELECT COUNT(*) FROM municipios;
-- SELECT COUNT(*) FROM parroquias;
-- SELECT COUNT(*) FROM nucleos;
-- SELECT COUNT(*) FROM niveles_educativos;
-- SELECT COUNT(*) FROM trabajos;
-- SELECT COUNT(*) FROM viviendas;
-- SELECT COUNT(*) FROM familias_hogares;
-- SELECT COUNT(*) FROM artefactos_domesticos;
-- SELECT COUNT(*) FROM ambitos_legales;
-- SELECT COUNT(*) FROM casos WHERE fecha_solicitud IS NOT NULL;
-- SELECT COUNT(*) FROM casos;
-- SELECT COUNT(*) FROM citas;
-- ==========================================================

