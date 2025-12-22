# Arquitectura del Backend - Gestión de Clínicas Jurídicas

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Estructura de Carpetas](#estructura-de-carpetas)
4. [Flujo de Datos](#flujo-de-datos)
5. [Capas de la Arquitectura](#capas-de-la-arquitectura)
6. [Patrones de Diseño](#patrones-de-diseño)
7. [Manejo de Errores](#manejo-de-errores)
8. [Seguridad](#seguridad)
9. [Base de Datos](#base-de-datos)
10. [Guía de Implementación](#guía-de-implementación)

---

## 🎯 Visión General

Este proyecto utiliza una arquitectura en capas para separar responsabilidades y facilitar el mantenimiento. La arquitectura está diseñada para:

- **SQL Puro y Visible**: Todas las consultas SQL están en archivos `.sql` separados en `database/queries/`, sin ORMs
- **Type Safety**: TypeScript en toda la aplicación
- **Escalabilidad**: Estructura que permite crecer sin problemas
- **Mantenibilidad**: Código organizado y fácil de entender
- **Seguridad**: Validación de datos y manejo seguro de errores
- **Revisión Fácil**: SQL completamente visible para revisión académica

---

## 🛠 Stack Tecnológico

### Dependencias Principales

- **Next.js 16**: Framework React con App Router
- **TypeScript**: Tipado estático
- **PostgreSQL (pg)**: Cliente PostgreSQL para Node.js
- **Zod**: Validación de esquemas y tipos
- **Node.js**: Runtime de JavaScript

### Dependencias de Desarrollo

- **ESLint**: Linter para código
- **TypeScript**: Compilador de TypeScript

---

## 📁 Estructura de Carpetas

```
proyecto/
├── app/
│   ├── actions/                      # Server Actions (mutaciones y lecturas)
│   │   ├── auth.ts                   # Acciones de autenticación
│   │   ├── casos.ts                  # Acciones de casos
│   │   ├── clientes.ts               # Acciones de clientes
│   │   ├── solicitantes.ts           # Acciones de solicitantes
│   │   └── ...                       # Más acciones por entidad
│   ├── dashboard/                    # Páginas del dashboard (Server Components)
│   │   ├── page.tsx                  # Página principal
│   │   ├── cases/                    # Páginas de casos
│   │   ├── applicants/               # Páginas de solicitantes
│   │   └── ...                       # Más páginas
│   ├── auth/                         # Páginas de autenticación
│   │   ├── login/
│   │   └── register/
│   └── (otras páginas)               # Más páginas del frontend
│
├── lib/
│   ├── db/                           # Capa de base de datos
│   │   ├── pool.ts                   # Pool de conexiones PostgreSQL
│   │   ├── transactions.ts           # Helpers para transacciones
│   │   ├── sql-loader.ts             # Helper para cargar archivos .sql
│   │   └── queries/                  # Helpers TypeScript que cargan SQL
│   │       ├── casos.queries.ts      # Carga SQL de database/queries/casos/
│   │       ├── clientes.queries.ts   # Carga SQL de database/queries/clientes/
│   │       └── ...
│   │
│   ├── services/                     # Capa de servicios (lógica de negocio)
│   │   ├── casos.service.ts
│   │   ├── clientes.service.ts
│   │   └── ...
│   │
│   ├── validations/                  # Schemas de validación Zod
│   │   ├── casos.schema.ts
│   │   ├── clientes.schema.ts
│   │   └── common.schema.ts
│   │
│   ├── middleware/                    # Middleware personalizado
│   │   ├── auth.middleware.ts        # Autenticación
│   │   └── role.middleware.ts        # Autorización por roles
│   │
│   ├── types/                        # Tipos TypeScript
│   │   ├── database.types.ts         # Tipos de tablas
│   │   └── api.types.ts              # Tipos de API (requests/responses)
│   │
│   ├── utils/                        # Utilidades
│   │   ├── errors.ts                 # Clases de error
│   │   ├── responses.ts              # Helpers de respuestas
│   │   ├── logger.ts                 # Sistema de logging
│   │   └── security.ts               # Utilidades de seguridad
│   │
│   └── constants/                    # Constantes
│       ├── roles.ts                  # Roles del sistema
│       ├── status.ts                 # Estatus y trámites
│       └── errors.ts                 # Códigos de error
│
└── database/                         # Base de datos
    ├── schemas/                      # Esquemas SQL (DDL)
    ├── migrations/                  # Migraciones
    ├── seeds/                       # Datos iniciales
    └── queries/                     # Queries SQL (DML) organizadas por entidad
        ├── casos/
        │   ├── get-all.sql
        │   ├── get-by-id.sql
        │   ├── create.sql
        │   └── ...
        ├── clientes/
        │   ├── get-all.sql
        │   ├── get-by-cedula.sql
        │   └── ...
        └── catalogos/
            └── ...
```

---

## 🔄 Flujo de Datos

### Para Server Components (Lecturas)

```
┌─────────────────────┐
│  Server Component   │  app/dashboard/[recurso]/page.tsx
│   (Next.js)         │
└──────────┬──────────┘
           │
           │ async/await
           ▼
┌─────────────────────┐
│   Server Action     │  app/actions/[recurso].ts
│   (Lectura)         │  get[Recurso]Action()
└──────────┬──────────┘
           │
           ├─► Validación (Zod)
           │
           ├─► Autenticación (cookies)
           │
           ▼
┌─────────────────────┐
│    Service          │  lib/services/[recurso].service.ts
│  (Lógica Negocio)   │
└──────────┬──────────┘
           │
           ├─► Validaciones de negocio
           ├─► Reglas de dominio
           │
           ▼
┌─────────────────────┐
│     Query           │  lib/db/queries/[recurso].queries.ts
│   Helper            │  (Carga archivos .sql)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   SQL Loader        │  lib/db/sql-loader.ts
│   (Carga .sql)       │  → database/queries/[recurso]/*.sql
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  PostgreSQL         │
│   (Neon)            │
└─────────────────────┘
           │
           ▼
┌─────────────────────┐
│   Response          │  Datos tipados (TypeScript)
└─────────────────────┘
```

### Para Client Components (Mutaciones)

```
┌─────────────────────┐
│  Client Component    │  components/forms/[Form].tsx
│   (React)            │
└──────────┬──────────┘
           │
           │ formAction o action={...}
           ▼
┌─────────────────────┐
│   Server Action     │  app/actions/[recurso].ts
│   (Mutación)        │  create[Recurso]Action()
└──────────┬──────────┘
           │
           ├─► Validación (Zod)
           │
           ├─► Autenticación (cookies)
           │
           ▼
┌─────────────────────┐
│    Service          │  lib/services/[recurso].service.ts
│  (Lógica Negocio)   │
└──────────┬──────────┘
           │
           ├─► Validaciones de negocio
           ├─► Reglas de dominio
           ├─► Transacciones
           │
           ▼
┌─────────────────────┐
│     Query           │  lib/db/queries/[recurso].queries.ts
│   Helper            │  (Carga archivos .sql)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   SQL Loader        │  lib/db/sql-loader.ts
│   (Carga .sql)       │  → database/queries/[recurso]/*.sql
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  PostgreSQL         │
│   (Neon)            │
└─────────────────────┘
           │
           ├─► revalidatePath()
           │
           ▼
┌─────────────────────┐
│   Response          │  { success: boolean, data?: ..., error?: ... }
└─────────────────────┘
```

---

## 🏗 Capas de la Arquitectura

### 1. Capa de Server Actions (`app/actions/`)

**Responsabilidad**: Funciones del servidor que manejan mutaciones y lecturas de datos

**Características**:
- Funciones marcadas con `'use server'`
- Type-safe con TypeScript
- Manejo de autenticación mediante cookies
- Validación de datos con Zod
- Revalidación automática de cache después de mutaciones
- Organizadas por entidad (un archivo por entidad)

**Ejemplo de estructura**:
```typescript
// app/actions/casos.ts
'use server';

import { revalidatePath } from 'next/cache';
import { casosService } from '@/lib/services/casos.service';
import { CreateCasoSchema } from '@/lib/validations/casos.schema';

export async function createCasoAction(formData: FormData) {
  try {
    const data = CreateCasoSchema.parse({
      // ... parse formData
    });
    const caso = await casosService.createCaso(data, cedulaUsuario);
    revalidatePath('/dashboard/cases');
    return { success: true, data: caso };
  } catch (error) {
    return { success: false, error: { message: '...' } };
  }
}

export async function getCasosAction() {
  try {
    const casos = await casosService.getAllCasos();
    return { success: true, data: casos };
  } catch (error) {
    return { success: false, error: { message: '...' } };
  }
}
```

**Ventajas de Server Actions**:
- ✅ No requiere crear endpoints HTTP manualmente
- ✅ Type-safe end-to-end
- ✅ Integración directa con formularios
- ✅ Revalidación automática de cache
- ✅ Mejor rendimiento (menos código cliente)

### 2. Capa de Server Components (`app/dashboard/`)

**Responsabilidad**: Componentes React que se renderizan en el servidor y pueden hacer fetch de datos directamente

**Características**:
- Componentes async que pueden hacer `await` directamente
- Fetch de datos en el servidor (más rápido)
- No envían JavaScript al cliente (mejor rendimiento)
- Acceso directo a cookies, headers, etc.

**Ejemplo**:
```typescript
// app/dashboard/cases/page.tsx
import { getCasosAction } from '@/app/actions/casos';

export default async function CasesPage() {
  const result = await getCasosAction();
  
  if (!result.success) {
    return <div>Error: {result.error?.message}</div>;
  }
  
  return (
    <div>
      {result.data?.map(caso => (
        <div key={caso.id_caso}>{caso.tramite}</div>
      ))}
    </div>
  );
}
```

### 3. Capa de Middleware (`middleware.ts` y `lib/middleware/`)

**Responsabilidad**: Interceptar requests para autenticación, autorización y redirecciones

**Middleware de Next.js (`middleware.ts`)**:
- Protege rutas `/dashboard/*` requiriendo autenticación
- Redirige usuarios no autenticados a `/auth/login`
- Redirige usuarios autenticados desde `/auth/*` a `/dashboard`
- Compatible con Edge Runtime

**Middleware personalizado (`lib/middleware/`)**:
- `requireAuth`: Verifica autenticación (para uso en Server Actions)
- `requireRole`: Verifica rol específico
- `requireEstudiante`, `requireProfesor`, `requireCoordinador`: Helpers de roles

### 4. Capa de Validación (`lib/validations/`)

**Responsabilidad**: Validar estructura y tipos de datos de entrada

**Tecnología**: Zod

**Ventajas**:
- Type-safe
- Validación en runtime
- Mensajes de error claros
- Previene datos inválidos antes de llegar a la BD

### 5. Capa de Servicios (`lib/services/`)

**Responsabilidad**: Lógica de negocio y orquestación

**Funciones**:
- Validaciones de negocio
- Reglas de dominio
- Orquestación de múltiples queries
- Manejo de transacciones complejas

**Ejemplo**:
```typescript
// lib/services/casos.service.ts
export const casosService = {
  create: async (data) => {
    // 1. Validar datos
    // 2. Verificar que cliente existe
    // 3. Aplicar reglas de negocio
    // 4. Crear caso
    // 5. Retornar resultado
  }
}
```

### 6. Capa de Queries (`lib/db/queries/`)

**Responsabilidad**: Helpers TypeScript que cargan y ejecutan archivos SQL

**Características**:
- Carga archivos SQL desde `database/queries/`
- No contiene SQL embebido
- Organizado por entidad
- Type-safe con TypeScript
- SQL completamente visible en archivos `.sql` separados

**Ejemplo**:
```typescript
// lib/db/queries/casos.queries.ts
import { loadSQL } from '../sql-loader';
import { pool } from '../pool';

export const casosQueries = {
  getAll: async () => {
    const query = loadSQL('casos/get-all.sql'); // Carga el .sql
    const result = await pool.query(query);
    return result.rows;
  }
}
```

**Archivos SQL correspondientes**:
```sql
-- database/queries/casos/get-all.sql
SELECT 
    c.id_caso,
    c.fecha_inicio_caso,
    -- ... más campos
FROM casos c
INNER JOIN clientes cl ON c.cedula_cliente = cl.cedula
ORDER BY c.fecha_inicio_caso DESC;
```

### 7. Capa de Base de Datos (`lib/db/`)

**Responsabilidad**: Gestión de conexiones, transacciones y carga de SQL

**Componentes**:
- `pool.ts`: Pool de conexiones PostgreSQL
- `transactions.ts`: Helpers para transacciones
- `sql-loader.ts`: Helper para cargar archivos `.sql` desde `database/queries/`

### 8. Archivos SQL (`database/queries/`)

**Responsabilidad**: Todas las queries SQL (DML) organizadas por entidad

**Características**:
- SQL puro en archivos `.sql` separados
- Organizado por entidad en carpetas
- Completamente visible y ejecutable directamente
- Usa prepared statements (`$1, $2, $3...`)

**Estructura**:
```
database/queries/
├── casos/
│   ├── get-all.sql
│   ├── get-by-id.sql
│   ├── create.sql
│   └── ...
├── clientes/
│   └── ...
└── catalogos/
    └── ...
```

---

## 🎨 Patrones de Diseño

### 1. Service Layer Pattern

Separa la lógica de negocio de la lógica de acceso a datos.

```
Server Action → Service → Query → Database
```

### 2. Repository Pattern (Implícito)

Las queries actúan como repositorios, encapsulando el acceso a datos.

### 3. Error Handling Pattern

Errores tipados y manejo centralizado:

```typescript
try {
  // código
} catch (error) {
  return errorResponse(error); // Manejo centralizado
}
```

### 4. Transaction Pattern

Operaciones complejas en transacciones:

```typescript
await withTransaction(async (client) => {
  // múltiples operaciones
});
```

---

## ⚠️ Manejo de Errores

### Clases de Error

- `ValidationError` (400): Datos inválidos
- `UnauthorizedError` (401): No autenticado
- `ForbiddenError` (403): Sin permisos
- `NotFoundError` (404): Recurso no encontrado
- `ConflictError` (409): Conflicto con estado actual
- `DatabaseError` (500): Error de base de datos

### Formato de Respuesta de Error

```json
{
  "success": false,
  "error": {
    "message": "Mensaje de error",
    "code": "ERROR_CODE",
    "fields": {  // Solo en ValidationError
      "campo": ["error1", "error2"]
    }
  }
}
```

### Formato de Respuesta Exitosa

```json
{
  "success": true,
  "data": { ... }
}
```

---

## 🔒 Seguridad

### 1. Validación de Datos

- Validación con Zod en todos los inputs
- Prevención de SQL injection con prepared statements
- Sanitización de inputs

### 2. Autenticación

- **JWT tokens**: Implementado con cookies HTTP-only
- **Middleware de Next.js**: Protege rutas automáticamente
- **Verificación de tokens**: En Server Actions y Server Components
- **Cookies seguras**: Tokens almacenados en cookies HTTP-only

### 3. Autorización

- Verificación de roles
- Middleware de autorización
- Control de acceso por recurso

### 4. Base de Datos

- Prepared statements (pg)
- Pool de conexiones
- Transacciones para operaciones críticas

---

## 🗄 Base de Datos

### Configuración

- **Proveedor**: Neon (PostgreSQL)
- **Pool de conexiones**: Configurado en `lib/db/pool.ts`
- **Transacciones**: Soporte completo

### Queries

- **SQL Puro y Visible**: Todas las queries en archivos `.sql` en `database/queries/`
- **Organización**: Por entidad en carpetas separadas
- **Carga Dinámica**: Los helpers TypeScript en `lib/db/queries/` cargan los archivos `.sql`
- **Type Safety**: Tipos TypeScript para resultados y parámetros
- **Revisión Fácil**: SQL completamente visible para revisión académica

### Transacciones

```typescript
await withTransaction(async (client) => {
  await client.query('INSERT INTO tabla1...');
  await client.query('INSERT INTO tabla2...');
});
```

---

## 📝 Guía de Implementación

### 1. Crear un Nuevo Módulo

#### Paso 1: Crear Archivos SQL

Primero, crea los archivos SQL en `database/queries/[recurso]/`:

```sql
-- database/queries/nuevo_recurso/get-all.sql
SELECT * FROM nuevo_recurso
ORDER BY id DESC;
```

```sql
-- database/queries/nuevo_recurso/get-by-id.sql
-- Parámetros: $1 = id
SELECT * FROM nuevo_recurso
WHERE id = $1;
```

```sql
-- database/queries/nuevo_recurso/create.sql
-- Parámetros: $1 = campo1, $2 = campo2
INSERT INTO nuevo_recurso (campo1, campo2)
VALUES ($1, $2)
RETURNING *;
```

#### Paso 2: Crear Query Helper TypeScript

```typescript
// lib/db/queries/nuevo_recurso.queries.ts
import { loadSQL } from '../sql-loader';
import { pool } from '../pool';

export const nuevoRecursoQueries = {
  getAll: async () => {
    const query = loadSQL('nuevo_recurso/get-all.sql');
    const result = await pool.query(query);
    return result.rows;
  },
  getById: async (id: number) => {
    const query = loadSQL('nuevo_recurso/get-by-id.sql');
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },
  create: async (data: CreateData) => {
    const query = loadSQL('nuevo_recurso/create.sql');
    const result = await pool.query(query, [data.campo1, data.campo2]);
    return result.rows[0];
  },
};
```

#### Paso 2: Crear Schema de Validación

```typescript
// lib/validations/nuevo_recurso.schema.ts
export const CreateNuevoRecursoSchema = z.object({ ... });
export const UpdateNuevoRecursoSchema = z.object({ ... });
```

#### Paso 3: Crear Service

```typescript
// lib/services/nuevo_recurso.service.ts
export const nuevoRecursoService = {
  getAll: async () => { ... },
  getById: async (id: number) => { ... },
  create: async (data: unknown) => { ... },
  update: async (id: number, data: unknown) => { ... },
  delete: async (id: number) => { ... },
};
```

#### Paso 4: Crear Server Actions

```typescript
// app/actions/nuevo_recurso.ts
'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/utils/security';
import { nuevoRecursoService } from '@/lib/services/nuevo_recurso.service';
import { CreateNuevoRecursoSchema } from '@/lib/validations/nuevo_recurso.schema';

export async function getNuevoRecursoAction() {
  try {
    // Verificar autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) {
      return { success: false, error: { message: 'No autenticado', code: 'UNAUTHORIZED' } };
    }
    await verifyToken(token);

    const data = await nuevoRecursoService.getAll();
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: { 
        message: error instanceof Error ? error.message : 'Error desconocido' 
      } 
    };
  }
}

export async function createNuevoRecursoAction(formData: FormData) {
  try {
    // Verificar autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) {
      return { success: false, error: { message: 'No autenticado', code: 'UNAUTHORIZED' } };
    }
    const decoded = await verifyToken(token);

    // Validar datos
    const data = CreateNuevoRecursoSchema.parse({
      campo1: formData.get('campo1'),
      campo2: formData.get('campo2'),
    });

    const nuevo = await nuevoRecursoService.create(data);
    revalidatePath('/dashboard/nuevo-recurso'); // Revalidar cache
    return { success: true, data: nuevo };
  } catch (error) {
    return { 
      success: false, 
      error: { 
        message: error instanceof Error ? error.message : 'Error desconocido' 
      } 
    };
  }
}
```

#### Paso 5: Usar en Server Component

```typescript
// app/dashboard/nuevo-recurso/page.tsx
import { getNuevoRecursoAction } from '@/app/actions/nuevo_recurso';

export default async function NuevoRecursoPage() {
  const result = await getNuevoRecursoAction();
  
  if (!result.success) {
    return <div>Error: {result.error?.message}</div>;
  }
  
  return (
    <div>
      {result.data?.map(item => (
        <div key={item.id}>{item.campo1}</div>
      ))}
    </div>
  );
}
```

#### Paso 6: Usar en Client Component (para formularios)

```typescript
// components/forms/NuevoRecursoForm.tsx
'use client';

import { createNuevoRecursoAction } from '@/app/actions/nuevo_recurso';
import { useFormState } from 'react-dom';

export function NuevoRecursoForm() {
  const [state, formAction] = useFormState(createNuevoRecursoAction, null);

  return (
    <form action={formAction}>
      <input name="campo1" />
      <input name="campo2" />
      <button type="submit">Crear</button>
      {state?.error && <div>{state.error.message}</div>}
    </form>
  );
}
```

### 2. Agregar Autenticación a una Server Action

La autenticación se maneja dentro de cada Server Action:

```typescript
export async function createAction(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) {
      return { success: false, error: { message: 'No autenticado', code: 'UNAUTHORIZED' } };
    }
    const decoded = await verifyToken(token);
    // ... resto del código usando decoded.cedula, decoded.rol, etc.
  } catch (error) {
    return { success: false, error: { message: '...' } };
  }
}
```

### 3. Agregar Autorización por Rol

```typescript
export async function deleteAction(id: number) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) {
      return { success: false, error: { message: 'No autenticado', code: 'UNAUTHORIZED' } };
    }
    const decoded = await verifyToken(token);
    
    // Verificar rol
    if (decoded.rol !== 'coordinador') {
      return { success: false, error: { message: 'Sin permisos', code: 'FORBIDDEN' } };
    }
    
    // ... resto del código
  } catch (error) {
    return { success: false, error: { message: '...' } };
  }
}
```

---

## 📚 Convenciones

### Nombres de Archivos

- **SQL Queries**: `[recurso]/[accion].sql` en `database/queries/`
- **Query Helpers**: `[recurso].queries.ts` en `lib/db/queries/`
- **Services**: `[recurso].service.ts` en `lib/services/`
- **Validations**: `[recurso].schema.ts` en `lib/validations/`
- **Server Actions**: `[recurso].ts` en `app/actions/` (un archivo por entidad)
- **Server Components**: `page.tsx` en `app/dashboard/[recurso]/`
- **Client Components**: `[Component].tsx` en `components/`

### Nombres de Funciones

- **Queries**: `getAll`, `getById`, `create`, `update`, `delete`, `search`
- **Services**: Mismos nombres que queries
- **Server Actions**: `get[Recurso]Action`, `create[Recurso]Action`, `update[Recurso]Action`, `delete[Recurso]Action`
  - Ejemplo: `getCasosAction`, `createCasoAction`, `getSolicitantesAction`

### SQL

- Usar prepared statements siempre: `$1, $2, $3...`
- Comentarios en queries complejas
- Nombres descriptivos para aliases

---

## 🚀 Características Avanzadas

### Revalidación de Cache

Después de mutaciones, se revalida automáticamente el cache de Next.js:

```typescript
import { revalidatePath } from 'next/cache';

export async function createCasoAction(data: FormData) {
  // ... crear caso
  revalidatePath('/dashboard/cases'); // Revalida esta ruta
  return { success: true, data: nuevoCaso };
}
```

### Server Components vs Client Components

- **Server Components**: Para páginas que solo muestran datos (mejor rendimiento)
- **Client Components**: Para formularios e interactividad (`'use client'`)

### Optimización de Queries

- Uso de `LEFT JOIN LATERAL` para evitar N+1 queries
- Queries optimizadas con JOINs apropiados
- Índices en la base de datos para campos frecuentemente consultados

## 🚀 Próximos Pasos

1. ✅ **Autenticación**: JWT tokens implementado
2. ✅ **Server Actions**: Implementado para todas las operaciones
3. ✅ **Server Components**: Migrado para mejor rendimiento
4. **Testing**: Unit tests para servicios, integration tests para Server Actions
5. **Logging**: Integración con servicio externo (Sentry, etc.)
6. **Optimización**: Más queries optimizadas según necesidad

---

## 📖 Referencias

- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [PostgreSQL Node.js Driver](https://node-postgres.com/)
- [Zod Documentation](https://zod.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Última actualización**: Diciembre 2024

---

## 📝 Notas de Migración

Este proyecto migró de API Routes a Server Actions para aprovechar mejor las características de Next.js 16:

- ✅ **Mejor rendimiento**: Menos JavaScript enviado al cliente
- ✅ **Type safety**: Type-safe end-to-end sin necesidad de tipos de API
- ✅ **Menos código**: No necesitas crear endpoints HTTP manualmente
- ✅ **Mejor UX**: Revalidación automática de cache
- ✅ **Más simple**: Integración directa con formularios

La arquitectura mantiene la misma separación de capas, pero ahora usa Server Actions como punto de entrada en lugar de API Routes.

