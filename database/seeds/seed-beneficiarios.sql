-- ==========================================================
-- SEED DE BENEFICIARIOS CON DIFERENTES TIPOS Y PARENTESCOS
-- ==========================================================
-- Este script inserta beneficiarios de varios tipos (Directo/Indirecto)
-- y diferentes parentescos para pruebas

BEGIN;

-- ==========================================================
-- 1. BENEFICIARIOS DIRECTOS (varios parentescos)
-- ==========================================================

-- Beneficiarios Directos para el primer caso
DO $$
DECLARE
    caso_id INTEGER;
    max_benef INTEGER := 0;
BEGIN
    -- Obtener el primer caso disponible
    SELECT id_caso INTO caso_id 
    FROM casos 
    ORDER BY id_caso 
    LIMIT 1;
    
    -- Obtener el máximo num_beneficiario para este caso
    SELECT COALESCE(MAX(num_beneficiario), 0) INTO max_benef
    FROM beneficiarios
    WHERE id_caso = caso_id;
    
    -- Insertar beneficiarios directos
    INSERT INTO beneficiarios (num_beneficiario, id_caso, cedula, nombres, apellidos, fecha_nac, sexo, tipo_beneficiario, parentesco)
    VALUES
        (max_benef + 1, caso_id, NULL, 'María', 'González', '2005-03-15'::DATE, 'F', 'Directo', 'Hija'),
        (max_benef + 2, caso_id, NULL, 'José', 'Rodríguez', '2008-07-22'::DATE, 'M', 'Directo', 'Hijo'),
        (max_benef + 3, caso_id, NULL, 'Ana', 'Pérez', '2010-11-30'::DATE, 'F', 'Directo', 'Hija'),
        (max_benef + 4, caso_id, 'V-12345678', 'Carlos', 'Martínez', '2012-05-10'::DATE, 'M', 'Directo', 'Hijo'),
        (max_benef + 5, caso_id, NULL, 'Laura', 'López', '2015-09-18'::DATE, 'F', 'Directo', 'Hija');
END $$;

-- Beneficiarios Directos para el segundo caso
DO $$
DECLARE
    caso_id INTEGER;
    max_benef INTEGER := 0;
BEGIN
    SELECT id_caso INTO caso_id 
    FROM casos 
    ORDER BY id_caso 
    OFFSET 1 LIMIT 1;
    
    SELECT COALESCE(MAX(num_beneficiario), 0) INTO max_benef
    FROM beneficiarios
    WHERE id_caso = caso_id;
    
    INSERT INTO beneficiarios (num_beneficiario, id_caso, cedula, nombres, apellidos, fecha_nac, sexo, tipo_beneficiario, parentesco)
    VALUES
        (max_benef + 1, caso_id, 'V-23456789', 'Pedro', 'Hernández', '1998-12-05'::DATE, 'M', 'Directo', 'Esposo'),
        (max_benef + 2, caso_id, NULL, 'Carmen', 'Torres', '2000-08-14'::DATE, 'F', 'Directo', 'Hija'),
        (max_benef + 3, caso_id, NULL, 'Luis', 'Morales', '2003-04-20'::DATE, 'M', 'Directo', 'Hijo');
END $$;

-- ==========================================================
-- 2. BENEFICIARIOS INDIRECTOS (varios parentescos)
-- ==========================================================

-- Beneficiarios Indirectos para el tercer caso
DO $$
DECLARE
    caso_id INTEGER;
    max_benef INTEGER := 0;
BEGIN
    SELECT id_caso INTO caso_id 
    FROM casos 
    ORDER BY id_caso 
    OFFSET 2 LIMIT 1;
    
    SELECT COALESCE(MAX(num_beneficiario), 0) INTO max_benef
    FROM beneficiarios
    WHERE id_caso = caso_id;
    
    INSERT INTO beneficiarios (num_beneficiario, id_caso, cedula, nombres, apellidos, fecha_nac, sexo, tipo_beneficiario, parentesco)
    VALUES
        (max_benef + 1, caso_id, NULL, 'Roberto', 'Vargas', '1985-06-10'::DATE, 'M', 'Indirecto', 'Padre'),
        (max_benef + 2, caso_id, NULL, 'Isabel', 'Jiménez', '1987-02-25'::DATE, 'F', 'Indirecto', 'Madre'),
        (max_benef + 3, caso_id, 'V-34567890', 'Fernando', 'Castro', '1990-10-12'::DATE, 'M', 'Indirecto', 'Hermano'),
        (max_benef + 4, caso_id, NULL, 'Patricia', 'Ruiz', '1992-12-08'::DATE, 'F', 'Indirecto', 'Hermana');
END $$;

-- Beneficiarios Indirectos para el cuarto caso
DO $$
DECLARE
    caso_id INTEGER;
    max_benef INTEGER := 0;
BEGIN
    SELECT id_caso INTO caso_id 
    FROM casos 
    ORDER BY id_caso 
    OFFSET 3 LIMIT 1;
    
    SELECT COALESCE(MAX(num_beneficiario), 0) INTO max_benef
    FROM beneficiarios
    WHERE id_caso = caso_id;
    
    INSERT INTO beneficiarios (num_beneficiario, id_caso, cedula, nombres, apellidos, fecha_nac, sexo, tipo_beneficiario, parentesco)
    VALUES
        (max_benef + 1, caso_id, 'V-45678901', 'Miguel', 'Ramírez', '1975-03-20'::DATE, 'M', 'Indirecto', 'Abuelo'),
        (max_benef + 2, caso_id, NULL, 'Sofía', 'Díaz', '1978-09-15'::DATE, 'F', 'Indirecto', 'Abuela'),
        (max_benef + 3, caso_id, NULL, 'Diego', 'Moreno', '1980-11-30'::DATE, 'M', 'Indirecto', 'Tío'),
        (max_benef + 4, caso_id, NULL, 'Valentina', 'García', '1982-07-05'::DATE, 'F', 'Indirecto', 'Tía'),
        (max_benef + 5, caso_id, 'V-56789012', 'Andrés', 'Sánchez', '1984-01-18'::DATE, 'M', 'Indirecto', 'Primo');
END $$;

-- Beneficiarios Indirectos para el quinto caso
DO $$
DECLARE
    caso_id INTEGER;
    max_benef INTEGER := 0;
BEGIN
    SELECT id_caso INTO caso_id 
    FROM casos 
    ORDER BY id_caso 
    OFFSET 4 LIMIT 1;
    
    SELECT COALESCE(MAX(num_beneficiario), 0) INTO max_benef
    FROM beneficiarios
    WHERE id_caso = caso_id;
    
    INSERT INTO beneficiarios (num_beneficiario, id_caso, cedula, nombres, apellidos, fecha_nac, sexo, tipo_beneficiario, parentesco)
    VALUES
        (max_benef + 1, caso_id, NULL, 'Gabriel', 'Mendoza', '2001-05-22'::DATE, 'M', 'Indirecto', 'Sobrino'),
        (max_benef + 2, caso_id, NULL, 'Natalia', 'Ortega', '2004-08-11'::DATE, 'F', 'Indirecto', 'Sobrina'),
        (max_benef + 3, caso_id, 'V-67890123', 'Ricardo', 'Silva', '2006-12-03'::DATE, 'M', 'Indirecto', 'Primo'),
        (max_benef + 4, caso_id, NULL, 'Daniela', 'Rojas', '2009-03-17'::DATE, 'F', 'Indirecto', 'Prima');
END $$;

-- ==========================================================
-- 3. MEZCLA DE BENEFICIARIOS DIRECTOS E INDIRECTOS
-- ==========================================================

-- Caso 6: Mezcla de Directos e Indirectos
DO $$
DECLARE
    caso_id INTEGER;
    max_benef INTEGER := 0;
BEGIN
    SELECT id_caso INTO caso_id 
    FROM casos 
    ORDER BY id_caso 
    OFFSET 5 LIMIT 1;
    
    SELECT COALESCE(MAX(num_beneficiario), 0) INTO max_benef
    FROM beneficiarios
    WHERE id_caso = caso_id;
    
    INSERT INTO beneficiarios (num_beneficiario, id_caso, cedula, nombres, apellidos, fecha_nac, sexo, tipo_beneficiario, parentesco)
    VALUES
        (max_benef + 1, caso_id, 'V-78901234', 'Alejandro', 'Vega', '2011-06-15'::DATE, 'M', 'Directo', 'Hijo'),
        (max_benef + 2, caso_id, NULL, 'Mariana', 'Campos', '2013-09-22'::DATE, 'F', 'Directo', 'Hija'),
        (max_benef + 3, caso_id, NULL, 'Sebastián', 'Ramos', '2016-02-10'::DATE, 'M', 'Indirecto', 'Nieto'),
        (max_benef + 4, caso_id, NULL, 'Camila', 'Medina', '2018-11-05'::DATE, 'F', 'Indirecto', 'Nieta'),
        (max_benef + 5, caso_id, 'V-89012345', 'Javier', 'Guerrero', '2020-04-18'::DATE, 'M', 'Indirecto', 'Padre');
END $$;

-- Caso 7: Más beneficiarios con diferentes parentescos
DO $$
DECLARE
    caso_id INTEGER;
    max_benef INTEGER := 0;
BEGIN
    SELECT id_caso INTO caso_id 
    FROM casos 
    ORDER BY id_caso 
    OFFSET 6 LIMIT 1;
    
    SELECT COALESCE(MAX(num_beneficiario), 0) INTO max_benef
    FROM beneficiarios
    WHERE id_caso = caso_id;
    
    INSERT INTO beneficiarios (num_beneficiario, id_caso, cedula, nombres, apellidos, fecha_nac, sexo, tipo_beneficiario, parentesco)
    VALUES
        (max_benef + 1, caso_id, NULL, 'Elena', 'Blanco', '1995-07-25'::DATE, 'F', 'Directo', 'Esposa'),
        (max_benef + 2, caso_id, 'V-90123456', 'Manuel', 'Navarro', '1997-01-12'::DATE, 'M', 'Directo', 'Hijo'),
        (max_benef + 3, caso_id, NULL, 'Lucía', 'Molina', '1999-10-08'::DATE, 'F', 'Indirecto', 'Cuñada'),
        (max_benef + 4, caso_id, NULL, 'Rodrigo', 'Delgado', '2002-04-30'::DATE, 'M', 'Indirecto', 'Yerno');
END $$;

-- Caso 8: Más variedad de parentescos
DO $$
DECLARE
    caso_id INTEGER;
    max_benef INTEGER := 0;
BEGIN
    SELECT id_caso INTO caso_id 
    FROM casos 
    ORDER BY id_caso 
    OFFSET 7 LIMIT 1;
    
    SELECT COALESCE(MAX(num_beneficiario), 0) INTO max_benef
    FROM beneficiarios
    WHERE id_caso = caso_id;
    
    INSERT INTO beneficiarios (num_beneficiario, id_caso, cedula, nombres, apellidos, fecha_nac, sexo, tipo_beneficiario, parentesco)
    VALUES
        (max_benef + 1, caso_id, NULL, 'Adriana', 'Cruz', '1988-03-14'::DATE, 'F', 'Indirecto', 'Cuñada'),
        (max_benef + 2, caso_id, 'V-01234567', 'Felipe', 'Méndez', '1991-06-28'::DATE, 'M', 'Indirecto', 'Cuñado'),
        (max_benef + 3, caso_id, NULL, 'Verónica', 'Acosta', '1993-09-11'::DATE, 'F', 'Indirecto', 'Nuera'),
        (max_benef + 4, caso_id, NULL, 'Óscar', 'Villalobos', '1996-12-24'::DATE, 'M', 'Indirecto', 'Yerno');
END $$;

COMMIT;

-- ==========================================================
-- RESUMEN
-- ==========================================================
-- Este seed inserta beneficiarios con:
-- - Tipos: Directo e Indirecto
-- - Parentescos: Hijo, Hija, Esposo, Esposa, Padre, Madre, 
--   Hermano, Hermana, Abuelo, Abuela, Tío, Tía, Primo, Prima,
--   Sobrino, Sobrina, Nieto, Nieta, Cuñado, Cuñada, Yerno, Nuera
-- - Algunos con cédula, otros sin cédula
-- - Diferentes edades y géneros
-- - Distribuidos en 8 casos diferentes
