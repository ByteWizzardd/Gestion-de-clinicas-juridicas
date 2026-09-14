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
    -- También para 'solicitante' y sus eventos derivados: en una
    -- actualización la cédula (PK) no viene en el diff, solo en id_entidad
    -- (o metadata.cedula_solicitante en eventos migrados).
    (CASE
        WHEN t.entidad = 'caso' THEN
            (SELECT nombres || ' ' || apellidos FROM solicitantes
             WHERE cedula = COALESCE(t.datos_nuevos->>'cedula', t.datos_anteriores->>'cedula',
                                     t.datos_nuevos->>'cedula_solicitante', t.datos_anteriores->>'cedula_solicitante'))
        WHEN t.entidad IN ('solicitante', 'solicitante_perfil', 'solicitante_artefactos', 'vivienda', 'familia_y_hogar') THEN
            (SELECT nombres || ' ' || apellidos FROM solicitantes
             WHERE cedula = COALESCE(t.id_entidad, t.metadata->>'cedula_solicitante'))
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
    -- Solicitante: 6 FKs propias (nivel educativo, condición de trabajo/
    -- actividad, estado/municipio/parroquia de residencia) que el diff de
    -- 'solicitante-actualizado' muestra en líneas separadas, cada una con
    -- su propio _anterior/_nuevo. Las compuestas (municipio, parroquia) se
    -- completan con la fila vigente en `solicitantes` (id_entidad = cedula)
    -- para las partes que no cambiaron.
    (CASE WHEN t.entidad IN ('solicitante', 'solicitante_perfil') AND t.datos_anteriores ? 'id_nivel_educativo' THEN
        (SELECT descripcion FROM niveles_educativos WHERE id_nivel_educativo = (t.datos_anteriores->>'id_nivel_educativo')::int)
    END) as nivel_educativo_anterior,
    (CASE WHEN t.entidad IN ('solicitante', 'solicitante_perfil') AND t.datos_nuevos ? 'id_nivel_educativo' THEN
        (SELECT descripcion FROM niveles_educativos WHERE id_nivel_educativo = (t.datos_nuevos->>'id_nivel_educativo')::int)
    END) as nivel_educativo_nuevo,
    (CASE WHEN t.entidad IN ('solicitante', 'solicitante_perfil') AND t.datos_anteriores ? 'id_trabajo' THEN
        (SELECT nombre_trabajo FROM condicion_trabajo WHERE id_trabajo = (t.datos_anteriores->>'id_trabajo')::int)
    END) as condicion_trabajo_anterior,
    (CASE WHEN t.entidad IN ('solicitante', 'solicitante_perfil') AND t.datos_nuevos ? 'id_trabajo' THEN
        (SELECT nombre_trabajo FROM condicion_trabajo WHERE id_trabajo = (t.datos_nuevos->>'id_trabajo')::int)
    END) as condicion_trabajo_nuevo,
    (CASE WHEN t.entidad IN ('solicitante', 'solicitante_perfil') AND t.datos_anteriores ? 'id_actividad' THEN
        (SELECT nombre_actividad FROM condicion_actividad WHERE id_actividad = (t.datos_anteriores->>'id_actividad')::int)
    END) as condicion_actividad_anterior,
    (CASE WHEN t.entidad IN ('solicitante', 'solicitante_perfil') AND t.datos_nuevos ? 'id_actividad' THEN
        (SELECT nombre_actividad FROM condicion_actividad WHERE id_actividad = (t.datos_nuevos->>'id_actividad')::int)
    END) as condicion_actividad_nuevo,
    (CASE WHEN t.entidad IN ('solicitante', 'solicitante_perfil') AND t.datos_anteriores ? 'id_estado' THEN
        (SELECT nombre_estado FROM estados WHERE id_estado = (t.datos_anteriores->>'id_estado')::int)
    END) as solicitante_estado_anterior,
    (CASE WHEN t.entidad IN ('solicitante', 'solicitante_perfil') AND t.datos_nuevos ? 'id_estado' THEN
        (SELECT nombre_estado FROM estados WHERE id_estado = (t.datos_nuevos->>'id_estado')::int)
    END) as solicitante_estado_nuevo,
    (CASE WHEN t.entidad IN ('solicitante', 'solicitante_perfil') AND (t.datos_anteriores ? 'num_municipio' OR t.datos_anteriores ? 'id_estado') THEN
        (SELECT mu.nombre_municipio
         FROM municipios mu LEFT JOIN solicitantes s ON s.cedula = t.id_entidad
         WHERE mu.id_estado = COALESCE((t.datos_anteriores->>'id_estado')::int, s.id_estado)
           AND mu.num_municipio = COALESCE((t.datos_anteriores->>'num_municipio')::int, s.num_municipio))
    END) as solicitante_municipio_anterior,
    (CASE WHEN t.entidad IN ('solicitante', 'solicitante_perfil') AND (t.datos_nuevos ? 'num_municipio' OR t.datos_nuevos ? 'id_estado') THEN
        (SELECT mu.nombre_municipio
         FROM municipios mu LEFT JOIN solicitantes s ON s.cedula = t.id_entidad
         WHERE mu.id_estado = COALESCE((t.datos_nuevos->>'id_estado')::int, s.id_estado)
           AND mu.num_municipio = COALESCE((t.datos_nuevos->>'num_municipio')::int, s.num_municipio))
    END) as solicitante_municipio_nuevo,
    (CASE WHEN t.entidad IN ('solicitante', 'solicitante_perfil') AND (
        t.datos_anteriores ? 'num_parroquia' OR t.datos_anteriores ? 'num_municipio' OR t.datos_anteriores ? 'id_estado'
    ) THEN
        (SELECT p.nombre_parroquia
         FROM parroquias p LEFT JOIN solicitantes s ON s.cedula = t.id_entidad
         WHERE p.id_estado = COALESCE((t.datos_anteriores->>'id_estado')::int, s.id_estado)
           AND p.num_municipio = COALESCE((t.datos_anteriores->>'num_municipio')::int, s.num_municipio)
           AND p.num_parroquia = COALESCE((t.datos_anteriores->>'num_parroquia')::int, s.num_parroquia))
    END) as solicitante_parroquia_anterior,
    (CASE WHEN t.entidad IN ('solicitante', 'solicitante_perfil') AND (
        t.datos_nuevos ? 'num_parroquia' OR t.datos_nuevos ? 'num_municipio' OR t.datos_nuevos ? 'id_estado'
    ) THEN
        (SELECT p.nombre_parroquia
         FROM parroquias p LEFT JOIN solicitantes s ON s.cedula = t.id_entidad
         WHERE p.id_estado = COALESCE((t.datos_nuevos->>'id_estado')::int, s.id_estado)
           AND p.num_municipio = COALESCE((t.datos_nuevos->>'num_municipio')::int, s.num_municipio)
           AND p.num_parroquia = COALESCE((t.datos_nuevos->>'num_parroquia')::int, s.num_parroquia))
    END) as solicitante_parroquia_nuevo,
    -- Datos de las personas referenciadas por cédula dentro del evento (el
    -- usuario afectado, estudiante/profesor inscrito, quien subió un soporte,
    -- quien registró un beneficiario...), indexados por cédula. Solo campos
    -- de presentación: nunca la contraseña.
    (SELECT jsonb_object_agg(u.cedula, jsonb_build_object(
            'nombres', u.nombres, 'apellidos', u.apellidos,
            'correo_electronico', u.correo_electronico, 'nombre_usuario', u.nombre_usuario,
            'tipo_usuario', u.tipo_usuario, 'telefono_celular', u.telefono_celular))
     FROM usuarios u
     WHERE u.cedula IN (
        CASE WHEN t.entidad = 'usuario' THEN t.id_entidad END,
        t.metadata->>'ci_usuario',
        COALESCE(t.datos_nuevos, t.datos_anteriores)->>'usuario_eliminado',
        COALESCE(t.datos_nuevos, t.datos_anteriores)->>'cedula_estudiante',
        COALESCE(t.datos_nuevos, t.datos_anteriores)->>'cedula_profesor',
        COALESCE(t.datos_nuevos, t.datos_anteriores)->>'id_usuario_subio',
        COALESCE(t.datos_nuevos, t.datos_anteriores)->>'id_usuario_registro',
        COALESCE(t.datos_nuevos, t.datos_anteriores)->>'id_usuario_registra',
        CASE WHEN t.entidad IN ('estudiante', 'profesor') THEN substring(t.id_entidad from '^[^-]+-[^-]+-(.+)$') END
     )) as usuarios_ref,
    -- Nombres resueltos adicionales, por entidad, que el diff solo trae como
    -- ids. Las partes de una clave que no cambiaron no vienen en el diff: se
    -- completan con id_entidad / la fila vigente / metadata (migrados).
    COALESCE(jsonb_strip_nulls(CASE
        -- Usuario eliminado sin nombre en el evento (algunos migrados) y que ya
        -- no existe en `usuarios`: último nombre conocido en sus eventos previos.
        WHEN t.entidad = 'usuario' AND t.operacion = 'eliminacion'
             AND COALESCE(t.datos_anteriores->>'nombres', t.datos_anteriores->>'nombres_usuario_eliminado') IS NULL THEN (
            SELECT jsonb_build_object(
                'nombres_historico', COALESCE(a.datos_nuevos, a.datos_anteriores)->>'nombres',
                'apellidos_historico', COALESCE(a.datos_nuevos, a.datos_anteriores)->>'apellidos')
            FROM auditoria_eventos a
            WHERE a.entidad = 'usuario' AND a.id < t.id
              AND COALESCE(a.datos_nuevos, a.datos_anteriores) ? 'nombres'
              AND t.datos_anteriores->>'usuario_eliminado' IN (a.id_entidad, a.metadata->>'ci_usuario', COALESCE(a.datos_nuevos, a.datos_anteriores)->>'cedula')
            ORDER BY a.id DESC
            LIMIT 1)
        -- Cambio de estatus: el estatus previo del caso es el del cambio
        -- anterior (num_cambio menor). Si el caso ya no existe, se busca en
        -- los eventos de auditoría anteriores del mismo caso.
        WHEN t.entidad = 'cambio_estatus' THEN jsonb_build_object(
            'estatus_anterior', COALESCE(
                (SELECT ce.nuevo_estatus FROM cambio_estatus ce
                 WHERE ce.id_caso = NULLIF(split_part(t.id_entidad, '-', 2), '')::int
                   AND ce.num_cambio < NULLIF(split_part(t.id_entidad, '-', 1), '')::int
                 ORDER BY ce.num_cambio DESC LIMIT 1),
                (SELECT a.datos_nuevos->>'nuevo_estatus' FROM auditoria_eventos a
                 WHERE a.entidad = 'cambio_estatus' AND a.id < t.id
                   AND split_part(a.id_entidad, '-', 2) = split_part(t.id_entidad, '-', 2)
                 ORDER BY a.id DESC LIMIT 1)))
        -- Núcleo: ubicación (estado/municipio/parroquia) antes y después.
        WHEN t.entidad = 'nucleo' AND t.operacion = 'actualizacion' THEN (
            SELECT jsonb_build_object(
                'nombre_estado_anterior', (SELECT nombre_estado FROM estados WHERE id_estado = v.ea),
                'nombre_estado_nuevo', (SELECT nombre_estado FROM estados WHERE id_estado = v.en),
                'nombre_municipio_anterior', (SELECT nombre_municipio FROM municipios WHERE id_estado = v.ea AND num_municipio = v.ma),
                'nombre_municipio_nuevo', (SELECT nombre_municipio FROM municipios WHERE id_estado = v.en AND num_municipio = v.mn),
                'nombre_parroquia_anterior', (SELECT nombre_parroquia FROM parroquias WHERE id_estado = v.ea AND num_municipio = v.ma AND num_parroquia = v.pa),
                'nombre_parroquia_nuevo', (SELECT nombre_parroquia FROM parroquias WHERE id_estado = v.en AND num_municipio = v.mn AND num_parroquia = v.pn))
            FROM (
                -- Partes que no cambiaron en este evento: su valor en ese
                -- momento, aunque el núcleo se haya editado o eliminado después.
                SELECT COALESCE((t.datos_anteriores->>'id_estado')::int, v0.en) AS ea, v0.en,
                       COALESCE((t.datos_anteriores->>'num_municipio')::int, v0.mn) AS ma, v0.mn,
                       COALESCE((t.datos_anteriores->>'num_parroquia')::int, v0.pn) AS pa, v0.pn
                FROM (
                    SELECT
                        COALESCE((t.datos_nuevos->>'id_estado')::int, (SELECT (a.datos_anteriores->>'id_estado')::int FROM auditoria_eventos a WHERE a.entidad = 'nucleo' AND a.id_entidad = t.id_entidad AND a.id > t.id AND a.datos_anteriores ? 'id_estado' ORDER BY a.id LIMIT 1), n.id_estado) AS en,
                        COALESCE((t.datos_nuevos->>'num_municipio')::int, (SELECT (a.datos_anteriores->>'num_municipio')::int FROM auditoria_eventos a WHERE a.entidad = 'nucleo' AND a.id_entidad = t.id_entidad AND a.id > t.id AND a.datos_anteriores ? 'num_municipio' ORDER BY a.id LIMIT 1), n.num_municipio) AS mn,
                        COALESCE((t.datos_nuevos->>'num_parroquia')::int, (SELECT (a.datos_anteriores->>'num_parroquia')::int FROM auditoria_eventos a WHERE a.entidad = 'nucleo' AND a.id_entidad = t.id_entidad AND a.id > t.id AND a.datos_anteriores ? 'num_parroquia' ORDER BY a.id LIMIT 1), n.num_parroquia) AS pn
                    FROM (SELECT 1) x
                    LEFT JOIN nucleos n ON n.id_nucleo = COALESCE(t.id_entidad, t.metadata->>'id_nucleo')::int
                ) v0
            ) v)
        -- Parroquia: estado/municipio antes y después (son parte de su PK).
        WHEN t.entidad = 'parroquia' AND t.operacion = 'actualizacion' THEN (
            SELECT jsonb_build_object(
                'nombre_estado_anterior', (SELECT nombre_estado FROM estados WHERE id_estado = v.ea),
                'nombre_estado_nuevo', (SELECT nombre_estado FROM estados WHERE id_estado = v.en),
                'nombre_municipio_anterior', (SELECT nombre_municipio FROM municipios WHERE id_estado = v.ea AND num_municipio = v.ma),
                'nombre_municipio_nuevo', (SELECT nombre_municipio FROM municipios WHERE id_estado = v.en AND num_municipio = v.mn))
            FROM (
                SELECT COALESCE((t.datos_anteriores->>'id_estado')::int, v0.en) AS ea, v0.en,
                       COALESCE((t.datos_anteriores->>'num_municipio')::int, v0.mn) AS ma, v0.mn
                FROM (SELECT
                    COALESCE((t.datos_nuevos->>'id_estado')::int, (t.metadata->>'id_estado')::int, NULLIF(split_part(t.id_entidad, '-', 1), '')::int) AS en,
                    COALESCE((t.datos_nuevos->>'num_municipio')::int, (t.metadata->>'num_municipio')::int, NULLIF(split_part(t.id_entidad, '-', 2), '')::int) AS mn
                ) v0
            ) v)
        -- Subcategoría: materia/categoría antes y después (parte de su PK).
        WHEN t.entidad = 'subcategoria' AND t.operacion = 'actualizacion' THEN (
            SELECT jsonb_build_object(
                'nombre_materia_anterior', (SELECT nombre_materia FROM materias WHERE id_materia = v.ma),
                'nombre_materia_nuevo', (SELECT nombre_materia FROM materias WHERE id_materia = v.mn),
                'nombre_categoria_anterior', (SELECT nombre_categoria FROM categorias WHERE id_materia = v.ma AND num_categoria = v.ca),
                'nombre_categoria_nuevo', (SELECT nombre_categoria FROM categorias WHERE id_materia = v.mn AND num_categoria = v.cn))
            FROM (
                SELECT COALESCE((t.datos_anteriores->>'id_materia')::int, v0.mn) AS ma, v0.mn,
                       COALESCE((t.datos_anteriores->>'num_categoria')::int, v0.cn) AS ca, v0.cn
                FROM (SELECT
                    COALESCE((t.datos_nuevos->>'id_materia')::int, (t.metadata->>'id_materia')::int, NULLIF(split_part(t.id_entidad, '-', 3), '')::int) AS mn,
                    COALESCE((t.datos_nuevos->>'num_categoria')::int, (t.metadata->>'num_categoria')::int, NULLIF(split_part(t.id_entidad, '-', 2), '')::int) AS cn
                ) v0
            ) v)
        -- Solicitante eliminado: nivel educativo del jefe del hogar, que vive
        -- en el evento gemelo de familias_y_hogares.
        WHEN t.entidad = 'solicitante' AND t.operacion = 'eliminacion' THEN jsonb_build_object(
            'nivel_educativo_jefe', (
                SELECT ne.descripcion
                FROM auditoria_eventos s
                JOIN niveles_educativos ne ON ne.id_nivel_educativo = (s.datos_anteriores->>'id_nivel_educativo_jefe')::int
                WHERE s.entidad = 'familia_y_hogar' AND s.operacion = 'eliminacion'
                  AND s.fecha_evento = t.fecha_evento AND s.id_entidad = t.id_entidad
                LIMIT 1))
        -- Perfil del solicitante (y familia/hogar suelto): nivel educativo del jefe.
        WHEN t.entidad IN ('solicitante', 'solicitante_perfil', 'familia_y_hogar') THEN jsonb_build_object(
            'nivel_educativo_jefe_anterior', (SELECT descripcion FROM niveles_educativos WHERE id_nivel_educativo = (t.datos_anteriores->>'id_nivel_educativo_jefe')::int),
            'nivel_educativo_jefe_nuevo', (SELECT descripcion FROM niveles_educativos WHERE id_nivel_educativo = (t.datos_nuevos->>'id_nivel_educativo_jefe')::int))
    END), '{}'::jsonb)
    -- Nombre del elemento de catálogo en el momento de una actualización cuyo
    -- diff no lo trae (habilitar/deshabilitar, mover de padre...).
    || COALESCE(jsonb_strip_nulls(jsonb_build_object('nombre_catalogo', CASE WHEN t.operacion = 'actualizacion' THEN
        CASE t.entidad
            WHEN 'estado' THEN COALESCE((t.datos_nuevos->>'nombre_estado'), (SELECT (a.datos_anteriores->>'nombre_estado') FROM auditoria_eventos a WHERE a.entidad = 'estado' AND a.id_entidad = t.id_entidad AND a.id > t.id AND a.datos_anteriores ? 'nombre_estado' ORDER BY a.id LIMIT 1), (SELECT nombre_estado FROM estados WHERE id_estado::text = t.id_entidad))
            WHEN 'municipio' THEN COALESCE((t.datos_nuevos->>'nombre_municipio'), (SELECT (a.datos_anteriores->>'nombre_municipio') FROM auditoria_eventos a WHERE a.entidad = 'municipio' AND a.id_entidad = t.id_entidad AND a.id > t.id AND a.datos_anteriores ? 'nombre_municipio' ORDER BY a.id LIMIT 1), (SELECT nombre_municipio FROM municipios WHERE id_estado || '-' || num_municipio = t.id_entidad))
            WHEN 'parroquia' THEN COALESCE((t.datos_nuevos->>'nombre_parroquia'), (SELECT (a.datos_anteriores->>'nombre_parroquia') FROM auditoria_eventos a WHERE a.entidad = 'parroquia' AND a.id_entidad = t.id_entidad AND a.id > t.id AND a.datos_anteriores ? 'nombre_parroquia' ORDER BY a.id LIMIT 1), (SELECT nombre_parroquia FROM parroquias WHERE id_estado || '-' || num_municipio || '-' || num_parroquia = t.id_entidad))
            WHEN 'nucleo' THEN COALESCE((t.datos_nuevos->>'nombre_nucleo'), (SELECT (a.datos_anteriores->>'nombre_nucleo') FROM auditoria_eventos a WHERE a.entidad = 'nucleo' AND a.id_entidad = t.id_entidad AND a.id > t.id AND a.datos_anteriores ? 'nombre_nucleo' ORDER BY a.id LIMIT 1), (SELECT nombre_nucleo FROM nucleos WHERE id_nucleo::text = t.id_entidad))
            WHEN 'materia' THEN COALESCE((t.datos_nuevos->>'nombre_materia'), (SELECT (a.datos_anteriores->>'nombre_materia') FROM auditoria_eventos a WHERE a.entidad = 'materia' AND a.id_entidad = t.id_entidad AND a.id > t.id AND a.datos_anteriores ? 'nombre_materia' ORDER BY a.id LIMIT 1), (SELECT nombre_materia FROM materias WHERE id_materia::text = t.id_entidad))
            WHEN 'categoria' THEN COALESCE((t.datos_nuevos->>'nombre_categoria'), (SELECT (a.datos_anteriores->>'nombre_categoria') FROM auditoria_eventos a WHERE a.entidad = 'categoria' AND a.id_entidad = t.id_entidad AND a.id > t.id AND a.datos_anteriores ? 'nombre_categoria' ORDER BY a.id LIMIT 1), (SELECT nombre_categoria FROM categorias WHERE num_categoria || '-' || id_materia = t.id_entidad))
            WHEN 'subcategoria' THEN COALESCE((t.datos_nuevos->>'nombre_subcategoria'), (SELECT (a.datos_anteriores->>'nombre_subcategoria') FROM auditoria_eventos a WHERE a.entidad = 'subcategoria' AND a.id_entidad = t.id_entidad AND a.id > t.id AND a.datos_anteriores ? 'nombre_subcategoria' ORDER BY a.id LIMIT 1), (SELECT nombre_subcategoria FROM subcategorias WHERE num_subcategoria || '-' || num_categoria || '-' || id_materia = t.id_entidad))
            WHEN 'ambito_legal' THEN COALESCE((t.datos_nuevos->>'nombre_ambito_legal'), (SELECT (a.datos_anteriores->>'nombre_ambito_legal') FROM auditoria_eventos a WHERE a.entidad = 'ambito_legal' AND a.id_entidad = t.id_entidad AND a.id > t.id AND a.datos_anteriores ? 'nombre_ambito_legal' ORDER BY a.id LIMIT 1), (SELECT nombre_ambito_legal FROM ambitos_legales WHERE id_materia || '-' || num_categoria || '-' || num_subcategoria || '-' || num_ambito_legal = t.id_entidad))
            WHEN 'nivel_educativo' THEN COALESCE((t.datos_nuevos->>'descripcion'), (SELECT (a.datos_anteriores->>'descripcion') FROM auditoria_eventos a WHERE a.entidad = 'nivel_educativo' AND a.id_entidad = t.id_entidad AND a.id > t.id AND a.datos_anteriores ? 'descripcion' ORDER BY a.id LIMIT 1), (SELECT descripcion FROM niveles_educativos WHERE id_nivel_educativo::text = t.id_entidad))
            WHEN 'condicion_trabajo' THEN COALESCE((t.datos_nuevos->>'nombre_trabajo'), (SELECT (a.datos_anteriores->>'nombre_trabajo') FROM auditoria_eventos a WHERE a.entidad = 'condicion_trabajo' AND a.id_entidad = t.id_entidad AND a.id > t.id AND a.datos_anteriores ? 'nombre_trabajo' ORDER BY a.id LIMIT 1), (SELECT nombre_trabajo FROM condicion_trabajo WHERE id_trabajo::text = t.id_entidad))
            WHEN 'condicion_actividad' THEN COALESCE((t.datos_nuevos->>'nombre_actividad'), (SELECT (a.datos_anteriores->>'nombre_actividad') FROM auditoria_eventos a WHERE a.entidad = 'condicion_actividad' AND a.id_entidad = t.id_entidad AND a.id > t.id AND a.datos_anteriores ? 'nombre_actividad' ORDER BY a.id LIMIT 1), (SELECT nombre_actividad FROM condicion_actividad WHERE id_actividad::text = t.id_entidad))
            WHEN 'tipo_caracteristica' THEN COALESCE((t.datos_nuevos->>'nombre_tipo_caracteristica'), (SELECT (a.datos_anteriores->>'nombre_tipo_caracteristica') FROM auditoria_eventos a WHERE a.entidad = 'tipo_caracteristica' AND a.id_entidad = t.id_entidad AND a.id > t.id AND a.datos_anteriores ? 'nombre_tipo_caracteristica' ORDER BY a.id LIMIT 1), (SELECT nombre_tipo_caracteristica FROM tipo_caracteristicas WHERE id_tipo::text = t.id_entidad))
            WHEN 'caracteristica' THEN COALESCE((t.datos_nuevos->>'descripcion'), (SELECT (a.datos_anteriores->>'descripcion') FROM auditoria_eventos a WHERE a.entidad = 'caracteristica' AND a.id_entidad = t.id_entidad AND a.id > t.id AND a.datos_anteriores ? 'descripcion' ORDER BY a.id LIMIT 1), (SELECT descripcion FROM caracteristicas WHERE id_tipo_caracteristica || '-' || num_caracteristica = t.id_entidad))
        END
    END)), '{}'::jsonb) as nombres_resueltos,
    -- Solicitante eliminado: las filas de viviendas/familias_y_hogares se
    -- borran en la misma transacción; se adjuntan sus datos para que la
    -- tarjeta muestre vivienda y familia (los eventos gemelos se ocultan).
    (CASE WHEN t.entidad = 'solicitante' AND t.operacion = 'eliminacion' THEN
        (SELECT jsonb_object_agg(kv.key, kv.value)
         FROM auditoria_eventos s, jsonb_each(s.datos_anteriores) kv
         WHERE s.entidad IN ('vivienda', 'familia_y_hogar') AND s.operacion = 'eliminacion'
           AND s.fecha_evento = t.fecha_evento AND s.id_entidad = t.id_entidad)
    END) as solicitante_extra,
    -- Personas que atienden una cita (tabla atienden, entidad 'atencion_cita'):
    -- se escriben en la misma transacción que la cita. 'anteriores' son las
    -- filas borradas y 'nuevos' las insertadas (al editar, la app reemplaza la
    -- lista completa), con el nombre resuelto.
    (CASE WHEN t.entidad IN ('cita', 'atencion_cita') THEN (
        SELECT jsonb_build_object(
            'anteriores', COALESCE(jsonb_agg(jsonb_build_object('cedula', s.ced, 'nombre', COALESCE(u.nombres || ' ' || u.apellidos, s.ced)) ORDER BY s.ced) FILTER (WHERE s.operacion = 'eliminacion'), '[]'::jsonb),
            'nuevos', COALESCE(jsonb_agg(jsonb_build_object('cedula', s.ced, 'nombre', COALESCE(u.nombres || ' ' || u.apellidos, s.ced)) ORDER BY s.ced) FILTER (WHERE s.operacion = 'insercion'), '[]'::jsonb))
        FROM (
            SELECT a.operacion, COALESCE(a.datos_nuevos, a.datos_anteriores)->>'id_usuario' AS ced
            FROM auditoria_eventos a
            WHERE a.entidad = 'atencion_cita'
              AND a.fecha_evento = t.fecha_evento
              AND split_part(a.id_entidad, '-', 1) = split_part(t.id_entidad, '-', 1)
              AND split_part(a.id_entidad, '-', 2) = split_part(t.id_entidad, '-', 2)
        ) s
        LEFT JOIN usuarios u ON u.cedula = s.ced
        HAVING COUNT(*) > 0)
    END) as atenciones_evento,
    -- Inscripción (estudiantes/profesores) creada o editada junto con el
    -- usuario en la misma transacción.
    (CASE WHEN t.entidad = 'usuario' AND t.operacion IN ('insercion', 'actualizacion') THEN (
        SELECT jsonb_build_object('entidad', s.entidad, 'anteriores', s.datos_anteriores, 'nuevos', s.datos_nuevos)
        FROM auditoria_eventos s
        WHERE s.entidad IN ('estudiante', 'profesor')
          AND s.operacion = t.operacion
          AND s.fecha_evento = t.fecha_evento
          AND COALESCE(s.datos_nuevos->>'cedula_estudiante', s.datos_nuevos->>'cedula_profesor',
                       s.datos_anteriores->>'cedula_estudiante', s.datos_anteriores->>'cedula_profesor',
                       substring(s.id_entidad from '^[^-]+-[^-]+-(.+)$')) = t.id_entidad
        ORDER BY s.id DESC
        LIMIT 1)
    END) as inscripcion_extra,
    -- Acciones: crear/editar/eliminar una acción genera DOS eventos en la
    -- misma transacción (misma fecha_evento): 'accion' (trigger genérico, con
    -- detalle/comentario/num_accion/id_caso) y 'accion_ejecutores' (manual,
    -- con la lista de ejecutores). Se adjuntan los ejecutores al evento
    -- 'accion' para mostrar una sola tarjeta completa; el evento gemelo de
    -- ejecutores se oculta en el WHERE.
    (CASE WHEN t.entidad = 'accion' THEN
        (SELECT jsonb_build_object(
            'anteriores', e.datos_anteriores->'ejecutores',
            'nuevos', e.datos_nuevos->'ejecutores',
            'metadata', e.metadata)
         FROM auditoria_eventos e
         WHERE e.entidad = 'accion_ejecutores'
           AND e.operacion = t.operacion
           AND e.fecha_evento = t.fecha_evento
           AND split_part(e.id_entidad, '-', 1) = COALESCE(
                NULLIF(split_part(t.id_entidad, '-', 1), ''),
                t.metadata->>'num_accion', t.datos_nuevos->>'num_accion', t.datos_anteriores->>'num_accion')
         ORDER BY e.id DESC
         LIMIT 1)
    END) as ejecutores_evento,
    t.datos_anteriores as datos_anteriores,
    t.datos_nuevos as datos_nuevos,
    t.metadata as metadata
{{FILTRO_EVENTOS}}
-- {{ORDEN}}: DESC por defecto o ASC (filtro "Más antiguo"); id desempata
-- los eventos de una misma transacción, que comparten fecha_evento.
ORDER BY t.fecha_evento {{ORDEN}}, t.id {{ORDEN}}
LIMIT $1 OFFSET $2;
