-- Migración: Agregar columna 'habilitado' a tablas de roles académicos
-- Fecha: 2026-02-03
-- Descripción: Agrega la columna 'habilitado' a las tablas estudiantes, profesores y coordinadores
--              para permitir deshabilitar inscripciones específicas sin eliminarlas

-- 1) Agregar columna 'habilitado' a la tabla ESTUDIANTES
ALTER TABLE estudiantes 
ADD COLUMN IF NOT EXISTS habilitado BOOLEAN NOT NULL DEFAULT TRUE;

-- 2) Agregar columna 'habilitado' a la tabla PROFESORES
ALTER TABLE profesores 
ADD COLUMN IF NOT EXISTS habilitado BOOLEAN NOT NULL DEFAULT TRUE;

-- 3) Agregar columna 'habilitado' a la tabla COORDINADORES
ALTER TABLE coordinadores 
ADD COLUMN IF NOT EXISTS habilitado BOOLEAN NOT NULL DEFAULT TRUE;

-- Comentarios:
-- - Por defecto, todas las inscripciones existentes quedarán como habilitadas (TRUE)
-- - Esto permite que las queries que usan 'habilitado' funcionen correctamente
