-- Migración: Crear tabla asignadas_a
-- Descripción: Crea la tabla de relación entre viviendas y características
-- Esta tabla permite asignar múltiples características a cada vivienda

-- La tabla ya existe, no hacer nada
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'asignadas_a'
    ) THEN
        -- 31) ASIGNADAS_A (Relación entre Viviendas y Características)
        CREATE TABLE asignadas_a (
            cedula_solicitante VARCHAR(20) NOT NULL,
            id_tipo_caracteristica INTEGER NOT NULL,
            num_caracteristica INTEGER NOT NULL,
            
            PRIMARY KEY (cedula_solicitante, id_tipo_caracteristica, num_caracteristica),
            FOREIGN KEY (cedula_solicitante) REFERENCES viviendas(cedula_solicitante),
            FOREIGN KEY (id_tipo_caracteristica, num_caracteristica) 
                REFERENCES caracteristicas(id_tipo_caracteristica, num_caracteristica)
        );
        
        RAISE NOTICE 'Tabla asignadas_a creada exitosamente';
    ELSE
        RAISE NOTICE 'La tabla asignadas_a ya existe';
    END IF;
END $$;

