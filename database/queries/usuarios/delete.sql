CREATE FUNCTION eliminar_usuario(cedula_usuario VARCHAR)
RETURNS VOID AS $$
BEGIN
    DELETE FROM usuarios WHERE cedula = cedula_usuario;
END;
$$ LANGUAGE plpgsql;