# 📋 Sistema de Auditoría - Documentación Completa

## 📖 Índice

1. [Introducción](#introducción)
2. [Tablas de Auditoría](#tablas-de-auditoría)
3. [Triggers y Funciones](#triggers-y-funciones)
4. [Variables de Sesión](#variables-de-sesión)
5. [Queries y Consultas](#queries-y-consultas)
6. [Componentes de UI](#componentes-de-ui)
7. [Server Actions](#server-actions)
8. [Tipos TypeScript](#tipos-typescript)
9. [Flujo de Trabajo](#flujo-de-trabajo)
10. [Ejemplos de Uso](#ejemplos-de-uso)

---

## 🎯 Introducción

El sistema de auditoría registra automáticamente todas las acciones críticas realizadas en el sistema, incluyendo:

- **Eliminaciones**: Soportes, citas y usuarios eliminados
- **Actualizaciones**: Cambios en citas y usuarios (con valores anteriores y nuevos)
- **Trazabilidad**: Quién realizó la acción, cuándo y por qué

### Características Principales

- ✅ **Automático**: Los triggers de PostgreSQL registran las acciones sin intervención manual
- ✅ **Completo**: Guarda valores anteriores y nuevos para comparación
- ✅ **Trazable**: Registra usuario, fecha/hora y motivo de cada acción
- ✅ **Seguro**: Solo coordinadores pueden acceder a los registros de auditoría
- ✅ **Eficiente**: No guarda archivos completos, solo metadatos para ahorrar espacio

---

## 📊 Tablas de Auditoría

### 1. `auditoria_eliminacion_soportes`

Registra los soportes (documentos) eliminados del sistema.

**Estructura:**
```sql
CREATE TABLE auditoria_eliminacion_soportes (
    id SERIAL PRIMARY KEY,
    num_soporte INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    nombre_archivo VARCHAR(150) NOT NULL,
    tipo_mime VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_consignacion DATE NOT NULL,
    tamano_bytes INTEGER,                    -- Tamaño del archivo (sin guardar el archivo)
    id_usuario_subio VARCHAR(20),           -- Usuario que subió el archivo originalmente
    id_usuario_elimino VARCHAR(20) NOT NULL, -- Usuario que eliminó el archivo
    motivo TEXT,                             -- Motivo de la eliminación
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);
```

**Nota importante**: No se guarda el contenido del archivo (`documento_data`), solo metadatos y tamaño para ahorrar espacio en la base de datos.

**Índices:**
- `idx_auditoria_soportes_caso` - Búsqueda por caso
- `idx_auditoria_soportes_usuario_elimino` - Búsqueda por usuario que eliminó
- `idx_auditoria_soportes_fecha` - Búsqueda por fecha

---

### 2. `auditoria_eliminacion_citas`

Registra las citas eliminadas del sistema.

**Estructura:**
```sql
CREATE TABLE auditoria_eliminacion_citas (
    id SERIAL PRIMARY KEY,
    num_cita INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    fecha_encuentro DATE NOT NULL,
    fecha_proxima_cita DATE,
    orientacion TEXT NOT NULL,
    id_usuario_registro VARCHAR(20),        -- Usuario que registró la cita originalmente
    id_usuario_elimino VARCHAR(20) NOT NULL, -- Usuario que eliminó la cita
    motivo TEXT,                            -- Motivo de la eliminación
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);
```

**Campos clave:**
- Guarda solo metadatos de la cita eliminada
- No guarda información adicional del caso
- Registra quién creó la cita originalmente y quién la eliminó

---

### 3. `auditoria_actualizacion_citas`

Registra todas las actualizaciones realizadas en las citas, guardando valores anteriores y nuevos.

**Estructura:**
```sql
CREATE TABLE auditoria_actualizacion_citas (
    id SERIAL PRIMARY KEY,
    num_cita INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    -- Valores anteriores (antes de la actualización)
    fecha_encuentro_anterior DATE,
    fecha_proxima_cita_anterior DATE,
    orientacion_anterior TEXT,
    -- Valores nuevos (después de la actualización)
    fecha_encuentro_nueva DATE,
    fecha_proxima_cita_nueva DATE,
    orientacion_nueva TEXT,
    -- Información de auditoría
    id_usuario_actualizo VARCHAR(20) NOT NULL,
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);
```

**Características:**
- Solo registra cambios si hay diferencias reales entre OLD y NEW
- Permite comparar valores anteriores vs nuevos
- Útil para rastrear el historial completo de cambios

---

### 4. `auditoria_eliminacion_usuario`

Registra los usuarios eliminados físicamente del sistema.

**Estructura:**
```sql
CREATE TABLE auditoria_eliminacion_usuario (
    id SERIAL PRIMARY KEY,
    usuario_eliminado VARCHAR(20) NOT NULL,      -- Cédula del usuario eliminado
    nombres_usuario_eliminado VARCHAR(100),      -- Nombre (guardado antes de eliminar)
    apellidos_usuario_eliminado VARCHAR(100),    -- Apellido (guardado antes de eliminar)
    eliminado_por VARCHAR(20) NOT NULL,          -- Cédula del usuario que eliminó
    motivo TEXT NOT NULL,                        -- Motivo de la eliminación
    fecha TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);
```

**Nota importante**: Se guardan los nombres y apellidos del usuario eliminado antes de eliminarlo, ya que después no estarán disponibles en la tabla `usuarios`.

---

### 5. `auditoria_actualizacion_usuarios`

Registra todas las actualizaciones de campos de usuarios, incluyendo cambios de tipo de usuario, tipo de estudiante y tipo de profesor.

**Estructura:**
```sql
CREATE TABLE auditoria_actualizacion_usuarios (
    id SERIAL PRIMARY KEY,
    ci_usuario VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    -- Valores anteriores
    nombres_anterior VARCHAR(100),
    apellidos_anterior VARCHAR(100),
    correo_electronico_anterior VARCHAR(100),
    nombre_usuario_anterior VARCHAR(50),
    telefono_celular_anterior VARCHAR(20),
    habilitado_sistema_anterior BOOLEAN,
    tipo_usuario_anterior VARCHAR(20),
    tipo_estudiante_anterior VARCHAR(50),
    tipo_profesor_anterior VARCHAR(20),
    -- Valores nuevos
    nombres_nuevo VARCHAR(100),
    apellidos_nuevo VARCHAR(100),
    correo_electronico_nuevo VARCHAR(100),
    nombre_usuario_nuevo VARCHAR(50),
    telefono_celular_nuevo VARCHAR(20),
    habilitado_sistema_nuevo BOOLEAN,
    tipo_usuario_nuevo VARCHAR(20),
    tipo_estudiante_nuevo VARCHAR(50),
    tipo_profesor_nuevo VARCHAR(20),
    -- Información de auditoría
    id_usuario_actualizo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);
```

**Campos especiales:**
- `tipo_usuario_anterior/nuevo`: Cambios entre coordinador, profesor, estudiante
- `tipo_estudiante_anterior/nuevo`: Cambios en tipo de estudiante (si aplica)
- `tipo_profesor_anterior/nuevo`: Cambios en tipo de profesor (si aplica)

**Nota**: Esta auditoría se maneja directamente en el procedimiento `update_all_by_cedula` en lugar de usar triggers, para poder capturar cambios en tablas relacionadas (`estudiantes`, `profesores`).

---

## ⚙️ Triggers y Funciones

### 1. Trigger de Eliminación de Soportes

**Función:** `trigger_auditoria_eliminacion_soporte()`

**Trigger:** `trigger_auditoria_eliminacion_soporte` (BEFORE DELETE)

**Ubicación:** `database/migrations/add-trigger-auditoria-soportes.sql`

**Funcionamiento:**
1. Se ejecuta **ANTES** de eliminar un soporte
2. Lee la variable de sesión `app.usuario_elimina_soporte` para obtener quién eliminó
3. Lee la variable de sesión `app.motivo_eliminacion_soporte` para obtener el motivo
4. Guarda metadatos del soporte (sin el archivo completo) en la tabla de auditoría
5. Calcula el tamaño del archivo con `LENGTH(OLD.documento_data)`

**Código:**
```sql
CREATE OR REPLACE FUNCTION trigger_auditoria_eliminacion_soporte()
RETURNS TRIGGER AS $$
DECLARE
    cedula_usuario VARCHAR(20);
BEGIN
    -- Obtener usuario desde variable de sesión
    BEGIN
        cedula_usuario := current_setting('app.usuario_elimina_soporte', true);
    EXCEPTION
        WHEN OTHERS THEN
            cedula_usuario := NULL;
    END;
    
    -- Registrar auditoría si hay usuario
    IF cedula_usuario IS NOT NULL AND cedula_usuario != '' THEN
        INSERT INTO auditoria_eliminacion_soportes (
            num_soporte, id_caso, nombre_archivo, tipo_mime,
            descripcion, fecha_consignacion, tamano_bytes,
            id_usuario_subio, id_usuario_elimino, motivo
        ) VALUES (
            OLD.num_soporte, OLD.id_caso, OLD.nombre_archivo,
            OLD.tipo_mime, OLD.descripcion, OLD.fecha_consignacion,
            LENGTH(OLD.documento_data), -- Solo tamaño, no el archivo
            OLD.id_usuario_subio, cedula_usuario,
            current_setting('app.motivo_eliminacion_soporte', true)
        );
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;
```

---

### 2. Trigger de Eliminación de Citas

**Función:** `trigger_auditoria_eliminacion_cita()`

**Trigger:** `trigger_auditoria_eliminacion_cita` (BEFORE DELETE)

**Ubicación:** `database/migrations/add-trigger-auditoria-citas.sql`

**Funcionamiento:**
1. Se ejecuta **ANTES** de eliminar una cita
2. Lee las variables de sesión `app.usuario_elimina_cita` y `app.motivo_eliminacion_cita`
3. Guarda todos los metadatos de la cita eliminada

**Código:**
```sql
CREATE OR REPLACE FUNCTION trigger_auditoria_eliminacion_cita()
RETURNS TRIGGER AS $$
DECLARE
    cedula_usuario VARCHAR(20);
    motivo_eliminacion TEXT;
BEGIN
    BEGIN
        cedula_usuario := current_setting('app.usuario_elimina_cita', true);
        motivo_eliminacion := current_setting('app.motivo_eliminacion_cita', true);
    EXCEPTION
        WHEN OTHERS THEN
            cedula_usuario := NULL;
            motivo_eliminacion := NULL;
    END;
    
    IF cedula_usuario IS NOT NULL AND cedula_usuario != '' THEN
        INSERT INTO auditoria_eliminacion_citas (
            num_cita, id_caso, fecha_encuentro, fecha_proxima_cita,
            orientacion, id_usuario_registro, id_usuario_elimino, motivo
        ) VALUES (
            OLD.num_cita, OLD.id_caso, OLD.fecha_encuentro,
            OLD.fecha_proxima_cita, OLD.orientacion,
            OLD.id_usuario_registro, cedula_usuario, motivo_eliminacion
        );
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;
```

---

### 3. Trigger de Actualización de Citas

**Función:** `trigger_auditoria_actualizacion_cita()`

**Trigger:** `trigger_auditoria_actualizacion_cita` (AFTER UPDATE)

**Ubicación:** `database/migrations/add-trigger-auditoria-actualizacion-citas.sql`

**Funcionamiento:**
1. Se ejecuta **DESPUÉS** de actualizar una cita
2. Compara valores OLD vs NEW para detectar cambios reales
3. Solo registra si hay cambios en `fecha_encuentro`, `fecha_proxima_cita` o `orientacion`
4. Guarda valores anteriores y nuevos para comparación

**Código:**
```sql
CREATE OR REPLACE FUNCTION trigger_auditoria_actualizacion_cita()
RETURNS TRIGGER AS $$
DECLARE
    cedula_usuario VARCHAR(20);
BEGIN
    BEGIN
        cedula_usuario := current_setting('app.usuario_actualiza_cita', true);
    EXCEPTION
        WHEN OTHERS THEN
            cedula_usuario := NULL;
    END;
    
    -- Solo registrar si hay cambios reales
    IF cedula_usuario IS NOT NULL AND cedula_usuario != '' THEN
        IF (OLD.fecha_encuentro IS DISTINCT FROM NEW.fecha_encuentro) OR
           (OLD.fecha_proxima_cita IS DISTINCT FROM NEW.fecha_proxima_cita) OR
           (OLD.orientacion IS DISTINCT FROM NEW.orientacion) THEN
            
            INSERT INTO auditoria_actualizacion_citas (
                num_cita, id_caso,
                fecha_encuentro_anterior, fecha_proxima_cita_anterior, orientacion_anterior,
                fecha_encuentro_nueva, fecha_proxima_cita_nueva, orientacion_nueva,
                id_usuario_actualizo
            ) VALUES (
                NEW.num_cita, NEW.id_caso,
                OLD.fecha_encuentro, OLD.fecha_proxima_cita, OLD.orientacion,
                NEW.fecha_encuentro, NEW.fecha_proxima_cita, NEW.orientacion,
                cedula_usuario
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### 4. Auditoría de Usuarios

**Nota importante**: La auditoría de actualización de usuarios **NO usa triggers**. Se maneja directamente en el procedimiento `update_all_by_cedula` en `lib/db/queries/usuarios.queries.ts` para poder capturar cambios en tablas relacionadas (`estudiantes`, `profesores`).

La eliminación de usuarios se registra manualmente en el código antes de eliminar el usuario.

---

## 🔧 Variables de Sesión

Los triggers utilizan variables de sesión de PostgreSQL para obtener información del usuario que realiza la acción. Estas variables se establecen **antes** de ejecutar la operación.

### Variables Disponibles

| Variable | Descripción | Usado en |
|----------|-------------|----------|
| `app.usuario_elimina_soporte` | Cédula del usuario que elimina un soporte | Trigger de eliminación de soportes |
| `app.motivo_eliminacion_soporte` | Motivo de eliminación del soporte | Trigger de eliminación de soportes |
| `app.usuario_elimina_cita` | Cédula del usuario que elimina una cita | Trigger de eliminación de citas |
| `app.motivo_eliminacion_cita` | Motivo de eliminación de la cita | Trigger de eliminación de citas |
| `app.usuario_actualiza_cita` | Cédula del usuario que actualiza una cita | Trigger de actualización de citas |

### Cómo Establecer Variables de Sesión

En el código TypeScript (ejemplo para eliminar una cita):

```typescript
// En lib/services/citas.service.ts
await client.query(
  "SELECT set_config('app.usuario_elimina_cita', $1, true)", 
  [params.idUsuarioElimino]
);
await client.query(
  "SELECT set_config('app.motivo_eliminacion_cita', $1, true)", 
  [params.motivo || '']
);

// Luego ejecutar el DELETE
const deleteCitaQuery = loadSQL('citas/delete.sql');
await client.query(deleteCitaQuery, [num_cita, id_caso]);
```

**Parámetros de `set_config`:**
- `$1`: Nombre de la variable
- `$2`: Valor de la variable
- `true`: `local` = solo para esta transacción, `true` = para toda la sesión

---

## 📝 Queries y Consultas

Todas las queries de auditoría están organizadas en carpetas dentro de `database/queries/`:

### Estructura de Carpetas

```
database/queries/
├── auditoria-eliminacion-soportes/
│   ├── get-all.sql          # Obtener todos con filtros
│   ├── get-by-caso.sql      # Obtener por caso
│   ├── get-count.sql         # Contar total
│   └── get-documento.sql     # Obtener documento eliminado (si existe)
├── auditoria-eliminacion-citas/
│   ├── get-all.sql
│   ├── get-by-caso.sql
│   ├── get-by-cita.sql
│   └── get-count.sql
├── auditoria-actualizacion-citas/
│   ├── get-all.sql
│   ├── get-by-caso.sql
│   ├── get-by-cita.sql
│   └── get-count.sql
├── auditoria-eliminacion-usuario/
│   ├── get-all.sql
│   └── get-count.sql
└── auditoria-actualizacion-usuarios/
    ├── get-all.sql
    ├── get-by-usuario.sql
    ├── get-count.sql
    └── create.sql            # Crear registro manualmente
```

### Filtros Comunes

Todas las queries `get-all.sql` soportan los siguientes filtros opcionales:

```typescript
interface AuditFilters {
  fechaInicio?: string;      // Fecha de inicio (DATE)
  fechaFin?: string;         // Fecha de fin (DATE)
  idUsuario?: string;        // Cédula del usuario que realizó la acción
  busqueda?: string;         // Búsqueda de texto (varía según tabla)
  orden?: 'asc' | 'desc';   // Ordenamiento (por defecto 'desc')
}
```

### Ejemplo de Query con Filtros

```sql
-- database/queries/auditoria-eliminacion-soportes/get-all.sql
SELECT 
    a.id, a.num_soporte, a.id_caso, a.nombre_archivo,
    a.fecha_eliminacion, a.motivo,
    u_elimino.nombres AS nombres_usuario_elimino,
    u_elimino.apellidos AS apellidos_usuario_elimino
FROM auditoria_eliminacion_soportes a
LEFT JOIN usuarios u_elimino ON a.id_usuario_elimino = u_elimino.cedula
WHERE 
    ($1::DATE IS NULL OR a.fecha_eliminacion::DATE >= $1)  -- fechaInicio
    AND ($2::DATE IS NULL OR a.fecha_eliminacion::DATE <= $2)  -- fechaFin
    AND ($3::VARCHAR IS NULL OR a.id_usuario_elimino = $3)  -- idUsuario
    AND ($4::TEXT IS NULL OR a.nombre_archivo ILIKE '%' || $4 || '%')  -- busqueda
ORDER BY 
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') 
         THEN a.fecha_eliminacion END DESC NULLS LAST;
```

---

## 🎨 Componentes de UI

### 1. Página Principal de Auditoría

**Ruta:** `/dashboard/audit`

**Archivo:** `app/dashboard/audit/page.tsx`

**Componente:** `components/audit/AuditClient.tsx`

**Funcionalidad:**
- Muestra cards con contadores de cada tipo de auditoría
- Búsqueda por tipo de auditoría
- Navegación a páginas de detalle

**Cards mostradas:**
1. Soportes Eliminados
2. Citas Eliminadas
3. Citas Actualizadas
4. Usuarios Eliminados
5. Usuarios Actualizados (Campos)

---

### 2. Páginas de Detalle

Cada tipo de auditoría tiene su propia página de detalle:

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/dashboard/audit/soportes` | `AuditDetailClient` | Lista de soportes eliminados |
| `/dashboard/audit/citas-eliminadas` | `AuditDetailClient` | Lista de citas eliminadas |
| `/dashboard/audit/citas-actualizadas` | `AuditDetailClient` | Lista de citas actualizadas |
| `/dashboard/audit/usuarios-eliminados` | `AuditDetailClient` | Lista de usuarios eliminados |
| `/dashboard/audit/usuarios-actualizados-campos` | `AuditDetailClient` | Lista de usuarios actualizados |

**Componente común:** `components/audit/detail/AuditDetailClient.tsx`

**Características:**
- Filtros por fecha, usuario y búsqueda de texto
- Ordenamiento ascendente/descendente
- Visualización de valores anteriores vs nuevos (para actualizaciones)
- Información del usuario que realizó la acción

---

## 🔐 Server Actions

Todas las acciones de auditoría están en `app/actions/audit.ts`:

### Funciones Disponibles

```typescript
// Obtener contadores
getAuditCountsAction(): Promise<AuditCounts>

// Obtener registros con filtros
getSoportesAuditAction(filters?: AuditFilters)
getCitasEliminadasAuditAction(filters?: AuditFilters)
getCitasActualizadasAuditAction(filters?: AuditFilters)
getUsuariosEliminadosAuditAction(filters?: AuditFilters)
getUsuariosActualizadosCamposAuditAction(filters?: AuditFilters)
```

### Seguridad

**Todas las acciones requieren:**
- Autenticación válida
- Rol de **Coordinador** (`coordinator`)

Si el usuario no cumple estos requisitos, se lanza un error `'No autorizado'`.

---

## 📘 Tipos TypeScript

Todos los tipos están definidos en `types/audit.ts`:

### Interfaces Principales

```typescript
// Base para todos los registros
interface AuditRecord {
  id: number;
  fecha: string;
  usuario_accion: string;
  nombre_completo_usuario_accion?: string;
}

// Tipos específicos
interface SoporteAuditRecord extends AuditRecord { ... }
interface CitaEliminadaAuditRecord extends AuditRecord { ... }
interface CitaActualizadaAuditRecord extends AuditRecord { ... }
interface UsuarioEliminadoAuditRecord extends AuditRecord { ... }
interface UsuarioActualizadoCamposAuditRecord extends AuditRecord { ... }

// Filtros
interface AuditFilters {
  fechaInicio?: string;
  fechaFin?: string;
  idUsuario?: string;
  busqueda?: string;
  orden?: 'asc' | 'desc';
}

// Contadores
interface AuditCounts {
  soportes: number;
  citasEliminadas: number;
  citasActualizadas: number;
  usuariosEliminados: number;
  usuariosActualizadosCampos: number;
}
```

---

## 🔄 Flujo de Trabajo

### Eliminación de una Cita

1. **Usuario hace clic en "Eliminar cita"** en el frontend
2. **Server Action** (`deleteAppointment`) se ejecuta
3. **Service** (`citasService.deleteAppointment`) recibe parámetros:
   - `appointmentId`: ID de la cita
   - `idUsuarioElimino`: Cédula del usuario
   - `motivo`: Motivo de eliminación
4. **Service establece variables de sesión:**
   ```typescript
   await client.query("SELECT set_config('app.usuario_elimina_cita', $1, true)", [idUsuarioElimino]);
   await client.query("SELECT set_config('app.motivo_eliminacion_cita', $1, true)", [motivo]);
   ```
5. **Service ejecuta DELETE:**
   ```typescript
   const deleteCitaQuery = loadSQL('citas/delete.sql');
   await client.query(deleteCitaQuery, [num_cita, id_caso]);
   ```
6. **Trigger se ejecuta automáticamente:**
   - Lee variables de sesión
   - Inserta registro en `auditoria_eliminacion_citas`
   - Usa `OLD` para obtener valores antes de eliminar
7. **La cita se elimina** de la tabla `citas`
8. **El registro de auditoría queda guardado** permanentemente

### Actualización de una Cita

1. **Usuario actualiza una cita** en el frontend
2. **Server Action** (`updateAppointment`) se ejecuta
3. **Service** (`citasService.updateAppointment`) establece variable de sesión:
   ```typescript
   await client.query("SELECT set_config('app.usuario_actualiza_cita', $1, true)", [idUsuarioActualizo]);
   ```
4. **Service ejecuta UPDATE:**
   ```typescript
   const updateQuery = loadSQL('citas/update.sql');
   await client.query(updateQuery, [num_cita, id_caso, fecha, ...]);
   ```
5. **Trigger se ejecuta automáticamente:**
   - Compara `OLD` vs `NEW`
   - Si hay cambios, inserta registro en `auditoria_actualizacion_citas`
   - Guarda valores anteriores y nuevos
6. **La cita se actualiza** en la tabla `citas`
7. **El registro de auditoría queda guardado** permanentemente

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Obtener Contadores

```typescript
// En un componente React
const counts = await getAuditCountsAction();
console.log(`Soportes eliminados: ${counts.soportes}`);
console.log(`Citas eliminadas: ${counts.citasEliminadas}`);
```

### Ejemplo 2: Filtrar Soportes Eliminados

```typescript
const filters: AuditFilters = {
  fechaInicio: '2026-01-01',
  fechaFin: '2026-01-31',
  idUsuario: '12345678',
  busqueda: 'contrato',
  orden: 'desc'
};

const soportes = await getSoportesAuditAction(filters);
```

### Ejemplo 3: Ver Historial de Cambios de una Cita

```typescript
// Obtener todas las actualizaciones de una cita específica
const actualizaciones = await auditoriaActualizacionCitasQueries.getByCita(
  num_cita, 
  id_caso
);

actualizaciones.forEach(act => {
  console.log(`Cambio realizado por: ${act.nombre_completo_usuario_actualizo}`);
  console.log(`Fecha anterior: ${act.fecha_encuentro_anterior}`);
  console.log(`Fecha nueva: ${act.fecha_encuentro_nueva}`);
});
```

### Ejemplo 4: Registrar Auditoría Manualmente (Usuarios)

```typescript
// En lib/db/queries/usuarios.queries.ts
// La auditoría de usuarios se registra manualmente en update_all_by_cedula

await auditoriaActualizacionUsuariosQueries.create({
  ci_usuario: cedula,
  nombres_anterior: oldValues.nombres,
  nombres_nuevo: newValues.nombres,
  // ... otros campos
  id_usuario_actualizo: usuarioActualizo
});
```

---

## 🚨 Notas Importantes

### Zona Horaria

Todas las fechas de auditoría usan la zona horaria de Venezuela (`America/Caracas`):

```sql
DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
```

### Seguridad

- Solo **coordinadores** pueden acceder a los registros de auditoría
- Las variables de sesión se limpian automáticamente al finalizar la transacción
- Si no se puede leer una variable de sesión, el trigger no bloquea la operación (usa NULL)

### Rendimiento

- Los índices están optimizados para búsquedas por caso, usuario y fecha
- Las queries usan `LEFT JOIN` para obtener información de usuarios sin bloquear si el usuario fue eliminado
- No se guardan archivos completos en auditoría de soportes, solo metadatos

### Mantenimiento

- Los registros de auditoría **NO se eliminan automáticamente**
- Considera implementar un proceso de limpieza periódica si es necesario
- Los registros son históricos y deben mantenerse para cumplimiento y trazabilidad

---

## 📚 Archivos Relacionados

### Migraciones
- `database/migrations/add-auditoria-soportes.sql`
- `database/migrations/add-auditoria-citas.sql`
- `database/migrations/add-auditoria-actualizacion-citas.sql`
- `database/migrations/add-auditoria-actualizacion-usuarios.sql`
- `database/migrations/add-trigger-auditoria-soportes.sql`
- `database/migrations/add-trigger-auditoria-citas.sql`
- `database/migrations/add-trigger-auditoria-actualizacion-citas.sql`
- `database/migrations/fix-timezone-auditoria.sql`

### Queries
- `database/queries/auditoria-*/**/*.sql`

### Código TypeScript
- `lib/db/queries/auditoria-*.queries.ts`
- `app/actions/audit.ts`
- `types/audit.ts`
- `components/audit/**/*.tsx`

### Servicios
- `lib/services/citas.service.ts` (usa variables de sesión)
- `lib/services/soportes.service.ts` (usa variables de sesión)
- `lib/db/queries/usuarios.queries.ts` (auditoría manual)

---

## ✅ Checklist de Implementación

Si necesitas agregar auditoría a una nueva entidad:

- [ ] Crear tabla de auditoría en `database/schemas/schema.sql`
- [ ] Crear migración en `database/migrations/add-auditoria-[entidad].sql`
- [ ] Crear trigger (si aplica) en `database/migrations/add-trigger-auditoria-[entidad].sql`
- [ ] Crear queries en `database/queries/auditoria-[tipo]-[entidad]/`
- [ ] Crear query helper en `lib/db/queries/auditoria-[tipo]-[entidad].queries.ts`
- [ ] Agregar tipos en `types/audit.ts`
- [ ] Agregar Server Action en `app/actions/audit.ts`
- [ ] Crear página de detalle en `app/dashboard/audit/[entidad]/page.tsx`
- [ ] Agregar card en `components/audit/AuditClient.tsx`
- [ ] Actualizar contadores en `getAuditCountsAction()`
- [ ] Establecer variables de sesión antes de operaciones (si usa triggers)

---

**Última actualización:** 2026-01-03
