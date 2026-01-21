-- Obtener casos por rango de fecha de solicitud
-- $1 = fecha_inicio (YYYY-MM-DD) o NULL
-- $2 = fecha_fin (YYYY-MM-DD) o NULL
-- Incluye profesor responsable activo 
SELECT 
		vc.id_caso,
		vc.fecha_inicio_caso,
		vc.fecha_fin_caso,
		vc.fecha_solicitud,
		vc.tramite,
		vc.estatus,
		vc.cant_beneficiarios,
		vc.observaciones,
		vc.id_nucleo,
		vc.id_materia,
		vc.num_categoria,
		vc.num_subcategoria,
		vc.num_ambito_legal,
		vc.cedula,
		vc.nombres_solicitante,
		vc.apellidos_solicitante,
		vc.nombre_completo_solicitante,
		vc.nombre_nucleo,
		TRIM(REGEXP_REPLACE(vc.nombre_materia, '^\s*Materia\s+', '', 'i')) AS nombre_materia,
		vc.nombre_categoria,
		vc.nombre_subcategoria,
		vc.nombre_subcategoria,
		-- Obtenemos el nombre del profesor supervisor más reciente mediante subconsulta
		(
				SELECT 
						u.nombres || ' ' || u.apellidos
				FROM supervisa s
				INNER JOIN profesores p ON s.term = p.term AND s.cedula_profesor = p.cedula_profesor
				INNER JOIN usuarios u ON p.cedula_profesor = u.cedula
				INNER JOIN semestres sem ON p.term = sem.term
				WHERE s.id_caso = vc.id_caso
					AND s.habilitado = true
				ORDER BY sem.fecha_inicio DESC, s.term DESC
				LIMIT 1
		) AS nombre_responsable
FROM view_casos_detalle vc
WHERE ($1::date IS NULL OR vc.fecha_solicitud >= $1::date)
	AND ($2::date IS NULL OR vc.fecha_solicitud <= $2::date)
ORDER BY vc.id_caso DESC;