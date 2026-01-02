-- Migración: Agregar trigger de auditoría para eliminación de soportes
-- Fecha: 2026-01-02
-- Descripción: Crea un trigger BEFORE DELETE que registra la auditoría usando OLD

-- Función trigger para registrar auditoría antes de eliminar un soporte
-- Usa OLD para capturar los datos antes de la eliminación y guardarlos en tabla de auditoría
CREATE OR REPLACE FUNCTION trigger_auditoria_eliminacion_soporte()
RETURNS TRIGGER AS $$
DECLARE
    cedula_usuario VARCHAR(20);
BEGIN
    -- Obtener la cédula del usuario desde la variable de sesión
    -- Esta variable se establece antes de eliminar el soporte
    BEGIN
        cedula_usuario := current_setting('app.usuario_elimina_soporte', true);
    EXCEPTION
        WHEN OTHERS THEN
            -- Si no se puede leer la variable, usar NULL (no bloquear la eliminación)
            cedula_usuario := NULL;
    END;
    
    -- Registrar la auditoría en la tabla de auditoría antes de eliminar
    -- Usamos OLD para acceder a los valores antes de la eliminación
    -- Solo guardamos metadatos, no el documento completo para ahorrar espacio
    IF cedula_usuario IS NOT NULL AND cedula_usuario != '' THEN
        INSERT INTO auditoria_eliminacion_soportes (
            num_soporte,
            id_caso,
            nombre_archivo,
            tipo_mime,
            descripcion,
            fecha_consignacion,
            fecha_subida,
            tamano_bytes,
            id_usuario_subio,
            id_usuario_elimino,
            motivo
        ) VALUES (
            OLD.num_soporte,
            OLD.id_caso,
            OLD.nombre_archivo,
            OLD.tipo_mime,
            OLD.descripcion,
            OLD.fecha_consignacion,
            OLD.fecha_subida,
            LENGTH(OLD.documento_data), -- Solo guardamos el tamaño, no el archivo
            OLD.id_usuario_subio,
            cedula_usuario,
            current_setting('app.motivo_eliminacion_soporte', true) -- Motivo desde variable de sesión
        );
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger para registrar auditoría antes de eliminar un soporte
DROP TRIGGER IF EXISTS trigger_auditoria_eliminacion_soporte ON soportes;
CREATE TRIGGER trigger_auditoria_eliminacion_soporte
    BEFORE DELETE ON soportes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_eliminacion_soporte();
