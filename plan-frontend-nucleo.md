# Plan — Persona A: Núcleo genérico de renderizado (config + diff + card)

> Contrato compartido con Persona B: la firma de `<AuditEventCard>` (abajo) y
> `config/audit-entities.ts`. Persona B construye `AuditFeed` contra un stub de
> `AuditEventCard` con esta misma firma (que tú reemplazas por la implementación
> real) — así nadie espera a nadie. No cambies la firma sin avisar.

## Contexto

Ya revisamos a fondo [AuditRecordCard.tsx](components/audit/AuditRecordCard.tsx)
(5126 líneas, 3 `switch` — resumen/detalle/fecha — para 30 combinaciones
entidad×operación). El backend ya expone eventos genéricos vía `auditoria_eventos`
(`entidad`, `operacion`, `id_entidad`, `id_usuario`, `datos_anteriores`,
`datos_nuevos`, `metadata`, `fecha_evento` — ver [types/audit-events.ts](types/audit-events.ts)).
La capa de queries (`get-unified-logs.sql`, `count-unified-logs.sql`,
[lib/db/queries/auditoria/get-eventos.ts](lib/db/queries/auditoria/get-eventos.ts))
ya quedó ajustada para devolver estos campos crudos en vez de strings ya
formateados en español — no hace falta tocarla.

Tu trabajo es el reemplazo genérico de todo el poder de renderizado de
`AuditRecordCard.tsx`, sin repetir campo por campo a mano.

## 1. `config/audit-entities.ts`

Un objeto indexado por `entidad` (el string crudo que guarda `auditoria_eventos.entidad`:
`'caso'`, `'usuario'`, `'categoria'`, `'ambito_legal'`, `'sesion'`, `'equipo'`,
`'accion_ejecutores'`, `'solicitante_perfil'`, `'solicitante_artefactos'`, `'reporte'`,
`'soporte'`, y el resto de catálogos — la lista completa de valores está en los
`CREATE TRIGGER trg_audit_*` de [schema.sql](database/schemas/schema.sql) y en las
inserciones manuales de `casos.ts`/`casos.service.ts`/`solicitantes.service.ts`).

```ts
interface AuditEntityConfig {
  label: string;                 // "Caso", "Categoría", "Ámbito Legal"...
  icon: LucideIcon;
  color: string;                  // clase tailwind, ej. 'text-blue-600'
  ruta: string;                   // slug para /dashboard/audit/[entidad]
  linkTo?: (idEntidad: string, datos: Record<string, unknown>) => string | null;
  // función opcional: arma el href al registro real (ej. /dashboard/cases/{id})
  parentEntidad?: string;         // ej. 'accion_ejecutores' -> 'accion', para breadcrumb
}
export const AUDIT_ENTITIES: Record<string, AuditEntityConfig> = { ... };
```

Reemplaza: `moduleColors` ([AuditRecordCard.tsx:49-60](components/audit/AuditRecordCard.tsx:49)),
los 2 `iconMap` de catálogos duplicados (líneas 895 y 1073), la lista de 24 objetos
hardcodeados de [AuditModulesView.tsx:60-557](components/audit/AuditModulesView.tsx:60),
el `entityMap` de [AuditGeneralView.tsx:199-219](components/audit/AuditGeneralView.tsx:199).

## 2. `config/audit-field-labels.ts`

Un mapa plano `Record<string, string>` de nombre de columna → etiqueta en español
(`fecha_solicitud` → "Fecha de solicitud", `nombres` → "Nombres", `id_nucleo` → "Núcleo", etc.)
para traducir las claves de `datos_anteriores`/`datos_nuevos` en el diff genérico.
Se completa incrementalmente — usar el nombre crudo (con `_` reemplazado por espacio y
primera letra mayúscula) como fallback si falta la etiqueta, así nunca se ve una clave
sin traducir en blanco.

También un mapa opcional `AUDIT_VALUE_FORMATTERS: Record<string, (v: unknown) => string>`
para los pocos campos con formato especial encontrados en la revisión:
- Booleanos → "Sí"/"No" (`habilitado`, `concubinato`, `jefe_hogar`, `habilitado_sistema`...)
- `nacionalidad` → "Venezolano"/"Extranjero" (V/otro)
- `ingresos_mensuales` → `Bs. 1.234,56` (`Number(v).toLocaleString('es-VE', {minimumFractionDigits:2})`)
- Fechas (cualquier columna que empiece con `fecha_`) → fecha sin hora en español
  (reusar/promover el parser ya escrito en `AuditRecordCard.tsx:114-135` — sin la
  duplicación `formatOnlyDate`/`formatDateOnly` que hoy son idénticas)
- `tiempo_estudio`/`tiempo_estudio_jefe` → combinarlos con su columna hermana
  `tipo_tiempo_estudio`/`tipo_tiempo_estudio_jefe` en un solo valor ("5 Años") — caso
  especial de "campos que van juntos", ver `FieldDiff` más abajo.

## 3. `lib/utils/audit-entity-names.ts` — caché de nombres de catálogo

Decisión ya tomada con el usuario: los campos que son IDs de otra tabla (núcleo, materia,
categoría, solicitante, estado, municipio, parroquia...) deben mostrar el nombre resuelto,
no el ID crudo — el sistema viejo lo hacía con un `JOIN` en cada query; el trigger genérico
nuevo solo guarda el ID.

Construir **un solo** cache genérico, no resolución por-entidad:

```ts
// Carga perezosa y cachea en memoria (por sesión de página) los catálogos ya
// existentes: nucleos, materias, categorias, estados, municipios, parroquias,
// ambitos_legales, subcategorias, solicitantes (nombre por cédula), usuarios.
// Reutiliza las server actions/queries de catálogo que YA existen en el proyecto
// (buscar en app/actions/catalogos/*.actions.ts y lib/db/queries/*.queries.ts
// las que listan todo un catálogo) — no crear queries nuevas si ya hay una que
// devuelva {id, nombre} de cada catálogo.
export async function resolveEntityName(tipo: CatalogoTipo, id: string | number): Promise<string | null>
export function useEntityName(tipo: CatalogoTipo, id: string | number | null | undefined): string | null
// hook cliente que dispara resolveEntityName vía una server action y cachea en memoria
```

Un solo hook (`useEntityName`) se usa en `FieldDiff` cuando el campo está marcado como
"FK a catálogo X" en `AUDIT_FIELD_FK_MAP` (otro mapa chico en `audit-field-labels.ts`:
`id_nucleo -> 'nucleo'`, `id_materia -> 'materia'`, `cedula_solicitante -> 'solicitante'`, etc.).
Si la resolución falla o está cargando, cae al ID crudo — nunca bloquea el render.

## 4. `components/audit/FieldDiff.tsx`

El componente que reemplaza el bloque repetido a mano ~150 veces en el archivo viejo
(ver [AuditRecordCard.tsx:2687-2822](components/audit/AuditRecordCard.tsx:2687) como
referencia exacta del patrón visual: label, tachado en rojo el valor anterior, flecha,
valor nuevo en verde, oculto si son iguales).

```tsx
<FieldDiff
  label="Nombres"
  before={valorAnterior}
  after={valorNuevo}
  variant="inline" | "block" | "list" | "image"
/>
```

- `variant="inline"` (default): el patrón de arriba. Aplica el formatter de
  `audit-field-labels.ts` si existe para esa clave; si la clave está en
  `AUDIT_FIELD_FK_MAP`, usa `useEntityName` para resolver antes de mostrar.
  Oculta el bloque completo si `before === after` (o ambos vacíos — reusar la lógica de
  `areValuesEffectivelyEqual`/`isEffectivelyEmpty` de
  [AuditRecordCard.tsx:150-162](components/audit/AuditRecordCard.tsx:150)).
- `variant="block"`: dos cajas apiladas (tachada / normal) en vez de inline — para texto
  largo (Observaciones, Motivo, comentarios). Ver
  [AuditRecordCard.tsx:4231-4241](components/audit/AuditRecordCard.tsx:4231) de referencia.
- `variant="list"`: recibe `before`/`after` como arrays de `{cedula, nombre, href?}` y
  muestra la lista con links, tachada/verde, separada por comas — para equipo (profesores/
  estudiantes) y ejecutores de acciones. Ver
  [AuditRecordCard.tsx:3969-4051](components/audit/AuditRecordCard.tsx:3969).
- `variant="image"`: dos avatares lado a lado con flecha — para `foto_perfil`. Ver
  [AuditRecordCard.tsx:2825-2862](components/audit/AuditRecordCard.tsx:2825).

Además, un componente hermano `<FieldSetDiff before={string[]} after={string[]} label />`
para el caso de "lista separada por comas" (artefactos domésticos: parsear, ordenar,
mostrar "Eliminados: ..." / "Agregados: ..." — ver
[AuditRecordCard.tsx:3800-3834](components/audit/AuditRecordCard.tsx:3800)) — en el
sistema nuevo esto ya viene como array real (`datos_nuevos.artefactos`), no como string
separado por comas, así que es más simple que antes.

## 5. `components/audit/AuditEventCard.tsx`

Reemplaza los 5126 líneas de `AuditRecordCard.tsx`. Firma (el contrato con Persona B):

```tsx
import type { AuditoriaEvento } from '@/types/audit-events';

interface AuditEventCardProps {
  evento: AuditoriaEvento;
}
export default function AuditEventCard({ evento }: AuditEventCardProps): JSX.Element
```

Estructura interna:
- **Resumen** (fila colapsada, siempre visible): icono + `label` de
  `AUDIT_ENTITIES[evento.entidad]`, badge de operación (Creación/Actualización/
  Eliminación/Inicio de sesión/... — un mapa fijo `OPERACION_LABELS`), actor
  (`evento.nombre_completo_usuario` o `evento.id_usuario`, con link a
  `/dashboard/users/{id_usuario}`), fecha, y un link al registro real si
  `AUDIT_ENTITIES[entidad].linkTo` está definido.
- **Detalle** (expandido, `useState` igual que el original): si hay
  `datos_anteriores` Y `datos_nuevos` → iterar la unión de sus claves y renderizar un
  `<FieldDiff>` por cada una (usando el mapa de labels/formatters/FK). Si solo hay uno
  de los dos → listar clave→valor con las mismas etiquetas (sin diff, ya que es
  inserción o eliminación completa).
- **Renderers a medida** (registro pequeño `Record<string, (evento) => JSX.Element>`,
  solo para lo que de verdad no encaja en el loop genérico — todo lo demás sale solo):
  - `'sesion'`: parsear `dispositivo` (browser/OS) y calcular duración desde
    `metadata.fecha_cierre` o el campo equivalente — implementar **una sola vez** acá
    (hoy está triplicado: `AuditRecordCard.tsx` resumen, detalle, y
    `SesionesAuditClient.tsx`).
  - `'reporte'`: mapa `formatTipoReporte` (ver
    [AuditRecordCard.tsx:4748-4764](components/audit/AuditRecordCard.tsx:4748)) y
    labels de `filtros_aplicados` (ver
    [AuditRecordCard.tsx:4805-4843](components/audit/AuditRecordCard.tsx:4805)).
  - `'equipo'`: usa `FieldDiff variant="list"` para `datos_anteriores.miembros` /
    `datos_nuevos.miembros`, separando profesor/estudiante como hacía el original
    (filtrar por `tipo` antes de pasarlos a `FieldDiff`).
  - `'accion_ejecutores'`: mismo patrón `variant="list"` con
    `datos_anteriores.ejecutores`/`datos_nuevos.ejecutores`.
  - `'caso'` cuando `evento.metadata?.tipo_cambio === 'cambio_estatus'`: una sola línea
    "Estatus: anterior → nuevo" en vez del loop genérico de campos.
- Campos de texto largo (`observaciones`, `motivo`, `comentario`) usan
  `variant="block"` — marcarlos en una lista chica `LONG_TEXT_FIELDS` en
  `audit-field-labels.ts` en vez de hardcodear por entidad.

## Verificación

- `npm run lint` / `npm run build` tras cada pieza.
- Storybook-less manual: montar `<AuditEventCard>` con eventos de prueba (uno por
  `entidad`, tomados de una consulta real a `auditoria_eventos` una vez Persona B te
  pase datos, o con fixtures armados a mano) y comparar visualmente contra capturas del
  `AuditRecordCard.tsx` viejo para los casos representativos: catálogo simple, caso con
  campos normales, caso con cambio de estatus, equipo, acción con ejecutores, solicitante
  (el más grande), usuario con foto de perfil, sesión, reporte.
