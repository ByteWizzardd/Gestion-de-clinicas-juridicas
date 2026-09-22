-- =========================================================
-- Purga MANUAL de auditoria_eventos
-- =========================================================
-- `auditoria_eventos` crece sin tope: es la tabla más grande de la base y
-- nadie la limpia. Esta migración agrega lo necesario para depurarla a mano
-- (nunca en automático) desde el panel de Auditoría del Coordinador.
--
-- Contenido:
--   1. Se elimina el índice GIN muerto sobre datos_nuevos y se agrega uno por
--      fecha_evento (el que sí hace falta para depurar).
--   2. Tabla `auditoria_retencion`: la política editable, una fila por clase
--      de registro.
--   3. `auditoria_clase()`: clasifica un evento. La usan por igual la vista
--      previa y el borrado, así que nunca se pueden desalinear (misma
--      disciplina que el {{FILTRO_EVENTOS}} compartido de filtro-eventos.sql).
--   4. `auditoria_retencion_resumen()`: qué se borraría, sin borrar nada.
--   5. `auditoria_purgar()`: el borrado, SECURITY DEFINER, que se autoaudita.
--
-- Nada de esto corre solo: hace falta que un Coordinador lo dispare.

-- =========================================================
-- 1. ÍNDICES
-- =========================================================
-- El GIN sobre datos_nuevos no lo puede usar nadie: la búsqueda del panel es
-- `unaccent(lower(...)) LIKE '%texto%'` sobre los VALORES del jsonb
-- (filtro-eventos.sql), que ningún operador de jsonb_ops resuelve. Sus propias
-- estadísticas lo confirmaban: 1 scan contra 111.100 del índice entidad+fecha,
-- y pesaba 424 kB — el 18 % de la tabla.
DROP INDEX IF EXISTS idx_auditoria_eventos_datos_nuevos_gin;

-- En cambio sí hace falta uno por fecha sola: la purga filtra por fecha_evento
-- sin fijar la entidad, y además agrupa los eventos hermanos por fecha_evento
-- (ver `auditoria_purgar`). El índice (entidad, fecha_evento) no sirve para eso.
CREATE INDEX IF NOT EXISTS idx_auditoria_eventos_fecha ON auditoria_eventos USING btree (fecha_evento);

-- =========================================================
-- 2. POLÍTICA DE RETENCIÓN (editable desde la app)
-- =========================================================
CREATE TABLE IF NOT EXISTS auditoria_retencion (
    clase              VARCHAR(20)  NOT NULL,
    etiqueta           VARCHAR(60)  NOT NULL,
    descripcion        TEXT         NOT NULL,
    meses_retencion    INTEGER      NOT NULL,
    -- Piso que el Coordinador no puede bajar desde la app. No es decoración:
    -- ver el comentario de cada clase más abajo.
    meses_minimo       INTEGER      NOT NULL,
    orden              INTEGER      NOT NULL,
    id_usuario_modifica VARCHAR(20),
    fecha_modificacion TIMESTAMP    NOT NULL DEFAULT (now() AT TIME ZONE 'America/Caracas'::text),
    CONSTRAINT auditoria_retencion_pkey PRIMARY KEY (clase),
    CONSTRAINT auditoria_retencion_meses_check CHECK (meses_retencion >= meses_minimo),
    CONSTRAINT auditoria_retencion_minimo_check CHECK (meses_minimo >= 1),
    CONSTRAINT auditoria_retencion_tope_check CHECK (meses_retencion <= 600)
);

ALTER TABLE auditoria_retencion
    DROP CONSTRAINT IF EXISTS auditoria_retencion_id_usuario_modifica_fkey;
ALTER TABLE auditoria_retencion
    ADD CONSTRAINT auditoria_retencion_id_usuario_modifica_fkey
    FOREIGN KEY (id_usuario_modifica) REFERENCES usuarios(cedula);

INSERT INTO auditoria_retencion (clase, etiqueta, descripcion, meses_retencion, meses_minimo, orden) VALUES
    ('operativo', 'Actividad operativa',
     'Inicios y cierres de sesión, intentos fallidos, reportes generados y descargas de soportes. Mucho volumen y sin valor probatorio pasado el período.',
     12, 3, 1),
    ('migrado', 'Registros migrados',
     'Eventos que vienen del esquema de auditoría anterior. Guardan la fila completa en vez de solo lo que cambió, así que pesan varias veces más que un evento actual.',
     6, 1, 2),
    ('catalogo', 'Cambios de catálogo',
     'Altas, ediciones y bajas de estados, municipios, parroquias, núcleos, materias, categorías, subcategorías, ámbitos legales, características, niveles educativos, condiciones y semestres.',
     24, 6, 3),
    ('negocio', 'Actividad de casos y personas',
     'Casos, citas, acciones, soportes, beneficiarios, solicitantes, equipos y usuarios. Se conserva por su valor probatorio.',
     60, 24, 4),
    ('eliminacion', 'Eliminaciones',
     'Cualquier borrado de un registro del sistema. Es la única constancia de que ese dato existió.',
     120, 60, 5)
ON CONFLICT (clase) DO NOTHING;

-- El mínimo de 'negocio' son 24 meses a propósito: casos/get-inactive-cases.sql
-- usa los eventos de 'caso' y 'beneficiario' como fechas de actividad del caso
-- para decidir qué casos llevan 2 semestres inactivos. Si se purgan eventos más
-- nuevos que esa ventana, un caso con actividad puede empezar a aparecer como
-- inactivo. Por lo mismo, `auditoria_clase` manda 'caso' y 'beneficiario' a
-- 'negocio'/'eliminacion' y nunca a 'migrado'.

COMMENT ON TABLE auditoria_retencion IS
    'Política de retención de auditoria_eventos, editable por el Coordinador. Una fila por clase de registro; meses_minimo es el piso que la app no deja bajar.';

-- =========================================================
-- 3. CLASIFICACIÓN DE UN EVENTO
-- =========================================================
-- Devuelve NULL para lo que nunca se purga.
-- El ORDEN de los CASE importa, y cada salto tiene su motivo:
--   * los catálogos van ANTES que las eliminaciones para que un "movimiento"
--     de catálogo (DELETE de la clave vieja + INSERT de la nueva, que
--     filtro-eventos.sql muestra como UNA actualización) caiga entero en la
--     misma clase y se purgue junto o no se purgue;
--   * 'caso' y 'beneficiario' se resuelven antes que 'migrado' por la ventana
--     de casos inactivos (ver arriba);
--   * 'eliminacion' gana sobre 'migrado' porque entre los registros migrados
--     hay eliminaciones de casos y de usuarios, que son lo último que se debe
--     perder.
CREATE OR REPLACE FUNCTION public.auditoria_clase(
    p_entidad   TEXT,
    p_operacion TEXT,
    p_metadata  JSONB
) RETURNS TEXT
LANGUAGE sql IMMUTABLE AS $function$
    SELECT CASE
        -- El rastro de la propia depuración (las purgas hechas y los cambios
        -- de política que las permitieron) nunca se purga a sí mismo.
        WHEN p_entidad IN ('auditoria', 'retencion_auditoria') THEN NULL

        WHEN p_entidad IN ('sesion', 'reporte')
          OR (p_entidad = 'soporte' AND p_operacion = 'descarga_soporte') THEN 'operativo'

        WHEN p_entidad IN (
            'estado', 'municipio', 'parroquia', 'nucleo', 'materia', 'categoria',
            'subcategoria', 'ambito_legal', 'caracteristica', 'tipo_caracteristica',
            'nivel_educativo', 'condicion_trabajo', 'condicion_actividad', 'semestre'
        ) THEN 'catalogo'

        WHEN p_entidad IN ('caso', 'beneficiario') THEN
            CASE WHEN p_operacion = 'eliminacion' THEN 'eliminacion' ELSE 'negocio' END

        WHEN p_operacion = 'eliminacion' THEN 'eliminacion'

        WHEN p_metadata ? 'migrado_de' THEN 'migrado'

        ELSE 'negocio'
    END;
$function$;

COMMENT ON FUNCTION public.auditoria_clase(TEXT, TEXT, JSONB) IS
    'Clase de retención de un evento de auditoría. La comparten la vista previa y el borrado para que no se desalineen.';

-- =========================================================
-- 4. VISTA PREVIA
-- =========================================================
-- Qué se borraría hoy, por clase, sin borrar nada. Es lo que pinta la pestaña
-- de Mantenimiento y lo que revisa el chequeo que manda la notificación.
CREATE OR REPLACE FUNCTION public.auditoria_retencion_resumen()
RETURNS TABLE (
    clase            TEXT,
    etiqueta         TEXT,
    descripcion      TEXT,
    meses_retencion  INTEGER,
    meses_minimo     INTEGER,
    fecha_corte      DATE,
    eventos_purgables BIGINT,
    eventos_totales  BIGINT,
    evento_mas_viejo DATE,
    evento_mas_nuevo DATE
)
LANGUAGE sql STABLE AS $function$
    WITH clasificados AS (
        SELECT auditoria_clase(e.entidad, e.operacion, e.metadata) AS clase,
               e.fecha_evento
        FROM auditoria_eventos e
    )
    SELECT
        r.clase::TEXT,
        r.etiqueta::TEXT,
        r.descripcion,
        r.meses_retencion,
        r.meses_minimo,
        ((now() AT TIME ZONE 'America/Caracas')::date
            - make_interval(months => r.meses_retencion))::date AS fecha_corte,
        COALESCE(COUNT(*) FILTER (
            WHERE c.fecha_evento < ((now() AT TIME ZONE 'America/Caracas')::date
                                    - make_interval(months => r.meses_retencion))
        ), 0) AS eventos_purgables,
        COALESCE(COUNT(c.fecha_evento), 0) AS eventos_totales,
        MIN(c.fecha_evento)::date,
        MAX(c.fecha_evento)::date
    FROM auditoria_retencion r
    LEFT JOIN clasificados c ON c.clase = r.clase
    GROUP BY r.clase, r.etiqueta, r.descripcion, r.meses_retencion, r.meses_minimo, r.orden
    ORDER BY r.orden;
$function$;

-- =========================================================
-- 5. LA PURGA
-- =========================================================
-- SECURITY DEFINER porque ningún rol de la app tiene DELETE sobre
-- auditoria_eventos (permisos.sql solo da INSERT/UPDATE/SELECT), y así sigue:
-- el único camino para borrar es esta función, que valida al actor y deja
-- constancia. `search_path` fijo para que el SECURITY DEFINER no se pueda
-- secuestrar con un esquema puesto por delante.
--
-- p_simular = TRUE (por defecto) cuenta sin borrar.
CREATE OR REPLACE FUNCTION public.auditoria_purgar(
    p_clases  TEXT[],
    p_actor   VARCHAR,
    p_simular BOOLEAN DEFAULT TRUE
) RETURNS TABLE (
    clase             TEXT,
    eventos_borrados  BIGINT,
    -- Eventos que cumplían el plazo pero se quedan porque comparten
    -- fecha_evento con otro que no se purga (ver la selección más abajo).
    eventos_retenidos BIGINT,
    evento_mas_viejo  DATE,
    evento_mas_nuevo  DATE
)
-- pg_temp va de último a propósito: así nadie puede adelantar una tabla
-- temporal con el nombre de una tabla real para que la función la use.
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $function$
DECLARE
    v_desconocidas TEXT[];
    v_resumen      JSONB;
    v_total        BIGINT;
    v_retenidos    BIGINT;
    v_lote         INTEGER;
BEGIN
    DROP TABLE IF EXISTS pg_temp.tmp_purga_candidatos;
    DROP TABLE IF EXISTS pg_temp.tmp_purga_final;
    DROP TABLE IF EXISTS pg_temp.tmp_purga_resumen;

    -- ----- Validaciones -----
    IF p_clases IS NULL OR cardinality(p_clases) = 0 THEN
        RAISE EXCEPTION 'Debe indicar al menos una clase de registros a purgar';
    END IF;

    SELECT array_agg(c) INTO v_desconocidas
    FROM unnest(p_clases) c
    WHERE c NOT IN (SELECT r.clase FROM auditoria_retencion r);

    IF v_desconocidas IS NOT NULL THEN
        RAISE EXCEPTION 'Clase de retención desconocida: %', array_to_string(v_desconocidas, ', ');
    END IF;

    IF p_actor IS NULL OR NOT EXISTS (
        SELECT 1 FROM usuarios u
        WHERE u.cedula = p_actor
          AND u.tipo_usuario = 'Coordinador'
          AND u.habilitado_sistema = TRUE
    ) THEN
        RAISE EXCEPTION 'Solo un Coordinador habilitado puede purgar la auditoría';
    END IF;

    -- ----- Selección -----
    -- Un evento entra si su clase fue pedida y ya pasó el corte de ESA clase.
    CREATE TEMP TABLE pg_temp.tmp_purga_candidatos ON COMMIT DROP AS
    SELECT e.id, e.fecha_evento, k.clase
    FROM auditoria_eventos e
    CROSS JOIN LATERAL (SELECT auditoria_clase(e.entidad, e.operacion, e.metadata) AS clase) k
    JOIN auditoria_retencion r ON r.clase = k.clase
    WHERE k.clase = ANY(p_clases)
      AND e.fecha_evento < ((now() AT TIME ZONE 'America/Caracas')::date
                            - make_interval(months => r.meses_retencion));

    CREATE INDEX ON pg_temp.tmp_purga_candidatos (fecha_evento);

    -- El panel no muestra un evento por fila: fusiona los hermanos que
    -- comparten fecha_evento (los ejecutores dentro de su acción, vivienda y
    -- familia dentro del solicitante, el DELETE+INSERT de un movimiento de
    -- catálogo como una sola actualización — ver filtro-eventos.sql). Si se
    -- borra media pareja quedan tarjetas huérfanas o incompletas, así que una
    -- fecha se purga entera o no se purga: si algún hermano se salva por ser de
    -- otra clase o por no haber cumplido su plazo, el grupo completo se queda.
    CREATE TEMP TABLE pg_temp.tmp_purga_final ON COMMIT DROP AS
    SELECT c.id, c.fecha_evento, c.clase
    FROM pg_temp.tmp_purga_candidatos c
    JOIN (
        SELECT g.fecha_evento
        FROM pg_temp.tmp_purga_candidatos g
        GROUP BY g.fecha_evento
        HAVING count(*) = (SELECT count(*) FROM auditoria_eventos o
                           WHERE o.fecha_evento = g.fecha_evento)
    ) completas ON completas.fecha_evento = c.fecha_evento;

    SELECT count(*) INTO v_total FROM pg_temp.tmp_purga_final;
    v_retenidos := (SELECT count(*) FROM pg_temp.tmp_purga_candidatos) - v_total;

    -- El resumen se calcula ANTES de borrar: es lo que se devuelve tanto en
    -- simulación como en la purga real, y para entonces pg_temp.tmp_purga_final ya se
    -- habrá vaciado lote a lote.
    CREATE TEMP TABLE pg_temp.tmp_purga_resumen ON COMMIT DROP AS
    SELECT c.clase,
           count(f.id)::BIGINT                       AS eventos,
           (count(*) - count(f.id))::BIGINT          AS retenidos,
           MIN(f.fecha_evento)::date                 AS mas_viejo,
           MAX(f.fecha_evento)::date                 AS mas_nuevo
    FROM pg_temp.tmp_purga_candidatos c
    LEFT JOIN pg_temp.tmp_purga_final f ON f.id = c.id
    GROUP BY c.clase;

    SELECT COALESCE(jsonb_object_agg(t.clase, t.eventos), '{}'::jsonb) INTO v_resumen
    FROM pg_temp.tmp_purga_resumen t;

    -- ----- Borrado -----
    IF NOT p_simular AND v_total > 0 THEN
        -- Por lotes para no armar una sola sentencia gigante sobre tablas
        -- grandes. Ojo: sigue siendo UNA transacción (la de la función), el
        -- lote acota el trabajo por sentencia, no la duración de la transacción.
        LOOP
            WITH lote AS (
                DELETE FROM pg_temp.tmp_purga_final
                WHERE id IN (SELECT f.id FROM pg_temp.tmp_purga_final f ORDER BY f.id LIMIT 5000)
                RETURNING id
            )
            DELETE FROM auditoria_eventos a USING lote WHERE a.id = lote.id;
            GET DIAGNOSTICS v_lote = ROW_COUNT;
            EXIT WHEN v_lote = 0;
        END LOOP;

        -- La purga se audita a sí misma. Este evento es de entidad 'auditoria',
        -- que `auditoria_clase` deja fuera de toda purga futura.
        INSERT INTO auditoria_eventos (entidad, operacion, id_entidad, id_usuario, datos_anteriores, metadata)
        VALUES (
            'auditoria', 'purga', NULL, p_actor,
            jsonb_build_object('eventos_borrados', v_total, 'por_clase', v_resumen),
            jsonb_build_object(
                'clases', to_jsonb(p_clases),
                'eventos_borrados', v_total,
                'eventos_retenidos_por_agrupacion', v_retenidos,
                'cortes', (SELECT jsonb_object_agg(r.clase, jsonb_build_object(
                                'meses', r.meses_retencion,
                                'fecha_corte', ((now() AT TIME ZONE 'America/Caracas')::date
                                                - make_interval(months => r.meses_retencion))::date))
                           FROM auditoria_retencion r WHERE r.clase = ANY(p_clases))
            )
        );
    END IF;

    RETURN QUERY
    SELECT t.clase, t.eventos, t.retenidos, t.mas_viejo, t.mas_nuevo
    FROM pg_temp.tmp_purga_resumen t
    ORDER BY t.clase;

    DROP TABLE IF EXISTS pg_temp.tmp_purga_candidatos;
    DROP TABLE IF EXISTS pg_temp.tmp_purga_final;
    DROP TABLE IF EXISTS pg_temp.tmp_purga_resumen;
END;
$function$;

-- =========================================================
-- 6. AUDITAR LOS CAMBIOS DE POLÍTICA
-- =========================================================
-- Cambiar el plazo de una clase es una decisión con consecuencias; queda
-- registrada como cualquier otro cambio del sistema.
DROP TRIGGER IF EXISTS trg_audit_auditoria_retencion ON auditoria_retencion;
CREATE TRIGGER trg_audit_auditoria_retencion
AFTER INSERT OR UPDATE OR DELETE ON auditoria_retencion
FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('retencion_auditoria', 'clase');

-- =========================================================
-- 7. PERMISOS
-- =========================================================
-- Sigue sin haber DELETE sobre auditoria_eventos para ningún rol de la app:
-- se borra solo a través de auditoria_purgar().
GRANT SELECT, UPDATE ON auditoria_retencion TO rol_coordinador;
GRANT SELECT ON auditoria_retencion TO rol_profesor, rol_estudiante;
GRANT EXECUTE ON FUNCTION public.auditoria_clase(TEXT, TEXT, JSONB) TO rol_coordinador;
GRANT EXECUTE ON FUNCTION public.auditoria_retencion_resumen() TO rol_coordinador;
GRANT EXECUTE ON FUNCTION public.auditoria_purgar(TEXT[], VARCHAR, BOOLEAN) TO rol_coordinador;
