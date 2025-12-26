-- Crear una nueva cita (consulta lista para el backend)
INSERT INTO citas (id_caso, num_cita, fecha_encuentro, fecha_proxima_cita, orientacion)
VALUES ($1::INTEGER, obtener_siguiente_num_cita($1::INTEGER), $2, $3, $4)
RETURNING num_cita, id_caso;