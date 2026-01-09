-- Allow NULL in user ID columns for audit tables to support system actions without fake users
DO $$
DECLARE
    audit_table TEXT;
BEGIN
    -- Insercion
    FOR audit_table IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE 'auditoria_insercion_%'
    LOOP
        BEGIN
            EXECUTE format('ALTER TABLE %I ALTER COLUMN id_usuario_creo DROP NOT NULL', audit_table);
        EXCEPTION
            WHEN OTHERS THEN 
                RAISE NOTICE 'Skipping %: %', audit_table, SQLERRM;
        END;
    END LOOP;

    -- Actualizacion
    FOR audit_table IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE 'auditoria_actualizacion_%'
    LOOP
        BEGIN
            EXECUTE format('ALTER TABLE %I ALTER COLUMN id_usuario_actualizo DROP NOT NULL', audit_table);
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Skipping %: %', audit_table, SQLERRM;
        END;
    END LOOP;

    -- Eliminacion
    FOR audit_table IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE 'auditoria_eliminacion_%'
    LOOP
        BEGIN
            EXECUTE format('ALTER TABLE %I ALTER COLUMN id_usuario_elimino DROP NOT NULL', audit_table);
        EXCEPTION
            WHEN OTHERS THEN
                 RAISE NOTICE 'Skipping %: %', audit_table, SQLERRM;
        END;
    END LOOP;
END $$;
