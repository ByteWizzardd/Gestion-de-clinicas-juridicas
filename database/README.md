# Base de Datos - Gestión de Clínicas Jurídicas

Esta carpeta contiene todos los archivos relacionados con la base de datos del proyecto.

## Estructura de Carpetas

```
database/
├── schemas/          # Esquemas de base de datos (DDL)
│   └── schema.sql    # Esquema principal con todas las tablas
├── migrations/       # Migraciones de base de datos
│   └── (archivos de migración versionados)
├── seeds/           # Datos iniciales y semillas
│   └── (scripts para poblar la base de datos)
└── scripts/         # Scripts utilitarios SQL
    └── (consultas, procedimientos almacenados, etc.)
```

## Descripción de Carpetas

### `schemas/`
Contiene los esquemas de base de datos (DDL - Data Definition Language). Aquí se definen todas las tablas, vistas, índices, constraints, etc.

- **schema.sql**: Esquema completo de la base de datos con todas las tablas del sistema.

### `migrations/`
Contiene las migraciones de base de datos versionadas. Cada migración representa un cambio incremental en el esquema.

**Convención de nombres**: `YYYYMMDD_HHMMSS_descripcion.sql`

Ejemplo: `20250112_120000_add_index_to_clientes.sql`

### `seeds/`
Contiene scripts para poblar la base de datos con datos iniciales necesarios para el funcionamiento del sistema.

Ejemplos:
- Estados y municipios de Venezuela
- Niveles educativos
- Tipos de trámites legales
- Datos de prueba para desarrollo

### `scripts/`
Contiene scripts SQL utilitarios como:
- Consultas complejas frecuentes
- Procedimientos almacenados
- Funciones
- Triggers
- Scripts de mantenimiento

## Uso

### Aplicar el esquema inicial
```bash
psql -U usuario -d nombre_base_datos -f database/schemas/schema.sql
```

### Ejecutar una migración
```bash
psql -U usuario -d nombre_base_datos -f database/migrations/YYYYMMDD_HHMMSS_descripcion.sql
```

### Poblar datos iniciales
```bash
psql -U usuario -d nombre_base_datos -f database/seeds/datos_iniciales.sql
```

## Notas

- Todas las migraciones deben ser idempotentes (pueden ejecutarse múltiples veces sin error)
- Los scripts de seeds deben poder ejecutarse en cualquier momento
- Mantener un registro de cambios en este README o en un archivo CHANGELOG.md

