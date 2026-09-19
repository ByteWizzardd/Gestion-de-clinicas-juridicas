-- =========================================================
-- Blindaje del restablecimiento de contraseña
-- =========================================================
-- Problemas que corrige:
--
-- 1. fecha_expiracion era DATE, así que un código pensado para durar 24 horas
--    en realidad vivía hasta el final del día siguiente y no podía expresarse
--    una expiración en minutos. Pasa a TIMESTAMP (hora de Caracas, igual que
--    el resto del esquema).
-- 2. fecha_creacion era DATE, con lo que "el token más reciente" no podía
--    desempatarse entre dos del mismo día.
-- 3. No había forma de contar intentos fallidos por token, así que un código
--    de 6 dígitos era recorrible por fuerza bruta.
--
-- Los tokens existentes se invalidan: fueron emitidos bajo el esquema viejo.
-- Es inofensivo, solo obliga a volver a pedir el código a quien tuviera uno
-- a medias.
-- =========================================================

BEGIN;

-- 1. Precisión de fecha ---------------------------------------------------
ALTER TABLE password_reset_tokens
    ALTER COLUMN fecha_expiracion TYPE TIMESTAMP
        USING fecha_expiracion::timestamp;

ALTER TABLE password_reset_tokens
    ALTER COLUMN fecha_creacion TYPE TIMESTAMP
        USING fecha_creacion::timestamp;

ALTER TABLE password_reset_tokens
    ALTER COLUMN fecha_creacion SET DEFAULT (now() AT TIME ZONE 'America/Caracas'::text);

-- 2. Contador de intentos por token --------------------------------------
ALTER TABLE password_reset_tokens
    ADD COLUMN IF NOT EXISTS intentos SMALLINT NOT NULL DEFAULT 0;

-- 3. Invalidar lo emitido bajo el esquema anterior ------------------------
UPDATE password_reset_tokens
SET usado = TRUE
WHERE usado = FALSE;

-- 4. Índice para la búsqueda nueva ---------------------------------------
-- Ahora se busca por usuario (no por código suelto), así que el índice viejo
-- sobre codigo_verificacion deja de ser el camino de acceso.
CREATE INDEX IF NOT EXISTS idx_password_reset_cedula_activo
    ON password_reset_tokens USING btree (cedula_usuario, usado, fecha_expiracion);

COMMIT;
