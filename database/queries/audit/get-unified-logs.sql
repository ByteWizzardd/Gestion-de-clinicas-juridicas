-- Obtener logs unificados de auditoría con paginación
-- Devuelve campos crudos (entidad/operacion/id_entidad) para que el frontend
-- genérico pueda buscar la config de la entidad y armar el diff, en vez de
-- strings ya formateados en español.
--
-- Sesiones, reportes y descargas de soportes viven en auditoria_eventos
-- (entidad='sesion'|'reporte'|'soporte') desde la migración
-- 20260910_120000_unificar_sesiones_reportes_soportes_en_auditoria_eventos.sql —
-- ya no hace falta el UNION ALL contra sus tablas viejas.
SELECT
    t.id::text as id,
    t.id_transaccion::text as id_transaccion,
    t.entidad as entidad,
    t.operacion as operacion,
    t.id_entidad as id_entidad,
    t.fecha_evento as fecha,
    t.id_usuario as usuario_id,
    COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario), t.id_usuario) as usuario_nombre,
    -- Para eventos de 'caso', resolver el nombre del solicitante (columna
    -- `cedula` cruda en datos_nuevos/datos_anteriores) — el frontend no
    -- puede hacer este JOIN por su cuenta. Usado para la tarjeta de
    -- creación/eliminación (un solo nombre) y, por separado más abajo, para
    -- el diff de actualización cuando la cédula misma cambia.
    (CASE WHEN t.entidad = 'caso' THEN
        (SELECT nombres || ' ' || apellidos FROM solicitantes
         WHERE cedula = COALESCE(t.datos_nuevos->>'cedula', t.datos_anteriores->>'cedula'))
    END) as solicitante_nombre,
    (CASE WHEN t.entidad = 'caso' AND (t.datos_anteriores ? 'cedula') THEN
        (SELECT nombres || ' ' || apellidos FROM solicitantes WHERE cedula = t.datos_anteriores->>'cedula')
    END) as nombre_solicitante_anterior,
    (CASE WHEN t.entidad = 'caso' AND (t.datos_nuevos ? 'cedula') THEN
        (SELECT nombres || ' ' || apellidos FROM solicitantes WHERE cedula = t.datos_nuevos->>'cedula')
    END) as nombre_solicitante_nuevo,
    -- Para actualizaciones de 'caso' que cambian núcleo/materia/categoría/
    -- subcategoría/ámbito legal, el diff solo trae el id crudo (id_nucleo,
    -- id_materia, num_categoria...) — resolver nombres. Categoría,
    -- subcategoría y ámbito legal usan claves compuestas; las partes que no
    -- cambiaron no están en el diff, así que se completan con el valor
    -- vigente en `casos` (join por id_entidad).
    (CASE WHEN t.entidad = 'caso' AND (t.datos_anteriores ? 'id_nucleo') THEN
        (SELECT nombre_nucleo FROM nucleos WHERE id_nucleo = (t.datos_anteriores->>'id_nucleo')::int)
    END) as nombre_nucleo_anterior,
    (CASE WHEN t.entidad = 'caso' AND (t.datos_nuevos ? 'id_nucleo') THEN
        (SELECT nombre_nucleo FROM nucleos WHERE id_nucleo = (t.datos_nuevos->>'id_nucleo')::int)
    END) as nombre_nucleo_nuevo,
    (CASE WHEN t.entidad = 'caso' AND (t.datos_anteriores ? 'id_materia') THEN
        (SELECT nombre_materia FROM materias WHERE id_materia = (t.datos_anteriores->>'id_materia')::int)
    END) as nombre_materia_anterior,
    (CASE WHEN t.entidad = 'caso' AND (t.datos_nuevos ? 'id_materia') THEN
        (SELECT nombre_materia FROM materias WHERE id_materia = (t.datos_nuevos->>'id_materia')::int)
    END) as nombre_materia_nuevo,
    (CASE WHEN t.entidad = 'caso' AND (t.datos_anteriores ? 'num_categoria' OR t.datos_anteriores ? 'id_materia') THEN
        (SELECT cat.nombre_categoria
         FROM categorias cat
         LEFT JOIN casos c ON c.id_caso = t.id_entidad::int
         WHERE cat.id_materia = COALESCE((t.datos_anteriores->>'id_materia')::int, c.id_materia)
           AND cat.num_categoria = COALESCE((t.datos_anteriores->>'num_categoria')::int, c.num_categoria))
    END) as nombre_categoria_anterior,
    (CASE WHEN t.entidad = 'caso' AND (t.datos_nuevos ? 'num_categoria' OR t.datos_nuevos ? 'id_materia') THEN
        (SELECT cat.nombre_categoria
         FROM categorias cat
         LEFT JOIN casos c ON c.id_caso = t.id_entidad::int
         WHERE cat.id_materia = COALESCE((t.datos_nuevos->>'id_materia')::int, c.id_materia)
           AND cat.num_categoria = COALESCE((t.datos_nuevos->>'num_categoria')::int, c.num_categoria))
    END) as nombre_categoria_nuevo,
    (CASE WHEN t.entidad = 'caso' AND (
        t.datos_anteriores ? 'num_subcategoria' OR t.datos_anteriores ? 'num_categoria' OR t.datos_anteriores ? 'id_materia'
    ) THEN
        (SELECT sub.nombre_subcategoria
         FROM subcategorias sub
         LEFT JOIN casos c ON c.id_caso = t.id_entidad::int
         WHERE sub.id_materia = COALESCE((t.datos_anteriores->>'id_materia')::int, c.id_materia)
           AND sub.num_categoria = COALESCE((t.datos_anteriores->>'num_categoria')::int, c.num_categoria)
           AND sub.num_subcategoria = COALESCE((t.datos_anteriores->>'num_subcategoria')::int, c.num_subcategoria))
    END) as nombre_subcategoria_anterior,
    (CASE WHEN t.entidad = 'caso' AND (
        t.datos_nuevos ? 'num_subcategoria' OR t.datos_nuevos ? 'num_categoria' OR t.datos_nuevos ? 'id_materia'
    ) THEN
        (SELECT sub.nombre_subcategoria
         FROM subcategorias sub
         LEFT JOIN casos c ON c.id_caso = t.id_entidad::int
         WHERE sub.id_materia = COALESCE((t.datos_nuevos->>'id_materia')::int, c.id_materia)
           AND sub.num_categoria = COALESCE((t.datos_nuevos->>'num_categoria')::int, c.num_categoria)
           AND sub.num_subcategoria = COALESCE((t.datos_nuevos->>'num_subcategoria')::int, c.num_subcategoria))
    END) as nombre_subcategoria_nuevo,
    (CASE WHEN t.entidad = 'caso' AND (
        t.datos_anteriores ? 'num_ambito_legal' OR t.datos_anteriores ? 'id_materia' OR
        t.datos_anteriores ? 'num_categoria' OR t.datos_anteriores ? 'num_subcategoria'
    ) THEN
        (SELECT al.nombre_ambito_legal
         FROM ambitos_legales al
         LEFT JOIN casos c ON c.id_caso = t.id_entidad::int
         WHERE al.id_materia = COALESCE((t.datos_anteriores->>'id_materia')::int, c.id_materia)
           AND al.num_categoria = COALESCE((t.datos_anteriores->>'num_categoria')::int, c.num_categoria)
           AND al.num_subcategoria = COALESCE((t.datos_anteriores->>'num_subcategoria')::int, c.num_subcategoria)
           AND al.num_ambito_legal = COALESCE((t.datos_anteriores->>'num_ambito_legal')::int, c.num_ambito_legal))
    END) as nombre_ambito_legal_anterior,
    (CASE WHEN t.entidad = 'caso' AND (
        t.datos_nuevos ? 'num_ambito_legal' OR t.datos_nuevos ? 'id_materia' OR
        t.datos_nuevos ? 'num_categoria' OR t.datos_nuevos ? 'num_subcategoria'
    ) THEN
        (SELECT al.nombre_ambito_legal
         FROM ambitos_legales al
         LEFT JOIN casos c ON c.id_caso = t.id_entidad::int
         WHERE al.id_materia = COALESCE((t.datos_nuevos->>'id_materia')::int, c.id_materia)
           AND al.num_categoria = COALESCE((t.datos_nuevos->>'num_categoria')::int, c.num_categoria)
           AND al.num_subcategoria = COALESCE((t.datos_nuevos->>'num_subcategoria')::int, c.num_subcategoria)
           AND al.num_ambito_legal = COALESCE((t.datos_nuevos->>'num_ambito_legal')::int, c.num_ambito_legal))
    END) as nombre_ambito_legal_nuevo,
    -- Nombre del catálogo "padre" para las tarjetas de categoría/
    -- subcategoría/ámbito legal/característica/municipio/parroquia — un
    -- solo valor (no _anterior/_nuevo) porque la parte de la clave que
    -- identifica al padre es parte de la PK y no cambia entre operaciones;
    -- se resuelve haciendo JOIN hacia arriba desde la fila actual del propio
    -- catálogo (localizada por id_entidad, en el mismo orden de columnas que
    -- declara su CREATE TRIGGER trg_audit_* en schema.sql). Para
    -- eliminaciones la fila ya no existe y esto resuelve NULL — igual que
    -- antes, sin regresión.
    (CASE WHEN t.entidad = 'categoria' THEN
        (SELECT m.nombre_materia
         FROM categorias cat JOIN materias m ON m.id_materia = cat.id_materia
         WHERE cat.num_categoria = split_part(t.id_entidad, '-', 1)::int
           AND cat.id_materia = split_part(t.id_entidad, '-', 2)::int)
    END) as nombre_materia,
    (CASE WHEN t.entidad = 'subcategoria' THEN
        (SELECT cat.nombre_categoria
         FROM subcategorias sub
         JOIN categorias cat ON cat.id_materia = sub.id_materia AND cat.num_categoria = sub.num_categoria
         WHERE sub.num_subcategoria = split_part(t.id_entidad, '-', 1)::int
           AND sub.num_categoria = split_part(t.id_entidad, '-', 2)::int
           AND sub.id_materia = split_part(t.id_entidad, '-', 3)::int)
    END) as nombre_categoria,
    (CASE WHEN t.entidad = 'ambito_legal' THEN
        (SELECT sub.nombre_subcategoria
         FROM ambitos_legales al
         JOIN subcategorias sub ON sub.id_materia = al.id_materia AND sub.num_categoria = al.num_categoria AND sub.num_subcategoria = al.num_subcategoria
         WHERE al.id_materia = split_part(t.id_entidad, '-', 1)::int
           AND al.num_categoria = split_part(t.id_entidad, '-', 2)::int
           AND al.num_subcategoria = split_part(t.id_entidad, '-', 3)::int
           AND al.num_ambito_legal = split_part(t.id_entidad, '-', 4)::int)
    END) as nombre_subcategoria,
    (CASE WHEN t.entidad = 'caracteristica' THEN
        (SELECT tc.nombre_tipo_caracteristica
         FROM caracteristicas c2 JOIN tipo_caracteristicas tc ON tc.id_tipo = c2.id_tipo_caracteristica
         WHERE c2.id_tipo_caracteristica = split_part(t.id_entidad, '-', 1)::int
           AND c2.num_caracteristica = split_part(t.id_entidad, '-', 2)::int)
    END) as nombre_tipo_caracteristica,
    (CASE WHEN t.entidad = 'municipio' THEN
        (SELECT e.nombre_estado
         FROM municipios mu JOIN estados e ON e.id_estado = mu.id_estado
         WHERE mu.id_estado = split_part(t.id_entidad, '-', 1)::int
           AND mu.num_municipio = split_part(t.id_entidad, '-', 2)::int)
    END) as nombre_estado,
    (CASE WHEN t.entidad = 'parroquia' THEN
        (SELECT mu.nombre_municipio
         FROM parroquias p JOIN municipios mu ON mu.id_estado = p.id_estado AND mu.num_municipio = p.num_municipio
         WHERE p.id_estado = split_part(t.id_entidad, '-', 1)::int
           AND p.num_municipio = split_part(t.id_entidad, '-', 2)::int
           AND p.num_parroquia = split_part(t.id_entidad, '-', 3)::int)
    END) as nombre_municipio,
    (CASE WHEN t.entidad = 'parroquia' THEN
        (SELECT e.nombre_estado
         FROM parroquias p JOIN estados e ON e.id_estado = p.id_estado
         WHERE p.id_estado = split_part(t.id_entidad, '-', 1)::int
           AND p.num_municipio = split_part(t.id_entidad, '-', 2)::int
           AND p.num_parroquia = split_part(t.id_entidad, '-', 3)::int)
    END) as nombre_estado_parroquia,
    t.datos_anteriores as datos_anteriores,
    t.datos_nuevos as datos_nuevos,
    t.metadata as metadata
FROM auditoria_eventos t
WHERE
    ($3::text IS NULL OR t.entidad = $3) AND
    ($4::text IS NULL OR t.id_usuario = $4) AND
    ($5::text IS NULL OR t.operacion = $5) AND
    ($6::timestamp IS NULL OR t.fecha_evento >= $6) AND
    ($7::timestamp IS NULL OR t.fecha_evento <= $7) AND
    ($8::text IS NULL OR (
        TRANSLATE(COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario), t.id_usuario), 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') ILIKE '%' || TRANSLATE($8, 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') || '%' OR
        TRANSLATE(COALESCE(t.datos_nuevos::text, ''), 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') ILIKE '%' || TRANSLATE($8, 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') || '%' OR
        TRANSLATE(COALESCE(t.datos_anteriores::text, ''), 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') ILIKE '%' || TRANSLATE($8, 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') || '%'
    )) AND
    ($9::text IS NULL OR t.metadata->>'tx_id' = $9) AND
    ($10::text IS NULL OR t.id_transaccion::text = $10)
ORDER BY t.fecha_evento DESC
LIMIT $1 OFFSET $2;
