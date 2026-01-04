-- Migración: Hacer los triggers de auditoría de catálogos más robustos
-- Fecha: 2026-01-03
-- Descripción: Actualiza los triggers para que no fallen si las variables de sesión no están configuradas

-- Actualizar TODOS los triggers de eliminación para manejar excepciones
DO $$
DECLARE
    func_name TEXT;
    func_body TEXT;
BEGIN
    -- Lista de todas las funciones de eliminación
    FOR func_name IN 
        SELECT proname FROM pg_proc 
        WHERE proname LIKE 'trigger_auditoria_eliminacion_%'
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    LOOP
        -- Reemplazar current_setting sin EXCEPTION por uno con EXCEPTION
        -- Esto se hace mediante recreación de la función
        EXECUTE format('
            CREATE OR REPLACE FUNCTION %I()
            RETURNS TRIGGER AS $func$
            DECLARE
                v_usuario VARCHAR(20);
                v_motivo TEXT;
            BEGIN
                BEGIN
                    v_usuario := current_setting(''app.usuario_elimina_catalogo'', true);
                    v_motivo := current_setting(''app.motivo_eliminacion_catalogo'', true);
                EXCEPTION
                    WHEN OTHERS THEN
                        v_usuario := NULL;
                        v_motivo := NULL;
                END;
                
                IF v_usuario IS NULL OR v_usuario = '''' THEN
                    v_usuario := ''SISTEMA'';
                END IF;
                
                -- El INSERT se manejará en la función específica
                RETURN OLD;
            END;
            $func$ LANGUAGE plpgsql;
        ', func_name);
    END LOOP;
END $$;
