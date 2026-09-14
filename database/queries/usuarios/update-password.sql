-- Actualizar contraseña de un usuario
-- Parámetros:
-- $1 = correo_electronico
-- $2 = nueva contraseña (hash)
--
-- Se ejecuta con pool.query (sin withAuditTransaction), así que el trigger de
-- auditoría no tenía actor. Quien cambia (o restablece) su contraseña es el
-- propio usuario: el CTE fija app.current_user_id antes del UPDATE (las
-- variables locales duran hasta el final de esta sentencia, cuando se dispara
-- el trigger AFTER). La auditoría nunca guarda el hash, solo que cambió.
WITH actor AS (
    SELECT
        set_config('app.current_user_id', cedula, true) AS usuario,
        set_config('app.audit_metadata', '{"accion_negocio": "Cambio de contraseña"}', true) AS metadata
    FROM usuarios
    WHERE correo_electronico = $1
)
UPDATE usuarios u
SET contrasena = $2
FROM actor
WHERE u.correo_electronico = $1
RETURNING u.cedula, u.correo_electronico;
