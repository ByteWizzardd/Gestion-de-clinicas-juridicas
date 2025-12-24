-- ============================================================
-- SCRIPT DE CARGA DE ESTADOS, MUNICIPIOS Y PARROQUIAS DE VENEZUELA
-- ============================================================
-- Este script inserta todos los estados, municipios y parroquias de Venezuela
-- 
-- IMPORTANTE: 
-- - Este script es idempotente (puede ejecutarse múltiples veces)
-- - Usa ON CONFLICT para evitar duplicados
-- - Limpia datos previos antes de insertar
-- ============================================================

-- Limpiar cualquier transacción abortada previa
ROLLBACK;

BEGIN;

-- Diferir la validación de foreign keys hasta el final de la transacción
-- Esto permite eliminar datos en cualquier orden
SET CONSTRAINTS ALL DEFERRED;

-- ============================================================
-- LIMPIAR DATOS EXISTENTES (en orden inverso de dependencias)
-- ============================================================
-- IMPORTANTE: Primero eliminamos las referencias (solicitantes y sus dependencias)
-- Luego eliminamos parroquias, municipios y estados

-- Eliminar parroquias, municipios y estados
-- Usamos SET CONSTRAINTS ALL DEFERRED para diferir la validación de foreign keys
-- Esto permite eliminar en cualquier orden sin conflictos
-- NOTA: Si hay solicitantes que referencian parroquias, se eliminarán primero
-- las dependencias de solicitantes para evitar conflictos

-- Eliminar dependencias de solicitantes que referencian parroquias
DELETE FROM asignadas_a;
DELETE FROM viviendas;
DELETE FROM familias_y_hogares;
DELETE FROM solicitantes;

-- Ahora podemos eliminar parroquias, municipios y estados
DELETE FROM parroquias;
DELETE FROM municipios;
DELETE FROM estados;

-- ============================================================
-- 1. INSERTAR ESTADOS
-- ============================================================
INSERT INTO estados (id_estado, nombre_estado) VALUES
(1, 'Amazonas'),
(2, 'Anzoátegui'),
(3, 'Apure'),
(4, 'Aragua'),
(5, 'Barinas'),
(6, 'Bolívar'),
(7, 'Carabobo'),
(8, 'Cojedes'),
(9, 'Delta Amacuro'),
(10, 'Falcón'),
(11, 'Guárico'),
(12, 'Lara'),
(13, 'Mérida'),
(14, 'Miranda'),
(15, 'Monagas'),
(16, 'Nueva Esparta'),
(17, 'Portuguesa'),
(18, 'Sucre'),
(19, 'Táchira'),
(20, 'Trujillo'),
(21, 'La Guaira'),
(22, 'Yaracuy'),
(23, 'Zulia'),
(24, 'Distrito Capital'),
(25, 'Dependencias Federales')
ON CONFLICT (id_estado) DO NOTHING;

-- ============================================================
-- 2. INSERTAR MUNICIPIOS
-- (Transformado: num_municipio se reinicia por cada estado)
-- ============================================================

-- Estado 1: Amazonas
INSERT INTO municipios (id_estado, num_municipio, nombre_municipio) VALUES 
(1, 1, 'Alto Orinoco'), (1, 2, 'Atabapo'), (1, 3, 'Atures'), 
(1, 4, 'Autana'), (1, 5, 'Manapiare'), (1, 6, 'Maroa'), (1, 7, 'Río Negro')
ON CONFLICT (id_estado, num_municipio) DO NOTHING;

-- Estado 2: Anzoátegui
INSERT INTO municipios (id_estado, num_municipio, nombre_municipio) VALUES 
(2, 1, 'Anaco'), (2, 2, 'Aragua'), (2, 3, 'Manuel Ezequiel Bruzual'), 
(2, 4, 'Diego Bautista Urbaneja'), (2, 5, 'Fernando Peñalver'), 
(2, 6, 'Francisco Del Carmen Carvajal'), (2, 7, 'General Sir Arthur McGregor'), 
(2, 8, 'Guanta'), (2, 9, 'Independencia'), (2, 10, 'José Gregorio Monagas'), 
(2, 11, 'Juan Antonio Sotillo'), (2, 12, 'Juan Manuel Cajigal'), (2, 13, 'Libertad'), 
(2, 14, 'Francisco de Miranda'), (2, 15, 'Pedro María Freites'), (2, 16, 'Píritu'), 
(2, 17, 'San José de Guanipa'), (2, 18, 'San Juan de Capistrano'), (2, 19, 'Santa Ana'), 
(2, 20, 'Simón Bolívar'), (2, 21, 'Simón Rodríguez')
ON CONFLICT (id_estado, num_municipio) DO NOTHING;

-- Estado 3: Apure
INSERT INTO municipios (id_estado, num_municipio, nombre_municipio) VALUES 
(3, 1, 'Achaguas'), (3, 2, 'Biruaca'), (3, 3, 'Muñóz'), (3, 4, 'Páez'), 
(3, 5, 'Pedro Camejo'), (3, 6, 'Rómulo Gallegos'), (3, 7, 'San Fernando')
ON CONFLICT (id_estado, num_municipio) DO NOTHING;

-- Estado 4: Aragua
INSERT INTO municipios (id_estado, num_municipio, nombre_municipio) VALUES 
(4, 1, 'Atanasio Girardot'), (4, 2, 'Bolívar'), (4, 3, 'Camatagua'), 
(4, 4, 'Francisco Linares Alcántara'), (4, 5, 'José Ángel Lamas'), 
(4, 6, 'José Félix Ribas'), (4, 7, 'José Rafael Revenga'), (4, 8, 'Libertador'), 
(4, 9, 'Mario Briceño Iragorry'), (4, 10, 'Ocumare de la Costa de Oro'), 
(4, 11, 'San Casimiro'), (4, 12, 'San Sebastián'), (4, 13, 'Santiago Mariño'), 
(4, 14, 'Santos Michelena'), (4, 15, 'Sucre'), (4, 16, 'Tovar'), 
(4, 17, 'Urdaneta'), (4, 18, 'Zamora')
ON CONFLICT (id_estado, num_municipio) DO NOTHING;

-- Estado 5: Barinas
INSERT INTO municipios (id_estado, num_municipio, nombre_municipio) VALUES 
(5, 1, 'Alberto Arvelo Torrealba'), (5, 2, 'Andrés Eloy Blanco'), 
(5, 3, 'Antonio José de Sucre'), (5, 4, 'Arismendi'), (5, 5, 'Barinas'), 
(5, 6, 'Bolívar'), (5, 7, 'Cruz Paredes'), (5, 8, 'Ezequiel Zamora'), 
(5, 9, 'Obispos'), (5, 10, 'Pedraza'), (5, 11, 'Rojas'), (5, 12, 'Sosa')
ON CONFLICT (id_estado, num_municipio) DO NOTHING;

-- Estado 6: Bolívar
INSERT INTO municipios (id_estado, num_municipio, nombre_municipio) VALUES 
(6, 1, 'Caroní'), (6, 2, 'Cedeño'), (6, 3, 'El Callao'), (6, 4, 'Gran Sabana'), 
(6, 5, 'Heres'), (6, 6, 'Piar'), (6, 7, 'Angostura (Raúl Leoni)'), 
(6, 8, 'Roscio'), (6, 9, 'Sifontes'), (6, 10, 'Sucre'), (6, 11, 'Padre Pedro Chien')
ON CONFLICT (id_estado, num_municipio) DO NOTHING;

-- Estado 7: Carabobo
INSERT INTO municipios (id_estado, num_municipio, nombre_municipio) VALUES 
(7, 1, 'Bejuma'), (7, 2, 'Carlos Arvelo'), (7, 3, 'Diego Ibarra'), 
(7, 4, 'Guacara'), (7, 5, 'Juan José Mora'), (7, 6, 'Libertador'), 
(7, 7, 'Los Guayos'), (7, 8, 'Miranda'), (7, 9, 'Montalbán'), 
(7, 10, 'Naguanagua'), (7, 11, 'Puerto Cabello'), (7, 12, 'San Diego'), 
(7, 13, 'San Joaquín'), (7, 14, 'Valencia')
ON CONFLICT (id_estado, num_municipio) DO NOTHING;

-- Estado 8: Cojedes
INSERT INTO municipios (id_estado, num_municipio, nombre_municipio) VALUES 
(8, 1, 'Anzoátegui'), (8, 2, 'Tinaquillo'), (8, 3, 'Girardot'), 
(8, 4, 'Lima Blanco'), (8, 5, 'Pao de San Juan Bautista'), (8, 6, 'Ricaurte'), 
(8, 7, 'Rómulo Gallegos'), (8, 8, 'San Carlos'), (8, 9, 'Tinaco')
ON CONFLICT (id_estado, num_municipio) DO NOTHING;

-- Estado 9: Delta Amacuro
INSERT INTO municipios (id_estado, num_municipio, nombre_municipio) VALUES 
(9, 1, 'Antonio Díaz'), (9, 2, 'Casacoima'), (9, 3, 'Pedernales'), (9, 4, 'Tucupita')
ON CONFLICT (id_estado, num_municipio) DO NOTHING;

-- Estado 10: Falcón
INSERT INTO municipios (id_estado, num_municipio, nombre_municipio) VALUES 
(10, 1, 'Acosta'), (10, 2, 'Bolívar'), (10, 3, 'Buchivacoa'), 
(10, 4, 'Cacique Manaure'), (10, 5, 'Carirubana'), (10, 6, 'Colina'), 
(10, 7, 'Dabajuro'), (10, 8, 'Democracia'), (10, 9, 'Falcón'), 
(10, 10, 'Federación'), (10, 11, 'Jacura'), (10, 12, 'José Laurencio Silva'), 
(10, 13, 'Los Taques'), (10, 14, 'Mauroa'), (10, 15, 'Miranda'), 
(10, 16, 'Monseñor Iturriza'), (10, 17, 'Palmasola'), (10, 18, 'Petit'), 
(10, 19, 'Píritu'), (10, 20, 'San Francisco'), (10, 21, 'Sucre'), 
(10, 22, 'Tocópero'), (10, 23, 'Unión'), (10, 24, 'Urumaco'), (10, 25, 'Zamora')
ON CONFLICT (id_estado, num_municipio) DO NOTHING;

-- Estado 11: Guárico
INSERT INTO municipios (id_estado, num_municipio, nombre_municipio) VALUES 
(11, 1, 'Camaguán'), (11, 2, 'Chaguaramas'), (11, 3, 'El Socorro'), 
(11, 4, 'José Félix Ribas'), (11, 5, 'José Tadeo Monagas'), (11, 6, 'Juan Germán Roscio'), 
(11, 7, 'Julián Mellado'), (11, 8, 'Las Mercedes'), (11, 9, 'Leonardo Infante'), 
(11, 10, 'Pedro Zaraza'), (11, 11, 'Ortíz'), (11, 12, 'San Gerónimo de Guayabal'), 
(11, 13, 'San José de Guaribe'), (11, 14, 'Santa María de Ipire'), 
(11, 15, 'Sebastián Francisco de Miranda')
ON CONFLICT (id_estado, num_municipio) DO NOTHING;

-- Estado 12: Lara
INSERT INTO municipios (id_estado, num_municipio, nombre_municipio) VALUES 
(12, 1, 'Andrés Eloy Blanco'), (12, 2, 'Crespo'), (12, 3, 'Iribarren'), 
(12, 4, 'Jiménez'), (12, 5, 'Morán'), (12, 6, 'Palavecino'), 
(12, 7, 'Simón Planas'), (12, 8, 'Torres'), (12, 9, 'Urdaneta')
ON CONFLICT (id_estado, num_municipio) DO NOTHING;

-- Estado 13: Mérida
INSERT INTO municipios (id_estado, num_municipio, nombre_municipio) VALUES 
(13, 1, 'Alberto Adriani'), (13, 2, 'Andrés Bello'), (13, 3, 'Antonio Pinto Salinas'), 
(13, 4, 'Aricagua'), (13, 5, 'Arzobispo Chacón'), (13, 6, 'Campo Elías'), 
(13, 7, 'Caracciolo Parra Olmedo'), (13, 8, 'Cardenal Quintero'), (13, 9, 'Guaraque'), 
(13, 10, 'Julio César Salas'), (13, 11, 'Justo Briceño'), (13, 12, 'Libertador'), 
(13, 13, 'Miranda'), (13, 14, 'Obispo Ramos de Lora'), (13, 15, 'Padre Noguera'), 
(13, 16, 'Pueblo Llano'), (13, 17, 'Rangel'), (13, 18, 'Rivas Dávila'), 
(13, 19, 'Santos Marquina'), (13, 20, 'Sucre'), (13, 21, 'Tovar'), 
(13, 22, 'Tulio Febres Cordero'), (13, 23, 'Zea')
ON CONFLICT (id_estado, num_municipio) DO NOTHING;

-- Estado 14: Miranda
INSERT INTO municipios (id_estado, num_municipio, nombre_municipio) VALUES 
(14, 1, 'Acevedo'), (14, 2, 'Andrés Bello'), (14, 3, 'Baruta'), (14, 4, 'Brión'), 
(14, 5, 'Buroz'), (14, 6, 'Carrizal'), (14, 7, 'Chacao'), (14, 8, 'Cristóbal Rojas'), 
(14, 9, 'El Hatillo'), (14, 10, 'Guaicaipuro'), (14, 11, 'Independencia'), 
(14, 12, 'Lander'), (14, 13, 'Los Salias'), (14, 14, 'Páez'), (14, 15, 'Paz Castillo'), 
(14, 16, 'Pedro Gual'), (14, 17, 'Plaza'), (14, 18, 'Simón Bolívar'), 
(14, 19, 'Sucre'), (14, 20, 'Urdaneta'), (14, 21, 'Zamora')
ON CONFLICT (id_estado, num_municipio) DO NOTHING;

-- Estado 15: Monagas
INSERT INTO municipios (id_estado, num_municipio, nombre_municipio) VALUES 
(15, 1, 'Acosta'), (15, 2, 'Aguasay'), (15, 3, 'Bolívar'), (15, 4, 'Caripe'), 
(15, 5, 'Cedeño'), (15, 6, 'Ezequiel Zamora'), (15, 7, 'Libertador'), 
(15, 8, 'Maturín'), (15, 9, 'Piar'), (15, 10, 'Punceres'), 
(15, 11, 'Santa Bárbara'), (15, 12, 'Sotillo'), (15, 13, 'Uracoa')
ON CONFLICT (id_estado, num_municipio) DO NOTHING;

-- Estado 16: Nueva Esparta
INSERT INTO municipios (id_estado, num_municipio, nombre_municipio) VALUES 
(16, 1, 'Antolín del Campo'), (16, 2, 'Arismendi'), (16, 3, 'García'), 
(16, 4, 'Gómez'), (16, 5, 'Maneiro'), (16, 6, 'Marcano'), (16, 7, 'Mariño'), 
(16, 8, 'Península de Macanao'), (16, 9, 'Tubores'), (16, 10, 'Villalba'), (16, 11, 'Díaz')
ON CONFLICT (id_estado, num_municipio) DO NOTHING;

-- Estado 17: Portuguesa
INSERT INTO municipios (id_estado, num_municipio, nombre_municipio) VALUES 
(17, 1, 'Agua Blanca'), (17, 2, 'Araure'), (17, 3, 'Esteller'), (17, 4, 'Guanare'), 
(17, 5, 'Guanarito'), (17, 6, 'Monseñor José Vicente de Unda'), (17, 7, 'Ospino'), 
(17, 8, 'Páez'), (17, 9, 'Papelón'), (17, 10, 'San Genaro de Boconoíto'), 
(17, 11, 'San Rafael de Onoto'), (17, 12, 'Santa Rosalía'), (17, 13, 'Sucre'), 
(17, 14, 'Turén')
ON CONFLICT (id_estado, num_municipio) DO NOTHING;

-- Estado 18: Sucre
INSERT INTO municipios (id_estado, num_municipio, nombre_municipio) VALUES 
(18, 1, 'Andrés Eloy Blanco'), (18, 2, 'Andrés Mata'), (18, 3, 'Arismendi'), 
(18, 4, 'Benítez'), (18, 5, 'Bermúdez'), (18, 6, 'Bolívar'), (18, 7, 'Cajigal'), 
(18, 8, 'Cruz Salmerón Acosta'), (18, 9, 'Libertador'), (18, 10, 'Mariño'), 
(18, 11, 'Mejía'), (18, 12, 'Montes'), (18, 13, 'Ribero'), (18, 14, 'Sucre'), 
(18, 15, 'Valdéz')
ON CONFLICT (id_estado, num_municipio) DO NOTHING;

-- Estado 19: Táchira
INSERT INTO municipios (id_estado, num_municipio, nombre_municipio) VALUES 
(19, 1, 'Andrés Bello'), (19, 2, 'Antonio Rómulo Costa'), (19, 3, 'Ayacucho'), 
(19, 4, 'Bolívar'), (19, 5, 'Cárdenas'), (19, 6, 'Córdoba'), (19, 7, 'Fernández Feo'), 
(19, 8, 'Francisco de Miranda'), (19, 9, 'García de Hevia'), (19, 10, 'Guásimos'), 
(19, 11, 'Independencia'), (19, 12, 'Jáuregui'), (19, 13, 'José María Vargas'), 
(19, 14, 'Junín'), (19, 15, 'Libertad'), (19, 16, 'Libertador'), (19, 17, 'Lobatera'), 
(19, 18, 'Michelena'), (19, 19, 'Panamericano'), (19, 20, 'Pedro María Ureña'), 
(19, 21, 'Rafael Urdaneta'), (19, 22, 'Samuel Darío Maldonado'), (19, 23, 'San Cristóbal'), 
(19, 24, 'Seboruco'), (19, 25, 'Simón Rodríguez'), (19, 26, 'Sucre'), 
(19, 27, 'Torbes'), (19, 28, 'Uribante'), (19, 29, 'San Judas Tadeo')
ON CONFLICT (id_estado, num_municipio) DO NOTHING;

-- Estado 20: Trujillo
INSERT INTO municipios (id_estado, num_municipio, nombre_municipio) VALUES 
(20, 1, 'Andrés Bello'), (20, 2, 'Boconó'), (20, 3, 'Bolívar'), 
(20, 4, 'Candelaria'), (20, 5, 'Carache'), (20, 6, 'Escuque'), 
(20, 7, 'José Felipe Márquez Cañizalez'), (20, 8, 'Juan Vicente Campos Elías'), 
(20, 9, 'La Ceiba'), (20, 10, 'Miranda'), (20, 11, 'Monte Carmelo'), 
(20, 12, 'Motatán'), (20, 13, 'Pampán'), (20, 14, 'Pampanito'), 
(20, 15, 'Rafael Rangel'), (20, 16, 'San Rafael de Carvajal'), (20, 17, 'Sucre'), 
(20, 18, 'Trujillo'), (20, 19, 'Urdaneta'), (20, 20, 'Valera')
ON CONFLICT (id_estado, num_municipio) DO NOTHING;

-- Estado 21: La Guaira
INSERT INTO municipios (id_estado, num_municipio, nombre_municipio) VALUES 
(21, 1, 'Vargas')
ON CONFLICT (id_estado, num_municipio) DO NOTHING;

-- Estado 22: Yaracuy
INSERT INTO municipios (id_estado, num_municipio, nombre_municipio) VALUES 
(22, 1, 'Arístides Bastidas'), (22, 2, 'Bolívar'), (22, 3, 'Bruzual'), 
(22, 4, 'Cocorote'), (22, 5, 'Independencia'), (22, 6, 'José Antonio Páez'), 
(22, 7, 'La Trinidad'), (22, 8, 'Manuel Monge'), (22, 9, 'Nirgua'), 
(22, 10, 'Peña'), (22, 11, 'San Felipe'), (22, 12, 'Sucre'), 
(22, 13, 'Urachiche'), (22, 14, 'José Joaquín Veroes')
ON CONFLICT (id_estado, num_municipio) DO NOTHING;

-- Estado 23: Zulia
INSERT INTO municipios (id_estado, num_municipio, nombre_municipio) VALUES 
(23, 1, 'Almirante Padilla'), (23, 2, 'Baralt'), (23, 3, 'Cabimas'), 
(23, 4, 'Catatumbo'), (23, 5, 'Colón'), (23, 6, 'Francisco Javier Pulgar'), 
(23, 7, 'Páez'), (23, 8, 'Jesús Enrique Losada'), (23, 9, 'Jesús María Semprún'), 
(23, 10, 'La Cañada de Urdaneta'), (23, 11, 'Lagunillas'), (23, 12, 'Machiques de Perijá'), 
(23, 13, 'Mara'), (23, 14, 'Maracaibo'), (23, 15, 'Miranda'), 
(23, 16, 'Rosario de Perijá'), (23, 17, 'San Francisco'), (23, 18, 'Santa Rita'), 
(23, 19, 'Simón Bolívar'), (23, 20, 'Sucre'), (23, 21, 'Valmore Rodríguez')
ON CONFLICT (id_estado, num_municipio) DO NOTHING;

-- Estado 24: Distrito Capital
INSERT INTO municipios (id_estado, num_municipio, nombre_municipio) VALUES 
(24, 1, 'Libertador');

-- ============================================================
-- 3. INSERTAR PARROQUIAS
-- (Transformado: num_parroquia se reinicia por cada municipio)
-- ============================================================

-- Amazonas (Estado 1)
INSERT INTO parroquias (id_estado, num_municipio, num_parroquia, nombre_parroquia) VALUES 
(1, 1, 1, 'Alto Orinoco'), (1, 1, 2, 'Huachamacare Acanaña'), (1, 1, 3, 'Marawaka Toky Shamanaña'), (1, 1, 4, 'Mavaka Mavaka'), (1, 1, 5, 'Sierra Parima Parimabé'),
(1, 2, 1, 'Ucata Laja Lisa'), (1, 2, 2, 'Yapacana Macuruco'), (1, 2, 3, 'Caname Guarinuma'),
(1, 3, 1, 'Fernando Girón Tovar'), (1, 3, 2, 'Luis Alberto Gómez'), (1, 3, 3, 'Pahueña Limón de Parhueña'), (1, 3, 4, 'Platanillal Platanillal'),
(1, 4, 1, 'Samariapo'), (1, 4, 2, 'Sipapo'), (1, 4, 3, 'Munduapo'), (1, 4, 4, 'Guayapo'),
(1, 5, 1, 'Alto Ventuari'), (1, 5, 2, 'Medio Ventuari'), (1, 5, 3, 'Bajo Ventuari'),
(1, 6, 1, 'Victorino'), (1, 6, 2, 'Comunidad'),
(1, 7, 1, 'Casiquiare'), (1, 7, 2, 'Cocuy'), (1, 7, 3, 'San Carlos de Río Negro'), (1, 7, 4, 'Solano');

-- Anzoátegui (Estado 2)
INSERT INTO parroquias (id_estado, num_municipio, num_parroquia, nombre_parroquia) VALUES 
(2, 1, 1, 'Anaco'), (2, 1, 2, 'San Joaquín'),
(2, 2, 1, 'Cachipo'), (2, 2, 2, 'Aragua de Barcelona'),
(2, 3, 1, 'Clarines'), (2, 3, 2, 'Guanape'), (2, 3, 3, 'Sabana de Uchire'),
(2, 4, 1, 'Lechería'), (2, 4, 2, 'El Morro'),
(2, 5, 1, 'Puerto Píritu'), (2, 5, 2, 'San Miguel'), (2, 5, 3, 'Sucre'),
(2, 6, 1, 'Valle de Guanape'), (2, 6, 2, 'Santa Bárbara'),
(2, 7, 1, 'El Chaparro'), (2, 7, 2, 'Tomás Alfaro'), (2, 7, 3, 'Calatrava'),
(2, 8, 1, 'Guanta'), (2, 8, 2, 'Chorrerón'),
(2, 9, 1, 'Mamo'), (2, 9, 2, 'Soledad'),
(2, 10, 1, 'Mapire'), (2, 10, 2, 'Piar'), (2, 10, 3, 'Santa Clara'), (2, 10, 4, 'San Diego de Cabrutica'), (2, 10, 5, 'Uverito'), (2, 10, 6, 'Zuata'),
(2, 11, 1, 'Puerto La Cruz'), (2, 11, 2, 'Pozuelos'),
(2, 12, 1, 'Onoto'), (2, 12, 2, 'San Pablo'),
(2, 13, 1, 'San Mateo'), (2, 13, 2, 'El Carito'), (2, 13, 3, 'Santa Inés'), (2, 13, 4, 'La Romereña'),
(2, 14, 1, 'Atapirire'), (2, 14, 2, 'Boca del Pao'), (2, 14, 3, 'El Pao'), (2, 14, 4, 'Pariaguán'),
(2, 15, 1, 'Cantaura'), (2, 15, 2, 'Libertador'), (2, 15, 3, 'Santa Rosa'), (2, 15, 4, 'Urica'),
(2, 16, 1, 'Píritu'), (2, 16, 2, 'San Francisco'),
(2, 17, 1, 'San José de Guanipa'),
(2, 18, 1, 'Boca de Uchire'), (2, 18, 2, 'Boca de Chávez'),
(2, 19, 1, 'Pueblo Nuevo'), (2, 19, 2, 'Santa Ana'),
(2, 20, 1, 'Bergantín'), (2, 20, 2, 'Caigua'), (2, 20, 3, 'El Carmen'), (2, 20, 4, 'El Pilar'), (2, 20, 5, 'Naricual'), (2, 20, 6, 'San Crsitóbal'),
(2, 21, 1, 'Edmundo Barrios'), (2, 21, 2, 'Miguel Otero Silva');

-- Apure (Estado 3)
INSERT INTO parroquias (id_estado, num_municipio, num_parroquia, nombre_parroquia) VALUES 
(3, 1, 1, 'Achaguas'), (3, 1, 2, 'Apurito'), (3, 1, 3, 'El Yagual'), (3, 1, 4, 'Guachara'), (3, 1, 5, 'Mucuritas'), (3, 1, 6, 'Queseras del medio'),
(3, 2, 1, 'Biruaca'),
(3, 3, 1, 'Bruzual'), (3, 3, 2, 'Mantecal'), (3, 3, 3, 'Quintero'), (3, 3, 4, 'Rincón Hondo'), (3, 3, 5, 'San Vicente'),
(3, 4, 1, 'Guasdualito'), (3, 4, 2, 'Aramendi'), (3, 4, 3, 'El Amparo'), (3, 4, 4, 'San Camilo'), (3, 4, 5, 'Urdaneta'),
(3, 5, 1, 'San Juan de Payara'), (3, 5, 2, 'Codazzi'), (3, 5, 3, 'Cunaviche'),
(3, 6, 1, 'Elorza'), (3, 6, 2, 'La Trinidad'),
(3, 7, 1, 'San Fernando'), (3, 7, 2, 'El Recreo'), (3, 7, 3, 'Peñalver'), (3, 7, 4, 'San Rafael de Atamaica');

-- Aragua (Estado 4)
INSERT INTO parroquias (id_estado, num_municipio, num_parroquia, nombre_parroquia) VALUES 
(4, 1, 1, 'Pedro José Ovalles'), (4, 1, 2, 'Joaquín Crespo'), (4, 1, 3, 'José Casanova Godoy'), (4, 1, 4, 'Madre María de San José'), (4, 1, 5, 'Andrés Eloy Blanco'), (4, 1, 6, 'Los Tacarigua'), (4, 1, 7, 'Las Delicias'), (4, 1, 8, 'Choroní'),
(4, 2, 1, 'Bolívar'),
(4, 3, 1, 'Camatagua'), (4, 3, 2, 'Carmen de Cura'),
(4, 4, 1, 'Santa Rita'), (4, 4, 2, 'Francisco de Miranda'), (4, 4, 3, 'Moseñor Feliciano González'),
(4, 5, 1, 'Santa Cruz'),
(4, 6, 1, 'José Félix Ribas'), (4, 6, 2, 'Castor Nieves Ríos'), (4, 6, 3, 'Las Guacamayas'), (4, 6, 4, 'Pao de Zárate'), (4, 6, 5, 'Zuata'),
(4, 7, 1, 'José Rafael Revenga'),
(4, 8, 1, 'Palo Negro'), (4, 8, 2, 'San Martín de Porres'),
(4, 9, 1, 'El Limón'), (4, 9, 2, 'Caña de Azúcar'),
(4, 10, 1, 'Ocumare de la Costa'),
(4, 11, 1, 'San Casimiro'), (4, 11, 2, 'Güiripa'), (4, 11, 3, 'Ollas de Caramacate'), (4, 11, 4, 'Valle Morín'),
(4, 12, 1, 'San Sebastían'),
(4, 13, 1, 'Turmero'), (4, 13, 2, 'Arevalo Aponte'), (4, 13, 3, 'Chuao'), (4, 13, 4, 'Samán de Güere'), (4, 13, 5, 'Alfredo Pacheco Miranda'),
(4, 14, 1, 'Santos Michelena'), (4, 14, 2, 'Tiara'),
(4, 15, 1, 'Cagua'), (4, 15, 2, 'Bella Vista'),
(4, 16, 1, 'Tovar'),
(4, 17, 1, 'Urdaneta'), (4, 17, 2, 'Las Peñitas'), (4, 17, 3, 'San Francisco de Cara'), (4, 17, 4, 'Taguay'),
(4, 18, 1, 'Zamora'), (4, 18, 2, 'Magdaleno'), (4, 18, 3, 'San Francisco de Asís'), (4, 18, 4, 'Valles de Tucutunemo'), (4, 18, 5, 'Augusto Mijares');

-- Barinas (Estado 5)
INSERT INTO parroquias (id_estado, num_municipio, num_parroquia, nombre_parroquia) VALUES 
(5, 1, 1, 'Sabaneta'), (5, 1, 2, 'Juan Antonio Rodríguez Domínguez'),
(5, 2, 1, 'El Cantón'), (5, 2, 2, 'Santa Cruz de Guacas'), (5, 2, 3, 'Puerto Vivas'),
(5, 3, 1, 'Ticoporo'), (5, 3, 2, 'Nicolás Pulido'), (5, 3, 3, 'Andrés Bello'),
(5, 4, 1, 'Arismendi'), (5, 4, 2, 'Guadarrama'), (5, 4, 3, 'La Unión'), (5, 4, 4, 'San Antonio'),
(5, 5, 1, 'Barinas'), (5, 5, 2, 'Alberto Arvelo Larriva'), (5, 5, 3, 'San Silvestre'), (5, 5, 4, 'Santa Inés'), (5, 5, 5, 'Santa Lucía'), (5, 5, 6, 'Torumos'), (5, 5, 7, 'El Carmen'), (5, 5, 8, 'Rómulo Betancourt'), (5, 5, 9, 'Corazón de Jesús'), (5, 5, 10, 'Ramón Ignacio Méndez'), (5, 5, 11, 'Alto Barinas'), (5, 5, 12, 'Manuel Palacio Fajardo'), (5, 5, 13, 'Juan Antonio Rodríguez Domínguez'), (5, 5, 14, 'Dominga Ortiz de Páez'),
(5, 6, 1, 'Barinitas'), (5, 6, 2, 'Altamira de Cáceres'), (5, 6, 3, 'Calderas'),
(5, 7, 1, 'Barrancas'), (5, 7, 2, 'El Socorro'), (5, 7, 3, 'Mazparrito'),
(5, 8, 1, 'Santa Bárbara'), (5, 8, 2, 'Pedro Briceño Méndez'), (5, 8, 3, 'Ramón Ignacio Méndez'), (5, 8, 4, 'José Ignacio del Pumar'),
(5, 9, 1, 'Obispos'), (5, 9, 2, 'Guasimitos'), (5, 9, 3, 'El Real'), (5, 9, 4, 'La Luz'),
(5, 10, 1, 'Ciudad Bolívia'), (5, 10, 2, 'José Ignacio Briceño'), (5, 10, 3, 'José Félix Ribas'), (5, 10, 4, 'Páez'),
(5, 11, 1, 'Libertad'), (5, 11, 2, 'Dolores'), (5, 11, 3, 'Santa Rosa'), (5, 11, 4, 'Palacio Fajardo'),
(5, 12, 1, 'Ciudad de Nutrias'), (5, 12, 2, 'El Regalo'), (5, 12, 3, 'Puerto Nutrias'), (5, 12, 4, 'Santa Catalina');

-- Bolívar (Estado 6)
INSERT INTO parroquias (id_estado, num_municipio, num_parroquia, nombre_parroquia) VALUES 
(6, 1, 1, 'Cachamay'), (6, 1, 2, 'Chirica'), (6, 1, 3, 'Dalla Costa'), (6, 1, 4, 'Once de Abril'), (6, 1, 5, 'Simón Bolívar'), (6, 1, 6, 'Unare'), (6, 1, 7, 'Universidad'), (6, 1, 8, 'Vista al Sol'), (6, 1, 9, 'Pozo Verde'), (6, 1, 10, 'Yocoima'), (6, 1, 11, '5 de Julio'),
(6, 2, 1, 'Cedeño'), (6, 2, 2, 'Altagracia'), (6, 2, 3, 'Ascensión Farreras'), (6, 2, 4, 'Guaniamo'), (6, 2, 5, 'La Urbana'), (6, 2, 6, 'Pijiguaos'),
(6, 3, 1, 'El Callao'),
(6, 4, 1, 'Gran Sabana'), (6, 4, 2, 'Ikabarú'),
(6, 5, 1, 'Catedral'), (6, 5, 2, 'Zea'), (6, 5, 3, 'Orinoco'), (6, 5, 4, 'José Antonio Páez'), (6, 5, 5, 'Marhuanta'), (6, 5, 6, 'Agua Salada'), (6, 5, 7, 'Vista Hermosa'), (6, 5, 8, 'La Sabanita'), (6, 5, 9, 'Panapana'),
(6, 6, 1, 'Andrés Eloy Blanco'), (6, 6, 2, 'Pedro Cova'),
(6, 7, 1, 'Raúl Leoni'), (6, 7, 2, 'Barceloneta'), (6, 7, 3, 'Santa Bárbara'), (6, 7, 4, 'San Francisco'),
(6, 8, 1, 'Roscio'), (6, 8, 2, 'Salóm'),
(6, 9, 1, 'Sifontes'), (6, 9, 2, 'Dalla Costa'), (6, 9, 3, 'San Isidro'),
(6, 10, 1, 'Sucre'), (6, 10, 2, 'Aripao'), (6, 10, 3, 'Guarataro'), (6, 10, 4, 'Las Majadas'), (6, 10, 5, 'Moitaco'),
(6, 11, 1, 'Padre Pedro Chien'), (6, 11, 2, 'Río Grande');

-- Carabobo (Estado 7)
INSERT INTO parroquias (id_estado, num_municipio, num_parroquia, nombre_parroquia) VALUES 
(7, 1, 1, 'Bejuma'), (7, 1, 2, 'Canoabo'), (7, 1, 3, 'Simón Bolívar'),
(7, 2, 1, 'Güigüe'), (7, 2, 2, 'Carabobo'), (7, 2, 3, 'Tacarigua'),
(7, 3, 1, 'Mariara'), (7, 3, 2, 'Aguas Calientes'),
(7, 4, 1, 'Ciudad Alianza'), (7, 4, 2, 'Guacara'), (7, 4, 3, 'Yagua'),
(7, 5, 1, 'Morón'), (7, 5, 2, 'Yagua'),
(7, 6, 1, 'Tocuyito'), (7, 6, 2, 'Independencia'),
(7, 7, 1, 'Los Guayos'),
(7, 8, 1, 'Miranda'),
(7, 9, 1, 'Montalbán'),
(7, 10, 1, 'Naguanagua'),
(7, 11, 1, 'Bartolomé Salóm'), (7, 11, 2, 'Democracia'), (7, 11, 3, 'Fraternidad'), (7, 11, 4, 'Goaigoaza'), (7, 11, 5, 'Juan José Flores'), (7, 11, 6, 'Unión'), (7, 11, 7, 'Borburata'), (7, 11, 8, 'Patanemo'),
(7, 12, 1, 'San Diego'),
(7, 13, 1, 'San Joaquín'),
(7, 14, 1, 'Candelaria'), (7, 14, 2, 'Catedral'), (7, 14, 3, 'El Socorro'), (7, 14, 4, 'Miguel Peña'), (7, 14, 5, 'Rafael Urdaneta'), (7, 14, 6, 'San Blas'), (7, 14, 7, 'San José'), (7, 14, 8, 'Santa Rosa'), (7, 14, 9, 'Negro Primero');

-- Cojedes (Estado 8)
INSERT INTO parroquias (id_estado, num_municipio, num_parroquia, nombre_parroquia) VALUES 
(8, 1, 1, 'Cojedes'), (8, 1, 2, 'Juan de Mata Suárez'),
(8, 2, 1, 'Tinaquillo'),
(8, 3, 1, 'El Baúl'), (8, 3, 2, 'Sucre'),
(8, 4, 1, 'La Aguadita'), (8, 4, 2, 'Macapo'),
(8, 5, 1, 'El Pao'),
(8, 6, 1, 'El Amparo'), (8, 6, 2, 'Libertad de Cojedes'),
(8, 7, 1, 'Rómulo Gallegos'),
(8, 8, 1, 'San Carlos de Austria'), (8, 8, 2, 'Juan Ángel Bravo'), (8, 8, 3, 'Manuel Manrique'),
(8, 9, 1, 'General en Jefe José Laurencio Silva');

-- Delta Amacuro (Estado 9)
INSERT INTO parroquias (id_estado, num_municipio, num_parroquia, nombre_parroquia) VALUES 
(9, 1, 1, 'Curiapo'), (9, 1, 2, 'Almirante Luis Brión'), (9, 1, 3, 'Francisco Aniceto Lugo'), (9, 1, 4, 'Manuel Renaud'), (9, 1, 5, 'Padre Barral'), (9, 1, 6, 'Santos de Abelgas'),
(9, 2, 1, 'Imataca'), (9, 2, 2, 'Cinco de Julio'), (9, 2, 3, 'Juan Bautista Arismendi'), (9, 2, 4, 'Manuel Piar'), (9, 2, 5, 'Rómulo Gallegos'),
(9, 3, 1, 'Pedernales'), (9, 3, 2, 'Luis Beltrán Prieto Figueroa'),
(9, 4, 1, 'San José (Delta Amacuro)'), (9, 4, 2, 'José Vidal Marcano'), (9, 4, 3, 'Juan Millán'), (9, 4, 4, 'Leonardo Ruíz Pineda'), (9, 4, 5, 'Mariscal Antonio José de Sucre'), (9, 4, 6, 'Monseñor Argimiro García'), (9, 4, 7, 'San Rafael (Delta Amacuro)'), (9, 4, 8, 'Virgen del Valle');

-- Falcón (Estado 10)
INSERT INTO parroquias (id_estado, num_municipio, num_parroquia, nombre_parroquia) VALUES 
(10, 1, 1, 'Capadare'), (10, 1, 2, 'La Pastora'), (10, 1, 3, 'Libertador'), (10, 1, 4, 'San Juan de los Cayos'),
(10, 2, 1, 'Aracua'), (10, 2, 2, 'La Peña'), (10, 2, 3, 'San Luis'),
(10, 3, 1, 'Bariro'), (10, 3, 2, 'Borojó'), (10, 3, 3, 'Capatárida'), (10, 3, 4, 'Guajiro'), (10, 3, 5, 'Seque'), (10, 3, 6, 'Zazárida'), (10, 3, 7, 'Valle de Eroa'),
(10, 4, 1, 'Cacique Manaure'),
(10, 5, 1, 'Norte'), (10, 5, 2, 'Carirubana'), (10, 5, 3, 'Santa Ana'), (10, 5, 4, 'Urbana Punta Cardón'),
(10, 6, 1, 'La Vela de Coro'), (10, 6, 2, 'Acurigua'), (10, 6, 3, 'Guaibacoa'), (10, 6, 4, 'Las Calderas'), (10, 6, 5, 'Macoruca'),
(10, 7, 1, 'Dabajuro'),
(10, 8, 1, 'Agua Clara'), (10, 8, 2, 'Avaria'), (10, 8, 3, 'Pedregal'), (10, 8, 4, 'Piedra Grande'), (10, 8, 5, 'Purureche'),
(10, 9, 1, 'Adaure'), (10, 9, 2, 'Adícora'), (10, 9, 3, 'Baraived'), (10, 9, 4, 'Buena Vista'), (10, 9, 5, 'Jadacaquiva'), (10, 9, 6, 'El Vínculo'), (10, 9, 7, 'El Hato'), (10, 9, 8, 'Moruy'), (10, 9, 9, 'Pueblo Nuevo'),
(10, 10, 1, 'Agua Larga'), (10, 10, 2, 'El Paují'), (10, 10, 3, 'Independencia'), (10, 10, 4, 'Mapararí'), (10, 10, 5, 'Churuguara'),
(10, 11, 1, 'Agua Linda'), (10, 11, 2, 'Araurima'), (10, 11, 3, 'Jacura'),
(10, 12, 1, 'Tucacas'), (10, 12, 2, 'Boca de Aroa'),
(10, 13, 1, 'Los Taques'), (10, 13, 2, 'Judibana'),
(10, 14, 1, 'Mene de Mauroa'), (10, 14, 2, 'San Félix'), (10, 14, 3, 'Casigua'),
(10, 15, 1, 'Guzmán Guillermo'), (10, 15, 2, 'Mitare'), (10, 15, 3, 'Río Seco'), (10, 15, 4, 'Sabaneta'), (10, 15, 5, 'San Antonio'), (10, 15, 6, 'San Gabriel'), (10, 15, 7, 'Santa Ana'),
(10, 16, 1, 'Boca del Tocuyo'), (10, 16, 2, 'Chichiriviche'), (10, 16, 3, 'Tocuyo de la Costa'),
(10, 17, 1, 'Palmasola'),
(10, 18, 1, 'Cabure'), (10, 18, 2, 'Colina'), (10, 18, 3, 'Curimagua'),
(10, 19, 1, 'San José de la Costa'), (10, 19, 2, 'Píritu'),
(10, 20, 1, 'San Francisco'),
(10, 21, 1, 'Sucre'), (10, 21, 2, 'Pecaya'),
(10, 22, 1, 'Tocópero'),
(10, 23, 1, 'El Charal'), (10, 23, 2, 'Las Vegas del Tuy'), (10, 23, 3, 'Santa Cruz de Bucaral'),
(10, 24, 1, 'Bruzual'), (10, 24, 2, 'Urumaco'),
(10, 25, 1, 'Puerto Cumarebo'), (10, 25, 2, 'La Ciénaga'), (10, 25, 3, 'La Soledad'), (10, 25, 4, 'Pueblo Cumarebo'), (10, 25, 5, 'Zazárida');

-- Guárico (Estado 11)
INSERT INTO parroquias (id_estado, num_municipio, num_parroquia, nombre_parroquia) VALUES 
(11, 1, 1, 'Camaguán'), (11, 1, 2, 'Puerto Miranda'), (11, 1, 3, 'Uverito'),
(11, 2, 1, 'Chaguaramas'),
(11, 3, 1, 'El Socorro'),
(11, 4, 1, 'Tucupido'), (11, 4, 2, 'San Rafael de Laya'),
(11, 5, 1, 'Altagracia de Orituco'), (11, 5, 2, 'San Rafael de Orituco'), (11, 5, 3, 'San Francisco Javier de Lezama'), (11, 5, 4, 'Paso Real de Macaira'), (11, 5, 5, 'Carlos Soublette'), (11, 5, 6, 'San Francisco de Macaira'), (11, 5, 7, 'Libertad de Orituco'),
(11, 6, 1, 'Cantaclaro'), (11, 6, 2, 'San Juan de los Morros'), (11, 6, 3, 'Parapara'),
(11, 7, 1, 'El Sombrero'), (11, 7, 2, 'Sosa'),
(11, 8, 1, 'Las Mercedes'), (11, 8, 2, 'Cabruta'), (11, 8, 3, 'Santa Rita de Manapire'),
(11, 9, 1, 'Valle de la Pascua'), (11, 9, 2, 'Espino'),
(11, 10, 1, 'San José de Unare'), (11, 10, 2, 'Zaraza'),
(11, 11, 1, 'San José de Tiznados'), (11, 11, 2, 'San Francisco de Tiznados'), (11, 11, 3, 'San Lorenzo de Tiznados'), (11, 11, 4, 'Ortiz'),
(11, 12, 1, 'Guayabal'), (11, 12, 2, 'Cazorla'),
(11, 13, 1, 'San José de Guaribe'), (11, 13, 2, 'Uveral'),
(11, 14, 1, 'Santa María de Ipire'), (11, 14, 2, 'Altamira'),
(11, 15, 1, 'El Calvario'), (11, 15, 2, 'El Rastro'), (11, 15, 3, 'Guardatinajas'), (11, 15, 4, 'Capital Urbana Calabozo');

-- Lara (Estado 12)
INSERT INTO parroquias (id_estado, num_municipio, num_parroquia, nombre_parroquia) VALUES 
(12, 1, 1, 'Quebrada Honda de Guache'), (12, 1, 2, 'Pío Tamayo'), (12, 1, 3, 'Yacambú'),
(12, 2, 1, 'Fréitez'), (12, 2, 2, 'José María Blanco'),
(12, 3, 1, 'Catedral'), (12, 3, 2, 'Concepción'), (12, 3, 3, 'El Cují'), (12, 3, 4, 'Juan de Villegas'), (12, 3, 5, 'Santa Rosa'), (12, 3, 6, 'Tamaca'), (12, 3, 7, 'Unión'), (12, 3, 8, 'Aguedo Felipe Alvarado'), (12, 3, 9, 'Buena Vista'), (12, 3, 10, 'Juárez'),
(12, 4, 1, 'Juan Bautista Rodríguez'), (12, 4, 2, 'Cuara'), (12, 4, 3, 'Diego de Lozada'), (12, 4, 4, 'Paraíso de San José'), (12, 4, 5, 'San Miguel'), (12, 4, 6, 'Tintorero'), (12, 4, 7, 'José Bernardo Dorante'), (12, 4, 8, 'Coronel Mariano Peraza '),
(12, 5, 1, 'Bolívar'), (12, 5, 2, 'Anzoátegui'), (12, 5, 3, 'Guarico'), (12, 5, 4, 'Hilario Luna y Luna'), (12, 5, 5, 'Humocaro Alto'), (12, 5, 6, 'Humocaro Bajo'), (12, 5, 7, 'La Candelaria'), (12, 5, 8, 'Morán'),
(12, 6, 1, 'Cabudare'), (12, 6, 2, 'José Gregorio Bastidas'), (12, 6, 3, 'Agua Viva'),
(12, 7, 1, 'Sarare'), (12, 7, 2, 'Buría'), (12, 7, 3, 'Gustavo Vegas León'),
(12, 8, 1, 'Trinidad Samuel'), (12, 8, 2, 'Antonio Díaz'), (12, 8, 3, 'Camacaro'), (12, 8, 4, 'Castañeda'), (12, 8, 5, 'Cecilio Zubillaga'), (12, 8, 6, 'Chiquinquirá'), (12, 8, 7, 'El Blanco'), (12, 8, 8, 'Espinoza de los Monteros'), (12, 8, 9, 'Lara'), (12, 8, 10, 'Las Mercedes'), (12, 8, 11, 'Manuel Morillo'), (12, 8, 12, 'Montaña Verde'), (12, 8, 13, 'Montes de Oca'), (12, 8, 14, 'Torres'), (12, 8, 15, 'Heriberto Arroyo'), (12, 8, 16, 'Reyes Vargas'), (12, 8, 17, 'Altagracia'),
(12, 9, 1, 'Siquisique'), (12, 9, 2, 'Moroturo'), (12, 9, 3, 'San Miguel'), (12, 9, 4, 'Xaguas');

-- Mérida (Estado 13)
INSERT INTO parroquias (id_estado, num_municipio, num_parroquia, nombre_parroquia) VALUES 
(13, 1, 1, 'Presidente Betancourt'), (13, 1, 2, 'Presidente Páez'), (13, 1, 3, 'Presidente Rómulo Gallegos'), (13, 1, 4, 'Gabriel Picón González'), (13, 1, 5, 'Héctor Amable Mora'), (13, 1, 6, 'José Nucete Sardi'), (13, 1, 7, 'Pulido Méndez'),
(13, 2, 1, 'La Azulita'),
(13, 3, 1, 'Santa Cruz de Mora'), (13, 3, 2, 'Mesa Bolívar'), (13, 3, 3, 'Mesa de Las Palmas'),
(13, 4, 1, 'Aricagua'), (13, 4, 2, 'San Antonio'),
(13, 5, 1, 'Canagua'), (13, 5, 2, 'Capurí'), (13, 5, 3, 'Chacantá'), (13, 5, 4, 'El Molino'), (13, 5, 5, 'Guaimaral'), (13, 5, 6, 'Mucutuy'), (13, 5, 7, 'Mucuchachí'),
(13, 6, 1, 'Fernández Peña'), (13, 6, 2, 'Matriz'), (13, 6, 3, 'Montalbán'), (13, 6, 4, 'Acequias'), (13, 6, 5, 'Jají'), (13, 6, 6, 'La Mesa'), (13, 6, 7, 'San José del Sur'),
(13, 7, 1, 'Tucaní'), (13, 7, 2, 'Florencio Ramírez'),
(13, 8, 1, 'Santo Domingo'), (13, 8, 2, 'Las Piedras'),
(13, 9, 1, 'Guaraque'), (13, 9, 2, 'Mesa de Quintero'), (13, 9, 3, 'Río Negro'),
(13, 10, 1, 'Arapuey'), (13, 10, 2, 'Palmira'),
(13, 11, 1, 'San Cristóbal de Torondoy'), (13, 11, 2, 'Torondoy'),
(13, 12, 1, 'Antonio Spinetti Dini'), (13, 12, 2, 'Arias'), (13, 12, 3, 'Caracciolo Parra Pérez'), (13, 12, 4, 'Domingo Peña'), (13, 12, 5, 'El Llano'), (13, 12, 6, 'Gonzalo Picón Febres'), (13, 12, 7, 'Jacinto Plaza'), (13, 12, 8, 'Juan Rodríguez Suárez'), (13, 12, 9, 'Lasso de la Vega'), (13, 12, 10, 'Mariano Picón Salas'), (13, 12, 11, 'Milla'), (13, 12, 12, 'Osuna Rodríguez'), (13, 12, 13, 'Sagrario'), (13, 12, 14, 'El Morro'), (13, 12, 15, 'Los Nevados'),
(13, 13, 1, 'Andrés Eloy Blanco'), (13, 13, 2, 'La Venta'), (13, 13, 3, 'Piñango'), (13, 13, 4, 'Timotes'),
(13, 14, 1, 'Eloy Paredes'), (13, 14, 2, 'San Rafael de Alcázar'), (13, 14, 3, 'Santa Elena de Arenales'),
(13, 15, 1, 'Santa María de Caparo'),
(13, 16, 1, 'Pueblo Llano'),
(13, 17, 1, 'Cacute'), (13, 17, 2, 'La Toma'), (13, 17, 3, 'Mucuchíes'), (13, 17, 4, 'Mucurubá'), (13, 17, 5, 'San Rafael'),
(13, 18, 1, 'Gerónimo Maldonado'), (13, 18, 2, 'Bailadores'),
(13, 19, 1, 'Tabay'),
(13, 20, 1, 'Chiguará'), (13, 20, 2, 'Estánquez'), (13, 20, 3, 'Lagunillas'), (13, 20, 4, 'La Trampa'), (13, 20, 5, 'Pueblo Nuevo del Sur'), (13, 20, 6, 'San Juan'),
(13, 21, 1, 'El Amparo'), (13, 21, 2, 'El Llano'), (13, 21, 3, 'San Francisco'), (13, 21, 4, 'Tovar'),
(13, 22, 1, 'Independencia'), (13, 22, 2, 'María de la Concepción Palacios Blanco'), (13, 22, 3, 'Nueva Bolivia'), (13, 22, 4, 'Santa Apolonia'),
(13, 23, 1, 'Caño El Tigre'), (13, 23, 2, 'Zea');

-- Miranda (Estado 14)
INSERT INTO parroquias (id_estado, num_municipio, num_parroquia, nombre_parroquia) VALUES 
(14, 1, 1, 'Aragüita'), (14, 1, 2, 'Arévalo González'), (14, 1, 3, 'Capaya'), (14, 1, 4, 'Caucagua'), (14, 1, 5, 'Panaquire'), (14, 1, 6, 'Ribas'), (14, 1, 7, 'El Café'), (14, 1, 8, 'Marizapa'),
(14, 2, 1, 'Cumbo'), (14, 2, 2, 'San José de Barlovento'),
(14, 3, 1, 'El Cafetal'), (14, 3, 2, 'Las Minas'), (14, 3, 3, 'Nuestra Señora del Rosario'),
(14, 4, 1, 'Higuerote'), (14, 4, 2, 'Curiepe'), (14, 4, 3, 'Tacarigua de Brión'),
(14, 5, 1, 'Mamporal'),
(14, 6, 1, 'Carrizal'),
(14, 7, 1, 'Chacao'),
(14, 8, 1, 'Charallave'), (14, 8, 2, 'Las Brisas'),
(14, 9, 1, 'El Hatillo'),
(14, 10, 1, 'Altagracia de la Montaña'), (14, 10, 2, 'Cecilio Acosta'), (14, 10, 3, 'Los Teques'), (14, 10, 4, 'El Jarillo'), (14, 10, 5, 'San Pedro'), (14, 10, 6, 'Tácata'), (14, 10, 7, 'Paracotos'),
(14, 11, 1, 'Cartanal'), (14, 11, 2, 'Santa Teresa del Tuy'),
(14, 12, 1, 'La Democracia'), (14, 12, 2, 'Ocumare del Tuy'), (14, 12, 3, 'Santa Bárbara'),
(14, 13, 1, 'San Antonio de los Altos'),
(14, 14, 1, 'Río Chico'), (14, 14, 2, 'El Guapo'), (14, 14, 3, 'Tacarigua de la Laguna'), (14, 14, 4, 'Paparo'), (14, 14, 5, 'San Fernando del Guapo'),
(14, 15, 1, 'Santa Lucía del Tuy'),
(14, 16, 1, 'Cúpira'), (14, 16, 2, 'Machurucuto'),
(14, 17, 1, 'Guarenas'),
(14, 18, 1, 'San Antonio de Yare'), (14, 18, 2, 'San Francisco de Yare'),
(14, 19, 1, 'Leoncio Martínez'), (14, 19, 2, 'Petare'), (14, 19, 3, 'Caucagüita'), (14, 19, 4, 'Filas de Mariche'), (14, 19, 5, 'La Dolorita'),
(14, 20, 1, 'Cúa'), (14, 20, 2, 'Nueva Cúa'),
(14, 21, 1, 'Guatire'), (14, 21, 2, 'Bolívar');

-- Monagas (Estado 15)
INSERT INTO parroquias (id_estado, num_municipio, num_parroquia, nombre_parroquia) VALUES 
(15, 1, 1, 'San Antonio de Maturín'), (15, 1, 2, 'San Francisco de Maturín'),
(15, 2, 1, 'Aguasay'),
(15, 3, 1, 'Caripito'),
(15, 4, 1, 'El Guácharo'), (15, 4, 2, 'La Guanota'), (15, 4, 3, 'Sabana de Piedra'), (15, 4, 4, 'San Agustín'), (15, 4, 5, 'Teresen'), (15, 4, 6, 'Caripe'),
(15, 5, 1, 'Areo'), (15, 5, 2, 'Capital Cedeño'), (15, 5, 3, 'San Félix de Cantalicio'), (15, 5, 4, 'Viento Fresco'),
(15, 6, 1, 'El Tejero'), (15, 6, 2, 'Punta de Mata'),
(15, 7, 1, 'Chaguaramas'), (15, 7, 2, 'Las Alhuacas'), (15, 7, 3, 'Tabasca'), (15, 7, 4, 'Temblador'),
(15, 8, 1, 'Alto de los Godos'), (15, 8, 2, 'Boquerón'), (15, 8, 3, 'Las Cocuizas'), (15, 8, 4, 'La Cruz'), (15, 8, 5, 'San Simón'), (15, 8, 6, 'El Corozo'), (15, 8, 7, 'El Furrial'), (15, 8, 8, 'Jusepín'), (15, 8, 9, 'La Pica'), (15, 8, 10, 'San Vicente'),
(15, 9, 1, 'Aparicio'), (15, 9, 2, 'Aragua de Maturín'), (15, 9, 3, 'Chaguamal'), (15, 9, 4, 'El Pinto'), (15, 9, 5, 'Guanaguana'), (15, 9, 6, 'La Toscana'), (15, 9, 7, 'Taguaya'),
(15, 10, 1, 'Cachipo'), (15, 10, 2, 'Quiriquire'),
(15, 11, 1, 'Santa Bárbara'),
(15, 12, 1, 'Barrancas'), (15, 12, 2, 'Los Barrancos de Fajardo'),
(15, 13, 1, 'Uracoa');

-- Nueva Esparta (Estado 16)
INSERT INTO parroquias (id_estado, num_municipio, num_parroquia, nombre_parroquia) VALUES 
(16, 1, 1, 'Antolín del Campo'),
(16, 2, 1, 'Arismendi'),
(16, 3, 1, 'García'), (16, 3, 2, 'Francisco Fajardo'),
(16, 4, 1, 'Bolívar'), (16, 4, 2, 'Guevara'), (16, 4, 3, 'Matasiete'), (16, 4, 4, 'Santa Ana'), (16, 4, 5, 'Sucre'),
(16, 5, 1, 'Aguirre'), (16, 5, 2, 'Maneiro'),
(16, 6, 1, 'Adrián'), (16, 6, 2, 'Juan Griego'),
(16, 7, 1, 'Porlamar'),
(16, 8, 1, 'San Francisco de Macanao'), (16, 8, 2, 'Boca de Río'),
(16, 9, 1, 'Tubores'), (16, 9, 2, 'Los Baleales'),
(16, 10, 1, 'Vicente Fuentes'), (16, 10, 2, 'Villalba'),
(16, 11, 1, 'San Juan Bautista'), (16, 11, 2, 'Zabala');

-- Portuguesa (Estado 17)
INSERT INTO parroquias (id_estado, num_municipio, num_parroquia, nombre_parroquia) VALUES 
(17, 1, 1, 'Agua Blanca'),
(17, 2, 1, 'Capital Araure'), (17, 2, 2, 'Río Acarigua'),
(17, 3, 1, 'Capital Esteller'), (17, 3, 2, 'Uveral'),
(17, 4, 1, 'Guanare'), (17, 4, 2, 'Córdoba'), (17, 4, 3, 'San José de la Montaña'), (17, 4, 4, 'San Juan de Guanaguanare'), (17, 4, 5, 'Virgen de la Coromoto'),
(17, 5, 1, 'Guanarito'), (17, 5, 2, 'Trinidad de la Capilla'), (17, 5, 3, 'Divina Pastora'),
(17, 6, 1, 'Monseñor José Vicente de Unda'), (17, 6, 2, 'Peña Blanca'),
(17, 7, 1, 'Capital Ospino'), (17, 7, 2, 'Aparición'), (17, 7, 3, 'La Estación'),
(17, 8, 1, 'Páez'), (17, 8, 2, 'Payara'), (17, 8, 3, 'Pimpinela'), (17, 8, 4, 'Ramón Peraza'),
(17, 9, 1, 'Papelón'), (17, 9, 2, 'Caño Delgadito'),
(17, 10, 1, 'San Genaro de Boconoito'), (17, 10, 2, 'Antolín Tovar'),
(17, 11, 1, 'San Rafael de Onoto'), (17, 11, 2, 'Santa Fe'), (17, 11, 3, 'Thermo Morles'),
(17, 12, 1, 'Santa Rosalía'), (17, 12, 2, 'Florida'),
(17, 13, 1, 'Sucre'), (17, 13, 2, 'Concepción'), (17, 13, 3, 'San Rafael de Palo Alzado'), (17, 13, 4, 'Uvencio Antonio Velásquez'), (17, 13, 5, 'San José de Saguaz'), (17, 13, 6, 'Villa Rosa'),
(17, 14, 1, 'Turén'), (17, 14, 2, 'Canelones'), (17, 14, 3, 'Santa Cruz'), (17, 14, 4, 'San Isidro Labrador');

-- Sucre (Estado 18)
INSERT INTO parroquias (id_estado, num_municipio, num_parroquia, nombre_parroquia) VALUES 
(18, 1, 1, 'Mariño'), (18, 1, 2, 'Rómulo Gallegos'),
(18, 2, 1, 'San José de Aerocuar'), (18, 2, 2, 'Tavera Acosta'),
(18, 3, 1, 'Río Caribe'), (18, 3, 2, 'Antonio José de Sucre'), (18, 3, 3, 'El Morro de Puerto Santo'), (18, 3, 4, 'Puerto Santo'), (18, 3, 5, 'San Juan de las Galdonas'),
(18, 4, 1, 'El Pilar'), (18, 4, 2, 'El Rincón'), (18, 4, 3, 'General Francisco Antonio Váquez'), (18, 4, 4, 'Guaraúnos'), (18, 4, 5, 'Tunapuicito'), (18, 4, 6, 'Unión'),
(18, 5, 1, 'Santa Catalina'), (18, 5, 2, 'Santa Rosa'), (18, 5, 3, 'Santa Teresa'), (18, 5, 4, 'Bolívar'), (18, 5, 5, 'Maracapana'),
(18, 6, 1, 'Marigüitar'),
(18, 7, 1, 'Libertad'), (18, 7, 2, 'El Paujil'), (18, 7, 3, 'Yaguaraparo'),
(18, 8, 1, 'Cruz Salmerón Acosta'), (18, 8, 2, 'Chacopata'), (18, 8, 3, 'Manicuare'),
(18, 9, 1, 'Tunapuy'), (18, 9, 2, 'Campo Elías'),
(18, 10, 1, 'Irapa'), (18, 10, 2, 'Campo Claro'), (18, 10, 3, 'Maraval'), (18, 10, 4, 'San Antonio de Irapa'), (18, 10, 5, 'Soro'),
(18, 11, 1, 'Mejía'),
(18, 12, 1, 'Cumanacoa'), (18, 12, 2, 'Arenas'), (18, 12, 3, 'Aricagua'), (18, 12, 4, 'Cogollar'), (18, 12, 5, 'San Fernando'), (18, 12, 6, 'San Lorenzo'),
(18, 13, 1, 'Villa Frontado (Muelle de Cariaco)'), (18, 13, 2, 'Catuaro'), (18, 13, 3, 'Rendón'), (18, 13, 4, 'San Cruz'), (18, 13, 5, 'Santa María'),
(18, 14, 1, 'Altagracia'), (18, 14, 2, 'Santa Inés'), (18, 14, 3, 'Valentín Valiente'), (18, 14, 4, 'Ayacucho'), (18, 14, 5, 'San Juan'), (18, 14, 6, 'Raúl Leoni'), (18, 14, 7, 'Gran Mariscal'),
(18, 15, 1, 'Cristóbal Colón'), (18, 15, 2, 'Bideau'), (18, 15, 3, 'Punta de Piedras'), (18, 15, 4, 'Güiria');

-- Táchira (Estado 19)
INSERT INTO parroquias (id_estado, num_municipio, num_parroquia, nombre_parroquia) VALUES 
(19, 1, 1, 'Andrés Bello'),
(19, 2, 1, 'Antonio Rómulo Costa'),
(19, 3, 1, 'Ayacucho'), (19, 3, 2, 'Rivas Berti'), (19, 3, 3, 'San Pedro del Río'),
(19, 4, 1, 'Bolívar'), (19, 4, 2, 'Palotal'), (19, 4, 3, 'General Juan Vicente Gómez'), (19, 4, 4, 'Isaías Medina Angarita'),
(19, 5, 1, 'Cárdenas'), (19, 5, 2, 'Amenodoro Ángel Lamus'), (19, 5, 3, 'La Florida'),
(19, 6, 1, 'Córdoba'),
(19, 7, 1, 'Fernández Feo'), (19, 7, 2, 'Alberto Adriani'), (19, 7, 3, 'Santo Domingo'),
(19, 8, 1, 'Francisco de Miranda'),
(19, 9, 1, 'García de Hevia'), (19, 9, 2, 'Boca de Grita'), (19, 9, 3, 'José Antonio Páez'),
(19, 10, 1, 'Guásimos'),
(19, 11, 1, 'Independencia'), (19, 11, 2, 'Juan Germán Roscio'), (19, 11, 3, 'Román Cárdenas'),
(19, 12, 1, 'Jáuregui'), (19, 12, 2, 'Emilio Constantino Guerrero'), (19, 12, 3, 'Monseñor Miguel Antonio Salas'),
(19, 13, 1, 'José María Vargas'),
(19, 14, 1, 'Junín'), (19, 14, 2, 'La Petrólea'), (19, 14, 3, 'Quinimarí'), (19, 14, 4, 'Bramón'),
(19, 15, 1, 'Libertad'), (19, 15, 2, 'Cipriano Castro'), (19, 15, 3, 'Manuel Felipe Rugeles'),
(19, 16, 1, 'Libertador'), (19, 16, 2, 'Doradas'), (19, 16, 3, 'Emeterio Ochoa'), (19, 16, 4, 'San Joaquín de Navay'),
(19, 17, 1, 'Lobatera'), (19, 17, 2, 'Constitución'),
(19, 18, 1, 'Michelena'),
(19, 19, 1, 'Panamericano'), (19, 19, 2, 'La Palmita'),
(19, 20, 1, 'Pedro María Ureña'), (19, 20, 2, 'Nueva Arcadia'),
(19, 21, 1, 'Delicias'), (19, 21, 2, 'Pecaya'),
(19, 22, 1, 'Samuel Darío Maldonado'), (19, 22, 2, 'Boconó'), (19, 22, 3, 'Hernández'),
(19, 23, 1, 'La Concordia'), (19, 23, 2, 'San Juan Bautista'), (19, 23, 3, 'Pedro María Morantes'), (19, 23, 4, 'San Sebastián'), (19, 23, 5, 'Dr. Francisco Romero Lobo'),
(19, 24, 1, 'Seboruco'),
(19, 25, 1, 'Simón Rodríguez'),
(19, 26, 1, 'Sucre'), (19, 26, 2, 'Eleazar López Contreras'), (19, 26, 3, 'San Pablo'),
(19, 27, 1, 'Torbes'),
(19, 28, 1, 'Uribante'), (19, 28, 2, 'Cárdenas'), (19, 28, 3, 'Juan Pablo Peñalosa'), (19, 28, 4, 'Potosí'),
(19, 29, 1, 'San Judas Tadeo');

-- Trujillo (Estado 20)
INSERT INTO parroquias (id_estado, num_municipio, num_parroquia, nombre_parroquia) VALUES 
(20, 1, 1, 'Araguaney'), (20, 1, 2, 'El Jaguito'), (20, 1, 3, 'La Esperanza'), (20, 1, 4, 'Santa Isabel'),
(20, 2, 1, 'Boconó'), (20, 2, 2, 'El Carmen'), (20, 2, 3, 'Mosquey'), (20, 2, 4, 'Ayacucho'), (20, 2, 5, 'Burbusay'), (20, 2, 6, 'General Ribas'), (20, 2, 7, 'Guaramacal'), (20, 2, 8, 'Vega de Guaramacal'), (20, 2, 9, 'Monseñor Jáuregui'), (20, 2, 10, 'Rafael Rangel'), (20, 2, 11, 'San Miguel'), (20, 2, 12, 'San José'),
(20, 3, 1, 'Sabana Grande'), (20, 3, 2, 'Cheregüé'), (20, 3, 3, 'Granados'),
(20, 4, 1, 'Arnoldo Gabaldón'), (20, 4, 2, 'Bolivia'), (20, 4, 3, 'Carrillo'), (20, 4, 4, 'Cegarra'), (20, 4, 5, 'Chejendé'), (20, 4, 6, 'Manuel Salvador Ulloa'), (20, 4, 7, 'San José'),
(20, 5, 1, 'Carache'), (20, 5, 2, 'La Concepción'), (20, 5, 3, 'Cuicas'), (20, 5, 4, 'Panamericana'), (20, 5, 5, 'Santa Cruz'),
(20, 6, 1, 'Escuque'), (20, 6, 2, 'La Unión'), (20, 6, 3, 'Santa Rita'), (20, 6, 4, 'Sabana Libre'),
(20, 7, 1, 'El Socorro'), (20, 7, 2, 'Los Caprichos'), (20, 7, 3, 'Antonio José de Sucre'),
(20, 8, 1, 'Campo Elías'), (20, 8, 2, 'Arnoldo Gabaldón'),
(20, 9, 1, 'Santa Apolonia'), (20, 9, 2, 'El Progreso'), (20, 9, 3, 'La Ceiba'), (20, 9, 4, 'Tres de Febrero'),
(20, 10, 1, 'El Dividive'), (20, 10, 2, 'Agua Santa'), (20, 10, 3, 'Agua Caliente'), (20, 10, 4, 'El Cenizo'), (20, 10, 5, 'Valerita'),
(20, 11, 1, 'Monte Carmelo'), (20, 11, 2, 'Buena Vista'), (20, 11, 3, 'Santa María del Horcón'),
(20, 12, 1, 'Motatán'), (20, 12, 2, 'El Baño'), (20, 12, 3, 'Jalisco'),
(20, 13, 1, 'Pampán'), (20, 13, 2, 'Flor de Patria'), (20, 13, 3, 'La Paz'), (20, 13, 4, 'Santa Ana'),
(20, 14, 1, 'Pampanito'), (20, 14, 2, 'La Concepción'), (20, 14, 3, 'Pampanito II'),
(20, 15, 1, 'Betijoque'), (20, 15, 2, 'José Gregorio Hernández'), (20, 15, 3, 'La Pueblita'), (20, 15, 4, 'Los Cedros'),
(20, 16, 1, 'Carvajal'), (20, 16, 2, 'Campo Alegre'), (20, 16, 3, 'Antonio Nicolás Briceño'), (20, 16, 4, 'José Leonardo Suárez'),
(20, 17, 1, 'Sabana de Mendoza'), (20, 17, 2, 'Junín'), (20, 17, 3, 'Valmore Rodríguez'), (20, 17, 4, 'El Paraíso'),
(20, 18, 1, 'Andrés Linares'), (20, 18, 2, 'Chiquinquirá'), (20, 18, 3, 'Cristóbal Mendoza'), (20, 18, 4, 'Cruz Carrillo'), (20, 18, 5, 'Matriz'), (20, 18, 6, 'Monseñor Carrillo'), (20, 18, 7, 'Tres Esquinas'),
(20, 19, 1, 'Cabimbú'), (20, 19, 2, 'Jajó'), (20, 19, 3, 'La Mesa de Esnujaque'), (20, 19, 4, 'Santiago'), (20, 19, 5, 'Tuñame'), (20, 19, 6, 'La Quebrada'),
(20, 20, 1, 'Juan Ignacio Montilla'), (20, 20, 2, 'La Beatriz'), (20, 20, 3, 'La Puerta'), (20, 20, 4, 'Mendoza del Valle de Momboy'), (20, 20, 5, 'Mercedes Díaz'), (20, 20, 6, 'San Luis');

-- La Guaira (Estado 21)
INSERT INTO parroquias (id_estado, num_municipio, num_parroquia, nombre_parroquia) VALUES 
(21, 1, 1, 'Caraballeda'), (21, 1, 2, 'Carayaca'), (21, 1, 3, 'Carlos Soublette'), (21, 1, 4, 'Caruao Chuspa'), (21, 1, 5, 'Catia La Mar'), (21, 1, 6, 'El Junko'), (21, 1, 7, 'La Guaira'), (21, 1, 8, 'Macuto'), (21, 1, 9, 'Maiquetía'), (21, 1, 10, 'Naiguatá'), (21, 1, 11, 'Urimare');

-- Yaracuy (Estado 22)
INSERT INTO parroquias (id_estado, num_municipio, num_parroquia, nombre_parroquia) VALUES 
(22, 1, 1, 'Arístides Bastidas'),
(22, 2, 1, 'Bolívar'),
(22, 3, 1, 'Chivacoa'), (22, 3, 2, 'Campo Elías'),
(22, 4, 1, 'Cocorote'),
(22, 5, 1, 'Independencia'),
(22, 6, 1, 'José Antonio Páez'),
(22, 7, 1, 'La Trinidad'),
(22, 8, 1, 'Manuel Monge'),
(22, 9, 1, 'Salóm'), (22, 9, 2, 'Temerla'), (22, 9, 3, 'Nirgua'),
(22, 10, 1, 'San Andrés'), (22, 10, 2, 'Yaritagua'),
(22, 11, 1, 'San Javier'), (22, 11, 2, 'Albarico'), (22, 11, 3, 'San Felipe'),
(22, 12, 1, 'Sucre'),
(22, 13, 1, 'Urachiche'),
(22, 14, 1, 'El Guayabo'), (22, 14, 2, 'Farriar');

-- Zulia (Estado 23)
INSERT INTO parroquias (id_estado, num_municipio, num_parroquia, nombre_parroquia) VALUES 
(23, 1, 1, 'Isla de Toas'), (23, 1, 2, 'Monagas'),
(23, 2, 1, 'San Timoteo'), (23, 2, 2, 'General Urdaneta'), (23, 2, 3, 'Libertador'), (23, 2, 4, 'Marcelino Briceño'), (23, 2, 5, 'Pueblo Nuevo'), (23, 2, 6, 'Manuel Guanipa Matos'),
(23, 3, 1, 'Ambrosio'), (23, 3, 2, 'Carmen Herrera'), (23, 3, 3, 'La Rosa'), (23, 3, 4, 'Germán Ríos Linares'), (23, 3, 5, 'San Benito'), (23, 3, 6, 'Rómulo Betancourt'), (23, 3, 7, 'Jorge Hernández'), (23, 3, 8, 'Punta Gorda'), (23, 3, 9, 'Arístides Calvani'),
(23, 4, 1, 'Encontrados'), (23, 4, 2, 'Udón Pérez'),
(23, 5, 1, 'Moralito'), (23, 5, 2, 'San Carlos del Zulia'), (23, 5, 3, 'Santa Cruz del Zulia'), (23, 5, 4, 'Santa Bárbara'), (23, 5, 5, 'Urribarrí'),
(23, 6, 1, 'Carlos Quevedo'), (23, 6, 2, 'Francisco Javier Pulgar'), (23, 6, 3, 'Simón Rodríguez'), (23, 6, 4, 'Guamo-Gavilanes'),
(23, 7, 1, 'Sinamaica'), (23, 7, 2, 'Alta Guajira'), (23, 7, 3, 'Elías Sánchez Rubio'), (23, 7, 4, 'Guajira'),
(23, 8, 1, 'La Concepción'), (23, 8, 2, 'San José'), (23, 8, 3, 'Mariano Parra León'), (23, 8, 4, 'José Ramón Yépez'),
(23, 9, 1, 'Jesús María Semprún'), (23, 9, 2, 'Barí'),
(23, 10, 1, 'Concepción'), (23, 10, 2, 'Andrés Bello'), (23, 10, 3, 'Chiquinquirá'), (23, 10, 4, 'El Carmelo'), (23, 10, 5, 'Potreritos'),
(23, 11, 1, 'Libertad'), (23, 11, 2, 'Alonso de Ojeda'), (23, 11, 3, 'Venezuela'), (23, 11, 4, 'Eleazar López Contreras'), (23, 11, 5, 'Campo Lara'),
(23, 12, 1, 'Bartolomé de las Casas'), (23, 12, 2, 'Libertad'), (23, 12, 3, 'Río Negro'), (23, 12, 4, 'San José de Perijá'),
(23, 13, 1, 'San Rafael'), (23, 13, 2, 'La Sierrita'), (23, 13, 3, 'Las Parcelas'), (23, 13, 4, 'Luis de Vicente'), (23, 13, 5, 'Monseñor Marcos Sergio Godoy'), (23, 13, 6, 'Ricaurte'), (23, 13, 7, 'Tamare'),
(23, 14, 1, 'Antonio Borjas Romero'), (23, 14, 2, 'Bolívar'), (23, 14, 3, 'Cacique Mara'), (23, 14, 4, 'Carracciolo Parra Pérez'), (23, 14, 5, 'Cecilio Acosta'), (23, 14, 6, 'Cristo de Aranza'), (23, 14, 7, 'Coquivacoa'), (23, 14, 8, 'Chiquinquirá'), (23, 14, 9, 'Francisco Eugenio Bustamante'), (23, 14, 10, 'Idelfonzo Vásquez'), (23, 14, 11, 'Juana de Ávila'), (23, 14, 12, 'Luis Hurtado Higuera'), (23, 14, 13, 'Manuel Dagnino'), (23, 14, 14, 'Olegario Villalobos'), (23, 14, 15, 'Raúl Leoni'), (23, 14, 16, 'Santa Lucía'), (23, 14, 17, 'Venancio Pulgar'), (23, 14, 18, 'San Isidro'),
(23, 15, 1, 'Altagracia'), (23, 15, 2, 'Faría'), (23, 15, 3, 'Ana María Campos'), (23, 15, 4, 'San Antonio'), (23, 15, 5, 'San José'),
(23, 16, 1, 'Donaldo García'), (23, 16, 2, 'El Rosario'), (23, 16, 3, 'Sixto Zambrano'),
(23, 17, 1, 'San Francisco'), (23, 17, 2, 'El Bajo'), (23, 17, 3, 'Domitila Flores'), (23, 17, 4, 'Francisco Ochoa'), (23, 17, 5, 'Los Cortijos'), (23, 17, 6, 'Marcial Hernández'),
(23, 18, 1, 'Santa Rita'), (23, 18, 2, 'El Mene'), (23, 18, 3, 'Pedro Lucas Urribarrí'), (23, 18, 4, 'José Cenobio Urribarrí'),
(23, 19, 1, 'Rafael Maria Baralt'), (23, 19, 2, 'Manuel Manrique'), (23, 19, 3, 'Rafael Urdaneta'),
(23, 20, 1, 'Bobures'), (23, 20, 2, 'Gibraltar'), (23, 20, 3, 'Heras'), (23, 20, 4, 'Monseñor Arturo Álvarez'), (23, 20, 5, 'Rómulo Gallegos'), (23, 20, 6, 'El Batey'),
(23, 21, 1, 'Rafael Urdaneta'), (23, 21, 2, 'La Victoria'), (23, 21, 3, 'Raúl Cuenca');

-- Distrito Capital (Estado 24)
INSERT INTO parroquias (id_estado, num_municipio, num_parroquia, nombre_parroquia) VALUES 
(24, 1, 1, 'Altagracia'), (24, 1, 2, 'Antímano'), (24, 1, 3, 'Caricuao'), (24, 1, 4, 'Catedral'), (24, 1, 5, 'Coche'), (24, 1, 6, 'El Junquito'), (24, 1, 7, 'El Paraíso'), (24, 1, 8, 'El Recreo'), (24, 1, 9, 'El Valle'), (24, 1, 10, 'La Candelaria'), (24, 1, 11, 'La Pastora'), (24, 1, 12, 'La Vega'), (24, 1, 13, 'Macarao'), (24, 1, 14, 'San Agustín'), (24, 1, 15, 'San Bernardino'), (24, 1, 16, 'San José'), (24, 1, 17, 'San Juan'), (24, 1, 18, 'San Pedro'), (24, 1, 19, 'Santa Rosalía'), (24, 1, 20, 'Santa Teresa'), (24, 1, 21, 'Sucre (Catia)'), (24, 1, 22, '23 de enero')
ON CONFLICT (id_estado, num_municipio, num_parroquia) DO NOTHING;
-- ============================================================
-- FINALIZAR TRANSACCIÓN
-- ============================================================
COMMIT;

