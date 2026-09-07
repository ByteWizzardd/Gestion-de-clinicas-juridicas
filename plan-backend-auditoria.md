# Plan — Persona A: Base de datos y backend de auditoría

> Contrato compartido con Persona B (frontend): [types/audit-events.ts](types/audit-events.ts)
> y las firmas de [app/actions/audit-events.actions.ts](app/actions/audit-events.actions.ts).
> No cambies nombres/formas ahí sin avisarle — es lo único que ambos tocan. Tu trabajo es
> reemplazar los `TODO(backend)` de ese archivo por la implementación real, todo lo demás
> (`database/`, `lib/db/`, los call-sites de `app/actions/casos.ts`, `lib/services/casos.service.ts`,
> `app/actions/reports.ts`, etc.) es tuyo en exclusiva.

## Contexto

Hoy la auditoría son 70 tablas físicas (una por entidad × operación) con columnas
duplicadas, 79 `CREATE TRIGGER` sobre 70 funciones hardcodeadas en
[triggers.sql](database/schemas/triggers.sql) (3161 líneas), 3 stored procedures en
[functions.sql](database/schemas/functions.sql) que insertan auditoría a mano
(bypasseando los triggers), ~30 nombres de variable de sesión inconsistentes, 68 carpetas
`database/queries/auditoria-*/`, y un feed unificado armado con un `UNION ALL` de 1137
líneas ([get-unified-logs.sql](database/queries/audit/get-unified-logs.sql)) más otro casi
idéntico de 465 líneas solo para contar ([count-unified-logs.sql](database/queries/audit/count-unified-logs.sql)).
[app/actions/audit.ts](app/actions/audit.ts) tiene 2479 líneas con 68 server actions casi
idénticas. El reemplazo: una tabla `auditoria_eventos` (JSONB) + una función trigger
genérica parametrizada, con el historial migrado antes de borrar nada viejo.

## 1. Esquema nuevo

Agregar a `database/schemas/schema.sql` (sección nueva, al final del bloque de auditoría):

```sql
CREATE TABLE auditoria_eventos (
    id BIGSERIAL PRIMARY KEY,
    entidad VARCHAR(50) NOT NULL,           -- 'caso', 'usuario', 'categoria', 'sesion', ...
    operacion VARCHAR(30) NOT NULL,         -- 'insercion' | 'actualizacion' | 'eliminacion'
                                             -- | 'inicio_sesion' | 'generacion_reporte' | 'vista_previa_reporte' | 'descarga_soporte'
    id_entidad TEXT,                        -- clave natural (soporta compuestas: "3-12")
    id_usuario VARCHAR(20),                 -- actor
    datos_anteriores JSONB,                 -- solo columnas que cambiaron (update) o fila completa (delete)
    datos_nuevos JSONB,                     -- solo columnas que cambiaron (update) o fila completa (insert)
    metadata JSONB,                         -- motivo, ip, dispositivo, tipo_reporte, filtros, etc.
    fecha_evento TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);
CREATE INDEX idx_auditoria_eventos_entidad_fecha ON auditoria_eventos (entidad, fecha_evento DESC);
CREATE INDEX idx_auditoria_eventos_usuario ON auditoria_eventos (id_usuario);
CREATE INDEX idx_auditoria_eventos_id_entidad ON auditoria_eventos (entidad, id_entidad);
CREATE INDEX idx_auditoria_eventos_datos_nuevos_gin ON auditoria_eventos USING GIN (datos_nuevos);
```

Nota: `operacion` incluye tanto operaciones de trigger (`insercion`/`actualizacion`/
`eliminacion`) como eventos de aplicación (`inicio_sesion`, `generacion_reporte`,
`vista_previa_reporte`, `descarga_soporte`) y también cubre `'equipo'`/`accion_ejecutores`
(ver §3) con `operacion='actualizacion'`/`'insercion'`/`'eliminacion'` según corresponda —
lo que los distingue es el campo `entidad`, no `operacion`.

## 2. Función trigger genérica

En `database/schemas/triggers.sql` (reemplaza las 70 funciones existentes):

```sql
CREATE OR REPLACE FUNCTION public.fn_auditoria_generica()
RETURNS trigger LANGUAGE plpgsql AS $function$
DECLARE
    v_usuario   VARCHAR(20);
    v_entidad   TEXT := TG_ARGV[0];
    v_pk_cols   TEXT[] := string_to_array(TG_ARGV[1], ',');
    v_old       JSONB; v_new JSONB;
    v_before    JSONB := '{}'::jsonb; v_after JSONB := '{}'::jsonb;
    v_key       TEXT; v_id_entidad TEXT;
BEGIN
    IF current_setting('app.skip_audit_trigger', true) = 'true' THEN
        RETURN COALESCE(NEW, OLD);
    END IF;
    v_usuario := NULLIF(current_setting('app.current_user_id', true), '');

    IF TG_OP = 'INSERT' THEN
        v_after := to_jsonb(NEW);
        v_id_entidad := (SELECT string_agg(to_jsonb(NEW)->>c, '-') FROM unnest(v_pk_cols) c);
        INSERT INTO auditoria_eventos(entidad, operacion, id_entidad, id_usuario, datos_nuevos, metadata)
        VALUES (v_entidad, 'insercion', v_id_entidad, v_usuario, v_after,
                NULLIF(current_setting('app.audit_metadata', true), '')::jsonb);
    ELSIF TG_OP = 'DELETE' THEN
        v_before := to_jsonb(OLD);
        v_id_entidad := (SELECT string_agg(to_jsonb(OLD)->>c, '-') FROM unnest(v_pk_cols) c);
        INSERT INTO auditoria_eventos(entidad, operacion, id_entidad, id_usuario, datos_anteriores, metadata)
        VALUES (v_entidad, 'eliminacion', v_id_entidad, v_usuario, v_before,
                NULLIF(current_setting('app.audit_metadata', true), '')::jsonb);
    ELSE -- UPDATE: solo columnas que cambiaron
        v_old := to_jsonb(OLD); v_new := to_jsonb(NEW);
        FOR v_key IN SELECT key FROM jsonb_object_keys(v_new) key LOOP
            IF v_old->v_key IS DISTINCT FROM v_new->v_key THEN
                v_before := v_before || jsonb_build_object(v_key, v_old->v_key);
                v_after  := v_after  || jsonb_build_object(v_key, v_new->v_key);
            END IF;
        END LOOP;
        IF v_before <> '{}'::jsonb THEN
            v_id_entidad := (SELECT string_agg(v_new->>c, '-') FROM unnest(v_pk_cols) c);
            INSERT INTO auditoria_eventos(entidad, operacion, id_entidad, id_usuario, datos_anteriores, datos_nuevos, metadata)
            VALUES (v_entidad, 'actualizacion', v_id_entidad, v_usuario, v_before, v_after,
                    NULLIF(current_setting('app.audit_metadata', true), '')::jsonb);
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END; $function$;
```

Cada tabla base auditada pasa de 3 funciones + 3 triggers a una línea. Ejemplos (recorrer
`triggers.sql` para obtener la lista completa de ~30 tablas y sus columnas de clave natural
— revisar también las compuestas como `categorias`/`subcategorias`/`ambitos_legales`):

```sql
CREATE TRIGGER trg_audit_casos AFTER INSERT OR UPDATE OR DELETE ON casos
  FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('caso', 'id_caso');

CREATE TRIGGER trg_audit_categorias AFTER INSERT OR UPDATE OR DELETE ON categorias
  FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('categoria', 'id_materia,num_categoria');
```

## 3. Convención de sesión unificada

Reemplaza los ~30 nombres actuales por 3 variables fijas:
- `app.current_user_id` — cédula del actor (reemplaza `app.usuario_actualiza_caso`,
  `app.usuario_crea_catalogo`, `app.usuario_actualiza_catalogo`, `app.usuario_elimina_catalogo`,
  `app.usuario_actualiza_solicitante`, `app.usuario_registra`, etc.)
- `app.audit_metadata` — JSON de texto opcional con contexto extra (motivo de eliminación,
  etc.), se mergea en la columna `metadata`.
- `app.skip_audit_trigger` — ya existe, se conserva tal cual.

Call-sites concretos a actualizar (cambiar `set_config('app.usuario_X', ...)` por
`set_config('app.current_user_id', ...)`, y mover cualquier "motivo" a
`set_config('app.audit_metadata', '{"motivo":"..."}', true)`):
- [lib/db/queries/usuarios.queries.ts:203](lib/db/queries/usuarios.queries.ts:203),
  [:582](lib/db/queries/usuarios.queries.ts:582), [:604](lib/db/queries/usuarios.queries.ts:604)
- [app/actions/catalogos/categorias.actions.ts](app/actions/catalogos/categorias.actions.ts)
  líneas 30/86/101-102/113/128/176/210/264-265, y sus análogos para el resto de catálogos
  (ambitos_legales, subcategorias, estados, materias, niveles-educativos, nucleos,
  condiciones-trabajo, condiciones-actividad, tipos-caracteristicas, semestres, municipios,
  parroquias, caracteristicas — mismo patrón, buscar `set_config('app.usuario_` en
  `app/actions/catalogos/`)
- [lib/db/queries/solicitantes.queries.ts:660](lib/db/queries/solicitantes.queries.ts:660),
  [:682](lib/db/queries/solicitantes.queries.ts:682)
- [lib/db/queries/beneficiarios.queries.ts:217](lib/db/queries/beneficiarios.queries.ts:217),
  [:251-252](lib/db/queries/beneficiarios.queries.ts:251), [:275](lib/db/queries/beneficiarios.queries.ts:275)
  (ya usa `app.current_user_id` en algunos puntos — unificar el resto)
- **Corregir además la interpolación manual insegura** (reemplazar por `set_config`
  parametrizado): [lib/db/queries/casos.queries.ts:128](lib/db/queries/casos.queries.ts:128)
  y [app/actions/casos.ts:732](app/actions/casos.ts:732)
  (hoy hacen `SET LOCAL app.usuario_registra = '${cedulaEscapada}'` con escape manual).

## 4. Casos especiales (no son diff de una fila — insertar directo en `auditoria_eventos`)

- **Equipo** ([app/actions/casos.ts:1235-1328](app/actions/casos.ts:1235)): hoy hace un
  `INSERT` en tabla padre + un `SELECT`+`INSERT` por miembro en tablas `_anterior`/`_nuevo`
  (N+1). Reemplazar por: una sola query batch `SELECT cedula, nombres, apellidos FROM
  usuarios WHERE cedula = ANY($1)` para resolver nombres, armar los arrays JSON en JS, y un
  único `INSERT INTO auditoria_eventos (entidad, operacion, id_entidad, id_usuario,
  datos_anteriores, datos_nuevos) VALUES ('equipo', 'actualizacion', id_caso, actor,
  jsonb_build_object('miembros', [...]), jsonb_build_object('miembros', [...]))`.
- **Ejecutores de acciones** ([app/actions/casos.ts:763-793](app/actions/casos.ts:763),
  [lib/services/casos.service.ts:495-698](lib/services/casos.service.ts:495)): hoy
  re-consulta "la fila de auditoría más reciente" para adjuntar los ejecutores — con un bug
  confirmado de mis-atribución cuando el trigger padre no se disparó. Reemplazar: usar
  `INSERT INTO auditoria_eventos (...) VALUES (...) RETURNING id` para capturar el id
  directo en la misma sentencia que audita `acciones`, sin re-`SELECT`. `entidad='accion'`,
  con `datos_anteriores.ejecutores`/`datos_nuevos.ejecutores` como arrays.
- **Artefactos domésticos**: eliminar la tabla `auditoria_artefactos_domesticos` (tri-estado
  `anterior`/`nuevo`/`sin_cambio`, sin ningún GRANT — bug de permisos preexistente). Guardar
  como array dentro de `datos_anteriores.artefactos_domesticos` /
  `datos_nuevos.artefactos_domesticos` del mismo evento de `entidad='solicitante'` — el
  frontend solo resalta lo que cambió, así que el estado `sin_cambio` deja de hacer falta.
- **Sesiones**: mismo comportamiento que hoy (mutable), pero contra `auditoria_eventos`:
  - Login: `INSERT INTO auditoria_eventos (entidad, operacion, id_usuario, datos_nuevos, metadata) VALUES ('sesion', 'inicio_sesion', cedula, jsonb_build_object('exitoso', ...), jsonb_build_object('ip', ..., 'dispositivo', ...)) RETURNING id` —
    reemplaza [database/queries/auditoria-sesiones/registrar-inicio-sesion.sql](database/queries/auditoria-sesiones/registrar-inicio-sesion.sql),
    llamado desde [lib/services/auth.service.ts:36,55,69](lib/services/auth.service.ts:36) y
    [app/actions/auth.ts:93-99](app/actions/auth.ts:93).
  - Logout: `UPDATE auditoria_eventos SET metadata = metadata || jsonb_build_object('fecha_cierre', NOW() AT TIME ZONE 'America/Caracas') WHERE id = $1` —
    reemplaza [database/queries/auditoria-sesiones/registrar-cierre-sesion.sql](database/queries/auditoria-sesiones/registrar-cierre-sesion.sql),
    llamado desde [app/actions/auth.ts:189-193](app/actions/auth.ts:189) (usa el `id` guardado
    en la cookie `session_id`, igual que hoy).
- **Reportes**: `INSERT INTO auditoria_eventos (entidad='reporte', operacion='generacion_reporte'|'vista_previa_reporte', id_usuario, datos_nuevos=jsonb con tipo/filtros)` —
  reemplaza [database/queries/auditoria-reportes/insert.sql](database/queries/auditoria-reportes/insert.sql),
  llamado desde [app/actions/reports.ts:843-865](app/actions/reports.ts:843).
- **Descarga de soportes**: `INSERT INTO auditoria_eventos (entidad='soporte', operacion='descarga_soporte', ...)` —
  reemplaza [database/queries/auditoria-descarga-soportes/insert.sql](database/queries/auditoria-descarga-soportes/insert.sql),
  llamado desde [app/actions/casos.ts:336](app/actions/casos.ts:336).
- **3 stored procedures en `functions.sql`** (`eliminar_usuario_fisico`,
  `toggle_habilitado_usuario`, `update_all_by_cedula`) hoy hacen `INSERT INTO auditoria_*`
  manual. Simplificar: agregar `PERFORM set_config('app.current_user_id', p_cedula_actor, true);`
  al inicio de cada una y **borrar** su `INSERT INTO auditoria_*` manual — el trigger
  genérico sobre `usuarios` hace el resto automáticamente en el mismo `DELETE`/`UPDATE`
  que ya ejecutan.

## 5. Permisos

Colapsar los grants asimétricos actuales (bulk + excepciones por tabla en
[roles_permissions.sql](database/schemas/roles_permissions.sql)) a una sola regla, ya que
la app solo permite *leer* auditoría a coordinadores a nivel de aplicación:

```sql
GRANT INSERT, UPDATE ON auditoria_eventos TO rol_coordinador, rol_profesor, rol_estudiante;
GRANT SELECT ON auditoria_eventos TO rol_coordinador;
GRANT USAGE, SELECT ON SEQUENCE auditoria_eventos_id_seq TO rol_coordinador, rol_profesor, rol_estudiante;
```

## 6. Migración de datos existentes

Un solo archivo `database/migrations/xxx_auditoria_eventos.sql`, no destructivo hasta el
paso final:

1. Crear `auditoria_eventos` + `fn_auditoria_generica` + los ~30 `CREATE TRIGGER` nuevos
   (aditivo, no toca lo viejo todavía — los triggers viejos siguen activos en paralelo un
   momento, o se apagan en el mismo script si prefieres cutover atómico).
2. **Copia genérica** para las ~60 tablas "simples" (patrón insercion/actualizacion/
   eliminacion uniforme, columnas `_anterior`/`_nuevo` o planas): un bloque `DO $$` que
   recorre `information_schema.columns` de cada `auditoria_insercion_x` /
   `auditoria_actualizacion_x` / `auditoria_eliminacion_x`, arma `jsonb_build_object`
   dinámico agrupando por sufijo, y hace `INSERT INTO auditoria_eventos SELECT ...` — una
   función de migración, no 60 `INSERT...SELECT` a mano.
3. **Copia manual** (8 bloques, uno por caso especial): `auditoria_actualizacion_equipo` +
   sus 2 hijas, `auditoria_*_acciones_ejecutores` (3 tablas), `auditoria_artefactos_domesticos`,
   `auditoria_sesiones`, `auditoria_reportes`, `auditoria_descarga_soportes`.
4. **Verificación de conteos**: `SELECT count(*) FROM auditoria_eventos` debe igualar la
   suma de `count(*)` de las 70 tablas viejas — correr antes de continuar.
5. **Cutover**: apagar/borrar los 70 triggers y 70 funciones viejas, renombrar las 70
   tablas a `_old` (NO `DROP` todavía). Documentar en el propio archivo de migración que
   el `DROP TABLE` real de las `_old` (y de las funciones/triggers viejos) va en un
   archivo de limpieza aparte, que solo se ejecuta cuando el usuario confirme
   explícitamente que ya validó todo (irreversible).

## 7. Capa de queries y server actions

- `database/queries/auditoria-eventos/get-eventos.sql`: una sola query parametrizada
  (`entidad`, `operacion`, `id_usuario`, `id_entidad`, `fecha_inicio`/`fecha_fin`,
  `busqueda` contra `datos_nuevos::text ILIKE`/`datos_anteriores::text ILIKE`, `limit`/
  `offset`, `orden`) que devuelve filas + `COUNT(*) OVER() AS total_count` — así se evita
  mantener un segundo archivo de conteo sincronizado. Debe hacer `LEFT JOIN usuarios` para
  resolver `nombre_completo_usuario` (campo ya declarado en el contrato compartido).
- `database/queries/auditoria-eventos/get-by-id.sql`: un evento puntual por `id`.
- `database/queries/auditoria-eventos/get-resumen.sql`: `GROUP BY entidad, operacion` con
  `COUNT(*)` y `MAX(fecha_evento)` — reemplaza las ~70 llamadas `.getCount()` en paralelo
  de `getAuditCountsAction` ([app/actions/audit.ts:79](app/actions/audit.ts:79)).
- `lib/db/queries/auditoria-eventos.queries.ts`: `getEventos(filters)`, `getById(id)`,
  `getResumenPorEntidad()`. Sigue el patrón existente de `loadSQL`
  ([lib/db/sql-loader.ts:23](lib/db/sql-loader.ts:23)) y el `pool` de
  [lib/db/pool.ts](lib/db/pool.ts), igual que cualquier otro `*.queries.ts` del proyecto.
- Reemplazar los cuerpos stub de [app/actions/audit-events.actions.ts](app/actions/audit-events.actions.ts)
  (los 3 `TODO(backend)` ya marcados) por llamadas reales a lo anterior — **no cambiar las
  firmas** sin avisar a Persona B.
- Borrar: [app/actions/audit.ts](app/actions/audit.ts) (2479 líneas),
  [app/actions/audit-general.ts](app/actions/audit-general.ts), las 68 carpetas
  `database/queries/auditoria-*/` y sus `lib/db/queries/auditoria-*.queries.ts` wrappers.

## Orden de ejecución

1. Esquema + trigger genérico + permisos (§1, §2, §5) — aditivo.
2. Migración de datos + verificación de conteos (§6).
3. Normalizar variables de sesión + reescribir casos especiales + simplificar las 3 stored
   procedures + cutover de tablas viejas a `_old` (§3, §4).
4. Capa de queries/actions nueva, cerrar `audit-events.actions.ts`, borrar lo viejo (§7).
5. (Con el usuario, cuando todo esté validado e integrado con el frontend) limpieza final:
   `DROP TABLE`/`DROP FUNCTION` reales de lo `_old`.

## Verificación

- Después de §6: conteo migrado == conteo original (por tabla y total).
- Después de cada paso de código: `npm run lint` y `npm run build`.
- Después de §3: ejercitar manualmente (vía navegador) crear/editar/eliminar un caso, una
  categoría, asignar equipo, login/logout, generar un reporte, descargar un soporte — y
  confirmar en `auditoria_eventos` que aparece la fila con el diff correcto y el actor
  correcto.
- Antes del paso 5 (destructivo): confirmación explícita del usuario.
