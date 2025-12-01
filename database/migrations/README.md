# Migraciones de Base de Datos

Las migraciones son cambios incrementales al esquema de la base de datos.

## Formato de Nombres

```
YYYYMMDD_HHMMSS_descripcion_corta.sql
```

Ejemplos:
- `20250112_120000_add_index_to_clientes.sql`
- `20250112_130000_add_column_telefono_to_usuarios.sql`
- `20250112_140000_create_table_auditoria.sql`

## Estructura de una Migración

Cada migración debe ser **idempotente** (puede ejecutarse múltiples veces sin error):

```sql
-- Migración: YYYYMMDD_HHMMSS_descripcion
-- Descripción: Breve descripción del cambio

-- Ejemplo: Agregar índice
CREATE INDEX IF NOT EXISTS idx_clientes_cedula 
ON clientes(cedula);

-- O para agregar una columna:
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' AND column_name = 'nueva_columna'
    ) THEN
        ALTER TABLE clientes ADD COLUMN nueva_columna VARCHAR(100);
    END IF;
END $$;
```

## Orden de Ejecución

Las migraciones deben ejecutarse en orden cronológico según su fecha.

