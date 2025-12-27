CREATE PROCEDURE toggle_habilitado_usuario(
    p_cedula_usuario VARCHAR,,
) RETURNS VOID AS $$
BEGIN
    UPDATE usuarios
    SET habilitado = NOT habilitado
    WHERE cedula = p_cedula_usuario;
END;
$$ LANGUAGE plpgsql;
