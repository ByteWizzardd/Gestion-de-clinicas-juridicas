# Plan — Persona B: Frontend de auditoría

> Contrato compartido con Persona A (backend): [types/audit-events.ts](types/audit-events.ts)
> y las firmas de [app/actions/audit-events.actions.ts](app/actions/audit-events.actions.ts).
> Hoy esas actions devuelven listas vacías (no error) — puedes construir e integrar toda la
> UI ya mismo contra ellas, sin esperar a que la base de datos exista. Cuando Persona A
> conecte los cuerpos reales, tu código empieza a recibir datos sin que cambies nada,
> salvo que el contrato mismo cambie (avísense mutuamente si hace falta un campo nuevo).

## Contexto

El frontend actual de auditoría son ~10 400 líneas repartidas en
[components/audit/AuditRecordCard.tsx](components/audit/AuditRecordCard.tsx) (5126 líneas,
3 `switch` de ~60 `case` cada uno, diffs "antes → después" escritos a mano campo por campo,
con helpers duplicados: `formatOnlyDate`/`formatDateOnly` idénticas, 2 `iconMap` iguales,
`hasTeamChanged` declarado 2 veces, parseo de user-agent duplicado 3 veces),
[app/actions/audit.ts](app/actions/audit.ts) (2479 líneas, 68 exports), y 3-4
implementaciones independientes de "filtros + paginación + lista"
(`AuditDetailClient.tsx`, `AuditGeneralView.tsx`, `SesionesAuditClient.tsx`, la búsqueda
local de `AuditModulesView.tsx`), más ~20 rutas `page.tsx` casi idénticas bajo
`app/dashboard/audit/`. El reemplazo: una tabla de configuración por entidad, un
componente genérico de diff, un feed único parametrizable, y una ruta dinámica.

## 1. `config/audit-entities.ts` (nuevo, canónico)

Un objeto indexado por `entidad` (el mismo string que Persona A guarda en la columna
`entidad` de `auditoria_eventos` — usar los valores ya listados en el comentario de
[types/audit-events.ts](types/audit-events.ts): `'caso'`, `'usuario'`, `'categoria'`,
`'sesion'`, `'equipo'`, `'solicitante'`, `'beneficiario'`, `'cita'`, `'accion'`,
`'soporte'`, `'reporte'`, y el resto de catálogos). Cada entrada:

```ts
interface AuditEntityConfig {
  label: string;              // "Caso", "Categoría", ...
  icon: LucideIcon;
  color: string;               // tailwind text color, ej. 'text-blue-600'
  ruta: string;                 // slug para /dashboard/audit/[entidad]
  entidadPadre?: string;        // ej. 'equipo' -> 'caso', para poder linkear al caso dueño
}
export const AUDIT_ENTITIES: Record<string, AuditEntityConfig> = { ... };
```

Reemplaza: `moduleColors` ([AuditRecordCard.tsx:49-60](components/audit/AuditRecordCard.tsx:49)),
los 2 `iconMap` duplicados (líneas 895 y 1073 del mismo archivo), las cadenas `if/else` de
`nameField`/`entidadFuerte` repetidas 4 veces, `entityMap` de
[AuditGeneralView.tsx:199-219](components/audit/AuditGeneralView.tsx:199), la lista de 24
objetos hardcodeados de [AuditModulesView.tsx:60-557](components/audit/AuditModulesView.tsx:60),
y las 3 uniones de string casi idénticas de `AuditEntityDetailClient.tsx`,
`AuditDetailClient.tsx:14-35` y `AuditCasesTabs.tsx`.

También crear un `fieldLabels: Record<string, string>` (mismo archivo o
`config/audit-field-labels.ts`) que traduzca nombres de columna de BD a etiquetas en
español para el diff genérico (`fecha_solicitud` → "Fecha de solicitud",
`nombres` → "Nombres", etc.) — se completa incrementalmente a medida que se prueba cada
entidad, no hace falta cubrir el 100% de columnas antes de arrancar (usar el nombre crudo
como fallback si falta la etiqueta).

## 2. `components/audit/FieldDiff.tsx` (nuevo)

```tsx
<FieldDiff label="Nombres" before={r.nombres_anterior} after={r.nombres_nuevo} />
```
El bloque "tachado → nuevo" que hoy está copiado a mano decenas de veces (ver
[AuditRecordCard.tsx:2687-2822](components/audit/AuditRecordCard.tsx:2687) como ejemplo
representativo del patrón: label, valor anterior tachado, flecha, valor nuevo, oculto si
son iguales o ambos vacíos). Debe manejar bien `null`/`undefined`/fechas ISO/booleanos
(mostrar "N/A" para vacío, formatear fechas), y tener una variante para diffs de arrays
(lista de removidos/agregados) reutilizable en equipo/ejecutores/artefactos.

## 3. `components/audit/AuditEventCard.tsx` (nuevo, reemplaza `AuditRecordCard.tsx`)

Recibe un `AuditoriaEvento` (del contrato compartido) y:
- **Resumen** (fila colapsada): icono + label + color desde `AUDIT_ENTITIES[evento.entidad]`,
  `evento.nombre_completo_usuario` o `evento.id_usuario` como actor, fecha formateada,
  badge de operación (Creación/Actualización/Eliminación/...).
- **Detalle** (expandido, genérico): si `datos_anteriores` y `datos_nuevos` existen ambos
  (`operacion==='actualizacion'`), iterar la unión de sus keys y renderizar un
  `<FieldDiff>` por cada una usando `fieldLabels`. Si solo hay `datos_nuevos`
  (`insercion`) o solo `datos_anteriores` (`eliminacion`), listar key→valor con las mismas
  etiquetas.
- **Renderers custom** (registro pequeño `Record<string, CustomRenderer>`, solo para lo que
  de verdad no encaja en el loop genérico):
  - `sesion`: parsear user-agent (`dispositivo`)/calcular duración desde
    `metadata.fecha_cierre` — lógica que hoy está duplicada en
    [AuditRecordCard.tsx](components/audit/AuditRecordCard.tsx) (casos `sesion` en
    `renderSummary`/`renderDetails`) y en
    [SesionesAuditClient.tsx:55-90](components/audit/SesionesAuditClient.tsx:55)
    (`parseUserAgent`/`formatDuration`) — implementarla **una sola vez** aquí.
  - `reporte`: labels de filtros aplicados (ver
    [AuditRecordCard.tsx:4806-4843](components/audit/AuditRecordCard.tsx:4806) como
    referencia de qué claves de filtro existen).
  - `equipo` / `accion` (para el sub-caso de `datos_nuevos.ejecutores`): diff de arrays
    (miembros/ejecutores agregados vs removidos) usando la variante de array de
    `FieldDiff`.
- Todo lo demás (~25 entidades de catálogo + caso + solicitante + beneficiario + cita +
  soporte) sale del loop genérico sin código por-entidad.

## 4. `components/audit/AuditFeed.tsx` (nuevo)

Reemplaza `AuditDetailClient.tsx`, `AuditGeneralView.tsx`, la lista de
`SesionesAuditClient.tsx`, y la búsqueda local de `AuditModulesView.tsx` — hoy son 3-4
implementaciones independientes de lo mismo. Props: `{ entidad?: string }` (si no se pasa,
es el feed unificado de todas las entidades). Internamente:
- Filtros: rango de fecha, actor, búsqueda de texto, operación — llaman a
  `getAuditEventsAction(filters)` (ya definida en el contrato).
- Paginación server-side usando el `total` que ya devuelve `AuditoriaEventosPage`.
- Renderiza una lista de `<AuditEventCard>`.
- Reutilizar el patrón de paginación/tabla ya existente en el proyecto si hay un
  `TablePagination` genérico compartido (revisar `components/ui/` antes de escribir uno
  nuevo).

## 5. Rutas

- `app/dashboard/audit/[entidad]/page.tsx` (nueva, dinámica): lee `params.entidad`, busca
  en `AUDIT_ENTITIES`, si no existe hace `notFound()`, renderiza `<AuditFeed entidad={...} />`
  con el título/descripción de la config. Reemplaza las ~20 rutas `page.tsx` casi idénticas
  bajo `app/dashboard/audit/` (citas, usuarios, equipo, sesiones, reportes,
  `catalogos/*`, casos, etc.) y el `AuditEntityDetailClient.tsx`/`AuditCasesTabs.tsx` que
  las alimentaban.
- `app/dashboard/audit/(main)/page.tsx` (existente, [AuditClient.tsx](components/audit/AuditClient.tsx)):
  se mantiene el toggle general/módulos, pero:
  - La vista "general" usa `<AuditFeed />` sin `entidad` (unificada).
  - `AuditModulesView.tsx` deja de tener la lista hardcodeada de 24 objetos: itera
    `AUDIT_ENTITIES` y pide `getAuditModuleSummaryAction()` (ya definida en el contrato)
    para los contadores + última actividad por entidad, en vez de las ~70 llamadas
    `.getCount()` que hacía antes.

## 6. Qué se borra al terminar

`components/audit/AuditRecordCard.tsx`, `AuditDetailClient.tsx` (`detail/`),
`AuditGeneralView.tsx`, `SesionesAuditClient.tsx`, `AuditEntityDetailClient.tsx`,
`AuditEntityCard.tsx`, `AuditTypeCard.tsx`, `AuditList.tsx`, los skeletons que ya no
apliquen (`AuditRecordCardSkeleton.tsx`, `AuditEntityCardSkeleton.tsx` — revisar si
`AuditEventCard`/`AuditFeed` necesitan uno nuevo más simple), las ~20 rutas `page.tsx`
viejas bajo `app/dashboard/audit/` y `app/dashboard/audit/casos/AuditCasesTabs.tsx`,
`types/audit.ts` completo (con sus ~30 interfaces por-entidad — ya no hacen falta, todo
tipa contra `AuditoriaEvento`).

## Verificación

- `npm run lint` y `npm run build` después de cada componente nuevo.
- Con los stubs de Persona A (listas vacías): navegar `/dashboard/audit` y
  `/dashboard/audit/[cualquier-entidad]` — debe verse un estado vacío correcto, sin
  errores de consola ni de build.
- Una vez Persona A integre datos reales: repetir la navegación y comparar contra el
  comportamiento viejo (filtros, paginación, expandir/colapsar detalle, diffs
  correctos) para cada tipo de entidad, prestando atención a los casos con renderer
  custom (sesión, reporte, equipo).
