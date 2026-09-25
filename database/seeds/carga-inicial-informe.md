# Carga inicial 2024-2025 — qué entró y qué no

Generado por `scripts/etl-carga-inicial.mjs`.

**Los 72 casos del libro están cargados.** Para lograrlo hubo que rellenar datos
que el libro no trae, porque las columnas son NOT NULL. Nada de eso se esconde:
cada relleno tiene su sección con quién lo recibió y por qué, y se eligió siempre
de modo que se note que no es un dato real (bloques de cédula aparte, dominio
`.invalid`, parroquia "No suministrada", la misma fecha de nacimiento para todos).

Las secciones que conviene leer, en orden de importancia:

1. **A quién quedó atribuido cada caso** — un caso colgado de la persona
   equivocada es el error más difícil de notar después.
2. **Casos emparejados aceptando una errata** — los que más riesgo tienen de eso.
3. Los rellenos: parroquia, cédula, teléfono y solicitantes completos.

## Resumen

| Tabla | Filas | Omitidas |
|---|---:|---:|
| solicitantes | 71 | 3 |
| viviendas | 47 | 11 |
| familias_y_hogares | 13 | 45 |
| asignadas_a (características) | 473 | — |
| casos | 72 | 0 |
| acciones (revisiones del libro) | 180 | — |

## Respuestas del formulario que no se cargaron (3)

- **fila 3 (EILY FLORES)** — cédula V-21251277 repetida por la misma persona; se conservó la respuesta de la fila 32
- **fila 14 (Georgina Bejarano)** — cédula V-14986003 repetida por la misma persona; se conservó la respuesta de la fila 42
- **fila 62 (Buque García Morelis)** — cédula V-13121797 repetida por la misma persona; se conservó la respuesta de la fila 51

## Solicitantes sin datos de vivienda (11)

- **V-12679398 (FRANCIMAR JOSEFINA GAMBOA)** — habitaciones/baños no numéricos ("SIN INFORMACIÓN" / "SIN INFORMACIÓN")
- **V-21251277 (Flores Bellorin Eily Josefina)** — habitaciones/baños no numéricos ("No suministra información" / "No suministra información")
- **V-6692584 (JOSE LUIS MORALES MORALES)** — habitaciones/baños no numéricos ("SIN INFORMACIÓN" / "SIN INFORMACIÓN")
- **V-19039786 (Arias Marin Yannohacelys Romina)** — habitaciones/baños no numéricos ("No suministra información" / "No suministra información")
- **V-17885343 (Alvarez romero Norus del carmen)** — habitaciones/baños no numéricos ("No suministra información" / "No suministra información")
- **V-16945535 (Giron Blanco Dina del Valle)** — habitaciones/baños no numéricos ("No suministra información" / "No suministra información")
- **V-14510483 (Villafranca de Muñoz Marielis Beatris)** — habitaciones/baños no numéricos ("No suministra información" / "No suministra información")
- **V-13121797 (Bosque García Morelys del Carmen)** — habitaciones/baños no numéricos ("No suministra información" / "No suministra información")
- **V-12876140 (Torres Blanchard Eyker Rafael)** — habitaciones/baños no numéricos ("No aplica" / "No aplica ")
- **V-12875324 (Palma Martínez Rosa Palma)** — habitaciones/baños no numéricos ("No suministra información" / "No suministra información")
- **V-6529420 (Carmen Benilde García de Lara)** — habitaciones/baños no numéricos ("No aplica" / "No aplica")

## Solicitantes sin datos de hogar (45)

- **V-12679398 (FRANCIMAR JOSEFINA GAMBOA)** — sin dato numérico en: cuántos no trabajan, niños de 7 a 12, cuántos estudian, ingresos ("SUELDO MINIMO")
- **V-21251277 (Flores Bellorin Eily Josefina)** — el libro dice 2 estudiando de 1 niños
- **V-6692584 (JOSE LUIS MORALES MORALES)** — sin dato numérico en: cuántos no trabajan, niños de 7 a 12, cuántos estudian, ingresos ("SALARIO MINIMO")
- **V-14743490 (Jhonjaro bolívar Martínez)** — sin dato numérico en: cuántos trabajan, cuántos no trabajan, cuántos estudian, ingresos ("Sin información ")
- **V-20506378 (Mariannis García)** — sin dato numérico en: cuántos no trabajan, niños de 7 a 12, ingresos ("Sin informacion")
- **V-13994561 (Ramón Alexis Marín zapata)** — sin dato numérico en: personas en el hogar, cuántos no trabajan, niños de 7 a 12, cuántos estudian, ingresos ("Sin información ")
- **V-18450908 (Efrén Martínez)** — sin dato numérico en: cuántos no trabajan, niños de 7 a 12, ingresos ("Sin información ")
- **V-70000001 (Leivis Leon)** — sin dato numérico en: cuántos no trabajan, cuántos estudian, ingresos ("No aplica")
- **V-12396754 (Columba Corales)** — sin dato numérico en: ingresos ("No aplica")
- **V-6898353 (Anelsy León)** — sin dato numérico en: cuántos trabajan, cuántos no trabajan, cuántos estudian, ingresos ("No suministra informacion")
- **V-11512882 (Felix Zambrano)** — sin dato numérico en: ingresos ("No aplica")
- **V-15429858 (Yaritza del Valle Martínez)** — sin dato numérico en: cuántos no trabajan, niños de 7 a 12, cuántos estudian, ingresos ("No suministra informacion")
- **V-8370445 (Gladis Cardoza)** — sin dato numérico en: niños de 7 a 12, cuántos estudian, ingresos ("No suministra informacion")
- **V-19420603 (Sergio Jiménez)** — sin dato numérico en: cuántos no trabajan, niños de 7 a 12, cuántos estudian, ingresos ("No suministra informacion")
- **V-18169044 (Robert Astudillo)** — sin dato numérico en: cuántos no trabajan, niños de 7 a 12, cuántos estudian, ingresos ("No suministra informacion")
- **V-9906226 (María Mota)** — sin dato numérico en: cuántos no trabajan, niños de 7 a 12, cuántos estudian, ingresos ("No suministra informacion")
- **V-18901921 (Yurbarys laya)** — sin dato numérico en: cuántos no trabajan, niños de 7 a 12, cuántos estudian, ingresos ("No suministra informacion")
- **V-5426329 (Yandira Naveda Leira)** — sin dato numérico en: cuántos trabajan, cuántos no trabajan, niños de 7 a 12, cuántos estudian, ingresos ("No suministra informacion")
- **V-23552118 (Luz Marquez figueroa)** — sin dato numérico en: niños de 7 a 12, ingresos ("no suministra")
- **V-70000002 (Martha Jansen)** — sin dato numérico en: ingresos ("no aplica ")
- **V-9897125 (Sanchez de Mata Kerenis del Valle)** — sin dato numérico en: niños de 7 a 12, ingresos ("sin respuesta")
- **V-17039236 (Jhony Wladimir Salaberria Quijada)** — sin dato numérico en: ingresos ("no suministra")
- **V-17750004 (Yohomys josefina Gonzales Machiz)** — sin dato numérico en: ingresos ("No aplica")
- **V-5545543 (Senaira Márquez)** — sin dato numérico en: cuántos trabajan, cuántos no trabajan, niños de 7 a 12, cuántos estudian, ingresos ("No aplica ")
- **V-29543234 (Subero Gamez Yexibel Adriana)** — sin dato numérico en: niños de 7 a 12, cuántos estudian
- **V-12594800 (Rangel Colmenares José del Carmen)** — sin dato numérico en: ingresos ("No aplica ")
- **V-9319389 (Melida isabel Rodriguez Bejarano)** — sin dato numérico en: ingresos ("no aplica")
- **V-22824309 (Silvia Elena Idarraga Gallego)** — sin dato numérico en: cuántos no trabajan, cuántos estudian, ingresos ("No aplica ")
- **V-18916345 (Aguilera Cedeño, Froilan Vicente)** — sin dato numérico en: cuántos no trabajan, niños de 7 a 12, cuántos estudian, ingresos ("No suministra info")
- **V-17885343 (Alvarez romero Norus del carmen)** — el libro dice 2 estudiando de 1 niños
- **V-8923075 (Ferrer Mata, Maribeth Maigualidad)** — sin dato numérico en: cuántos no trabajan, cuántos estudian, ingresos ("No suministra info")
- **V-16945535 (Giron Blanco Dina del Valle)** — el libro dice 2 estudiando de 1 niños
- **V-6354427 (arisleda bejaramo)** — sin dato numérico en: ingresos ("no aplica")
- **V-8497059 (María Elena Mendoza Reyes)** — sin dato numérico en: personas en el hogar, ingresos ("No aplica ")
- **V-14510483 (Villafranca de Muñoz Marielis Beatris)** — sin dato numérico en: niños de 7 a 12
- **V-16698299 (Martinez Jaramillo, Keila Maria)** — sin dato numérico en: cuántos estudian, ingresos ("No suministra info")
- **V-13220768 (Wilfredo Gómez)** — sin dato numérico en: personas en el hogar, cuántos trabajan, cuántos no trabajan, niños de 7 a 12, cuántos estudian, ingresos ("No suministro info ")
- **V-27955804 (Poleo Ferrer, Daniel Alejandro)** — sin dato numérico en: cuántos no trabajan, cuántos estudian, ingresos ("No suministra info")
- **V-22918488 (Davianny Alexandra Pino Castillo)** — sin dato numérico en: personas en el hogar, cuántos trabajan, cuántos no trabajan, niños de 7 a 12, cuántos estudian, ingresos ("No suministro info ")
- **V-12875324 (Palma Martínez Rosa Palma)** — sin dato numérico en: cuántos no trabajan, niños de 7 a 12, cuántos estudian
- **V-9945166 (Gil, Migdalis)** — sin dato numérico en: cuántos no trabajan, cuántos estudian, ingresos ("No suministra info")
- **V-6529420 (Carmen Benilde García de Lara)** — sin dato numérico en: personas en el hogar
- **V-11206007 (Ramirez Barreto, Damelis Hestalida)** — sin dato numérico en: cuántos no trabajan, cuántos estudian, ingresos ("No suministra info")
- **V-8330445 (Cardoza de Alvarez, Gladys Auristela)** — sin dato numérico en: cuántos estudian, ingresos ("No suministra info")
- **V-9943357 (Milagros Hernández)** — sin dato numérico en: cuántos trabajan, cuántos no trabajan, niños de 7 a 12, cuántos estudian, ingresos ("No suministro info ")

## Casos emparejados aceptando una errata en el nombre — REVISAR (7)

- **UCAB Guayana · GY24-25/10 · Arisleida Bejarano** — se emparejó con **arisleda bejaramo** (V-6354427) aceptando errata en: arisleida, bejarano
- **UCAB Guayana · GY24-25/11 · Frolian Aguilera** — se emparejó con **Aguilera Cedeño, Froilan Vicente** (V-18916345) aceptando errata en: frolian
- **UCAB Guayana · GY24-25/23 · Daves Martinez** — se emparejó con **Daves Martines** (V-17633040) aceptando errata en: martinez
- **UCAB Guayana · GY24-25/26 · José del Carmen Rangel Colmenarez** — se emparejó con **Rangel Colmenares José del Carmen** (V-12594800) aceptando errata en: colmenarez
- **UCAB Guayana · GY24-25/39 · Norys Del Carmen Alvarez Romero** — se emparejó con **Alvarez romero Norus del carmen** (V-17885343) aceptando errata en: norys
- **UCAB Guayana · Gy24-25/50 · Morelis Bosques** — se emparejó con **Bosque García Morelys del Carmen** (V-13121797) aceptando errata en: morelis, bosques
- **UCAB Guayana · GY24-25/58 · Marieli Villafranca** — se emparejó con **Villafranca de Muñoz Marielis Beatris** (V-14510483) aceptando errata en: marieli

## Solicitantes sin parroquia: quedaron en "No suministrada" (14)

- **fila 7 (Ramón Alexis Marín zapata)** — escribió "Municipio Caroní", que no nombra municipio ni parroquia; se le puso el ámbito de la clínica (Caroní, Bolívar) y la dirección queda tal cual en su ficha
- **fila 11 (Anelsy León)** — escribió "Caimito manzana 34 casa 18", que no nombra municipio ni parroquia; se le puso el ámbito de la clínica (Caroní, Bolívar) y la dirección queda tal cual en su ficha
- **fila 19 (Yurbarys laya)** — escribió "25 de marzo san Félix", que no nombra municipio ni parroquia; se le puso el ámbito de la clínica (Caroní, Bolívar) y la dirección queda tal cual en su ficha
- **fila 26 (Partido Lourdes)** — escribió "Bolivar, Caroni, Puerto Ordaz", que nombra Caroní pero ninguna de sus parroquias
- **fila 36 (Arias Marin Yannohacelys Romina)** — escribió "Bolívar, caroni, San Felix", que nombra Caroní pero ninguna de sus parroquias
- **fila 39 (David Girón)** — escribió "Bolivar, Caroní, la churuata", que nombra Caroní pero ninguna de sus parroquias
- **fila 46 (María Elena Mendoza Reyes)** — escribió "Jorge Hernández, José Félix Rivas primero de mayo, municipio caroni, Estado Bolívar", que nombra Caroní pero ninguna de sus parroquias
- **fila 47 (Villafranca de Muñoz Marielis Beatris)** — escribió "Bolívar, Caroní, Castillito", que nombra Caroní pero ninguna de sus parroquias
- **fila 49 (Marco Tulio Cedeño rodriguez)** — escribió "Caroni, Bolivar, Urbanización Mendoza, calle quirequire, casa 21 .", que nombra Caroní pero ninguna de sus parroquias
- **fila 51 (Bosque García Morelys del Carmen)** — escribió "Bolívar, Caroní, La Unidad", que nombra Caroní pero ninguna de sus parroquias
- **fila 54 (Davianny Alexandra Pino Castillo)** — escribió "No suministro info", que no nombra municipio ni parroquia; se le puso el ámbito de la clínica (Caroní, Bolívar) y la dirección queda tal cual en su ficha
- **fila 55 (Palma Martínez Rosa Palma)** — escribió "Santa Catarina, Brasil", que no nombra municipio ni parroquia; se le puso el ámbito de la clínica (Caroní, Bolívar) y la dirección queda tal cual en su ficha
- **fila 57 (Carmen Benilde García de Lara)** — escribió "Bolivar, Pinto Sabina, San Félix", que no nombra municipio ni parroquia; se le puso el ámbito de la clínica (Caroní, Bolívar) y la dirección queda tal cual en su ficha
- **fila 61 (Milagros Hernández)** — escribió "Bella vista, San Félix, Municipio Caroni, Estado Bolívar", que nombra Caroní pero ninguna de sus parroquias

## Cédulas que hubo que tocar (4)

- **fila 9 (Leivis Leon)** — el formulario dice "No aplica" en la cédula
- **fila 22 (Martha Jansen)** — el formulario le pone la cédula V-23552118, que ya es la de Luz Marquez figueroa (fila 21)
- **fila 26 (Partido Lourdes)** — el formulario trae "P868205", que parece un pasaporte; quedó como solo dígitos y hay que revisar el documento
- **fila 39 (David Girón)** — el formulario dice "No aplica" en la cédula

## Solicitantes sin teléfono (2)

- **fila 53 (Poleo Ferrer, Daniel Alejandro)** — el formulario dice "No suministra info" en el celular
- **fila 59 (Elizabeth García Cova)** — el formulario dice "No aplica" en el celular

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
| GY24-25/05 | UCAB Guayana | Yohannys Gonzalez | Yohomys josefina Gonzales Machiz | V-17750004 |
| GY24-25/06 | UCAB Guayana | Mélida Rodríguez | Melida isabel Rodriguez Bejarano | V-9319389 |
| GY24-25/07 | UCAB Guayana | Cristina Nicklas | Cristina Nickels | V-2933841 |
| GY24-25/08 | UCAB Guayana | Heidi Ruiz | Heidi Roxana Ruiz Diaz | V-25292732 |
| GY24-25/09 | UCAB Guayana | Georgina Bejarano | georgina bejarano | V-14986003 |
| GY24-25/10 | UCAB Guayana | Arisleida Bejarano | arisleda bejaramo | V-6354427 |
| GY24-25/11 | UCAB Guayana | Frolian Aguilera | Aguilera Cedeño, Froilan Vicente | V-18916345 |
| GY24-25/12 | UCAB Guayana | Eugenio Salcedo | Eugenio Salcedo | V-80000010 |
| GY24-25/13 | UCAB Guayana | Maribeth Ferrer | Ferrer Mata, Maribeth Maigualidad | V-8923075 |
| GY24-25/14 | UCAB Guayana | Keila Martinez | Martinez Jaramillo, Keila Maria | V-16698299 |
| GY24-25/15 | UCAB Guayana | Daniel Ferrer | Poleo Ferrer, Daniel Alejandro | V-27955804 |
| GY24-25/16 | UCAB Guayana | Migdalis Gil | Gil, Migdalis | V-9945166 |
| GY24-25/17 | UCAB Guayana | Damelis Ramirez | Ramirez Barreto, Damelis Hestalida | V-11206007 |
| GY24-25/18 | UCAB Guayana | Marco Tulio Cedeño Rodriguez | Marco Tulio Cedeño rodriguez | V-10927452 |
| GY24-25/19 | UCAB Guayana | Morelys Del Carmen Bosque García | Bosque García Morelys del Carmen | V-13121797 |
| GY24-25/20 | UCAB Guayana | Rosa Palma / Oswardo Herrera | Palma Martínez Rosa Palma | V-12875324 |
| GY24-25/21 | UCAB Guayana | Senaira Marquez | Senaira Márquez | V-5545543 |
| GY24-25/22 | UCAB Guayana | Silvia Elena Idarraga Gallego | Silvia Elena Idarraga Gallego | V-22824309 |
| GY24-25/23 | UCAB Guayana | Daves Martinez | Daves Martines | V-17633040 |
| GY24-25/24 | UCAB Guayana | Daviannis Castillo | Davianny Alexandra Pino Castillo | V-22918488 |
| GY24-25/25 | UCAB Guayana | Maria Elena Mendoza | María Elena Mendoza Reyes | V-8497059 |
| GY24-25/26 | UCAB Guayana | José del Carmen Rangel Colmenarez | Rangel Colmenares José del Carmen | V-12594800 |
| GY24-25/27 | UCAB Guayana | David Giron | David Girón | V-70000003 |
| GY24-25/28 | UCAB Guayana | Wilfredo Gómez | Wilfredo Gómez | V-13220768 |
| GY24-25/29 | UCAB Guayana | Mauren Hernandez | Mauren Elias Hernández Freites | V-11196085 |
| GY24-25/30 | UCAB Guayana | Eyker Torres | Torres Blanchard Eyker Rafael | V-12876140 |
| GY24-25/31 | UCAB Guayana | Carmen Benilde García de Lara | Carmen Benilde García de Lara | V-6529420 |
| GY24-25/32 | UCAB Guayana | Elizabeth Garcia | Elizabeth García Cova | V-20808116 |
| GY24-25/33 | UCAB Guayana | Yexibel Adriana Subero Gamez | Subero Gamez Yexibel Adriana | V-29543234 |
| GY 24-25/34 | UCAB Guayana | Eily Flores | Flores Bellorin Eily Josefina | V-21251277 |
| GY 24-25/35 | UCAB Guayana | José Luis Morales Morales | JOSE LUIS MORALES MORALES | V-6692584 |
| GY 24-25/36 | UCAB Guayana | Efren Martínez | Efrén Martínez | V-18450908 |
| GY 24-25/37 | UCAB Guayana | Eloisa Moreno | Eloisa Moreno | V-80000011 |
| GY 24-25/38 | UCAB Guayana | Yannohacelys Romina Arias Marin | Arias Marin Yannohacelys Romina | V-19039786 |
| GY24-25/39 | UCAB Guayana | Norys Del Carmen Alvarez Romero | Alvarez romero Norus del carmen | V-17885343 |
| GY24-25/40 | UCAB Guayana | Ramón Marin | Ramón Alexis Marín zapata | V-13994561 |
| GY24-25/41 | UCAB Guayana | Jhonjaro Bolívar Martínez | Jhonjaro bolívar Martínez | V-14743490 |
| GY24-25/42 | UCAB Guayana | Yurbanys Luzmery | Yurbarys laya | V-18901921 |
| GY24-25/43 | UCAB Guayana | Robert Astudillo | Robert Astudillo | V-18169044 |
| GY24-25/44 | UCAB Guayana | María Mota | María Mota | V-9906226 |
| GY24-25/45 | UCAB Guayana | Sergio Jimenez | Sergio Jiménez | V-19420603 |
| GY24-25/46 | UCAB Guayana | Gladis Cardoza | Gladis Cardoza | V-8370445 |
| GY24-25/47 | UCAB Guayana | Lourdes Partido | Partido Lourdes | E-868205 |
| GY24-25/48 | UCAB Guayana | Georgina Bejarano | georgina bejarano | V-14986003 |
| GY24-25/49 | UCAB Guayana | Mariannis Garcia | Mariannis García | V-20506378 |
| Gy24-25/50 | UCAB Guayana | Morelis Bosques | Bosque García Morelys del Carmen | V-13121797 |
| GY24-25/51 | UCAB Guayana | Yaritza Martínez | Yaritza del Valle Martínez | V-15429858 |
| GY24-25/52 | UCAB Guayana | Anelsy León | Anelsy León | V-6898353 |
| GY24-25/53 | UCAB Guayana | Felix Zambrano | Felix Zambrano | V-11512882 |
| GY24-25/54 | UCAB Guayana | Columba Corales | Columba Corales | V-12396754 |
| GY24-25/55 | UCAB Guayana | Leivis León | Leivis Leon | V-70000001 |
| GY24-25/56 | UCAB Guayana | Luz Avelina Marquéz Figueroa | Luz Marquez figueroa | V-23552118 |
| GY24-25/57 | UCAB Guayana | Yandira del Carmen Naveda Leira | Yandira Naveda Leira | V-5426329 |
| GY24-25/58 | UCAB Guayana | Marieli Villafranca | Villafranca de Muñoz Marielis Beatris | V-14510483 |
| GY24-25/59 | UCAB Guayana | Martha Jansen | Martha Jansen | V-70000002 |
| GY24-25/60 | UCAB Guayana | Maria José de León | Maria José de León | V-80000012 |
| GY24-25/61 | UCAB Guayana | Eglis Gonzalez | Eglis Gonzalez | V-80000013 |
| GY24-25/62 | UCAB Guayana | Milagros Hernandez | Milagros Hernández | V-9943357 |
| GY24-25/63 | UCAB Guayana | Dina Girón | Giron Blanco Dina del Valle | V-16945535 |
| CB24-25/01 | Casa Barandiarán | Marlierys Del Valle Sulbaran Salavarria | Marlierys Del Valle Sulbaran Salavarria | V-80000001 |
| CB24-25/02 | Casa Barandiarán | Wilfredo Acosta Garcia | Wilfredo Acosta Garcia | V-80000002 |
| CB24-25/03 | Casa Barandiarán | Juan Sergio Alejandro Marin Guevara | Juan Sergio Alejandro Marin Guevara | V-80000003 |
| CB24-25/04 | Casa Barandiarán | Anibal Jose Acosta | Anibal Jose Acosta | V-80000004 |
| CB24-25/05 | Casa Barandiarán | Maria Hidalgo | Maria Hidalgo | V-80000005 |
| CB24-25/06 | Casa Barandiarán | Rosalia Cristina Gomez ( representada por Yenny Fuenmayor) | Rosalia Cristina Gomez ( representada por Yenny Fuenmayor) | V-80000006 |
| CB24-25/07 | Casa Barandiarán | Wendy del Valle Gularte Salaverria | Wendy del Valle Gularte Salaverria | V-80000007 |
| CB24-25/08 | Casa Barandiarán | Elizabeth Acosta | Elizabeth Acosta | V-80000008 |
| CB24-25/09 | Casa Barandiarán | Carmen Yraida Forero | Carmen Yraida Forero | V-80000009 |

## Solicitantes con datos de relleno (13) — LEER

Estas personas aparecen en el control de casos pero no en el formulario
socioeconómico. Las nueve de Casa Barandiarán, porque ese núcleo atiende en
jornadas de comunidad y no se llenó ninguna ficha: las 61 respuestas del
formulario son todas de UCAB Guayana. Las otras cuatro son de Guayana y
simplemente no lo llenaron — se buscó por nombre y por errata y no hay en las 61
respuestas ninguna que se les parezca. Sin solicitante no hay caso, así que se
les armó uno para que sus casos existan.

**Reales** (salen del libro): nombre, teléfono, y todo lo del caso en sí — tipo,
reseña, revisiones con sus fechas, estatus y responsable.

**Inventados** (el libro no los trae):

| Dato | Qué se puso | Por qué así |
|---|---|---|
| Cédula | bloque `V-8000000x` | aparte del `V-9000000x` del equipo; se ve de lejos que no es real |
| Correo | `v-8000000x@sin-correo.invalid` | `.invalid` no existe por norma: nadie le escribe por error |
| Fecha de nacimiento | 1990-01-01 para todos | que todos "nazcan" el mismo día es la señal de que el dato no existe |
| Domicilio | parroquia "No suministrada" de Caroní, Bolívar | el ámbito de la clínica; la parroquia queda declarada como desconocida y `direccion_habitacion` vacía |
| Nivel educativo | "No suministrado" | el campo es NOT NULL y "Sin Nivel" diría que no estudió |
| Trabajo y actividad | vacíos | no se sabe, y "no aplica" ya sería afirmar algo |
| Concubinato | No | el campo es NOT NULL y no admite "se desconoce" |

`sexo` sale del nombre de pila y `estado_civil` de la reseña cuando la dice; donde no,
queda Soltero. Ninguno tiene datos de vivienda, hogar ni características: eso solo
lo pregunta el formulario.

Del sexo de Eglis Gonzalez no hay forma de
estar seguro por el nombre; la columna solo admite M o F y quedó en F.

| Cédula | Como está en el libro | Nombres | Apellidos | Sexo | Estado civil | Teléfono |
|---|---|---|---|---|---|---|
| V-80000010 | Eugenio Salcedo | Eugenio | Salcedo | M | Soltero | 04148896273 |
| V-80000011 | Eloisa Moreno | Eloisa | Moreno | F | Soltero | 04121191807 |
| V-80000012 | Maria José de León | Maria José | de León | F | Casado | 04143947062 |
| V-80000013 | Eglis Gonzalez | Eglis | Gonzalez | F | Soltero | 04121802311 |
| V-80000001 | Marlierys Del Valle Sulbaran Salavarria | Marlierys del Valle | Sulbaran Salavarria | F | Casado | 04263320070 |
| V-80000002 | Wilfredo Acosta Garcia | Wilfredo | Acosta Garcia | M | Soltero | 04262116674 |
| V-80000003 | Juan Sergio Alejandro Marin Guevara | Juan Sergio Alejandro | Marin Guevara | M | Casado | 04249718443 |
| V-80000004 | Anibal Jose Acosta | Anibal Jose | Acosta | M | Soltero | 04166870608 |
| V-80000005 | Maria Hidalgo | Maria | Hidalgo | F | Divorciado | 04268905651 |
| V-80000006 | Rosalia Cristina Gomez ( representada por Yenny Fuenmayor) | Rosalia Cristina | Gomez | F | Soltero | 041268667029 |
| V-80000007 | Wendy del Valle Gularte Salaverria | Wendy del Valle | Gularte Salaverria | F | Soltero | 04164693707 |
| V-80000008 | Elizabeth Acosta | Elizabeth | Acosta | F | Soltero | 04249242755 |
| V-80000009 | Carmen Yraida Forero | Carmen Yraida | Forero | F | Soltero | 04127804032 |

## Solicitantes sin ningún caso (1) — posible duplicado

Llenaron el formulario pero ningún caso del libro quedó a su nombre. Casi siempre
es la misma persona registrada dos veces con la cédula copiada distinto: el caso
está colgado del otro registro. Conviene comparar y unificar desde la app.

- **V-8330445 (Cardoza de Alvarez, Gladys Auristela)** — se parece a Gladis Cardoza (V-8370445); Alvarez romero Norus del carmen (V-17885343)

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
| V-14743490 | Jhonjaro bolívar Martínez | Jhonjaro Bolívar | Martínez |
| V-20506378 | Mariannis García | Mariannis | García |
| V-13994561 | Ramón Alexis Marín zapata | Ramón Alexis | Marín Zapata |
| V-18450908 | Efrén Martínez | Efrén | Martínez |
| V-70000001 | Leivis Leon | Leivis | Leon |
| V-12396754 | Columba Corales | Columba | Corales |
| V-6898353 | Anelsy León | Anelsy | León |
| V-11512882 | Felix Zambrano | Felix | Zambrano |
| V-15429858 | Yaritza del Valle Martínez | Yaritza del Valle | Martínez |
| V-14986003 | georgina bejarano | Georgina | Bejarano |
| V-8370445 | Gladis Cardoza | Gladis | Cardoza |
| V-19420603 | Sergio Jiménez | Sergio | Jiménez |
| V-18169044 | Robert Astudillo | Robert | Astudillo |
| V-9906226 | María Mota | María | Mota |
| V-18901921 | Yurbarys laya | Yurbarys | Laya |
| V-5426329 | Yandira Naveda Leira | Yandira Naveda | Leira |
| V-23552118 | Luz Marquez figueroa | Luz Marquez | Figueroa |
| V-70000002 | Martha Jansen | Martha | Jansen |
| V-26444583 | Mayerlin coa | Mayerlin | Coa |
| V-9897125 | Sanchez de Mata Kerenis del Valle | Sanchez de Mata | Kerenis del Valle |
| V-17039236 | Jhony Wladimir Salaberria Quijada | Jhony Wladimir | Salaberria Quijada |
| E-868205 | Partido Lourdes | Partido | Lourdes |
| V-17750004 | Yohomys josefina Gonzales Machiz | Yohomys Josefina | Gonzales Machiz |
| V-5545543 | Senaira Márquez | Senaira | Márquez |
| V-29543234 | Subero Gamez Yexibel Adriana | Subero Gamez | Yexibel Adriana |
| V-12594800 | Rangel Colmenares José del Carmen | Rangel Colmenares | José del Carmen |
| V-9319389 | Melida isabel Rodriguez Bejarano | Melida Isabel | Rodriguez Bejarano |
| V-22824309 | Silvia Elena Idarraga Gallego | Silvia Elena | Idarraga Gallego |
| V-18916345 | Aguilera Cedeño, Froilan Vicente | Froilan Vicente | Aguilera Cedeño |
| V-2933841 | Cristina Nickels | Cristina | Nickels |
| V-19039786 | Arias Marin Yannohacelys Romina | Arias Marin | Yannohacelys Romina |
| V-25292732 | Heidi Roxana Ruiz Diaz | Heidi Roxana | Ruiz Diaz |
| V-17633040 | Daves Martines | Daves | Martines |
| V-70000003 | David Girón | David | Girón |
| V-17885343 | Alvarez romero Norus del carmen | Alvarez Romero | Norus del Carmen |
| V-8923075 | Ferrer Mata, Maribeth Maigualidad | Maribeth Maigualidad | Ferrer Mata |
| V-16945535 | Giron Blanco Dina del Valle | Giron Blanco | Dina del Valle |
| V-11196085 | Mauren Elias Hernández Freites | Mauren Elias | Hernández Freites |
| V-6354427 | arisleda bejaramo | Arisleda | Bejaramo |
| V-8497059 | María Elena Mendoza Reyes | María Elena | Mendoza Reyes |
| V-14510483 | Villafranca de Muñoz Marielis Beatris | Villafranca de Muñoz | Marielis Beatris |
| V-16698299 | Martinez Jaramillo, Keila Maria | Keila Maria | Martinez Jaramillo |
| V-10927452 | Marco Tulio Cedeño rodriguez | Marco Tulio | Cedeño Rodriguez |
| V-13220768 | Wilfredo Gómez | Wilfredo | Gómez |
| V-13121797 | Bosque García Morelys del Carmen | Bosque García | Morelys del Carmen |
| V-12876140 | Torres Blanchard Eyker Rafael | Torres Blanchard | Eyker Rafael |
| V-27955804 | Poleo Ferrer, Daniel Alejandro | Daniel Alejandro | Poleo Ferrer |
| V-22918488 | Davianny Alexandra Pino Castillo | Davianny Alexandra | Pino Castillo |
| V-12875324 | Palma Martínez Rosa Palma | Palma Martínez | Rosa Palma |
| V-9945166 | Gil, Migdalis | Migdalis | Gil |
| V-6529420 | Carmen Benilde García de Lara | Carmen Benilde | García de Lara |
| V-11206007 | Ramirez Barreto, Damelis Hestalida | Damelis Hestalida | Ramirez Barreto |
| V-20808116 | Elizabeth García Cova | Elizabeth García | Cova |
| V-8330445 | Cardoza de Alvarez, Gladys Auristela | Gladys Auristela | Cardoza de Alvarez |
| V-9943357 | Milagros Hernández | Milagros | Hernández |

