-- Obtener citas para recordatorios (por días de anticipación)
-- Parámetros:
--   $1 = daysAhead (int). Ej: 1 => mañana
--
-- "cita-{num_cita}-{id_caso}-{fecha_encuentro_ms}"

SELECT
    CONCAT(
        'cita-',
        c.num_cita,
        '-',
        c.id_caso,
        '-',
        (EXTRACT(EPOCH FROM c.fecha_encuentro) * 1000)::BIGINT
    ) AS appointment_id,
    c.num_cita,
    c.id_caso,
    c.fecha_encuentro::DATE AS fecha,
    COALESCE(
        ARRAY_AGG(a.id_usuario) FILTER (WHERE a.id_usuario IS NOT NULL),
        ARRAY[]::TEXT[]
    ) AS usuarios_atienden
FROM citas c
LEFT JOIN atienden a
    ON a.num_cita = c.num_cita
 AND a.id_caso = c.id_caso
WHERE c.fecha_encuentro::DATE = (CURRENT_DATE + $1::INT)
GROUP BY c.num_cita, c.id_caso, c.fecha_encuentro;