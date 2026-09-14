-- =============================================================================
-- Filtro de fechas de reportes: actividad del caso dentro del rango
-- =============================================================================
-- Antes (commit 8e8563c) un caso entraba en un rango de fechas si tenía
-- actividad en algún SEMESTRE que se cruzara con el rango: "Hoy" o "última
-- semana" devolvían todos los casos del semestre en curso y "10-20 dic 2025"
-- los 15 casos de 2025-25, aunque ninguno tuviera movimiento esos días.
--
-- Ahora un caso entra si tiene actividad fechada dentro del rango: inicio del
-- caso, citas, acciones, ejecución de acciones, cambios de estatus o soportes
-- consignados. Se mantiene la idea de "casos que ocurrieron en el periodo",
-- con precisión de día. El filtro de semestre (ocurren_en) no cambia.
--
-- Los reportes (database/queries/**) llaman a esta función en lugar de repetir
-- la lógica. Idempotente: CREATE OR REPLACE.
-- =============================================================================

CREATE OR REPLACE FUNCTION caso_con_actividad_en_rango(p_id_caso INTEGER, p_inicio DATE, p_fin DATE)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
    SELECT (p_inicio IS NULL AND p_fin IS NULL) OR EXISTS (
        SELECT 1
        FROM (
            SELECT fecha_inicio_caso AS fecha FROM casos WHERE id_caso = p_id_caso
            UNION ALL SELECT fecha_encuentro FROM citas WHERE id_caso = p_id_caso
            UNION ALL SELECT fecha_registro FROM acciones WHERE id_caso = p_id_caso
            UNION ALL SELECT fecha_ejecucion FROM ejecutan WHERE id_caso = p_id_caso
            UNION ALL SELECT fecha FROM cambio_estatus WHERE id_caso = p_id_caso
            UNION ALL SELECT fecha_consignacion::date FROM soportes WHERE id_caso = p_id_caso
        ) actividad
        WHERE (p_inicio IS NULL OR actividad.fecha >= p_inicio)
          AND (p_fin IS NULL OR actividad.fecha <= p_fin)
    );
$$;
