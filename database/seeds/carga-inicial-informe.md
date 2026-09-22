# Carga inicial 2024-2025 — qué entró y qué no

Generado por `scripts/etl-carga-inicial.mjs`. El criterio fue no inventar datos:
si a una fila le falta algo que el esquema exige, queda fuera y se lista aquí con
el motivo, para que la clínica lo complete y se vuelva a correr el ETL.

## Resumen

| Tabla | Filas | Omitidas |
|---|---:|---:|
| solicitantes | 39 | 22 |
| viviendas | 33 | 6 |
| familias_y_hogares | 7 | 32 |
| asignadas_a (características) | 326 | — |
| casos | 32 | 40 |

## Casos que no se cargaron (40)

- **UCAB Guayana · GY24-25/05 · Yohannys Gonzalez** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **UCAB Guayana · GY24-25/07 · Cristina Nicklas** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **UCAB Guayana · GY24-25/10 · Arisleida Bejarano** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **UCAB Guayana · GY24-25/11 · Frolian Aguilera** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **UCAB Guayana · GY24-25/12 · Eugenio Salcedo** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **UCAB Guayana · GY24-25/15 · Daniel Ferrer** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **UCAB Guayana · GY24-25/16 · Migdalis Gil** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **UCAB Guayana · GY24-25/18 · Marco Tulio Cedeño Rodriguez** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **UCAB Guayana · GY24-25/19 · Morelys Del Carmen Bosque García** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **UCAB Guayana · GY24-25/20 · Rosa Palma / Oswardo Herrera** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **UCAB Guayana · GY24-25/23 · Daves Martinez** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **UCAB Guayana · GY24-25/24 · Daviannis Castillo** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **UCAB Guayana · GY24-25/25 · Maria Elena Mendoza** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **UCAB Guayana · GY24-25/26 · José del Carmen Rangel Colmenarez** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **UCAB Guayana · GY24-25/27 · David Giron** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **UCAB Guayana · GY24-25/31 · Carmen Benilde García de Lara** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **UCAB Guayana · GY24-25/32 · Elizabeth Garcia** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **UCAB Guayana · GY 24-25/37 · Eloisa Moreno** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **UCAB Guayana · GY 24-25/38 · Yannohacelys Romina Arias Marin** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **UCAB Guayana · GY24-25/40 · Ramón Marin** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **UCAB Guayana · GY24-25/41 · Jhonjaro Bolívar Martínez** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **UCAB Guayana · GY24-25/42 · Yurbanys Luzmery** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **UCAB Guayana · GY24-25/47 · Lourdes Partido** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **UCAB Guayana · Gy24-25/50 · Morelis Bosques** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **UCAB Guayana · GY24-25/52 · Anelsy León** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **UCAB Guayana · GY24-25/55 · Leivis León** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **UCAB Guayana · GY24-25/58 · Marieli Villafranca** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **UCAB Guayana · GY24-25/59 · Martha Jansen** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **UCAB Guayana · GY24-25/60 · Maria José de León** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **UCAB Guayana · GY24-25/61 · Eglis Gonzalez** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **UCAB Guayana · GY24-25/62 · Milagros Hernandez** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **Casa Barandiarán · CB24-25/01 · Marlierys Del Valle Sulbaran Salavarria** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **Casa Barandiarán · CB24-25/02 · Wilfredo Acosta Garcia** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **Casa Barandiarán · CB24-25/03 · Juan Sergio Alejandro Marin Guevara** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **Casa Barandiarán · CB24-25/04 · Anibal Jose Acosta** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **Casa Barandiarán · CB24-25/05 · Maria Hidalgo** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **Casa Barandiarán · CB24-25/06 · Rosalia Cristina Gomez ( representada por Yenny Fuenmayor)** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **Casa Barandiarán · CB24-25/07 · Wendy del Valle Gularte Salaverria** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **Casa Barandiarán · CB24-25/08 · Elizabeth Acosta** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar
- **Casa Barandiarán · CB24-25/09 · Carmen Yraida Forero** — el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar

## Respuestas del formulario que no se cargaron (22)

- **fila 5 (Jhonjaro bolívar Martínez)** — no se reconoce la parroquia en "Sueño de bolívar, core 8. "
- **fila 7 (Ramón Alexis Marín zapata)** — no se reconoce la parroquia en "Municipio Caroní "
- **fila 9 (Leivis Leon)** — sin cédula en el formulario ("No aplica ")
- **fila 11 (Anelsy León)** — no se reconoce la parroquia en "Caimito manzana 34 casa 18 "
- **fila 19 (Yurbarys laya)** — no se reconoce la parroquia en "25 de marzo san Félix "
- **fila 22 (Martha Jansen)** — no se reconoce la parroquia en "Villa africana Municipio Caroni"
- **fila 26 (Partido Lourdes)** — no se reconoce la parroquia en "Bolivar, Caroni, Puerto Ordaz "
- **fila 30 (Rangel Colmenares José del Carmen)** — no se reconoce la parroquia en "Bolivar, Caroní, villa latina "
- **fila 3 (EILY FLORES)** — cédula V-21251277 repetida; se conservó la respuesta de la fila 32
- **fila 36 (Arias Marin Yannohacelys Romina)** — no se reconoce la parroquia en "Bolívar, caroni, San Felix"
- **fila 39 (David Girón)** — sin cédula en el formulario ("No aplica ")
- **fila 14 (Georgina Bejarano)** — cédula V-14986003 repetida; se conservó la respuesta de la fila 42
- **fila 46 (María Elena Mendoza Reyes)** — no se reconoce la parroquia en "Jorge Hernández, José Félix Rivas primero de mayo, municipio"
- **fila 47 (Villafranca de Muñoz Marielis Beatris)** — no se reconoce la parroquia en "Bolívar, Caroní, Castillito"
- **fila 49 (Marco Tulio Cedeño rodriguez)** — no se reconoce la parroquia en "Caroni, Bolivar, Urbanización Mendoza, calle quirequire, cas"
- **fila 51 (Bosque García Morelys del Carmen)** — no se reconoce la parroquia en "Bolívar, Caroní, La Unidad"
- **fila 53 (Poleo Ferrer, Daniel Alejandro)** — sin teléfono celular
- **fila 54 (Davianny Alexandra Pino Castillo)** — no se reconoce la parroquia en "No suministro info "
- **fila 55 (Palma Martínez Rosa Palma)** — no se reconoce la parroquia en "Santa Catarina, Brasil"
- **fila 57 (Carmen Benilde García de Lara)** — no se reconoce la parroquia en "Bolivar, Pinto Sabina, San Félix "
- **fila 59 (Elizabeth García Cova)** — sin teléfono celular
- **fila 61 (Milagros Hernández)** — no se reconoce la parroquia en "Bella vista, San Félix, Municipio Caroni, Estado Bolívar "

## Solicitantes sin datos de vivienda (6)

- **V-12679398 (FRANCIMAR JOSEFINA GAMBOA)** — habitaciones/baños no numéricos ("SIN INFORMACIÓN" / "SIN INFORMACIÓN")
- **V-21251277 (Flores Bellorin Eily Josefina)** — habitaciones/baños no numéricos ("No suministra información" / "No suministra información")
- **V-6692584 (JOSE LUIS MORALES MORALES)** — habitaciones/baños no numéricos ("SIN INFORMACIÓN" / "SIN INFORMACIÓN")
- **V-17885343 (Alvarez romero Norus del carmen)** — habitaciones/baños no numéricos ("No suministra información" / "No suministra información")
- **V-16945535 (Giron Blanco Dina del Valle)** — habitaciones/baños no numéricos ("No suministra información" / "No suministra información")
- **V-12876140 (Torres Blanchard Eyker Rafael)** — habitaciones/baños no numéricos ("No aplica" / "No aplica ")

## Solicitantes sin datos de hogar (32)

- **V-12679398 (FRANCIMAR JOSEFINA GAMBOA)** — sin dato numérico en: cuántos no trabajan, niños de 7 a 12, cuántos estudian, ingresos ("SUELDO MINIMO")
- **V-21251277 (Flores Bellorin Eily Josefina)** — el libro dice 2 estudiando de 1 niños
- **V-6692584 (JOSE LUIS MORALES MORALES)** — sin dato numérico en: cuántos no trabajan, niños de 7 a 12, cuántos estudian, ingresos ("SALARIO MINIMO")
- **V-20506378 (Mariannis García)** — sin dato numérico en: cuántos no trabajan, niños de 7 a 12, ingresos ("Sin informacion")
- **V-18450908 (Efrén Martínez)** — sin dato numérico en: cuántos no trabajan, niños de 7 a 12, ingresos ("Sin información ")
- **V-12396754 (Columba Corales)** — sin dato numérico en: ingresos ("No aplica")
- **V-11512882 (Felix Zambrano)** — sin dato numérico en: ingresos ("No aplica")
- **V-15429858 (Yaritza del Valle Martínez)** — sin dato numérico en: cuántos no trabajan, niños de 7 a 12, cuántos estudian, ingresos ("No suministra informacion")
- **V-8370445 (Gladis Cardoza)** — sin dato numérico en: niños de 7 a 12, cuántos estudian, ingresos ("No suministra informacion")
- **V-19420603 (Sergio Jiménez)** — sin dato numérico en: cuántos no trabajan, niños de 7 a 12, cuántos estudian, ingresos ("No suministra informacion")
- **V-18169044 (Robert Astudillo)** — sin dato numérico en: cuántos no trabajan, niños de 7 a 12, cuántos estudian, ingresos ("No suministra informacion")
- **V-9906226 (María Mota)** — sin dato numérico en: cuántos no trabajan, niños de 7 a 12, cuántos estudian, ingresos ("No suministra informacion")
- **V-5426329 (Yandira Naveda Leira)** — sin dato numérico en: cuántos trabajan, cuántos no trabajan, niños de 7 a 12, cuántos estudian, ingresos ("No suministra informacion")
- **V-23552118 (Luz Marquez figueroa)** — sin dato numérico en: niños de 7 a 12, ingresos ("no suministra")
- **V-9897125 (Sanchez de Mata Kerenis del Valle)** — sin dato numérico en: niños de 7 a 12, ingresos ("sin respuesta")
- **V-17039236 (Jhony Wladimir Salaberria Quijada)** — sin dato numérico en: ingresos ("no suministra")
- **V-17750004 (Yohomys josefina Gonzales Machiz)** — sin dato numérico en: ingresos ("No aplica")
- **V-5545543 (Senaira Márquez)** — sin dato numérico en: cuántos trabajan, cuántos no trabajan, niños de 7 a 12, cuántos estudian, ingresos ("No aplica ")
- **V-29543234 (Subero Gamez Yexibel Adriana)** — sin dato numérico en: niños de 7 a 12, cuántos estudian
- **V-9319389 (Melida isabel Rodriguez Bejarano)** — sin dato numérico en: ingresos ("no aplica")
- **V-22824309 (Silvia Elena Idarraga Gallego)** — sin dato numérico en: cuántos no trabajan, cuántos estudian, ingresos ("No aplica ")
- **V-18916345 (Aguilera Cedeño, Froilan Vicente)** — sin dato numérico en: cuántos no trabajan, niños de 7 a 12, cuántos estudian, ingresos ("No suministra info")
- **V-17885343 (Alvarez romero Norus del carmen)** — el libro dice 2 estudiando de 1 niños
- **V-8923075 (Ferrer Mata, Maribeth Maigualidad)** — sin dato numérico en: cuántos no trabajan, cuántos estudian, ingresos ("No suministra info")
- **V-16945535 (Giron Blanco Dina del Valle)** — el libro dice 2 estudiando de 1 niños
- **V-6354427 (arisleda bejaramo)** — sin dato numérico en: ingresos ("no aplica")
- **V-16698299 (Martinez Jaramillo, Keila Maria)** — sin dato numérico en: cuántos estudian, ingresos ("No suministra info")
- **V-13220768 (Wilfredo Gómez)** — sin dato numérico en: personas en el hogar, cuántos trabajan, cuántos no trabajan, niños de 7 a 12, cuántos estudian, ingresos ("No suministro info ")
- **V-9945166 (Gil, Migdalis)** — sin dato numérico en: cuántos no trabajan, cuántos estudian, ingresos ("No suministra info")
- **V-11206007 (Ramirez Barreto, Damelis Hestalida)** — sin dato numérico en: cuántos no trabajan, cuántos estudian, ingresos ("No suministra info")
- **V-8330445 (Cardoza de Alvarez, Gladys Auristela)** — sin dato numérico en: cuántos estudian, ingresos ("No suministra info")
- **V-13121797 (Buque García Morelis)** — sin dato numérico en: cuántos trabajan

## A quién quedó atribuido cada caso — conviene revisar

La hoja de casos solo trae el nombre del solicitante; la cédula sale de cruzarlo con el
formulario. El cruce exige dos palabras distintivas en común y que nadie más empate, pero
conviene darle un vistazo a esta tabla: un caso atribuido a quien no es sería un error
difícil de notar después.

| Expediente | Núcleo | Nombre en la hoja de casos | Se atribuyó a | Cédula |
|---|---|---|---|---|
| GY24-25/01 | UCAB Guayana | Francimar Gamboa | FRANCIMAR JOSEFINA GAMBOA | V-12679398 |
| GY24-25/02 | UCAB Guayana | Mayerlin Coa | Mayerlin coa | V-26444583 |
| GY24-25/03 | UCAB Guayana | Kerenis Sánchez | Sanchez de Mata Kerenis del Valle | V-9897125 |
| GY24-25/04 | UCAB Guayana | Jhony Salaberría | Jhony Wladimir Salaberria Quijada | V-17039236 |
| GY24-25/06 | UCAB Guayana | Mélida Rodríguez | Melida isabel Rodriguez Bejarano | V-9319389 |
| GY24-25/08 | UCAB Guayana | Heidi Ruiz | Heidi Roxana Ruiz Diaz | V-25292732 |
| GY24-25/09 | UCAB Guayana | Georgina Bejarano | georgina bejarano | V-14986003 |
| GY24-25/13 | UCAB Guayana | Maribeth Ferrer | Ferrer Mata, Maribeth Maigualidad | V-8923075 |
| GY24-25/14 | UCAB Guayana | Keila Martinez | Martinez Jaramillo, Keila Maria | V-16698299 |
| GY24-25/17 | UCAB Guayana | Damelis Ramirez | Ramirez Barreto, Damelis Hestalida | V-11206007 |
| GY24-25/21 | UCAB Guayana | Senaira Marquez | Senaira Márquez | V-5545543 |
| GY24-25/22 | UCAB Guayana | Silvia Elena Idarraga Gallego | Silvia Elena Idarraga Gallego | V-22824309 |
| GY24-25/28 | UCAB Guayana | Wilfredo Gómez | Wilfredo Gómez | V-13220768 |
| GY24-25/29 | UCAB Guayana | Mauren Hernandez | Mauren Elias Hernández Freites | V-11196085 |
| GY24-25/30 | UCAB Guayana | Eyker Torres | Torres Blanchard Eyker Rafael | V-12876140 |
| GY24-25/33 | UCAB Guayana | Yexibel Adriana Subero Gamez | Subero Gamez Yexibel Adriana | V-29543234 |
| GY 24-25/34 | UCAB Guayana | Eily Flores | Flores Bellorin Eily Josefina | V-21251277 |
| GY 24-25/35 | UCAB Guayana | José Luis Morales Morales | JOSE LUIS MORALES MORALES | V-6692584 |
| GY 24-25/36 | UCAB Guayana | Efren Martínez | Efrén Martínez | V-18450908 |
| GY24-25/39 | UCAB Guayana | Norys Del Carmen Alvarez Romero | Alvarez romero Norus del carmen | V-17885343 |
| GY24-25/43 | UCAB Guayana | Robert Astudillo | Robert Astudillo | V-18169044 |
| GY24-25/44 | UCAB Guayana | María Mota | María Mota | V-9906226 |
| GY24-25/45 | UCAB Guayana | Sergio Jimenez | Sergio Jiménez | V-19420603 |
| GY24-25/46 | UCAB Guayana | Gladis Cardoza | Gladis Cardoza | V-8370445 |
| GY24-25/48 | UCAB Guayana | Georgina Bejarano | georgina bejarano | V-14986003 |
| GY24-25/49 | UCAB Guayana | Mariannis Garcia | Mariannis García | V-20506378 |
| GY24-25/51 | UCAB Guayana | Yaritza Martínez | Yaritza del Valle Martínez | V-15429858 |
| GY24-25/53 | UCAB Guayana | Felix Zambrano | Felix Zambrano | V-11512882 |
| GY24-25/54 | UCAB Guayana | Columba Corales | Columba Corales | V-12396754 |
| GY24-25/56 | UCAB Guayana | Luz Avelina Marquéz Figueroa | Luz Marquez figueroa | V-23552118 |
| GY24-25/57 | UCAB Guayana | Yandira del Carmen Naveda Leira | Yandira Naveda Leira | V-5426329 |
| GY24-25/63 | UCAB Guayana | Dina Girón | Giron Blanco Dina del Valle | V-16945535 |

## Separación de nombre y apellido — conviene revisar

El libro mezcla dos convenciones ("Francimar Josefina Gamboa" y "Poleo Ferrer, Daniel
Alejandro") y sin coma de por medio no hay manera de saber cuál se usó en cada fila.
Se aplicó el patrón dominante: los nombres primero. Esta tabla sirve para detectar los
que quedaron al revés; corregirlos es editar el solicitante desde la app, no hace falta
volver a correr el ETL.

| Cédula | Como está en el libro | Nombres | Apellidos |
|---|---|---|---|
| V-12679398 | FRANCIMAR JOSEFINA GAMBOA | Francimar Josefina | Gamboa |
| V-21251277 | Flores Bellorin Eily Josefina | Flores Bellorin | Eily Josefina |
| V-6692584 | JOSE LUIS MORALES MORALES | Jose Luis | Morales Morales |
| V-20506378 | Mariannis García | Mariannis | García |
| V-18450908 | Efrén Martínez | Efrén | Martínez |
| V-12396754 | Columba Corales | Columba | Corales |
| V-11512882 | Felix Zambrano | Felix | Zambrano |
| V-15429858 | Yaritza del Valle Martínez | Yaritza del Valle | Martínez |
| V-14986003 | georgina bejarano | Georgina | Bejarano |
| V-8370445 | Gladis Cardoza | Gladis | Cardoza |
| V-19420603 | Sergio Jiménez | Sergio | Jiménez |
| V-18169044 | Robert Astudillo | Robert | Astudillo |
| V-9906226 | María Mota | María | Mota |
| V-5426329 | Yandira Naveda Leira | Yandira Naveda | Leira |
| V-23552118 | Luz Marquez figueroa | Luz Marquez | Figueroa |
| V-26444583 | Mayerlin coa | Mayerlin | Coa |
| V-9897125 | Sanchez de Mata Kerenis del Valle | Sanchez de Mata | Kerenis del Valle |
| V-17039236 | Jhony Wladimir Salaberria Quijada | Jhony Wladimir | Salaberria Quijada |
| V-17750004 | Yohomys josefina Gonzales Machiz | Yohomys Josefina | Gonzales Machiz |
| V-5545543 | Senaira Márquez | Senaira | Márquez |
| V-29543234 | Subero Gamez Yexibel Adriana | Subero Gamez | Yexibel Adriana |
| V-9319389 | Melida isabel Rodriguez Bejarano | Melida Isabel | Rodriguez Bejarano |
| V-22824309 | Silvia Elena Idarraga Gallego | Silvia Elena | Idarraga Gallego |
| V-18916345 | Aguilera Cedeño, Froilan Vicente | Froilan Vicente | Aguilera Cedeño |
| V-2933841 | Cristina Nickels | Cristina | Nickels |
| V-25292732 | Heidi Roxana Ruiz Diaz | Heidi Roxana | Ruiz Diaz |
| V-17633040 | Daves Martines | Daves | Martines |
| V-17885343 | Alvarez romero Norus del carmen | Alvarez Romero | Norus del Carmen |
| V-8923075 | Ferrer Mata, Maribeth Maigualidad | Maribeth Maigualidad | Ferrer Mata |
| V-16945535 | Giron Blanco Dina del Valle | Giron Blanco | Dina del Valle |
| V-11196085 | Mauren Elias Hernández Freites | Mauren Elias | Hernández Freites |
| V-6354427 | arisleda bejaramo | Arisleda | Bejaramo |
| V-16698299 | Martinez Jaramillo, Keila Maria | Keila Maria | Martinez Jaramillo |
| V-13220768 | Wilfredo Gómez | Wilfredo | Gómez |
| V-12876140 | Torres Blanchard Eyker Rafael | Torres Blanchard | Eyker Rafael |
| V-9945166 | Gil, Migdalis | Migdalis | Gil |
| V-11206007 | Ramirez Barreto, Damelis Hestalida | Damelis Hestalida | Ramirez Barreto |
| V-8330445 | Cardoza de Alvarez, Gladys Auristela | Gladys Auristela | Cardoza de Alvarez |
| V-13121797 | Buque García Morelis | Buque García | Morelis |

