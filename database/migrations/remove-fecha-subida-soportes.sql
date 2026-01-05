-- Migración: Eliminar columna fecha_subida de soportes y auditoria_eliminacion_soportes
-- Fecha: 2026-01-02
-- Descripción: Elimina la columna fecha_subida ya que fecha_consignacion cumple la misma función

-- Eliminar fecha_subida de la tabla soportes
ALTER TABLE soportes
DROP COLUMN IF EXISTS fecha_subida;

-- Eliminar fecha_subida de la tabla auditoria_eliminacion_soportes
ALTER TABLE auditoria_eliminacion_soportes
DROP COLUMN IF EXISTS fecha_subida;

-- Actualizar el trigger para remover fecha_subida
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
            LENGTH(OLD.documento_data), -- Solo guardamos el tamaño, no el archivo
            OLD.id_usuario_subio,
            cedula_usuario,
            current_setting('app.motivo_eliminacion_soporte', true) -- Motivo desde variable de sesión
        );
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;
