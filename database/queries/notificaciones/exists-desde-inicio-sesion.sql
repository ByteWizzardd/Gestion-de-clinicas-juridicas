-- ¿Ya se le mandó esta misma notificación DESDE QUE INICIÓ LA SESIÓN?
--
-- Reemplaza a exists-unread.sql para los avisos que deben repetirse en cada
-- inicio de sesión. Aquella comparaba contra todas las notificaciones que el
-- usuario hubiera recibido alguna vez —leídas incluidas, a pesar del nombre del
-- archivo—, así que en cuanto leía el aviso de casos inactivos una vez no
-- volvía a salirle nunca más, aunque los casos siguieran inactivos.
--
-- Acotarlo a la sesión hace que el aviso vuelva en el siguiente inicio de
-- sesión, y que dentro de la misma sesión no se duplique.
--
-- El corte se pasa como SEGUNDOS TRANSCURRIDOS, no como una fecha, y se resta
-- de LOCALTIMESTAMP a propósito: `fecha` se llena con CURRENT_TIMESTAMP, que en
-- una columna TIMESTAMP sin zona guarda la hora local del servidor de base de
-- datos. Comparar contra una fecha armada en Node obligaría a que las dos zonas
-- coincidan; restar un intervalo del reloj de la propia base no depende de eso.
--
-- Parámetros:
--   $1 = cedula_receptor
--   $2 = titulo
--   $3 = mensaje
--   $4 = segundos transcurridos desde que inició la sesión

SELECT 1
FROM notificaciones
WHERE cedula_receptor = $1
  AND titulo = $2
  AND mensaje = $3
  AND fecha >= LOCALTIMESTAMP - make_interval(secs => $4::double precision)
LIMIT 1;
