-- Obtener todos los casos donde el usuario está asignado (estudiante) o supervisa (profesor)
-- Usa un CTE para unificar los roles y evitar duplicación de lógica
-- Parámetros: $1 = cedula_usuario

WITH user_roles AS (
    -- Casos como estudiante
    SELECT id_caso, term, 'Asignado' AS rol_usuario
    FROM se_le_asigna
    WHERE cedula_estudiante = $1 AND habilitado = true
    
    UNION ALL
    
    -- Casos como profesor supervisor
    SELECT id_caso, term, 'Supervisor' AS rol_usuario
    FROM supervisa
    WHERE cedula_profesor = $1 AND habilitado = true
)
SELECT 
    vc.id_caso,
    vc.fecha_solicitud,
    vc.fecha_inicio_caso,
    vc.fecha_fin_caso,
    vc.tramite,
    vc.observaciones,
    vc.id_nucleo,
    vc.id_materia,
    vc.num_categoria,
    vc.num_subcategoria,
    vc.num_ambito_legal,
    vc.cant_beneficiarios,
    vc.cedula AS cedula_solicitante,
    vc.nombres_solicitante,
    vc.apellidos_solicitante,
    vc.nombre_completo_solicitante,
    vc.nombre_nucleo,
    TRIM(REGEXP_REPLACE(vc.nombre_materia, '^\s*Materia\s+', '', 'i')) AS nombre_materia,
    vc.nombre_categoria,
    vc.nombre_subcategoria,
    ur.rol_usuario,
    ur.term,
    vc.estatus,
    -- Obtenemos el nombre del profesor supervisor más reciente
    (
        SELECT u.nombres || ' ' || u.apellidos
        FROM supervisa s
        INNER JOIN usuarios u ON s.cedula_profesor = u.cedula
        INNER JOIN semestres sem ON s.term = sem.term
        WHERE s.id_caso = vc.id_caso AND s.habilitado = true
        ORDER BY sem.fecha_inicio DESC, s.term DESC
        LIMIT 1
    ) AS nombre_responsable
FROM user_roles ur
INNER JOIN view_casos_detalle vc ON ur.id_caso = vc.id_caso
ORDER BY vc.fecha_inicio_caso DESC, vc.id_caso DESC;
