-- Usar el procedimiento almacenado que maneja la auditoría manual
CALL update_all_by_cedula(
    $1, -- p_cedula
    $2, -- p_nombres
    $3, -- p_apellidos
    $4, -- p_correo_electronico
    NULL, -- p_nombre_usuario
    $5, -- p_telefono_celular
    NULL, -- p_tipo_usuario
    NULL, -- p_estudiante_nrc
    NULL, -- p_estudiante_term
    NULL, -- p_estudiante_tipo
    NULL, -- p_profesor_term
    NULL, -- p_profesor_tipo
    NULL, -- p_coordinador_term
    $6    -- p_cedula_actor
);
