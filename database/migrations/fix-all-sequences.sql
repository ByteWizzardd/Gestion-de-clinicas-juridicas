-- Dynamic SQL block to fix all sequences in the public schema
DO $$
DECLARE
    rec RECORD;
    current_max INTEGER;
    seq_name TEXT;
BEGIN
    -- 1. Loop through columns that look like serials (have nextval default) or are identity columns
    FOR rec IN 
        SELECT 
            table_schema, 
            table_name, 
            column_name
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND (
            column_default LIKE 'nextval%' 
            OR is_identity = 'YES'
        )
    LOOP
        -- Get the sequence name associated with the column
        seq_name := pg_get_serial_sequence(format('%I.%I', rec.table_schema, rec.table_name), rec.column_name);
        
        -- If a sequence exists for this column
        IF seq_name IS NOT NULL THEN
            -- Find the current maximum value in the column
            EXECUTE format('SELECT COALESCE(MAX(%I), 0) FROM %I.%I', rec.column_name, rec.table_schema, rec.table_name) INTO current_max;
            
            -- Reset the sequence. 
            -- If current_max is 0 (empty table), set to 1 and 'false' (so next is 1).
            -- If current_max > 0, set to current_max and 'true' (so next is current_max + 1), OR set to current_max + 1 and 'false'.
            -- Using setval(seq, val) sets the *current* value. The next will be val+1.
            -- So if we setval(seq, current_max), next is current_max + 1. 
            -- But if current_max is 0, we can't setval(0) for a 1-based sequence usually? 
            -- Actually, setval(seq, 1, false) means "next value is 1".
            
            IF current_max > 0 THEN
                PERFORM setval(seq_name, current_max);
                RAISE NOTICE 'Sequence % for table % column % reset to % (next will be %)', seq_name, rec.table_name, rec.column_name, current_max, current_max + 1;
            ELSE
                PERFORM setval(seq_name, 1, false);
                RAISE NOTICE 'Sequence % for table % column % reset to 1 (next will be 1)', seq_name, rec.table_name, rec.column_name;
            END IF;
        END IF;
    END LOOP;
END $$;
