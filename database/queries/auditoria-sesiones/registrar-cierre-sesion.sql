-- Cierra una sesión (logout) marcando fecha_cierre dentro de metadata.
UPDATE auditoria_eventos
SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'fecha_cierre', (NOW() AT TIME ZONE 'America/Caracas')
)
WHERE id = $1
  AND entidad = 'sesion'
  AND (metadata->>'fecha_cierre') IS NULL;
