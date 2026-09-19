-- Cuenta los intentos de inicio de sesión fallidos recientes de un usuario.
--
-- Se apoya en auditoria_eventos, donde registrar-inicio-sesion.sql ya deja una
-- fila por cada intento. No hace falta tabla nueva.
--
-- Ojo con la zona horaria: fecha_evento se guarda como hora local de Caracas
-- (timestamp sin zona), así que la ventana se calcula con la misma expresión.
--
-- Parámetros:
-- $1 = cedula_usuario
-- $2 = minutos de la ventana a revisar

SELECT COUNT(*)::int AS intentos
FROM auditoria_eventos
WHERE entidad = 'sesion'
  AND operacion = 'intento_fallido'
  AND id_usuario = $1
  AND fecha_evento > (now() AT TIME ZONE 'America/Caracas') - ($2::int * INTERVAL '1 minute');
