-- Obtiene cédulas de usuarios (habilitados) que participan/atienden
-- casos donde también participa el usuario dado.
-- Usa únicamente: se_le_asigna.
-- Parámetros: $1 = cedula_usuario

WITH casos_del_usuario AS (
  SELECT DISTINCT sla.id_caso
  FROM se_le_asigna sla
  WHERE sla.cedula_estudiante = $1
    AND sla.habilitado = TRUE
)
SELECT DISTINCT sla2.cedula_estudiante AS cedula
FROM se_le_asigna sla2
INNER JOIN casos_del_usuario c ON c.id_caso = sla2.id_caso
INNER JOIN usuarios u ON u.cedula = sla2.cedula_estudiante
WHERE sla2.cedula_estudiante IS NOT NULL
  AND sla2.cedula_estudiante <> $1
  AND sla2.habilitado = TRUE
  AND u.habilitado_sistema = TRUE
ORDER BY sla2.cedula_estudiante;
