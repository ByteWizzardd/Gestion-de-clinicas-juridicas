-- Estado vigente de una cuenta, para revalidar cada peticion autenticada.
--
-- Devuelve solo lo que el gate necesita: si sigue habilitada y cual es su rol
-- actual. Deliberadamente NO trae el hash de la contrasena, porque esta
-- consulta corre en cada Server Action.
--
-- Parametros: $1 = cedula

SELECT
    u.cedula,
    u.habilitado_sistema AS habilitado,
    u.tipo_usuario AS rol
FROM usuarios u
WHERE u.cedula = $1;
