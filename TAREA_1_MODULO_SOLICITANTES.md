# 📋 Módulo de Solicitantes

## 🎯 Objetivo
Conectar el módulo de Solicitantes del frontend con el backend para que muestre todos los **SOLICITANTES** de la base de datos en la tabla.

## ⚠️ IMPORTANTE: ¿Qué es un Solicitante?

**Los solicitantes se distinguen de otros tipos de usuarios/clientes porque:**
- Tienen `fecha_solicitud` **distinta de NULL** (es decir, `fecha_solicitud IS NOT NULL`)
- **TODOS sus atributos y relaciones son OBLIGATORIOS** según el schema de la base de datos:
  - **Campos básicos obligatorios:**
    - `nombres` (NOT NULL)
    - `apellidos` (NOT NULL)
    - `fecha_nacimiento` (NOT NULL)
    - `telefono_celular` (NOT NULL)
    - `correo_electronico` (NOT NULL)
    - `sexo` (NOT NULL)
    - `nacionalidad` (NOT NULL)
  - **Relaciones obligatorias (si es solicitante):**
    - `id_nucleo` (NOT NULL) - **DEBE tener un núcleo asignado**
    - `id_hogar` (NOT NULL) - **DEBE tener información del hogar**
    - `id_nivel_educativo` (NOT NULL) - **DEBE tener nivel educativo**
    - `id_trabajo` (NOT NULL) - **DEBE tener información de trabajo**
    - `id_vivienda` (NOT NULL) - **DEBE tener información de vivienda**
    - `id_parroquia` (NOT NULL) - **DEBE tener ubicación geográfica**

**IMPORTANTE**: La base de datos tiene un constraint llamado `check_solicitante_completo` que valida que si `fecha_solicitud IS NOT NULL`, entonces TODOS los campos relacionados deben ser NOT NULL. Esto significa que **NO puedes crear un solicitante sin completar toda su información**.

**Esta tarea es SOLO para OBTENER y MOSTRAR solicitantes, NO para crear o actualizar.**

---

## 📍 Ubicación de Archivos

### Estructura de Carpetas que Trabajaremos:
```
proyecto/
├── database/queries/clientes/          ← Aquí va el archivo SQL
├── lib/db/queries/                     ← Aquí va el helper TypeScript
├── lib/services/                       ← Aquí va el servicio
├── app/api/solicitantes/               ← Aquí va la API route
└── app/dashboard/applicants/page.tsx   ← Aquí modificamos el frontend
```

---

## 🔨 PASO 1: Crear la Query SQL

### ¿Dónde?
En la carpeta: `database/queries/clientes/`

### ¿Qué hacer?
Crear UN archivo SQL para obtener SOLO los solicitantes:

#### 1.1. Archivo: `get-solicitantes.sql`
- **Ubicación**: `database/queries/clientes/get-solicitantes.sql`
- **Qué debe hacer**: Crear una consulta SQL que obtenga **SOLO los SOLICITANTES** de la tabla `clientes`
- **Filtro CRÍTICO**: Debes filtrar por `fecha_solicitud IS NOT NULL` para distinguir solicitantes de otros clientes

**Relaciones de la tabla `clientes` que debes considerar:**
La tabla `clientes` tiene las siguientes relaciones (foreign keys). **IMPORTANTE**: Si el cliente es SOLICITANTE, TODAS estas relaciones son OBLIGATORIAS:
- `id_nucleo` → `nucleos(id_nucleo)` - **OBLIGATORIO para solicitantes** - Para obtener el nombre del núcleo
- `id_parroquia` → `parroquias(id_parroquia)` - **OBLIGATORIO para solicitantes** - Para obtener información de ubicación
- `id_municipio` (a través de parroquias) → `municipios(id_municipio)` - Para obtener el municipio
- `id_estado` (a través de municipios) → `estados(id_estado)` - Para obtener el estado
- `id_vivienda` → `viviendas(id_vivienda)` - **OBLIGATORIO para solicitantes** - Para obtener información de vivienda
- `id_trabajo` → `trabajos(id_trabajo)` - **OBLIGATORIO para solicitantes** - Para obtener información de trabajo
- `id_hogar` → `familias_hogares(id_hogar)` - **OBLIGATORIO para solicitantes** - Para obtener información del hogar
- `id_nivel_educativo` → `niveles_educativos(id_nivel_educativo)` - **OBLIGATORIO para solicitantes** - Para obtener información educativa

**Datos a incluir en la query (para la tabla del frontend):**
- Cédula (`cedula`)
- Nombres (`nombres`)
- Apellidos (`apellidos`)
- Teléfono celular (`telefono_celular`)
- Fecha de solicitud (`fecha_solicitud`)
- ID del núcleo (`id_nucleo`) - Este es el ID, no el nombre. El nombre del núcleo se puede obtener después si es necesario.

**Orden**: Por fecha de solicitud descendente (más recientes primero)

**Ejemplo de estructura SQL:**
```sql
SELECT 
    cedula,
    nombres,
    apellidos,
    telefono_celular,
    fecha_solicitud,
    id_nucleo
FROM clientes
WHERE fecha_solicitud IS NOT NULL
ORDER BY fecha_solicitud DESC;
```

**Nota importante**: 
- El `id_nucleo` es un número (ID), no el nombre del núcleo. Si necesitas el nombre del núcleo en el frontend, puedes hacer una consulta adicional o manejarlo en el frontend
- El filtro `WHERE fecha_solicitud IS NOT NULL` es **ESENCIAL** para obtener solo solicitantes

**Nota importante**: 
- El filtro `WHERE fecha_solicitud IS NOT NULL` es **ESENCIAL** para obtener solo solicitantes
- **NO uses JOINs**. Solo obtén los datos directamente de la tabla `clientes`
- Los IDs de las relaciones (como `id_nucleo`) estarán disponibles, pero no los nombres. Si necesitas el nombre del núcleo, puedes manejarlo en el frontend o hacer una consulta adicional

---

## 🔨 PASO 2: Crear el Helper TypeScript para Queries

### ¿Dónde?
En la carpeta: `lib/db/queries/`

### ¿Qué hacer?
Crear un archivo llamado: `solicitantes.queries.ts`

#### 2.1. Estructura del archivo:
- **Importar** `loadSQL` desde `../sql-loader`
- **Importar** `pool` desde `../pool`
- **Importar** `QueryResult` desde `pg`

#### 2.2. Crear un objeto exportado llamado `solicitantesQueries` con UNA función:

**2.2.1. Función `getAllSolicitantes`:**
- Cargar el SQL de `clientes/get-solicitantes.sql` usando `loadSQL`
- Ejecutar la query con `pool.query()` (sin parámetros, ya que no necesita filtros)
- Retornar `result.rows` (array de solicitantes)

---

## 🔨 PASO 3: Crear el Servicio

### ¿Dónde?
En la carpeta: `lib/services/`

### ¿Qué hacer?
Crear un archivo llamado: `solicitantes.service.ts`

#### 3.1. Importar dependencias:
- Importar `solicitantesQueries` desde `@/lib/db/queries/solicitantes.queries`
- Importar `AppError` desde `@/lib/utils/errors`

#### 3.2. Crear función del servicio:

**3.2.1. Función `getAllSolicitantes`:**
- Llamar a `solicitantesQueries.getAllSolicitantes()`
- Retornar el resultado (array de solicitantes)
- Manejar errores con try/catch y lanzar `AppError` si algo falla
- **Nota**: Esta función solo obtiene datos, no necesita validación de entrada

---

## 🔨 PASO 4: Crear la API Route

### ¿Dónde?
En la carpeta: `app/api/solicitantes/`

### ¿Qué hacer?
Crear un archivo llamado: `route.ts`

#### 4.1. Importar dependencias:
- Importar `NextRequest`, `NextResponse` desde `next/server`
- Importar el servicio desde `@/lib/services/solicitantes.service`
- Importar `handleApiError` desde `@/lib/utils/responses` (o similar)

#### 4.2. Crear función `GET` (para obtener todos los solicitantes):
- Exportar función `async GET(request: NextRequest)`
- Dentro, llamar a `getAllSolicitantes()` del servicio
- Retornar `NextResponse.json()` con los datos
- Manejar errores con try/catch y retornar error apropiado
- **Nota**: Esta ruta solo tiene GET, no POST ni PUT porque solo es para mostrar datos

---

## 🔨 PASO 5: Modificar el Frontend

### ¿Dónde?
En el archivo: `app/dashboard/applicants/page.tsx`

### ¿Qué hacer?

#### 5.1. Convertir a Client Component:
- Agregar `'use client'` al inicio del archivo

#### 5.2. Importar hooks de React:
- Importar `useState` y `useEffect` desde `react`

#### 5.3. Crear estado para los datos:
- Crear un estado `const [solicitantes, setSolicitantes] = useState([])`
- Crear un estado `const [loading, setLoading] = useState(true)`

#### 5.4. Crear función para cargar datos:
- Crear función `async fetchSolicitantes()`
- Dentro:
  - Poner `setLoading(true)`
  - Hacer `fetch('/api/solicitantes')` (¡Importante: usar la ruta correcta!)
  - Verificar que la respuesta sea ok: `if (!response.ok) throw new Error(...)`
  - Convertir respuesta a JSON: `const data = await response.json()`
  - Llamar a `setSolicitantes(data)` o `setSolicitantes(data.solicitantes)` según la estructura de la respuesta
  - Poner `setLoading(false)`
  - Manejar errores con try/catch y mostrar mensaje de error

#### 5.5. Usar useEffect:
- Agregar `useEffect(() => { fetchSolicitantes() }, [])`
- Esto cargará los datos cuando la página se monte

#### 5.6. Mapear los datos para la tabla:
- Transformar los datos de `solicitantes` al formato que espera la tabla
- La tabla espera columnas: ["Cédula", "Nombre Completo", "Teléfono Celular", "Núcleo", "Fecha Solicitud"]
- Crear un array `tableData` que mapee cada solicitante a un objeto con esas propiedades:
  - `cedula`: del campo `cedula`
  - `nombre_completo`: concatenar `nombres + ' ' + apellidos`
  - `telefono_celular`: del campo `telefono_celular`
  - `nucleo`: del campo `id_nucleo` (es un número, puedes mostrarlo como "Núcleo #" + id_nucleo, o simplemente el número)
  - `fecha_solicitud`: formatear la fecha (puedes usar `new Date(fecha_solicitud).toLocaleDateString()` o similar)
- **Nota**: Como no estás haciendo JOINs, solo tendrás el `id_nucleo` (número), no el nombre del núcleo. Puedes mostrar el ID o hacer una consulta adicional si necesitas el nombre

#### 5.7. Mostrar loading y errores:
- Si `loading` es `true`, mostrar un mensaje "Cargando solicitantes..." o un spinner
- Si hay error, mostrar el mensaje de error
- Si `loading` es `false` y no hay error, mostrar la tabla con `tableData`

#### 5.8. Actualizar la tabla:
- Cambiar `data={[]}` por `data={tableData}`
- Las funciones `onView`, `onEdit`, `onDelete` son opcionales para esta tarea (solo mostrar datos)

---

## ✅ Checklist Final

Antes de considerar la tarea completa, verifica:

- [ ] El archivo SQL `get-solicitantes.sql` está creado en `database/queries/clientes/`
- [ ] El archivo SQL tiene el filtro `WHERE fecha_solicitud IS NOT NULL`
- [ ] El helper `solicitantes.queries.ts` está creado y exporta la función `getAllSolicitantes`
- [ ] El servicio `solicitantes.service.ts` tiene la función `getAllSolicitantes`
- [ ] La API route `app/api/solicitantes/route.ts` tiene la función GET
- [ ] El frontend `app/dashboard/applicants/page.tsx` carga datos reales desde `/api/solicitantes`
- [ ] La tabla muestra SOLO los solicitantes (clientes con fecha_solicitud IS NOT NULL)
- [ ] Los datos se muestran correctamente en las columnas: Cédula, Nombre Completo, Teléfono Celular, Núcleo, Fecha Solicitud
- [ ] No hay errores en la consola del navegador
- [ ] No hay errores en la terminal del servidor

---

## 🎓 Notas Importantes

1. **Solicitantes vs Clientes**: Recuerda que NO todos los clientes son solicitantes. Solo los que tienen `fecha_solicitud IS NOT NULL` son solicitantes.
2. **Campos obligatorios**: Todos los solicitantes tienen todos sus campos obligatorios (nombres, apellidos, fecha_nacimiento, telefono_celular, correo_electronico, sexo, nacionalidad) porque así está configurado el schema.
3. **Esta tarea es solo lectura**: No necesitas crear, actualizar o eliminar. Solo obtener y mostrar datos.
4. **Relaciones de la tabla clientes**: La tabla `clientes` tiene muchas relaciones con otras tablas. **PARA SOLICITANTES, TODAS SON OBLIGATORIAS**:
   - **nucleos**: **OBLIGATORIO** - `id_nucleo` siempre tiene un valor
   - **parroquias, municipios, estados**: **OBLIGATORIO** - `id_parroquia` siempre tiene un valor
   - **viviendas**: **OBLIGATORIO** - `id_vivienda` siempre tiene un valor
   - **trabajos**: **OBLIGATORIO** - `id_trabajo` siempre tiene un valor
   - **familias_hogares**: **OBLIGATORIO** - `id_hogar` siempre tiene un valor
   - **niveles_educativos**: **OBLIGATORIO** - `id_nivel_educativo` siempre tiene un valor
   - **IMPORTANTE**: La base de datos tiene un constraint `check_solicitante_completo` que garantiza que si `fecha_solicitud IS NOT NULL`, entonces TODOS estos campos deben ser NOT NULL

---

## 📚 Recursos de Referencia

- Ver el ejemplo de `casos.queries.ts` en `lib/db/queries/` para entender la estructura
- Ver los archivos SQL de `database/queries/casos/` como referencia
- Consultar la documentación en `ARCHITECTURE.md` para entender el flujo de datos
- **IMPORTANTE**: Revisar `database/schemas/schema.sql` para ver:
  - La estructura completa de la tabla `clientes` (líneas 114-134)
  - Todas las relaciones (foreign keys) que tiene la tabla
  - Qué campos son NOT NULL y cuáles son opcionales
  - Las estructuras de las tablas relacionadas (nucleos, parroquias, municipios, estados, viviendas, trabajos, familias_hogares, niveles_educativos)

