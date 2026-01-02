-- Obtener información de un soporte eliminado específico
-- Parámetros: $1 = id_caso, $2 = num_soporte
-- Nota: Los documentos eliminados no se guardan, solo sus metadatos
SELECT nombre_archivo, tipo_mime, tamano_bytes, motivo, fecha_eliminacion
FROM auditoria_eliminacion_soportes
WHERE id_caso = $1 AND num_soporte = $2
ORDER BY fecha_eliminacion DESC
LIMIT 1;
