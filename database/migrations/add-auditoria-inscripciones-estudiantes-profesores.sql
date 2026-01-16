-- Migración: Agregar auditoría para inserción de estudiantes y profesores
-- Descripción: Permite rastrear cuándo un usuario es inscrito como estudiante o profesor en un periodo específico

-- 1. Tabla de auditoría para Inserción de Estudiantes
CREATE TABLE IF NOT EXISTS auditoria_insercion_estudiantes (
    id SERIAL PRIMARY KEY,
    cedula_estudiante VARCHAR(20) NOT NULL REFERENCES usuarios(cedula) ON DELETE CASCADE,
    term VARCHAR(20) NOT NULL, -- El semestre
    tipo_estudiante VARCHAR(50),
    nrc VARCHAR(20),
    id_usuario_creo VARCHAR(20) REFERENCES usuarios(cedula),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

CREATE INDEX IF NOT EXISTS idx_audit_ins_est_cedula ON auditoria_insercion_estudiantes(cedula_estudiante);
CREATE INDEX IF NOT EXISTS idx_audit_ins_est_term ON auditoria_insercion_estudiantes(term);
CREATE INDEX IF NOT EXISTS idx_audit_ins_est_fecha ON auditoria_insercion_estudiantes(fecha_creacion);

-- 2. Trigger para Estudiantes
CREATE OR REPLACE FUNCTION trigger_auditoria_insercion_estudiante()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION WHEN OTHERS THEN
        v_usuario := NULL;
    END;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;

    INSERT INTO auditoria_insercion_estudiantes (
        cedula_estudiante, term, tipo_estudiante, nrc, id_usuario_creo, fecha_creacion
    ) VALUES (
        NEW.cedula_estudiante, NEW.term, NEW.tipo_estudiante, NEW.nrc, v_usuario, (NOW() AT TIME ZONE 'America/Caracas')
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auditoria_insercion_estudiante ON estudiantes;
CREATE TRIGGER trigger_auditoria_insercion_estudiante
    AFTER INSERT ON estudiantes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_insercion_estudiante();


-- 3. Tabla de auditoría para Inserción de Profesores
CREATE TABLE IF NOT EXISTS auditoria_insercion_profesores (
    id SERIAL PRIMARY KEY,
    cedula_profesor VARCHAR(20) NOT NULL REFERENCES usuarios(cedula) ON DELETE CASCADE,
    tipo_profesor VARCHAR(20),
    id_usuario_creo VARCHAR(20) REFERENCES usuarios(cedula),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

CREATE INDEX IF NOT EXISTS idx_audit_ins_prof_cedula ON auditoria_insercion_profesores(cedula_profesor);
CREATE INDEX IF NOT EXISTS idx_audit_ins_prof_fecha ON auditoria_insercion_profesores(fecha_creacion);

-- 4. Trigger para Profesores
CREATE OR REPLACE FUNCTION trigger_auditoria_insercion_profesor()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION WHEN OTHERS THEN
        v_usuario := NULL;
    END;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;

    INSERT INTO auditoria_insercion_profesores (
        cedula_profesor, tipo_profesor, id_usuario_creo, fecha_creacion
    ) VALUES (
        NEW.cedula_profesor, NEW.tipo_profesor, v_usuario, (NOW() AT TIME ZONE 'America/Caracas')
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auditoria_insercion_profesor ON profesores;
CREATE TRIGGER trigger_auditoria_insercion_profesor
    AFTER INSERT ON profesores
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_insercion_profesor();
