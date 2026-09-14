-- =============================================================================
-- Fix: el código (soportes/create.sql, get-documento.sql, get-by-caso.sql) y
-- schema.sql guardan los soportes como URL de Vercel Blob en
-- soportes.url_documento, pero en Neon esa columna nunca se creó: la tabla
-- sigue con la columna vieja documento_data (BYTEA, el archivo completo).
-- Resultado: subir un soporte fallaba con "column url_documento does not
-- exist" (después del error de token de Blob) y listar/descargar también.
--
-- Esta migración agrega url_documento. documento_data se conserva: los
-- soportes subidos antes de pasar a Vercel Blob solo existen ahí, y
-- get-documento.sql los devuelve como data URL cuando no hay URL.
--
-- Idempotente: ADD COLUMN IF NOT EXISTS.
--
-- Uso:
--   psql "$DATABASE_URL" -f database/migrations/20260913_192000_soportes_url_documento.sql
-- =============================================================================

ALTER TABLE soportes ADD COLUMN IF NOT EXISTS url_documento VARCHAR(500);
