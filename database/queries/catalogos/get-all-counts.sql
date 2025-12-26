-- Get counts for all catalog types
SELECT 
    (SELECT COUNT(*) FROM materias) as materias,
    (SELECT COUNT(*) FROM categorias) as categorias,
    (SELECT COUNT(*) FROM subcategorias) as subcategorias,
    (SELECT COUNT(*) FROM ambitos_legales) as ambitos_legales,
    (SELECT COUNT(*) FROM tipo_caracteristicas) as tipos_caracteristicas,
    (SELECT COUNT(*) FROM caracteristicas) as caracteristicas,
    (SELECT COUNT(*) FROM estados) as estados,
    (SELECT COUNT(*) FROM municipios) as municipios,
    (SELECT COUNT(*) FROM parroquias) as parroquias,
    (SELECT COUNT(*) FROM semestres) as semestres,
    (SELECT COUNT(*) FROM nucleos) as nucleos,
    (SELECT COUNT(*) FROM condicion_trabajo) as condiciones_trabajo,
    (SELECT COUNT(*) FROM condicion_actividad) as condiciones_actividad;
