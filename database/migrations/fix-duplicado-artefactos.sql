-- ============================================================================
-- FIX: Eliminar triggers duplicados de artefactos
-- El trigger en solicitantes ya captura los artefactos correctamente
-- No necesitamos el trigger adicional en asignadas_a
-- ============================================================================

-- Eliminar los triggers de asignadas_a que causan duplicación
DROP TRIGGER IF EXISTS trigger_auditoria_artefactos_insert ON asignadas_a;
DROP TRIGGER IF EXISTS trigger_auditoria_artefactos_delete ON asignadas_a;
DROP TRIGGER IF EXISTS trigger_auditoria_cambio_artefactos ON asignadas_a;
DROP TRIGGER IF EXISTS trigger_auditoria_insert_artefacto ON asignadas_a;
DROP TRIGGER IF EXISTS trigger_auditoria_delete_artefacto ON asignadas_a;

-- También eliminar la función (CASCADE para eliminar dependencias)
DROP FUNCTION IF EXISTS trigger_auditoria_cambio_artefactos() CASCADE;

-- Limpiar registros duplicados existentes (opcional, mantiene solo el primero de cada grupo)
-- Esto elimina duplicados basándose en id_auditoria_solicitante, artefacto y estado
DELETE FROM auditoria_artefactos_domesticos a
USING auditoria_artefactos_domesticos b
WHERE a.id > b.id
  AND a.id_auditoria_solicitante = b.id_auditoria_solicitante
  AND a.artefacto = b.artefacto
  AND a.estado = b.estado;
