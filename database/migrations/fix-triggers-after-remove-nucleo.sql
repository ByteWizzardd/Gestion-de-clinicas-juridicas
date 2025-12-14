-- Migración: Actualizar triggers después de remover id_nucleo de clientes
-- Fecha: 2025-12-13
-- Descripción: Actualiza los triggers que validan solicitantes para remover la referencia a id_nucleo
--              ya que el núcleo ahora se obtiene desde los casos, no desde el cliente

-- Paso 1: Actualizar función validate_solicitante_completo
-- Remueve la validación de id_nucleo ya que no existe en clientes
CREATE OR REPLACE FUNCTION validate_solicitante_completo()
RETURNS TRIGGER AS $$
BEGIN
    -- Si el cliente tiene al menos un caso, debe tener todos los campos relacionados
    -- (todos los casos tienen fecha_solicitud obligatoria, por lo que el cliente debe ser un solicitante completo)
    -- NOTA: id_nucleo ya no existe en clientes, se obtiene desde casos
    IF EXISTS (
        SELECT 1 FROM casos 
        WHERE cedula_cliente = NEW.cedula
    ) THEN
        IF NEW.id_hogar IS NULL OR
           NEW.id_nivel_educativo IS NULL OR
           NEW.id_trabajo IS NULL OR
           NEW.id_vivienda IS NULL OR
           NEW.id_parroquia IS NULL THEN
            RAISE EXCEPTION 'El cliente es solicitante (tiene casos) y debe tener todos los campos relacionados completos: id_hogar, id_nivel_educativo, id_trabajo, id_vivienda, id_parroquia';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Paso 2: Actualizar función validate_cliente_solicitante_on_caso
-- Remueve la validación de id_nucleo y valida que el caso tenga id_nucleo en su lugar
CREATE OR REPLACE FUNCTION validate_cliente_solicitante_on_caso()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar que el cliente tenga todos los campos relacionados completos
    -- (todos los casos tienen fecha_solicitud, por lo que el cliente debe ser un solicitante completo)
    -- NOTA: id_nucleo ahora se valida en el caso, no en el cliente
    IF NOT EXISTS (
        SELECT 1 FROM clientes
        WHERE cedula = NEW.cedula_cliente
        AND id_hogar IS NOT NULL
        AND id_nivel_educativo IS NOT NULL
        AND id_trabajo IS NOT NULL
        AND id_vivienda IS NOT NULL
        AND id_parroquia IS NOT NULL
    ) THEN
        RAISE EXCEPTION 'No se puede crear un caso para un cliente que no tiene todos los campos relacionados completos (id_hogar, id_nivel_educativo, id_trabajo, id_vivienda, id_parroquia)';
    END IF;
    
    -- Validar que el caso tenga id_nucleo (ahora es obligatorio en casos)
    IF NEW.id_nucleo IS NULL THEN
        RAISE EXCEPTION 'El caso debe tener un id_nucleo asignado';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

