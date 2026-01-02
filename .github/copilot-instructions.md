# Instrucciones para agentes (Gestión de Clínicas Jurídicas)

## Contexto rápido
- Stack: Next.js App Router (Next 16) + React 19 + TypeScript estricto + Tailwind 4 + PostgreSQL (`pg`).
- No ORM: el SQL vive en `database/queries/**.sql` y se carga dinámicamente con `lib/db/sql-loader.ts`.
- Alias TS: `@/*` apunta a la raíz del repo (ver `tsconfig.json`).

## Arquitectura y flujo de datos
- UI (Server/Client Components) llama Server Actions en `app/actions/*.ts` (ej.: `app/actions/casos.ts`).
- Las Server Actions delegan lógica de negocio en `lib/services/*.service.ts` (ej.: `lib/services/casos.service.ts`).
- Los services usan query helpers en `lib/db/queries/*.queries.ts`, que ejecutan SQL cargado desde `database/queries/` (ej.: `lib/db/queries/casos.queries.ts`).

## Patrones obligatorios del proyecto
- Server Actions deben retornar el shape `{ success: boolean, data?, error? }`.
  - Para errores: usar `handleServerActionError(error, 'NombreAction', 'CODIGO')` (ver `lib/utils/server-action-helpers.ts`).
- Autenticación:
  - Cookie HTTP-only: `auth_token` (set en `app/actions/auth.ts`).
  - En Server Actions: verificar sesión con `requireAuthInServerActionWithCode()` (ver `lib/utils/server-auth.ts`).
  - El middleware (`middleware.ts`) solo valida existencia de cookie para rutas `/dashboard/*`; la verificación real del token ocurre en Server Actions.
- DB:
  - Conexión via `lib/db/pool.ts` usando `DATABASE_URL`.
  - Consultas siempre parametrizadas con `$1, $2, ...` (prepared statements) en los `.sql`.
  - Operaciones multi-step: usar transacciones (`lib/db/transactions.ts`) o el patrón `pool.connect()` + `BEGIN/COMMIT` (ej.: `casosQueries.create`).
- Revalidación de caché tras mutaciones: usar `revalidatePath('/dashboard/...')` en la Server Action (ej.: `createCasoAction`).

## Cómo agregar/editar un “módulo” (entidad)
1. Crear/actualizar SQL en `database/queries/<entidad>/` (archivos pequeños por operación).
2. Exponer funciones en `lib/db/queries/<entidad>.queries.ts` usando `loadSQL('<entidad>/<archivo>.sql')`.
3. (Si aplica) Validar input con Zod en `lib/validations/<entidad>.schema.ts` y parsear en el service.
4. Implementar reglas de negocio en `lib/services/<entidad>.service.ts`.
5. Crear/ajustar Server Actions en `app/actions/<entidad>.ts` y conectar UI.

## Workflows de desarrollo
- Dev server: `npm run dev` (Next en `http://localhost:3000`).
- Lint: `npm run lint`.
- Typecheck: `npx tsc --noEmit`.
- Migraciones SQL: convención `database/migrations/YYYYMMDD_HHMMSS_descripcion.sql` (idempotentes). Hay scripts puntuales en `scripts/` que ejecutan migraciones específicas.

## Notas
- La documentación de `API.md` describe `/api/*` y Bearer tokens; en el código actual el acceso principal es vía Server Actions + cookie `auth_token`.
