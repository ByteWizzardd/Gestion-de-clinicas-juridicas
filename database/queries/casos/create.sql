-- Crear un nuevo caso
-- Parámetros: 
--   $1 = tramite
--   $2 = observaciones (opcional)
--   $3 = cedula (del solicitante)
--   $4 = id_nucleo
--   $5 = id_materia
--   $6 = num_categoria
--   $7 = num_subcategoria
--   $8 = num_ambito_legal
--   $9 = fecha_solicitud (si es NULL, se usa CURRENT_DATE)
--   $10 = fecha_inicio_caso
-- Nota: La variable de sesión app.usuario_registra debe estar establecida antes de ejecutar este query
INSERT INTO casos (
    tramite,
    observaciones,
    cedula,
    id_nucleo,
    id_materia,
    num_categoria,
    num_subcategoria,
    num_ambito_legal,
    fecha_solicitud,
    fecha_inicio_caso
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, CURRENT_DATE), $10)
RETURNING *;

