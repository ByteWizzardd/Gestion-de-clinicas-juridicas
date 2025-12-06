# 📋 Módulo de Listado de Casos

## 🎯 Objetivo
Conectar el módulo de Listado de Casos del frontend con el backend para que muestre todos los **CASOS** de la base de datos en la tabla, reemplazando los datos de prueba (mock data).

**Esta tarea es SOLO para OBTENER y MOSTRAR casos, NO para crear, actualizar o eliminar.**

---

## 📍 Ubicación de Archivos

### Estructura de Carpetas que Trabajaremos:
```
proyecto/
├── database/queries/casos/            ← Aquí va el archivo SQL para casos
├── database/queries/clientes/          ← Aquí va query para obtener nombres
├── database/queries/asignaciones/      ← Aquí va query para obtener responsables
├── lib/db/queries/                     ← Aquí van los helpers TypeScript
├── lib/services/                       ← Aquí va el servicio
├── app/api/casos/                      ← Aquí va la API route
└── app/dashboard/cases/page.tsx        ← Aquí modificamos el frontend
```

---

## 🔨 PASO 1: Crear la Query SQL para Obtener Casos

### ¿Dónde?
En la carpeta: `database/queries/casos/`

### ¿Qué hacer?
Modificar o crear el archivo SQL para obtener TODOS los casos:

#### 1.1. Archivo: `get-all.sql`
- **Ubicación**: `database/queries/casos/get-all.sql`
- **Qué debe hacer**: Crear una consulta SQL que obtenga **TODOS los casos** de la tabla `casos`

**Campos de la tabla `casos` que debes incluir:**
- `id_caso` - ID del caso (SERIAL, PRIMARY KEY)
- `fecha_inicio_caso` - Fecha de inicio (DATE NOT NULL)
- `fecha_fin_caso` - Fecha de fin (DATE, opcional)
- `tramite` - Tipo de trámite (VARCHAR NOT NULL)
- `estatus` - Estatus del caso (VARCHAR NOT NULL)
- `observaciones` - Observaciones (TEXT NOT NULL)
- `id_nucleo` - ID del núcleo (INTEGER NOT NULL, foreign key)
- `id_ambito_legal` - ID del ámbito legal (INTEGER NOT NULL, foreign key)
- `id_expediente` - ID del expediente (VARCHAR, opcional, foreign key)
- `cedula_cliente` - Cédula del cliente (VARCHAR NOT NULL, foreign key)

**Orden**: Por fecha de inicio descendente (más recientes primero)

**Ejemplo de estructura SQL:**
```sql
SELECT 
    id_caso,
    fecha_inicio_caso,
    fecha_fin_caso,
    tramite,
    estatus,
    observaciones,
    id_nucleo,
    id_ambito_legal,
    id_expediente,
    cedula_cliente
FROM casos
ORDER BY fecha_inicio_caso DESC;
```

---

## 🔨 PASO 2: Crear Queries Adicionales para Obtener Nombres

### ¿Dónde?
En las carpetas: `database/queries/clientes/` y `database/queries/asignaciones/`

### ¿Qué hacer?
Necesitas crear queries adicionales para obtener los nombres del solicitante y del responsable:

#### 2.1. Query para obtener nombre del cliente (solicitante):
- **Ubicación**: `database/queries/clientes/get-nombre-by-cedula.sql`
- **Qué debe hacer**: Obtener `nombres` y `apellidos` de un cliente por su cédula
- **Parámetro**: `$1` = cedula (VARCHAR)
- **Ejemplo SQL**:
```sql
SELECT nombres, apellidos
FROM clientes
WHERE cedula = $1;
```

#### 2.2. Query para obtener los profesores responsables activos de un caso:
- **Ubicación**: `database/queries/asignaciones/get-profesores-responsables-by-caso.sql`
- **Qué debe hacer**: Obtener todas las `cedula_profesor` DISTINTAS de los profesores que tienen asignaciones activas en un caso
- **Parámetro**: `$1` = id_caso (INTEGER)
- **Nota importante**: 
  - La tabla `asignaciones` relaciona casos con profesores mediante `id_caso` y `cedula_profesor`
  - Un caso puede tener múltiples asignaciones (cada una con un estudiante y un profesor)
  - Un mismo profesor puede tener múltiples asignaciones en el mismo caso (con diferentes estudiantes)
  - Para obtener los responsables actuales, debes buscar asignaciones ACTIVAS (donde `fecha_fin` es NULL o aún no ha llegado)
  - Debes obtener los `cedula_profesor` DISTINTOS para evitar duplicados
- **Ejemplo SQL**:
```sql
SELECT DISTINCT cedula_profesor
FROM asignaciones
WHERE id_caso = $1
  AND (fecha_fin IS NULL OR fecha_fin >= CURRENT_DATE)
ORDER BY cedula_profesor;
```

**Nota**: Esta query puede retornar múltiples filas (un caso puede tener varios profesores responsables activos). Si solo necesitas uno para mostrar en la tabla, puedes usar `LIMIT 1` o manejar todos en el backend y mostrar el primero.

---

## 🔨 PASO 3: Crear el Helper TypeScript para Queries de Casos

### ¿Dónde?
En la carpeta: `lib/db/queries/`

### ¿Qué hacer?
Crear o modificar el archivo: `casos.queries.ts`

#### 3.1. Estructura del archivo:
- **Importar** `loadSQL` desde `../sql-loader`
- **Importar** `pool` desde `../pool`
- **Importar** `QueryResult` desde `pg`

#### 3.2. Crear un objeto exportado llamado `casosQueries` con UNA función:

**3.2.1. Función `getAll`:**
- Cargar el SQL de `casos/get-all.sql` usando `loadSQL`
- Ejecutar la query con `pool.query()` (sin parámetros, ya que no necesita filtros)
- Retornar `result.rows` (array de casos)

---

## 🔨 PASO 4: Crear Helpers TypeScript para las Queries Adicionales

### ¿Dónde?
En las carpetas: `lib/db/queries/`

### ¿Qué hacer?

#### 4.1. Modificar `clientes.queries.ts` (o crear si no existe):
- Agregar función `getNombreByCedula(cedula: string)`:
  - Cargar SQL de `clientes/get-nombre-by-cedula.sql`
  - Ejecutar con `pool.query(query, [cedula])`
  - Retornar `result.rows[0]` (objeto con `nombres` y `apellidos`)

#### 4.2. Crear `asignaciones.queries.ts`:
- Crear archivo en `lib/db/queries/asignaciones.queries.ts`
- Agregar función `getProfesoresResponsablesByCaso(idCaso: number)`:
  - Cargar SQL de `asignaciones/get-profesores-responsables-by-caso.sql`
  - Ejecutar con `pool.query(query, [idCaso])`
  - Retornar `result.rows` (array de objetos con `cedula_profesor`)
  - **Nota**: Puede retornar múltiples profesores. Si solo necesitas uno, puedes tomar el primero del array

---

## 🔨 PASO 5: Crear el Servicio

### ¿Dónde?
En la carpeta: `lib/services/`

### ¿Qué hacer?
Crear un archivo llamado: `casos.service.ts`

#### 5.1. Importar dependencias:
- Importar `casosQueries` desde `@/lib/db/queries/casos.queries`
- Importar `clientesQueries` desde `@/lib/db/queries/clientes.queries`
- Importar `asignacionesQueries` desde `@/lib/db/queries/asignaciones.queries`
- Importar `AppError` desde `@/lib/utils/errors`

#### 5.2. Crear función del servicio:

**5.2.1. Función `getAllCasos`:**
- Llamar a `casosQueries.getAll()` para obtener todos los casos
- Para cada caso, hacer lo siguiente:
  1. **Obtener nombre del cliente (solicitante)**:
     - Usar `caso.cedula_cliente` (esta cédula está directamente en la tabla `casos`)
     - Llamar a `clientesQueries.getNombreByCedula(caso.cedula_cliente)`
     - Concatenar `nombres + ' ' + apellidos` y agregarlo al caso como `nombre_solicitante`
  2. **Obtener profesor responsable**:
     - La tabla `casos` NO tiene cédula del profesor, solo tiene `cedula_cliente` (del solicitante)
     - Para obtener el profesor responsable, debes ir a la tabla `asignaciones`:
       - Llamar a `asignacionesQueries.getProfesoresResponsablesByCaso(caso.id_caso)` para obtener el array de profesores responsables activos
     - Si existe al menos un profesor (array no vacío):
       - Tomar el primer profesor del array (o el más reciente si están ordenados)
       - Obtener su `cedula_profesor`
       - Llamar a `clientesQueries.getNombreByCedula(cedula_profesor)` para obtener el nombre del profesor
       - Concatenar `nombres + ' ' + apellidos` y agregarlo al caso como `nombre_responsable`
     - Si NO existe ningún profesor responsable activo (array vacío), poner `nombre_responsable = null`
- Retornar el array de casos con los nombres agregados
- Manejar errores con try/catch y lanzar `AppError` si algo falla

**Nota sobre múltiples profesores responsables**: Un caso puede tener varios profesores responsables activos (cada uno con diferentes asignaciones). Para la columna "Responsable Principal" en el frontend, puedes mostrar el primero o concatenar todos los nombres. Por ahora, toma el primero del array.

---

## 🔨 PASO 6: Crear la API Route

### ¿Dónde?
En la carpeta: `app/api/casos/`

### ¿Qué hacer?
Crear un archivo llamado: `route.ts`

#### 6.1. Importar dependencias:
- Importar `NextRequest`, `NextResponse` desde `next/server`
- Importar el servicio desde `@/lib/services/casos.service`
- Importar `handleApiError` desde `@/lib/utils/responses` (o similar)

#### 6.2. Crear función `GET` (para obtener todos los casos):
- Exportar función `async GET(request: NextRequest)`
- Dentro, llamar a `getAllCasos()` del servicio
- Retornar `NextResponse.json()` con los datos
- Manejar errores con try/catch y retornar error apropiado
- **Nota**: Esta ruta solo tiene GET, no POST ni PUT porque solo es para mostrar datos

---

## 🔨 PASO 7: Modificar el Frontend

### ¿Dónde?
En el archivo: `app/dashboard/cases/page.tsx`

### ¿Qué hacer?

#### 7.1. Verificar que sea Client Component:
- Ya tiene `'use client'` ✅

#### 7.2. Importar hooks de React:
- Verificar que tenga `useState` y `useEffect` importados
- Si no, agregarlos desde `react`

#### 7.3. Eliminar datos de prueba (mock):
- **ELIMINAR** el array `mockCases` completo
- Ya no se necesitan datos de prueba

#### 7.4. Crear estado para los datos:
- Crear un estado `const [casos, setCasos] = useState([])`
- Crear un estado `const [loading, setLoading] = useState(true)`
- Crear un estado `const [error, setError] = useState(null)` (opcional, para manejar errores)

#### 7.5. Crear función para cargar datos:
- Crear función `async fetchCasos()`
- Dentro:
  - Poner `setLoading(true)`
  - Limpiar error anterior: `setError(null)`
  - Hacer `fetch('/api/casos')`
  - Verificar que la respuesta sea ok: `if (!response.ok) throw new Error(...)`
  - Convertir respuesta a JSON: `const data = await response.json()`
  - Llamar a `setCasos(data)` o `setCasos(data.casos)` según la estructura de la respuesta
  - Poner `setLoading(false)`
  - Manejar errores con try/catch y mostrar mensaje de error

#### 7.6. Usar useEffect:
- Agregar `useEffect(() => { fetchCasos() }, [])`
- Esto cargará los datos cuando la página se monte

#### 7.7. Mapear los datos para la tabla:
- Transformar los datos de `casos` al formato que espera la tabla
- La tabla actual espera columnas: ["Código", "Solicitante", "Materia", "Estatus", "Responsable Principal"]
- Crear un array `tableData` que mapee cada caso a un objeto con esas propiedades:
  - `codigo`: Puede ser `CASE-${id_caso}` o usar el `id_caso` directamente
  - `solicitante`: Usar `nombre_solicitante` que viene del backend (ya está concatenado como "Nombres Apellidos")
  - `materia`: Usar el campo `tramite` (que es el tipo de trámite)
  - `estatus`: Del campo `estatus` del caso
  - `responsable`: Usar `nombre_responsable` que viene del backend. Si es `null`, mostrar "Sin asignar" o "-"
- **Nota**: El backend ya hace las consultas para obtener los nombres, así que en el frontend solo necesitas mapear los datos que vienen de la API

#### 7.8. Mostrar estados de carga y error:
- Si `loading` es `true`, mostrar un mensaje "Cargando casos..." o un spinner
- Si `error` existe, mostrar el mensaje de error
- Si `loading` es `false` y no hay error, mostrar la tabla

#### 7.9. Actualizar la tabla:
- Cambiar `data={mockCases}` por `data={tableData}`
- Las funciones `onView`, `onEdit`, `onDelete` ya existen, pero para esta tarea solo necesitas `onView`:
  - `onView`: Puede mostrar un alert con la información del caso o hacer `console.log` por ahora
  - `onEdit` y `onDelete`: Pueden quedar como están (solo console.log) ya que esta tarea es solo para mostrar datos

---

## ✅ Checklist Final

Antes de considerar la tarea completa, verifica:

- [ ] El archivo SQL `get-all.sql` está creado o modificado en `database/queries/casos/`
- [ ] El archivo SQL `get-nombre-by-cedula.sql` está creado en `database/queries/clientes/`
- [ ] El archivo SQL `get-profesores-responsables-by-caso.sql` está creado en `database/queries/asignaciones/`
- [ ] El helper `casos.queries.ts` está creado o modificado y exporta la función `getAll`
- [ ] El helper `clientes.queries.ts` tiene la función `getNombreByCedula`
- [ ] El helper `asignaciones.queries.ts` está creado y tiene la función `getProfesoresResponsablesByCaso`
- [ ] El servicio `casos.service.ts` tiene la función `getAllCasos` que obtiene los nombres
- [ ] La API route `app/api/casos/route.ts` tiene la función GET
- [ ] El frontend `app/dashboard/cases/page.tsx` carga datos reales desde `/api/casos`
- [ ] La tabla muestra todos los casos de la base de datos
- [ ] Los datos se muestran correctamente en las columnas: Código, Solicitante (NOMBRE), Materia, Estatus, Responsable Principal (NOMBRE)
- [ ] La columna "Solicitante" muestra el nombre completo del cliente, no la cédula
- [ ] La columna "Responsable Principal" muestra el nombre completo del profesor o "Sin asignar" si no hay profesor responsable activo
- [ ] No hay errores en la consola del navegador
- [ ] No hay errores en la terminal del servidor
- [ ] Los datos mock fueron eliminados completamente
---

## 📚 Recursos de Referencia

- Ver la TAREA 1 (Módulo de Solicitantes) como referencia del patrón a seguir
- Ver el ejemplo de `solicitantes.queries.ts` en `lib/db/queries/` para entender la estructura
- Consultar la documentación en `ARCHITECTURE.md` para entender el flujo de datos
- Revisar `database/schemas/schema.sql` para entender las relaciones:
  - Líneas 201-220: Estructura de la tabla `casos`
  - Líneas 267-275: Estructura de la tabla `asignaciones` (relación casos-profesores-estudiantes)
  - Líneas 115-148: Estructura de la tabla `clientes` (donde están los nombres)
  - Líneas 168-170: Estructura de la tabla `profesores` (relación con usuarios y clientes)

