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
│   ├── api/                          # API Routes (endpoints REST)
│   │   ├── auth/                     # Endpoints de autenticación
│   │   ├── casos/                    # Endpoints de casos
│   │   │   ├── route.ts              # GET, POST /api/casos
│   │   │   ├── [id]/                 # GET, PUT, DELETE /api/casos/:id
│   │   │   └── search/               # GET /api/casos/search
│   │   ├── clientes/                 # Endpoints de clientes
│   │   └── usuarios/                 # Endpoints de usuarios
│   └── (frontend pages)              # Páginas del frontend
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

```
┌─────────────┐
│   Frontend  │
│  (Next.js)  │
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────────┐
│   API Route     │  app/api/[recurso]/route.ts
│  (Controller)   │
└──────┬──────────┘
       │
       ├─► Validación (Zod)
       │
       ├─► Middleware (Auth, Roles)
       │
       ▼
┌─────────────────┐
│    Service      │  lib/services/[recurso].service.ts
│  (Lógica Negocio)│
└──────┬──────────┘
       │
       ├─► Validaciones de negocio
       ├─► Reglas de dominio
       │
       ▼
┌─────────────────┐
│     Query       │  lib/db/queries/[recurso].queries.ts
│   Helper        │  (Carga archivos .sql)
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│   SQL Loader    │  lib/db/sql-loader.ts
│   (Carga .sql)   │  → database/queries/[recurso]/*.sql
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  PostgreSQL     │
│   (Neon)        │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│   Response      │  JSON estándar
└─────────────────┘
```

---

## 🏗 Capas de la Arquitectura

### 1. Capa de API Routes (`app/api/`)

**Responsabilidad**: Recibir requests HTTP y retornar responses

**Características**:
- Endpoints RESTful
- Manejo de métodos HTTP (GET, POST, PUT, DELETE)
- Validación inicial de requests
- Manejo de errores centralizado

**Ejemplo de estructura**:
```typescript
// app/api/casos/route.ts
export async function GET() { ... }
export async function POST() { ... }
```

### 2. Capa de Middleware (`lib/middleware/`)

**Responsabilidad**: Interceptar requests para autenticación, autorización, etc.

**Middleware disponible**:
- `requireAuth`: Verifica autenticación
- `requireRole`: Verifica rol específico
- `requireEstudiante`, `requireProfesor`, `requireCoordinador`: Helpers de roles

### 3. Capa de Validación (`lib/validations/`)

**Responsabilidad**: Validar estructura y tipos de datos de entrada

**Tecnología**: Zod

**Ventajas**:
- Type-safe
- Validación en runtime
- Mensajes de error claros
- Previene datos inválidos antes de llegar a la BD

### 4. Capa de Servicios (`lib/services/`)

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

### 5. Capa de Queries (`lib/db/queries/`)

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

### 6. Capa de Base de Datos (`lib/db/`)

**Responsabilidad**: Gestión de conexiones, transacciones y carga de SQL

**Componentes**:
- `pool.ts`: Pool de conexiones PostgreSQL
- `transactions.ts`: Helpers para transacciones
- `sql-loader.ts`: Helper para cargar archivos `.sql` desde `database/queries/`

### 7. Archivos SQL (`database/queries/`)

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
API Route → Service → Query → Database
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

- JWT tokens (a implementar)
- Middleware de autenticación
- Verificación de tokens

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

#### Paso 4: Crear API Route

```typescript
// app/api/nuevo_recurso/route.ts
export async function GET() {
  try {
    const data = await nuevoRecursoService.getAll();
    return successResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
}
```

### 2. Agregar Autenticación a un Endpoint

```typescript
export async function POST(request: NextRequest) {
  try {
    await requireAuth(request); // Requiere autenticación
    // ... resto del código
  } catch (error) {
    return errorResponse(error);
  }
}
```

### 3. Agregar Autorización por Rol

```typescript
export async function DELETE(request: NextRequest) {
  try {
    await requireCoordinador(request); // Solo coordinadores
    // ... resto del código
  } catch (error) {
    return errorResponse(error);
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
- **API Routes**: `route.ts` dentro de `app/api/[recurso]/`

### Nombres de Funciones

- **Queries**: `getAll`, `getById`, `create`, `update`, `delete`, `search`
- **Services**: Mismos nombres que queries
- **API Routes**: `GET`, `POST`, `PUT`, `DELETE`

### SQL

- Usar prepared statements siempre: `$1, $2, $3...`
- Comentarios en queries complejas
- Nombres descriptivos para aliases

---

## 🚀 Próximos Pasos

1. **Implementar Autenticación**: JWT tokens
2. **Crear Módulos**: Empezar con casos, clientes, usuarios
3. **Testing**: Unit tests para servicios, integration tests para API
4. **Documentación API**: Swagger/OpenAPI
5. **Logging**: Integración con servicio externo (Sentry, etc.)

---

## 📖 Referencias

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [PostgreSQL Node.js Driver](https://node-postgres.com/)
- [Zod Documentation](https://zod.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Última actualización**: Diciembre 2024

