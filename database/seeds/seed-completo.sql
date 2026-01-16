-- ==========================================================
-- SCRIPT DE CARGA DE DATOS COMPLETO PARA PRUEBAS
-- ==========================================================
-- Este script inserta datos de prueba para todas las tablas
-- del sistema de gestión de clínicas jurídicas.
-- 
-- IMPORTANTE: 
-- - Todos los usuarios tienen la contraseña: password123
-- - Las contraseñas están hasheadas con bcrypt (salt rounds: 10)
-- - Este seed usa ON CONFLICT DO UPDATE para evitar errores si se ejecuta múltiples veces
-- - Hash de password123: $2b$10$sV6rtquZ.uUT2RKkp.Gw/uNIj7qoYjPUwfYdek1tuvbNcBQ3ByYn2
-- 
-- ⚠️ ATOMICIDAD: Este script usa transacción única (TODO O NADA)
-- Si algún INSERT falla, se revierte TODO automáticamente.
-- ==========================================================

-- Limpiar cualquier transacción abortada previa
ROLLBACK;

-- Iniciar nueva transacción
BEGIN;

-- ==========================================================
-- 1. ESTADOS (Tabla maestra, sin dependencias)
-- ==========================================================
INSERT INTO estados (nombre_estado) VALUES
('Distrito Capital'),
('Miranda'),
('Carabobo'),
('Zulia'),
('Lara'),
('Aragua'),
('Anzoátegui')
ON CONFLICT DO NOTHING;

-- ==========================================================
-- 2. MUNICIPIOS (Depende de estados)
-- ==========================================================
INSERT INTO municipios (id_estado, num_municipio, nombre_municipio) VALUES
((SELECT id_estado FROM estados WHERE nombre_estado = 'Distrito Capital' LIMIT 1), 1, 'Libertador'),
((SELECT id_estado FROM estados WHERE nombre_estado = 'Miranda' LIMIT 1), 1, 'Chacao'),
((SELECT id_estado FROM estados WHERE nombre_estado = 'Miranda' LIMIT 1), 2, 'Baruta'),
((SELECT id_estado FROM estados WHERE nombre_estado = 'Miranda' LIMIT 1), 3, 'Sucre'),
((SELECT id_estado FROM estados WHERE nombre_estado = 'Carabobo' LIMIT 1), 1, 'Valencia'),
((SELECT id_estado FROM estados WHERE nombre_estado = 'Zulia' LIMIT 1), 1, 'Maracaibo'),
((SELECT id_estado FROM estados WHERE nombre_estado = 'Lara' LIMIT 1), 1, 'Iribarren')
ON CONFLICT DO NOTHING;

-- ==========================================================
-- 3. PARROQUIAS (Depende de municipios)
-- ==========================================================
INSERT INTO parroquias (id_estado, num_municipio, num_parroquia, nombre_parroquia) VALUES
((SELECT id_estado FROM estados WHERE nombre_estado = 'Distrito Capital' LIMIT 1), 1, 1, 'Catedral'),
((SELECT id_estado FROM estados WHERE nombre_estado = 'Distrito Capital' LIMIT 1), 1, 2, 'Altagracia'),
((SELECT id_estado FROM estados WHERE nombre_estado = 'Miranda' LIMIT 1), 1, 1, 'Chacao'),
((SELECT id_estado FROM estados WHERE nombre_estado = 'Miranda' LIMIT 1), 2, 1, 'Baruta'),
((SELECT id_estado FROM estados WHERE nombre_estado = 'Miranda' LIMIT 1), 3, 1, 'Petare'),
((SELECT id_estado FROM estados WHERE nombre_estado = 'Carabobo' LIMIT 1), 1, 1, 'Valencia'),
((SELECT id_estado FROM estados WHERE nombre_estado = 'Zulia' LIMIT 1), 1, 1, 'Maracaibo'),
((SELECT id_estado FROM estados WHERE nombre_estado = 'Lara' LIMIT 1), 1, 1, 'Iribarren')
ON CONFLICT DO NOTHING;

-- ==========================================================
-- 4. NÚCLEOS (Depende de parroquias)
-- ==========================================================
-- Nota: id_nucleo es SERIAL, así que no especificamos el ID
INSERT INTO nucleos (nombre_nucleo, id_estado, num_municipio, num_parroquia) 
SELECT 'UCAB Guayana', id_estado, 1, 1
FROM estados 
WHERE nombre_estado = 'Distrito Capital'
  AND NOT EXISTS (SELECT 1 FROM nucleos WHERE nombre_nucleo = 'UCAB Guayana')
LIMIT 1;

INSERT INTO nucleos (nombre_nucleo, id_estado, num_municipio, num_parroquia) 
SELECT 'UCAB Caracas', id_estado, 1, 2
FROM estados 
WHERE nombre_estado = 'Distrito Capital'
  AND NOT EXISTS (SELECT 1 FROM nucleos WHERE nombre_nucleo = 'UCAB Caracas')
LIMIT 1;

INSERT INTO nucleos (nombre_nucleo, id_estado, num_municipio, num_parroquia) 
SELECT 'UCAB Barquisimeto', id_estado, 1, 1
FROM estados 
WHERE nombre_estado = 'Lara'
  AND NOT EXISTS (SELECT 1 FROM nucleos WHERE nombre_nucleo = 'UCAB Barquisimeto')
LIMIT 1;

-- ==========================================================
-- 5. NIVELES EDUCATIVOS (Tabla maestra, sin dependencias)
-- ==========================================================
INSERT INTO niveles_educativos (descripcion) VALUES
('Sin nivel'),
('Primaria incompleta'),
('Primaria completa'),
('Secundaria incompleta'),
('Secundaria completa'),
('Técnico medio'),
('Técnico superior'),
('Universitaria incompleta'),
('Universitaria completa'),
('Postgrado')
ON CONFLICT DO NOTHING;

-- ==========================================================
-- 6. CONDICIÓN TRABAJO (Tabla maestra, sin dependencias)
-- ==========================================================
-- IDs específicos: 0 no trabaja, 1 Patrono, 2 Empleado, 3 Obrero, 4 Cuenta propia
INSERT INTO condicion_trabajo (id_trabajo, nombre_trabajo) VALUES
(0, 'No trabaja'),
(1, 'Patrono'),
(2, 'Empleado'),
(3, 'Obrero'),
(4, 'Cuenta propia')
ON CONFLICT (id_trabajo) DO UPDATE
SET nombre_trabajo = EXCLUDED.nombre_trabajo;

-- Ajustar la secuencia para que el próximo ID sea 5
SELECT setval('condicion_trabajo_id_trabajo_seq', 4, true);

-- ==========================================================
-- 7. CONDICIÓN ACTIVIDAD (Tabla maestra, sin dependencias)
-- ==========================================================
-- IDs específicos: 0 buscando trabajo, 1 Ama de Casa, 2 Estudiante, 3 Pensionado/Jubilado, 4 Otra
INSERT INTO condicion_actividad (id_actividad, nombre_actividad) VALUES
(0, 'Buscando trabajo'),
(1, 'Ama de Casa'),
(2, 'Estudiante'),
(3, 'Pensionado/Jubilado'),
(4, 'Otra')
ON CONFLICT (id_actividad) DO UPDATE
SET nombre_actividad = EXCLUDED.nombre_actividad;

-- Ajustar la secuencia para que el próximo ID sea 5
SELECT setval('condicion_actividad_id_actividad_seq', 4, true);

-- ==========================================================
-- 8. MATERIAS, CATEGORÍAS, SUBCATEGORÍAS Y ÁMBITOS LEGALES
-- ==========================================================
-- NOTA: Estos datos se cargan desde el script separado:
-- database/seeds/seed-materias-catalogos.sql
-- 
-- Ejecuta ese script primero antes de ejecutar este seed completo.
-- ==========================================================

-- ==========================================================
-- 12. SEMESTRES (Tabla maestra, sin dependencias)
-- ==========================================================
INSERT INTO semestres (term, fecha_inicio, fecha_fin) VALUES
('2024-1', '2024-01-15', '2024-05-31'),
('2024-2', '2024-08-15', '2024-12-20'),
('2025-1', '2025-01-15', '2025-05-31'),
('2025-2', '2025-08-15', '2025-12-20')
ON CONFLICT (term) DO UPDATE
SET fecha_inicio = EXCLUDED.fecha_inicio,
    fecha_fin = EXCLUDED.fecha_fin;

-- ==========================================================
-- 13. USUARIOS - ESTUDIANTES
-- ==========================================================
INSERT INTO usuarios (
    cedula, nombres, apellidos, correo_electronico, nombre_usuario, 
    contrasena, telefono_celular, habilitado_sistema, tipo_usuario
) VALUES
('V-11111111', 'Ana', 'Martínez', 'ana.martinez@est.ucab.edu.ve', 'ana.martinez', 
 '$2b$10$sV6rtquZ.uUT2RKkp.Gw/uNIj7qoYjPUwfYdek1tuvbNcBQ3ByYn2', '0412-1111111', TRUE, 'Estudiante'),
('V-22222222', 'Carlos', 'Rodríguez', 'carlos.rodriguez@est.ucab.edu.ve', 'carlos.rodriguez', 
 '$2b$10$sV6rtquZ.uUT2RKkp.Gw/uNIj7qoYjPUwfYdek1tuvbNcBQ3ByYn2', '0414-2222222', TRUE, 'Estudiante'),
('V-33333333', 'María', 'Fernández', 'maria.fernandez@est.ucab.edu.ve', 'maria.fernandez', 
 '$2b$10$sV6rtquZ.uUT2RKkp.Gw/uNIj7qoYjPUwfYdek1tuvbNcBQ3ByYn2', '0416-3333333', TRUE, 'Estudiante')
ON CONFLICT (cedula) DO UPDATE
SET nombres = EXCLUDED.nombres,
    apellidos = EXCLUDED.apellidos,
    correo_electronico = EXCLUDED.correo_electronico,
    nombre_usuario = EXCLUDED.nombre_usuario,
    contrasena = EXCLUDED.contrasena;

-- ==========================================================
-- 14. USUARIOS - PROFESORES
-- ==========================================================
INSERT INTO usuarios (
    cedula, nombres, apellidos, correo_electronico, nombre_usuario, 
    contrasena, telefono_celular, habilitado_sistema, tipo_usuario
) VALUES
('V-44444444', 'Profesor', 'González', 'profesor.gonzalez@ucab.edu.ve', 'prof.gonzalez', 
 '$2b$10$sV6rtquZ.uUT2RKkp.Gw/uNIj7qoYjPUwfYdek1tuvbNcBQ3ByYn2', '0412-4444444', TRUE, 'Profesor'),
('V-55555555', 'Laura', 'Pérez', 'laura.perez@ucab.edu.ve', 'laura.perez', 
 '$2b$10$sV6rtquZ.uUT2RKkp.Gw/uNIj7qoYjPUwfYdek1tuvbNcBQ3ByYn2', '0414-5555555', TRUE, 'Profesor'),
('V-66666666', 'Roberto', 'Sánchez', 'roberto.sanchez@ucab.edu.ve', 'roberto.sanchez', 
 '$2b$10$sV6rtquZ.uUT2RKkp.Gw/uNIj7qoYjPUwfYdek1tuvbNcBQ3ByYn2', '0416-6666666', TRUE, 'Profesor')
ON CONFLICT (cedula) DO UPDATE
SET nombres = EXCLUDED.nombres,
    apellidos = EXCLUDED.apellidos,
    correo_electronico = EXCLUDED.correo_electronico,
    nombre_usuario = EXCLUDED.nombre_usuario,
    contrasena = EXCLUDED.contrasena;

-- ==========================================================
-- 15. USUARIOS - COORDINADOR
-- ==========================================================
INSERT INTO usuarios (
    cedula, nombres, apellidos, correo_electronico, nombre_usuario, 
    contrasena, telefono_celular, habilitado_sistema, tipo_usuario
) VALUES
('V-77777777', 'Coordinador', 'Administrador', 'coordinador@ucab.edu.ve', 'coordinador', 
 '$2b$10$sV6rtquZ.uUT2RKkp.Gw/uNIj7qoYjPUwfYdek1tuvbNcBQ3ByYn2', '0412-7777777', TRUE, 'Coordinador')
ON CONFLICT (cedula) DO UPDATE
SET nombres = EXCLUDED.nombres,
    apellidos = EXCLUDED.apellidos,
    correo_electronico = EXCLUDED.correo_electronico,
    nombre_usuario = EXCLUDED.nombre_usuario,
    contrasena = EXCLUDED.contrasena;

-- ==========================================================
-- 16. COORDINADORES (Depende de usuarios y semestres)
-- ==========================================================
INSERT INTO coordinadores (id_coordinador, term) VALUES
('V-77777777', '2025-1')
ON CONFLICT DO NOTHING;

-- ==========================================================
-- 17. SOLICITANTES (Completos)
-- ==========================================================
INSERT INTO solicitantes (
    cedula, nombres, apellidos, fecha_nacimiento, telefono_local, telefono_celular,
    correo_electronico, sexo, nacionalidad, estado_civil, concubinato, tiempo_estudio,
    id_nivel_educativo, id_trabajo, id_actividad, id_estado, num_municipio, num_parroquia
) VALUES
-- Solicitante 1
('V-12345678', 'María', 'González', '1985-05-15', '0212-5551234', '0412-1234567', 
 'maria.gonzalez@email.com', 'F', 'V', 'Casado', false, 'Años',
 (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'Secundaria completa' LIMIT 1),
 (SELECT id_trabajo FROM condicion_trabajo WHERE nombre_trabajo = 'Empleado' LIMIT 1),
 (SELECT id_actividad FROM condicion_actividad WHERE nombre_actividad = 'Otra' LIMIT 1),
 (SELECT id_estado FROM estados WHERE nombre_estado = 'Distrito Capital' LIMIT 1), 1, 1),
-- Solicitante 2
('V-23456789', 'Juan', 'Pérez', '1990-08-20', NULL, '0414-2345678', 
 'juan.perez@email.com', 'M', 'V', 'Soltero', false, 'Años',
 (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'Primaria completa' LIMIT 1),
 (SELECT id_trabajo FROM condicion_trabajo WHERE nombre_trabajo = 'Cuenta propia' LIMIT 1),
 (SELECT id_actividad FROM condicion_actividad WHERE nombre_actividad = 'Ama de Casa' LIMIT 1),
 (SELECT id_estado FROM estados WHERE nombre_estado = 'Distrito Capital' LIMIT 1), 1, 2),
-- Solicitante 3
('V-34567890', 'Carmen', 'Rodríguez', '1978-12-03', '0212-5555678', '0416-3456789', 
 'carmen.rodriguez@email.com', 'F', 'V', 'Divorciado', false, 'Semestres',
 (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'Universitaria completa' LIMIT 1),
 (SELECT id_trabajo FROM condicion_trabajo WHERE nombre_trabajo = 'Empleado' LIMIT 1),
 (SELECT id_actividad FROM condicion_actividad WHERE nombre_actividad = 'Estudiante' LIMIT 1),
 (SELECT id_estado FROM estados WHERE nombre_estado = 'Miranda' LIMIT 1), 1, 1),
-- Solicitante 4
('V-45678901', 'Carlos', 'Martínez', '1992-03-25', NULL, '0424-4567890', 
 'carlos.martinez@email.com', 'M', 'V', 'Soltero', false, 'Años',
 (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'Secundaria incompleta' LIMIT 1),
 (SELECT id_trabajo FROM condicion_trabajo WHERE nombre_trabajo = 'no trabaja' LIMIT 1),
 (SELECT id_actividad FROM condicion_actividad WHERE nombre_actividad = 'Pensionado/Jubilado' LIMIT 1),
 (SELECT id_estado FROM estados WHERE nombre_estado = 'Miranda' LIMIT 1), 2, 1),
-- Solicitante 5
('V-56789012', 'Ana', 'López', '1987-07-10', '0212-5559012', '0412-5678901', 
 'ana.lopez@email.com', 'F', 'V', 'Casado', true, 'Años',
 (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'Secundaria completa' LIMIT 1),
 (SELECT id_trabajo FROM condicion_trabajo WHERE nombre_trabajo = 'Patrono' LIMIT 1),
 (SELECT id_actividad FROM condicion_actividad WHERE nombre_actividad = 'Pensionado/Jubilado' LIMIT 1),
 (SELECT id_estado FROM estados WHERE nombre_estado = 'Carabobo' LIMIT 1), 1, 1)
ON CONFLICT (cedula) DO UPDATE
SET nombres = EXCLUDED.nombres,
    apellidos = EXCLUDED.apellidos,
    correo_electronico = EXCLUDED.correo_electronico;

-- ==========================================================
-- 18. VIVIENDAS (Depende de solicitantes)
-- ==========================================================
INSERT INTO viviendas (cedula_solicitante, cant_habitaciones, cant_banos) VALUES
('V-12345678', 3, 2),
('V-23456789', 2, 1),
('V-34567890', 4, 2),
('V-45678901', 1, 1),
('V-56789012', 5, 3)
ON CONFLICT (cedula_solicitante) DO UPDATE
SET cant_habitaciones = EXCLUDED.cant_habitaciones,
    cant_banos = EXCLUDED.cant_banos;

-- ==========================================================
-- 19. FAMILIAS Y HOGARES (Depende de solicitantes)
-- ==========================================================
INSERT INTO familias_y_hogares (
    cedula_solicitante, cant_personas, cant_trabajadores, cant_no_trabajadores,
    cant_ninos, cant_ninos_estudiando, jefe_hogar, ingresos_mensuales,
    tiempo_estudio_jefe, id_nivel_educativo_jefe
) VALUES
('V-12345678', 4, 2, 2, 2, 2, true, 500000.00, 'Años',
 (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'Secundaria completa' LIMIT 1)),
('V-23456789', 3, 1, 2, 1, 1, true, 300000.00, 'Años',
 (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'Primaria completa' LIMIT 1)),
('V-34567890', 5, 2, 3, 3, 2, true, 800000.00, 'Semestres',
 (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'Universitaria completa' LIMIT 1)),
('V-45678901', 2, 1, 1, 0, 0, true, 250000.00, NULL, NULL),
('V-56789012', 6, 3, 3, 3, 3, true, 1200000.00, 'Años',
 (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'Secundaria completa' LIMIT 1))
ON CONFLICT (cedula_solicitante) DO UPDATE
SET cant_personas = EXCLUDED.cant_personas,
    cant_trabajadores = EXCLUDED.cant_trabajadores,
    cant_no_trabajadores = EXCLUDED.cant_no_trabajadores,
    cant_ninos = EXCLUDED.cant_ninos,
    cant_ninos_estudiando = EXCLUDED.cant_ninos_estudiando,
    ingresos_mensuales = EXCLUDED.ingresos_mensuales;

-- ==========================================================
-- 19. TIPO CARACTERÍSTICAS (Tabla maestra, sin dependencias)
-- ==========================================================
INSERT INTO tipo_caracteristicas (id_tipo, nombre_tipo_caracteristica) VALUES
(1, 'tipo_vivienda'),
(2, 'material_piso'),
(3, 'material_paredes'),
(4, 'material_techo'),
(5, 'agua_potable'),
(6, 'aseo'),
(7, 'eliminacion_aguas_n'),
(8, 'artefactos_domesticos')
ON CONFLICT (id_tipo) DO UPDATE
SET nombre_tipo_caracteristica = EXCLUDED.nombre_tipo_caracteristica;

-- ==========================================================
-- 20. CARACTERÍSTICAS (Depende de tipo_caracteristicas)
-- ==========================================================
INSERT INTO caracteristicas (id_tipo_caracteristica, num_caracteristica, descripcion, habilitado) VALUES
-- Tipo 1: TIPO_VIVIENDA
(1, 1, 'Quinta', TRUE),
(1, 2, 'Casa Urb', TRUE),
(1, 3, 'Apartamento', TRUE),
(1, 4, 'Bloque', TRUE),
(1, 5, 'Casa de Barrio', TRUE),
(1, 6, 'Casa Rural', TRUE),
(1, 7, 'Rancho', TRUE),
(1, 8, 'Refugio', TRUE),
(1, 9, 'Otros', TRUE),
-- Tipo 2: MATERIAL_PISO
(2, 1, 'Tierra', TRUE),
(2, 2, 'Cemento', TRUE),
(2, 3, 'Cerámica', TRUE),
(2, 4, 'Granito / Parquet / Mármol', TRUE),
-- Tipo 3: MATERIAL_PAREDES
(3, 1, 'Cartón / Palma / Desechos', TRUE),
(3, 2, 'Bahareque', TRUE),
(3, 3, 'Bloque sin frizar', TRUE),
(3, 4, 'Bloque frizado', TRUE),
-- Tipo 4: MATERIAL_TECHO
(4, 1, 'Madera / Cartón / Palma', TRUE),
(4, 2, 'Zinc / Acerolit', TRUE),
(4, 3, 'Platabanda / Tejas', TRUE),
-- Tipo 5: AGUA_POTABLE
(5, 1, 'Dentro de la vivienda', TRUE),
(5, 2, 'Fuera de la vivienda', TRUE),
(5, 3, 'No tiene servicio', TRUE),
-- Tipo 6: ASEO
(6, 1, 'Llega a la vivienda', TRUE),
(6, 2, 'No llega a la vivienda / Container', TRUE),
(6, 3, 'No tiene', TRUE),
-- Tipo 7: ELIMINACION_AGUAS_N
(7, 1, 'Poceta a cloaca / Pozo séptico', TRUE),
(7, 2, 'Poceta sin conexión', TRUE),
(7, 3, 'Excusado de hoyo o letrina', TRUE),
(7, 4, 'No tiene', TRUE),
-- Tipo 8: ARTEFACTOS_DOMESTICOS
(8, 1, 'Nevera', TRUE),
(8, 2, 'Lavadora', TRUE),
(8, 3, 'Computadora', TRUE),
(8, 4, 'Cable Satelital', TRUE),
(8, 5, 'Internet', TRUE),
(8, 6, 'Carro', TRUE),
(8, 7, 'Moto', TRUE)
ON CONFLICT (id_tipo_caracteristica, num_caracteristica) DO UPDATE
SET descripcion = EXCLUDED.descripcion,
    habilitado = EXCLUDED.habilitado;

-- ==========================================================
-- 21. ASIGNADAS_A (Relación entre Viviendas y Características)
-- ==========================================================
-- Asignar características a las viviendas de los solicitantes
-- Nota: Cada vivienda debe tener UNA característica de cada tipo (excepto artefactos_domesticos que puede tener múltiples)
INSERT INTO asignadas_a (cedula_solicitante, id_tipo_caracteristica, num_caracteristica) VALUES
-- Vivienda 1 (V-12345678) - Apartamento
('V-12345678', 1, 3), -- Apartamento (tipo_vivienda)
('V-12345678', 2, 3), -- Cerámica (material_piso)
('V-12345678', 3, 4), -- Bloque frizado (material_paredes)
('V-12345678', 4, 3), -- Platabanda / Tejas (material_techo)
('V-12345678', 5, 1), -- Dentro de la vivienda (agua_potable)
('V-12345678', 6, 1), -- Llega a la vivienda (aseo)
('V-12345678', 7, 1), -- Poceta a cloaca / Pozo séptico (eliminacion_aguas_n)
('V-12345678', 8, 1), -- Nevera (artefactos_domesticos)
('V-12345678', 8, 2), -- Lavadora (artefactos_domesticos)
('V-12345678', 8, 3), -- Computadora (artefactos_domesticos)
-- Vivienda 2 (V-23456789) - Casa Urb
('V-23456789', 1, 2), -- Casa Urb (tipo_vivienda)
('V-23456789', 2, 2), -- Cemento (material_piso)
('V-23456789', 3, 3), -- Bloque sin frizar (material_paredes)
('V-23456789', 4, 2), -- Zinc / Acerolit (material_techo)
('V-23456789', 5, 1), -- Dentro de la vivienda (agua_potable)
('V-23456789', 6, 1), -- Llega a la vivienda (aseo)
('V-23456789', 7, 1), -- Poceta a cloaca / Pozo séptico (eliminacion_aguas_n)
('V-23456789', 8, 1), -- Nevera (artefactos_domesticos)
-- Vivienda 3 (V-34567890) - Quinta
('V-34567890', 1, 1), -- Quinta (tipo_vivienda)
('V-34567890', 2, 4), -- Granito / Parquet / Mármol (material_piso)
('V-34567890', 3, 4), -- Bloque frizado (material_paredes)
('V-34567890', 4, 3), -- Platabanda / Tejas (material_techo)
('V-34567890', 5, 1), -- Dentro de la vivienda (agua_potable)
('V-34567890', 6, 1), -- Llega a la vivienda (aseo)
('V-34567890', 7, 1), -- Poceta a cloaca / Pozo séptico (eliminacion_aguas_n)
('V-34567890', 8, 1), -- Nevera (artefactos_domesticos)
('V-34567890', 8, 2), -- Lavadora (artefactos_domesticos)
('V-34567890', 8, 3), -- Computadora (artefactos_domesticos)
('V-34567890', 8, 4), -- Cable Satelital (artefactos_domesticos)
('V-34567890', 8, 5), -- Internet (artefactos_domesticos)
('V-34567890', 8, 6), -- Carro (artefactos_domesticos)
-- Vivienda 4 (V-45678901) - Rancho
('V-45678901', 1, 7), -- Rancho (tipo_vivienda)
('V-45678901', 2, 1), -- Tierra (material_piso)
('V-45678901', 3, 1), -- Cartón / Palma / Desechos (material_paredes)
('V-45678901', 4, 1), -- Madera / Cartón / Palma (material_techo)
('V-45678901', 5, 2), -- Fuera de la vivienda (agua_potable)
('V-45678901', 6, 3), -- No tiene (aseo)
('V-45678901', 7, 3), -- Excusado de hoyo o letrina (eliminacion_aguas_n)
-- Vivienda 5 (V-56789012) - Casa de Barrio
('V-56789012', 1, 5), -- Casa de Barrio (tipo_vivienda)
('V-56789012', 2, 2), -- Cemento (material_piso)
('V-56789012', 3, 3), -- Bloque sin frizar (material_paredes)
('V-56789012', 4, 2), -- Zinc / Acerolit (material_techo)
('V-56789012', 5, 1), -- Dentro de la vivienda (agua_potable)
('V-56789012', 6, 2), -- No llega a la vivienda / Container (aseo)
('V-56789012', 7, 2), -- Poceta sin conexión (eliminacion_aguas_n)
('V-56789012', 8, 1), -- Nevera (artefactos_domesticos)
('V-56789012', 8, 2)  -- Lavadora (artefactos_domesticos)
ON CONFLICT DO NOTHING;

-- ==========================================================
-- 22. CASOS (Depende de nucleos, solicitantes, ambitos_legales)
-- ==========================================================
-- Nota: Usamos los nuevos ámbitos legales del catálogo actualizado

-- Caso 1: Asesoría en proceso - Divorcio contencioso (Civil -> Familia -> Tribunales Ordinarios)
INSERT INTO casos (
    fecha_inicio_caso, fecha_fin_caso, tramite, observaciones,
    id_nucleo, cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal
)
SELECT 
    '2024-01-15'::DATE, NULL, 'Asesoría', 'Cliente solicita asesoría para proceso de divorcio. Primera consulta realizada.',
    (SELECT id_nucleo FROM nucleos WHERE nombre_nucleo = 'UCAB Guayana' LIMIT 1),
    'V-12345678',
    al.id_materia, al.num_categoria, al.num_subcategoria, al.num_ambito_legal
FROM ambitos_legales al
WHERE al.nombre_ambito_legal = 'Divorcio contencioso'
  AND al.id_materia = 1 AND al.num_categoria = 1 AND al.num_subcategoria = 1
LIMIT 1;

-- Caso 2: Conciliación en proceso - Obligación de Manutención (Civil -> Familia -> Tribunales Protección)
INSERT INTO casos (
    fecha_inicio_caso, fecha_fin_caso, tramite, observaciones,
    id_nucleo, cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal
)
SELECT 
    '2024-02-20'::DATE, NULL, 'Conciliación y Mediación', 'Proceso de mediación para pensión alimentaria. En espera de respuesta de la contraparte.',
    (SELECT id_nucleo FROM nucleos WHERE nombre_nucleo = 'UCAB Caracas' LIMIT 1),
    'V-23456789',
    al.id_materia, al.num_categoria, al.num_subcategoria, al.num_ambito_legal
FROM ambitos_legales al
WHERE al.nombre_ambito_legal = 'Obligación de Manutención/Convivencia Familiar'
  AND al.id_materia = 1 AND al.num_categoria = 1 AND al.num_subcategoria = 2
LIMIT 1;

-- Caso 3: Redacción de documentos - Compra-venta de bienes inmuebles (Civil -> Contratos)
INSERT INTO casos (
    fecha_inicio_caso, fecha_fin_caso, tramite, observaciones,
    id_nucleo, cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal
)
SELECT 
    '2024-03-05'::DATE, NULL, 'Redacción documentos y/o convenio', 'Redacción de contrato de compra-venta. Pendiente revisión.',
    (SELECT id_nucleo FROM nucleos WHERE nombre_nucleo = 'UCAB Guayana' LIMIT 1),
    'V-34567890',
    al.id_materia, al.num_categoria, al.num_subcategoria, al.num_ambito_legal
FROM ambitos_legales al
WHERE al.nombre_ambito_legal = 'Compra-venta de bienes inmuebles'
  AND al.id_materia = 1 AND al.num_categoria = 0 AND al.num_subcategoria = 3
LIMIT 1;

-- Caso 4: Asistencia Judicial - Calificación de Despido (Laboral)
INSERT INTO casos (
    fecha_inicio_caso, fecha_fin_caso, tramite, observaciones,
    id_nucleo, cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal
)
SELECT 
    '2024-04-10'::DATE, NULL, 'Asistencia Judicial - Casos externos', 'Acompañamiento en audiencia de conciliación laboral.',
    (SELECT id_nucleo FROM nucleos WHERE nombre_nucleo = 'UCAB Caracas' LIMIT 1),
    'V-45678901',
    al.id_materia, al.num_categoria, al.num_subcategoria, al.num_ambito_legal
FROM ambitos_legales al
WHERE al.nombre_ambito_legal = 'Calificación de Despido'
  AND al.id_materia = 3 AND al.num_categoria = 0 AND al.num_subcategoria = 0
LIMIT 1;

-- Caso 5: Caso archivado - Rectificación de Actas (Civil -> Personas)
INSERT INTO casos (
    fecha_inicio_caso, fecha_fin_caso, tramite, observaciones,
    id_nucleo, cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal
)
SELECT 
    '2023-12-01'::DATE, '2024-01-30'::DATE, 'Asesoría', 'Caso resuelto. Cliente satisfecho con la asesoría proporcionada.',
    (SELECT id_nucleo FROM nucleos WHERE nombre_nucleo = 'UCAB Guayana' LIMIT 1),
    'V-12345678',
    al.id_materia, al.num_categoria, al.num_subcategoria, al.num_ambito_legal
FROM ambitos_legales al
WHERE al.nombre_ambito_legal = 'Rectificación de Actas'
  AND al.id_materia = 1 AND al.num_categoria = 0 AND al.num_subcategoria = 1
LIMIT 1;

-- ==========================================================
-- 23. CITAS (Depende de casos)
-- ==========================================================
-- Usamos subconsultas directas para obtener los IDs de los casos
-- Solo insertamos si el caso existe (id_caso no es NULL)
INSERT INTO citas (num_cita, id_caso, fecha_proxima_cita, fecha_encuentro, orientacion)
SELECT 
    1, 
    c.id_caso,
    '2025-12-17', 
    '2025-12-10', 
    'Primera consulta. Se explicaron los pasos del proceso de divorcio. Cliente debe traer documentación.'
FROM casos c
WHERE c.cedula = 'V-12345678' AND c.fecha_inicio_caso = '2024-01-15' AND c.fecha_fin_caso IS NULL
LIMIT 1
ON CONFLICT (num_cita, id_caso) DO UPDATE
SET fecha_proxima_cita = EXCLUDED.fecha_proxima_cita,
    fecha_encuentro = EXCLUDED.fecha_encuentro,
    orientacion = EXCLUDED.orientacion;

INSERT INTO citas (num_cita, id_caso, fecha_proxima_cita, fecha_encuentro, orientacion)
SELECT 
    2, 
    c.id_caso,
    '2025-12-24', 
    '2025-12-17', 
    'Revisión de documentación. Pendiente certificado de matrimonio.'
FROM casos c
WHERE c.cedula = 'V-12345678' AND c.fecha_inicio_caso = '2024-01-15' AND c.fecha_fin_caso IS NULL
LIMIT 1
ON CONFLICT (num_cita, id_caso) DO UPDATE
SET fecha_proxima_cita = EXCLUDED.fecha_proxima_cita,
    fecha_encuentro = EXCLUDED.fecha_encuentro,
    orientacion = EXCLUDED.orientacion;

INSERT INTO citas (num_cita, id_caso, fecha_proxima_cita, fecha_encuentro, orientacion)
SELECT 
    1, 
    c.id_caso,
    '2025-12-18', 
    '2025-12-11', 
    'Inicio de proceso de mediación. Se contactará a la contraparte.'
FROM casos c
WHERE c.cedula = 'V-23456789' AND c.fecha_inicio_caso = '2024-02-20'
LIMIT 1
ON CONFLICT (num_cita, id_caso) DO UPDATE
SET fecha_proxima_cita = EXCLUDED.fecha_proxima_cita,
    fecha_encuentro = EXCLUDED.fecha_encuentro,
    orientacion = EXCLUDED.orientacion;

INSERT INTO citas (num_cita, id_caso, fecha_proxima_cita, fecha_encuentro, orientacion)
SELECT 
    2, 
    c.id_caso,
    '2025-12-25', 
    '2025-12-18', 
    'Seguimiento. Esperando respuesta de la contraparte.'
FROM casos c
WHERE c.cedula = 'V-23456789' AND c.fecha_inicio_caso = '2024-02-20'
LIMIT 1
ON CONFLICT (num_cita, id_caso) DO UPDATE
SET fecha_proxima_cita = EXCLUDED.fecha_proxima_cita,
    fecha_encuentro = EXCLUDED.fecha_encuentro,
    orientacion = EXCLUDED.orientacion;

INSERT INTO citas (num_cita, id_caso, fecha_proxima_cita, fecha_encuentro, orientacion)
SELECT 
    1, 
    c.id_caso,
    '2025-12-19', 
    '2025-12-12', 
    'Revisión de documentos para convenio. Pendiente firma de ambas partes.'
FROM casos c
WHERE c.cedula = 'V-34567890' AND c.fecha_inicio_caso = '2024-03-05'
LIMIT 1
ON CONFLICT (num_cita, id_caso) DO UPDATE
SET fecha_proxima_cita = EXCLUDED.fecha_proxima_cita,
    fecha_encuentro = EXCLUDED.fecha_encuentro,
    orientacion = EXCLUDED.orientacion;

INSERT INTO citas (num_cita, id_caso, fecha_proxima_cita, fecha_encuentro, orientacion)
SELECT 
    1, 
    c.id_caso,
    '2025-12-20', 
    '2025-12-13', 
    'Preparación para audiencia. Revisión de documentos laborales.'
FROM casos c
WHERE c.cedula = 'V-45678901' AND c.fecha_inicio_caso = '2024-04-10'
LIMIT 1
ON CONFLICT (num_cita, id_caso) DO UPDATE
SET fecha_proxima_cita = EXCLUDED.fecha_proxima_cita,
    fecha_encuentro = EXCLUDED.fecha_encuentro,
    orientacion = EXCLUDED.orientacion;

INSERT INTO citas (num_cita, id_caso, fecha_proxima_cita, fecha_encuentro, orientacion)
SELECT 
    1, 
    c.id_caso,
    NULL, 
    '2023-12-05', 
    'Consulta inicial. Caso resuelto satisfactoriamente.'
FROM casos c
WHERE c.cedula = 'V-12345678' AND c.fecha_inicio_caso = '2023-12-01'
LIMIT 1
ON CONFLICT (num_cita, id_caso) DO UPDATE
SET fecha_proxima_cita = EXCLUDED.fecha_proxima_cita,
    fecha_encuentro = EXCLUDED.fecha_encuentro,
    orientacion = EXCLUDED.orientacion;

-- ==========================================================
-- 24. ATIENDEN (Depende de citas y usuarios)
-- ==========================================================
-- Usamos JOIN con casos y citas para asegurar que existan
INSERT INTO atienden (id_usuario, num_cita, id_caso, fecha_registro)
SELECT 'V-11111111', 1, c.id_caso, '2025-12-10'
FROM casos c
INNER JOIN citas ci ON c.id_caso = ci.id_caso AND ci.num_cita = 1
WHERE c.cedula = 'V-12345678' AND c.fecha_inicio_caso = '2024-01-15' AND c.fecha_fin_caso IS NULL
LIMIT 1
ON CONFLICT (num_cita, id_caso, id_usuario) DO UPDATE
SET fecha_registro = EXCLUDED.fecha_registro;

INSERT INTO atienden (id_usuario, num_cita, id_caso, fecha_registro)
SELECT 'V-44444444', 1, c.id_caso, '2025-12-10'
FROM casos c
INNER JOIN citas ci ON c.id_caso = ci.id_caso AND ci.num_cita = 1
WHERE c.cedula = 'V-12345678' AND c.fecha_inicio_caso = '2024-01-15' AND c.fecha_fin_caso IS NULL
LIMIT 1
ON CONFLICT (num_cita, id_caso, id_usuario) DO UPDATE
SET fecha_registro = EXCLUDED.fecha_registro;

INSERT INTO atienden (id_usuario, num_cita, id_caso, fecha_registro)
SELECT 'V-11111111', 2, c.id_caso, '2025-12-17'
FROM casos c
INNER JOIN citas ci ON c.id_caso = ci.id_caso AND ci.num_cita = 2
WHERE c.cedula = 'V-12345678' AND c.fecha_inicio_caso = '2024-01-15' AND c.fecha_fin_caso IS NULL
LIMIT 1
ON CONFLICT (num_cita, id_caso, id_usuario) DO UPDATE
SET fecha_registro = EXCLUDED.fecha_registro;

INSERT INTO atienden (id_usuario, num_cita, id_caso, fecha_registro)
SELECT 'V-22222222', 1, c.id_caso, '2025-12-11'
FROM casos c
INNER JOIN citas ci ON c.id_caso = ci.id_caso AND ci.num_cita = 1
WHERE c.cedula = 'V-23456789' AND c.fecha_inicio_caso = '2024-02-20'
LIMIT 1
ON CONFLICT (num_cita, id_caso, id_usuario) DO UPDATE
SET fecha_registro = EXCLUDED.fecha_registro;

INSERT INTO atienden (id_usuario, num_cita, id_caso, fecha_registro)
SELECT 'V-55555555', 1, c.id_caso, '2025-12-11'
FROM casos c
INNER JOIN citas ci ON c.id_caso = ci.id_caso AND ci.num_cita = 1
WHERE c.cedula = 'V-23456789' AND c.fecha_inicio_caso = '2024-02-20'
LIMIT 1
ON CONFLICT (num_cita, id_caso, id_usuario) DO UPDATE
SET fecha_registro = EXCLUDED.fecha_registro;

INSERT INTO atienden (id_usuario, num_cita, id_caso, fecha_registro)
SELECT 'V-22222222', 2, c.id_caso, '2025-12-18'
FROM casos c
INNER JOIN citas ci ON c.id_caso = ci.id_caso AND ci.num_cita = 2
WHERE c.cedula = 'V-23456789' AND c.fecha_inicio_caso = '2024-02-20'
LIMIT 1
ON CONFLICT (num_cita, id_caso, id_usuario) DO UPDATE
SET fecha_registro = EXCLUDED.fecha_registro;

INSERT INTO atienden (id_usuario, num_cita, id_caso, fecha_registro)
SELECT 'V-33333333', 1, c.id_caso, '2025-12-12'
FROM casos c
INNER JOIN citas ci ON c.id_caso = ci.id_caso AND ci.num_cita = 1
WHERE c.cedula = 'V-34567890' AND c.fecha_inicio_caso = '2024-03-05'
LIMIT 1
ON CONFLICT (num_cita, id_caso, id_usuario) DO UPDATE
SET fecha_registro = EXCLUDED.fecha_registro;

INSERT INTO atienden (id_usuario, num_cita, id_caso, fecha_registro)
SELECT 'V-66666666', 1, c.id_caso, '2025-12-12'
FROM casos c
INNER JOIN citas ci ON c.id_caso = ci.id_caso AND ci.num_cita = 1
WHERE c.cedula = 'V-34567890' AND c.fecha_inicio_caso = '2024-03-05'
LIMIT 1
ON CONFLICT (num_cita, id_caso, id_usuario) DO UPDATE
SET fecha_registro = EXCLUDED.fecha_registro;

INSERT INTO atienden (id_usuario, num_cita, id_caso, fecha_registro)
SELECT 'V-11111111', 1, c.id_caso, '2025-12-13'
FROM casos c
INNER JOIN citas ci ON c.id_caso = ci.id_caso AND ci.num_cita = 1
WHERE c.cedula = 'V-45678901' AND c.fecha_inicio_caso = '2024-04-10'
LIMIT 1
ON CONFLICT (num_cita, id_caso, id_usuario) DO UPDATE
SET fecha_registro = EXCLUDED.fecha_registro;

INSERT INTO atienden (id_usuario, num_cita, id_caso, fecha_registro)
SELECT 'V-44444444', 1, c.id_caso, '2025-12-13'
FROM casos c
INNER JOIN citas ci ON c.id_caso = ci.id_caso AND ci.num_cita = 1
WHERE c.cedula = 'V-45678901' AND c.fecha_inicio_caso = '2024-04-10'
LIMIT 1
ON CONFLICT (num_cita, id_caso, id_usuario) DO UPDATE
SET fecha_registro = EXCLUDED.fecha_registro;

INSERT INTO atienden (id_usuario, num_cita, id_caso, fecha_registro)
SELECT 'V-22222222', 1, c.id_caso, '2023-12-05'
FROM casos c
INNER JOIN citas ci ON c.id_caso = ci.id_caso AND ci.num_cita = 1
WHERE c.cedula = 'V-12345678' AND c.fecha_inicio_caso = '2023-12-01'
LIMIT 1
ON CONFLICT (num_cita, id_caso, id_usuario) DO UPDATE
SET fecha_registro = EXCLUDED.fecha_registro;

-- ==========================================================
-- 25. PROFESORES (Depende de usuarios y semestres)
-- ==========================================================
INSERT INTO profesores (term, cedula_profesor, tipo_profesor) VALUES
('2025-1', 'V-44444444', 'Asesor'),
('2025-1', 'V-55555555', 'Asesor'),
('2025-1', 'V-66666666', 'Voluntario')
ON CONFLICT (term, cedula_profesor) DO UPDATE
SET tipo_profesor = EXCLUDED.tipo_profesor;

-- ==========================================================
-- 26. ESTUDIANTES (Depende de usuarios y semestres)
-- ==========================================================
INSERT INTO estudiantes (term, cedula_estudiante, tipo_estudiante, nrc) VALUES
('2025-1', 'V-11111111', 'Inscrito', '12345'),
('2025-1', 'V-22222222', 'Inscrito', '12345'),
('2025-1', 'V-33333333', 'Voluntario', '12346')
ON CONFLICT (term, cedula_estudiante) DO UPDATE
SET tipo_estudiante = EXCLUDED.tipo_estudiante,
    nrc = EXCLUDED.nrc;

-- ==========================================================
-- 27. SUPERVISA (Asignación de Profesores a Casos)
-- ==========================================================
-- Caso 1: Divorcio contencioso - Asignado a Profesor González
INSERT INTO supervisa (term, cedula_profesor, id_caso, habilitado)
SELECT '2025-1', 'V-44444444', c.id_caso, TRUE
FROM casos c
WHERE c.cedula = 'V-12345678' AND c.fecha_inicio_caso = '2024-01-15' AND c.fecha_fin_caso IS NULL
LIMIT 1
ON CONFLICT (term, cedula_profesor, id_caso) DO UPDATE
SET habilitado = EXCLUDED.habilitado;

-- Caso 2: Obligación de Manutención - Asignado a Profesora Pérez
INSERT INTO supervisa (term, cedula_profesor, id_caso, habilitado)
SELECT '2025-1', 'V-55555555', c.id_caso, TRUE
FROM casos c
WHERE c.cedula = 'V-23456789' AND c.fecha_inicio_caso = '2024-02-20'
LIMIT 1
ON CONFLICT (term, cedula_profesor, id_caso) DO UPDATE
SET habilitado = EXCLUDED.habilitado;

-- Caso 3: Compra-venta de bienes inmuebles - Asignado a Profesor Sánchez
INSERT INTO supervisa (term, cedula_profesor, id_caso, habilitado)
SELECT '2025-1', 'V-66666666', c.id_caso, TRUE
FROM casos c
WHERE c.cedula = 'V-34567890' AND c.fecha_inicio_caso = '2024-03-05'
LIMIT 1
ON CONFLICT (term, cedula_profesor, id_caso) DO UPDATE
SET habilitado = EXCLUDED.habilitado;

-- Caso 4: Calificación de Despido - Asignado a Profesor González
INSERT INTO supervisa (term, cedula_profesor, id_caso, habilitado)
SELECT '2025-1', 'V-44444444', c.id_caso, TRUE
FROM casos c
WHERE c.cedula = 'V-45678901' AND c.fecha_inicio_caso = '2024-04-10'
LIMIT 1
ON CONFLICT (term, cedula_profesor, id_caso) DO UPDATE
SET habilitado = EXCLUDED.habilitado;

-- Caso 5: Rectificación de Actas (archivado) - Asignado a Profesora Pérez
INSERT INTO supervisa (term, cedula_profesor, id_caso, habilitado)
SELECT '2025-1', 'V-55555555', c.id_caso, TRUE
FROM casos c
WHERE c.cedula = 'V-12345678' AND c.fecha_inicio_caso = '2023-12-01' AND c.fecha_fin_caso = '2024-01-30'
LIMIT 1
ON CONFLICT (term, cedula_profesor, id_caso) DO UPDATE
SET habilitado = EXCLUDED.habilitado;

-- ==========================================================
-- 28. SE LE ASIGNA (Asignación de Estudiantes a Casos)
-- ==========================================================
-- Caso 1: Divorcio contencioso - Asignado a Ana Martínez y Carlos Rodríguez
INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, habilitado)
SELECT '2025-1', 'V-11111111', c.id_caso, TRUE
FROM casos c
WHERE c.cedula = 'V-12345678' AND c.fecha_inicio_caso = '2024-01-15' AND c.fecha_fin_caso IS NULL
LIMIT 1
ON CONFLICT (term, cedula_estudiante, id_caso) DO UPDATE
SET habilitado = EXCLUDED.habilitado;

INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, habilitado)
SELECT '2025-1', 'V-22222222', c.id_caso, TRUE
FROM casos c
WHERE c.cedula = 'V-12345678' AND c.fecha_inicio_caso = '2024-01-15' AND c.fecha_fin_caso IS NULL
LIMIT 1
ON CONFLICT (term, cedula_estudiante, id_caso) DO UPDATE
SET habilitado = EXCLUDED.habilitado;

-- Caso 2: Obligación de Manutención - Asignado a Carlos Rodríguez
INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, habilitado)
SELECT '2025-1', 'V-22222222', c.id_caso, TRUE
FROM casos c
WHERE c.cedula = 'V-23456789' AND c.fecha_inicio_caso = '2024-02-20'
LIMIT 1
ON CONFLICT (term, cedula_estudiante, id_caso) DO UPDATE
SET habilitado = EXCLUDED.habilitado;

-- Caso 3: Compra-venta de bienes inmuebles - Asignado a María Fernández
INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, habilitado)
SELECT '2025-1', 'V-33333333', c.id_caso, TRUE
FROM casos c
WHERE c.cedula = 'V-34567890' AND c.fecha_inicio_caso = '2024-03-05'
LIMIT 1
ON CONFLICT (term, cedula_estudiante, id_caso) DO UPDATE
SET habilitado = EXCLUDED.habilitado;

-- Caso 4: Calificación de Despido - Asignado a Ana Martínez
INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, habilitado)
SELECT '2025-1', 'V-11111111', c.id_caso, TRUE
FROM casos c
WHERE c.cedula = 'V-45678901' AND c.fecha_inicio_caso = '2024-04-10'
LIMIT 1
ON CONFLICT (term, cedula_estudiante, id_caso) DO UPDATE
SET habilitado = EXCLUDED.habilitado;

-- Caso 5: Rectificación de Actas (archivado) - Asignado a Carlos Rodríguez
INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, habilitado)
SELECT '2025-1', 'V-22222222', c.id_caso, TRUE
FROM casos c
WHERE c.cedula = 'V-12345678' AND c.fecha_inicio_caso = '2023-12-01' AND c.fecha_fin_caso = '2024-01-30'
LIMIT 1
ON CONFLICT (term, cedula_estudiante, id_caso) DO UPDATE
SET habilitado = EXCLUDED.habilitado;

COMMIT;

-- ==========================================================
-- EXTRA: AGREGAR NUEVO PROFESOR Y SUPERVISIÓN A CASO ARCHIVADO
-- ==========================================================
-- 1. Insertar usuario profesor (si no existe)
INSERT INTO usuarios (
    cedula, nombres, apellidos, correo_electronico, nombre_usuario, 
    contrasena, telefono_celular, habilitado_sistema, tipo_usuario
) VALUES (
    'V-88888888', 'Nuevo', 'Profesor', 'nuevo.profesor@ucab.edu.ve', 'nuevo.profesor',
    '$2b$10$sV6rtquZ.uUT2RKkp.Gw/uNIj7qoYjPUwfYdek1tuvbNcBQ3ByYn2', '0412-8888888', TRUE, 'Profesor'
) ON CONFLICT (cedula) DO UPDATE
SET nombres = EXCLUDED.nombres,
    apellidos = EXCLUDED.apellidos,
    correo_electronico = EXCLUDED.correo_electronico,
    nombre_usuario = EXCLUDED.nombre_usuario,
    contrasena = EXCLUDED.contrasena;

-- 2. Insertar en profesores (si no existe)
INSERT INTO profesores (term, cedula_profesor, tipo_profesor) VALUES
('2025-1', 'V-88888888', 'Voluntario')
ON CONFLICT (term, cedula_profesor) DO UPDATE
SET tipo_profesor = EXCLUDED.tipo_profesor;

-- 3. Asignar supervisión al caso archivado (Rectificación de Actas)
INSERT INTO supervisa (term, cedula_profesor, id_caso, habilitado)
SELECT '2025-1', 'V-88888888', c.id_caso, TRUE
FROM casos c
WHERE c.cedula = 'V-12345678' AND c.fecha_inicio_caso = '2023-12-01' AND c.fecha_fin_caso = '2024-01-30'
LIMIT 1
ON CONFLICT (term, cedula_profesor, id_caso) DO UPDATE
SET habilitado = EXCLUDED.habilitado;
-- ==========================================================
-- FIN DEL SCRIPT
-- ==========================================================
-- Si llegaste aquí, todos los datos se insertaron correctamente.
-- Si hubo algún error, la transacción se revirtió automáticamente.

-- ==========================================================
-- RESUMEN DE USUARIOS DE PRUEBA
-- ==========================================================
-- ⚠️ CONTRASEÑA PARA TODOS LOS USUARIOS: password123
--
-- ESTUDIANTES (tipo_usuario: Estudiante):
-- - ana.martinez@est.ucab.edu.ve / password123
-- - carlos.rodriguez@est.ucab.edu.ve / password123
-- - maria.fernandez@est.ucab.edu.ve / password123
--
-- PROFESORES (tipo_usuario: Profesor):
-- - profesor.gonzalez@ucab.edu.ve / password123
-- - laura.perez@ucab.edu.ve / password123
-- - roberto.sanchez@ucab.edu.ve / password123
--
-- COORDINADOR (tipo_usuario: Coordinador):
-- - coordinador@ucab.edu.ve / password123
--
-- ==========================================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- ==========================================================
-- Ejecuta estas consultas para verificar los datos:
-- 
-- SELECT COUNT(*) FROM estados;
-- SELECT COUNT(*) FROM municipios;
-- SELECT COUNT(*) FROM parroquias;
-- SELECT COUNT(*) FROM nucleos;
-- SELECT COUNT(*) FROM niveles_educativos;
-- SELECT COUNT(*) FROM condicion_trabajo;
-- SELECT COUNT(*) FROM condicion_actividad;
-- SELECT COUNT(*) FROM materias;
-- SELECT COUNT(*) FROM solicitantes;
-- SELECT COUNT(*) FROM viviendas;
-- SELECT COUNT(*) FROM familias_y_hogares;
-- SELECT COUNT(*) FROM casos;
-- SELECT COUNT(*) FROM citas;
-- SELECT COUNT(*) FROM atienden;
-- SELECT COUNT(*) FROM usuarios WHERE tipo_usuario = 'Estudiante';
-- SELECT COUNT(*) FROM usuarios WHERE tipo_usuario = 'Profesor';
-- SELECT COUNT(*) FROM usuarios WHERE tipo_usuario = 'Coordinador';
-- ==========================================================

