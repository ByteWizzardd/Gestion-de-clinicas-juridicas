-- Obtener notificaciones por cédula de receptor, ordenadas por fecha descendente
SELECT *
FROM notificaciones
WHERE cedula_receptor = $1
ORDER BY fecha DESC;
