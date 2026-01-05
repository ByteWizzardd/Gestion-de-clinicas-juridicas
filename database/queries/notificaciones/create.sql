-- Crear la notificación para un usuario específico
INSERT INTO notificaciones (cedula_receptor, cedula_emisor, titulo, mensaje)
VALUES ($1, $2, $3, $4);