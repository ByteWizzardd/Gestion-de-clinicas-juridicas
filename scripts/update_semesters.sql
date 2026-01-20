-- Script mejorado para actualizar semestres manejando todas las dependencias (FKs)
-- Estrategia: Duplicar registros padres -> Mover hijos -> Eliminar padres viejos

BEGIN;

-- === 2026-1 -> 2026-15 ===
-- 1. Crear nuevo semestre
INSERT INTO semestres (term, fecha_inicio, fecha_fin, habilitado)
SELECT '2026-15', fecha_inicio, fecha_fin, habilitado FROM semestres WHERE term = '2026-1'
ON CONFLICT (term) DO NOTHING;

-- 2. Migrar Coordinadores (PK es solo ID, term es campo simple -> UPDATE directo)
UPDATE coordinadores SET term = '2026-15' WHERE term = '2026-1';

-- 3. Migrar Profesores (PK compuesta incluye term -> INSERT/UPDATE hijos/DELETE)
INSERT INTO profesores (term, cedula_profesor, tipo_profesor)
SELECT '2026-15', cedula_profesor, tipo_profesor FROM profesores WHERE term = '2026-1'
ON CONFLICT DO NOTHING;

UPDATE supervisa SET term = '2026-15' WHERE term = '2026-1';

DELETE FROM profesores WHERE term = '2026-1';

-- 4. Migrar Estudiantes (PK compuesta incluye term -> INSERT/UPDATE hijos/DELETE)
INSERT INTO estudiantes (term, cedula_estudiante, tipo_estudiante, nrc)
SELECT '2026-15', cedula_estudiante, tipo_estudiante, nrc FROM estudiantes WHERE term = '2026-1'
ON CONFLICT DO NOTHING;

UPDATE se_le_asigna SET term = '2026-15' WHERE term = '2026-1';

DELETE FROM estudiantes WHERE term = '2026-1';

-- 5. Eliminar semestre viejo
DELETE FROM semestres WHERE term = '2026-1';


-- === 2026-2 -> 2026-25 ===
INSERT INTO semestres (term, fecha_inicio, fecha_fin, habilitado)
SELECT '2026-25', fecha_inicio, fecha_fin, habilitado FROM semestres WHERE term = '2026-2'
ON CONFLICT (term) DO NOTHING;

UPDATE coordinadores SET term = '2026-25' WHERE term = '2026-2';

INSERT INTO profesores (term, cedula_profesor, tipo_profesor)
SELECT '2026-25', cedula_profesor, tipo_profesor FROM profesores WHERE term = '2026-2'
ON CONFLICT DO NOTHING;

UPDATE supervisa SET term = '2026-25' WHERE term = '2026-2';

DELETE FROM profesores WHERE term = '2026-2';

INSERT INTO estudiantes (term, cedula_estudiante, tipo_estudiante, nrc)
SELECT '2026-25', cedula_estudiante, tipo_estudiante, nrc FROM estudiantes WHERE term = '2026-2'
ON CONFLICT DO NOTHING;

UPDATE se_le_asigna SET term = '2026-25' WHERE term = '2026-2';

DELETE FROM estudiantes WHERE term = '2026-2';

DELETE FROM semestres WHERE term = '2026-2';


-- === 2025-1 -> 2025-15 ===
INSERT INTO semestres (term, fecha_inicio, fecha_fin, habilitado)
SELECT '2025-15', fecha_inicio, fecha_fin, habilitado FROM semestres WHERE term = '2025-1'
ON CONFLICT (term) DO NOTHING;

UPDATE coordinadores SET term = '2025-15' WHERE term = '2025-1';

INSERT INTO profesores (term, cedula_profesor, tipo_profesor)
SELECT '2025-15', cedula_profesor, tipo_profesor FROM profesores WHERE term = '2025-1'
ON CONFLICT DO NOTHING;

UPDATE supervisa SET term = '2025-15' WHERE term = '2025-1';

DELETE FROM profesores WHERE term = '2025-1';

INSERT INTO estudiantes (term, cedula_estudiante, tipo_estudiante, nrc)
SELECT '2025-15', cedula_estudiante, tipo_estudiante, nrc FROM estudiantes WHERE term = '2025-1'
ON CONFLICT DO NOTHING;

UPDATE se_le_asigna SET term = '2025-15' WHERE term = '2025-1';

DELETE FROM estudiantes WHERE term = '2025-1';

DELETE FROM semestres WHERE term = '2025-1';


-- === 2025-2 -> 2025-25 ===
INSERT INTO semestres (term, fecha_inicio, fecha_fin, habilitado)
SELECT '2025-25', fecha_inicio, fecha_fin, habilitado FROM semestres WHERE term = '2025-2'
ON CONFLICT (term) DO NOTHING;

UPDATE coordinadores SET term = '2025-25' WHERE term = '2025-2';

INSERT INTO profesores (term, cedula_profesor, tipo_profesor)
SELECT '2025-25', cedula_profesor, tipo_profesor FROM profesores WHERE term = '2025-2'
ON CONFLICT DO NOTHING;

UPDATE supervisa SET term = '2025-25' WHERE term = '2025-2';

DELETE FROM profesores WHERE term = '2025-2';

INSERT INTO estudiantes (term, cedula_estudiante, tipo_estudiante, nrc)
SELECT '2025-25', cedula_estudiante, tipo_estudiante, nrc FROM estudiantes WHERE term = '2025-2'
ON CONFLICT DO NOTHING;

UPDATE se_le_asigna SET term = '2025-25' WHERE term = '2025-2';

DELETE FROM estudiantes WHERE term = '2025-2';

DELETE FROM semestres WHERE term = '2025-2';


-- === 2024-1 -> 2024-15 ===
INSERT INTO semestres (term, fecha_inicio, fecha_fin, habilitado)
SELECT '2024-15', fecha_inicio, fecha_fin, habilitado FROM semestres WHERE term = '2024-1'
ON CONFLICT (term) DO NOTHING;

UPDATE coordinadores SET term = '2024-15' WHERE term = '2024-1';

INSERT INTO profesores (term, cedula_profesor, tipo_profesor)
SELECT '2024-15', cedula_profesor, tipo_profesor FROM profesores WHERE term = '2024-1'
ON CONFLICT DO NOTHING;

UPDATE supervisa SET term = '2024-15' WHERE term = '2024-1';

DELETE FROM profesores WHERE term = '2024-1';

INSERT INTO estudiantes (term, cedula_estudiante, tipo_estudiante, nrc)
SELECT '2024-15', cedula_estudiante, tipo_estudiante, nrc FROM estudiantes WHERE term = '2024-1'
ON CONFLICT DO NOTHING;

UPDATE se_le_asigna SET term = '2024-15' WHERE term = '2024-1';

DELETE FROM estudiantes WHERE term = '2024-1';

DELETE FROM semestres WHERE term = '2024-1';


-- === 2024-2 -> 2024-25 ===
INSERT INTO semestres (term, fecha_inicio, fecha_fin, habilitado)
SELECT '2024-25', fecha_inicio, fecha_fin, habilitado FROM semestres WHERE term = '2024-2'
ON CONFLICT (term) DO NOTHING;

UPDATE coordinadores SET term = '2024-25' WHERE term = '2024-2';

INSERT INTO profesores (term, cedula_profesor, tipo_profesor)
SELECT '2024-25', cedula_profesor, tipo_profesor FROM profesores WHERE term = '2024-2'
ON CONFLICT DO NOTHING;

UPDATE supervisa SET term = '2024-25' WHERE term = '2024-2';

DELETE FROM profesores WHERE term = '2024-2';

INSERT INTO estudiantes (term, cedula_estudiante, tipo_estudiante, nrc)
SELECT '2024-25', cedula_estudiante, tipo_estudiante, nrc FROM estudiantes WHERE term = '2024-2'
ON CONFLICT DO NOTHING;

UPDATE se_le_asigna SET term = '2024-25' WHERE term = '2024-2';

DELETE FROM estudiantes WHERE term = '2024-2';

DELETE FROM semestres WHERE term = '2024-2';

COMMIT;
