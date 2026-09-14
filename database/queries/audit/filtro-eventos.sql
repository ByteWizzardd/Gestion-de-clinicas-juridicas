-- Fragmento FROM + WHERE compartido por el feed de auditoría
-- (get-unified-logs.sql), su conteo (count-unified-logs.sql) y los contadores
-- por módulo (auditoriaEventosQueries / get-eventos.ts). Se inserta en lugar de
-- {{FILTRO_EVENTOS}}; los parámetros van como {{entidad}}, {{usuario}},
-- {{operacion}}, {{fecha_inicio}}, {{fecha_fin}}, {{busqueda}}, {{tx_id}} y
-- {{id_transaccion}}, y auditoria-eventos.queries.ts los reemplaza por $n (o
-- por NULL) según la consulta. Así el feed, el total y los contadores nunca
-- se desalinean.
FROM (
    SELECT
        b.*,
        -- Entidad/operación bajo la que se MUESTRA el evento (filtro por
        -- módulo y contadores): los eventos de tablas relacionadas se ven como
        -- un cambio de su entidad principal.
        CASE
            WHEN b.entidad = 'accion_ejecutores' THEN 'accion'
            WHEN b.entidad IN ('cambio_estatus', 'caso_semestre') THEN 'caso'
            WHEN b.entidad = 'atencion_cita' THEN 'cita'
            WHEN b.entidad IN ('solicitante_perfil', 'solicitante_artefactos', 'vivienda', 'familia_y_hogar') THEN 'solicitante'
            WHEN b.entidad IN ('estudiante', 'profesor') AND b.operacion = 'actualizacion' THEN 'usuario'
            ELSE b.entidad
        END AS entidad_vista,
        CASE
            WHEN b.entidad IN ('cambio_estatus', 'caso_semestre', 'atencion_cita',
                               'solicitante_perfil', 'solicitante_artefactos', 'vivienda', 'familia_y_hogar')
                THEN 'actualizacion'
            ELSE b.operacion
        END AS operacion_vista
    FROM (
        SELECT
            e.id, e.id_transaccion, e.entidad, e.id_usuario, e.fecha_evento,
            -- Movimiento de un catálogo a otro padre (ver `mov`): el DELETE de la
            -- clave vieja se muestra como la actualización hacia la clave nueva.
            CASE WHEN mov.id_eliminacion = e.id THEN 'actualizacion' ELSE e.operacion END AS operacion,
            CASE WHEN mov.id_eliminacion = e.id THEN mov.id_entidad_nuevo ELSE e.id_entidad END AS id_entidad,
            CASE WHEN mov.id_eliminacion = e.id
                 THEN COALESCE(e.metadata, '{}'::jsonb)
                      || jsonb_build_object('movimiento', jsonb_build_object('anterior', mov.fila_anterior, 'nuevo', mov.fila_nueva))
                 ELSE e.metadata END AS metadata,
            -- La INSERT de la clave nueva ya va dentro de esa actualización.
            (mov.id_insercion IS NOT DISTINCT FROM e.id) AS oculto_por_movimiento,
            CASE WHEN mov.id_eliminacion = e.id THEN
                -- Solo lo que cambió, como en una actualización del trigger
                -- genérico. fecha_registro no cuenta: la fila nueva se registra
                -- en el momento del movimiento.
                COALESCE((SELECT jsonb_object_agg(kv.key, kv.value)
                          FROM jsonb_each(mov.fila_anterior) kv
                          WHERE kv.key <> 'fecha_registro'
                            AND kv.value IS DISTINCT FROM mov.fila_nueva->kv.key), '{}'::jsonb)
            ELSE
                -- Columnas sensibles que el trigger genérico copia con to_jsonb(NEW) y
                -- que nunca deben llegar al navegador ni ser buscables: el hash de la
                -- contraseña (usuarios.contrasena) y el contenido del archivo
                -- (soportes.documento_data). De la contraseña solo se conserva EL
                -- HECHO de que cambió.
                e.datos_anteriores - 'contrasena' - 'documento_data'
            END AS datos_anteriores,
            CASE WHEN mov.id_eliminacion = e.id THEN
                COALESCE((SELECT jsonb_object_agg(kv.key, kv.value)
                          FROM jsonb_each(mov.fila_nueva) kv
                          WHERE kv.key <> 'fecha_registro'
                            AND kv.value IS DISTINCT FROM mov.fila_anterior->kv.key), '{}'::jsonb)
            ELSE
                (e.datos_nuevos - 'contrasena' - 'documento_data')
                    || CASE WHEN e.datos_nuevos ? 'contrasena' AND e.datos_anteriores ? 'contrasena'
                            THEN '{"contrasena_cambiada": true}'::jsonb ELSE '{}'::jsonb END
                    -- Solicitante recién creado: el servicio completa la fila con
                    -- UPDATEs en la misma transacción; se muestran los valores finales.
                    || CASE WHEN e.entidad = 'solicitante' AND e.operacion = 'insercion' THEN COALESCE((
                            SELECT jsonb_object_agg(kv.key, kv.value ORDER BY s.id)
                            FROM auditoria_eventos s, jsonb_each(s.datos_nuevos) kv
                            WHERE s.entidad = 'solicitante' AND s.operacion = 'actualizacion'
                              AND s.fecha_evento = e.fecha_evento AND s.id_entidad = e.id_entidad), '{}'::jsonb)
                       ELSE '{}'::jsonb END
            END AS datos_nuevos
        FROM auditoria_eventos e
        -- ---------------------------------------------------------------------
        -- Movimientos de catálogo. Cambiar el padre de un ámbito legal,
        -- categoría, municipio, parroquia o característica cambia su PK, así
        -- que la app hace INSERT de la clave nueva + DELETE de la vieja en la
        -- misma transacción, con metadata.motivo = 'Movido a...' (al mover una
        -- categoría, lo mismo para cada subcategoría y ámbito que arrastra).
        -- Se emparejan eliminación e inserción de la misma entidad y
        -- transacción por su contenido sin la clave (nombre, descripción), en
        -- orden; si se renombró al moverlo, hay un único par y empareja igual.
        -- ---------------------------------------------------------------------
        LEFT JOIN (
            WITH candidatos AS (
                SELECT
                    c.id, c.id_transaccion, c.entidad, c.operacion, c.id_entidad,
                    COALESCE(c.datos_anteriores, c.datos_nuevos) AS fila,
                    row_number() OVER (
                        PARTITION BY c.id_transaccion, c.entidad, c.operacion
                        ORDER BY (COALESCE(c.datos_anteriores, c.datos_nuevos)
                                  - ARRAY['id_materia', 'num_categoria', 'num_subcategoria', 'num_ambito_legal',
                                          'id_estado', 'num_municipio', 'num_parroquia',
                                          'id_tipo_caracteristica', 'num_caracteristica',
                                          'habilitado', 'fecha_registro', 'id_usuario_registro'])::text,
                                 c.id
                    ) AS orden
                FROM auditoria_eventos c
                WHERE c.entidad IN ('ambito_legal', 'categoria', 'subcategoria', 'municipio', 'parroquia', 'caracteristica')
                  AND c.operacion IN ('insercion', 'eliminacion')
                  AND EXISTS (
                      SELECT 1 FROM auditoria_eventos m
                      WHERE m.id_transaccion = c.id_transaccion
                        AND m.entidad = c.entidad
                        AND m.operacion = 'eliminacion'
                        AND m.metadata->>'motivo' LIKE 'Movido%')
            )
            SELECT d.id AS id_eliminacion, i.id AS id_insercion, i.id_entidad AS id_entidad_nuevo,
                   d.fila AS fila_anterior, i.fila AS fila_nueva
            FROM candidatos d
            JOIN candidatos i
              ON i.id_transaccion = d.id_transaccion AND i.entidad = d.entidad AND i.orden = d.orden
            WHERE d.operacion = 'eliminacion' AND i.operacion = 'insercion'
        ) mov ON e.id IN (mov.id_eliminacion, mov.id_insercion)
    ) b
) t
WHERE
    -- Inserción de la clave nueva de un movimiento de catálogo: ya se muestra
    -- dentro de la actualización (ver `mov`).
    NOT t.oculto_por_movimiento AND
    -- ---------------------------------------------------------------------
    -- Eventos que se muestran FUSIONADOS con otro de la misma transacción
    -- (misma fecha_evento: now() es la hora de inicio de la transacción) y
    -- por eso se ocultan como tarjeta propia. Ver las columnas *_evento /
    -- *_extra de get-unified-logs.sql.
    -- ---------------------------------------------------------------------
    -- Ejecutores de una acción: van dentro del evento 'accion'.
    NOT (t.entidad = 'accion_ejecutores' AND EXISTS (
        SELECT 1 FROM auditoria_eventos a
        WHERE a.entidad = 'accion'
          AND a.operacion = t.operacion
          AND a.fecha_evento = t.fecha_evento
          AND split_part(t.id_entidad, '-', 1) = COALESCE(
                NULLIF(split_part(a.id_entidad, '-', 1), ''),
                a.metadata->>'num_accion', a.datos_nuevos->>'num_accion', a.datos_anteriores->>'num_accion')
    )) AND
    -- Tablas satélite del solicitante (viviendas, familias_y_hogares): al
    -- actualizar, solicitantes.service.ts ya registra UN evento
    -- 'solicitante_perfil' con el perfil completo; al crear/eliminar, sus
    -- datos se adjuntan al evento 'solicitante' (ver solicitante_extra).
    NOT (t.entidad IN ('vivienda', 'familia_y_hogar') AND EXISTS (
        SELECT 1 FROM auditoria_eventos s
        WHERE s.entidad IN ('solicitante', 'solicitante_perfil')
          AND s.fecha_evento = t.fecha_evento
          AND s.id_entidad = t.id_entidad
    )) AND
    -- El diff de solo las columnas de `solicitantes` es un subconjunto del
    -- evento 'solicitante_perfil' de la misma edición, o completa la fila
    -- recién insertada (ya incluido en datos_nuevos de la creación).
    NOT (t.entidad = 'solicitante' AND t.operacion = 'actualizacion' AND EXISTS (
        SELECT 1 FROM auditoria_eventos s
        WHERE (s.entidad = 'solicitante_perfil' OR (s.entidad = 'solicitante' AND s.operacion = 'insercion'))
          AND s.fecha_evento = t.fecha_evento
          AND s.id_entidad = t.id_entidad
    )) AND
    -- El único UPDATE sobre soportes es desvincular id_usuario_subio cuando se
    -- elimina un usuario (usuarios/delete-user.sql); esa eliminación ya queda
    -- auditada como evento 'usuario'.
    NOT (t.entidad = 'soporte' AND t.operacion = 'actualizacion') AND
    -- Estatus inicial ("Asesoría") que crea trigger_crear_cambio_estatus_inicial
    -- al registrar un caso: ya lo cuenta la tarjeta de creación del caso.
    NOT (t.entidad = 'cambio_estatus' AND EXISTS (
        SELECT 1 FROM auditoria_eventos c
        WHERE c.entidad = 'caso' AND c.operacion = 'insercion'
          AND c.fecha_evento = t.fecha_evento
          AND c.id_entidad = split_part(t.id_entidad, '-', 2)
    )) AND
    -- Personas que atienden una cita: van dentro del evento de la cita; si la
    -- cita en sí no cambió, se muestra UNA tarjeta por grupo (la de menor id)
    -- con la lista completa (ver atenciones_evento).
    NOT (t.entidad = 'atencion_cita' AND (
        EXISTS (
            SELECT 1 FROM auditoria_eventos c
            WHERE c.entidad = 'cita'
              AND c.fecha_evento = t.fecha_evento
              AND c.id_entidad = split_part(t.id_entidad, '-', 1) || '-' || split_part(t.id_entidad, '-', 2)
        )
        OR EXISTS (
            SELECT 1 FROM auditoria_eventos s
            WHERE s.entidad = 'atencion_cita' AND s.id < t.id
              AND s.fecha_evento = t.fecha_evento
              AND split_part(s.id_entidad, '-', 1) = split_part(t.id_entidad, '-', 1)
              AND split_part(s.id_entidad, '-', 2) = split_part(t.id_entidad, '-', 2)
        )
    )) AND
    -- Inscripción de estudiante/profesor creada o editada junto con su
    -- usuario: va dentro del evento 'usuario' (ver inscripcion_extra).
    NOT (t.entidad IN ('estudiante', 'profesor') AND EXISTS (
        SELECT 1 FROM auditoria_eventos u
        WHERE u.entidad = 'usuario'
          AND u.operacion = t.operacion
          AND u.fecha_evento = t.fecha_evento
          AND u.id_entidad = COALESCE(
                t.datos_nuevos->>'cedula_estudiante', t.datos_nuevos->>'cedula_profesor',
                t.datos_anteriores->>'cedula_estudiante', t.datos_anteriores->>'cedula_profesor',
                substring(t.id_entidad from '^[^-]+-[^-]+-(.+)$'))
    )) AND
    -- ---------------------------------------------------------------------
    -- Filtros de la UI
    -- ---------------------------------------------------------------------
    ({{entidad}}::text IS NULL OR t.entidad_vista = {{entidad}}) AND
    ({{usuario}}::text IS NULL OR t.id_usuario = {{usuario}}) AND
    ({{operacion}}::text IS NULL OR t.operacion_vista = {{operacion}}) AND
    ({{fecha_inicio}}::date IS NULL OR t.fecha_evento >= {{fecha_inicio}}::date) AND
    ({{fecha_fin}}::date IS NULL OR t.fecha_evento < {{fecha_fin}}::date + 1) AND
    ({{busqueda}}::text IS NULL OR (
        -- Valores del evento (textos, nombres de catálogos propios...). Solo los
        -- VALORES: con ::text del jsonb completo también coincidían los nombres
        -- de las claves ("eliminado" → caso_eliminado, "caso" → id_caso).
        unaccent(lower(
            COALESCE(jsonb_path_query_array(t.datos_nuevos, 'strict $.** ? (@.type() != "object" && @.type() != "array")')::text, '') || ' ' ||
            COALESCE(jsonb_path_query_array(t.datos_anteriores, 'strict $.** ? (@.type() != "object" && @.type() != "array")')::text, '') || ' ' ||
            COALESCE(jsonb_path_query_array(t.metadata, 'strict $.** ? (@.type() != "object" && @.type() != "array")')::text, '')))
            LIKE '%' || unaccent(lower({{busqueda}})) || '%'
        -- Quien hizo la acción
        OR EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.cedula = t.id_usuario
              AND unaccent(lower(u.nombres || ' ' || u.apellidos)) LIKE '%' || unaccent(lower({{busqueda}})) || '%'
        )
        -- Personas referenciadas por cédula (usuario afectado, miembros del
        -- equipo, ejecutores, quienes atienden, solicitante del caso...)
        OR EXISTS (
            SELECT 1 FROM (
                SELECT cedula, nombres, apellidos FROM usuarios
                UNION ALL
                SELECT cedula, nombres, apellidos FROM solicitantes
            ) p
            WHERE unaccent(lower(p.nombres || ' ' || p.apellidos)) LIKE '%' || unaccent(lower({{busqueda}})) || '%'
              AND (p.cedula = t.id_entidad
                   OR position(p.cedula IN COALESCE(t.id_entidad, '')) > 0
                   OR (COALESCE(t.datos_nuevos::text, '') || COALESCE(t.datos_anteriores::text, '') || COALESCE(t.metadata::text, ''))
                        LIKE '%"' || p.cedula || '"%')
        )
        -- Catálogos referenciados solo por id (núcleo, materia, estado, nivel
        -- educativo, condición de trabajo/actividad, tipo de característica)
        OR EXISTS (
            SELECT 1 FROM (
                SELECT 'id_nucleo' AS clave, id_nucleo::text AS id, nombre_nucleo AS nombre FROM nucleos
                UNION ALL SELECT 'id_materia', id_materia::text, nombre_materia FROM materias
                UNION ALL SELECT 'id_estado', id_estado::text, nombre_estado FROM estados
                UNION ALL SELECT 'id_nivel_educativo', id_nivel_educativo::text, descripcion FROM niveles_educativos
                UNION ALL SELECT 'id_nivel_educativo_jefe', id_nivel_educativo::text, descripcion FROM niveles_educativos
                UNION ALL SELECT 'id_trabajo', id_trabajo::text, nombre_trabajo FROM condicion_trabajo
                UNION ALL SELECT 'id_actividad', id_actividad::text, nombre_actividad FROM condicion_actividad
                UNION ALL SELECT 'id_tipo_caracteristica', id_tipo::text, nombre_tipo_caracteristica FROM tipo_caracteristicas
            ) c
            WHERE unaccent(lower(c.nombre)) LIKE '%' || unaccent(lower({{busqueda}})) || '%'
              AND c.id IN (t.datos_nuevos->>c.clave, t.datos_anteriores->>c.clave, t.metadata->>c.clave)
        )
        -- Categoría / subcategoría / ámbito legal (claves compuestas)
        OR EXISTS (
            SELECT 1 FROM ambitos_legales al
            JOIN subcategorias sub ON sub.id_materia = al.id_materia AND sub.num_categoria = al.num_categoria AND sub.num_subcategoria = al.num_subcategoria
            JOIN categorias cat ON cat.id_materia = al.id_materia AND cat.num_categoria = al.num_categoria
            WHERE unaccent(lower(cat.nombre_categoria || ' ' || sub.nombre_subcategoria || ' ' || al.nombre_ambito_legal)) LIKE '%' || unaccent(lower({{busqueda}})) || '%'
              AND al.id_materia::text = COALESCE(t.datos_nuevos->>'id_materia', t.datos_anteriores->>'id_materia', t.metadata->>'id_materia')
              AND al.num_categoria::text = COALESCE(t.datos_nuevos->>'num_categoria', t.datos_anteriores->>'num_categoria', t.metadata->>'num_categoria')
              AND (al.num_subcategoria::text = COALESCE(t.datos_nuevos->>'num_subcategoria', t.datos_anteriores->>'num_subcategoria', t.metadata->>'num_subcategoria')
                   OR COALESCE(t.datos_nuevos->>'num_subcategoria', t.datos_anteriores->>'num_subcategoria', t.metadata->>'num_subcategoria') IS NULL)
        )
    )) AND
    ({{tx_id}}::text IS NULL OR t.metadata->>'tx_id' = {{tx_id}}) AND
    ({{id_transaccion}}::text IS NULL OR t.id_transaccion::text = {{id_transaccion}})
