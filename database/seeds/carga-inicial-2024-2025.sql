-- =========================================================
-- CARGA INICIAL DE DATOS REALES — período 2024-2025
-- =========================================================
-- Generado por scripts/etl-carga-inicial.mjs a partir de los libros
-- "REGISTRO Y CONTROL BENEFICIARIOS 2024-2025 (Respuestas).xlsx" y
-- "Control de casos Clinica juridica 2024 2025.xlsx".
--
-- NO EDITAR A MANO: se regenera volviendo a correr el ETL.
-- Lo que quedó fuera y por qué está en carga-inicial-informe.md.
--
-- Va todo en una transacción: o entra completo o no entra nada.

BEGIN;

-- Los triggers de auditoría se silencian para la carga: son datos
-- históricos, no actividad de usuarios. Al final queda UN evento que
-- deja constancia de la carga.
SET LOCAL app.skip_audit_trigger = 'true';

-- trigger_crear_cambio_estatus_inicial exige saber quién abre el caso.
SET LOCAL app.current_user_id = 'V-77777777';

-- ---------------------------------------------------------------------
-- Profesores y alumnos que aparecen en el control de casos.
-- ATENCIÓN: cédula, correo y contraseña son INVENTADOS; el libro solo da
-- el nombre. La contraseña es la misma del Coordinador. Ver el informe.
-- ---------------------------------------------------------------------
INSERT INTO usuarios (cedula, nombres, apellidos, correo_electronico, nombre_usuario,
    contrasena, habilitado_sistema, tipo_usuario, id_usuario_registro) VALUES
    ('V-90000001', 'Minelvis', 'Martínez', 'minelvis.martinez.demo@ucab.edu.ve', 'minelvis.martinez.demo', '$2b$10$sV6rtquZ.uUT2RKkp.Gw/uNIj7qoYjPUwfYdek1tuvbNcBQ3ByYn2', TRUE, 'Profesor', 'V-77777777'),
    ('V-90000002', 'Roberto', 'Delgado', 'roberto.delgado.demo@ucab.edu.ve', 'roberto.delgado.demo', '$2b$10$sV6rtquZ.uUT2RKkp.Gw/uNIj7qoYjPUwfYdek1tuvbNcBQ3ByYn2', TRUE, 'Profesor', 'V-77777777'),
    ('V-90000003', 'Edgar', 'Dunn', 'edgar.dunn.demo@est.ucab.edu.ve', 'edgar.dunn.demo', '$2b$10$sV6rtquZ.uUT2RKkp.Gw/uNIj7qoYjPUwfYdek1tuvbNcBQ3ByYn2', TRUE, 'Estudiante', 'V-77777777'),
    ('V-90000004', 'José Matías', 'Araguayan', 'jose.matias.araguayan.demo@est.ucab.edu.ve', 'jose.matias.araguayan.demo', '$2b$10$sV6rtquZ.uUT2RKkp.Gw/uNIj7qoYjPUwfYdek1tuvbNcBQ3ByYn2', TRUE, 'Estudiante', 'V-77777777'),
    ('V-90000005', 'Vincenzo', 'Altobelli', 'vincenzo.altobelli.demo@est.ucab.edu.ve', 'vincenzo.altobelli.demo', '$2b$10$sV6rtquZ.uUT2RKkp.Gw/uNIj7qoYjPUwfYdek1tuvbNcBQ3ByYn2', TRUE, 'Estudiante', 'V-77777777'),
    ('V-90000006', 'Yuliana', 'Pereira', 'yuliana.pereira.demo@est.ucab.edu.ve', 'yuliana.pereira.demo', '$2b$10$sV6rtquZ.uUT2RKkp.Gw/uNIj7qoYjPUwfYdek1tuvbNcBQ3ByYn2', TRUE, 'Estudiante', 'V-77777777'),
    ('V-90000007', 'Victoria', 'Pereira', 'victoria.pereira.demo@est.ucab.edu.ve', 'victoria.pereira.demo', '$2b$10$sV6rtquZ.uUT2RKkp.Gw/uNIj7qoYjPUwfYdek1tuvbNcBQ3ByYn2', TRUE, 'Estudiante', 'V-77777777'),
    ('V-90000008', 'Niuska', 'Calderón', 'niuska.calderon.demo@est.ucab.edu.ve', 'niuska.calderon.demo', '$2b$10$sV6rtquZ.uUT2RKkp.Gw/uNIj7qoYjPUwfYdek1tuvbNcBQ3ByYn2', TRUE, 'Estudiante', 'V-77777777'),
    ('V-90000009', 'Edidson', 'Lozano', 'edidson.lozano.demo@est.ucab.edu.ve', 'edidson.lozano.demo', '$2b$10$sV6rtquZ.uUT2RKkp.Gw/uNIj7qoYjPUwfYdek1tuvbNcBQ3ByYn2', TRUE, 'Estudiante', 'V-77777777'),
    ('V-90000010', 'Bautista', 'García', 'bautista.garcia.demo@est.ucab.edu.ve', 'bautista.garcia.demo', '$2b$10$sV6rtquZ.uUT2RKkp.Gw/uNIj7qoYjPUwfYdek1tuvbNcBQ3ByYn2', TRUE, 'Estudiante', 'V-77777777'),
    ('V-90000011', 'Bautista', 'Rosas', 'bautista.rosas.demo@est.ucab.edu.ve', 'bautista.rosas.demo', '$2b$10$sV6rtquZ.uUT2RKkp.Gw/uNIj7qoYjPUwfYdek1tuvbNcBQ3ByYn2', TRUE, 'Estudiante', 'V-77777777'),
    ('V-90000012', 'Ana', 'Moreno', 'ana.moreno.demo@est.ucab.edu.ve', 'ana.moreno.demo', '$2b$10$sV6rtquZ.uUT2RKkp.Gw/uNIj7qoYjPUwfYdek1tuvbNcBQ3ByYn2', TRUE, 'Estudiante', 'V-77777777'),
    ('V-90000013', 'Nazaret', 'Moorley', 'nazaret.moorley.demo@est.ucab.edu.ve', 'nazaret.moorley.demo', '$2b$10$sV6rtquZ.uUT2RKkp.Gw/uNIj7qoYjPUwfYdek1tuvbNcBQ3ByYn2', TRUE, 'Estudiante', 'V-77777777'),
    ('V-90000014', 'Ana', 'León', 'ana.leon.demo@est.ucab.edu.ve', 'ana.leon.demo', '$2b$10$sV6rtquZ.uUT2RKkp.Gw/uNIj7qoYjPUwfYdek1tuvbNcBQ3ByYn2', TRUE, 'Estudiante', 'V-77777777');

-- Inscripción en los semestres que abarca el libro.
INSERT INTO estudiantes (term, cedula_estudiante, tipo_estudiante, nrc, id_usuario_registro)
SELECT s.term, u.cedula, 'Inscrito', 'CJ-2024-2025', 'V-77777777'
FROM usuarios u CROSS JOIN (SELECT unnest(ARRAY['2024-25', '2025-15', '2025-25']) AS term) s
WHERE u.cedula = ANY(ARRAY['V-90000003', 'V-90000004', 'V-90000005', 'V-90000006', 'V-90000007', 'V-90000008', 'V-90000009', 'V-90000010', 'V-90000011', 'V-90000012', 'V-90000013', 'V-90000014']);

INSERT INTO profesores (term, cedula_profesor, tipo_profesor, id_usuario_registro)
SELECT s.term, u.cedula, 'Asesor', 'V-77777777'
FROM usuarios u CROSS JOIN (SELECT unnest(ARRAY['2024-25', '2025-15', '2025-25']) AS term) s
WHERE u.cedula = ANY(ARRAY['V-90000001', 'V-90000002']);

-- Parroquia para quien dio su sector pero no su parroquia. Las tres columnas
-- del domicilio son NOT NULL y meterlos en una parroquia real cualquiera
-- sería decir que viven donde no viven. La dirección que escribieron queda
-- completa en direccion_habitacion.
INSERT INTO parroquias (id_estado, num_municipio, num_parroquia, nombre_parroquia)
SELECT 6, 1, COALESCE(max(num_parroquia), 0) + 1, 'No suministrada'
FROM parroquias WHERE id_estado = 6 AND num_municipio = 1
HAVING NOT EXISTS (SELECT 1 FROM parroquias WHERE id_estado = 6
    AND num_municipio = 1 AND nombre_parroquia = 'No suministrada');

-- Opción de catálogo para quien no contestó el nivel educativo. El campo es
-- NOT NULL y "Sin Nivel" significaría que no estudió, que no es lo mismo.
INSERT INTO niveles_educativos (descripcion)
SELECT 'No suministrado'
WHERE NOT EXISTS (SELECT 1 FROM niveles_educativos WHERE descripcion = 'No suministrado');

INSERT INTO solicitantes (cedula, nombres, apellidos, fecha_nacimiento, telefono_celular,
    correo_electronico, sexo, nacionalidad, estado_civil, concubinato, id_nivel_educativo,
    id_trabajo, id_actividad, id_estado, num_municipio, num_parroquia, direccion_habitacion,
    id_usuario_registro) VALUES
    ('V-12679398', 'Francimar Josefina', 'Gamboa', '1975-08-12', '04140919632', 'francimarjosefinagamboa38@gmail.com', 'F', 'V', 'Casado', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 4, NULL, 6, 1, 6, 'BOLIVAR, CARONI, UNARE, SANTA ROSA', 'V-77777777'),
    ('V-21251277', 'Flores Bellorin', 'Eily Josefina', '1991-11-20', '04264883974', 'eily.flores@gmail.com', 'F', 'V', 'Casado', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 2, 4, 6, 1, 6, 'Bolívar, Caroni, Unare', 'V-77777777'),
    ('V-6692584', 'Jose Luis', 'Morales Morales', '1970-04-12', '04249551956', 'josemorales1902017@gmail.com', 'M', 'V', 'Casado', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 4, NULL, 6, 1, 3, 'Bolivar, Caroní, Dalla Costa, Guaiparo', 'V-77777777'),
    ('V-14743490', 'Jhonjaro Bolívar', 'Martínez', '1981-06-16', '04244675678', 'v-14743490@sin-correo.invalid', 'M', 'V', 'Casado', FALSE, 3, 2, NULL, 6, 1, 6, 'Sueño de bolívar, core 8.', 'V-77777777'),
    ('V-20506378', 'Mariannis', 'García', '1990-12-17', '04249352318', 'v-20506378@sin-correo.invalid', 'F', 'V', 'Casado', FALSE, 4, 3, NULL, 6, 1, 3, 'José Tadeo Monagas , dalla costa', 'V-77777777'),
    ('V-13994561', 'Ramón Alexis', 'Marín Zapata', '1979-06-13', '04164902952', 'ramón.alex1305@gmail.com', 'M', 'V', 'Casado', FALSE, 3, 2, NULL, 6, 1, (SELECT num_parroquia FROM parroquias WHERE id_estado = 6 AND num_municipio = 1 AND nombre_parroquia = 'No suministrada'), 'Municipio Caroní', 'V-77777777'),
    ('V-18450908', 'Efrén', 'Martínez', '1984-06-09', '04129263657', 'josémartinez542@gmail.com', 'M', 'V', 'Casado', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 0, NULL, 6, 1, 3, 'Campo rojo, dalla costa', 'V-77777777'),
    ('V-70000001', 'Leivis', 'Leon', '1978-09-21', '04148543692', 'leon3teresa@gmail.con', 'F', 'V', 'Casado', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 2, NULL, 6, 1, 6, 'Villa Betania, parroquia unare municipio carpni', 'V-77777777'),
    ('V-12396754', 'Columba', 'Corales', '1977-06-10', '041440982786', 'corales03@gmail.com', 'F', 'V', 'Casado', FALSE, 5, 0, 1, 6, 1, 6, 'Core 8, unare, municipio Caroní', 'V-77777777'),
    ('V-6898353', 'Anelsy', 'León', '1996-06-27', '04129509913', 'anelsy_leon1966@hotmail.com', 'F', 'V', 'Divorciado', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 0, 3, 6, 1, (SELECT num_parroquia FROM parroquias WHERE id_estado = 6 AND num_municipio = 1 AND nombre_parroquia = 'No suministrada'), 'Caimito manzana 34 casa 18', 'V-77777777'),
    ('V-11512882', 'Felix', 'Zambrano', '1996-09-19', '04162066555', 'albertozambrano473@gmail.com', 'M', 'V', 'Casado', FALSE, 1, 1, 0, 6, 1, 3, 'La unidad , dalla costa', 'V-77777777'),
    ('V-15429858', 'Yaritza del Valle', 'Martínez', '1978-12-04', '04249719546', 'yn6457271@gmail.com', 'F', 'V', 'Casado', FALSE, 1, 0, 1, 6, 1, 11, 'Maisanta, 5 julio , municipio Caroní', 'V-77777777'),
    ('V-14986003', 'Georgina', 'Bejarano', '1980-03-03', '04143500524', 'gbejarano@ucab.edu.ve', 'F', 'V', 'Casado', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 0, 2, 6, 1, 7, 'Bolivar, Villa Latina, parroquia universidad', 'V-77777777'),
    ('V-8370445', 'Gladis', 'Cardoza', '1963-08-10', '04147605561', 'v-8370445@sin-correo.invalid', 'F', 'V', 'Casado', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 0, 0, 6, 1, 3, 'Av hospital, guaiparo, dalla costa', 'V-77777777'),
    ('V-19420603', 'Sergio', 'Jiménez', '1989-11-08', '04147704551', 'sergiojimenez.rc@gmail.com', 'F', 'V', 'Soltero', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 2, NULL, 6, 1, 6, 'Unare, puerto Ordaz , unare 2', 'V-77777777'),
    ('V-18169044', 'Robert', 'Astudillo', '1978-06-22', '04248168854', 'v-18169044@sin-correo.invalid', 'M', 'V', 'Casado', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 0, NULL, 6, 1, 4, 'San Félix,11 de abril , puerto Ordaz', 'V-77777777'),
    ('V-9906226', 'María', 'Mota', '1966-10-08', '04128793794', 'mmota7188@gmail.com', 'F', 'V', 'Divorciado', FALSE, 1, 2, 0, 6, 1, 3, 'José Tadeo Monagas , dalla costa', 'V-77777777'),
    ('V-18901921', 'Yurbarys', 'Laya', '1976-06-10', '041220400784', 'yurbaryslaya5@gmail.com', 'F', 'V', 'Casado', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 0, 1, 6, 1, (SELECT num_parroquia FROM parroquias WHERE id_estado = 6 AND num_municipio = 1 AND nombre_parroquia = 'No suministrada'), '25 de marzo san Félix', 'V-77777777'),
    ('V-5426329', 'Yandira Naveda', 'Leira', '1959-07-23', '04249070547', 'yardiranaveda59@gmail.com', 'F', 'V', 'Casado', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 0, NULL, 6, 1, 7, 'Villa africana , parroquia universidad', 'V-77777777'),
    ('V-23552118', 'Luz Marquez', 'Figueroa', '1972-04-07', '041499744348', 'v-23552118@sin-correo.invalid', 'F', 'V', 'Soltero', FALSE, 7, 2, NULL, 6, 1, 3, 'La 46 Dalla Costa', 'V-77777777'),
    ('V-70000002', 'Martha', 'Jansen', '1987-06-12', '04249693075', 'v-70000002@sin-correo.invalid', 'F', 'V', 'Soltero', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 4, NULL, 6, 1, 7, 'Villa africana Municipio Caroni', 'V-77777777'),
    ('V-26444583', 'Mayerlin', 'Coa', '1997-07-08', '04249209321', 'mayerlincoa@gmail.com', 'M', 'V', 'Casado', FALSE, 3, 3, 2, 6, 1, 6, 'Puerto Ordaz, Unare.', 'V-77777777'),
    ('V-9897125', 'Sanchez de Mata', 'Kerenis del Valle', '1967-07-20', '04249129600', 'patkere@yahoo.com', 'F', 'V', 'Soltero', FALSE, 2, 2, 4, 6, 1, 6, 'Bolivar, Caroni, Unare', 'V-77777777'),
    ('V-17039236', 'Jhony Wladimir', 'Salaberria Quijada', '1983-07-08', '04149116760', 'jhonnisalaberria83@gmail.com', 'M', 'V', 'Soltero', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 0, NULL, 6, 1, 2, 'Nueva chirica, chirica', 'V-77777777'),
    ('E-868205', 'Partido', 'Lourdes', '1981-05-12', '04264751937', 'partidolourdes@gmail.com', 'F', 'E', 'Soltero', TRUE, 4, 4, 1, 6, 1, (SELECT num_parroquia FROM parroquias WHERE id_estado = 6 AND num_municipio = 1 AND nombre_parroquia = 'No suministrada'), 'Bolivar, Caroni, Puerto Ordaz', 'V-77777777'),
    ('V-17750004', 'Yohomys Josefina', 'Gonzales Machiz', '1982-10-17', '04162332060', 'v-17750004@sin-correo.invalid', 'F', 'V', 'Soltero', TRUE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 0, 0, 6, 1, 8, 'Bolivar, vista el sol urbanización romero.', 'V-77777777'),
    ('V-5545543', 'Senaira', 'Márquez', '1958-04-24', '04249080189', 'v-5545543@sin-correo.invalid', 'F', 'V', 'Soltero', FALSE, 3, 0, 3, 6, 1, 5, 'El roble vía Palua Parroquia Simón Bolívar, Estado Bolívar.', 'V-77777777'),
    ('V-29543234', 'Subero Gamez', 'Yexibel Adriana', '2002-04-14', '04249619948', 'yexiabg@gmail.com', 'F', 'V', 'Soltero', FALSE, 4, 2, 4, 6, 1, 3, 'Bolívar, Caroni, Dalla Costa', 'V-77777777'),
    ('V-12594800', 'Rangel Colmenares', 'José del Carmen', '1976-09-11', '04143500524', 'gbejaran@gmail.com', 'M', 'V', 'Casado', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 4, NULL, 6, 1, 7, 'Bolivar, Caroní, villa latina', 'V-77777777'),
    ('V-9319389', 'Melida Isabel', 'Rodriguez Bejarano', '1964-08-24', '041486782222', 'envzla@gmail.com', 'F', 'V', 'Soltero', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 0, NULL, 6, 1, 6, 'Urbanizacion riberas del caroni-, unare, Bolivar', 'V-77777777'),
    ('V-22824309', 'Silvia Elena', 'Idarraga Gallego', '1947-09-05', '04249039971', 'v-22824309@sin-correo.invalid', 'F', 'V', 'Casado', FALSE, 6, 2, 3, 6, 1, 6, 'Core 8 plaza mercado, parroquia Unare, municipio caroni, estado Bolívar', 'V-77777777'),
    ('V-18916345', 'Froilan Vicente', 'Aguilera Cedeño', '1988-05-04', '04126943358', 'froyagui04@gmail.com', 'M', 'V', 'Casado', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 2, 4, 6, 1, 7, 'Estado Bolivar, Municipio Caroni, Parroquia Universidad', 'V-77777777'),
    ('V-2933841', 'Cristina', 'Nickels', '1947-07-05', '04163913668', 'cnicklases@gmail.com', 'F', 'V', 'Soltero', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 0, NULL, 6, 1, 7, 'Los Olivos, Parroquia Universidad', 'V-77777777'),
    ('V-19039786', 'Arias Marin', 'Yannohacelys Romina', '1990-07-06', '04249453501', 'arias.yrm0607@gmail.com', 'F', 'V', 'Casado', FALSE, 7, 4, 4, 6, 1, (SELECT num_parroquia FROM parroquias WHERE id_estado = 6 AND num_municipio = 1 AND nombre_parroquia = 'No suministrada'), 'Bolívar, caroni, San Felix', 'V-77777777'),
    ('V-25292732', 'Heidi Roxana', 'Ruiz Diaz', '2000-12-22', '04249725796', 'heidi78@gmail.com', 'F', 'V', 'Casado', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 2, 0, 6, 1, 7, 'Los olivos, calle palermo, parroquia universidad', 'V-77777777'),
    ('V-17633040', 'Daves', 'Martines', '1989-08-15', '04147641440', 'v-17633040@sin-correo.invalid', 'M', 'V', 'Casado', FALSE, 5, 2, 4, 6, 1, 5, 'Simón Bolívar, manoa, municipio caroni, estado Bolívar', 'V-77777777'),
    ('V-70000003', 'David', 'Girón', '1985-07-11', '04249527885', 'v-70000003@sin-correo.invalid', 'M', 'V', 'Casado', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 3, NULL, 6, 1, (SELECT num_parroquia FROM parroquias WHERE id_estado = 6 AND num_municipio = 1 AND nombre_parroquia = 'No suministrada'), 'Bolivar, Caroní, la churuata', 'V-77777777'),
    ('V-17885343', 'Alvarez Romero', 'Norus del Carmen', '1987-09-23', '04121873352', 'v-17885343@sin-correo.invalid', 'F', 'V', 'Casado', FALSE, 6, 4, 1, 6, 1, 3, 'Bolivar, caroni, dalla costa', 'V-77777777'),
    ('V-8923075', 'Maribeth Maigualidad', 'Ferrer Mata', '1968-06-03', '04249165260', 'v-8923075@sin-correo.invalid', 'F', 'V', 'Soltero', FALSE, 4, 2, 4, 6, 1, 7, 'Estado Bolivar, Municipio Caroni, Parroquia Universidad', 'V-77777777'),
    ('V-16945535', 'Giron Blanco', 'Dina del Valle', '1986-03-11', '04249186427', 'v-16945535@sin-correo.invalid', 'F', 'V', 'Casado', FALSE, 6, 2, 4, 6, 1, 6, 'Bolívar, Caroní, Unare', 'V-77777777'),
    ('V-11196085', 'Mauren Elias', 'Hernández Freites', '1973-07-11', '04141145236', 'v-11196085@sin-correo.invalid', 'F', 'V', 'Soltero', TRUE, 5, 4, NULL, 6, 1, 6, 'Bolivar, Caroní, unare', 'V-77777777'),
    ('V-6354427', 'Arisleda', 'Bejaramo', '1988-07-13', '04148985571', 'bejaramo32@gmail.com', 'F', 'V', 'Soltero', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 0, NULL, 6, 1, 7, 'Villa Africana, Parroquia universidad', 'V-77777777'),
    ('V-8497059', 'María Elena', 'Mendoza Reyes', '1964-09-07', '04124882076', 'v-8497059@sin-correo.invalid', 'F', 'V', 'Divorciado', FALSE, 3, 0, 1, 6, 1, (SELECT num_parroquia FROM parroquias WHERE id_estado = 6 AND num_municipio = 1 AND nombre_parroquia = 'No suministrada'), 'Jorge Hernández, José Félix Rivas primero de mayo, municipio caroni, Estado Bolívar', 'V-77777777'),
    ('V-14510483', 'Villafranca de Muñoz', 'Marielis Beatris', '1976-06-08', '04120277448', 'v-14510483@sin-correo.invalid', 'F', 'V', 'Casado', FALSE, 5, 2, 4, 6, 1, (SELECT num_parroquia FROM parroquias WHERE id_estado = 6 AND num_municipio = 1 AND nombre_parroquia = 'No suministrada'), 'Bolívar, Caroní, Castillito', 'V-77777777'),
    ('V-16698299', 'Keila Maria', 'Martinez Jaramillo', '1981-06-12', '04121183267', 'keilammartinezj12@gmail.com', 'F', 'V', 'Casado', FALSE, 4, 2, 4, 6, 1, 4, 'Estado Bolivar, Municipio Caroni, Parroquia 11 de Abril', 'V-77777777'),
    ('V-10927452', 'Marco Tulio', 'Cedeño Rodriguez', '1971-03-15', '04148821423', 'cedeñor2@gmail.com', 'M', 'V', 'Casado', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 0, NULL, 6, 1, (SELECT num_parroquia FROM parroquias WHERE id_estado = 6 AND num_municipio = 1 AND nombre_parroquia = 'No suministrada'), 'Caroni, Bolivar, Urbanización Mendoza, calle quirequire, casa 21 .', 'V-77777777'),
    ('V-13220768', 'Wilfredo', 'Gómez', '1977-02-22', '04148629866', 'v-13220768@sin-correo.invalid', 'M', 'V', 'Soltero', FALSE, 4, 2, 4, 6, 1, 7, 'Los olivos, parroquia universidad, municipio caroni, Estado Bolívar', 'V-77777777'),
    ('V-13121797', 'Bosque García', 'Morelys del Carmen', '1976-09-07', '04148608997', 'v-13121797@sin-correo.invalid', 'F', 'V', 'Soltero', FALSE, 4, 2, 4, 6, 1, (SELECT num_parroquia FROM parroquias WHERE id_estado = 6 AND num_municipio = 1 AND nombre_parroquia = 'No suministrada'), 'Bolívar, Caroní, La Unidad', 'V-77777777'),
    ('V-12876140', 'Torres Blanchard', 'Eyker Rafael', '1974-07-11', '04249139032', 'v-12876140@sin-correo.invalid', 'M', 'V', 'Casado', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 4, NULL, 6, 1, 6, 'Bolivar, Caroní, unare', 'V-77777777'),
    ('V-27955804', 'Daniel Alejandro', 'Poleo Ferrer', '1999-01-28', 'No suministrado', 'v-27955804@sin-correo.invalid', 'M', 'V', 'Soltero', FALSE, 4, 2, NULL, 6, 1, 7, 'Estado Bolivar, Municipio Caroni, Parroquia Universidad', 'V-77777777'),
    ('V-22918488', 'Davianny Alexandra', 'Pino Castillo', '1995-05-21', '04124643766', 'daviannycastillo37@gmail.com', 'M', 'V', 'Divorciado', FALSE, 4, 0, 1, 6, 1, (SELECT num_parroquia FROM parroquias WHERE id_estado = 6 AND num_municipio = 1 AND nombre_parroquia = 'No suministrada'), 'No suministro info', 'V-77777777'),
    ('V-12875324', 'Palma Martínez', 'Rosa Palma', '1974-08-26', '554799969523', 'palmamartinezrosa@gmail.com', 'F', 'V', 'Casado', FALSE, 6, 2, 4, 6, 1, (SELECT num_parroquia FROM parroquias WHERE id_estado = 6 AND num_municipio = 1 AND nombre_parroquia = 'No suministrada'), 'Santa Catarina, Brasil', 'V-77777777'),
    ('V-9945166', 'Migdalis', 'Gil', '1967-12-04', '041228091527', 'v-9945166@sin-correo.invalid', 'F', 'V', 'Casado', FALSE, 4, 0, NULL, 6, 1, 5, 'Estado Bolivar, Municipio Caroni, Parroquia Simon Bolivar', 'V-77777777'),
    ('V-6529420', 'Carmen Benilde', 'García de Lara', '1951-07-09', '04261956480', 'v-6529420@sin-correo.invalid', 'F', 'V', 'Casado', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 0, 1, 6, 1, (SELECT num_parroquia FROM parroquias WHERE id_estado = 6 AND num_municipio = 1 AND nombre_parroquia = 'No suministrada'), 'Bolivar, Pinto Sabina, San Félix', 'V-77777777'),
    ('V-11206007', 'Damelis Hestalida', 'Ramirez Barreto', '1972-04-18', '04249646943', 'v-11206007@sin-correo.invalid', 'F', 'V', 'Soltero', TRUE, 4, 0, 4, 6, 1, 6, 'Estado Bolivar, Municipio Caroni, Parroquia Unare', 'V-77777777'),
    ('V-20808116', 'Elizabeth García', 'Cova', '1992-07-06', 'No suministrado', 'elizagarciaa@gmail.con', 'F', 'V', 'Soltero', FALSE, 5, 2, NULL, 6, 1, 7, 'Bolivar, entre ríos, universidad', 'V-77777777'),
    ('V-8330445', 'Gladys Auristela', 'Cardoza de Alvarez', '1963-08-10', '04147605561', 'v-8330445@sin-correo.invalid', 'F', 'V', 'Casado', FALSE, 4, 4, 4, 6, 1, 3, 'Estado Bolivar, Municipio Caroni, Parroquia Dalla Costa', 'V-77777777'),
    ('V-9943357', 'Milagros', 'Hernández', '1959-02-10', '04249241344', 'v-9943357@sin-correo.invalid', 'F', 'V', 'Soltero', FALSE, 7, 0, 3, 6, 1, (SELECT num_parroquia FROM parroquias WHERE id_estado = 6 AND num_municipio = 1 AND nombre_parroquia = 'No suministrada'), 'Bella vista, San Félix, Municipio Caroni, Estado Bolívar', 'V-77777777'),
    ('V-80000010', 'Eugenio', 'Salcedo', '1990-01-01', '04148896273', 'v-80000010@sin-correo.invalid', 'M', 'V', 'Soltero', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), NULL, NULL, 6, 1, (SELECT num_parroquia FROM parroquias WHERE id_estado = 6 AND num_municipio = 1 AND nombre_parroquia = 'No suministrada'), NULL, 'V-77777777'),
    ('V-80000011', 'Eloisa', 'Moreno', '1990-01-01', '04121191807', 'v-80000011@sin-correo.invalid', 'F', 'V', 'Soltero', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), NULL, NULL, 6, 1, (SELECT num_parroquia FROM parroquias WHERE id_estado = 6 AND num_municipio = 1 AND nombre_parroquia = 'No suministrada'), NULL, 'V-77777777'),
    ('V-80000012', 'Maria José', 'de León', '1990-01-01', '04143947062', 'v-80000012@sin-correo.invalid', 'F', 'V', 'Casado', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), NULL, NULL, 6, 1, (SELECT num_parroquia FROM parroquias WHERE id_estado = 6 AND num_municipio = 1 AND nombre_parroquia = 'No suministrada'), NULL, 'V-77777777'),
    ('V-80000013', 'Eglis', 'Gonzalez', '1990-01-01', '04121802311', 'v-80000013@sin-correo.invalid', 'F', 'V', 'Soltero', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), NULL, NULL, 6, 1, (SELECT num_parroquia FROM parroquias WHERE id_estado = 6 AND num_municipio = 1 AND nombre_parroquia = 'No suministrada'), NULL, 'V-77777777'),
    ('V-80000001', 'Marlierys del Valle', 'Sulbaran Salavarria', '1990-01-01', '04263320070', 'v-80000001@sin-correo.invalid', 'F', 'V', 'Casado', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), NULL, NULL, 6, 1, (SELECT num_parroquia FROM parroquias WHERE id_estado = 6 AND num_municipio = 1 AND nombre_parroquia = 'No suministrada'), NULL, 'V-77777777'),
    ('V-80000002', 'Wilfredo', 'Acosta Garcia', '1990-01-01', '04262116674', 'v-80000002@sin-correo.invalid', 'M', 'V', 'Soltero', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), NULL, NULL, 6, 1, (SELECT num_parroquia FROM parroquias WHERE id_estado = 6 AND num_municipio = 1 AND nombre_parroquia = 'No suministrada'), NULL, 'V-77777777'),
    ('V-80000003', 'Juan Sergio Alejandro', 'Marin Guevara', '1990-01-01', '04249718443', 'v-80000003@sin-correo.invalid', 'M', 'V', 'Casado', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), NULL, NULL, 6, 1, (SELECT num_parroquia FROM parroquias WHERE id_estado = 6 AND num_municipio = 1 AND nombre_parroquia = 'No suministrada'), NULL, 'V-77777777'),
    ('V-80000004', 'Anibal Jose', 'Acosta', '1990-01-01', '04166870608', 'v-80000004@sin-correo.invalid', 'M', 'V', 'Soltero', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), NULL, NULL, 6, 1, (SELECT num_parroquia FROM parroquias WHERE id_estado = 6 AND num_municipio = 1 AND nombre_parroquia = 'No suministrada'), NULL, 'V-77777777'),
    ('V-80000005', 'Maria', 'Hidalgo', '1990-01-01', '04268905651', 'v-80000005@sin-correo.invalid', 'F', 'V', 'Divorciado', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), NULL, NULL, 6, 1, (SELECT num_parroquia FROM parroquias WHERE id_estado = 6 AND num_municipio = 1 AND nombre_parroquia = 'No suministrada'), NULL, 'V-77777777'),
    ('V-80000006', 'Rosalia Cristina', 'Gomez', '1990-01-01', '041268667029', 'v-80000006@sin-correo.invalid', 'F', 'V', 'Soltero', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), NULL, NULL, 6, 1, (SELECT num_parroquia FROM parroquias WHERE id_estado = 6 AND num_municipio = 1 AND nombre_parroquia = 'No suministrada'), NULL, 'V-77777777'),
    ('V-80000007', 'Wendy del Valle', 'Gularte Salaverria', '1990-01-01', '04164693707', 'v-80000007@sin-correo.invalid', 'F', 'V', 'Soltero', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), NULL, NULL, 6, 1, (SELECT num_parroquia FROM parroquias WHERE id_estado = 6 AND num_municipio = 1 AND nombre_parroquia = 'No suministrada'), NULL, 'V-77777777'),
    ('V-80000008', 'Elizabeth', 'Acosta', '1990-01-01', '04249242755', 'v-80000008@sin-correo.invalid', 'F', 'V', 'Soltero', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), NULL, NULL, 6, 1, (SELECT num_parroquia FROM parroquias WHERE id_estado = 6 AND num_municipio = 1 AND nombre_parroquia = 'No suministrada'), NULL, 'V-77777777'),
    ('V-80000009', 'Carmen Yraida', 'Forero', '1990-01-01', '04127804032', 'v-80000009@sin-correo.invalid', 'F', 'V', 'Soltero', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), NULL, NULL, 6, 1, (SELECT num_parroquia FROM parroquias WHERE id_estado = 6 AND num_municipio = 1 AND nombre_parroquia = 'No suministrada'), NULL, 'V-77777777');

INSERT INTO viviendas (cedula_solicitante, cant_habitaciones, cant_banos) VALUES
    ('V-14743490', 3, 3),
    ('V-20506378', 3, 2),
    ('V-13994561', 3, 1),
    ('V-18450908', 3, 1),
    ('V-70000001', 3, 1),
    ('V-12396754', 2, 1),
    ('V-6898353', 2, 1),
    ('V-11512882', 2, 1),
    ('V-15429858', 3, 2),
    ('V-14986003', 3, 1),
    ('V-8370445', 3, 1),
    ('V-19420603', 2, 1),
    ('V-18169044', 3, 1),
    ('V-9906226', 3, 2),
    ('V-18901921', 3, 1),
    ('V-5426329', 3, 2),
    ('V-23552118', 3, 3),
    ('V-70000002', 4, 2),
    ('V-26444583', 2, 1),
    ('V-9897125', 3, 1),
    ('V-17039236', 3, 1),
    ('E-868205', 3, 2),
    ('V-17750004', 3, 1),
    ('V-5545543', 3, 1),
    ('V-29543234', 2, 1),
    ('V-12594800', 2, 2),
    ('V-9319389', 3, 1),
    ('V-22824309', 2, 1),
    ('V-18916345', 3, 2),
    ('V-2933841', 3, 1),
    ('V-25292732', 3, 2),
    ('V-17633040', 2, 2),
    ('V-70000003', 2, 2),
    ('V-8923075', 3, 2),
    ('V-11196085', 2, 2),
    ('V-6354427', 3, 2),
    ('V-8497059', 3, 2),
    ('V-16698299', 4, 3),
    ('V-10927452', 3, 2),
    ('V-13220768', 3, 2),
    ('V-27955804', 3, 2),
    ('V-22918488', 1, 1),
    ('V-9945166', 4, 3),
    ('V-11206007', 4, 3),
    ('V-20808116', 2, 2),
    ('V-8330445', 4, 3),
    ('V-9943357', 3, 2);

INSERT INTO familias_y_hogares (cedula_solicitante, cant_personas, cant_trabajadores,
    cant_no_trabajadores, cant_ninos, cant_ninos_estudiando, jefe_hogar, ingresos_mensuales,
    id_nivel_educativo_jefe) VALUES
    ('V-14986003', 4, 2, 0, 0, 0, FALSE, 3500, 1),
    ('V-26444583', 4, 3, 0, 3, 2, TRUE, 2000, 2),
    ('E-868205', 4, 3, 1, 0, 0, TRUE, 300, 4),
    ('V-2933841', 2, 2, 0, 0, 0, TRUE, 1250, 1),
    ('V-19039786', 3, 2, 1, 1, 1, TRUE, 150, 7),
    ('V-25292732', 1, 1, 0, 0, 0, TRUE, 3500, 1),
    ('V-17633040', 2, 1, 0, 0, 0, TRUE, 11000, 3),
    ('V-70000003', 4, 1, 3, 0, 0, TRUE, 100, 5),
    ('V-11196085', 2, 2, 0, 0, 0, TRUE, 100, 5),
    ('V-10927452', 3, 1, 0, 0, 0, TRUE, 1800, 1),
    ('V-13121797', 3, 1, 2, 1, 1, TRUE, 150, 5),
    ('V-12876140', 4, 1, 2, 2, 2, TRUE, 200, 6),
    ('V-20808116', 4, 3, 1, 0, 0, FALSE, 100, 5);

INSERT INTO asignadas_a (cedula_solicitante, id_tipo_caracteristica, num_caracteristica) VALUES
    ('V-14743490', 1, 5),
    ('V-14743490', 2, 2),
    ('V-14743490', 3, 4),
    ('V-14743490', 4, 3),
    ('V-14743490', 5, 1),
    ('V-14743490', 6, 2),
    ('V-14743490', 7, 1),
    ('V-14743490', 8, 1),
    ('V-14743490', 8, 2),
    ('V-14743490', 8, 4),
    ('V-14743490', 8, 5),
    ('V-14743490', 8, 7),
    ('V-20506378', 1, 3),
    ('V-20506378', 2, 2),
    ('V-20506378', 3, 3),
    ('V-20506378', 4, 1),
    ('V-20506378', 5, 1),
    ('V-20506378', 6, 1),
    ('V-20506378', 7, 1),
    ('V-20506378', 8, 1),
    ('V-20506378', 8, 2),
    ('V-20506378', 8, 3),
    ('V-20506378', 8, 4),
    ('V-20506378', 8, 6),
    ('V-13994561', 1, 6),
    ('V-13994561', 2, 2),
    ('V-13994561', 3, 4),
    ('V-13994561', 4, 3),
    ('V-13994561', 5, 1),
    ('V-13994561', 6, 1),
    ('V-13994561', 7, 1),
    ('V-13994561', 8, 1),
    ('V-13994561', 8, 2),
    ('V-13994561', 8, 3),
    ('V-13994561', 8, 4),
    ('V-13994561', 8, 5),
    ('V-13994561', 8, 7),
    ('V-18450908', 1, 6),
    ('V-18450908', 2, 3),
    ('V-18450908', 3, 4),
    ('V-18450908', 4, 3),
    ('V-18450908', 5, 1),
    ('V-18450908', 6, 1),
    ('V-18450908', 7, 1),
    ('V-18450908', 8, 1),
    ('V-18450908', 8, 2),
    ('V-18450908', 8, 3),
    ('V-18450908', 8, 5),
    ('V-18450908', 8, 7),
    ('V-70000001', 1, 3),
    ('V-70000001', 2, 2),
    ('V-70000001', 3, 4),
    ('V-70000001', 4, 1),
    ('V-70000001', 5, 1),
    ('V-70000001', 6, 1),
    ('V-70000001', 7, 1),
    ('V-70000001', 8, 1),
    ('V-70000001', 8, 2),
    ('V-70000001', 8, 3),
    ('V-12396754', 1, 5),
    ('V-12396754', 2, 2),
    ('V-12396754', 3, 4),
    ('V-12396754', 4, 3),
    ('V-12396754', 5, 1),
    ('V-12396754', 6, 1),
    ('V-12396754', 7, 1),
    ('V-12396754', 8, 1),
    ('V-12396754', 8, 2),
    ('V-12396754', 8, 3),
    ('V-6898353', 1, 6),
    ('V-6898353', 2, 3),
    ('V-6898353', 3, 4),
    ('V-6898353', 4, 1),
    ('V-6898353', 5, 1),
    ('V-6898353', 6, 1),
    ('V-6898353', 7, 1),
    ('V-6898353', 8, 1),
    ('V-6898353', 8, 2),
    ('V-6898353', 8, 3),
    ('V-6898353', 8, 4),
    ('V-6898353', 8, 5),
    ('V-11512882', 1, 3),
    ('V-11512882', 2, 2),
    ('V-11512882', 3, 4),
    ('V-11512882', 4, 2),
    ('V-11512882', 5, 1),
    ('V-11512882', 6, 1),
    ('V-11512882', 7, 1),
    ('V-11512882', 8, 1),
    ('V-11512882', 8, 2),
    ('V-11512882', 8, 3),
    ('V-11512882', 8, 5),
    ('V-15429858', 1, 5),
    ('V-15429858', 2, 3),
    ('V-15429858', 3, 4),
    ('V-15429858', 4, 3),
    ('V-15429858', 5, 1),
    ('V-15429858', 6, 1),
    ('V-15429858', 7, 1),
    ('V-15429858', 8, 1),
    ('V-15429858', 8, 2),
    ('V-15429858', 8, 3),
    ('V-15429858', 8, 5),
    ('V-14986003', 1, 5),
    ('V-14986003', 2, 3),
    ('V-14986003', 3, 3),
    ('V-14986003', 4, 1),
    ('V-14986003', 5, 1),
    ('V-14986003', 6, 1),
    ('V-14986003', 7, 1),
    ('V-14986003', 8, 1),
    ('V-14986003', 8, 2),
    ('V-8370445', 1, 6),
    ('V-8370445', 2, 3),
    ('V-8370445', 3, 3),
    ('V-8370445', 4, 1),
    ('V-8370445', 5, 1),
    ('V-8370445', 6, 1),
    ('V-8370445', 7, 1),
    ('V-8370445', 8, 1),
    ('V-8370445', 8, 2),
    ('V-8370445', 8, 3),
    ('V-8370445', 8, 5),
    ('V-19420603', 1, 3),
    ('V-19420603', 2, 3),
    ('V-19420603', 3, 4),
    ('V-19420603', 4, 3),
    ('V-19420603', 5, 1),
    ('V-19420603', 6, 1),
    ('V-19420603', 7, 1),
    ('V-19420603', 8, 1),
    ('V-19420603', 8, 2),
    ('V-19420603', 8, 4),
    ('V-19420603', 8, 5),
    ('V-18169044', 1, 5),
    ('V-18169044', 2, 2),
    ('V-18169044', 3, 2),
    ('V-18169044', 4, 3),
    ('V-18169044', 5, 1),
    ('V-18169044', 6, 2),
    ('V-18169044', 7, 1),
    ('V-18169044', 8, 1),
    ('V-18169044', 8, 2),
    ('V-18169044', 8, 4),
    ('V-9906226', 1, 6),
    ('V-9906226', 2, 3),
    ('V-9906226', 3, 3),
    ('V-9906226', 4, 3),
    ('V-9906226', 5, 1),
    ('V-9906226', 6, 1),
    ('V-9906226', 7, 1),
    ('V-9906226', 8, 1),
    ('V-9906226', 8, 3),
    ('V-9906226', 8, 6),
    ('V-18901921', 1, 5),
    ('V-18901921', 2, 2),
    ('V-18901921', 3, 1),
    ('V-18901921', 4, 1),
    ('V-18901921', 5, 1),
    ('V-18901921', 6, 1),
    ('V-18901921', 7, 1),
    ('V-18901921', 8, 1),
    ('V-18901921', 8, 2),
    ('V-18901921', 8, 5),
    ('V-5426329', 1, 5),
    ('V-5426329', 2, 3),
    ('V-5426329', 3, 4),
    ('V-5426329', 4, 1),
    ('V-5426329', 5, 1),
    ('V-5426329', 6, 1),
    ('V-5426329', 7, 1),
    ('V-5426329', 8, 1),
    ('V-5426329', 8, 2),
    ('V-5426329', 8, 3),
    ('V-23552118', 1, 3),
    ('V-23552118', 2, 2),
    ('V-23552118', 3, 4),
    ('V-23552118', 4, 1),
    ('V-23552118', 5, 1),
    ('V-23552118', 6, 1),
    ('V-23552118', 7, 2),
    ('V-23552118', 8, 1),
    ('V-23552118', 8, 2),
    ('V-23552118', 8, 3),
    ('V-23552118', 8, 4),
    ('V-70000002', 1, 3),
    ('V-70000002', 2, 3),
    ('V-70000002', 3, 1),
    ('V-70000002', 4, 3),
    ('V-70000002', 5, 1),
    ('V-70000002', 6, 1),
    ('V-70000002', 7, 1),
    ('V-70000002', 8, 1),
    ('V-70000002', 8, 2),
    ('V-70000002', 8, 4),
    ('V-70000002', 8, 5),
    ('V-26444583', 1, 5),
    ('V-26444583', 2, 2),
    ('V-26444583', 3, 1),
    ('V-26444583', 4, 3),
    ('V-26444583', 5, 2),
    ('V-26444583', 6, 1),
    ('V-26444583', 7, 1),
    ('V-26444583', 8, 1),
    ('V-26444583', 8, 3),
    ('V-26444583', 8, 4),
    ('V-9897125', 1, 3),
    ('V-9897125', 2, 4),
    ('V-9897125', 3, 4),
    ('V-9897125', 4, 1),
    ('V-9897125', 5, 1),
    ('V-9897125', 6, 1),
    ('V-9897125', 7, 1),
    ('V-9897125', 8, 1),
    ('V-9897125', 8, 2),
    ('V-9897125', 8, 5),
    ('V-17039236', 1, 5),
    ('V-17039236', 2, 2),
    ('V-17039236', 3, 3),
    ('V-17039236', 4, 2),
    ('V-17039236', 5, 1),
    ('V-17039236', 6, 1),
    ('V-17039236', 7, 1),
    ('V-17039236', 8, 1),
    ('V-17039236', 8, 3),
    ('E-868205', 1, 5),
    ('E-868205', 2, 3),
    ('E-868205', 3, 4),
    ('E-868205', 4, 2),
    ('E-868205', 5, 2),
    ('E-868205', 6, 2),
    ('E-868205', 7, 1),
    ('E-868205', 8, 1),
    ('E-868205', 8, 2),
    ('E-868205', 8, 3),
    ('V-17750004', 1, 5),
    ('V-17750004', 2, 2),
    ('V-17750004', 3, 3),
    ('V-17750004', 4, 1),
    ('V-17750004', 5, 1),
    ('V-17750004', 6, 1),
    ('V-17750004', 7, 1),
    ('V-17750004', 8, 1),
    ('V-17750004', 8, 2),
    ('V-17750004', 8, 6),
    ('V-5545543', 1, 9),
    ('V-5545543', 2, 2),
    ('V-5545543', 3, 3),
    ('V-5545543', 4, 2),
    ('V-5545543', 5, 1),
    ('V-5545543', 6, 2),
    ('V-5545543', 8, 1),
    ('V-29543234', 1, 6),
    ('V-29543234', 2, 2),
    ('V-29543234', 3, 3),
    ('V-29543234', 4, 2),
    ('V-29543234', 5, 2),
    ('V-29543234', 6, 2),
    ('V-29543234', 7, 1),
    ('V-29543234', 8, 1),
    ('V-29543234', 8, 7),
    ('V-12594800', 1, 4),
    ('V-12594800', 2, 3),
    ('V-12594800', 3, 4),
    ('V-12594800', 4, 3),
    ('V-12594800', 5, 1),
    ('V-12594800', 6, 3),
    ('V-12594800', 7, 1),
    ('V-12594800', 8, 1),
    ('V-12594800', 8, 2),
    ('V-12594800', 8, 3),
    ('V-12594800', 8, 4),
    ('V-12594800', 8, 5),
    ('V-12594800', 8, 6),
    ('V-12594800', 8, 7),
    ('V-9319389', 1, 6),
    ('V-9319389', 2, 2),
    ('V-9319389', 3, 1),
    ('V-9319389', 4, 1),
    ('V-9319389', 5, 1),
    ('V-9319389', 6, 1),
    ('V-9319389', 7, 1),
    ('V-9319389', 8, 1),
    ('V-9319389', 8, 2),
    ('V-22824309', 1, 5),
    ('V-22824309', 2, 3),
    ('V-22824309', 3, 3),
    ('V-22824309', 4, 2),
    ('V-22824309', 5, 1),
    ('V-22824309', 6, 2),
    ('V-22824309', 7, 1),
    ('V-22824309', 8, 1),
    ('V-22824309', 8, 2),
    ('V-18916345', 1, 3),
    ('V-18916345', 2, 3),
    ('V-18916345', 3, 4),
    ('V-18916345', 4, 3),
    ('V-18916345', 5, 1),
    ('V-18916345', 6, 1),
    ('V-18916345', 7, 1),
    ('V-18916345', 8, 1),
    ('V-18916345', 8, 2),
    ('V-18916345', 8, 5),
    ('V-2933841', 1, 6),
    ('V-2933841', 2, 2),
    ('V-2933841', 3, 3),
    ('V-2933841', 4, 2),
    ('V-2933841', 5, 1),
    ('V-2933841', 6, 1),
    ('V-2933841', 7, 1),
    ('V-2933841', 8, 1),
    ('V-2933841', 8, 2),
    ('V-25292732', 1, 5),
    ('V-25292732', 2, 2),
    ('V-25292732', 3, 1),
    ('V-25292732', 4, 1),
    ('V-25292732', 5, 1),
    ('V-25292732', 6, 1),
    ('V-25292732', 7, 1),
    ('V-25292732', 8, 1),
    ('V-17633040', 1, 4),
    ('V-17633040', 2, 2),
    ('V-17633040', 3, 4),
    ('V-17633040', 4, 3),
    ('V-17633040', 5, 1),
    ('V-17633040', 6, 1),
    ('V-17633040', 7, 1),
    ('V-17633040', 8, 1),
    ('V-17633040', 8, 2),
    ('V-70000003', 1, 4),
    ('V-70000003', 2, 2),
    ('V-70000003', 3, 4),
    ('V-70000003', 4, 3),
    ('V-70000003', 5, 1),
    ('V-70000003', 6, 3),
    ('V-70000003', 7, 1),
    ('V-70000003', 8, 1),
    ('V-70000003', 8, 2),
    ('V-70000003', 8, 3),
    ('V-8923075', 1, 3),
    ('V-8923075', 2, 3),
    ('V-8923075', 3, 4),
    ('V-8923075', 4, 3),
    ('V-8923075', 5, 1),
    ('V-8923075', 6, 1),
    ('V-8923075', 7, 1),
    ('V-8923075', 8, 1),
    ('V-8923075', 8, 2),
    ('V-8923075', 8, 5),
    ('V-11196085', 1, 4),
    ('V-11196085', 2, 2),
    ('V-11196085', 3, 4),
    ('V-11196085', 4, 3),
    ('V-11196085', 5, 1),
    ('V-11196085', 6, 3),
    ('V-11196085', 7, 1),
    ('V-11196085', 8, 1),
    ('V-11196085', 8, 2),
    ('V-11196085', 8, 3),
    ('V-11196085', 8, 5),
    ('V-6354427', 1, 6),
    ('V-6354427', 2, 3),
    ('V-6354427', 3, 3),
    ('V-6354427', 4, 1),
    ('V-6354427', 5, 1),
    ('V-6354427', 6, 1),
    ('V-6354427', 7, 1),
    ('V-6354427', 8, 1),
    ('V-6354427', 8, 2),
    ('V-8497059', 1, 5),
    ('V-8497059', 2, 3),
    ('V-8497059', 3, 4),
    ('V-8497059', 4, 3),
    ('V-8497059', 5, 1),
    ('V-8497059', 6, 1),
    ('V-8497059', 7, 1),
    ('V-8497059', 8, 1),
    ('V-16698299', 1, 5),
    ('V-16698299', 2, 2),
    ('V-16698299', 3, 4),
    ('V-16698299', 4, 3),
    ('V-16698299', 5, 1),
    ('V-16698299', 6, 1),
    ('V-16698299', 7, 1),
    ('V-16698299', 8, 1),
    ('V-16698299', 8, 2),
    ('V-16698299', 8, 4),
    ('V-10927452', 1, 6),
    ('V-10927452', 2, 3),
    ('V-10927452', 3, 4),
    ('V-10927452', 4, 3),
    ('V-10927452', 5, 1),
    ('V-10927452', 6, 1),
    ('V-10927452', 7, 1),
    ('V-10927452', 8, 2),
    ('V-10927452', 8, 3),
    ('V-13220768', 1, 2),
    ('V-13220768', 2, 3),
    ('V-13220768', 3, 4),
    ('V-13220768', 4, 3),
    ('V-13220768', 5, 1),
    ('V-13220768', 6, 1),
    ('V-13220768', 7, 1),
    ('V-13220768', 8, 1),
    ('V-13220768', 8, 2),
    ('V-27955804', 1, 3),
    ('V-27955804', 2, 3),
    ('V-27955804', 3, 4),
    ('V-27955804', 4, 3),
    ('V-27955804', 5, 1),
    ('V-27955804', 6, 1),
    ('V-27955804', 7, 1),
    ('V-27955804', 8, 1),
    ('V-27955804', 8, 2),
    ('V-27955804', 8, 5),
    ('V-22918488', 1, 5),
    ('V-22918488', 2, 1),
    ('V-22918488', 3, 3),
    ('V-22918488', 4, 2),
    ('V-22918488', 5, 1),
    ('V-22918488', 6, 2),
    ('V-22918488', 7, 1),
    ('V-22918488', 8, 1),
    ('V-9945166', 1, 2),
    ('V-9945166', 2, 3),
    ('V-9945166', 3, 4),
    ('V-9945166', 4, 3),
    ('V-9945166', 5, 1),
    ('V-9945166', 6, 1),
    ('V-9945166', 7, 1),
    ('V-9945166', 8, 1),
    ('V-9945166', 8, 2),
    ('V-9945166', 8, 5),
    ('V-11206007', 1, 2),
    ('V-11206007', 2, 3),
    ('V-11206007', 3, 4),
    ('V-11206007', 4, 3),
    ('V-11206007', 5, 1),
    ('V-11206007', 6, 1),
    ('V-11206007', 7, 1),
    ('V-11206007', 8, 1),
    ('V-11206007', 8, 2),
    ('V-11206007', 8, 4),
    ('V-11206007', 8, 5),
    ('V-20808116', 1, 3),
    ('V-20808116', 2, 2),
    ('V-20808116', 3, 4),
    ('V-20808116', 4, 3),
    ('V-20808116', 5, 1),
    ('V-20808116', 6, 1),
    ('V-20808116', 7, 1),
    ('V-20808116', 8, 1),
    ('V-20808116', 8, 2),
    ('V-20808116', 8, 4),
    ('V-20808116', 8, 6),
    ('V-8330445', 1, 2),
    ('V-8330445', 2, 3),
    ('V-8330445', 3, 4),
    ('V-8330445', 4, 3),
    ('V-8330445', 5, 1),
    ('V-8330445', 6, 1),
    ('V-8330445', 7, 1),
    ('V-8330445', 8, 1),
    ('V-8330445', 8, 2),
    ('V-8330445', 8, 5),
    ('V-9943357', 1, 5),
    ('V-9943357', 2, 2),
    ('V-9943357', 3, 4),
    ('V-9943357', 4, 3),
    ('V-9943357', 5, 1),
    ('V-9943357', 6, 1),
    ('V-9943357', 7, 1),
    ('V-9943357', 8, 1)
ON CONFLICT DO NOTHING;

-- Los casos se insertan de uno en uno para poder colgarles su estatus:
-- el trigger trigger_crear_cambio_estatus_inicial ya crea el primer
-- cambio de estatus, así que aquí solo se corrige cuando el libro dice
-- que el caso se cerró o quedó en pausa.
DO $carga$
DECLARE v_id INTEGER; v_term VARCHAR(20);
BEGIN
    -- UCAB Guayana · GY24-25/01 · Francimar Gamboa
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-09-13', '2024-09-13', 'Asesoría', 'Acude a consulta preguntando que  si es posible que su socio que a su vez es su esposo, puede administrar deliberadamente las compañias que tienen en común.
Responsable según el control de casos: prof Minelvis Martinez', 7, 'V-12679398', 6, 0, 0, 4, 'V-77777777', '2024-09-13')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO supervisa (term, cedula_profesor, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000001', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se le brindó la asesoría indicandole el régimen jurídico aplicable; entendiendo que no puede administar deliberadamente las compañias', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2024-09-13', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-09-13',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/02 · Mayerlin Coa
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-09-26', '2024-09-26', 'Asistencia Judicial - Casos externos', 'Acude a consulta porque se divorció en Chile y su matrimonio se realizó en Venezuela, quiere saber como hacer valer en Venezuela la sentencia de Divorcio
Responsable según el control de casos: Prof Minelvis Martinez', 7, 'V-26444583', 1, 1, 1, 4, 'V-77777777', '2025-06-04')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO supervisa (term, cedula_profesor, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000001', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se le indicó que la figura aplicable es el exequatur que no es mas que solicitar la ejecutoria de la sentencia extranjera en Venezuela; se le indicaron los recaudos a consignar: Sentencia de divorcio legalizada y apostillada', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2024-09-26', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'En fecha 06/02/25 se le envió mensaje vía WhastApp solicitando manifieste si dará continuidad a su solicitud. Manifestó estar en Chile que a su regreso continuará con la solicitud', NULL,
            '2025-02-06', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (3, v_id, 'en fecha 04/06/25 nos comunicamos vías whatsApp para saber si viene al país, indicó que regresa el proximo año por lo que se procede a cerrar el caso, se le indicó que cuando guste puede acudir nuevamente al servicio', NULL,
            '2025-06-04', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-06-04',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/03 · Kerenis Sánchez
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-09-29', '2024-09-29', 'Redacción documentos y/o convenio', 'Acude a consulta porque tiene un poder especial de su ex conyuge y necesita representarlo en un tema relacionado a un arrendamiento de vivienda
Responsable según el control de casos: Prof Minelvis Martínez', 7, 'V-9897125', 1, 0, 3, 1, 'V-77777777', '2024-09-29')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO supervisa (term, cedula_profesor, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000001', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se le indicó que el poder es valido porque a pesar de ser especial contiene facutlades para representarlo en esa materia. adicionalmente se le indicó que a futuro debe enviar un poder general de administración y dispoción su representado para que maneje otros tema (sucesiones y otros) de interes del poderdante.', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2024-09-29', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-09-29',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/04 · Jhony Salaberría
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-10-01', '2024-10-01', 'Asistencia Judicial - Casos externos', 'Acude a consulta porque quiere divorciarse por mutuo acuerdo, sin embargo, por la situación de tensión entre el y su conyuge pronostica que no será posible por esta via
Responsable según el control de casos: José Matias Araguayan/ Vincenzo Altobelli', 7, 'V-17039236', 1, 1, 1, 8, 'V-77777777', '2024-10-09')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000004', v_id, 'V-77777777');
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000005', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se le brindó la asesoria, se tomó nota del telefono de la conyuge para comunicarnos con ella para intentar un acuerdo.', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2024-10-01', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'En fecha 01/10/2024 se le llamo y no se obtuvo comunicación por lo que se le envió un mensaje vía WhatsApp el cual no tuvo respuesta; se envió un nuevo mensaje en fecha 07/10/2024 al cual respondió que ya tenia un abogado encargado del caso', NULL,
            '2024-10-01', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (3, v_id, 'En fecha 07/10/2024 llamó el abogado de la conyuge Yenfri Guzman con quien se conversó, asimismo, se conversó con el sr Jhonny para explicar la situación y compartir el número de celular del abogado', NULL,
            '2024-10-07', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (4, v_id, 'En fecha 09/10/2024 acude a la oficia el Sr Jhonni se le devolvieron sus documentos y se le indicó que debe mediar con el abogado de su conyuge; estaremos atentos a cualquier asesoria adicional que requiera', NULL,
            '2024-10-09', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-10-09',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/05 · Yohannys Gonzalez
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-10-01', '2024-10-01', 'Asistencia Judicial - Casos externos', 'Acude a consulta porque quiere divorciarse  y el esposo vive en Guasipati más sin embargo, esta de acuerdo
Responsable según el control de casos: José Matias Araguayan/ Vincenzo Altobelli/ redacción: Edgar', 7, 'V-17750004', 1, 1, 1, 8, 'V-77777777', '2024-12-11')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000004', v_id, 'V-77777777');
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000005', v_id, 'V-77777777');
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000003', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se le brindó la asesoría y se le indicaron los recaudos a consginar', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2024-10-01', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'En fecha 02/10/2024 consigó copia del acta de matrimonio, cédula de identidad de ella y su partida de nacimiento. Se pudo evidenciar al revisar la documentación que existe un error de cédula de la señora por lo que se indicó asistir al Registro y verificar el libro de actas.', NULL,
            '2024-10-02', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (3, v_id, 'En fecha 9/10/2024 acudió a la oficina la sra Jhoanny y presentó acta de matrimonio en original por lo que se procedió a escanear y enviar de respaldo al correo de clinica', NULL,
            '2024-10-09', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (4, v_id, 'En fecha 02/12/24 se verifció que el conyugé no da respuesta a nuestro mensaje y la sra solicita que se introduzca una demanda, por lo que se le indicó que no llevamos casos contenciosos por lo que la remitimos a la Defensa pública o que contrate un abogado privado', NULL,
            '2024-12-02', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (5, v_id, 'En fecha 11/12 se citó a las partes a tribunales pero el conyuge no asistió el conyuge; se llamara nuevamente en enero', NULL,
            '2024-12-11', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-12-11',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/06 · Mélida Rodríguez
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-10-01', '2024-10-01', 'Redacción documentos y/o convenio', 'Acude a consulta porque actualizar un documento de compra-venta que se le redactó en el 2019 por esta oficina porque nunca lo llevo al registro
Responsable según el control de casos: José Matias Araguayan/ Nazaret Moorley', 7, 'V-9319389', 1, 0, 3, 2, 'V-77777777', '2024-10-25')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000004', v_id, 'V-77777777');
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000013', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se revisó la información suministrada, se actualizó el documento, está por impresión', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2024-10-01', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'En fecha 25/10/2024 se entregó el documento solicitado', NULL,
            '2024-10-25', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-10-25',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/07 · Cristina Nicklas
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-10-01', '2024-10-01', 'Asesoría', 'Acude a consulta porque su ahijada que vive en Perú; utlizó nuestros servicios en 2022 y obtuvo un ejercicio unilateral de patria potestad con relación a su hija; llegado el momento de viajar fuera de Perú no le permitieron viajar indicando que el documento era insuficiente
Responsable según el control de casos: José Matías Araguayan', 7, 'V-2933841', 6, 0, 0, 4, 'V-77777777', '2024-10-08')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000004', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se le brindó la asesoría y se consultó al profesor especialista en niños y adolescentes; adicionalmente se consultó a egresados en Perú, no obteninedo mayor información; con investigación a través de un familiar se pudo identificar que se requiere notariar (en Perú) y luego enviar a Relaciones exteriores para que pueda hacer uso efectivo del ejercicio unilateral en dicho país.Todo el proceso debe realizarse en Peru.', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2024-10-01', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'En fecha 08/10/2024 acude a la oficina para indicar que logró identificar que la solución al caso debe cumplir sus tramites en Perú: a pesar de estar legalizado y apostillado el documento desde Venezuela debe ser notariado en Perú y enviar a Relaciones exteriores.', NULL,
            '2024-10-08', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-10-08',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/08 · Heidi Ruiz
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-10-02', '2024-10-02', 'Asistencia Judicial - Casos externos', 'Acude a consulta porque se quiere divorciar; se caso en 2021, no tienen hijos y ya cada parte vive en residencias separadas. Ambas partes estan de acuerdo en realizar la solicitud
Responsable según el control de casos: Yuliana Pereira/ Edgar Dunn', 7, 'V-25292732', 1, 1, 2, 18, 'V-77777777', '2024-12-03')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000006', v_id, 'V-77777777');
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000003', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se le brindó la asesoria; consigó copias de las cédulas de identidad de ambos; se le indicó traer o enviar vía correo el acta de matrimonio.', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2024-10-02', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'En fecha 09/10/2024 acudió el conyugé Daniel Viloria quien consignó copia de la cedula de identidad y se escaneo el acta de matrimonio; manifestó esta de acuerdo con realizar la solicitud de divorcio', NULL,
            '2024-10-09', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (3, v_id, 'En fecha 19/11/2024 se presentó la solicitud de Divorcio ante la URDD de Municipio Distribución Nro. 1884', NULL,
            '2024-11-19', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (4, v_id, 'En fecha 26/11/24 se verificó la distribución correspondiendole el conocimiento al tribunal 2do de Municipio', NULL,
            '2024-11-26', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (5, v_id, 'En fecha 03/12/24 Fue admitido', NULL,
            '2024-12-03', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-12-03',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/09 · Georgina Bejarano
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-10-03', '2024-10-03', 'Conciliación y Mediación', 'Acude a consuta porque vive en un edificio junto a su esposo y 2 hijas (19 y 16 años de edad) y su vecino del piso superior perturba las horas del sueño con ruidos molestos a altas horas de la noche; ha conversado con el vecino sobre esta situación en reiteradas oportunidades pero ha hecho caso omiso
Responsable según el control de casos: prof Minelvis Martínez', 7, 'V-14986003', 6, 0, 0, 1, 'V-77777777', '2024-10-21')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO supervisa (term, cedula_profesor, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000001', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se le brindó la asesoria y se le indicó enviar una carta a la Junta de Condominio para que hagan valer las normas de convivencia del edificio y de caso contrario acudir a la Poilica para un posible acto conciliatorio o acudir a fiscalia', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2024-10-03', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'consultar con egresade de fiscalia', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2024-10-03', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (3, v_id, 'En fecha 21/10/2024 Se le indicó elevó la consulta a la egresada Paula Castillejo (quien trabaja en fiscalía) indicó que puede colocar la denuncia por perturbación ó por contaminación sonica', NULL,
            '2024-10-21', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-10-21',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/10 · Arisleida Bejarano
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-10-03', '2024-10-03', 'Redacción documentos y/o convenio', 'Acude a consulta porque va a emigrar y desea dejar a un familiar encargada de sus bienes en Venezuela
Responsable según el control de casos: prof. Minelvis Martínez', 7, 'V-6354427', 1, 0, 3, 8, 'V-77777777', '2024-10-31')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO supervisa (term, cedula_profesor, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000001', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se le brindó la asesoria y se redactaron tanto un poder para ella como para su hijo', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2024-10-03', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'En fecha 31/10/24 se entregaron los 2 poderes', NULL,
            '2024-10-31', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-10-31',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/11 · Frolian Aguilera
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-09-19', '2024-09-19', 'Asistencia Judicial - Casos externos', 'Escribe vía WhastApp porque tiene un expediente abierto en Tribunales por su divorcio y el abogado se murió por lo que quiere apoyo para finalizar su caso
Responsable según el control de casos: Mathias / Vincenzo', 7, 'V-18916345', 1, 1, 1, 8, 'V-77777777', '2024-12-16')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000004', v_id, 'V-77777777');
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000005', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se revisará el expediente FP11-J-2023-713 del tribunal 6to; para conocer su status y decidir el paso a seguir.', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2024-09-19', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'En fecha 5/11 se diligenció solicitando se realice la ntoficación digital', NULL,
            '2024-11-05', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (3, v_id, 'En fecha 12/11 se solicitó revisar el expediente y lo tenian la asistente para trabajo', NULL,
            '2024-11-12', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (4, v_id, 'En fecha 04/12/24 la conyuge informa que recibió boleta de notificación', NULL,
            '2024-12-04', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (5, v_id, 'En fecha 16/12/24 se revisió ele xpediente y le fue fijada la dueincia de mediación para el día 26 de diciembre de 2024 a las 12:00 m', NULL,
            '2024-12-16', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-12-16',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/12 · Eugenio Salcedo
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-10-08', '2024-10-08', 'Asesoría', 'Acude a consulta porque su sobrino fue detenido en su lugar de trabajo a razón del apagón nacional (corpoelec) ysolo se sabe que fue trasladado a caracas
Responsable según el control de casos: José Matías Araguayan/Vincezo Altobelli; Profesor Colaborador: Roberto Delgado', 7, 'V-80000010', 6, 0, 0, 2, 'V-77777777', '2024-10-17')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO supervisa (term, cedula_profesor, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000002', v_id, 'V-77777777');
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000004', v_id, 'V-77777777');
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000005', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se le brindó la asesoria básicoa y luego se contactó al  profesor especialista Roberto Delgado; se le pondra en comunicación con la ONG Foro Penal', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2024-10-08', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'En fecha 17/10/2024 se conversó con el profesor Vincenti quien indicó que la única via es hacer denuncias públicas por la violación al debido proceso y que se apoye con Foro Penal Caracas', NULL,
            '2024-10-17', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-10-17',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/13 · Maribeth Ferrer
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-10-14', '2024-10-14', 'Redacción documentos y/o convenio', 'Solicta asesoría vía WhastApp la realización de un  poder general amplio para delegar a sus familares ya que se va del país
Responsable según el control de casos: José Matías Araguayan/Vincezo Altobelli', 7, 'V-8923075', 1, 0, 3, 8, 'V-77777777', '2024-10-22')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000004', v_id, 'V-77777777');
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000005', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'En fecha 22/10/2024 se entregó el documento solicitado', NULL,
            '2024-10-22', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-10-22',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/14 · Keila Martinez
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-10-16', '2024-10-16', 'Asistencia Judicial - Casos externos', 'La señora Keila se quiere divorciar, el actual conyugue esta de acuerdo, el conyuge vive en la ciudad de Carupano, tienen 2  hijos mayores de edad
Responsable según el control de casos: Edgar Dunn/ Victoria Pereira', 7, 'V-16698299', 1, 1, 2, 18, 'V-77777777', '2025-03-07')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000003', v_id, 'V-77777777');
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000007', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'En fecha 08/11/2024 la sra Keila indicó que lo por este año el conyuge no puede venir de Carupano a firmar la solcitud de divorcio ante el tribunal competente', NULL,
            '2024-11-08', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'En fecha 11/02/25 se presentó solicitud de divorcio; en el URDD de Municipio Nro. 2553', NULL,
            '2025-02-11', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (3, v_id, 'Exp Nro 9372-25 Tribunal 3ero de Municipio', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-02-11', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (4, v_id, 'En fecha 05/03/25 Se consigno boleta firmada del fiscal', NULL,
            '2025-03-05', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (5, v_id, 'En fecha 07/03/25 El fiscal consigno opinión favorable', NULL,
            '2025-03-07', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-03-07',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/15 · Daniel Ferrer
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-10-16', '2024-10-16', 'Redacción documentos y/o convenio', 'Solicta asesoría vía WhastApp la realización de un  poder general amplio para delegar a sus familares ya que se va del país
Responsable según el control de casos: José Matías Araguayan/Vincezo Altobelli', 7, 'V-27955804', 1, 0, 3, 8, 'V-77777777', '2024-10-22')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000004', v_id, 'V-77777777');
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000005', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'En fecha 22/10/2024 se entregó el documento solicitado', NULL,
            '2024-10-22', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-10-22',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/16 · Migdalis Gil
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-10-21', '2024-10-21', 'Redacción documentos y/o convenio', 'Solicita asesoría vía  whatsap para  la elaboracion de un contrato de arrendamiento de una ubicada en San Felix, urb Manoa.
Responsable según el control de casos: José Matías Araguayan/Vincezo Altobelli', 7, 'V-9945166', 1, 0, 3, 1, 'V-77777777', '2024-12-04')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000004', v_id, 'V-77777777');
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000005', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se redactó documento conforme a los requerimientos del solicitante y en fecha 04/12/24 le fue entregado', NULL,
            '2024-12-04', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-12-04',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/17 · Damelis Ramirez
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-10-29', '2024-10-29', 'Asistencia Judicial - Casos externos', 'Acude a consulta porque se caso en el año 1988, manifestó que no convivió con el y desconoce su paradero por lo que quisiera divorciarse; consigna copia de acta de matrimonio y copia de su cédula de identidad
Responsable según el control de casos: Vincenzo Altobelli/ Edidson Lozano', 7, 'V-11206007', 1, 1, 1, 8, 'V-77777777', NULL)
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000005', v_id, 'V-77777777');
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000009', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se suguiere buscar información relativa al paradedo del conyuge Winer a través de algun familiar', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2024-10-29', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'En fecha 19/11/24 se llamó a la sra. Damelis y se le indicó que debe buscar información del paradero del señor, ella va a buscar la información y debemos llamarle nuevamente la proxima semana', NULL,
            '2024-11-19', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (3, v_id, 'En fecha 06/02/25 Se le envió mensaje vía whastApp preguntado si obtuvo información sobre su conyuge', NULL,
            '2025-02-06', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (4, v_id, 'En fecha 07/02/25 la solicitante respondió el mensaje indicando que no ha obtenido información alguna', NULL,
            '2025-02-07', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (5, v_id, 'En fecha 29/04/25 la sra Damelis escribió via WhastApp e informa que consiguió al Sr Winer quien se encuentra un poco delicado de salud pero si esta 
 disponible para firmar la solicitud  por lo que se reabre el caso y se le asigna al estudiante Edison lozano', NULL,
            '2025-04-29', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'En pausa según el control de casos 2024-2025', 'En proceso', '2025-04-29',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/18 · Marco Tulio Cedeño Rodriguez
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-10-29', '2024-10-29', 'Redacción documentos y/o convenio', 'Acude a consulta porque quiere vender una casa ubicada en el barrio Pinto Salina de San Félix; el mencionado bien inmueble le pertenecía a su madre (quien fallecio); más sin embargo, ellos tienen un titulo supletorio  a nombre de todos los hijos
Responsable según el control de casos: Vincenzo Altobelli', 7, 'V-10927452', 1, 0, 3, 2, 'V-77777777', '2024-12-20')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000005', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se le indicaron los reacudos a consignar para verificar la situación y posible redacción de documento.', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2024-10-29', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'En fecha 19/11/24 se conversó con el sr Marco indicandose que el titulo supletorio que disponen en orden pero debe realizarse trámite ante CVG Bienes Inmuebles para poder realizar venta de la bienhechuria', NULL,
            '2024-11-19', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (3, v_id, 'En fecha 20/12/24 despues de varias conversaciones vía telefónica con el solicitante; se decidió realizar un documento de compra-venta privado para respaldar el pago del monto de venta; se les indicó los riesgos legales en este sentido y manifesto tomarlo.', NULL,
            '2024-12-20', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (4, v_id, 'En fecha 20/12/24 se le entregó el documento', NULL,
            '2024-12-20', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-12-20',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/19 · Morelys Del Carmen Bosque García
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-10-29', '2024-10-29', 'Redacción documentos y/o convenio', 'Acude a consulta porque su sobrino le pidió que sacara titulo supletorio sobre casa que fuere de su grupo familiar presentó titulo supletorio a favor de los tios de la solcitante y no hay pruebas de que el sobrino Manuel pagó a los tios 2do dinero por la compra de la casa; actualmente el joven Manuel Garcia se encuentra fuera del país.
Responsable según el control de casos: José Matías Araguayan/Vincezo Altobelli', 7, 'V-13121797', 1, 0, 3, 2, 'V-77777777', '2024-11-06')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000004', v_id, 'V-77777777');
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000005', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'En fecha 06/11/24 se atendió a la sra Morelys y se le explicó que no es factible obtener un titulo supletorio a favor del sobrino porque no dejo poder; además de que el joven esta solicitado por la justicia; se le sugirió acudir a la alcadía (quien custodia los terrenos del sector) para solicitar autorización para hacer titulo supletorio a favor de ella u otros familaires', NULL,
            '2024-11-06', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-11-06',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/20 · Rosa Palma / Oswardo Herrera
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-10-21', '2024-10-21', 'Asistencia Judicial - Casos externos', 'Escribe vía correo electrónico 21/10/24 y explica su necesidad de divorciarse; expresó que en un periodo de atención anterior habia sido atendida pero el conyuge se negó a firmar y ella se fue al país vecino Brasil; ahora despúes de tanto mediar con el conyuge llegaron a un acuerdo y si se realizará la soliciud de divorcio
Responsable según el control de casos: Nazaret Moorley', 7, 'V-12875324', 1, 1, 1, 8, 'V-77777777', '2025-02-13')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000013', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se le brindó la asesoria; se verifió la base datos y se procedió a reestucturar el escrito dado que la señora se encuentra fuera del país; queda pendiente el coordinar con el conyuge para la presentación en el tribunal; se utilizará la vía de divorcio por desafecto con notificación digital', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2024-10-21', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'En fecha 12/12/2024 no se ha logrado comunicación con el conyuge', NULL,
            '2024-12-12', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (3, v_id, 'En fecha 03/02/25 la sra Rosa manifiesta querer retomar el caso y  suministra nuevo número del conuyge', NULL,
            '2025-02-03', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (4, v_id, 'En fecha 03/02/25 nos comunicamos con el sr Oswardo quien manifestó estar de acuerdo en presentar la solicitud de divorcio, tiene disponibilidad para la semana del 10 al 14 de febrero', NULL,
            '2025-02-03', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (5, v_id, 'En fecha 13/02/25 se presentó solicitud individual de divorcio por el conyuge oswardo Herrera', NULL,
            '2025-02-13', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-02-13',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/21 · Senaira Marquez
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-11-06', '2024-11-06', 'Redacción documentos y/o convenio', 'Acude a consulta porque contruyo su casa sobre la placa de la casa de su hermana y quiere saber cual es la posibilidad de obtener un documento donde se le reconozca la propiedad
Responsable según el control de casos: Yuliana Pereira/ Edgar Dunn', 7, 'V-5545543', 1, 0, 2, 1, 'V-77777777', '2024-11-06')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000006', v_id, 'V-77777777');
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000003', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se le brindó la asesoria; indicandole que en materia de bienes inmuebles, por ser esta construcción una estructura y que por su naturaleza no se puede dividir, no se puede realizar un documento que separe la propiedad de la planta baja con la propiedad de la planta alta', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2024-11-06', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-11-06',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/22 · Silvia Elena Idarraga Gallego
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-11-12', '2024-11-12', 'Redacción documentos y/o convenio', 'Acude a consulta porque consturyó una casita en el Core 8 y tiene un titulo de propiedad del terreno y quiere hacer un titulo supletorio sobre la casa que construyo con materiales que le suministró el gorbierno
Responsable según el control de casos: Vicenzo/Mathias', 7, 'V-22824309', 1, 0, 2, 1, 'V-77777777', '2025-01-24')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000005', v_id, 'V-77777777');
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000004', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se escaneo el titulo de propiedad del terreno y se le solicitó realizar un croquis y descripción de la casa', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2024-11-12', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'En fecha 12/12/2024 se presentó la solicittud de título supletorio', NULL,
            '2024-12-12', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (3, v_id, 'Se fijó evacuación de testigos para el 22/01/2025 a a las 9:00 am', NULL,
            '2025-01-22', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (4, v_id, 'En fecha 24/01/25 le fue entregado el título supletorio', NULL,
            '2025-01-24', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-01-24',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/23 · Daves Martinez
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-11-13', '2024-11-13', 'Asistencia Judicial - Casos externos', 'Acude a consulta por el dejando información sobre su caso, divorcio 4 años separados sin saber de ella, se le dio asesoria de las horas que el puede venir a consignar documentos y proceder su caso
Responsable según el control de casos: Vincenzo Altobelli', 7, 'V-17633040', 1, 1, 1, 8, 'V-77777777', '2025-06-04')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000005', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'En fecha 27/11/24 se conversó con el solicitante e indicó que está en busqueda de los requisitos necesarios para formalizar la solicitud', NULL,
            '2024-11-27', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'En fecha 04/06/2025 nos comunicamos con el sr Dave y dijo que fue atendido a través de un tribunal movil por lo que ya no continuará el caso con nosotros.', NULL,
            '2025-06-04', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-06-04',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/24 · Daviannis Castillo
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-11-13', '2024-11-13', 'Asistencia Judicial - Casos externos', 'Acude a consulta porque se quiere divorciar, tienen 6 años de casados y ella vive en Perú (vienen ocasionalmente a Venezuela) y ya tiene otra pareja; no tienen hijos en común y el conyuge Ilbing José Mendoza Cedeño esta de acuerdo aunque vive por el Dorado.
Responsable según el control de casos: Egdar Dunn/ Nazareth Moorley', 7, 'V-22918488', 1, 1, 2, 18, 'V-77777777', NULL)
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000003', v_id, 'V-77777777');
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000013', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Consignó copia del acta de matrimonio y las copias de cédulas', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2024-11-13', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'Se redactó el documento se encuentra en el drive; pero no se logra coordinar momento de presentación ante el tribunal; el Conyuge se encuentra en la ciudad El Dorado y manifestó no poder venir a Puerto Ordaz para hacer la presentación', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2024-11-13', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (3, v_id, 'En fecha 07/02/25 se le escribó vía WhastApp para conocer si habia comunicación con le cónyuge a los efectos de coordinar la presentación de la solicitud', NULL,
            '2025-02-07', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'En pausa según el control de casos 2024-2025', 'En proceso', '2025-02-07',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/25 · Maria Elena Mendoza
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-11-13', '2024-11-13', 'Asistencia Judicial - Casos externos', 'Acude a consulta porque tiene 27 años separadas y se quiere divorciar; consigno copia del acta de matrimonio y copia de cédula
Responsable según el control de casos: Edgar Dunn/Victoria Pereira', 7, 'V-8497059', 1, 1, 1, 8, 'V-77777777', '2025-03-07')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000003', v_id, 'V-77777777');
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000007', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'En fecha 13/02/25 se preentón solcitud ante la URDD de Municipio, distribución nro. 2576', NULL,
            '2025-02-13', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'Exp. 9376-25 Tribunal 3ero de Municipio', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-02-13', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (3, v_id, 'Admitido en fecha 14/02/25', NULL,
            '2025-02-14', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (4, v_id, 'En fecha 05/03/25 Alguacil consigna boleta firmada por el fiscal (Notifiacaión psoitiva)', NULL,
            '2025-03-05', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (5, v_id, 'En fecha 07/03/25 Fiscal consigna opinión favorable', NULL,
            '2025-03-07', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-03-07',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/26 · José del Carmen Rangel Colmenarez
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-11-13', '2024-11-13', 'Redacción documentos y/o convenio', 'Acude a consulta porque compró un carro a su tia política Arisleida Bejarano y requiere hacer el documento para finiquitar la compra
Responsable según el control de casos: Edgar Dunn/Victoria Pereira/redacta: Mathias', 7, 'V-12594800', 1, 0, 3, 3, 'V-77777777', '2024-12-11')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000003', v_id, 'V-77777777');
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000007', v_id, 'V-77777777');
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000004', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se le brindó la asesoria y se redacto el documento conforme a sus requerimiento y l fué entregado el 11/12/24', NULL,
            '2024-12-11', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-12-11',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/27 · David Giron
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-11-13', '2024-11-13', 'Redacción documentos y/o convenio', 'Realizó llamada telefónica indicando que compro una casa ubicada en el Sector Core 8 de Puerto Ordaz y no ha firmado la documentación correspondiente; consgina vía electronica documentos de propiedad a nobmre del vendedor
Responsable según el control de casos: Mathias / Vincenzo', 7, 'V-70000003', 1, 0, 3, 2, 'V-77777777', '2024-11-13')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000004', v_id, 'V-77777777');
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000005', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se le brindo la aseoría; y dado que el vendedor se encuentra fuera de la ciudad; lo más factible es que coordine su venida para la firma o se haga un poder; al revisar este tema se pudo constata que ya habia sido atendido en un periodo anterior y manifestó que no habia notariado el poder que le fuere entregado en esa oportunidad; por lo que se le indicó que ya los costos de registro y notaria escapan de nuestras manos, deben ser cubierto por las partes solicitantes', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2024-11-13', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-11-13',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/28 · Wilfredo Gómez
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-11-20', '2024-11-20', 'Redacción documentos y/o convenio', 'Acude a consulta por requiere constituir una compañia sobre seguridad
Responsable según el control de casos: Mathias / Vincenzo', 7, 'V-13220768', 4, 0, 0, 2, 'V-77777777', '2024-11-20')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000004', v_id, 'V-77777777');
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000005', v_id, 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-11-20',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/29 · Mauren Hernandez
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-11-27', '2024-11-27', 'Redacción documentos y/o convenio', 'Acude a consulta porque fue atentida por clínica Jurídicas Caracas donde emitieron un documento de disolucion unilateral de Unión estable de hecho; al llevarlo a la notaria de Puerto Ordaz ordenaron hacer una correción
Responsable según el control de casos: Mathias / Vincenzo', 7, 'V-11196085', 1, 0, 1, 5, 'V-77777777', '2024-12-04')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000004', v_id, 'V-77777777');
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000005', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'En fecha 04/12/24 la Solicitante retiró el justificativo de concubinato y manifestó requerir asesoria en manteria penal; se solcitó apoyo al prof. Roberto Delgado y la atenderá el 05/12/24 a las 4:00 pm', NULL,
            '2024-12-04', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-12-04',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/30 · Eyker Torres
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-12-11', '2024-12-11', 'Redacción documentos y/o convenio', 'Consulta vía correo electrónico la posibilidad de gestionar un permiso de viaje internacional para sus hijos menores de edad; quienes viajarían a Mexico para reunificación familiar con su Madre quien es venezolana y mexicana
Responsable según el control de casos: Yuliana Pereira/ Edgar Dunn', 7, 'V-12876140', 1, 1, 2, 9, 'V-77777777', '2025-06-04')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000006', v_id, 'V-77777777');
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000003', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se le indicó que se puede realizar pero se require además de los recaudos enviados (partidas de nacimientos, cedulas y pasaportes) el boleto aéreo', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2024-12-11', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'En fecha 17/01/2025 nos comunicamos con el solicitante y con la madre de los niños e indican que aun no tienen los boletos de viajes, al comprarlos nos informarán', NULL,
            '2025-01-17', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (3, v_id, 'En fecha 06/02/25 Se llamó al solicitante e indicó que aún no tiene fecha de viaje por lo que el caso se paraliza, se comunicará al tener ese tema resuelto', NULL,
            '2025-02-06', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (4, v_id, 'En fecha 03/06/25 informó que ya compraron los pasajes', NULL,
            '2025-06-03', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (5, v_id, 'En fecha 04/06/25 se presentó solciitud de autorización de viaje con cambio de residencia', NULL,
            '2025-06-04', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-06-04',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/31 · Carmen Benilde García de Lara
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2025-01-21', '2025-01-21', 'Asistencia Judicial - Casos externos', 'Acude a consulta porque la casa familiar está en posiesión de unos inquilinos desde hace 10 años y no quieren desocupar la casa; no tienen documentos de propiedad de la casa y por ello nos solocita realizar titulo supletorio, indica que colocó denuncia ante fiscalía y los inquilinos no han acudido a las citaciones; adicionalmente manifiesta que tiene un hermano preso por supuesto abuso sexual a la hija de los inquilinos de la casa y lleva preso 2 años
Responsable según el control de casos: prof Minelvis', 7, 'V-6529420', 6, 0, 0, 1, 'V-77777777', '2025-02-03')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO supervisa (term, cedula_profesor, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000001', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'se verifió la documentación que presentó la cual no da certeza del derecho sobre la casa y se le pidió consignar los datos de la denuncia en fiscalía y el tramite realizado ante CVG bienes inmuebles para poder canailzar una posible solución al problema planteado', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-01-21', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'En fecha 24/01/25 la solicitante envió vía whatsApp numero de expediente en fiscalía; se le consultó a la egresada Paula Castillejo quien indicó que el expediente se encuentra activo y sin impulso por la parte interesada', NULL,
            '2025-01-24', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (3, v_id, 'En fecha 03/02/25 se le brindo la información suministrada por la egresada colaboradora  y se le explicó que debe acudir a CVG bienes inmuebles para obetner aturoziación para realizar un titulo supleotrio sobre la casa en disputa, se procede a cerrar el caso', NULL,
            '2025-02-03', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-02-03',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/32 · Elizabeth Garcia
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2025-01-13', '2025-01-13', 'Redacción documentos y/o convenio', 'Envió correo electronico solicitando asesoria para la realización de un Poder General de Administración y Disposición por cuanto viajará por tiempo prolongado del país
Responsable según el control de casos: prof Minelvis', 7, 'V-20808116', 1, 0, 3, 8, 'V-77777777', '2025-01-22')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO supervisa (term, cedula_profesor, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000001', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se e indicaron los recaudos y via telefonica se le brindo la asesoria', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-01-13', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'En fecha 22/01/2025 se le entrego el documento', NULL,
            '2025-01-22', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-01-22',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/33 · Yexibel Adriana Subero Gamez
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2025-01-28', '2025-01-28', 'Redacción documentos y/o convenio', 'Acude a consulta porque está comprando una casa en el Sector José Tadeo Monagas de San Felíx; la vendedora  tiene a disposición un titulo supletorio y una venta por Notaria
Responsable según el control de casos: prof. Minelvis', 7, 'V-29543234', 1, 0, 3, 2, 'V-77777777', '2025-01-28')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO supervisa (term, cedula_profesor, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000001', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se le brindo la asesoria, se revisó la documentación y se le indicó acudir a CVG Bienes Inmuebles como ente administrador de los terrenos del sector', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-01-28', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-01-28',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY 24-25/34 · Eily Flores
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2025-04-01', '2025-04-01', 'Asistencia Judicial - Casos externos', 'Acude a consulta porque en fecha 11/03/2025 fue victima de violencia por parte de su conyuge (tiene activo, un proceso judicial por violencia de genero); tienen 2 hijos menores de edad ( 7  años la niña y 4 años el niño respectivamente); desea divorciarse y el conyuge esta de acuerdo
Responsable según el control de casos: Edidson Lozano', 7, 'V-21251277', 1, 1, 2, 18, 'V-77777777', '2025-05-26')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000009', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se le brindó la asesoría; se le indicaron los recaudos a consignar y se le solicitó el número de telefono del conyuge para conversar con el y verificar que está de acuerdo con la presentación del divorcio.', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-04-01', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'En fecha 23/04/25 la sra Eilyn acudió a consulta para revisar el borrador del documento; se le hicieron una serie de preguntas relacionadas con el documento y se conversó sobre la situación de violencia por lo que indico que en el tribunal el Nro, de exp es FP12-S-2025-000549 Tribunal 2do de Control.', NULL,
            '2025-04-23', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (3, v_id, 'En fecha 07/05/2025 se presentó ante el circuito de protección por verificar numero de expediente asignado y tribunal', NULL,
            '2025-05-07', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (4, v_id, 'le fue asignado el expediente Nro. FP11-J-2025-587 en el tribunal 4to de protección', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-05-07', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (5, v_id, 'Fué admitido el 26/05 y sentenciado el 02/06/25 pendiente por solicitar ejecución', NULL,
            '2025-05-26', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-05-26',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY 24-25/35 · José Luis Morales Morales
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2025-04-01', '2025-04-01', 'Asistencia Judicial - Casos externos', 'Acude a consulta porque desea divorciarse, su pareja está de acuerdo y no tienen hijos ni bienes en común/ ya fue antendido atenriormente por el servicio de clínica jurídica porque el acta de matrimonio tenia un error por lo que se llevo a cabo un proceso de rectificación de acta de matrimonio
Responsable según el control de casos: Bautista García', 7, 'V-6692584', 1, 1, 2, 18, 'V-77777777', '2025-06-19')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000010', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se le  brindó la asesoría se le indicó los reacaudos a consignar; se escaneó el acta de matrimonio queda pendiente las copias de las cédulas', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-04-01', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'En fecha 30/04/25 se presentó ante la URDD de Municipio la solicitud de divorcio Nro. de Distribución 3216', NULL,
            '2025-04-30', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (3, v_id, 'Le fue asignado el exp 9231-25 en el Tribunal 2do de Municipio', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-04-30', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (4, v_id, 'Fue admitido con fecha 09/05; pendiente por notificación fiscal', NULL,
            '2025-05-09', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (5, v_id, 'Sentenciado en fecha 19/06/2025', NULL,
            '2025-06-19', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-06-19',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY 24-25/36 · Efren Martínez
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2025-04-01', '2025-04-01', 'Asistencia Judicial - Casos externos', 'Acude a consulta porque quiere divorciarse; esta casado desde el 24/08/2012, tienen 2 hijos menores de edad (16 y 17 años); la conyuge Kaenia Corales se fue de la casa estando separados por mas de 3 años
Responsable según el control de casos: Ana Moreno', 7, 'V-18450908', 1, 1, 2, 18, 'V-77777777', NULL)
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000012', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se le brindó la asesoria; consigna copia del acta de matrimonio; copia de las cédulas de los conyuges y copias de las actas de nacimientos de los hijos; pendiente por consignar copia de cédula de los hijos; indicó numero de telefono de la cónyuge  0412 9950124', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-04-01', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'En fecha 01/04/2025 se recibió via whatsApp acta de nacimientos de los hijos', NULL,
            '2025-04-01', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (3, v_id, 'En fecha 20-05-25 recibio asesoriamiento sobre el seguimiento a su divorcio y solicito que contactaran a su esposa a los efectos de establecer la manutención para seguir con el proceso del divorcio.', NULL,
            '2025-05-20', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (4, v_id, 'Doc redactado guardado en el drive pendiente: información en relación a la manutención', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-05-20', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (5, v_id, 'En fecha 30/07/25 se presentó solicitud de divorcio ante el tribunal', NULL,
            '2025-07-30', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'En proceso según el control de casos 2024-2025', 'En proceso', '2025-07-30',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY 24-25/37 · Eloisa Moreno
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2025-04-01', '2025-04-01', 'Asistencia Judicial - Casos externos', 'Acude a consulta porque se quiere divorciar; esta casada desde 1997; tienes 2 hijas mayores de edad, un apartamento en cómún y estan separados de hecho desde el 20/11/2022; manifiesta que el conyuge está de acuerdo en solicitar el divorcio bajo la modalidad de mutuo acuerdo
Responsable según el control de casos: Niuska Calderón', 7, 'V-80000011', 1, 1, 2, 18, 'V-77777777', '2025-05-05')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000008', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se le brindó la asesoría; es scaneo el acta de matrimonio, cédulas de los conyuges, documento de liberación de la hipoteca del apartamento; debe consignar: copias de las actas de nacimientos de los hijos y sus copias de cédula', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-04-01', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'En fecha 30/04/25 se presentó ante la URDD de Municipio la solicitud de divorcio Nro. de Distribución 3209', NULL,
            '2025-04-30', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (3, v_id, 'fue asigando al tribunal 1ero de Municipio', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-04-30', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (4, v_id, 'le asiganron el Nro. 15976-25 fue admitido el 05/05/25 y snentenciado con ejecución expresa el 12/05/25', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-04-30', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (5, v_id, 'En fecha 05/05/25 fue admitido', NULL,
            '2025-05-05', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-05-05',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY 24-25/38 · Yannohacelys Romina Arias Marin
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2025-04-02', '2025-04-02', 'Asistencia Judicial - Casos externos', 'Acude a consulta porque quiere divorciarse; esta casado desde el 22/08/2013, tienen 1 hija menor de edad (11 años); el conyuge Andrewith Palacios; separados desde el 12 de febrero de 2015; el telefono del conyuge es 04160289506
Responsable según el control de casos: Edgar Dunn', 7, 'V-19039786', 1, 1, 2, 18, 'V-77777777', '2025-07-02')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000003', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se le brindó la asesoria, consigno copia del acta de matrimonio, copias de las cédulas de los conyuges y copia del acta de nacimiento de la hija; se redactará una solicitud de divorcio de mutuo acuerdo', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-04-02', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'Sentenciado el 11/06/25', NULL,
            '2025-06-11', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (3, v_id, 'En fecha 02/07/2025 diligencia solicitando ejecución de la sentencia', NULL,
            '2025-07-02', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-07-02',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/39 · Norys Del Carmen Alvarez Romero
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2025-04-02', '2025-04-02', 'Asistencia Judicial - Casos externos', 'Acude a consulta por que se quiere divorciar; esta casada hace 7 años tienen dos hijas en común de 9 años y de 18 años ; su conyuge Luis Alfredo Mota su telefono 04164973384
Responsable según el control de casos: Edgar Dunn / Victoria Pereira', 7, 'V-17885343', 1, 1, 2, 18, 'V-77777777', NULL)
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000003', v_id, 'V-77777777');
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000007', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se le brindó asesoria; consigno acta de matrimonio, copia de cédula de los conyuges, acta de nacimientos de los hijos', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-04-02', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'En el drive se encuentra redactado a la espera de información solicitada via whastApp a la señora Noris', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-04-02', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (3, v_id, 'En fecha 01/10/2025 ante el Tribunal de Protección; pendiente verificar asinganción de Nro. de Tribunal y de expediente', NULL,
            '2025-10-01', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (4, v_id, 'Exp FP11-J-2025-1667 Sentenciado con fecha 09/10/25 y en feca 05/03/26 se solicitó ejecución', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-10-01', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'En proceso según el control de casos 2024-2025', 'En proceso', '2025-10-01',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/40 · Ramón Marin
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2025-04-08', '2025-04-08', 'Asistencia Judicial - Casos externos', 'Acude a consulta porque se casó en fecha 03 de octubre de 2024; pero la conyuge Geyvi Marcano decidió que quiere irse del país ante esta situación consideran prudente divorciarse; viven en residencias separadas desde enero 2025; la conyuge esta de acuerdo en realizar el proceso
Responsable según el control de casos: Bautista García', 7, 'V-13994561', 1, 1, 1, 8, 'V-77777777', '2025-07-23')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000010', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se le brindó la asesoria, consigno copia del acta de matrimonio, copia de cédulas de ambos, indicó ultimo domicilio conyugal y fecha de separación', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-04-08', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'En fecha 30/04/25 se presentó ante la URDD de Municipio la solicitud de divorcio Nro. de Distribución 3211', NULL,
            '2025-04-30', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (3, v_id, '04/06/25 sentenciado pendiente por ejecución', NULL,
            '2025-06-04', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (4, v_id, 'En fecha 23/07/25 se pagaron las copias para la certificación y devolución de originales', NULL,
            '2025-07-23', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (5, v_id, 'ya se retiraron copias certificadas de la sentencia por parte del solicitante', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-07-23', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-07-23',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/41 · Jhonjaro Bolívar Martínez
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2025-04-09', '2025-04-09', 'Asistencia Judicial - Casos externos', 'Acude a consulta porque se quiere divorciar su conyuge la sra Elizabeth Vallecilla; tienen 3 hijos en común que viven con el señor y ella esta en los estados unidos, están separados hace 5 años
Responsable según el control de casos: Edgar Dunn', 7, 'V-14743490', 1, 1, 2, 18, 'V-77777777', '2025-05-27')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000003', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se le brindó la asesoría, consigno copias de acta de matrimonio, copia de cédula de los conyuges, copias de acta de nacimientos de las hijas y copias de cédulas de 2 hijas', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-04-09', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'Se redactó el documento se encuentra a resguardo en el Drive falta coordinar fecha de presetación', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-04-09', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (3, v_id, 'El 27/05/25 la conyuge vía whatsapp indico que no va a firmar el divorcio', NULL,
            '2025-05-27', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (4, v_id, 'No se logro comunicación con el sr Jonjairo', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-05-27', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-05-27',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/42 · Yurbanys Luzmery
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2025-04-09', '2025-04-09', 'Asistencia Judicial - Casos externos', 'Acude a consulta porque quiere divorciarse; están separados desde el 19/09/2022, tienen 3 hijos en común quienes viven con ella; el conyuge el Sr Alexander Campos vive en Cumaná
Responsable según el control de casos: Victoria Pereira', 7, 'V-18901921', 1, 1, 2, 18, 'V-77777777', '2025-06-16')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000007', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se le brindó la asesoría; se le indicó que el conyuge tiene que venir a la ciudad para poder presentar la solicitud, se establecerá una monto de obligación de manutención', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-04-09', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, '16/06/25 a través de WhatsApp la sra Yurbanis indicó que no continuará con el caso. SE CIERRA EL CASO', NULL,
            '2025-06-16', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-06-16',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/43 · Robert Astudillo
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2025-04-23', '2025-04-23', 'Asistencia Judicial - Casos externos', 'Acude a consulta porque se quiere divorciar, tiene 2 años separado de cuerpo; la Conyuge vive en Margarita, tienen 2 hijos en comun de 14 y 5 años que viven con la mamá.
Responsable según el control de casos: Victoria Pereira', 7, 'V-18169044', 1, 1, 2, 18, 'V-77777777', '2025-07-08')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000007', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se le brindó la asesoría, se le indicaron los recaudos a consignar y se le indicó que debe hablar con la conyuge para informarle que quiere realizar este proceso', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-04-23', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'Llamar al señor Robert a los fines deponerlo al tanto de la negativa de la señora a divorciarse y ponerlo al tanto de las condiciones de la señora isabel , revisar mensajes del telefono.', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-04-23', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (3, v_id, 'En fecha 08/07/25 se llamo al Sr Robert informando sobre la negativa de la sra Isabel y se cierra el caso; se le sugirió mediar con la señora y a futuro acudir nuevamente a este espacio de atención', NULL,
            '2025-07-08', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-07-08',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/44 · María Mota
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2025-04-23', '2025-04-23', 'Redacción documentos y/o convenio', 'Acude a consulta porque su concubino quiere cederle los derechos sobre la casa donde habitan; mostró el titulo supletorio original
Responsable según el control de casos: Edgar Dunn', 7, 'V-9906226', 1, 0, 3, 9, 'V-77777777', '2025-04-23')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000003', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se le brindó asesoria; se le sugiró hacer el registro de su concubinato ante el Registro Civil para posteriormente hacer la solicitud de venta del terreno sobre la cual se encuentran las Bienhechurías ante CVG Bienes Inmuebles o en caso negativo solicitar a CVG autorización para hacer un nuevo titulo supleotrio', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-04-23', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-04-23',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/45 · Sergio Jimenez
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2025-04-29', '2025-04-29', 'Asistencia Judicial - Casos externos', 'Acude a consulta porque tiene en curso en tribunales la solicitud de DDUU por el fallecimiento de su padre pero le indican que debe presentar el acta de matirmonio original de sus padres; resulta que por una degracia natural en Cumaná esta acta se perdió
Responsable según el control de casos: Edidson Lozano', 7, 'V-19420603', 1, 0, 1, 2, 'V-77777777', '2025-04-29')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000009', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se le brindó la asesoria que debe pedir una reconstrucción de acta de matrimonio por el Registro Civil de Cumana', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-04-29', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-04-29',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/46 · Gladis Cardoza
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2025-04-29', '2025-04-29', 'Asistencia Judicial - Casos externos', 'Acude a consulta porque se casó en el año 2014, no tienen hijos en comun ni bienes; se separaron hace aproxidamente 7 años  (19/03/2018); la señora no tiene conocimiento del paradero actual del conyuge Elías pero en su momento tenia información de que se fue a la minas del Callao y que quiere divorciarse
Responsable según el control de casos: Ana Moreno', 7, 'V-8370445', 1, 1, 2, 18, 'V-77777777', NULL)
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000012', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se le brindó asesoria, consigno copia de acta de matrimonio y copia de cédulas de ambos conyuges; se le indicó que debe solicitar una copia certificada del acta de matrimonio y ubicar información a través de familiares o amigos del paradero del conyuge Elias', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-04-29', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'En pausa según el control de casos 2024-2025', 'En proceso', '2025-04-29',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/47 · Lourdes Partido
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2025-04-30', '2025-04-30', 'Asistencia Judicial - Casos externos', 'acude a consulta porque tiene una sentencia que declara el ejercicio unilateral de patria potestad en el año 2022; pero esta sentencia presenta una inconsistencia en los nombres
Responsable según el control de casos: Victoria Pereira', 7, 'E-868205', 1, 1, 2, 17, 'V-77777777', NULL)
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000007', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se revisó la sentencia y se consulto a la prof. Glora Montenegro y ella indicó que debe solicitarse nuevamente el ejercicio unilateral de patria potestad', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-04-30', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'En fecha 03/06/2025 se le indicó a la sra Lourdes que debe consignar toda la documentación para redactar nuevamente la solicitud', NULL,
            '2025-06-03', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (3, v_id, 'En fecha 25-06-2025  fue presentada la solicitud a el tribunal, quedando pediente la verificacion del numero de expediente que le fue asignado al tribunal', NULL,
            '2025-06-25', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (4, v_id, 'Exp FP11-H-2025-276 Tribunal 3ero / en fecha 04/07/2025', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-06-25', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'En proceso según el control de casos 2024-2025', 'En proceso', '2025-06-25',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/48 · Georgina Bejarano
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2025-05-20', '2025-05-20', 'Redacción documentos y/o convenio', 'Acude a consulta por la redaccion de un contrato de arrendamiento a titulo personal, dado que el vigente es bajo una figura juridica, solicita que llamen a su arrendantario  para ponerlo al tanto de las implicaciones legales y bajo su aceptacion continuar con el contrato de arrendamiento
Responsable según el control de casos: Niuska Calderon y Bautista Rosas', 7, 'V-14986003', 1, 0, 3, 1, 'V-77777777', '2025-10-22')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000008', v_id, 'V-77777777');
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000011', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'En fecha 01-07-2025 consigno la información pertinente para la redacción del mismo.', NULL,
            '2025-07-01', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'En fecha 22/10/25 se entregó el documento a la solicitante', NULL,
            '2025-10-22', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-10-22',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/49 · Mariannis Garcia
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2025-05-21', '2025-05-21', 'Asistencia Judicial - Casos externos', 'Acude a consulta para solicitar el divorcio, tiene tres hijos  menores de edad,  sin bienes en comun , suministrando el numero de su conyuge 0416-280764
Responsable según el control de casos: Bautista Garcia', 7, 'V-20506378', 1, 1, 2, 18, 'V-77777777', NULL)
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000010', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'En fecha 14-07-2025 nos comunicamos con el conyuge que a la fecha no habia dado respuestas a los efectos de finiquitar el aporte de manutención de las niñas, y no lo logramos contactar nuevamente, quedando a la espera de su respuesta.', NULL,
            '2025-07-14', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'En fecha 18/07/25 se presentó solicitud al tribunal', NULL,
            '2025-07-18', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'En proceso según el control de casos 2024-2025', 'En proceso', '2025-07-18',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · Gy24-25/50 · Morelis Bosques
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2025-05-27', '2025-05-27', 'Redacción documentos y/o convenio', 'Solicita asesoria para la constitucion de los documentos de una iglesia cristiana, servicio que se le presto refiriendole a que organos debia dirigirse para llevar a cabo el proceso.
Responsable según el control de casos: Niuska Calderon', 7, 'V-13121797', 1, 0, 3, 6, 'V-77777777', '2025-05-27')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000008', v_id, 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-05-27',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/51 · Yaritza Martínez
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2025-05-27', '2025-05-27', 'Asistencia Judicial - Casos externos', 'Solicita asesoria para realizar su proceso de divorcio, y el proceso correspondiente para llevarlo por Delta Amacuro, toda vez que no somos competentes a causa de la jurrisdiccion
Responsable según el control de casos: Bautista Rosas', 7, 'V-15429858', 1, 1, 1, 8, 'V-77777777', '2025-05-27')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000011', v_id, 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-05-27',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/52 · Anelsy León
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2025-05-27', '2025-05-27', 'Redacción documentos y/o convenio', 'Solicita asesoria para la venta de un inmueble producto de un divorcio, la venta se hara segun lo acordado por las partes, el mismo esta ubicado en la urb. El Caimito II, a tales efectos se espera la informacion que se le refirio para la compra del mismo.
Responsable según el control de casos: Ana Leon', 7, 'V-6898353', 1, 1, 1, 5, 'V-77777777', '2025-06-18')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000014', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'En fecha 04/06/25 acudió a consulta y se le dindicaron todas la documentación que requiera para la venta y se le sugirió contactar a una inmobiliaria para que le ayuden a establecer precio y le ayude vender', NULL,
            '2025-06-04', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'En fecha 18-06-2025 se redacto el documento de divorcio y estamos a la espera de las partidas de nacimiento de sus hijos para poder completar el mismo.', NULL,
            '2025-06-18', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-06-18',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/53 · Felix Zambrano
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2025-06-03', '2025-06-03', 'Asistencia Judicial - Casos externos', 'Solicita asesoria porque tiene 18 años separado de su conyuge, la cual se encuentra en brasil, tiene 7 hijos
Responsable según el control de casos: Niuska Calderon', 7, 'V-11512882', 1, 1, 2, 18, 'V-77777777', NULL)
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000008', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se redactó el documento se encuentra en el drive pendiente por la información que debe suministrar el sr Felix  (partidas  de nacimiento y cedulas de los 7 hijos)', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-06-03', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'En pausa según el control de casos 2024-2025', 'En proceso', '2025-06-03',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/54 · Columba Corales
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2025-06-03', '2025-06-03', 'Asistencia Judicial - Casos externos', 'Acude a consulta proque tiene 18 años separados de cuerpo, tienen 7 hijos, su esposa se encuentra en Brasil, solicitan el Divorcio por mutuo acuerdo, a tales efectos se le refirio que consignara las partidas de nacimiento de los hijos, original de la acta de matrimonio, copias de las cedulas y nos indicara un contacto para poder comunicarnos con la señora
Responsable según el control de casos: Bautista Rosas', 7, 'V-12396754', 1, 1, 2, 18, 'V-77777777', NULL)
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000011', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, '01-07-2025 se redacto el documento, estamos a la espera de que se  actualicen las partidas de nacimiento de sus hijos.', NULL,
            '2025-07-01', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'En fecha  01-07-2025 se acordo cita para verificar el estado de las partidas de nacimiento de sus hijos.', NULL,
            '2025-07-01', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'En proceso según el control de casos 2024-2025', 'En proceso', '2025-07-01',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/55 · Leivis León
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2025-06-04', '2025-06-04', 'Asistencia Judicial - Casos externos', 'Acude a consulta porque se casó en 2006, tienen 2 hijos en común uno de 18 años y otro de 7 años; están separados desde el año 2023; tienen un apartamento en común
Responsable según el control de casos: Yuliana Pereira / Edgar Dunn', 7, 'V-70000001', 1, 1, 2, 18, 'V-77777777', '2025-11-25')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000006', v_id, 'V-77777777');
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000003', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se le brindó la asesoría y se brindaron los recaudos a consignar', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-06-04', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'En fecha 11/07/2025 se presentó solicitud de divorcio por mutuo acuerdo', NULL,
            '2025-07-11', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (3, v_id, 'En fecha 11-07-25 se presento la solicitud de divorcio ante el Tribunal de protección', NULL,
            '2025-07-11', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (4, v_id, 'En fecha 25-11-2025 se cerro el caso, se entregoo las copias certificadas de la sentencia y del oficio.', NULL,
            '2025-11-25', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-11-25',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/56 · Luz Avelina Marquéz Figueroa
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2025-06-04', '2025-06-04', 'Redacción documentos y/o convenio', 'Acude a consulta porque está a cargo de 2 casas (una que fue de su padre y otra es de su madre) quiere arreglar el tema de la titularidad del derecho
Responsable según el control de casos: yuliana Pereira / Edgar Dunn', 7, 'V-23552118', 1, 0, 2, 1, 'V-77777777', '2025-06-25')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000006', v_id, 'V-77777777');
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000003', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se le brindó asesoria y se le indicó verificar documentos que posee de las casas para poder brindarle la orientación definitiva', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-06-04', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'En fecha 25/06/2025 acudió con los documentos disponibles; se revisaron y se le brindó la asesoria correspondiente.', NULL,
            '2025-06-25', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (3, v_id, 'Se le indicó acudir al seniat para realizar la declaración sucesoral solicitando la prescripcion por el tiempo transcurrido de la muerte de su papa; y en el caso de la mama´debe iniciar el proceso de solicitud de autorización para realizar titulo supletorio en CVG', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-06-25', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-06-25',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/57 · Yandira del Carmen Naveda Leira
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2025-10-06', '2025-10-06', 'Redacción documentos y/o convenio', 'acude a consulta porque esta casada pero separada de hecho hace varios años, conviven en la misma casa, tienen hijos en común y quiere colocar todos los bienes a su nombre porque el señor tiene hijos de un primer matrimonio
Responsable según el control de casos: Edidson Lozano / Niuska Calderón', 7, 'V-5426329', 1, 1, 1, 5, 'V-77777777', '2025-10-06')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000009', v_id, 'V-77777777');
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000008', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se le brindó asesoría y se le indicó que las 2 posibles soluciones son: Divorciarse  y luego liquidar la comunidad conyugal ó realizar una cesión de bienes a favor de los hijos en común con usufructo vitalicio.', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-10-06', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-10-06',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/58 · Marieli Villafranca
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2025-06-17', '2025-06-17', 'Asistencia Judicial - Casos externos', 'Acude a consulta porque se quiere divorciar, su conyuge está de acuerdo, estan separado desde el 3 de mayo de 2025 y tienen una hija de 17 años.
Responsable según el control de casos: Bautista Rosas', 7, 'V-14510483', 1, 1, 2, 18, 'V-77777777', NULL)
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000011', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se le brindó la asesoria, se recibió vía electronica los reacudos y se procedera a redactar el documento respectivo.', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-06-17', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'En fecha 18/06/2025 se presentó solicitud', NULL,
            '2025-06-18', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (3, v_id, 'sentenciado con fecha 30/06/2025', NULL,
            '2025-06-30', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (4, v_id, 'se solicito abocamiento y ejecucion de la sentencia en fecha 23/10/25', NULL,
            '2025-10-23', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (5, v_id, 'se solicito correccíon de errores materiales, para prevoiamente consignar copias simples EN FECHA 26/11/25', NULL,
            '2025-11-26', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'En proceso según el control de casos 2024-2025', 'En proceso', '2025-11-26',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/59 · Martha Jansen
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2025-06-17', '2025-06-17', 'Asistencia Judicial - Casos externos', 'Acude a consulta porque desde el 2023 ejerce de manera unilateral la patria potestad de su hija y proximamente viajará fuera del país
Responsable según el control de casos: Ana Moreno', 7, 'V-70000002', 1, 1, 2, 17, 'V-77777777', '2025-07-11')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000012', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se le brindó la asesoria y en tal sentido se le indicó que la sentencia de ejercicio unilateral de patria potestad no tiene fecha de caducidad; más sin embargo, por ser de viaja data se le recomendó obtener nuevas copias certificadas', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-06-17', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'En fecha 17/06/25 se revisó la jurisprudencia y no se encontró ningún elemento que indique la vigencia de las sentencias de ejercicio unilateral de patria potestad más sin embargo, se pudo conocer por redes sociales (instagram) que migración emitió una resolución donde solicita que las copias certificadas de la sentencias deben estar emitidas por un tiempo no menor de 3 meses', NULL,
            '2025-06-17', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (3, v_id, 'En fecha 18-06-25 se solicitaron dos juegos de sentencias certificadas del ejericio unilateral de la patria de potestas, el 20-06-2025 se solicito la devolucion de documentos originales.', NULL,
            '2025-06-18', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (4, v_id, '20/06/25 se presento diligencia solicitando devolución de documento original', NULL,
            '2025-06-20', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (5, v_id, 'En fecha 11/07/25 se presento diligencia consignando copias simples para su certificación', NULL,
            '2025-07-11', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-07-11',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/60 · Maria José de León
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2025-06-18', '2025-06-18', 'Redacción documentos y/o convenio', 'Envía consulta por WhatsApp indicando que se divorció en el 2022; requiere hacer la liquidación amistosa de la comunidad de bienes
Responsable según el control de casos: Edidson Lozano / Niuska Calderón', 7, 'V-80000012', 1, 1, 1, 5, 'V-77777777', NULL)
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000009', v_id, 'V-77777777');
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000008', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Envió por whatsApp los recaudos pediente por redacción', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-06-18', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'En proceso según el control de casos 2024-2025', 'En proceso', '2025-06-18',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/61 · Eglis Gonzalez
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2025-06-25', '2025-06-25', 'Redacción documentos y/o convenio', 'Acude a consulta porque su padre falleció y el heredero  mayor (hijo del señor antes de casarse con la sra. Eduarda); la sra Eglis es hija reconocida del sr Manuel (difunto) pero no es hija de la sra Eduarda
Responsable según el control de casos: Edgar Dumn/ Yuliana Pereira', 7, 'V-80000013', 1, 0, 4, 5, 'V-77777777', '2025-06-25')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000003', v_id, 'V-77777777');
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000006', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se revisó la documentación (acta de defunción, declaración sucesoral y partida de nacimiento); se le brindó la asesoria y se le sugierió estrategia de negociación', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-06-25', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'Vive en las Garzas', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-06-25', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-06-25',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/62 · Milagros Hernandez
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2025-07-02', '2025-07-02', 'Redacción documentos y/o convenio', 'Acude a consulta porque quiere colocar la casa de su madre a su nombre
Responsable según el control de casos: Edgar Dumn/Yuliana Pereira', 7, 'V-9943357', 1, 0, 3, 2, 'V-77777777', NULL)
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000003', v_id, 'V-77777777');
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000006', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'pendiente consignar recaudos', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-07-02', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'En pausa según el control de casos 2024-2025', 'En proceso', '2025-07-02',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/63 · Dina Girón
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2025-07-08', '2025-07-08', 'Asistencia Judicial - Casos externos', 'Acude a consulta porque compro unas bienhechurias en la zona de urb. Altos del Atlántico pero no tiene documentos por ser en un terreno de la CVG se requiere hacer titulo supletorio, pidieron autorización a CVG la cual fue aprobada
Responsable según el control de casos: Niuska Calderon', 7, 'V-16945535', 1, 0, 2, 1, 'V-77777777', '2025-07-11')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000008', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se revisaron los recaudos y se procede a redactar el titulo supletorio', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-07-08', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'En fecha 11/07/25 se presentó solicitud ante el tribunal pendiente por evacaucón de testigos', NULL,
            '2025-07-11', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (3, v_id, 'En octubre fue cerrado la solicitante obtuuvo su titulo supleotrio', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2025-07-11', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-07-11',
            'V-77777777', 'V-77777777');

    -- Casa Barandiarán · CB24-25/01 · Marlierys Del Valle Sulbaran Salavarria
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-11-22', '2024-11-22', 'Asesoría', 'Acude a consulta por querer divorciarse; tiene 10 años separados y dos hijos ya mayores, el conyuge está de acuerdo
Responsable según el control de casos: Matias
Grupo asignado según el control de casos: Matias y Daniel', 13, 'V-80000001', 1, 1, 1, 1, 'V-77777777', '2024-11-22')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000004', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'No consginaron recaudos y no se logro comunciación con la solicitante', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2024-11-22', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-11-22',
            'V-77777777', 'V-77777777');

    -- Casa Barandiarán · CB24-25/02 · Wilfredo Acosta Garcia
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-11-22', '2024-11-22', 'Redacción documentos y/o convenio', 'Acude a consulta porque quiere constituir una fundacion, trajo un anteproyecto y anexos de este, quiere hacer una fundacion que hospede niños en condición de calle focalizandolo en niñas.
Responsable según el control de casos: Vincenzo
Grupo asignado según el control de casos: Vincenzo y Gabriel', 13, 'V-80000002', 1, 0, 3, 6, 'V-77777777', '2024-11-22')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000005', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'No consginaron recaudos y no se logro comunciación con la solicitante', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2024-11-22', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-11-22',
            'V-77777777', 'V-77777777');

    -- Casa Barandiarán · CB24-25/03 · Juan Sergio Alejandro Marin Guevara
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-11-22', '2024-11-22', 'Asesoría', 'Acuede  a consulta porque se quiere divorciar, tienen  8 años separados y se presume que la mujer se va a ir del pais.
Responsable según el control de casos: Matias
Grupo asignado según el control de casos: Matias y Daniel', 13, 'V-80000003', 1, 1, 1, 1, 'V-77777777', '2024-11-22')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000004', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'No consginaron recaudos y no se logro comunciación con la solicitante', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2024-11-22', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-11-22',
            'V-77777777', 'V-77777777');

    -- Casa Barandiarán · CB24-25/04 · Anibal Jose Acosta
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-11-22', '2024-11-22', 'Asesoría', 'Acude a consulta porque representa al ancianato Madre María de San José; albergan a 4 ancianos sin documentación mas ellos dicen recordar su número de cédula, nombres y fechas de nacimiento
Responsable según el control de casos: Matias
Grupo asignado según el control de casos: Matias y Daniel', 13, 'V-80000004', 6, 0, 0, 4, 'V-77777777', '2024-12-09')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000004', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'En fecha 03/12 se conversó con el funcionado CNE quien indicó que con al menos una denuncia ante la Policia del extravío de la cédula se puede proceder a sacar las nuevas cedulas de los abuelos', NULL,
            '2024-12-03', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'En fecha 09/12/24 el sr Anibal acudió al saime y se le sacó cedula a 2 de los 4 ancianos debido a que solo 2 de ellos lograron idenfiticr en el sistema la información suministrada', NULL,
            '2024-12-09', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-12-09',
            'V-77777777', 'V-77777777');

    -- Casa Barandiarán · CB24-25/05 · Maria Hidalgo
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-11-22', '2024-11-22', 'Redacción documentos y/o convenio', 'Acude a conslta porque ella se divoció y se quedó con la casa pero los documentos estan a nombre de su ex esposo. consultar con CVG o inviobras
Responsable según el control de casos: Nazaret y Dunn', 13, 'V-80000005', 1, 0, 2, 1, 'V-77777777', '2024-11-22')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000013', v_id, 'V-77777777');
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000003', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'debe comunicarse con su ex esposo para que lleguen a un acuerdo y realicen una liquidación amistosa de la comunidad conyudal', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2024-11-22', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-11-22',
            'V-77777777', 'V-77777777');

    -- Casa Barandiarán · CB24-25/06 · Rosalia Cristina Gomez ( representada por Yenny Fuenmayor)
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-11-22', '2024-11-22', 'Redacción documentos y/o convenio', 'Necesita una aclaratoria que si su casa es la 22 como dice el documento de propiedad de tierras de la cvg o el 24 como dice el Banavih, despues hacer un titulo supletorio
Representada por Yenny Fuenmayor, según el control de casos.
Responsable según el control de casos: Vincenzo
Grupo asignado según el control de casos: Vincenzo y Gabriel', 13, 'V-80000006', 1, 0, 2, 1, 'V-77777777', '2025-02-10')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000005', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'CONSULTAR A CVG', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2024-11-22', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'De la consulta realizada a CVG bienes inmuebles se obtuvo la siguiente respuesta : "Buenos días, el Documento de INAVI es su dirección cívica, el número que establece CVG es el número parcelario"  se le indicó a la solicitante dicha respuesta en fecha 10/02/25.', NULL,
            '2025-02-10', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-02-10',
            'V-77777777', 'V-77777777');

    -- Casa Barandiarán · CB24-25/07 · Wendy del Valle Gularte Salaverria
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-11-22', '2024-11-22', 'Asesoría', 'Necesita sacarle cedula de identidad a 3 menores, una de ellas embarazada, no tienen fe de vida de sus padres y algunos no se acuerdan de ellos.
Responsable según el control de casos: Matias
Grupo asignado según el control de casos: Matias y Daniel', 13, 'V-80000007', 1, 1, 2, 8, 'V-77777777', '2024-11-22')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000004', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'Se remitió a la Defensa pública, toda vez que hay que lograr dicten una medida de protección a favor de la solicitante quien manifestó ser la abuela de los nimos y los padres no se encuentran en el pais', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2024-11-22', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-11-22',
            'V-77777777', 'V-77777777');

    -- Casa Barandiarán · CB24-25/08 · Elizabeth Acosta
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-11-22', '2024-11-22', 'Redacción documentos y/o convenio', 'Copia partida de nacimiento, revisar la ley de registro civil, Acude a consulta porque su nieta no esta reconocida por su hijo y ella cuida a la niña, un conflicto importante entre ambas familia llevo a que la madre de la nieta la presentara sola; más sin embargo, la madre manifestó que si está de acuerdo en realizar el reconocimiento; pero al ir al registro le indicaron que debian esperar 8 meses para hacer la modificación del acta a a través del reconocimiento voluntario
Responsable según el control de casos: Nazaret y Dunn', 13, 'V-80000008', 1, 1, 2, 19, 'V-77777777', '2024-12-09')
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000013', v_id, 'V-77777777');
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000003', v_id, 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (1, v_id, 'A través de egresado que trabaja en CNE Nestor Chavero se logró la remisión al registro civil y el padre de la niña pudo realizar el reconocimiento de su hija', 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            '2024-11-22', 'V-77777777', 'V-77777777');
    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,
        fecha_registro, id_usuario_registra, id_usuario_registro)
    VALUES (2, v_id, 'en fecha 09/12/24 se realizó el tramite ante el registro civil', NULL,
            '2024-12-09', 'V-77777777', 'V-77777777');
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-12-09',
            'V-77777777', 'V-77777777');

    -- Casa Barandiarán · CB24-25/09 · Carmen Yraida Forero
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,
        fecha_fin_caso)
    VALUES ('2024-11-22', '2024-11-22', 'Redacción documentos y/o convenio', 'Necesita ir al registro a pedir un titulo de propiedad de tierra y el correspondiente titulo supletorio.
Responsable según el control de casos: Vincenzo
Grupo asignado según el control de casos: Vincenzo y Gabriel', 13, 'V-80000009', 1, 0, 2, 1, 'V-77777777', NULL)
    RETURNING id_caso INTO v_id;
    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;
    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)
    VALUES (v_term, 'V-90000005', v_id, 'V-77777777');

END $carga$;

-- Constancia de la carga en la propia auditoría.
RESET app.skip_audit_trigger;
INSERT INTO auditoria_eventos (entidad, operacion, id_usuario, datos_nuevos, metadata)
VALUES ('carga_inicial', 'insercion', 'V-77777777',
    jsonb_build_object('solicitantes', 71, 'viviendas', 47,
        'familias_y_hogares', 13, 'caracteristicas', 473,
        'casos', 72, 'acciones', 180),
    jsonb_build_object('origen', 'Libros de la clínica 2024-2025', 'generado_por', 'scripts/etl-carga-inicial.mjs'));

COMMIT;
