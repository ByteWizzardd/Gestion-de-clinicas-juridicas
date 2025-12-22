-- Crear un nuevo registro de atiende
-- Parámetros:
-- $1 = id_usuario (cedula del usuario que atiende)
-- $2 = num_cita
-- $3 = id_caso
-- $4 = fecha_registro (opcional, por defecto CURRENT_DATE)

INSERT INTO atienden (
    id_usuario,
    num_cita,
    id_caso,
    fecha_registro
) VALUES (
    $1,
    $2,
    $3,
    COALESCE($4, CURRENT_DATE)
)
RETURNING *;

