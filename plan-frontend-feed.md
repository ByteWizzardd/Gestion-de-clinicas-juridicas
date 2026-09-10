# Plan — Persona B: Feed, rutas y limpieza

> Contrato compartido con Persona A: la firma de `<AuditEventCard evento={...} />`
> (definida en [plan-frontend-nucleo.md](plan-frontend-nucleo.md)) y
> `config/audit-entities.ts`. Mientras Persona A no termine el componente real, crea
> un stub mínimo de `AuditEventCard.tsx` con esa misma firma (solo pinta
> `evento.entidad` / `evento.operacion` en texto plano) para poder construir e
> integrar `AuditFeed` ya mismo, sin bloquearte. Cuando Persona A entregue la versión
> real, la reemplazas sin tocar nada más.

## Contexto

El backend ya expone `getAuditoriaEventosAction(limit)` en
[app/actions/audit.ts](app/actions/audit.ts) y la capa de queries
([lib/db/queries/auditoria/get-eventos.ts](lib/db/queries/auditoria/get-eventos.ts))
ya soporta filtros/paginación completos (`getEventos(filters)` devuelve
`{ eventos, total }` — ver [types/audit-events.ts](types/audit-events.ts)). Falta
conectar esa función a la action pública (hoy `getAuditoriaEventosAction` solo reenvía
`limit`, ignorando filtros/offset) — es un cambio chico, de una función, que puedes
hacer tú mismo al arrancar (no hace falta esperar a nadie, es mecánico):

```ts
// app/actions/audit.ts
export async function getAuditEventsAction(filters?: AuditoriaEventoFilters): Promise<AuditoriaEventosPage> {
  await requireCoordinador();
  return auditoriaQueries.getEventos(filters);
}
```

Con eso ya tienes de qué construir el feed.

## 1. `components/audit/AuditFeed.tsx`

Reemplaza `components/audit/detail/AuditDetailClient.tsx` (578 líneas),
`components/audit/AuditGeneralView.tsx` (386 líneas), la lista de
`components/audit/SesionesAuditClient.tsx` (441 líneas), y la búsqueda local de
`components/audit/AuditModulesView.tsx` — hoy son 3-4 implementaciones independientes
de lo mismo (filtros + paginación + lista).

```tsx
interface AuditFeedProps {
  entidad?: string; // si no se pasa, es el feed unificado de todas las entidades
}
export default function AuditFeed({ entidad }: AuditFeedProps)
```

Internamente:
- Filtros: rango de fecha, actor (`idUsuario`), operación, búsqueda de texto — llaman a
  `getAuditEventsAction({ entidad, ...filtros, limit, offset })`.
- Paginación server-side usando `total` de `AuditoriaEventosPage`.
- Renderiza una lista de `<AuditEventCard evento={e} />` por cada fila.
- Antes de escribir el layout de filtros/paginación desde cero, revisar si ya hay un
  `TablePagination`/filtro genérico compartido en `components/ui/` (varias otras
  pantallas del proyecto ya paginan) y reusarlo en vez de duplicar otra vez.

## 2. Ruta dinámica `app/dashboard/audit/[entidad]/page.tsx`

Reemplaza las ~20 rutas `page.tsx` casi idénticas bajo `app/dashboard/audit/`
(`citas/`, `usuarios/`, `equipo/`, `sesiones/`, `reportes/`, `catalogos/*/`, `casos/`,
etc.) y los componentes que las alimentaban
(`components/audit/AuditEntityDetailClient.tsx`,
`app/dashboard/audit/casos/AuditCasesTabs.tsx`).

```tsx
export default function Page({ params }: { params: { entidad: string } }) {
  const config = AUDIT_ENTITIES[params.entidad];
  if (!config) notFound();
  return <AuditFeed entidad={params.entidad} title={config.label} />;
}
```

## 3. Vista principal (`/dashboard/audit`)

- `components/audit/AuditClient.tsx` (66 líneas) se mantiene con el toggle
  general/módulos.
- La pestaña "general" pasa a ser `<AuditFeed />` sin `entidad` (feed unificado) — esto
  reemplaza por completo la lógica manual de `AuditGeneralView.tsx` que hoy tiene que
  "adivinar" el tipo de registro a partir de strings en español
  (`mapUnifiedLogToAuditRecord`, [AuditGeneralView.tsx:126-293](components/audit/AuditGeneralView.tsx:126))
  — ya no hace falta, `evento.entidad`/`evento.operacion` vienen crudos.
- `components/audit/AuditModulesView.tsx` deja de tener la lista hardcodeada de 24
  objetos: iterar `AUDIT_ENTITIES` (de Persona A) y pedir `getAuditCountsAction()` (ya
  existe) para los contadores + última actividad por entidad, en vez de las ~70
  llamadas `.getCount()` que hacía la versión vieja del backend.

## 4. Limpieza — borrar al terminar

Una vez que `AuditFeed` + la ruta dinámica + `AuditEventCard` (de Persona A) estén
integrados y probados:

- `components/audit/AuditRecordCard.tsx`
- `components/audit/detail/AuditDetailClient.tsx`
- `components/audit/AuditGeneralView.tsx`
- `components/audit/SesionesAuditClient.tsx`
- `components/audit/AuditEntityDetailClient.tsx`
- `components/audit/AuditEntityCard.tsx`, `AuditTypeCard.tsx`, `AuditList.tsx`
- Skeletons que ya no apliquen (`AuditRecordCardSkeleton.tsx`,
  `AuditEntityCardSkeleton.tsx` — revisar si `AuditEventCard`/`AuditFeed` necesitan uno
  nuevo más simple en su lugar)
- Las ~20 rutas `page.tsx` viejas bajo `app/dashboard/audit/` y
  `app/dashboard/audit/casos/AuditCasesTabs.tsx`
- `types/audit.ts` completo (~30 interfaces por-entidad — ya no hacen falta, todo tipa
  contra `AuditoriaEvento`)

## Verificación

- `npm run lint` y `npm run build` después de cada pieza.
- Con el stub de `AuditEventCard`: navegar `/dashboard/audit`,
  `/dashboard/audit/[cualquier-entidad]` — debe verse la lista con paginación y
  filtros funcionando (aunque las tarjetas sean texto plano), sin errores de consola
  ni de build.
- Una vez Persona A entregue el componente real: repetir la navegación para cada
  entidad y comparar filtros, paginación, expandir/colapsar detalle, contra el
  comportamiento viejo.
