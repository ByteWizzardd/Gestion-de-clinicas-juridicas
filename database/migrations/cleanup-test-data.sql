-- Migración: Limpiar todos los datos de prueba
-- Descripción: Elimina todos los datos insertados por el seed de prueba
-- IMPORTANTE: Esta migración elimina TODOS los datos de prueba.
-- Ejecuta con precaución.

-- Limpiar cualquier transacción abortada previa
ROLLBACK;

BEGIN;

-- ==========================================================
-- ELIMINAR DATOS EN ORDEN (de dependientes a principales)
-- ==========================================================

-- 1. Eliminar datos de tablas con foreign keys más profundas
DELETE FROM atienden;
DELETE FROM acciones;
DELETE FROM cambio_estatus;
DELETE FROM supervisa;
DELETE FROM se_le_asigna;
DELETE FROM beneficiarios;
DELETE FROM soportes;
DELETE FROM citas;
DELETE FROM casos;

-- 2. Eliminar datos de tablas intermedias
DELETE FROM familias_y_hogares;
DELETE FROM viviendas;
DELETE FROM coordinadores;
DELETE FROM estudiantes;
DELETE FROM profesores;

-- 3. Eliminar datos de tablas principales
DELETE FROM solicitantes;
DELETE FROM usuarios;

-- 4. Eliminar datos de catálogos (opcional - solo si quieres limpiar todo)
-- Descomenta estas líneas si también quieres eliminar los catálogos:
-- DELETE FROM ambitos_legales;
-- DELETE FROM subcategorias;
-- DELETE FROM categorias;
-- DELETE FROM materias;
-- DELETE FROM nucleos;
-- DELETE FROM parroquias;
-- DELETE FROM municipios;
-- DELETE FROM estados;
-- DELETE FROM niveles_educativos;
-- DELETE FROM condicion_trabajo;
-- DELETE FROM condicion_actividad;
-- DELETE FROM semestres;

COMMIT;

-- ==========================================================
-- VERIFICACIÓN
-- ==========================================================
-- Ejecuta estas consultas para verificar que los datos fueron eliminados:
-- 
-- SELECT COUNT(*) FROM usuarios;
-- SELECT COUNT(*) FROM solicitantes;
-- SELECT COUNT(*) FROM casos;
-- SELECT COUNT(*) FROM citas;
-- SELECT COUNT(*) FROM atienden;
-- 
-- Si todas devuelven 0, la limpieza fue exitosa.

