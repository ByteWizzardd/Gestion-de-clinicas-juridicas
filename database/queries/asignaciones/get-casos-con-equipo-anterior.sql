-- Casos "En proceso" con equipo activo (habilitado=true) de semestres anteriores.
-- Parámetro: $1 = term del semestre más reciente
WITH ultimo_estatus AS (
    SELECT DISTINCT ON (id_caso) id_caso, nuevo_estatus
    FROM cambio_estatus
    ORDER BY id_caso, num_cambio DESC
)
SELECT
    c.id_caso,
    s.nombres || ' ' || s.apellidos AS nombre_solicitante,
    'profesor'                        AS tipo_miembro,
    u.nombres || ' ' || u.apellidos  AS nombre_miembro,
    sup.cedula_profesor               AS cedula_miembro,
    sup.term                          AS term_asignacion
FROM casos c
JOIN solicitantes s   ON s.cedula = c.cedula
JOIN ultimo_estatus e ON e.id_caso = c.id_caso AND e.nuevo_estatus = 'En proceso'
JOIN supervisa sup    ON sup.id_caso = c.id_caso AND sup.habilitado = true AND sup.term != $1
JOIN usuarios u       ON u.cedula = sup.cedula_profesor

UNION ALL

SELECT
    c.id_caso,
    s.nombres || ' ' || s.apellidos AS nombre_solicitante,
    'estudiante'                     AS tipo_miembro,
    u.nombres || ' ' || u.apellidos AS nombre_miembro,
    sla.cedula_estudiante            AS cedula_miembro,
    sla.term                         AS term_asignacion
FROM casos c
JOIN solicitantes s   ON s.cedula = c.cedula
JOIN ultimo_estatus e ON e.id_caso = c.id_caso AND e.nuevo_estatus = 'En proceso'
JOIN se_le_asigna sla ON sla.id_caso = c.id_caso AND sla.habilitado = true AND sla.term != $1
JOIN usuarios u        ON u.cedula = sla.cedula_estudiante

ORDER BY id_caso, tipo_miembro, nombre_miembro;
