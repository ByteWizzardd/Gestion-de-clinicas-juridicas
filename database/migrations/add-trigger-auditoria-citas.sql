-- Migración: Agregar trigger de auditoría para eliminación de citas
-- Fecha: 2026-01-02
-- Descripción: Crea un trigger BEFORE DELETE que registra la auditoría usando OLD

-- Función trigger para registrar auditoría antes de eliminar una cita
-- Usa OLD para capturar los datos antes de la eliminación y guardarlos en tabla de auditoría
-- Solo guarda metadatos de la cita, no información adicional del caso
CREATE OR REPLACE FUNCTION trigger_auditoria_eliminacion_cita()
RETURNS TRIGGER AS $$
DECLARE
    cedula_usuario VARCHAR(20);
    motivo_eliminacion TEXT;
BEGIN
    -- Obtener la cédula del usuario desde la variable de sesión
    -- Esta variable se establece antes de eliminar la cita
    BEGIN
        cedula_usuario := current_setting('app.usuario_elimina_cita', true);
        motivo_eliminacion := current_setting('app.motivo_eliminacion_cita', true);
    EXCEPTION
        WHEN OTHERS THEN
            -- Si no se puede leer la variable, usar NULL (no bloquear la eliminación)
            cedula_usuario := NULL;
            motivo_eliminacion := NULL;
    END;
    
    -- Registrar la auditoría en la tabla de auditoría antes de eliminar
    -- Usamos OLD para acceder a los valores antes de la eliminación
    -- Solo guardamos metadatos de la cita eliminada
    IF cedula_usuario IS NOT NULL AND cedula_usuario != '' THEN
        INSERT INTO auditoria_eliminacion_citas (
            num_cita,
            id_caso,
            fecha_encuentro,
            fecha_proxima_cita,
            orientacion,
            id_usuario_registro,
            id_usuario_elimino,
            motivo
        ) VALUES (
            OLD.num_cita,
            OLD.id_caso,
            OLD.fecha_encuentro,
            OLD.fecha_proxima_cita,
            OLD.orientacion,
            OLD.id_usuario_registro,
            cedula_usuario,
            motivo_eliminacion
        );
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger para registrar auditoría antes de eliminar una cita
DROP TRIGGER IF EXISTS trigger_auditoria_eliminacion_cita ON citas;
CREATE TRIGGER trigger_auditoria_eliminacion_cita
    BEFORE DELETE ON citas
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_eliminacion_cita();
