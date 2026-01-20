-- Migración: Índices para notificaciones
-- Mejora rendimiento de:
--  - Limpieza por antigüedad (fecha)
--  - Listado por receptor ordenado por fecha DESC

CREATE INDEX IF NOT EXISTS idx_notificaciones_fecha
  ON notificaciones (fecha);

CREATE INDEX IF NOT EXISTS idx_notificaciones_receptor_fecha
  ON notificaciones (cedula_receptor, fecha DESC);
