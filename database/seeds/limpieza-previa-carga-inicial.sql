-- =========================================================
-- LIMPIEZA PREVIA A LA CARGA INICIAL
-- =========================================================
-- Vacía todas las tablas de datos para dejar la base lista para los datos
-- reales de la clínica (database/seeds/carga-inicial-2024-2025.sql).
--
-- NO TOCA LOS CATÁLOGOS PRECARGADOS: estados, municipios, parroquias,
-- núcleos, materias, categorías, subcategorías, ámbitos legales,
-- características, tipos de característica, niveles educativos, condiciones
-- de trabajo y actividad, semestres y la política de retención de auditoría.
--
-- Sí borra los usuarios, incluidas las cuentas de prueba, y vuelve a crear un
-- único Coordinador con las mismas credenciales que ya existían para no
-- quedarse sin acceso a la aplicación.
--
-- OJO: esto no se puede deshacer. Correr dentro de la misma transacción que
-- la carga inicial, así o entra todo o no cambia nada.
--
-- OJO TAMBIÉN con ensayarlo revirtiendo la transacción: los DELETE se deshacen,
-- pero los setval del punto 7 NO. Postgres deja las secuencias fuera de las
-- transacciones a propósito, así que un ensayo devuelve los contadores a 1
-- aunque las filas sigan ahí, y el siguiente INSERT choca con una clave que ya
-- existe. Después de un ensayo hay que volver a subirlas a max(id).

-- Los triggers de auditoría se silencian: el borrado dejaría un evento por
-- cada fila eliminada, y lo que interesa registrar es la carga, no la purga.
SET LOCAL app.skip_audit_trigger = 'true';

-- 1. Asociativas que dependen de acciones, citas, casos y usuarios
DELETE FROM ejecutan;
DELETE FROM atienden;
DELETE FROM supervisa;
DELETE FROM se_le_asigna;

-- 2. Todo lo que cuelga de un caso
DELETE FROM acciones;
DELETE FROM citas;
DELETE FROM soportes;
DELETE FROM beneficiarios;
DELETE FROM cambio_estatus;
DELETE FROM ocurren_en;

-- 3. Casos
DELETE FROM casos;

-- 4. Todo lo que cuelga de un solicitante
DELETE FROM asignadas_a;
DELETE FROM viviendas;
DELETE FROM familias_y_hogares;
DELETE FROM solicitantes;

-- 5. Lo que cuelga de un usuario
DELETE FROM notificaciones;
DELETE FROM password_reset_tokens;
DELETE FROM estudiantes;
DELETE FROM profesores;
DELETE FROM coordinadores;
UPDATE auditoria_retencion SET id_usuario_modifica = NULL WHERE id_usuario_modifica IS NOT NULL;
DELETE FROM usuarios;

-- 6. Auditoría: la base arranca de cero, no hay historia que conservar
DELETE FROM auditoria_eventos;

-- 7. Los contadores vuelven a empezar, para que el primer caso sea el #1
SELECT setval(pg_get_serial_sequence('casos', 'id_caso'), 1, false);
SELECT setval(pg_get_serial_sequence('auditoria_eventos', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('password_reset_tokens', 'id_token'), 1, false);

-- 8. Coordinador único, con las credenciales que ya se venían usando
--    (usuario "coordinador"; la contraseña es la misma de antes, aquí va su
--    hash bcrypt tal cual estaba, no una nueva).
INSERT INTO usuarios (cedula, nombres, apellidos, correo_electronico, nombre_usuario,
    contrasena, telefono_celular, habilitado_sistema, tipo_usuario)
VALUES ('V-77777777', 'Coordinador', 'Administrador', 'coordinador@ucab.edu.ve', 'coordinador',
    '$2b$10$sV6rtquZ.uUT2RKkp.Gw/uNIj7qoYjPUwfYdek1tuvbNcBQ3ByYn2', '0412-7777777', TRUE, 'Coordinador');

INSERT INTO coordinadores (id_coordinador, term, habilitado)
VALUES ('V-77777777', '2025-25', TRUE);
