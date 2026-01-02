-- Add habilitado column to all catalog tables that don't have it yet
-- Note: caracteristicas already has habilitado column

-- Materias
ALTER TABLE materias ADD COLUMN IF NOT EXISTS habilitado BOOLEAN NOT NULL DEFAULT TRUE;

-- Estados
ALTER TABLE estados ADD COLUMN IF NOT EXISTS habilitado BOOLEAN NOT NULL DEFAULT TRUE;

-- Municipios
ALTER TABLE municipios ADD COLUMN IF NOT EXISTS habilitado BOOLEAN NOT NULL DEFAULT TRUE;

-- Parroquias
ALTER TABLE parroquias ADD COLUMN IF NOT EXISTS habilitado BOOLEAN NOT NULL DEFAULT TRUE;

-- Nucleos
ALTER TABLE nucleos ADD COLUMN IF NOT EXISTS habilitado BOOLEAN NOT NULL DEFAULT TRUE;

-- Semestres
ALTER TABLE semestres ADD COLUMN IF NOT EXISTS habilitado BOOLEAN NOT NULL DEFAULT TRUE;

-- Categorias
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS habilitado BOOLEAN NOT NULL DEFAULT TRUE;

-- Subcategorias
ALTER TABLE subcategorias ADD COLUMN IF NOT EXISTS habilitado BOOLEAN NOT NULL DEFAULT TRUE;

-- Ambitos Legales
ALTER TABLE ambitos_legales ADD COLUMN IF NOT EXISTS habilitado BOOLEAN NOT NULL DEFAULT TRUE;

-- Condicion Trabajo
ALTER TABLE condicion_trabajo ADD COLUMN IF NOT EXISTS habilitado BOOLEAN NOT NULL DEFAULT TRUE;

-- Condicion Actividad
ALTER TABLE condicion_actividad ADD COLUMN IF NOT EXISTS habilitado BOOLEAN NOT NULL DEFAULT TRUE;

-- Tipos Caracteristicas
ALTER TABLE tipo_caracteristicas ADD COLUMN IF NOT EXISTS habilitado BOOLEAN NOT NULL DEFAULT TRUE;

-- Verify all columns were added
DO $$
DECLARE
    missing_columns TEXT[];
BEGIN
    -- Check for missing habilitado columns
    SELECT array_agg(table_name)
    INTO missing_columns
    FROM information_schema.tables t
    WHERE t.table_schema = 'public'
    AND t.table_name IN (
        'materias', 'estados', 'municipios', 'parroquias', 'nucleos', 
        'semestres', 'categorias', 'subcategorias', 'ambitos_legales',
        'condicion_trabajo', 'condicion_actividad', 'tipo_caracteristicas'
    )
    AND NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns c
        WHERE c.table_schema = 'public'
        AND c.table_name = t.table_name
        AND c.column_name = 'habilitado'
    );

    IF array_length(missing_columns, 1) > 0 THEN
        RAISE EXCEPTION 'Failed to add habilitado column to tables: %', array_to_string(missing_columns, ', ');
    ELSE
        RAISE NOTICE 'Successfully added habilitado column to all catalog tables';
    END IF;
END $$;
