-- ============================================================
-- MIGRACIÓN: Crear tabla ejecutan y corregir tabla acciones
-- ============================================================
-- Esta migración:
-- 1. Crea la nueva tabla ejecutan
-- 2. Migra los datos de id_usuario_ejecuta y fecha_accion de acciones a ejecutan
-- 3. Elimina las columnas id_usuario_ejecuta y fecha_accion de acciones
-- ============================================================

-- Limpiar cualquier transacción abortada previa
ROLLBACK;

BEGIN;

-- ============================================================
-- 1. CREAR TABLA EJECUTAN
-- ============================================================
CREATE TABLE IF NOT EXISTS ejecutan (
    id_usuario_ejecuta VARCHAR(20) NOT NULL,
    num_accion INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    fecha_ejecucion DATE NOT NULL DEFAULT CURRENT_DATE,
    
    PRIMARY KEY (id_usuario_ejecuta, num_accion, id_caso),
    FOREIGN KEY (id_usuario_ejecuta) REFERENCES usuarios(cedula),
    FOREIGN KEY (num_accion, id_caso) REFERENCES acciones(num_accion, id_caso)
);

-- ============================================================
-- 2. MIGRAR DATOS DE ACCIONES A EJECUTAN
-- ============================================================
-- Migrar los datos existentes de id_usuario_ejecuta y fecha_accion
-- a la nueva tabla ejecutan
INSERT INTO ejecutan (id_usuario_ejecuta, num_accion, id_caso, fecha_ejecucion)
SELECT 
    id_usuario_ejecuta,
    num_accion,
    id_caso,
    fecha_accion
FROM acciones
WHERE id_usuario_ejecuta IS NOT NULL
ON CONFLICT DO NOTHING;

-- ============================================================
-- 3. ELIMINAR COLUMNAS DE ACCIONES
-- ============================================================
-- Eliminar las columnas id_usuario_ejecuta y fecha_accion de acciones
-- ya que ahora están en la tabla ejecutan

-- Primero eliminar la columna fecha_accion
ALTER TABLE acciones DROP COLUMN IF EXISTS fecha_accion;

-- Luego eliminar la columna id_usuario_ejecuta
ALTER TABLE acciones DROP COLUMN IF EXISTS id_usuario_ejecuta;

COMMIT;

-- ============================================================
-- FIN DE LA MIGRACIÓN
-- ============================================================

