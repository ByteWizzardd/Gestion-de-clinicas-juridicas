-- Migración: Actualizar formato de cédulas a V-XXXX (con guión)
-- Descripción: Actualiza todas las cédulas en todas las tablas del formato VXXXX
--              al formato V-XXXX (con guión entre la letra y los números)
-- IMPORTANTE: Esta migración es idempotente y puede ejecutarse múltiples veces
-- 
-- ESTRATEGIA: Usar SET CONSTRAINTS ALL DEFERRED para diferir la validación
-- de foreign keys hasta el final de la transacción.

-- Limpiar cualquier transacción abortada previa
ROLLBACK;

BEGIN;

-- ==========================================================
-- DIFERIR VALIDACIÓN DE FOREIGN KEYS
-- ==========================================================
-- Intentamos diferir la validación de foreign keys hasta el final
-- de la transacción. Esto solo funciona si las constraints son DEFERRABLE.
SET CONSTRAINTS ALL DEFERRED;

-- ==========================================================
-- ACTUALIZAR TODAS LAS CÉDULAS DIRECTAMENTE
-- ==========================================================
-- Actualizamos primero las primary keys y luego las foreign keys.
-- Si las constraints están diferidas, esto debería funcionar.

-- Primary keys
UPDATE usuarios
SET cedula = 'V-' || SUBSTRING(cedula FROM 2)
WHERE cedula LIKE 'V%' AND cedula NOT LIKE 'V-%';

UPDATE solicitantes
SET cedula = 'V-' || SUBSTRING(cedula FROM 2)
WHERE cedula LIKE 'V%' AND cedula NOT LIKE 'V-%';

-- Foreign keys a usuarios
UPDATE atienden
SET id_usuario = 'V-' || SUBSTRING(id_usuario FROM 2)
WHERE id_usuario LIKE 'V%' AND id_usuario NOT LIKE 'V-%';

UPDATE coordinadores
SET id_coordinador = 'V-' || SUBSTRING(id_coordinador FROM 2)
WHERE id_coordinador LIKE 'V%' AND id_coordinador NOT LIKE 'V-%';

UPDATE profesores
SET cedula_profesor = 'V-' || SUBSTRING(cedula_profesor FROM 2)
WHERE cedula_profesor LIKE 'V%' AND cedula_profesor NOT LIKE 'V-%';

UPDATE estudiantes
SET cedula_estudiante = 'V-' || SUBSTRING(cedula_estudiante FROM 2)
WHERE cedula_estudiante LIKE 'V%' AND cedula_estudiante NOT LIKE 'V-%';

UPDATE supervisa
SET cedula_profesor = 'V-' || SUBSTRING(cedula_profesor FROM 2)
WHERE cedula_profesor LIKE 'V%' AND cedula_profesor NOT LIKE 'V-%';

UPDATE se_le_asigna
SET cedula_estudiante = 'V-' || SUBSTRING(cedula_estudiante FROM 2)
WHERE cedula_estudiante LIKE 'V%' AND cedula_estudiante NOT LIKE 'V-%';

UPDATE acciones
SET cedula_usuario_registra = 'V-' || SUBSTRING(cedula_usuario_registra FROM 2)
WHERE cedula_usuario_registra LIKE 'V%' AND cedula_usuario_registra NOT LIKE 'V-%';

UPDATE acciones
SET cedula_usuario_ejecuta = 'V-' || SUBSTRING(cedula_usuario_ejecuta FROM 2)
WHERE cedula_usuario_ejecuta LIKE 'V%' AND cedula_usuario_ejecuta NOT LIKE 'V-%';

UPDATE cambio_estatus
SET id_usuario_cambia = 'V-' || SUBSTRING(id_usuario_cambia FROM 2)
WHERE id_usuario_cambia LIKE 'V%' AND id_usuario_cambia NOT LIKE 'V-%';

-- Foreign keys a solicitantes
UPDATE casos
SET cedula = 'V-' || SUBSTRING(cedula FROM 2)
WHERE cedula LIKE 'V%' AND cedula NOT LIKE 'V-%';

UPDATE viviendas
SET cedula_solicitante = 'V-' || SUBSTRING(cedula_solicitante FROM 2)
WHERE cedula_solicitante LIKE 'V%' AND cedula_solicitante NOT LIKE 'V-%';

UPDATE familias_y_hogares
SET cedula_solicitante = 'V-' || SUBSTRING(cedula_solicitante FROM 2)
WHERE cedula_solicitante LIKE 'V%' AND cedula_solicitante NOT LIKE 'V-%';

UPDATE beneficiarios
SET cedula = 'V-' || SUBSTRING(cedula FROM 2)
WHERE cedula LIKE 'V%' AND cedula NOT LIKE 'V-%' AND cedula IS NOT NULL;

COMMIT;

-- ==========================================================
-- VERIFICACIÓN
-- ==========================================================
-- Ejecuta estas consultas para verificar que todas las cédulas
-- tienen el formato correcto:
-- 
-- SELECT cedula FROM usuarios WHERE cedula NOT LIKE 'V-%' AND cedula LIKE 'V%';
-- SELECT cedula FROM solicitantes WHERE cedula NOT LIKE 'V-%' AND cedula LIKE 'V%';
-- SELECT id_coordinador FROM coordinadores WHERE id_coordinador NOT LIKE 'V-%' AND id_coordinador LIKE 'V%';
-- SELECT cedula_profesor FROM profesores WHERE cedula_profesor NOT LIKE 'V-%' AND cedula_profesor LIKE 'V%';
-- SELECT cedula_estudiante FROM estudiantes WHERE cedula_estudiante NOT LIKE 'V-%' AND cedula_estudiante LIKE 'V%';
-- SELECT cedula FROM casos WHERE cedula NOT LIKE 'V-%' AND cedula LIKE 'V%';
-- SELECT id_usuario FROM atienden WHERE id_usuario NOT LIKE 'V-%' AND id_usuario LIKE 'V%';
-- 
-- Si todas las consultas devuelven 0 filas, la migración fue exitosa.

