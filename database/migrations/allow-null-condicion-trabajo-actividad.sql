-- ==========================================================
-- MIGRACIÓN: Permitir NULL en id_trabajo e id_actividad en solicitantes
-- ==========================================================
-- Descripción: Permite que un solicitante no tenga condición de trabajo
--              ni condición de actividad (ambos pueden ser NULL)
-- ==========================================================

-- Limpiar cualquier transacción abortada previa
ROLLBACK;

-- Iniciar nueva transacción
BEGIN;

-- Permitir NULL en id_trabajo
ALTER TABLE solicitantes
ALTER COLUMN id_trabajo DROP NOT NULL;

-- Permitir NULL en id_actividad
ALTER TABLE solicitantes
ALTER COLUMN id_actividad DROP NOT NULL;

-- Finalizar transacción
COMMIT;

