-- Crear una nueva cita (consulta lista para el backend)
-- Parámetros: $1 = id_caso, $2 = fecha_encuentro, $3 = fecha_proxima_cita, $4 = orientacion, $5 = id_usuario_registro
INSERT INTO citas (id_caso, num_cita, fecha_encuentro, fecha_proxima_cita, orientacion, id_usuario_registro)
VALUES ($1::INTEGER, obtener_siguiente_num_cita($1::INTEGER), $2, $3, $4, $5)
RETURNING num_cita, id_caso;