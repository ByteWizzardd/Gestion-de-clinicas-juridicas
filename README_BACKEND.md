# Backend - Gestión de Clínicas Jurídicas

## 🚀 Inicio Rápido

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Copia el archivo `.env.example` a `.env` y completa los valores:

```bash
cp .env.example .env
```

Edita `.env` y configura:
- `DATABASE_URL`: URL de conexión a PostgreSQL (Neon)
- `JWT_SECRET`: Secreto para tokens JWT
- Otras variables según necesidad

### 3. Verificar Conexión a Base de Datos

```bash
npm run dev
```

La aplicación debería iniciar en `http://localhost:3000`

### 4. Probar un Endpoint

```bash
curl http://localhost:3000/api/casos
```

---

## 📁 Estructura del Proyecto

Ver [ARCHITECTURE.md](./ARCHITECTURE.md) para documentación completa de la arquitectura.

### Carpetas Principales

- `app/api/`: Endpoints de la API
- `lib/db/`: Configuración y helpers para cargar queries SQL
- `lib/db/queries/`: Helpers TypeScript que cargan archivos SQL
- `database/queries/`: Archivos SQL organizados por entidad
- `lib/services/`: Lógica de negocio
- `lib/validations/`: Schemas de validación
- `lib/middleware/`: Middleware de autenticación/autorización
- `lib/utils/`: Utilidades (errores, respuestas, logger)
- `lib/types/`: Tipos TypeScript
- `lib/constants/`: Constantes del sistema

---

## 🛠 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar en producción
npm start

# Linter
npm run lint
```

---

## 📚 Documentación

- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Documentación completa de la arquitectura
- **[API.md](./API.md)**: Documentación de la API y ejemplos de uso
- **[database/README.md](./database/README.md)**: Documentación de la base de datos

---

## 🔧 Configuración

### Variables de Entorno Requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de conexión PostgreSQL | `postgresql://user:pass@host:port/db` |
| `JWT_SECRET` | Secreto para JWT tokens | `tu_secreto_aqui` |
| `NODE_ENV` | Entorno de ejecución | `development` o `production` |

Ver `.env.example` para todas las variables disponibles.

---

## 🏗 Arquitectura

El proyecto utiliza una arquitectura en capas:

```
Frontend → API Routes → Services → Query Helpers → SQL Loader → PostgreSQL
                                                      ↓
                                            database/queries/*.sql
```

### Flujo de una Request

1. **API Route** recibe el request HTTP
2. **Middleware** valida autenticación/autorización
3. **Validation** valida estructura de datos (Zod)
4. **Service** ejecuta lógica de negocio
5. **Query Helper** carga el archivo SQL desde `database/queries/`
6. **SQL Loader** lee el archivo `.sql` correspondiente
7. **Pool** ejecuta el SQL con parámetros
8. **Response** retorna JSON estándar

### Estructura de Queries SQL

Todas las queries SQL están en archivos `.sql` separados en `database/queries/`:

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

Los helpers TypeScript en `lib/db/queries/` cargan estos archivos SQL.

---

## 📝 Crear un Nuevo Módulo

### 1. Crear Archivos SQL

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

### 2. Crear Query Helper TypeScript

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
  create: async (data: { campo1: string; campo2: number }) => {
    const query = loadSQL('nuevo_recurso/create.sql');
    const result = await pool.query(query, [data.campo1, data.campo2]);
    return result.rows[0];
  },
};
```

### 3. Crear Schema de Validación

```typescript
// lib/validations/nuevo_recurso.schema.ts
import { z } from 'zod';

export const CreateNuevoRecursoSchema = z.object({
  campo1: z.string(),
  campo2: z.number(),
});
```

### 4. Crear Service

```typescript
// lib/services/nuevo_recurso.service.ts
import { nuevoRecursoQueries } from '@/lib/db/queries/nuevo_recurso.queries';
import { CreateNuevoRecursoSchema } from '@/lib/validations/nuevo_recurso.schema';

export const nuevoRecursoService = {
  getAll: async () => {
    return await nuevoRecursoQueries.getAll();
  },
  create: async (data: unknown) => {
    const validated = CreateNuevoRecursoSchema.parse(data);
    return await nuevoRecursoQueries.create(validated);
  },
};
```

### 5. Crear API Route

```typescript
// app/api/nuevo_recurso/route.ts
import { NextRequest } from 'next/server';
import { nuevoRecursoService } from '@/lib/services/nuevo_recurso.service';
import { successResponse, errorResponse } from '@/lib/utils/responses';

export async function GET() {
  try {
    const data = await nuevoRecursoService.getAll();
    return successResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await nuevoRecursoService.create(body);
    return successResponse(data, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
```

---

## 🔒 Seguridad

### Validación

- Todos los inputs se validan con Zod
- Prevención de SQL injection con prepared statements
- Sanitización de datos

### Autenticación

- JWT tokens (a implementar)
- Middleware de autenticación en endpoints protegidos

### Autorización

- Verificación de roles (Estudiante, Profesor, Coordinador)
- Control de acceso por recurso

---

## 🐛 Debugging

### Logs

Los logs se muestran en consola en desarrollo:

```typescript
import { logger } from '@/lib/utils/logger';

logger.info('Mensaje informativo');
logger.error('Error ocurrido', { error });
```

### Verificar Conexión a BD

```typescript
import { testConnection } from '@/lib/db/pool';

const status = await testConnection();
console.log(status);
```

---

## 📦 Dependencias Principales

- **next**: Framework React
- **pg**: Cliente PostgreSQL
- **zod**: Validación de esquemas
- **typescript**: Tipado estático

Ver `package.json` para lista completa.

---

## 🚧 Estado del Proyecto

### ✅ Completado

- [x] Estructura de carpetas
- [x] Configuración de base de datos
- [x] Sistema de errores
- [x] Logger
- [x] Helpers de respuestas
- [x] Middleware de autenticación/autorización
- [x] Sistema de transacciones
- [x] Documentación

### 🚧 En Progreso

- [ ] Implementación de módulos (casos, clientes, usuarios)
- [ ] Autenticación JWT
- [ ] Tests

### 📋 Pendiente

- [ ] Documentación OpenAPI/Swagger
- [ ] Rate limiting
- [ ] Caché
- [ ] Monitoreo y métricas

---

## 🤝 Contribuir

1. Crear una rama para la feature
2. Implementar cambios
3. Seguir las convenciones del proyecto
4. Documentar cambios importantes
5. Crear pull request

---

## 📞 Soporte

Para preguntas o problemas:
1. Revisar la documentación en `ARCHITECTURE.md` y `API.md`
2. Verificar logs en consola
3. Revisar issues existentes

---

**Última actualización**: Diciembre 2024

