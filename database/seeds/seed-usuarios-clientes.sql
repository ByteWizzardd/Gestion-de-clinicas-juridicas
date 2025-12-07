-- ==========================================================
-- SCRIPT DE CARGA DE DATOS PARA USUARIOS Y CLIENTES
-- ==========================================================
-- Este script inserta usuarios de prueba con diferentes roles
-- para poder probar el sistema de autenticación.
-- 
-- IMPORTANTE: 
-- - Todos los usuarios tienen la contraseña: password123
-- - Los correos de estudiantes deben tener "est." en el dominio
-- - Los correos de profesores NO deben tener "est." en el dominio
-- - Las contraseñas están hasheadas con bcrypt (salt rounds: 10)
-- - Este seed usa ON CONFLICT DO UPDATE para evitar errores si se ejecuta múltiples veces
-- ==========================================================

-- ==========================================================
-- 1. CLIENTES Y USUARIOS - ESTUDIANTES
-- ==========================================================
-- Estudiantes con correo @est.ucab.edu.ve

INSERT INTO clientes (
    cedula,
    nombres,
    apellidos,
    fecha_nacimiento,
    telefono_celular,
    correo_electronico,
    sexo,
    nacionalidad
) VALUES
('V11111111', 'Ana', 'Martínez', '2000-03-15', '0412-1111111', 'ana.martinez@est.ucab.edu.ve', 'F', 'V'),
('V22222222', 'Carlos', 'Rodríguez', '2001-07-22', '0414-2222222', 'carlos.rodriguez@est.ucab.edu.ve', 'M', 'V'),
('V33333333', 'María', 'Fernández', '1999-11-08', '0416-3333333', 'maria.fernandez@est.ucab.edu.ve', 'F', 'V')
ON CONFLICT (cedula) DO UPDATE
SET nombres = EXCLUDED.nombres,
    apellidos = EXCLUDED.apellidos,
    correo_electronico = EXCLUDED.correo_electronico;

INSERT INTO usuarios (cedula, password_hash, rol_sistema, habilitado)
VALUES
('V11111111', '$2b$10$sV6rtquZ.uUT2RKkp.Gw/uNIj7qoYjPUwfYdek1tuvbNcBQ3ByYn2', 'Estudiante', TRUE),
('V22222222', '$2b$10$sV6rtquZ.uUT2RKkp.Gw/uNIj7qoYjPUwfYdek1tuvbNcBQ3ByYn2', 'Estudiante', TRUE),
('V33333333', '$2b$10$sV6rtquZ.uUT2RKkp.Gw/uNIj7qoYjPUwfYdek1tuvbNcBQ3ByYn2', 'Estudiante', TRUE)
ON CONFLICT (cedula) DO UPDATE
SET password_hash = EXCLUDED.password_hash,
    rol_sistema = EXCLUDED.rol_sistema;

-- ==========================================================
-- 2. CLIENTES Y USUARIOS - PROFESORES
-- ==========================================================
-- Profesores con correo @ucab.edu.ve (sin "est.")

INSERT INTO clientes (
    cedula,
    nombres,
    apellidos,
    fecha_nacimiento,
    telefono_celular,
    correo_electronico,
    sexo,
    nacionalidad
) VALUES
('V44444444', 'Profesor', 'González', '1985-05-10', '0412-4444444', 'profesor.gonzalez@ucab.edu.ve', 'M', 'V'),
('V55555555', 'Laura', 'Pérez', '1988-09-25', '0414-5555555', 'laura.perez@ucab.edu.ve', 'F', 'V'),
('V66666666', 'Roberto', 'Sánchez', '1982-12-03', '0416-6666666', 'roberto.sanchez@ucab.edu.ve', 'M', 'V')
ON CONFLICT (cedula) DO UPDATE
SET nombres = EXCLUDED.nombres,
    apellidos = EXCLUDED.apellidos,
    correo_electronico = EXCLUDED.correo_electronico;

INSERT INTO usuarios (cedula, password_hash, rol_sistema, habilitado)
VALUES
('V44444444', '$2b$10$sV6rtquZ.uUT2RKkp.Gw/uNIj7qoYjPUwfYdek1tuvbNcBQ3ByYn2', 'Profesor', TRUE),
('V55555555', '$2b$10$sV6rtquZ.uUT2RKkp.Gw/uNIj7qoYjPUwfYdek1tuvbNcBQ3ByYn2', 'Profesor', TRUE),
('V66666666', '$2b$10$sV6rtquZ.uUT2RKkp.Gw/uNIj7qoYjPUwfYdek1tuvbNcBQ3ByYn2', 'Profesor', TRUE)
ON CONFLICT (cedula) DO UPDATE
SET password_hash = EXCLUDED.password_hash,
    rol_sistema = EXCLUDED.rol_sistema;

-- ==========================================================
-- 3. CLIENTES Y USUARIOS - COORDINADOR
-- ==========================================================
-- Coordinador con correo @ucab.edu.ve

INSERT INTO clientes (
    cedula,
    nombres,
    apellidos,
    fecha_nacimiento,
    telefono_celular,
    correo_electronico,
    sexo,
    nacionalidad
) VALUES
('V77777777', 'Coordinador', 'Administrador', '1975-01-20', '0412-7777777', 'coordinador@ucab.edu.ve', 'M', 'V')
ON CONFLICT (cedula) DO UPDATE
SET nombres = EXCLUDED.nombres,
    apellidos = EXCLUDED.apellidos,
    correo_electronico = EXCLUDED.correo_electronico;

INSERT INTO usuarios (cedula, password_hash, rol_sistema, habilitado)
VALUES
('V77777777', '$2b$10$sV6rtquZ.uUT2RKkp.Gw/uNIj7qoYjPUwfYdek1tuvbNcBQ3ByYn2', 'Coordinador', TRUE)
ON CONFLICT (cedula) DO UPDATE
SET password_hash = EXCLUDED.password_hash,
    rol_sistema = EXCLUDED.rol_sistema;

-- ==========================================================
-- RESUMEN DE USUARIOS DE PRUEBA
-- ==========================================================
-- ⚠️ CONTRASEÑA PARA TODOS LOS USUARIOS: password123
--
-- ESTUDIANTES (rol: Estudiante):
-- - ana.martinez@est.ucab.edu.ve / password123
-- - carlos.rodriguez@est.ucab.edu.ve / password123
-- - maria.fernandez@est.ucab.edu.ve / password123
--
-- PROFESORES (rol: Profesor):
-- - profesor.gonzalez@ucab.edu.ve / password123
-- - laura.perez@ucab.edu.ve / password123
-- - roberto.sanchez@ucab.edu.ve / password123
--
-- COORDINADOR (rol: Coordinador):
-- - coordinador@ucab.edu.ve / password123
--
-- ==========================================================
-- FIN DEL SCRIPT
-- ==========================================================
-- Verificación: Ejecuta estas consultas para verificar los datos insertados:
-- 
-- SELECT COUNT(*) FROM clientes WHERE correo_electronico LIKE '%@est.ucab.edu.ve';
-- SELECT COUNT(*) FROM clientes WHERE correo_electronico LIKE '%@ucab.edu.ve' AND correo_electronico NOT LIKE '%@est.ucab.edu.ve';
-- SELECT COUNT(*) FROM usuarios WHERE rol_sistema = 'Estudiante';
-- SELECT COUNT(*) FROM usuarios WHERE rol_sistema = 'Profesor';
-- SELECT COUNT(*) FROM usuarios WHERE rol_sistema = 'Coordinador';
-- SELECT cedula, nombres, apellidos, correo_electronico, rol_sistema FROM usuarios u JOIN clientes c ON u.cedula = c.cedula;
-- ==========================================================
