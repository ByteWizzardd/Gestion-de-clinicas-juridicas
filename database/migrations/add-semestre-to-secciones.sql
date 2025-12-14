-- Migración: Agregar relación con semestres a la tabla secciones
-- Fecha: 2025-01-XX
-- Descripción: Agrega term_semestre como clave foránea a semestres y la incluye en la clave primaria

-- Paso 1: Agregar columna term_semestre a estudiantes (necesario antes de actualizar secciones)
-- Si no existe, agregarla temporalmente para poder actualizar las foreign keys
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'estudiantes' AND column_name = 'term_semestre'
    ) THEN
        ALTER TABLE estudiantes ADD COLUMN term_semestre VARCHAR(20);
    END IF;
END $$;

-- Paso 2: Si hay datos existentes, asignar un semestre por defecto
-- NOTA: Ajusta el valor por defecto según tus necesidades
UPDATE estudiantes 
SET term_semestre = (SELECT term FROM semestres LIMIT 1)
WHERE term_semestre IS NULL;

-- Paso 3: Hacer term_semestre NOT NULL en estudiantes
ALTER TABLE estudiantes 
ALTER COLUMN term_semestre SET NOT NULL;

-- Paso 4: Eliminar la foreign key existente en estudiantes
DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'estudiantes'::regclass
      AND contype = 'f'
      AND pg_get_constraintdef(oid) LIKE '%secciones%';
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE estudiantes DROP CONSTRAINT %I', constraint_name);
    END IF;
END $$;

-- Paso 5: Agregar columna term_semestre a secciones
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'secciones' AND column_name = 'term_semestre'
    ) THEN
        ALTER TABLE secciones ADD COLUMN term_semestre VARCHAR(20);
    END IF;
END $$;

-- Paso 6: Si hay datos existentes en secciones, asignar un semestre por defecto
-- NOTA: Ajusta el valor por defecto según tus necesidades
UPDATE secciones 
SET term_semestre = (SELECT term FROM semestres LIMIT 1)
WHERE term_semestre IS NULL;

-- Paso 7: Hacer term_semestre NOT NULL en secciones
ALTER TABLE secciones 
ALTER COLUMN term_semestre SET NOT NULL;

-- Paso 8: Agregar foreign key a semestres
ALTER TABLE secciones 
ADD CONSTRAINT secciones_term_semestre_fkey 
FOREIGN KEY (term_semestre) REFERENCES semestres(term);

-- Paso 9: Eliminar la primary key existente
ALTER TABLE secciones 
DROP CONSTRAINT IF EXISTS secciones_pkey;

-- Paso 10: Crear nueva primary key que incluye term_semestre
ALTER TABLE secciones 
ADD CONSTRAINT secciones_pkey 
PRIMARY KEY (num_seccion, nrc_materia, term_semestre);

-- Paso 11: Agregar nueva foreign key en estudiantes que incluye term_semestre
ALTER TABLE estudiantes 
ADD CONSTRAINT estudiantes_secciones_fkey 
FOREIGN KEY (num_seccion, nrc_materia, term_semestre) 
REFERENCES secciones(num_seccion, nrc_materia, term_semestre);

