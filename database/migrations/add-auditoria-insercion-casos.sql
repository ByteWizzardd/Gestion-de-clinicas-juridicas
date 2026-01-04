-- Migración: Agregar tabla de auditoría para inserciones de casos
-- Fecha: 2026-01-03
-- Descripción: Crea una tabla para registrar todas las inserciones de casos con información de auditoría

-- Crear tabla de auditoría para inserciones de casos
CREATE TABLE IF NOT EXISTS auditoria_insercion_casos (
    id SERIAL PRIMARY KEY,
    id_caso INTEGER,
    fecha_solicitud DATE,
    fecha_inicio_caso DATE,
    fecha_fin_caso DATE,
    tramite VARCHAR(200),
    observaciones TEXT,
    id_nucleo INTEGER,
    cedula_solicitante VARCHAR(20),
    id_materia INTEGER,
    num_categoria INTEGER,
    num_subcategoria INTEGER,
    num_ambito_legal INTEGER,
    id_usuario_creo VARCHAR(20) REFERENCES usuarios(cedula) ON DELETE SET NULL,
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Crear índices para búsquedas
CREATE INDEX IF NOT EXISTS idx_auditoria_insercion_casos_id_caso ON auditoria_insercion_casos(id_caso);
CREATE INDEX IF NOT EXISTS idx_auditoria_insercion_casos_cedula ON auditoria_insercion_casos(cedula_solicitante);
CREATE INDEX IF NOT EXISTS idx_auditoria_insercion_casos_usuario_creo ON auditoria_insercion_casos(id_usuario_creo);
CREATE INDEX IF NOT EXISTS idx_auditoria_insercion_casos_fecha ON auditoria_insercion_casos(fecha_creacion);

-- Función trigger para capturar inserciones de casos
CREATE OR REPLACE FUNCTION trigger_auditoria_insercion_caso()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    -- Obtener el usuario que crea el registro
    BEGIN
        v_usuario := current_setting('app.usuario_registra', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;

    -- Insertar en la tabla de auditoría de inserciones
    INSERT INTO auditoria_insercion_casos (
        id_caso,
        fecha_solicitud,
        fecha_inicio_caso,
        fecha_fin_caso,
        tramite,
        observaciones,
        id_nucleo,
        cedula_solicitante,
        id_materia,
        num_categoria,
        num_subcategoria,
        num_ambito_legal,
        id_usuario_creo
    ) VALUES (
        NEW.id_caso,
        NEW.fecha_solicitud,
        NEW.fecha_inicio_caso,
        NEW.fecha_fin_caso,
        NEW.tramite,
        NEW.observaciones,
        NEW.id_nucleo,
        NEW.cedula,
        NEW.id_materia,
        NEW.num_categoria,
        NEW.num_subcategoria,
        NEW.num_ambito_legal,
        v_usuario
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger
DROP TRIGGER IF EXISTS trigger_auditoria_insercion_caso ON casos;
CREATE TRIGGER trigger_auditoria_insercion_caso
    AFTER INSERT ON casos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_insercion_caso();
