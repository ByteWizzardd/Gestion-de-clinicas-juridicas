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
    ('V-20506378', 'Mariannis', 'García', '1990-12-17', '04249352318', 'v-20506378@sin-correo.invalid', 'F', 'V', 'Casado', FALSE, 4, 3, NULL, 6, 1, 3, 'José Tadeo Monagas , dalla costa', 'V-77777777'),
    ('V-18450908', 'Efrén', 'Martínez', '1984-06-09', '04129263657', 'josémartinez542@gmail.com', 'M', 'V', 'Casado', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 0, NULL, 6, 1, 3, 'Campo rojo, dalla costa', 'V-77777777'),
    ('V-12396754', 'Columba', 'Corales', '1977-06-10', '041440982786', 'corales03@gmail.com', 'F', 'V', 'Casado', FALSE, 5, 0, 1, 6, 1, 6, 'Core 8, unare, municipio Caroní', 'V-77777777'),
    ('V-11512882', 'Felix', 'Zambrano', '1996-09-19', '04162066555', 'albertozambrano473@gmail.com', 'M', 'V', 'Casado', FALSE, 1, 1, 0, 6, 1, 3, 'La unidad , dalla costa', 'V-77777777'),
    ('V-15429858', 'Yaritza del Valle', 'Martínez', '1978-12-04', '04249719546', 'yn6457271@gmail.com', 'F', 'V', 'Casado', FALSE, 1, 0, 1, 6, 1, 11, 'Maisanta, 5 julio , municipio Caroní', 'V-77777777'),
    ('V-14986003', 'Georgina', 'Bejarano', '1980-03-03', '04143500524', 'gbejarano@ucab.edu.ve', 'F', 'V', 'Casado', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 0, 2, 6, 1, 7, 'Bolivar, Villa Latina, parroquia universidad', 'V-77777777'),
    ('V-8370445', 'Gladis', 'Cardoza', '1963-08-10', '04147605561', 'v-8370445@sin-correo.invalid', 'F', 'V', 'Casado', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 0, 0, 6, 1, 3, 'Av hospital, guaiparo, dalla costa', 'V-77777777'),
    ('V-19420603', 'Sergio', 'Jiménez', '1989-11-08', '04147704551', 'sergiojimenez.rc@gmail.com', 'F', 'V', 'Soltero', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 2, NULL, 6, 1, 6, 'Unare, puerto Ordaz , unare 2', 'V-77777777'),
    ('V-18169044', 'Robert', 'Astudillo', '1978-06-22', '04248168854', 'v-18169044@sin-correo.invalid', 'M', 'V', 'Casado', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 0, NULL, 6, 1, 4, 'San Félix,11 de abril , puerto Ordaz', 'V-77777777'),
    ('V-9906226', 'María', 'Mota', '1966-10-08', '04128793794', 'mmota7188@gmail.com', 'F', 'V', 'Divorciado', FALSE, 1, 2, 0, 6, 1, 3, 'José Tadeo Monagas , dalla costa', 'V-77777777'),
    ('V-5426329', 'Yandira Naveda', 'Leira', '1959-07-23', '04249070547', 'yardiranaveda59@gmail.com', 'F', 'V', 'Casado', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 0, NULL, 6, 1, 7, 'Villa africana , parroquia universidad', 'V-77777777'),
    ('V-23552118', 'Luz Marquez', 'Figueroa', '1972-04-07', '041499744348', 'v-23552118@sin-correo.invalid', 'F', 'V', 'Soltero', FALSE, 7, 2, NULL, 6, 1, 3, 'La 46 Dalla Costa', 'V-77777777'),
    ('V-26444583', 'Mayerlin', 'Coa', '1997-07-08', '04249209321', 'mayerlincoa@gmail.com', 'M', 'V', 'Casado', FALSE, 3, 3, 2, 6, 1, 6, 'Puerto Ordaz, Unare.', 'V-77777777'),
    ('V-9897125', 'Sanchez de Mata', 'Kerenis del Valle', '1967-07-20', '04249129600', 'patkere@yahoo.com', 'F', 'V', 'Soltero', FALSE, 2, 2, 4, 6, 1, 6, 'Bolivar, Caroni, Unare', 'V-77777777'),
    ('V-17039236', 'Jhony Wladimir', 'Salaberria Quijada', '1983-07-08', '04149116760', 'jhonnisalaberria83@gmail.com', 'M', 'V', 'Soltero', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 0, NULL, 6, 1, 2, 'Nueva chirica, chirica', 'V-77777777'),
    ('V-17750004', 'Yohomys Josefina', 'Gonzales Machiz', '1982-10-17', '04162332060', 'v-17750004@sin-correo.invalid', 'F', 'V', 'Soltero', TRUE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 0, 0, 6, 1, 8, 'Bolivar, vista el sol urbanización romero.', 'V-77777777'),
    ('V-5545543', 'Senaira', 'Márquez', '1958-04-24', '04249080189', 'v-5545543@sin-correo.invalid', 'F', 'V', 'Soltero', FALSE, 3, 0, 3, 6, 1, 5, 'El roble vía Palua Parroquia Simón Bolívar, Estado Bolívar.', 'V-77777777'),
    ('V-29543234', 'Subero Gamez', 'Yexibel Adriana', '2002-04-14', '04249619948', 'yexiabg@gmail.com', 'F', 'V', 'Soltero', FALSE, 4, 2, 4, 6, 1, 3, 'Bolívar, Caroni, Dalla Costa', 'V-77777777'),
    ('V-9319389', 'Melida Isabel', 'Rodriguez Bejarano', '1964-08-24', '041486782222', 'envzla@gmail.com', 'F', 'V', 'Soltero', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 0, NULL, 6, 1, 6, 'Urbanizacion riberas del caroni-, unare, Bolivar', 'V-77777777'),
    ('V-22824309', 'Silvia Elena', 'Idarraga Gallego', '1947-09-05', '04249039971', 'v-22824309@sin-correo.invalid', 'F', 'V', 'Casado', FALSE, 6, 2, 3, 6, 1, 6, 'Core 8 plaza mercado, parroquia Unare, municipio caroni, estado Bolívar', 'V-77777777'),
    ('V-18916345', 'Froilan Vicente', 'Aguilera Cedeño', '1988-05-04', '04126943358', 'froyagui04@gmail.com', 'M', 'V', 'Casado', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 2, 4, 6, 1, 7, 'Estado Bolivar, Municipio Caroni, Parroquia Universidad', 'V-77777777'),
    ('V-2933841', 'Cristina', 'Nickels', '1947-07-05', '04163913668', 'cnicklases@gmail.com', 'F', 'V', 'Soltero', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 0, NULL, 6, 1, 7, 'Los Olivos, Parroquia Universidad', 'V-77777777'),
    ('V-25292732', 'Heidi Roxana', 'Ruiz Diaz', '2000-12-22', '04249725796', 'heidi78@gmail.com', 'F', 'V', 'Casado', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 2, 0, 6, 1, 7, 'Los olivos, calle palermo, parroquia universidad', 'V-77777777'),
    ('V-17633040', 'Daves', 'Martines', '1989-08-15', '04147641440', 'v-17633040@sin-correo.invalid', 'M', 'V', 'Casado', FALSE, 5, 2, 4, 6, 1, 5, 'Simón Bolívar, manoa, municipio caroni, estado Bolívar', 'V-77777777'),
    ('V-17885343', 'Alvarez Romero', 'Norus del Carmen', '1987-09-23', '04121873352', 'v-17885343@sin-correo.invalid', 'F', 'V', 'Casado', FALSE, 6, 4, 1, 6, 1, 3, 'Bolivar, caroni, dalla costa', 'V-77777777'),
    ('V-8923075', 'Maribeth Maigualidad', 'Ferrer Mata', '1968-06-03', '04249165260', 'v-8923075@sin-correo.invalid', 'F', 'V', 'Soltero', FALSE, 4, 2, 4, 6, 1, 7, 'Estado Bolivar, Municipio Caroni, Parroquia Universidad', 'V-77777777'),
    ('V-16945535', 'Giron Blanco', 'Dina del Valle', '1986-03-11', '04249186427', 'v-16945535@sin-correo.invalid', 'F', 'V', 'Casado', FALSE, 6, 2, 4, 6, 1, 6, 'Bolívar, Caroní, Unare', 'V-77777777'),
    ('V-11196085', 'Mauren Elias', 'Hernández Freites', '1973-07-11', '04141145236', 'v-11196085@sin-correo.invalid', 'F', 'V', 'Soltero', TRUE, 5, 4, NULL, 6, 1, 6, 'Bolivar, Caroní, unare', 'V-77777777'),
    ('V-6354427', 'Arisleda', 'Bejaramo', '1988-07-13', '04148985571', 'bejaramo32@gmail.com', 'F', 'V', 'Soltero', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 0, NULL, 6, 1, 7, 'Villa Africana, Parroquia universidad', 'V-77777777'),
    ('V-16698299', 'Keila Maria', 'Martinez Jaramillo', '1981-06-12', '04121183267', 'keilammartinezj12@gmail.com', 'F', 'V', 'Casado', FALSE, 4, 2, 4, 6, 1, 4, 'Estado Bolivar, Municipio Caroni, Parroquia 11 de Abril', 'V-77777777'),
    ('V-13220768', 'Wilfredo', 'Gómez', '1977-02-22', '04148629866', 'v-13220768@sin-correo.invalid', 'M', 'V', 'Soltero', FALSE, 4, 2, 4, 6, 1, 7, 'Los olivos, parroquia universidad, municipio caroni, Estado Bolívar', 'V-77777777'),
    ('V-12876140', 'Torres Blanchard', 'Eyker Rafael', '1974-07-11', '04249139032', 'v-12876140@sin-correo.invalid', 'M', 'V', 'Casado', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 4, NULL, 6, 1, 6, 'Bolivar, Caroní, unare', 'V-77777777'),
    ('V-9945166', 'Migdalis', 'Gil', '1967-12-04', '041228091527', 'v-9945166@sin-correo.invalid', 'F', 'V', 'Casado', FALSE, 4, 0, NULL, 6, 1, 5, 'Estado Bolivar, Municipio Caroni, Parroquia Simon Bolivar', 'V-77777777'),
    ('V-11206007', 'Damelis Hestalida', 'Ramirez Barreto', '1972-04-18', '04249646943', 'v-11206007@sin-correo.invalid', 'F', 'V', 'Soltero', TRUE, 4, 0, 4, 6, 1, 6, 'Estado Bolivar, Municipio Caroni, Parroquia Unare', 'V-77777777'),
    ('V-8330445', 'Gladys Auristela', 'Cardoza de Alvarez', '1963-08-10', '04147605561', 'v-8330445@sin-correo.invalid', 'F', 'V', 'Casado', FALSE, 4, 4, 4, 6, 1, 3, 'Estado Bolivar, Municipio Caroni, Parroquia Dalla Costa', 'V-77777777'),
    ('V-13121797', 'Buque García', 'Morelis', '1976-09-07', '04148608979', 'morelisbuqes97@gmail.com', 'F', 'V', 'Soltero', FALSE, (SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = 'No suministrado'), 4, NULL, 6, 1, 5, 'La unidad, Simon bolívar, bolívar .', 'V-77777777');

INSERT INTO viviendas (cedula_solicitante, cant_habitaciones, cant_banos) VALUES
    ('V-20506378', 3, 2),
    ('V-18450908', 3, 1),
    ('V-12396754', 2, 1),
    ('V-11512882', 2, 1),
    ('V-15429858', 3, 2),
    ('V-14986003', 3, 1),
    ('V-8370445', 3, 1),
    ('V-19420603', 2, 1),
    ('V-18169044', 3, 1),
    ('V-9906226', 3, 2),
    ('V-5426329', 3, 2),
    ('V-23552118', 3, 3),
    ('V-26444583', 2, 1),
    ('V-9897125', 3, 1),
    ('V-17039236', 3, 1),
    ('V-17750004', 3, 1),
    ('V-5545543', 3, 1),
    ('V-29543234', 2, 1),
    ('V-9319389', 3, 1),
    ('V-22824309', 2, 1),
    ('V-18916345', 3, 2),
    ('V-2933841', 3, 1),
    ('V-25292732', 3, 2),
    ('V-17633040', 2, 2),
    ('V-8923075', 3, 2),
    ('V-11196085', 2, 2),
    ('V-6354427', 3, 2),
    ('V-16698299', 4, 3),
    ('V-13220768', 3, 2),
    ('V-9945166', 4, 3),
    ('V-11206007', 4, 3),
    ('V-8330445', 4, 3),
    ('V-13121797', 3, 1);

INSERT INTO familias_y_hogares (cedula_solicitante, cant_personas, cant_trabajadores,
    cant_no_trabajadores, cant_ninos, cant_ninos_estudiando, jefe_hogar, ingresos_mensuales,
    id_nivel_educativo_jefe) VALUES
    ('V-14986003', 4, 2, 0, 0, 0, FALSE, 3500, 1),
    ('V-26444583', 4, 3, 0, 3, 2, TRUE, 2000, 2),
    ('V-2933841', 2, 2, 0, 0, 0, TRUE, 1250, 1),
    ('V-25292732', 1, 1, 0, 0, 0, TRUE, 3500, 1),
    ('V-17633040', 2, 1, 0, 0, 0, TRUE, 11000, 3),
    ('V-11196085', 2, 2, 0, 0, 0, TRUE, 100, 5),
    ('V-12876140', 4, 1, 2, 2, 2, TRUE, 200, 6);

INSERT INTO asignadas_a (cedula_solicitante, id_tipo_caracteristica, num_caracteristica) VALUES
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
    ('V-13220768', 1, 2),
    ('V-13220768', 2, 3),
    ('V-13220768', 3, 4),
    ('V-13220768', 4, 3),
    ('V-13220768', 5, 1),
    ('V-13220768', 6, 1),
    ('V-13220768', 7, 1),
    ('V-13220768', 8, 1),
    ('V-13220768', 8, 2),
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
    ('V-13121797', 1, 6),
    ('V-13121797', 2, 3),
    ('V-13121797', 3, 3),
    ('V-13121797', 4, 1),
    ('V-13121797', 5, 1),
    ('V-13121797', 6, 1),
    ('V-13121797', 7, 1),
    ('V-13121797', 8, 1),
    ('V-13121797', 8, 3)
ON CONFLICT DO NOTHING;

-- Los casos se insertan de uno en uno para poder colgarles su estatus:
-- el trigger trigger_crear_cambio_estatus_inicial ya crea el primer
-- cambio de estatus, así que aquí solo se corrige cuando el libro dice
-- que el caso se cerró o quedó en pausa.
DO $carga$
DECLARE v_id INTEGER;
BEGIN
    -- UCAB Guayana · GY24-25/01 · Francimar Gamboa
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro)
    VALUES ('2024-09-13', '2024-09-13', 'Asesoría', 'Expediente del control de casos: GY24-25/01
Tipo según el libro: Otros (asesoria mercantil)
Reseña: Acude a consulta preguntando que  si es posible que su socio que a su vez es su esposo, puede administrar deliberadamente las compañias que tienen en común.
Responsable según el control de casos: prof Minelvis Martinez
Revisión 1: Se le brindó la asesoría indicandole el régimen jurídico aplicable; entendiendo que no puede administar deliberadamente las compañias', 7, 'V-12679398', 6, 0, 0, 4, 'V-77777777')
    RETURNING id_caso INTO v_id;
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-09-13',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/02 · Mayerlin Coa
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro)
    VALUES ('2024-09-26', '2024-09-26', 'Asistencia Judicial - Casos externos', 'Expediente del control de casos: GY24-25/02
Tipo según el libro: Divorcio/ asesoria internacional exequatur
Reseña: Acude a consulta porque se divorció en Chile y su matrimonio se realizó en Venezuela, quiere saber como hacer valer en Venezuela la sentencia de Divorcio
Responsable según el control de casos: Prof Minelvis Martinez
Revisión 1: Se le indicó que la figura aplicable es el exequatur que no es mas que solicitar la ejecutoria de la sentencia extranjera en Venezuela; se le indicaron los recaudos a consignar: Sentencia de divorcio legalizada y apostillada
Revisión 2: En fecha 06/02/25 se le envió mensaje vía WhastApp solicitando manifieste si dará continuidad a su solicitud. Manifestó estar en Chile que a su regreso continuará con la solicitud
Revisión 3: en fecha 04/06/25 nos comunicamos vías whatsApp para saber si viene al país, indicó que regresa el proximo año por lo que se procede a cerrar el caso, se le indicó que cuando guste puede acudir nuevamente al servicio', 7, 'V-26444583', 1, 1, 1, 4, 'V-77777777')
    RETURNING id_caso INTO v_id;
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-09-26',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/03 · Kerenis Sánchez
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro)
    VALUES ('2024-09-29', '2024-09-29', 'Redacción documentos y/o convenio', 'Expediente del control de casos: GY24-25/03
Tipo según el libro: Arrendamiento/Comódato
Reseña: Acude a consulta porque tiene un poder especial de su ex conyuge y necesita representarlo en un tema relacionado a un arrendamiento de vivienda
Responsable según el control de casos: Prof Minelvis Martínez
Revisión 1: Se le indicó que el poder es valido porque a pesar de ser especial contiene facutlades para representarlo en esa materia. adicionalmente se le indicó que a futuro debe enviar un poder general de administración y dispoción su representado para que maneje otros tema (sucesiones y otros) de interes del poderdante.', 7, 'V-9897125', 1, 0, 3, 1, 'V-77777777')
    RETURNING id_caso INTO v_id;
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-09-29',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/04 · Jhony Salaberría
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro)
    VALUES ('2024-10-01', '2024-10-01', 'Asistencia Judicial - Casos externos', 'Expediente del control de casos: GY24-25/04
Tipo según el libro: Divorcio causal no taxativas sentencias
Reseña: Acude a consulta porque quiere divorciarse por mutuo acuerdo, sin embargo, por la situación de tensión entre el y su conyuge pronostica que no será posible por esta via
Responsable según el control de casos: José Matias Araguayan/ Vincenzo Altobelli
Revisión 1: Se le brindó la asesoria, se tomó nota del telefono de la conyuge para comunicarnos con ella para intentar un acuerdo.
Revisión 2: En fecha 01/10/2024 se le llamo y no se obtuvo comunicación por lo que se le envió un mensaje vía WhatsApp el cual no tuvo respuesta; se envió un nuevo mensaje en fecha 07/10/2024 al cual respondió que ya tenia un abogado encargado del caso
Revisión 3: En fecha 07/10/2024 llamó el abogado de la conyuge Yenfri Guzman con quien se conversó, asimismo, se conversó con el sr Jhonny para explicar la situación y compartir el número de celular del abogado
Revisión 4: En fecha 09/10/2024 acude a la oficia el Sr Jhonni se le devolvieron sus documentos y se le indicó que debe mediar con el abogado de su conyuge; estaremos atentos a cualquier asesoria adicional que requiera', 7, 'V-17039236', 1, 1, 1, 8, 'V-77777777')
    RETURNING id_caso INTO v_id;
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-10-01',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/06 · Mélida Rodríguez
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro)
    VALUES ('2024-10-01', '2024-10-01', 'Redacción documentos y/o convenio', 'Expediente del control de casos: GY24-25/06
Tipo según el libro: Compra -Venta de bien inmueble
Reseña: Acude a consulta porque actualizar un documento de compra-venta que se le redactó en el 2019 por esta oficina porque nunca lo llevo al registro
Responsable según el control de casos: José Matias Araguayan/ Nazaret Moorley
Revisión 1: Se revisó la información suministrada, se actualizó el documento, está por impresión
Revisión 2: En fecha 25/10/2024 se entregó el documento solicitado', 7, 'V-9319389', 1, 0, 3, 2, 'V-77777777')
    RETURNING id_caso INTO v_id;
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-10-01',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/08 · Heidi Ruiz
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro)
    VALUES ('2024-10-02', '2024-10-02', 'Asistencia Judicial - Casos externos', 'Expediente del control de casos: GY24-25/08
Tipo según el libro: Divorcio causal no taxativas sentencias
Reseña: Acude a consulta porque se quiere divorciar; se caso en 2021, no tienen hijos y ya cada parte vive en residencias separadas. Ambas partes estan de acuerdo en realizar la solicitud
Responsable según el control de casos: Yuliana Pereira/ Edgar Dunn
Revisión 1: Se le brindó la asesoria; consigó copias de las cédulas de identidad de ambos; se le indicó traer o enviar vía correo el acta de matrimonio.
Revisión 2: En fecha 09/10/2024 acudió el conyugé Daniel Viloria quien consignó copia de la cedula de identidad y se escaneo el acta de matrimonio; manifestó esta de acuerdo con realizar la solicitud de divorcio
Revisión 3: En fecha 19/11/2024 se presentó la solicitud de Divorcio ante la URDD de Municipio Distribución Nro. 1884
Revisión 4: En fecha 26/11/24 se verificó la distribución correspondiendole el conocimiento al tribunal 2do de Municipio
Revisión 5: En fecha 03/12/24 Fue admitido', 7, 'V-25292732', 1, 1, 2, 18, 'V-77777777')
    RETURNING id_caso INTO v_id;
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-10-02',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/09 · Georgina Bejarano
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro)
    VALUES ('2024-10-03', '2024-10-03', 'Conciliación y Mediación', 'Expediente del control de casos: GY24-25/09
Tipo según el libro: Convivencia ciudadana
Reseña: Acude a consuta porque vive en un edificio junto a su esposo y 2 hijas (19 y 16 años de edad) y su vecino del piso superior perturba las horas del sueño con ruidos molestos a altas horas de la noche; ha conversado con el vecino sobre esta situación en reiteradas oportunidades pero ha hecho caso omiso
Responsable según el control de casos: prof Minelvis Martínez
Revisión 1: Se le brindó la asesoria y se le indicó enviar una carta a la Junta de Condominio para que hagan valer las normas de convivencia del edificio y de caso contrario acudir a la Poilica para un posible acto conciliatorio o acudir a fiscalia
Revisión 2: consultar con egresade de fiscalia
Revisión 3: En fecha 21/10/2024 Se le indicó elevó la consulta a la egresada Paula Castillejo (quien trabaja en fiscalía) indicó que puede colocar la denuncia por perturbación ó por contaminación sonica', 7, 'V-14986003', 6, 0, 0, 1, 'V-77777777')
    RETURNING id_caso INTO v_id;
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-10-03',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/13 · Maribeth Ferrer
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro)
    VALUES ('2024-10-14', '2024-10-14', 'Redacción documentos y/o convenio', 'Expediente del control de casos: GY24-25/13
Tipo según el libro: Poder
Reseña: Solicta asesoría vía WhastApp la realización de un  poder general amplio para delegar a sus familares ya que se va del país
Responsable según el control de casos: José Matías Araguayan/Vincezo Altobelli
Revisión 1: En fecha 22/10/2024 se entregó el documento solicitado', 7, 'V-8923075', 1, 0, 3, 8, 'V-77777777')
    RETURNING id_caso INTO v_id;
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-10-14',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/14 · Keila Martinez
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro)
    VALUES ('2024-10-16', '2024-10-16', 'Asistencia Judicial - Casos externos', 'Expediente del control de casos: GY24-25/14
Tipo según el libro: Divorcio causal no taxativas sentencias
Reseña: La señora Keila se quiere divorciar, el actual conyugue esta de acuerdo, el conyuge vive en la ciudad de Carupano, tienen 2  hijos mayores de edad
Responsable según el control de casos: Edgar Dunn/ Victoria Pereira
Revisión 1: En fecha 08/11/2024 la sra Keila indicó que lo por este año el conyuge no puede venir de Carupano a firmar la solcitud de divorcio ante el tribunal competente
Revisión 2: En fecha 11/02/25 se presentó solicitud de divorcio; en el URDD de Municipio Nro. 2553
Revisión 3: Exp Nro 9372-25 Tribunal 3ero de Municipio
Revisión 4: En fecha 05/03/25 Se consigno boleta firmada del fiscal
Revisión 5: En fecha 07/03/25 El fiscal consigno opinión favorable', 7, 'V-16698299', 1, 1, 2, 18, 'V-77777777')
    RETURNING id_caso INTO v_id;
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-10-16',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/17 · Damelis Ramirez
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro)
    VALUES ('2024-10-29', '2024-10-29', 'Asistencia Judicial - Casos externos', 'Expediente del control de casos: GY24-25/17
Tipo según el libro: Divorcio causal no taxativas sentencias
Reseña: Acude a consulta porque se caso en el año 1988, manifestó que no convivió con el y desconoce su paradero por lo que quisiera divorciarse; consigna copia de acta de matrimonio y copia de su cédula de identidad
Responsable según el control de casos: Vincenzo Altobelli/ Edidson Lozano
Revisión 1: Se suguiere buscar información relativa al paradedo del conyuge Winer a través de algun familiar
Revisión 2: En fecha 19/11/24 se llamó a la sra. Damelis y se le indicó que debe buscar información del paradero del señor, ella va a buscar la información y debemos llamarle nuevamente la proxima semana
Revisión 3: En fecha 06/02/25 Se le envió mensaje vía whastApp preguntado si obtuvo información sobre su conyuge
Revisión 4: En fecha 07/02/25 la solicitante respondió el mensaje indicando que no ha obtenido información alguna
Revisión 5: En fecha 29/04/25 la sra Damelis escribió via WhastApp e informa que consiguió al Sr Winer quien se encuentra un poco delicado de salud pero si esta 
 disponible para firmar la solicitud  por lo que se reabre el caso y se le asigna al estudiante Edison lozano', 7, 'V-11206007', 1, 1, 1, 8, 'V-77777777')
    RETURNING id_caso INTO v_id;
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'En pausa según el control de casos 2024-2025', 'En proceso', '2024-10-29',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/21 · Senaira Marquez
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro)
    VALUES ('2024-11-06', '2024-11-06', 'Redacción documentos y/o convenio', 'Expediente del control de casos: GY24-25/21
Tipo según el libro: Titulo Supletorio
Reseña: Acude a consulta porque contruyo su casa sobre la placa de la casa de su hermana y quiere saber cual es la posibilidad de obtener un documento donde se le reconozca la propiedad
Responsable según el control de casos: Yuliana Pereira/ Edgar Dunn
Revisión 1: Se le brindó la asesoria; indicandole que en materia de bienes inmuebles, por ser esta construcción una estructura y que por su naturaleza no se puede dividir, no se puede realizar un documento que separe la propiedad de la planta baja con la propiedad de la planta alta', 7, 'V-5545543', 1, 0, 2, 1, 'V-77777777')
    RETURNING id_caso INTO v_id;
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-11-06',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/22 · Silvia Elena Idarraga Gallego
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro)
    VALUES ('2024-11-12', '2024-11-12', 'Redacción documentos y/o convenio', 'Expediente del control de casos: GY24-25/22
Tipo según el libro: Titulo Supletorio
Reseña: Acude a consulta porque consturyó una casita en el Core 8 y tiene un titulo de propiedad del terreno y quiere hacer un titulo supletorio sobre la casa que construyo con materiales que le suministró el gorbierno
Responsable según el control de casos: Vicenzo/Mathias
Revisión 1: Se escaneo el titulo de propiedad del terreno y se le solicitó realizar un croquis y descripción de la casa
Revisión 2: En fecha 12/12/2024 se presentó la solicittud de título supletorio
Revisión 3: Se fijó evacuación de testigos para el 22/01/2025 a a las 9:00 am
Revisión 4: En fecha 24/01/25 le fue entregado el título supletorio', 7, 'V-22824309', 1, 0, 2, 1, 'V-77777777')
    RETURNING id_caso INTO v_id;
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-11-12',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/28 · Wilfredo Gómez
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro)
    VALUES ('2024-11-20', '2024-11-20', 'Redacción documentos y/o convenio', 'Expediente del control de casos: GY24-25/28
Tipo según el libro: Constitución de Compañias
Reseña: Acude a consulta por requiere constituir una compañia sobre seguridad
Responsable según el control de casos: Mathias / Vincenzo', 7, 'V-13220768', 4, 0, 0, 2, 'V-77777777')
    RETURNING id_caso INTO v_id;
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-11-20',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/29 · Mauren Hernandez
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro)
    VALUES ('2024-11-27', '2024-11-27', 'Redacción documentos y/o convenio', 'Expediente del control de casos: GY24-25/29
Tipo según el libro: Declaración jurada (unión concubinaria)
Reseña: Acude a consulta porque fue atentida por clínica Jurídicas Caracas donde emitieron un documento de disolucion unilateral de Unión estable de hecho; al llevarlo a la notaria de Puerto Ordaz ordenaron hacer una correción
Responsable según el control de casos: Mathias / Vincenzo
Revisión 1: En fecha 04/12/24 la Solicitante retiró el justificativo de concubinato y manifestó requerir asesoria en manteria penal; se solcitó apoyo al prof. Roberto Delgado y la atenderá el 05/12/24 a las 4:00 pm', 7, 'V-11196085', 1, 0, 1, 5, 'V-77777777')
    RETURNING id_caso INTO v_id;
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-11-27',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/30 · Eyker Torres
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro)
    VALUES ('2024-12-11', '2024-12-11', 'Redacción documentos y/o convenio', 'Expediente del control de casos: GY24-25/30
Tipo según el libro: Autorización para viajar
Reseña: Consulta vía correo electrónico la posibilidad de gestionar un permiso de viaje internacional para sus hijos menores de edad; quienes viajarían a Mexico para reunificación familiar con su Madre quien es venezolana y mexicana
Responsable según el control de casos: Yuliana Pereira/ Edgar Dunn
Revisión 1: Se le indicó que se puede realizar pero se require además de los recaudos enviados (partidas de nacimientos, cedulas y pasaportes) el boleto aéreo
Revisión 2: En fecha 17/01/2025 nos comunicamos con el solicitante y con la madre de los niños e indican que aun no tienen los boletos de viajes, al comprarlos nos informarán
Revisión 3: En fecha 06/02/25 Se llamó al solicitante e indicó que aún no tiene fecha de viaje por lo que el caso se paraliza, se comunicará al tener ese tema resuelto
Revisión 4: En fecha 03/06/25 informó que ya compraron los pasajes
Revisión 5: En fecha 04/06/25 se presentó solciitud de autorización de viaje con cambio de residencia', 7, 'V-12876140', 1, 1, 2, 9, 'V-77777777')
    RETURNING id_caso INTO v_id;
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2024-12-11',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/33 · Yexibel Adriana Subero Gamez
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro)
    VALUES ('2025-01-28', '2025-01-28', 'Redacción documentos y/o convenio', 'Expediente del control de casos: GY24-25/33
Tipo según el libro: Compra -Venta de bien inmueble
Reseña: Acude a consulta porque está comprando una casa en el Sector José Tadeo Monagas de San Felíx; la vendedora  tiene a disposición un titulo supletorio y una venta por Notaria
Responsable según el control de casos: prof. Minelvis
Revisión 1: Se le brindo la asesoria, se revisó la documentación y se le indicó acudir a CVG Bienes Inmuebles como ente administrador de los terrenos del sector', 7, 'V-29543234', 1, 0, 3, 2, 'V-77777777')
    RETURNING id_caso INTO v_id;
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-01-28',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY 24-25/34 · Eily Flores
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro)
    VALUES ('2025-04-01', '2025-04-01', 'Asistencia Judicial - Casos externos', 'Expediente del control de casos: GY 24-25/34
Tipo según el libro: Divorcio causal no taxativas sentencias
Reseña: Acude a consulta porque en fecha 11/03/2025 fue victima de violencia por parte de su conyuge (tiene activo, un proceso judicial por violencia de genero); tienen 2 hijos menores de edad ( 7  años la niña y 4 años el niño respectivamente); desea divorciarse y el conyuge esta de acuerdo
Responsable según el control de casos: Edidson Lozano
Revisión 1: Se le brindó la asesoría; se le indicaron los recaudos a consignar y se le solicitó el número de telefono del conyuge para conversar con el y verificar que está de acuerdo con la presentación del divorcio.
Revisión 2: En fecha 23/04/25 la sra Eilyn acudió a consulta para revisar el borrador del documento; se le hicieron una serie de preguntas relacionadas con el documento y se conversó sobre la situación de violencia por lo que indico que en el tribunal el Nro, de exp es FP12-S-2025-000549 Tribunal 2do de Control.
Revisión 3: En fecha 07/05/2025 se presentó ante el circuito de protección por verificar numero de expediente asignado y tribunal
Revisión 4: le fue asignado el expediente Nro. FP11-J-2025-587 en el tribunal 4to de protección
Revisión 5: Fué admitido el 26/05 y sentenciado el 02/06/25 pendiente por solicitar ejecución', 7, 'V-21251277', 1, 1, 2, 18, 'V-77777777')
    RETURNING id_caso INTO v_id;
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-04-01',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY 24-25/35 · José Luis Morales Morales
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro)
    VALUES ('2025-04-01', '2025-04-01', 'Asistencia Judicial - Casos externos', 'Expediente del control de casos: GY 24-25/35
Tipo según el libro: Divorcio causal no taxativas sentencias
Reseña: Acude a consulta porque desea divorciarse, su pareja está de acuerdo y no tienen hijos ni bienes en común/ ya fue antendido atenriormente por el servicio de clínica jurídica porque el acta de matrimonio tenia un error por lo que se llevo a cabo un proceso de rectificación de acta de matrimonio
Responsable según el control de casos: Bautista García
Revisión 1: Se le  brindó la asesoría se le indicó los reacaudos a consignar; se escaneó el acta de matrimonio queda pendiente las copias de las cédulas
Revisión 2: En fecha 30/04/25 se presentó ante la URDD de Municipio la solicitud de divorcio Nro. de Distribución 3216
Revisión 3: Le fue asignado el exp 9231-25 en el Tribunal 2do de Municipio
Revisión 4: Fue admitido con fecha 09/05; pendiente por notificación fiscal
Revisión 5: Sentenciado en fecha 19/06/2025', 7, 'V-6692584', 1, 1, 2, 18, 'V-77777777')
    RETURNING id_caso INTO v_id;
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-04-01',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY 24-25/36 · Efren Martínez
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro)
    VALUES ('2025-04-01', '2025-04-01', 'Asistencia Judicial - Casos externos', 'Expediente del control de casos: GY 24-25/36
Tipo según el libro: Divorcio causal no taxativas sentencias
Reseña: Acude a consulta porque quiere divorciarse; esta casado desde el 24/08/2012, tienen 2 hijos menores de edad (16 y 17 años); la conyuge Kaenia Corales se fue de la casa estando separados por mas de 3 años
Responsable según el control de casos: Ana Moreno
Revisión 1: Se le brindó la asesoria; consigna copia del acta de matrimonio; copia de las cédulas de los conyuges y copias de las actas de nacimientos de los hijos; pendiente por consignar copia de cédula de los hijos; indicó numero de telefono de la cónyuge  0412 9950124
Revisión 2: En fecha 01/04/2025 se recibió via whatsApp acta de nacimientos de los hijos
Revisión 3: En fecha 20-05-25 recibio asesoriamiento sobre el seguimiento a su divorcio y solicito que contactaran a su esposa a los efectos de establecer la manutención para seguir con el proceso del divorcio.
Revisión 4: Doc redactado guardado en el drive pendiente: información en relación a la manutención
Revisión 5: En fecha 30/07/25 se presentó solicitud de divorcio ante el tribunal', 7, 'V-18450908', 1, 1, 2, 18, 'V-77777777')
    RETURNING id_caso INTO v_id;
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'En proceso según el control de casos 2024-2025', 'En proceso', '2025-04-01',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/39 · Norys Del Carmen Alvarez Romero
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro)
    VALUES ('2025-04-02', '2025-04-02', 'Asistencia Judicial - Casos externos', 'Expediente del control de casos: GY24-25/39
Tipo según el libro: Divorcio causal no taxativas sentencias
Reseña: Acude a consulta por que se quiere divorciar; esta casada hace 7 años tienen dos hijas en común de 9 años y de 18 años ; su conyuge Luis Alfredo Mota su telefono 04164973384
Responsable según el control de casos: Edgar Dunn / Victoria Pereira
Revisión 1: Se le brindó asesoria; consigno acta de matrimonio, copia de cédula de los conyuges, acta de nacimientos de los hijos
Revisión 2: En el drive se encuentra redactado a la espera de información solicitada via whastApp a la señora Noris
Revisión 3: En fecha 01/10/2025 ante el Tribunal de Protección; pendiente verificar asinganción de Nro. de Tribunal y de expediente
Revisión 4: Exp FP11-J-2025-1667 Sentenciado con fecha 09/10/25 y en feca 05/03/26 se solicitó ejecución', 7, 'V-17885343', 1, 1, 2, 18, 'V-77777777')
    RETURNING id_caso INTO v_id;
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'En proceso según el control de casos 2024-2025', 'En proceso', '2025-04-02',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/43 · Robert Astudillo
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro)
    VALUES ('2025-04-23', '2025-04-23', 'Asistencia Judicial - Casos externos', 'Expediente del control de casos: GY24-25/43
Tipo según el libro: Divorcio causal no taxativas sentencias
Reseña: Acude a consulta porque se quiere divorciar, tiene 2 años separado de cuerpo; la Conyuge vive en Margarita, tienen 2 hijos en comun de 14 y 5 años que viven con la mamá.
Responsable según el control de casos: Victoria Pereira
Revisión 1: Se le brindó la asesoría, se le indicaron los recaudos a consignar y se le indicó que debe hablar con la conyuge para informarle que quiere realizar este proceso
Revisión 2: Llamar al señor Robert a los fines deponerlo al tanto de la negativa de la señora a divorciarse y ponerlo al tanto de las condiciones de la señora isabel , revisar mensajes del telefono.
Revisión 3: En fecha 08/07/25 se llamo al Sr Robert informando sobre la negativa de la sra Isabel y se cierra el caso; se le sugirió mediar con la señora y a futuro acudir nuevamente a este espacio de atención', 7, 'V-18169044', 1, 1, 2, 18, 'V-77777777')
    RETURNING id_caso INTO v_id;
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-04-23',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/44 · María Mota
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro)
    VALUES ('2025-04-23', '2025-04-23', 'Redacción documentos y/o convenio', 'Expediente del control de casos: GY24-25/44
Tipo según el libro: Cesión de Derechos
Reseña: Acude a consulta porque su concubino quiere cederle los derechos sobre la casa donde habitan; mostró el titulo supletorio original
Responsable según el control de casos: Edgar Dunn
Revisión 1: Se le brindó asesoria; se le sugiró hacer el registro de su concubinato ante el Registro Civil para posteriormente hacer la solicitud de venta del terreno sobre la cual se encuentran las Bienhechurías ante CVG Bienes Inmuebles o en caso negativo solicitar a CVG autorización para hacer un nuevo titulo supleotrio', 7, 'V-9906226', 1, 0, 3, 9, 'V-77777777')
    RETURNING id_caso INTO v_id;
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-04-23',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/45 · Sergio Jimenez
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro)
    VALUES ('2025-04-29', '2025-04-29', 'Asistencia Judicial - Casos externos', 'Expediente del control de casos: GY24-25/45
Tipo según el libro: Otros (Reconstrucción de acta de matrimonio de sus padres)
Reseña: Acude a consulta porque tiene en curso en tribunales la solicitud de DDUU por el fallecimiento de su padre pero le indican que debe presentar el acta de matirmonio original de sus padres; resulta que por una degracia natural en Cumaná esta acta se perdió
Responsable según el control de casos: Edidson Lozano
Revisión 1: Se le brindó la asesoria que debe pedir una reconstrucción de acta de matrimonio por el Registro Civil de Cumana', 7, 'V-19420603', 1, 0, 1, 2, 'V-77777777')
    RETURNING id_caso INTO v_id;
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-04-29',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/46 · Gladis Cardoza
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro)
    VALUES ('2025-04-29', '2025-04-29', 'Asistencia Judicial - Casos externos', 'Expediente del control de casos: GY24-25/46
Tipo según el libro: Divorcio causal no taxativas sentencias
Reseña: Acude a consulta porque se casó en el año 2014, no tienen hijos en comun ni bienes; se separaron hace aproxidamente 7 años  (19/03/2018); la señora no tiene conocimiento del paradero actual del conyuge Elías pero en su momento tenia información de que se fue a la minas del Callao y que quiere divorciarse
Responsable según el control de casos: Ana Moreno
Revisión 1: Se le brindó asesoria, consigno copia de acta de matrimonio y copia de cédulas de ambos conyuges; se le indicó que debe solicitar una copia certificada del acta de matrimonio y ubicar información a través de familiares o amigos del paradero del conyuge Elias', 7, 'V-8370445', 1, 1, 2, 18, 'V-77777777')
    RETURNING id_caso INTO v_id;
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'En pausa según el control de casos 2024-2025', 'En proceso', '2025-04-29',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/48 · Georgina Bejarano
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro)
    VALUES ('2025-05-20', '2025-05-20', 'Redacción documentos y/o convenio', 'Expediente del control de casos: GY24-25/48
Tipo según el libro: Arredamiento/Comodato
Reseña: Acude a consulta por la redaccion de un contrato de arrendamiento a titulo personal, dado que el vigente es bajo una figura juridica, solicita que llamen a su arrendantario  para ponerlo al tanto de las implicaciones legales y bajo su aceptacion continuar con el contrato de arrendamiento
Responsable según el control de casos: Niuska Calderon y Bautista Rosas
Revisión 1: En fecha 01-07-2025 consigno la información pertinente para la redacción del mismo.
Revisión 2: En fecha 22/10/25 se entregó el documento a la solicitante', 7, 'V-14986003', 1, 0, 3, 1, 'V-77777777')
    RETURNING id_caso INTO v_id;
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-05-20',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/49 · Mariannis Garcia
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro)
    VALUES ('2025-05-21', '2025-05-21', 'Asistencia Judicial - Casos externos', 'Expediente del control de casos: GY24-25/49
Tipo según el libro: Divorcio causal no taxativas sentencias
Reseña: Acude a consulta para solicitar el divorcio, tiene tres hijos  menores de edad,  sin bienes en comun , suministrando el numero de su conyuge 0416-280764
Responsable según el control de casos: Bautista Garcia
Revisión 1: En fecha 14-07-2025 nos comunicamos con el conyuge que a la fecha no habia dado respuestas a los efectos de finiquitar el aporte de manutención de las niñas, y no lo logramos contactar nuevamente, quedando a la espera de su respuesta.
Revisión 2: En fecha 18/07/25 se presentó solicitud al tribunal', 7, 'V-20506378', 1, 1, 2, 18, 'V-77777777')
    RETURNING id_caso INTO v_id;
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'En proceso según el control de casos 2024-2025', 'En proceso', '2025-05-21',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/51 · Yaritza Martínez
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro)
    VALUES ('2025-05-27', '2025-05-27', 'Asistencia Judicial - Casos externos', 'Expediente del control de casos: GY24-25/51
Tipo según el libro: Divorcio causal no taxativas sentencias
Reseña: Solicita asesoria para realizar su proceso de divorcio, y el proceso correspondiente para llevarlo por Delta Amacuro, toda vez que no somos competentes a causa de la jurrisdiccion
Responsable según el control de casos: Bautista Rosas', 7, 'V-15429858', 1, 1, 1, 8, 'V-77777777')
    RETURNING id_caso INTO v_id;
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-05-27',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/53 · Felix Zambrano
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro)
    VALUES ('2025-06-03', '2025-06-03', 'Asistencia Judicial - Casos externos', 'Expediente del control de casos: GY24-25/53
Tipo según el libro: Divorcio causal no taxativas sentencias
Reseña: Solicita asesoria porque tiene 18 años separado de su conyuge, la cual se encuentra en brasil, tiene 7 hijos
Responsable según el control de casos: Niuska Calderon
Revisión 1: Se redactó el documento se encuentra en el drive pendiente por la información que debe suministrar el sr Felix  (partidas  de nacimiento y cedulas de los 7 hijos)', 7, 'V-11512882', 1, 1, 2, 18, 'V-77777777')
    RETURNING id_caso INTO v_id;
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'En pausa según el control de casos 2024-2025', 'En proceso', '2025-06-03',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/54 · Columba Corales
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro)
    VALUES ('2025-06-03', '2025-06-03', 'Asistencia Judicial - Casos externos', 'Expediente del control de casos: GY24-25/54
Tipo según el libro: Divorcio causal no taxativas sentencias
Reseña: Acude a consulta proque tiene 18 años separados de cuerpo, tienen 7 hijos, su esposa se encuentra en Brasil, solicitan el Divorcio por mutuo acuerdo, a tales efectos se le refirio que consignara las partidas de nacimiento de los hijos, original de la acta de matrimonio, copias de las cedulas y nos indicara un contacto para poder comunicarnos con la señora
Responsable según el control de casos: Bautista Rosas
Revisión 1: 01-07-2025 se redacto el documento, estamos a la espera de que se  actualicen las partidas de nacimiento de sus hijos.
Revisión 2: En fecha  01-07-2025 se acordo cita para verificar el estado de las partidas de nacimiento de sus hijos.', 7, 'V-12396754', 1, 1, 2, 18, 'V-77777777')
    RETURNING id_caso INTO v_id;
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'En proceso según el control de casos 2024-2025', 'En proceso', '2025-06-03',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/56 · Luz Avelina Marquéz Figueroa
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro)
    VALUES ('2025-06-04', '2025-06-04', 'Redacción documentos y/o convenio', 'Expediente del control de casos: GY24-25/56
Tipo según el libro: Titulo supletorio
Reseña: Acude a consulta porque está a cargo de 2 casas (una que fue de su padre y otra es de su madre) quiere arreglar el tema de la titularidad del derecho
Responsable según el control de casos: yuliana Pereira / Edgar Dunn
Revisión 1: Se le brindó asesoria y se le indicó verificar documentos que posee de las casas para poder brindarle la orientación definitiva
Revisión 2: En fecha 25/06/2025 acudió con los documentos disponibles; se revisaron y se le brindó la asesoria correspondiente.
Revisión 3: Se le indicó acudir al seniat para realizar la declaración sucesoral solicitando la prescripcion por el tiempo transcurrido de la muerte de su papa; y en el caso de la mama´debe iniciar el proceso de solicitud de autorización para realizar titulo supletorio en CVG', 7, 'V-23552118', 1, 0, 2, 1, 'V-77777777')
    RETURNING id_caso INTO v_id;
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-06-04',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/57 · Yandira del Carmen Naveda Leira
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro)
    VALUES ('2025-10-06', '2025-10-06', 'Redacción documentos y/o convenio', 'Expediente del control de casos: GY24-25/57
Tipo según el libro: Partición de la comunidad conyugal
Reseña: acude a consulta porque esta casada pero separada de hecho hace varios años, conviven en la misma casa, tienen hijos en común y quiere colocar todos los bienes a su nombre porque el señor tiene hijos de un primer matrimonio
Responsable según el control de casos: Edidson Lozano / Niuska Calderón
Revisión 1: Se le brindó asesoría y se le indicó que las 2 posibles soluciones son: Divorciarse  y luego liquidar la comunidad conyugal ó realizar una cesión de bienes a favor de los hijos en común con usufructo vitalicio.', 7, 'V-5426329', 1, 1, 1, 5, 'V-77777777')
    RETURNING id_caso INTO v_id;
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-10-06',
            'V-77777777', 'V-77777777');

    -- UCAB Guayana · GY24-25/63 · Dina Girón
    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,
        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro)
    VALUES ('2025-07-08', '2025-07-08', 'Asistencia Judicial - Casos externos', 'Expediente del control de casos: GY24-25/63
Tipo según el libro: Titulo supletorio
Reseña: Acude a consulta porque compro unas bienhechurias en la zona de urb. Altos del Atlántico pero no tiene documentos por ser en un terreno de la CVG se requiere hacer titulo supletorio, pidieron autorización a CVG la cual fue aprobada
Responsable según el control de casos: Niuska Calderon
Revisión 1: Se revisaron los recaudos y se procede a redactar el titulo supletorio
Revisión 2: En fecha 11/07/25 se presentó solicitud ante el tribunal pendiente por evacaucón de testigos
Revisión 3: En octubre fue cerrado la solicitante obtuuvo su titulo supleotrio', 7, 'V-16945535', 1, 0, 2, 1, 'V-77777777')
    RETURNING id_caso INTO v_id;
    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,
        id_usuario_cambia, id_usuario_registro)
    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,
            v_id, 'Cerrado según el control de casos 2024-2025', 'Entregado', '2025-07-08',
            'V-77777777', 'V-77777777');

END $carga$;

-- Constancia de la carga en la propia auditoría.
RESET app.skip_audit_trigger;
INSERT INTO auditoria_eventos (entidad, operacion, id_usuario, datos_nuevos, metadata)
VALUES ('carga_inicial', 'insercion', 'V-77777777',
    jsonb_build_object('solicitantes', 39, 'viviendas', 33,
        'familias_y_hogares', 7, 'caracteristicas', 326, 'casos', 32),
    jsonb_build_object('origen', 'Libros de la clínica 2024-2025', 'generado_por', 'scripts/etl-carga-inicial.mjs'));

COMMIT;
