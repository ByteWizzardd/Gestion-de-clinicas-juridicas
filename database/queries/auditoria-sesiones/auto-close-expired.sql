-- Auto-cierre de sesiones "zombie" (nunca cerradas) que ya expiraron.
UPDATE auditoria_eventos
SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'fecha_cierre', (fecha_evento + CAST($1 AS INTERVAL))
)
WHERE entidad = 'sesion'
  AND operacion = 'inicio_sesion'
  AND (metadata->>'fecha_cierre') IS NULL
  AND (fecha_evento + CAST($1 AS INTERVAL)) < (NOW() AT TIME ZONE 'America/Caracas');
