/**
 * ETL de la carga inicial de datos reales (período 2024-2025).
 *
 *   node scripts/etl-carga-inicial.mjs <beneficiarios.xlsx> <control-casos.xlsx>
 *
 * Lee los dos libros que lleva la clínica a mano y genera:
 *   database/seeds/carga-inicial-2024-2025.sql   — el SQL a aplicar
 *   database/seeds/carga-inicial-informe.md      — qué entró, qué no y por qué
 *
 * No toca la base: solo genera. Los catálogos (estados/municipios/parroquias,
 * ámbitos legales, características, niveles educativos…) se leen de la base
 * para resolver los identificadores, pero no se modifican.
 *
 * REGLA DE ORO: no se inventan datos. Si a una fila le falta algo que el
 * esquema exige, esa fila queda fuera y se lista en el informe con el motivo.
 * Por eso las tablas satélite (viviendas, familias_y_hogares) cargan menos
 * filas que solicitantes: el libro trae "SIN INFORMACIÓN" en muchos números.
 */
import ExcelJS from 'exceljs';
import { existsSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(__dirname, '..');
for (const f of ['.env.local', '.env']) {
    const r = join(RAIZ, f);
    if (existsSync(r)) dotenv.config({ path: r });
}

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------
const norm = (s) =>
    String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '')
        .toLowerCase().replace(/\s+/g, ' ').trim();

/** Solo el primer número que aparezca; null si el texto no tiene ninguno. */
const aNumero = (s) => {
    const t = String(s ?? '').trim();
    if (!t) return null;
    const m = t.replace(/\./g, '').replace(',', '.').match(/-?\d+(\.\d+)?/);
    return m ? Number(m[0]) : null;
};

const sql = (v) => (v === null || v === undefined ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);
const sqlNum = (v) => (v === null || v === undefined || Number.isNaN(v) ? 'NULL' : String(v));
/** Los ids de nivel educativo pueden venir como el nombre de una opción nueva. */
const sqlNivel = (v) =>
    v === NIVEL_NO_SUMINISTRADO
        ? `(SELECT id_nivel_educativo FROM niveles_educativos WHERE descripcion = ${sql(v)})`
        : sqlNum(v);
const sqlBool = (v) => (v === null || v === undefined ? 'NULL' : v ? 'TRUE' : 'FALSE');
/** Igual que sqlNivel: la parroquia "No suministrada" se resuelve por nombre. */
const sqlParroquia = (s) => (s.num_parroquia !== null ? sqlNum(s.num_parroquia)
    : `(SELECT num_parroquia FROM parroquias WHERE id_estado = ${s.id_estado}`
      + ` AND num_municipio = ${s.num_municipio} AND nombre_parroquia = ${sql(PARROQUIA_NO_SUMINISTRADA)})`);

const titulo = (s) =>
    String(s ?? '').toLowerCase().split(/\s+/).filter(Boolean)
        .map((p) => (['de', 'del', 'la', 'las', 'los', 'y'].includes(p) ? p : p[0].toUpperCase() + p.slice(1)))
        .join(' ');

/**
 * El libro dice "Apellidos y nombres" pero está escrito al revés: los datos
 * son "Nombres Apellidos" ("FRANCIMAR JOSEFINA GAMBOA"). Las partículas
 * (de, del, la…) se pegan a la palabra siguiente para no partir
 * "Yaritza del Valle Martínez" por la mitad.
 */
function partirNombre(completo) {
    const texto = String(completo ?? '').trim();
    if (!texto) return null;

    const agrupar = (cadena) => {
        const bruto = cadena.trim().split(/\s+/).filter(Boolean);
        const partes = [];
        for (let i = 0; i < bruto.length; i++) {
            if (['de', 'del', 'la', 'las', 'los'].includes(norm(bruto[i])) && i + 1 < bruto.length) {
                partes.push(`${bruto[i]} ${bruto[i + 1]}`);
                i++;
            } else partes.push(bruto[i]);
        }
        return partes;
    };

    // "Poleo Ferrer, Daniel Alejandro": con coma sí está en el orden que dice
    // el encabezado, apellidos primero.
    if (texto.includes(',')) {
        const [ape, nom] = texto.split(',');
        const apellidos = agrupar(ape).join(' ');
        const nombres = agrupar(nom).join(' ');
        if (apellidos && nombres) return { nombres: titulo(nombres), apellidos: titulo(apellidos) };
    }

    const partes = agrupar(texto);
    if (partes.length === 0) return null;
    if (partes.length === 1) return { nombres: titulo(partes[0]), apellidos: titulo(partes[0]) };
    if (partes.length === 2) return { nombres: titulo(partes[0]), apellidos: titulo(partes[1]) };
    // Tres partes es ambiguo ("Francimar Josefina Gamboa" vs "Jhonjaro Bolívar
    // Martínez"); se toma el patrón dominante del libro: dos nombres y un
    // apellido. El nombre completo original queda en el informe por si hay que
    // corregir alguno a mano.
    if (partes.length === 3) return { nombres: titulo(partes.slice(0, 2).join(' ')), apellidos: titulo(partes[2]) };
    return { nombres: titulo(partes.slice(0, 2).join(' ')), apellidos: titulo(partes.slice(2).join(' ')) };
}

/**
 * Celular a solo dígitos. La hoja de Casa Barandiarán guardó los teléfonos como
 * número y Excel les comió el 0 de adelante ("4263320070"): si quedan diez
 * dígitos empezando por 4 se le devuelve, porque todo celular venezolano es 0 +
 * diez dígitos. Lo que venga con otra cantidad se deja tal cual —hay cinco así
 * en los libros, y con un dígito de más no hay manera de saber cuál sobra.
 */
const aCelular = (v) => {
    const d = String(v ?? '').replace(/\D/g, '');
    return d.length === 10 && d.startsWith('4') ? `0${d}` : d;
};

/** Fechas: el libro mezcla ISO y dd/mm/aaaa. */
function aFecha(v) {
    const t = String(v ?? '').trim();
    if (!t) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
    const m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (m) {
        const [, d, mes, a] = m;
        const anio = a.length === 2 ? `20${a}` : a;
        return `${anio}-${String(mes).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    return null;
}

/**
 * Partículas y conectores que aparecen en muchísimos nombres venezolanos. No
 * distinguen a nadie, así que no cuentan como coincidencia: sin esto,
 * "Morelys Del Carmen Bosque García" se emparejaba con "Alvarez Romero Norus
 * del Carmen" por compartir "del" y "carmen", y el caso terminaba colgado de
 * la persona equivocada.
 */
const PARTICULAS = new Set(['del', 'los', 'las', 'san', 'santa']);

/**
 * Nombres de pila tan repetidos que por sí solos no identifican a nadie. No se
 * excluyen del conteo —"María Mota" sería irreconocible sin "maría"— pero se
 * exige que al menos una coincidencia NO sea de esta lista, es decir que haya
 * pegado algo parecido a un apellido.
 */
const NOMBRES_COMUNES = new Set(['maria', 'jose', 'carmen', 'luis', 'ana', 'juan', 'jesus', 'rosa']);

/**
 * El formulario escribe "Nombres Apellidos" y la hoja de casos a veces al
 * revés o abreviado. Se cruza por palabras, pero solo cuentan las que
 * distinguen: hacen falta al menos dos, una de ellas fuera de los nombres de
 * pila más repetidos, y que ninguna otra persona empate. Ante la duda no se
 * empareja y el caso queda en el informe: es preferible dejarlo fuera a
 * atribuírselo a quien no es.
 */
const distintivas = (nombre) =>
    // La puntuación se quita ANTES de partir: el formulario escribe "Gil,
    // Migdalis" y sin esto el token quedaba "gil," —con la coma pegada— que no
    // coincide con ningún "Gil". Eran siete filas escritas con coma, y sus casos
    // se quedaban fuera por eso.
    new Set(norm(nombre).replace(/[^a-z0-9ñ ]+/g, ' ').split(' ')
        .filter((x) => x.length > 2 && !PARTICULAS.has(x)));

/**
 * ¿Son la misma palabra escrita con una errata? Los dos libros los llevan
 * personas distintas a mano y el mismo nombre viaja deformado: "Nicklas" y
 * "Nickels", "Martinez" y "Martines", "Froilan" y "Frolian", "bejaramo" y
 * "Bejarano". Se acepta una sola diferencia —un cambio, una letra de más, una
 * de menos o dos letras seguidas intercambiadas— y solo en palabras de 5 letras
 * o más, porque en palabras cortas una letra de diferencia cambia el nombre
 * ("Ana"/"Ani", "Leon"/"Leal").
 */
function casiIgual(a, b) {
    if (a === b) return true;
    if (a.length < 5 || b.length < 5 || Math.abs(a.length - b.length) > 1) return false;
    if (a.length === b.length) {
        const d = [...a].reduce((n, c, i) => n + (c === b[i] ? 0 : 1), 0);
        if (d === 1) return true;
        // Transposición: "Froilan" / "Frolian".
        const p = [...a].findIndex((c, i) => c !== b[i]);
        return d === 2 && a[p] === b[p + 1] && a[p + 1] === b[p]
            && a.slice(p + 2) === b.slice(p + 2);
    }
    const [corta, larga] = a.length < b.length ? [a, b] : [b, a];
    for (let i = 0; i <= corta.length; i++)
        if (corta === larga.slice(0, i) + larga.slice(i + 1)) return true;
    return false;
}

// ---------------------------------------------------------------------------
// Mapas de traducción libro -> catálogo
// ---------------------------------------------------------------------------
const NIVEL_EDUCATIVO = {
    '0 sin nivel': 1,
    '1-6 primaria (grado)': 2,
    '7-9 basica (1er, 2do, 3er / 7mo, 8vo, 9no)': 3,
    '10-11 media diversificada (4to y 5to ano)': 4,
    'tecnico medio (*)': 5,
    'tecnico superior (*)': 6,
    'universitaria (*)': 7,
};
/**
 * 23 de las 61 personas contestaron "no suministra la información" en el nivel
 * educativo, y la columna es NOT NULL. Mapearlas a "Sin Nivel" sería decir que
 * no estudiaron, que es otra cosa; dejarlas fuera costaba casi la mitad del
 * registro. Se agrega al catálogo una opción "No suministrado" —el catálogo lo
 * administra el Coordinador desde la app— y el SQL la resuelve por nombre.
 */
const NIVEL_NO_SUMINISTRADO = 'No suministrado';

/**
 * Lo mismo, pero para la parroquia.
 *
 * El formulario pide "Estado, municipio y parroquia" y buena parte de la gente
 * responde con su sector ("Caimito manzana 34 casa 18", "Bella vista, San
 * Félix"). El municipio se sabe —Caroní, todas—, la parroquia no, y las tres
 * columnas son NOT NULL. Meterlos en una parroquia real cualquiera sería decir
 * que viven donde no viven, y encima quedaría escondido: el informe por
 * parroquia los contaría como vecinos de gente que no lo es.
 *
 * Así que se agrega una parroquia "No suministrada" por municipio, igual que se
 * hizo con el nivel educativo. El dato desconocido queda a la vista en vez de
 * disfrazado, y la dirección tal como la escribió la persona se guarda completa
 * en `direccion_habitacion`, que es lo que la app muestra como domicilio.
 */
const PARROQUIA_NO_SUMINISTRADA = 'No suministrada';

/**
 * Lo que va en telefono_celular cuando el formulario no trae ninguno. La columna
 * es NOT NULL y un número inventado sería peor que nada: alguien podría marcarlo
 * y caer en la casa de un desconocido. Un texto no se puede marcar.
 */
const SIN_TELEFONO = 'No suministrado';

/**
 * Quién queda como responsable del registro. La carga la hace el Coordinador,
 * así que es su cédula la que va en id_usuario_registro y en app.current_user_id
 * (trigger_crear_cambio_estatus_inicial la exige para poder abrir el caso).
 */
const COORDINADOR = 'V-77777777';
/** Misma contraseña que el Coordinador; son cuentas de demostración. */
const CLAVE_DEMO = '$2b$10$sV6rtquZ.uUT2RKkp.Gw/uNIj7qoYjPUwfYdek1tuvbNcBQ3ByYn2';
/** Semestres que abarca el libro: 2025-15 (sep 2024 - ene 2025), 2025-25 (mar - jul 2025) y la cola en 2026-15. */
const TERMS = ['2025-15', '2025-25', '2026-15'];
const esSinRespuesta = (t) => /^(no suministra|sin informacion|no informa|no aplica|sin respuesta|si informacion)/.test(t);

const CONDICION_TRABAJO = { patrono: 1, empleado: 2, obrero: 3, 'cuenta propia': 4, 'no aplica': 0 };
const CONDICION_ACTIVIDAD = { 'ama de casa': 1, estudiante: 2, 'pensionado/jubilado': 3, otra: 4 };

const CARACTERISTICAS = {
    1: { // Tipo de vivienda
        'quinta/casa urbanizacion': 2, quinta: 1, 'casa urb': 2, apartamento: 3, bloque: 4,
        'casa de barrio': 5, 'casa rural': 6, rancho: 7, refugio: 8, otro: 9, otros: 9,
    },
    2: { tierra: 1, cemento: 2, ceramica: 3, porcelanato: 3, 'granito, parquet, marmol': 4 },
    3: { 'carton/palma/desechos': 1, bahareque: 2, 'bloque sin frizar': 3, 'bloque frizado': 4 },
    4: { 'madera / carton / palma': 1, 'zinc / acerolit': 2, 'platabanda / tejas': 3 },
    5: { 'dentro de la vivienda': 1, 'fuera de la vivienda': 2, 'no tiene servicio': 3 },
    6: { 'llega a la vivienda': 1, 'no llega a la vivienda / container': 2, 'no tiene': 3 },
    7: { 'poceta a cloaca / pozo septico': 1, 'poceta sin conexion (tubo)': 2, 'excusado de hoyo o letrina': 3 },
    8: { nevera: 1, lavadora: 2, computadora: 3, 'cable satelital': 4, internet: 5, carro: 6, moto: 7 },
};

/**
 * "Tipo de Caso" del libro -> [materia, categoria, subcategoria, ambito].
 * Los divorcios por causal no taxativa van a Tribunales Ordinarios (1/1/1/8)
 * salvo que la reseña hable de hijos: entonces a Protección de Niños, Niñas y
 * Adolescentes (1/1/2/18). Ver `ambitoDeCaso`.
 */
const TIPO_CASO = {
    'divorcio causal no taxativas sentencias': [1, 1, 1, 8],
    'divorcio': [1, 1, 1, 1],
    'divorcio mutuo acuerdo': [1, 1, 1, 1],
    'divorcio/ asesoria internacional exequatur': [1, 1, 1, 4],
    'particion de la comunidad conyugal': [1, 1, 1, 5],
    'particion de la comunidad hereditaria': [1, 0, 4, 5],
    'ejercicio unilateral de patria potestad': [1, 1, 2, 17],
    'autorizacion para viajar': [1, 1, 2, 9],
    'asesoria sobre tutela sobre nino': [1, 1, 2, 19],
    'identificacion de menores': [1, 1, 2, 8],
    'titulo supletorio': [1, 0, 2, 1],
    'titulo de propiedad': [1, 0, 2, 1],
    'compra -venta de bien inmueble': [1, 0, 3, 2],
    'compra venta de vehiculo': [1, 0, 3, 3],
    'arrendamiento/comodato': [1, 0, 3, 1],
    'arredamiento/comodato': [1, 0, 3, 1],
    'contrato de arrendamiento': [1, 0, 3, 1],
    'poder': [1, 0, 3, 8],
    'cesion de derechos': [1, 0, 3, 9],
    'asociaciones/fundaciones': [1, 0, 3, 6],
    'acta constitutiva de fundacion': [1, 0, 3, 6],
    'constitucion de companias': [4, 0, 0, 2],
    'declaracion jurada (union concubinaria)': [1, 0, 1, 5],
    'otros (reconstruccion de acta de matrimonio de sus padres)': [1, 0, 1, 2],
    'convivencia ciudadana': [6, 0, 0, 1],
    'convicencia ciudadana': [6, 0, 0, 1],
    'derechos humanos (apagon)': [6, 0, 0, 2],
    'otros (asesoria mercantil)': [6, 0, 0, 4],
    'otros (asesoria en materia migratoria)': [6, 0, 0, 4],
    'conseguir cedulas para unos ancianos': [6, 0, 0, 4],
};
const AMBITO_POR_DEFECTO = [6, 0, 0, 4]; // Otros / Otros

/** 'tramite' no existe en el libro: se deduce del tipo de caso y la reseña. */
function tramiteDeCaso(tipo, texto) {
    const t = norm(`${tipo} ${texto}`);
    if (/\btribunal|expediente|demanda|sentenci|audiencia|juzgado|fiscal\b/.test(t))
        return 'Asistencia Judicial - Casos externos';
    if (/mediaci|concilia|acuerdo entre/.test(t)) return 'Conciliación y Mediación';
    if (/poder|titulo|contrato|declaracion|acta|constituci|cesion|compra|venta|redacc/.test(t))
        return 'Redacción documentos y/o convenio';
    return 'Asesoría';
}

function ambitoDeCaso(tipo, reseña) {
    const clave = norm(tipo);
    let ambito = TIPO_CASO[clave];
    if (!ambito) {
        const parcial = Object.keys(TIPO_CASO).find((k) => clave.includes(k) || k.includes(clave));
        ambito = parcial ? TIPO_CASO[parcial] : AMBITO_POR_DEFECTO;
    }
    // Divorcio por causal no taxativa: a Protección NNA si hay menores de por medio.
    if (ambito[0] === 1 && ambito[1] === 1 && ambito[2] === 1 && ambito[3] === 8) {
        if (/\bhijo|hija|nino|nina|menor|manutenci|adolescente|patria potestad\b/.test(norm(reseña)))
            return [1, 1, 2, 18];
    }
    return ambito;
}

/**
 * Saca la fecha de una revisión ("En fecha 11/07/25 se presentó solicitud…").
 *
 * El libro escribe dd/mm/aa, a veces sin año ("En fecha 11/12 se citó…") y a
 * veces sin fecha ("Se le brindó la asesoría…", que es lo que pasó el día de
 * la consulta). Cuando falta el año se toma el de la anotación anterior; si no
 * hay fecha alguna, devuelve null y quien llama usa la anterior, dejándolo
 * dicho en el comentario de la acción.
 *
 * @param referencia fecha de la anotación anterior (o la del caso)
 * @param inicio     fecha de inicio del caso: nada puede ser anterior
 */
function fechaEnTexto(texto, referencia, inicio) {
    const m = String(texto).match(/(\d{1,2})[/\-.](\d{1,2})(?:[/\-.](\d{2,4}))?/);
    if (!m) return null;

    const [, d, mes, a] = m;
    const dia = Number(d), numMes = Number(mes);
    if (dia < 1 || dia > 31 || numMes < 1 || numMes > 12) return null;

    const anio = a
        ? (a.length === 2 ? 2000 + Number(a) : Number(a))
        : Number(referencia.slice(0, 4));
    const iso = `${anio}-${String(numMes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

    // Una revisión no puede ser anterior a la apertura del caso ni futura: si
    // sale eso, el texto traía otra cosa (un número de expediente, un monto).
    const hoy = new Date().toISOString().slice(0, 10);
    if (iso < inicio || iso > hoy) return null;
    return iso;
}

/**
 * Quiénes son las personas que aparecen en "Alumno responsable".
 *
 * El libro las escribe a mano y con erratas ("Vincenzo", "Vincezo Altobelli",
 * "Vicenzo"; "Edgar Dunn", "Edgar Dumn", "Egdar Dunn"), a veces dos en la misma
 * celda ("Nazaret y Dunn", "Niuska Calderon y Bautista Rosas") y a veces con
 * una nota delante ("Redacción: Edgar", "Profesor Colaborador: Roberto
 * Delgado"). Este mapa fija quién es quién; la clave es el texto normalizado
 * tal como aparece.
 *
 * Las cédulas y los correos son INVENTADOS: de estas personas el libro solo da
 * el nombre. Se usa un bloque de cédulas V-9000000x y el sufijo ".demo" en el
 * correo justamente para que se note que no son datos reales y para no chocar
 * con una dirección verdadera de la UCAB.
 */
const EQUIPO = [
    { rol: 'Profesor', nombres: 'Minelvis', apellidos: 'Martínez', alias: ['minelvis martinez', 'minelvis'] },
    { rol: 'Profesor', nombres: 'Roberto', apellidos: 'Delgado', alias: ['roberto delgado'] },
    { rol: 'Estudiante', nombres: 'Edgar', apellidos: 'Dunn', alias: ['edgar dunn', 'edgar dumn', 'egdar dunn', 'edgar', 'dunn'] },
    { rol: 'Estudiante', nombres: 'José Matías', apellidos: 'Araguayan', alias: ['jose matias araguayan', 'mathias', 'matias'] },
    { rol: 'Estudiante', nombres: 'Vincenzo', apellidos: 'Altobelli', alias: ['vincenzo altobelli', 'vincezo altobelli', 'vincenzo', 'vicenzo'] },
    { rol: 'Estudiante', nombres: 'Yuliana', apellidos: 'Pereira', alias: ['yuliana pereira'] },
    { rol: 'Estudiante', nombres: 'Victoria', apellidos: 'Pereira', alias: ['victoria pereira'] },
    { rol: 'Estudiante', nombres: 'Niuska', apellidos: 'Calderón', alias: ['niuska calderon'] },
    { rol: 'Estudiante', nombres: 'Edidson', apellidos: 'Lozano', alias: ['edidson lozano'] },
    { rol: 'Estudiante', nombres: 'Bautista', apellidos: 'García', alias: ['bautista garcia'] },
    { rol: 'Estudiante', nombres: 'Bautista', apellidos: 'Rosas', alias: ['bautista rosas'] },
    { rol: 'Estudiante', nombres: 'Ana', apellidos: 'Moreno', alias: ['ana moreno'] },
    { rol: 'Estudiante', nombres: 'Nazaret', apellidos: 'Moorley', alias: ['nazaret moorley', 'nazareth moorley', 'nazaret'] },
    { rol: 'Estudiante', nombres: 'Ana', apellidos: 'León', alias: ['ana leon'] },
].map((p, i) => {
    const local = norm(`${p.nombres} ${p.apellidos}`).replace(/\s+/g, '.');
    return {
        ...p,
        cedula: `V-${90000000 + i + 1}`,
        correo: `${local}.demo@${p.rol === 'Profesor' ? 'ucab.edu.ve' : 'est.ucab.edu.ve'}`,
        usuario: `${local}.demo`,
    };
});

const PERSONA_POR_ALIAS = new Map();
for (const p of EQUIPO) for (const a of p.alias) PERSONA_POR_ALIAS.set(a, p);

/** Lee la celda "Alumno responsable" y devuelve las personas que nombra. */
function equipoDeCaso(texto) {
    const encontradas = new Set();
    const sinReconocer = [];
    const trozos = String(texto ?? '')
        .split(/[\/;,]|\s+y\s+/i)
        .map((t) => norm(t.replace(/profesor(a)?\s*(colaborador(a)?)?\s*:?/ig, '')
                          .replace(/\bprof\.?/ig, '')
                          .replace(/redacci[oó]n\s*:|redacta\s*:/ig, ''))
                    // "prof. Minelvis" deja un punto suelto al quitar el prefijo
                    .replace(/^[^a-záéíóúñ]+|[^a-záéíóúñ]+$/g, ''))
        .filter(Boolean);
    for (const t of trozos) {
        const p = PERSONA_POR_ALIAS.get(t);
        if (p) encontradas.add(p);
        else sinReconocer.push(t);
    }
    return {
        profesores: [...encontradas].filter((p) => p.rol === 'Profesor'),
        estudiantes: [...encontradas].filter((p) => p.rol === 'Estudiante'),
        sinReconocer,
    };
}

/**
 * Solicitantes que el control de casos nombra pero que no están en el
 * formulario socioeconómico.
 *
 * Las 61 respuestas del formulario son todas de UCAB Guayana: Casa Barandiarán
 * atiende en jornadas de comunidad y de sus 9 consultas no quedó ni una ficha.
 * Sin solicitante no hay caso, así que esos 9 casos —con su tipo, su reseña,
 * sus revisiones y su equipo— se perdían enteros por no tener a quién colgarlos.
 *
 * Para cada uno se arma un solicitante con lo que el libro SÍ trae —el nombre y
 * el teléfono, que son reales— y un relleno declarado para lo que el esquema
 * exige y el libro no dice:
 *
 *   cédula             bloque V-8000000x, aparte del V-9000000x del equipo, para
 *                      que se vea de lejos que no es una cédula de verdad
 *   correo             derivado de esa cédula, con dominio .invalid
 *   fecha nacimiento   RELLENO_NACIMIENTO, la misma para los nueve: que todos
 *                      hayan "nacido" el mismo día es la señal de que el dato no
 *                      existe. Se usa una fecha verosímil y no un 1900-01-01
 *                      porque la app calcula la edad y la reporta por rangos.
 *   domicilio          el del núcleo que los atendió, leído del catálogo. No es
 *                      dónde viven —eso el libro no lo dice— sino dónde se los
 *                      atendió; por eso direccion_habitacion queda vacía.
 *   nivel educativo    la opción "No suministrado"
 *   trabajo/actividad  NULL: no se sabe, y 0 ("no aplica") ya sería afirmar algo
 *
 * `sexo` sale del nombre de pila, y `estado_civil` de la propia reseña cuando la
 * dice ("quiere divorciarse" -> Casado; "ella se divorció" -> Divorciado); donde
 * no la dice queda 'Soltero'. Los dos van escritos uno por uno aquí, no
 * deducidos por código, para que se puedan revisar de un vistazo. Los nombres
 * también: partirNombre() acierta en la mayoría pero no en "Wilfredo Acosta
 * Garcia" ni en "Juan Sergio Alejandro Marin Guevara", y son nueve filas.
 */
const RELLENO_NACIMIENTO = '1990-01-01';
const SIN_FORMULARIO = [
    { nucleo: 'Casa Barandiarán', libro: 'Marlierys Del Valle Sulbaran Salavarria',
      nombres: 'Marlierys del Valle', apellidos: 'Sulbaran Salavarria', sexo: 'F', estado_civil: 'Casado' },
    { nucleo: 'Casa Barandiarán', libro: 'Wilfredo Acosta Garcia',
      nombres: 'Wilfredo', apellidos: 'Acosta Garcia', sexo: 'M', estado_civil: 'Soltero' },
    { nucleo: 'Casa Barandiarán', libro: 'Juan Sergio Alejandro Marin Guevara',
      nombres: 'Juan Sergio Alejandro', apellidos: 'Marin Guevara', sexo: 'M', estado_civil: 'Casado' },
    { nucleo: 'Casa Barandiarán', libro: 'Anibal Jose Acosta',
      nombres: 'Anibal Jose', apellidos: 'Acosta', sexo: 'M', estado_civil: 'Soltero' },
    { nucleo: 'Casa Barandiarán', libro: 'Maria Hidalgo',
      nombres: 'Maria', apellidos: 'Hidalgo', sexo: 'F', estado_civil: 'Divorciado' },
    // El libro escribe "Rosalia Cristina Gomez ( representada por Yenny
    // Fuenmayor)": el paréntesis no es parte del nombre, va a las observaciones
    // del caso, que es donde se entiende.
    { nucleo: 'Casa Barandiarán', libro: 'Rosalia Cristina Gomez ( representada por Yenny Fuenmayor)',
      nombres: 'Rosalia Cristina', apellidos: 'Gomez', sexo: 'F', estado_civil: 'Soltero',
      nota: 'Representada por Yenny Fuenmayor, según el control de casos.' },
    { nucleo: 'Casa Barandiarán', libro: 'Wendy del Valle Gularte Salaverria',
      nombres: 'Wendy del Valle', apellidos: 'Gularte Salaverria', sexo: 'F', estado_civil: 'Soltero' },
    { nucleo: 'Casa Barandiarán', libro: 'Elizabeth Acosta',
      nombres: 'Elizabeth', apellidos: 'Acosta', sexo: 'F', estado_civil: 'Soltero' },
    { nucleo: 'Casa Barandiarán', libro: 'Carmen Yraida Forero',
      nombres: 'Carmen Yraida', apellidos: 'Forero', sexo: 'F', estado_civil: 'Soltero' },
    // Y cuatro de UCAB Guayana. Aquí sí hubo formulario, pero estas personas no
    // lo llenaron: no hay en las 61 respuestas ninguna que se les parezca ni de
    // lejos (se buscó por nombre y por errata).
    { nucleo: 'UCAB Guayana', libro: 'Eugenio Salcedo',
      nombres: 'Eugenio', apellidos: 'Salcedo', sexo: 'M', estado_civil: 'Soltero' },
    { nucleo: 'UCAB Guayana', libro: 'Eloisa Moreno',
      nombres: 'Eloisa', apellidos: 'Moreno', sexo: 'F', estado_civil: 'Soltero' },
    // El caso es una partición de comunidad conyugal, que supone un matrimonio.
    { nucleo: 'UCAB Guayana', libro: 'Maria José de León',
      nombres: 'Maria José', apellidos: 'de León', sexo: 'F', estado_civil: 'Casado' },
    { nucleo: 'UCAB Guayana', libro: 'Eglis Gonzalez',
      nombres: 'Eglis', apellidos: 'Gonzalez', sexo: 'F', estado_civil: 'Soltero',
      dudaSexo: true },
].map((r, i) => ({ ...r, cedula: `V-${80000000 + i + 1}` }));

/** Estatus del libro -> los cuatro que admite cambio_estatus. */
function estatusDeCaso(texto) {
    const t = norm(texto);
    if (/cerrad/.test(t)) return { estatus: 'Entregado', motivo: 'Cerrado según el control de casos 2024-2025' };
    if (/pausa/.test(t)) return { estatus: 'En proceso', motivo: 'En pausa según el control de casos 2024-2025' };
    if (/en proceso/.test(t)) return { estatus: 'En proceso', motivo: 'En proceso según el control de casos 2024-2025' };
    return null;
}

// ---------------------------------------------------------------------------
// Lectura de los libros
// ---------------------------------------------------------------------------
const celda = (c) => {
    const v = c?.value;
    if (v === null || v === undefined) return null;
    if (v instanceof Date) return v.toISOString().slice(0, 10);
    if (typeof v === 'object') {
        if (v.richText) return v.richText.map((t) => t.text).join('');
        if (v.text) return v.text;
        if (v.result !== undefined) return v.result;
        if (v.hyperlink) return v.hyperlink;
        return JSON.stringify(v);
    }
    return v;
};

async function leerHoja(ruta, hoja, filaCabecera, primeraFila) {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(ruta);
    const ws = wb.getWorksheet(hoja);
    const cab = ws.getRow(filaCabecera);
    const cols = [];
    for (let i = 1; i <= ws.columnCount; i++)
        cols.push(String(celda(cab.getCell(i)) ?? `col${i}`).replace(/\s+/g, ' ').trim());
    const filas = [];
    for (let n = primeraFila; n <= ws.rowCount; n++) {
        const row = ws.getRow(n);
        const o = { _fila: n };
        let vacio = true;
        for (let i = 1; i <= ws.columnCount; i++) {
            const v = celda(row.getCell(i));
            if (v !== null && String(v).trim() !== '') vacio = false;
            o[i] = v; // por índice: los encabezados del formulario traen numeración y espacios
        }
        if (!vacio) filas.push(o);
    }
    return { cols, filas };
}

// ---------------------------------------------------------------------------
// Resolución de la parroquia a partir del texto libre de residencia
// ---------------------------------------------------------------------------
/**
 * El formulario pide "Estado, municipio y parroquia" pero la gente escribe de
 * todo ("Caimito manzana 34 casa 18"). Se busca el nombre de parroquia más
 * largo que aparezca en el texto; si no aparece ninguno la fila queda fuera,
 * porque id_estado/num_municipio/num_parroquia son NOT NULL y el domicilio no
 * es algo que se pueda suponer.
 */
function construirBuscadorParroquias(parroquias) {
    // Se prueba el nombre tal cual y sin conectores, porque el libro escribe
    // "5 julio" donde el catálogo dice "5 de Julio".
    const sinConectores = (s) => s.replace(/\b(de|del|la|las|los|el)\b/g, ' ').replace(/\s+/g, ' ').trim();
    const variantes = (nombre) => {
        const n = norm(nombre);
        return [...new Set([n, sinConectores(n)])].filter((v) => v.length >= 4);
    };
    const preparar = (filas, campo) => filas
        .map((f) => ({ ...f, v: variantes(f[campo]), largo: norm(f[campo]).length }))
        .filter((f) => f.v.length)
        .sort((a, b) => b.largo - a.largo);

    const porParroquia = preparar(parroquias, 'nombre_parroquia');
    const unicos = (filas, clave, campo) => {
        const m = new Map();
        for (const f of filas) if (!m.has(clave(f))) m.set(clave(f), f);
        return preparar([...m.values()], campo);
    };
    const porEstado = unicos(parroquias, (f) => f.id_estado, 'nombre_estado');
    const porMunicipio = unicos(parroquias, (f) => `${f.id_estado}/${f.num_municipio}`, 'nombre_municipio');

    /**
     * Ámbito por defecto cuando la dirección no nombra estado ni municipio.
     * Las 61 respuestas son de la clínica de Ciudad Guayana y todas las que sí
     * nombran municipio dicen Caroní, así que es el ámbito correcto para este
     * libro. No se toma del núcleo porque "UCAB Guayana" está registrado en el
     * catálogo con una ubicación equivocada (Distrito Capital / Libertador).
     * Aun con el ámbito puesto hace falta que el texto nombre una parroquia
     * real: si solo dice un sector ("Caimito manzana 34"), la fila se descarta.
     */
    const PREDETERMINADO = { estado: 'bolivar', municipio: 'caroni' };

    /** El libro escribe algunas parroquias distinto del catálogo. */
    const ALIAS = {
        'once de abril': ['11 de abril', '11 abril'],
        'vista al sol': ['vista el sol', 'vista sol'],
        'simon bolivar': ['simon bolivar'],
    };

    /**
     * Sectores y urbanizaciones que la gente escribe en lugar de la parroquia.
     *
     * Cada uno sale del PROPIO libro, no de conocimiento geográfico de fuera:
     * son sectores que otras respuestas nombran junto a su parroquia, y solo se
     * aceptan si todas las filas que los mencionan coinciden en cuál es.
     *
     *   core 8          -> filas 10 ("Core 8, unare, municipio Caroní") y 33
     *                     ("Core 8 plaza mercado, parroquia Unare"): Unare las dos
     *   villa africana  -> filas 20 y 45 ("Villa Africana, Parroquia universidad")
     *   villa latina    -> fila 42 ("Bolivar, Villa Latina, parroquia universidad")
     *
     * "la unidad" queda fuera a propósito: la fila 12 la pone en Dalla Costa y la
     * 62 en Simón Bolívar. El libro se contradice, así que no se elige por él.
     */
    const SECTOR = {
        'core 8': 'unare',
        'villa africana': 'universidad',
        'villa latina': 'universidad',
    };

    /**
     * Se resuelve en cascada estado -> municipio -> parroquia, no por el nombre
     * de parroquia suelto. Buscarla en todo el país hacía que "Bolívar, Caroní,
     * Unare" cayera en la parroquia Bolívar del estado Aragua, y que
     * "…, SANTA ROSA" (un sector de Unare) fuera a una Santa Rosa de
     * Anzoátegui: el nombre del estado y los de sector son ambigüedades que
     * solo desaparecen acotando el ámbito.
     */
    return (texto) => {
        const base = norm(texto).replace(/[,.;]/g, ' ').replace(/\s+/g, ' ');
        const t = ` ${base} `, tSin = ` ${sinConectores(base)} `;
        const contiene = (v) => t.includes(` ${v} `) || tSin.includes(` ${v} `);
        const aparece = (f) => f.v.some(contiene);
        const apareceParroquia = (p) =>
            aparece(p) || (ALIAS[norm(p.nombre_parroquia)] ?? []).some(contiene);

        // El sector solo vale si su parroquia cae dentro del ámbito ya acotado:
        // así "villa africana" no puede traer una parroquia de otro municipio.
        const porSector = (ambito) => {
            const nombre = Object.entries(SECTOR).find(([sector]) => contiene(sector))?.[1];
            return nombre ? ambito.find((p) => norm(p.nombre_parroquia) === nombre) ?? null : null;
        };

        const ambitoDe = (estado, municipio) => (municipio
            ? porParroquia.filter((p) => p.id_estado === municipio.id_estado && p.num_municipio === municipio.num_municipio)
            : porParroquia.filter((p) => p.id_estado === estado.id_estado));

        const resolver = (estado, municipio) => {
            const ambito = ambitoDe(estado, municipio);
            return ambito.find(apareceParroquia) ?? porSector(ambito) ?? null;
        };
        const ambitoPredeterminado = () => {
            const e = porEstado.find((x) => norm(x.nombre_estado) === PREDETERMINADO.estado);
            const m = porMunicipio.find((x) => x.id_estado === e.id_estado
                && norm(x.nombre_municipio) === PREDETERMINADO.municipio);
            return m;
        };
        const predeterminado = () => {
            const m = ambitoPredeterminado();
            return resolver(null, m);
        };

        /**
         * Último recurso: se sabe el municipio pero no la parroquia. Devuelve el
         * municipio con `num_parroquia` en null, y quien llama usa la parroquia
         * "No suministrada" (ver PARROQUIA_NO_SUMINISTRADA).
         *
         * Siempre cae en el ámbito PREDETERMINADO salvo que el texto nombre
         * municipio de forma explícita. No se usa un estado detectado sin
         * municipio a propósito: hay sectores que se llaman como un estado
         * ("José Tadeo Monagas", "Sueño de bolívar"), y ahí el estado detectado
         * es una coincidencia de nombre, no un dato.
         */
        const sinParroquia = (municipio) => {
            const m = municipio ?? ambitoPredeterminado();
            return { id_estado: Number(m.id_estado), num_municipio: Number(m.num_municipio),
                     num_parroquia: null, nombre_municipio: m.nombre_municipio, nombre_estado: m.nombre_estado,
                     // Si el texto no nombró el municipio, el ámbito es supuesto,
                     // no leído: el informe tiene que decirlo de otra manera.
                     ambitoSupuesto: !municipio };
        };

        const estado = porEstado.find(aparece);
        if (!estado) return predeterminado() ?? sinParroquia(null);

        const municipio = porMunicipio
            .filter((m) => m.id_estado === estado.id_estado)
            .find(aparece) ?? null;

        // Si en el ámbito detectado no aparece ninguna parroquia, se reintenta
        // en el predeterminado: pasa cuando una calle o un sector se llama como
        // un estado ("José Tadeo Monagas, dalla costa" detectaba Monagas).
        return resolver(estado, municipio) ?? predeterminado() ?? sinParroquia(municipio);
    };
}

// ---------------------------------------------------------------------------
// Catálogos desde la base (solo lectura)
// ---------------------------------------------------------------------------
async function consultar(sqlTexto) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL no está configurada');
    const { Pool } = await import('pg');
    const pool = new Pool({ connectionString: url, connectionTimeoutMillis: 8000 });
    try {
        const cli = await pool.connect();
        try {
            return (await cli.query(sqlTexto)).rows;
        } finally {
            cli.release();
            await pool.end();
        }
    } catch {
        await pool.end().catch(() => {});
        // Respaldo por HTTPS: en algunas redes el 5432 está cerrado.
        const host = new URL(url.replace(/^postgres(ql)?:/, 'https:')).hostname;
        const r = await fetch(`https://${host}/sql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Neon-Connection-String': url,
                'Neon-Array-Mode': 'false',
            },
            body: JSON.stringify({ query: sqlTexto, params: [] }),
        });
        if (!r.ok) throw new Error(`Neon HTTP ${r.status}: ${await r.text()}`);
        return (await r.json()).rows;
    }
}

// ---------------------------------------------------------------------------
// Programa principal
// ---------------------------------------------------------------------------
const [rutaBenef, rutaCasos] = process.argv.slice(2);
if (!rutaBenef || !rutaCasos) {
    console.error('Uso: node scripts/etl-carga-inicial.mjs <beneficiarios.xlsx> <control-casos.xlsx>');
    process.exit(1);
}

const omitidos = { solicitantes: [], viviendas: [], familias: [], casos: [], equipos: [],
    parroquias: [], erratas: [], cedulas: [], telefonos: [] };
let sinCedula = 0;
const anota = (lista, ref, motivo) => omitidos[lista].push({ ref, motivo });

const parroquias = await consultar(
    `SELECT p.id_estado, p.num_municipio, p.num_parroquia, p.nombre_parroquia,
            m.nombre_municipio, e.nombre_estado
     FROM parroquias p
     JOIN municipios m ON m.id_estado = p.id_estado AND m.num_municipio = p.num_municipio
     JOIN estados e ON e.id_estado = p.id_estado`
);
// La ubicación del núcleo se usa como domicilio de los solicitantes que no
// llenaron el formulario (ver SIN_FORMULARIO).
const nucleos = await consultar(
    'SELECT id_nucleo, nombre_nucleo, id_estado, num_municipio, num_parroquia FROM nucleos'
);
const buscarParroquia = construirBuscadorParroquias(parroquias);
const nucleoDe = (nombre) => {
    const t = norm(nombre);
    return nucleos.find((x) => norm(x.nombre_nucleo) === t)
        || nucleos.find((x) => norm(x.nombre_nucleo).startsWith(t.split(' ')[0]))
        || null;
};
const idDeNucleo = (nombre) => {
    const hit = nucleoDe(nombre);
    return hit ? Number(hit.id_nucleo) : null;
};

// ----- 1. Solicitantes -----------------------------------------------------
const benef = await leerHoja(rutaBenef, 'Respuestas de formulario 1', 1, 2);
const porCedula = new Map();

for (const f of benef.filas) {
    const nombreCompleto = String(f[5] ?? '').trim();
    const ref = `fila ${f._fila} (${nombreCompleto || 'sin nombre'})`;

    // Dos personas contestaron "No aplica" en la cédula. El resto de su ficha
    // está completa, así que se les da una del bloque marcado V-7000000x en vez
    // de perder su caso. Va aquí y no como columna vacía porque la cédula es la
    // clave primaria de solicitantes.
    const digitos = String(f[4] ?? '').replace(/\D/g, '');
    const cedulaInventada = !digitos;
    if (cedulaInventada) {
        anota('cedulas', ref, `el formulario dice "${String(f[4] ?? '').trim()}" en la cédula`);
    } else if (/[a-z]/i.test(String(f[4] ?? ''))) {
        // Un pasaporte ("P868205"). La cédula se arma con prefijo de
        // nacionalidad y solo dígitos, así que la letra del documento se pierde.
        anota('cedulas', ref, `el formulario trae "${String(f[4] ?? '').trim()}", que parece un pasaporte; quedó como solo dígitos y hay que revisar el documento`);
    }

    const nombre = partirNombre(nombreCompleto);
    if (!nombre) { anota('solicitantes', ref, 'sin nombre'); continue; }

    const nacimiento = aFecha(f[11]);
    if (!nacimiento) { anota('solicitantes', ref, `fecha de nacimiento ilegible ("${String(f[11] ?? '').slice(0, 30)}")`); continue; }

    const parroquia = buscarParroquia(f[9]);
    if (parroquia.num_parroquia === null) {
        const texto = String(f[9] ?? '').trim();
        anota('parroquias', ref, parroquia.ambitoSupuesto
            ? `escribió "${texto}", que no nombra municipio ni parroquia; se le puso el ámbito de la clínica (${parroquia.nombre_municipio}, ${parroquia.nombre_estado}) y la dirección queda tal cual en su ficha`
            : `escribió "${texto}", que nombra ${parroquia.nombre_municipio} pero ninguna de sus parroquias`);
    }

    const nivelTexto = norm(f[15]);
    const nivel = NIVEL_EDUCATIVO[nivelTexto] ?? (esSinRespuesta(nivelTexto) ? NIVEL_NO_SUMINISTRADO : null);
    if (!nivel) { anota('solicitantes', ref, `nivel educativo no reconocido ("${String(f[15] ?? '').slice(0, 40)}")`); continue; }

    // Y dos no dejaron teléfono. La columna es NOT NULL, y un número inventado
    // sería peor que ninguno: alguien podría llamarlo. Se escribe el texto, que
    // no se puede marcar por teléfono y se lee igual de claro en la ficha.
    let celular = aCelular(f[7]);
    if (!celular) {
        anota('telefonos', ref, `el formulario dice "${String(f[7] ?? '').trim()}" en el celular`);
        celular = SIN_TELEFONO;
    }

    const ec = norm(f[13]);
    const estadoCivil = ec.startsWith('casad') ? 'Casado' : ec.startsWith('solter') ? 'Soltero'
        : ec.startsWith('divorciad') ? 'Divorciado' : ec.startsWith('viud') ? 'Viudo' : null;
    if (!estadoCivil) { anota('solicitantes', ref, `estado civil desconocido ("${String(f[13] ?? '').slice(0, 30)}")`); continue; }

    const esExtranjero = norm(f[12]).startsWith('extranj');
    const correoBruto = String(f[8] ?? '').trim();
    const fila = {
        _fila: f._fila, _raw: f, _nombreCompleto: nombreCompleto, _marca: String(f[1] ?? ''),
        cedula: cedulaInventada
            ? `V-${70000000 + (++sinCedula)}`
            : `${esExtranjero ? 'E' : 'V'}-${digitos}`,
        _cedulaInventada: cedulaInventada,
        nombres: nombre.nombres,
        apellidos: nombre.apellidos,
        fecha_nacimiento: nacimiento,
        telefono_celular: celular,
        correo_electronico: /@/.test(correoBruto) ? correoBruto.toLowerCase() : null,
        sexo: norm(f[10]).startsWith('fem') ? 'F' : 'M',
        nacionalidad: esExtranjero ? 'E' : 'V',
        estado_civil: estadoCivil,
        concubinato: norm(f[14]) === 'si',
        id_nivel_educativo: nivel,
        id_trabajo: norm(f[17]) === 'no' ? 0 : (CONDICION_TRABAJO[norm(f[18])] ?? 0),
        id_actividad: norm(f[19]) === 'si' ? 0 : (CONDICION_ACTIVIDAD[norm(f[20])] ?? null),
        id_estado: Number(parroquia.id_estado),
        num_municipio: Number(parroquia.num_municipio),
        num_parroquia: parroquia.num_parroquia === null ? null : Number(parroquia.num_parroquia),
        direccion_habitacion: String(f[9] ?? '').trim() || null,
    };

    // Cédula repetida. Hay dos cosas distintas detrás y no se pueden tratar
    // igual: la misma persona que contestó el formulario dos veces (Eily Flores
    // en las filas 3 y 32, Georgina Bejarano en la 14 y la 42) y dos personas
    // diferentes a las que les tocó la misma cédula por un error al copiarla
    // (Luz Márquez en la fila 21 y Martha Jansen en la 22, ambas 23.552.118).
    //
    // Se distinguen por el nombre: si comparten alguna palabra distintiva es la
    // misma persona y se conserva la respuesta más reciente. Si no comparten
    // ninguna, la cédula es lo que está mal, no la persona, así que las dos
    // entran y la segunda recibe una del bloque V-7000000x. Antes se descartaba
    // a una de las dos, y con ella sus casos.
    const previo = porCedula.get(fila.cedula);
    if (previo) {
        const a = distintivas(fila._nombreCompleto), b = distintivas(previo._nombreCompleto);
        const mismaPersona = [...a].some((x) => [...b].some((y) => casiIgual(x, y)));
        if (mismaPersona) {
            const gana = fila._marca > previo._marca ? fila : previo;
            const pierde = gana === fila ? previo : fila;
            anota('solicitantes', `fila ${pierde._fila} (${pierde._nombreCompleto})`,
                `cédula ${fila.cedula} repetida por la misma persona; se conservó la respuesta de la fila ${gana._fila}`);
            porCedula.set(fila.cedula, gana);
        } else {
            anota('cedulas', `fila ${fila._fila} (${fila._nombreCompleto})`,
                `el formulario le pone la cédula ${fila.cedula}, que ya es la de ${previo._nombreCompleto} (fila ${previo._fila})`);
            fila.cedula = `V-${70000000 + (++sinCedula)}`;
            fila._cedulaInventada = true;
            porCedula.set(fila.cedula, fila);
        }
    } else porCedula.set(fila.cedula, fila);
}

// correo_electronico es NOT NULL y UNIQUE. Quien no lo dio recibe uno derivado
// de su cédula y con dominio .invalid, que por norma no existe: así nadie lo
// confunde con un correo real ni se le escribe por error.
for (const s of porCedula.values()) {
    if (!s.correo_electronico) s.correo_electronico = `${s.cedula.toLowerCase()}@sin-correo.invalid`;
}
const solicitantes = [...porCedula.values()];

// ----- 2. Vivienda, hogar y características --------------------------------
const viviendas = [], familias = [], asignadas = [];
for (const s of solicitantes) {
    const f = s._raw, ref = `${s.cedula} (${s._nombreCompleto})`;

    const hab = aNumero(f[23]), banos = aNumero(f[24]);
    if (hab !== null && banos !== null && hab >= 0 && banos >= 0)
        viviendas.push({ cedula: s.cedula, cant_habitaciones: hab, cant_banos: banos });
    else anota('viviendas', ref, `habitaciones/baños no numéricos ("${String(f[23] ?? '').slice(0, 25)}" / "${String(f[24] ?? '').slice(0, 25)}")`);

    const p = aNumero(f[32]), tr = aNumero(f[36]), ntr = aNumero(f[37]);
    const ni = aNumero(f[38]), ne = aNumero(f[39]), ing = aNumero(f[40]);
    const faltan = [];
    if (p === null || p < 1) faltan.push('personas en el hogar');
    if (tr === null) faltan.push('cuántos trabajan');
    if (ntr === null) faltan.push('cuántos no trabajan');
    if (ni === null) faltan.push('niños de 7 a 12');
    if (ne === null) faltan.push('cuántos estudian');
    if (ing === null) faltan.push(`ingresos ("${String(f[40] ?? '').slice(0, 25)}")`);

    if (faltan.length) anota('familias', ref, `sin dato numérico en: ${faltan.join(', ')}`);
    else if (!(ni < p)) anota('familias', ref, `el libro dice ${ni} niños en un hogar de ${p} personas`);
    else if (tr > p) anota('familias', ref, `el libro dice ${tr} trabajadores en un hogar de ${p} personas`);
    else if (ne > ni) anota('familias', ref, `el libro dice ${ne} estudiando de ${ni} niños`);
    else familias.push({
        cedula: s.cedula, cant_personas: p, cant_trabajadores: tr, cant_no_trabajadores: ntr,
        cant_ninos: ni, cant_ninos_estudiando: ne, jefe_hogar: norm(f[33]) === 'si',
        ingresos_mensuales: ing,
        id_nivel_educativo_jefe: NIVEL_EDUCATIVO[norm(f[34])]
            ?? (esSinRespuesta(norm(f[34])) ? NIVEL_NO_SUMINISTRADO : null),
    });

    // Las características describen la VIVIENDA: asignadas_a apunta por clave
    // foránea a viviendas, no a solicitantes. Sin fila de vivienda no hay
    // dónde colgarlas.
    if (!viviendas.some((v) => v.cedula === s.cedula)) continue;

    // Características de respuesta única (columna -> tipo de característica)
    for (const [tipo, valor] of Object.entries({ 1: f[21], 2: f[25], 3: f[26], 4: f[27], 5: f[28], 6: f[30], 7: f[29] })) {
        const num = CARACTERISTICAS[tipo][norm(valor)];
        if (num) asignadas.push({ cedula: s.cedula, id_tipo: Number(tipo), num });
    }
    // Artefactos: respuesta múltiple separada por comas
    for (const art of String(f[31] ?? '').split(',').map(norm).filter(Boolean)) {
        const num = CARACTERISTICAS[8][art];
        if (num) asignadas.push({ cedula: s.cedula, id_tipo: 8, num });
    }
}

// ----- 3. Casos ------------------------------------------------------------
const indiceNombres = solicitantes.map((s) => ({ s, t: distintivas(s._nombreCompleto) }));

function buscarSolicitante(nombre) {
    const t = distintivas(nombre);
    // Se puntúa por (cuántas palabras coinciden, cuántas coinciden exactas). La
    // segunda cifra decide los empates: entre alguien que coincide por escritura
    // idéntica y alguien que coincide por errata, gana el primero.
    let mejor = [0, 0], quien = null, empate = false, comunesMejor = [], inexactasMejor = [];
    for (const e of indiceNombres) {
        const comunes = [...t].filter((x) => [...e.t].some((y) => casiIgual(x, y)));
        const exactas = comunes.filter((x) => e.t.has(x));
        const puntos = [comunes.length, exactas.length];
        const cmp = puntos[0] - mejor[0] || puntos[1] - mejor[1];
        if (cmp > 0) {
            mejor = puntos; quien = e.s; comunesMejor = comunes; empate = false;
            inexactasMejor = comunes.filter((x) => !e.t.has(x));
        } else if (cmp === 0 && mejor[0] > 0 && e.s !== quien) empate = true;
    }
    if (mejor[0] < 2 || empate) return null;
    if (!comunesMejor.some((x) => !NOMBRES_COMUNES.has(x))) return null;
    // Las coincidencias por errata se marcan para que el informe las señale:
    // son las atribuciones que más conviene revisar a ojo.
    return { solicitante: quien, erratas: inexactasMejor };
}

/**
 * Solicitante para quien el libro nombra pero el formulario no registra (ver
 * SIN_FORMULARIO). Se crea una sola vez, la primera vez que hace falta, y se
 * suma a `solicitantes` para que salga en el INSERT y en el informe.
 *
 * Devuelve null si el nombre no está en la lista: entonces el caso queda fuera
 * como antes. No se generaliza a cualquier nombre desconocido a propósito —
 * inventarle una identidad a alguien tiene que ser una decisión tomada nombre
 * por nombre, no el comportamiento por omisión del ETL.
 */
const sinFormularioPorNombre = new Map(
    SIN_FORMULARIO.map((r) => [`${norm(r.nucleo)}|${norm(r.libro)}`, r])
);

function solicitanteSinFormulario(nucleo, nombreLibro, telefono) {
    const r = sinFormularioPorNombre.get(`${norm(nucleo)}|${norm(nombreLibro)}`);
    if (!r) return null;
    if (r._solicitante) return r._solicitante;

    const celular = aCelular(telefono);
    if (!celular) throw new Error(`${r.libro}: el libro tampoco trae teléfono, hay que revisarlo a mano`);

    // El domicilio se resuelve igual que el de todos los demás, con el texto
    // vacío: cae en el ámbito predeterminado (Bolívar, Caroní) con la parroquia
    // "No suministrada". No se toma la del núcleo aunque se sepa: eso sería
    // dónde se los atendió, no dónde viven, y además "UCAB Guayana" está
    // registrado en el catálogo con una ubicación equivocada.
    const ubicacion = buscarParroquia('');

    const s = {
        _fila: null, _raw: {}, _nombreCompleto: r.libro, _marca: '', _sinFormulario: r,
        cedula: r.cedula,
        nombres: r.nombres,
        apellidos: r.apellidos,
        fecha_nacimiento: RELLENO_NACIMIENTO,
        telefono_celular: celular,
        correo_electronico: `${r.cedula.toLowerCase()}@sin-correo.invalid`,
        sexo: r.sexo,
        nacionalidad: 'V',
        estado_civil: r.estado_civil,
        concubinato: false,
        id_nivel_educativo: NIVEL_NO_SUMINISTRADO,
        id_trabajo: null,
        id_actividad: null,
        id_estado: Number(ubicacion.id_estado),
        num_municipio: Number(ubicacion.num_municipio),
        num_parroquia: ubicacion.num_parroquia === null ? null : Number(ubicacion.num_parroquia),
        direccion_habitacion: null,
    };
    r._solicitante = s;
    solicitantes.push(s);
    return s;
}

/**
 * Nombres del control de casos que son una persona del formulario, pero que el
 * emparejador no puede deducir sin abrir la mano de más.
 *
 * La regla general pide dos palabras distintivas en común y tolera una sola
 * errata por palabra. Estas cuatro se quedan justo afuera, y aflojar la regla
 * para que entren haría que empezaran a colarse emparejamientos falsos. Así que
 * van a mano, con el motivo, y la clave es el número de fila del formulario
 * —no la cédula— porque es lo que el informe cita y no cambia.
 *
 *   Yohannys Gonzalez   = Yohomys josefina Gonzales Machiz (fila 27). Es la
 *                         única persona del formulario cuyo nombre empieza por
 *                         "Yoho"/"Yohan", y el apellido coincide salvo la z/s.
 *   Cristina Nicklas    = Cristina Nickels (fila 35). Mismo nombre de pila y el
 *                         único apellido "Nick..." del formulario.
 *   Daviannis Castillo  = Davianny Alexandra Pino Castillo (fila 54). Único
 *                         "Castillo" del formulario y el nombre de pila coincide
 *                         en las primeras siete letras.
 *   Yurbanys Luzmery    = Yurbarys laya (fila 19). Único "Yurba..." del
 *                         formulario; "Luzmery" será un segundo nombre que la
 *                         respuesta no trae.
 *
 * Martha Jansen NO está aquí aunque también fallaba: su fila sí se encuentra
 * sola, lo que la tumbaba era la cédula repetida con Luz Márquez.
 */
const EQUIVALE_A_FILA = {
    'yohannys gonzalez': 27,
    'cristina nicklas': 35,
    'daviannis castillo': 54,
    'yurbanys luzmery': 19,
};

const casos = [];
for (const cfg of [
    { hoja: 'CONTROL DE CASOS ucab Guayana', cab: 5, ini: 6, nucleo: 'UCAB Guayana' },
    { hoja: 'CONTROL DE CASOS Casa Barandi', cab: 8, ini: 9, nucleo: 'Casa Barandiarán' },
]) {
    const { cols, filas } = await leerHoja(rutaCasos, cfg.hoja, cfg.cab, cfg.ini);
    const idxDe = (etiqueta) => cols.findIndex((c) => norm(c) === norm(etiqueta)) + 1;
    const cNro = idxDe('Nro de Caso'), cNombre = idxDe('Nombre del Solicitante');
    const cTipo = idxDe('Tipo de Caso'), cAlumno = idxDe('Alumno responsable');
    const cFecha = idxDe('Fecha de atención'), cEstatus = idxDe('Estatus');
    const cResena = cols.findIndex((c) => /rese|observ/i.test(c)) + 1;
    // El teléfono solo se usa para los solicitantes que no están en el
    // formulario; el de los demás sale de su propia respuesta. "Grupo asignado"
    // existe únicamente en la hoja de Casa Barandiarán.
    const cTelefono = cols.findIndex((c) => /tel[eé]fono/i.test(c)) + 1;
    const cGrupo = cols.findIndex((c) => /grupo/i.test(c)) + 1;
    const idNucleo = idDeNucleo(cfg.nucleo);

    for (const f of filas) {
        const nro = String(f[cNro] ?? '').trim();
        const nombre = String(f[cNombre] ?? '').trim();
        if (!nombre || /cierre de semestre/i.test(nombre)) continue; // separadores del libro
        const ref = `${cfg.nucleo} · ${nro || `fila ${f._fila}`} · ${nombre}`;

        const fecha = aFecha(f[cFecha]);
        if (!fecha) { anota('casos', ref, `fecha de atención ilegible ("${String(f[cFecha] ?? '').slice(0, 30)}")`); continue; }

        const porFila = EQUIVALE_A_FILA[norm(nombre)];
        const hallado = porFila
            ? { solicitante: solicitantes.find((x) => x._fila === porFila), erratas: [] }
            : buscarSolicitante(nombre);
        if (porFila && !hallado.solicitante)
            throw new Error(`${nombre}: la fila ${porFila} del formulario no se cargó, revisar EQUIVALE_A_FILA`);
        if (hallado?.erratas.length)
            anota('erratas', ref, `se emparejó con **${hallado.solicitante._nombreCompleto}** (${hallado.solicitante.cedula}) aceptando errata en: ${hallado.erratas.join(', ')}`);
        const solicitante = hallado?.solicitante
            ?? solicitanteSinFormulario(cfg.nucleo, nombre, cTelefono ? f[cTelefono] : null);
        if (!solicitante) {
            anota('casos', ref, 'el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar');
            continue;
        }

        const revisiones = [10, 11, 12, 13, 14].map((i) => String(f[i] ?? '').trim()).filter(Boolean);
        const resena = String(f[cResena] ?? '').trim();
        const alumno = String(f[cAlumno] ?? '').trim();
        const contexto = `${resena} ${revisiones.join(' ')}`;
        const [m, cat, sub, amb] = ambitoDeCaso(f[cTipo], contexto);

        // Las revisiones no son observaciones: son lo que se hizo en el caso,
        // cada una con su fecha. Van a `acciones`.
        const acciones = [];
        let ultimaFecha = fecha;
        for (const texto of revisiones) {
            const extraida = fechaEnTexto(texto, ultimaFecha, fecha);
            acciones.push({
                num: acciones.length + 1,
                detalle: texto,
                fecha: extraida ?? ultimaFecha,
                comentario: extraida
                    ? null
                    : 'La revisión no trae fecha en el control de casos; se usó la de la anotación anterior.',
            });
            ultimaFecha = extraida ?? ultimaFecha;
        }

        // En observaciones solo va lo que no cabe en ningún otro campo. El
        // número de expediente del libro lo reemplaza el id del caso, y el
        // tipo ya está en materia/categoría/subcategoría/ámbito legal.
        // La reseña va tal cual: es la observación del caso, no hace falta
        // anunciarla. El responsable sí lleva etiqueta, porque un nombre suelto
        // al final no se entendería.
        const notas = [];
        if (resena) notas.push(resena);
        if (solicitante._sinFormulario?.nota) notas.push(solicitante._sinFormulario.nota);
        if (alumno) notas.push(`Responsable según el control de casos: ${alumno}`);
        // La hoja de Casa Barandiarán trae además la pareja que llevó el caso.
        // Solo se reconoce a quien figure como responsable, así que el grupo se
        // guarda tal cual: nombra a gente de la que el libro no dice más que el
        // nombre de pila, y no da para crearle un usuario.
        const grupo = cGrupo ? String(f[cGrupo] ?? '').trim() : '';
        if (grupo && norm(grupo) !== norm(alumno)) notas.push(`Grupo asignado según el control de casos: ${grupo}`);

        const equipo = equipoDeCaso(alumno);
        if (equipo.sinReconocer.length) {
            anota('equipos', ref, `no se reconoció a: ${equipo.sinReconocer.join(', ')}`);
        }

        casos.push({
            ref, cedula: solicitante.cedula, id_nucleo: idNucleo, equipo,
            fecha_solicitud: fecha, fecha_inicio_caso: fecha,
            tramite: tramiteDeCaso(f[cTipo], contexto),
            observaciones: notas.join('\n') || null,
            id_materia: m, num_categoria: cat, num_subcategoria: sub, num_ambito_legal: amb,
            estatus: estatusDeCaso(f[cEstatus]),
            acciones,
            // El caso se cerró cuando ocurrió lo último que quedó anotado, no
            // el día que se abrió.
            fecha_cierre: acciones.length ? acciones[acciones.length - 1].fecha : fecha,
        });
    }
}

// ---------------------------------------------------------------------------
// Salida
// ---------------------------------------------------------------------------
const destino = join(RAIZ, 'database', 'seeds');
mkdirSync(destino, { recursive: true });

const L = [];
L.push('-- =========================================================');
L.push('-- CARGA INICIAL DE DATOS REALES — período 2024-2025');
L.push('-- =========================================================');
L.push('-- Generado por scripts/etl-carga-inicial.mjs a partir de los libros');
L.push('-- "REGISTRO Y CONTROL BENEFICIARIOS 2024-2025 (Respuestas).xlsx" y');
L.push('-- "Control de casos Clinica juridica 2024 2025.xlsx".');
L.push('--');
L.push('-- NO EDITAR A MANO: se regenera volviendo a correr el ETL.');
L.push('-- Lo que quedó fuera y por qué está en carga-inicial-informe.md.');
L.push('--');
L.push('-- Va todo en una transacción: o entra completo o no entra nada.');
L.push('');
L.push('BEGIN;');
L.push('');
L.push('-- Los triggers de auditoría se silencian para la carga: son datos');
L.push('-- históricos, no actividad de usuarios. Al final queda UN evento que');
L.push('-- deja constancia de la carga.');
L.push("SET LOCAL app.skip_audit_trigger = 'true';");
L.push('');
L.push('-- trigger_crear_cambio_estatus_inicial exige saber quién abre el caso.');
L.push(`SET LOCAL app.current_user_id = ${sql(COORDINADOR)};`);
L.push('');
// Profesores y alumnos del libro. Sin ellos los casos quedan "sin asignar";
// con ellos el sistema muestra el equipo real de cada caso. Los identificadores
// son inventados, ver el comentario de EQUIPO.
L.push('-- ---------------------------------------------------------------------');
L.push('-- Profesores y alumnos que aparecen en el control de casos.');
L.push('-- ATENCIÓN: cédula, correo y contraseña son INVENTADOS; el libro solo da');
L.push('-- el nombre. La contraseña es la misma del Coordinador. Ver el informe.');
L.push('-- ---------------------------------------------------------------------');
L.push('INSERT INTO usuarios (cedula, nombres, apellidos, correo_electronico, nombre_usuario,');
L.push('    contrasena, habilitado_sistema, tipo_usuario, id_usuario_registro) VALUES');
L.push(EQUIPO.map((p) => `    (${[
    sql(p.cedula), sql(p.nombres), sql(p.apellidos), sql(p.correo), sql(p.usuario),
    sql(CLAVE_DEMO), 'TRUE', sql(p.rol), sql(COORDINADOR),
].join(', ')})`).join(',\n') + ';');
L.push('');

// Se inscriben en todos los semestres que tocan los casos, porque
// se_le_asigna/supervisa apuntan por clave foránea a (term, cédula).
L.push('-- Inscripción en los semestres que abarca el libro.');
L.push('INSERT INTO estudiantes (term, cedula_estudiante, tipo_estudiante, nrc, id_usuario_registro)');
L.push(`SELECT s.term, u.cedula, 'Inscrito', 'CJ-2024-2025', ${sql(COORDINADOR)}`);
L.push(`FROM usuarios u CROSS JOIN (SELECT unnest(ARRAY[${TERMS.map(sql).join(', ')}]) AS term) s`);
L.push(`WHERE u.cedula = ANY(ARRAY[${EQUIPO.filter((p) => p.rol === 'Estudiante').map((p) => sql(p.cedula)).join(', ')}]);`);
L.push('');
L.push('INSERT INTO profesores (term, cedula_profesor, tipo_profesor, id_usuario_registro)');
L.push(`SELECT s.term, u.cedula, 'Asesor', ${sql(COORDINADOR)}`);
L.push(`FROM usuarios u CROSS JOIN (SELECT unnest(ARRAY[${TERMS.map(sql).join(', ')}]) AS term) s`);
L.push(`WHERE u.cedula = ANY(ARRAY[${EQUIPO.filter((p) => p.rol === 'Profesor').map((p) => sql(p.cedula)).join(', ')}]);`);
L.push('');

// Parroquia "No suministrada" en los municipios donde hizo falta. Va con
// max(num_parroquia)+1 porque parroquias no tiene secuencia: su clave es
// (estado, municipio, número). El HAVING —y no un WHERE— es lo que hace que no
// se duplique: con WHERE, la fila ya existente filtraría todo y max() sobre cero
// filas devolvería NULL, que COALESCE convertiría en el número 1, ya ocupado.
const municipiosSinParroquia = [...new Map(solicitantes
    .filter((s) => s.num_parroquia === null)
    .map((s) => [`${s.id_estado}/${s.num_municipio}`, s])).values()];
if (municipiosSinParroquia.length) {
    L.push('-- Parroquia para quien dio su sector pero no su parroquia. Las tres columnas');
    L.push('-- del domicilio son NOT NULL y meterlos en una parroquia real cualquiera');
    L.push('-- sería decir que viven donde no viven. La dirección que escribieron queda');
    L.push('-- completa en direccion_habitacion.');
    for (const m of municipiosSinParroquia) {
        L.push('INSERT INTO parroquias (id_estado, num_municipio, num_parroquia, nombre_parroquia)');
        L.push(`SELECT ${m.id_estado}, ${m.num_municipio}, COALESCE(max(num_parroquia), 0) + 1, ${sql(PARROQUIA_NO_SUMINISTRADA)}`);
        L.push(`FROM parroquias WHERE id_estado = ${m.id_estado} AND num_municipio = ${m.num_municipio}`);
        L.push(`HAVING NOT EXISTS (SELECT 1 FROM parroquias WHERE id_estado = ${m.id_estado}`);
        L.push(`    AND num_municipio = ${m.num_municipio} AND nombre_parroquia = ${sql(PARROQUIA_NO_SUMINISTRADA)});`);
    }
    L.push('');
}

L.push('-- Opción de catálogo para quien no contestó el nivel educativo. El campo es');
L.push('-- NOT NULL y "Sin Nivel" significaría que no estudió, que no es lo mismo.');
L.push(`INSERT INTO niveles_educativos (descripcion)`);
L.push(`SELECT ${sql(NIVEL_NO_SUMINISTRADO)}`);
L.push(`WHERE NOT EXISTS (SELECT 1 FROM niveles_educativos WHERE descripcion = ${sql(NIVEL_NO_SUMINISTRADO)});`);
L.push('');
L.push(`INSERT INTO solicitantes (cedula, nombres, apellidos, fecha_nacimiento, telefono_celular,`);
L.push(`    correo_electronico, sexo, nacionalidad, estado_civil, concubinato, id_nivel_educativo,`);
L.push(`    id_trabajo, id_actividad, id_estado, num_municipio, num_parroquia, direccion_habitacion,
    id_usuario_registro) VALUES`);
L.push(solicitantes.map((s) => `    (${[
    sql(s.cedula), sql(s.nombres), sql(s.apellidos), sql(s.fecha_nacimiento), sql(s.telefono_celular),
    sql(s.correo_electronico), sql(s.sexo), sql(s.nacionalidad), sql(s.estado_civil), sqlBool(s.concubinato),
    sqlNivel(s.id_nivel_educativo), sqlNum(s.id_trabajo), sqlNum(s.id_actividad),
    sqlNum(s.id_estado), sqlNum(s.num_municipio), sqlParroquia(s), sql(s.direccion_habitacion),
    sql(COORDINADOR),
].join(', ')})`).join(',\n') + ';');
L.push('');

if (viviendas.length) {
    L.push('INSERT INTO viviendas (cedula_solicitante, cant_habitaciones, cant_banos) VALUES');
    L.push(viviendas.map((v) => `    (${sql(v.cedula)}, ${sqlNum(v.cant_habitaciones)}, ${sqlNum(v.cant_banos)})`).join(',\n') + ';');
    L.push('');
}
if (familias.length) {
    L.push('INSERT INTO familias_y_hogares (cedula_solicitante, cant_personas, cant_trabajadores,');
    L.push('    cant_no_trabajadores, cant_ninos, cant_ninos_estudiando, jefe_hogar, ingresos_mensuales,');
    L.push('    id_nivel_educativo_jefe) VALUES');
    L.push(familias.map((h) => `    (${[
        sql(h.cedula), sqlNum(h.cant_personas), sqlNum(h.cant_trabajadores), sqlNum(h.cant_no_trabajadores),
        sqlNum(h.cant_ninos), sqlNum(h.cant_ninos_estudiando), sqlBool(h.jefe_hogar),
        sqlNum(h.ingresos_mensuales), sqlNivel(h.id_nivel_educativo_jefe),
    ].join(', ')})`).join(',\n') + ';');
    L.push('');
}
if (asignadas.length) {
    L.push('INSERT INTO asignadas_a (cedula_solicitante, id_tipo_caracteristica, num_caracteristica) VALUES');
    L.push(asignadas.map((a) => `    (${sql(a.cedula)}, ${a.id_tipo}, ${a.num})`).join(',\n'));
    L.push('ON CONFLICT DO NOTHING;');
    L.push('');
}

L.push('-- Los casos se insertan de uno en uno para poder colgarles su estatus:');
L.push('-- el trigger trigger_crear_cambio_estatus_inicial ya crea el primer');
L.push('-- cambio de estatus, así que aquí solo se corrige cuando el libro dice');
L.push('-- que el caso se cerró o quedó en pausa.');
L.push('DO $carga$');
L.push('DECLARE v_id INTEGER; v_term VARCHAR(20);');
L.push('BEGIN');
for (const c of casos) {
    L.push(`    -- ${c.ref.replace(/\n/g, ' ')}`);
    L.push(`    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,`);
    L.push(`        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro,`);
    L.push(`        fecha_fin_caso)`);
    L.push(`    VALUES (${[
        sql(c.fecha_solicitud), sql(c.fecha_inicio_caso), sql(c.tramite), sql(c.observaciones),
        sqlNum(c.id_nucleo), sql(c.cedula), c.id_materia, c.num_categoria, c.num_subcategoria,
        c.num_ambito_legal, sql(COORDINADOR),
        // El libro dice CERRADO: la fecha de cierre es la de lo último anotado.
        c.estatus?.estatus === 'Entregado' ? sql(c.fecha_cierre) : 'NULL',
    ].join(', ')})`);
    L.push('    RETURNING id_caso INTO v_id;');

    // Equipo del caso. El semestre sale de ocurren_en, que lo puso el trigger
    // al insertar el caso, para que coincida con la inscripción.
    if (c.equipo.profesores.length || c.equipo.estudiantes.length) {
        L.push('    SELECT term INTO v_term FROM ocurren_en WHERE id_caso = v_id;');
        for (const p of c.equipo.profesores) {
            L.push(`    INSERT INTO supervisa (term, cedula_profesor, id_caso, id_usuario_registro)`);
            L.push(`    VALUES (v_term, ${sql(p.cedula)}, v_id, ${sql(COORDINADOR)});`);
        }
        for (const p of c.equipo.estudiantes) {
            L.push(`    INSERT INTO se_le_asigna (term, cedula_estudiante, id_caso, id_usuario_registro)`);
            L.push(`    VALUES (v_term, ${sql(p.cedula)}, v_id, ${sql(COORDINADOR)});`);
        }
    }

    // Cada revisión del libro es una acción con su fecha.
    for (const a of c.acciones) {
        L.push(`    INSERT INTO acciones (num_accion, id_caso, detalle_accion, comentario,`);
        L.push(`        fecha_registro, id_usuario_registra, id_usuario_registro)`);
        L.push(`    VALUES (${a.num}, v_id, ${sql(a.detalle)}, ${sql(a.comentario)},`);
        L.push(`            ${sql(a.fecha)}, ${sql(COORDINADOR)}, ${sql(COORDINADOR)});`);
    }

    if (c.estatus) {
        // La fecha del cambio de estatus es la de lo último anotado en el
        // caso, no la de apertura: un caso cerrado no se cerró el día que
        // se abrió.
        L.push(`    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,`);
        L.push(`        id_usuario_cambia, id_usuario_registro)`);
        L.push(`    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,`);
        L.push(`            v_id, ${sql(c.estatus.motivo)}, ${sql(c.estatus.estatus)}, ${sql(c.fecha_cierre)},`);
        L.push(`            ${sql(COORDINADOR)}, ${sql(COORDINADOR)});`);
    }
    L.push('');
}
L.push('END $carga$;');
L.push('');
L.push('-- Constancia de la carga en la propia auditoría.');
L.push("RESET app.skip_audit_trigger;");
L.push('INSERT INTO auditoria_eventos (entidad, operacion, id_usuario, datos_nuevos, metadata)');
L.push(`VALUES ('carga_inicial', 'insercion', ${sql(COORDINADOR)},`);
L.push(`    jsonb_build_object('solicitantes', ${solicitantes.length}, 'viviendas', ${viviendas.length},`);
L.push(`        'familias_y_hogares', ${familias.length}, 'caracteristicas', ${asignadas.length},
        'casos', ${casos.length}, 'acciones', ${casos.reduce((n, c) => n + c.acciones.length, 0)}),`);
L.push(`    jsonb_build_object('origen', 'Libros de la clínica 2024-2025', 'generado_por', 'scripts/etl-carga-inicial.mjs'));`);
L.push('');
L.push('COMMIT;');

writeFileSync(join(destino, 'carga-inicial-2024-2025.sql'), L.join('\n') + '\n', 'utf-8');

// ----- Informe -------------------------------------------------------------
const I = [];
I.push('# Carga inicial 2024-2025 — qué entró y qué no');
I.push('');
I.push('Generado por `scripts/etl-carga-inicial.mjs`.');
I.push('');
I.push('**Los 72 casos del libro están cargados.** Para lograrlo hubo que rellenar datos');
I.push('que el libro no trae, porque las columnas son NOT NULL. Nada de eso se esconde:');
I.push('cada relleno tiene su sección con quién lo recibió y por qué, y se eligió siempre');
I.push('de modo que se note que no es un dato real (bloques de cédula aparte, dominio');
I.push('`.invalid`, parroquia "No suministrada", la misma fecha de nacimiento para todos).');
I.push('');
I.push('Las secciones que conviene leer, en orden de importancia:');
I.push('');
I.push('1. **A quién quedó atribuido cada caso** — un caso colgado de la persona');
I.push('   equivocada es el error más difícil de notar después.');
I.push('2. **Casos emparejados aceptando una errata** — los que más riesgo tienen de eso.');
I.push('3. Los rellenos: parroquia, cédula, teléfono y solicitantes completos.');
I.push('');
I.push('## Resumen');
I.push('');
I.push('| Tabla | Filas | Omitidas |');
I.push('|---|---:|---:|');
I.push(`| solicitantes | ${solicitantes.length} | ${omitidos.solicitantes.length} |`);
I.push(`| viviendas | ${viviendas.length} | ${omitidos.viviendas.length} |`);
I.push(`| familias_y_hogares | ${familias.length} | ${omitidos.familias.length} |`);
I.push(`| asignadas_a (características) | ${asignadas.length} | — |`);
I.push(`| casos | ${casos.length} | ${omitidos.casos.length} |`);
I.push(`| acciones (revisiones del libro) | ${casos.reduce((n, c) => n + c.acciones.length, 0)} | — |`);
I.push('');
for (const [lista, titulo2] of [
    ['casos', 'Casos que no se cargaron'],
    ['solicitantes', 'Respuestas del formulario que no se cargaron'],
    ['viviendas', 'Solicitantes sin datos de vivienda'],
    ['familias', 'Solicitantes sin datos de hogar'],
    ['equipos', 'Responsables que no se pudieron identificar'],
    ['erratas', 'Casos emparejados aceptando una errata en el nombre — REVISAR'],
    ['parroquias', 'Solicitantes sin parroquia: quedaron en "No suministrada"'],
    ['cedulas', 'Cédulas que hubo que tocar'],
    ['telefonos', 'Solicitantes sin teléfono'],
]) {
    if (!omitidos[lista].length) continue;
    I.push(`## ${titulo2} (${omitidos[lista].length})`);
    I.push('');
    for (const o of omitidos[lista]) I.push(`- **${o.ref}** — ${o.motivo}`);
    I.push('');
}
I.push('## A quién quedó atribuido cada caso — conviene revisar');
I.push('');
I.push('La hoja de casos solo trae el nombre del solicitante; la cédula sale de cruzarlo con el');
I.push('formulario. El cruce exige dos palabras distintivas en común y que nadie más empate, pero');
I.push('conviene darle un vistazo a esta tabla: un caso atribuido a quien no es sería un error');
I.push('difícil de notar después.');
I.push('');
I.push('| Expediente | Núcleo | Nombre en la hoja de casos | Se atribuyó a | Cédula |');
I.push('|---|---|---|---|---|');
for (const c of casos) {
    const [nucleo, expediente, nombreLibro] = c.ref.split(' · ');
    const s = solicitantes.find((x) => x.cedula === c.cedula);
    I.push(`| ${expediente} | ${nucleo} | ${nombreLibro} | ${s?._nombreCompleto ?? '?'} | ${c.cedula} |`);
}
I.push('');

const relleno = solicitantes.filter((s) => s._sinFormulario);
if (relleno.length) {
    I.push(`## Solicitantes con datos de relleno (${relleno.length}) — LEER`);
    I.push('');
    I.push('Estas personas aparecen en el control de casos pero no en el formulario');
    I.push('socioeconómico. Las nueve de Casa Barandiarán, porque ese núcleo atiende en');
    I.push('jornadas de comunidad y no se llenó ninguna ficha: las 61 respuestas del');
    I.push('formulario son todas de UCAB Guayana. Las otras cuatro son de Guayana y');
    I.push('simplemente no lo llenaron — se buscó por nombre y por errata y no hay en las 61');
    I.push('respuestas ninguna que se les parezca. Sin solicitante no hay caso, así que se');
    I.push('les armó uno para que sus casos existan.');
    I.push('');
    I.push('**Reales** (salen del libro): nombre, teléfono, y todo lo del caso en sí — tipo,');
    I.push('reseña, revisiones con sus fechas, estatus y responsable.');
    I.push('');
    I.push('**Inventados** (el libro no los trae):');
    I.push('');
    I.push('| Dato | Qué se puso | Por qué así |');
    I.push('|---|---|---|');
    I.push('| Cédula | bloque `V-8000000x` | aparte del `V-9000000x` del equipo; se ve de lejos que no es real |');
    I.push('| Correo | `v-8000000x@sin-correo.invalid` | `.invalid` no existe por norma: nadie le escribe por error |');
    I.push(`| Fecha de nacimiento | ${RELLENO_NACIMIENTO} para todos | que todos "nazcan" el mismo día es la señal de que el dato no existe |`);
    I.push('| Domicilio | parroquia "No suministrada" de Caroní, Bolívar | el ámbito de la clínica; la parroquia queda declarada como desconocida y `direccion_habitacion` vacía |');
    I.push('| Nivel educativo | "No suministrado" | el campo es NOT NULL y "Sin Nivel" diría que no estudió |');
    I.push('| Trabajo y actividad | vacíos | no se sabe, y "no aplica" ya sería afirmar algo |');
    I.push('| Concubinato | No | el campo es NOT NULL y no admite "se desconoce" |');
    I.push('');
    I.push('`sexo` sale del nombre de pila y `estado_civil` de la reseña cuando la dice; donde no,');
    I.push('queda Soltero. Ninguno tiene datos de vivienda, hogar ni características: eso solo');
    I.push('lo pregunta el formulario.');
    const dudosos = relleno.filter((x) => x._sinFormulario.dudaSexo);
    if (dudosos.length) {
        I.push('');
        I.push(`Del sexo de ${dudosos.map((x) => x._nombreCompleto).join(', ')} no hay forma de`);
        I.push('estar seguro por el nombre; la columna solo admite M o F y quedó en F.');
    }
    I.push('');
    I.push('| Cédula | Como está en el libro | Nombres | Apellidos | Sexo | Estado civil | Teléfono |');
    I.push('|---|---|---|---|---|---|---|');
    for (const s of relleno)
        I.push(`| ${s.cedula} | ${s._nombreCompleto} | ${s.nombres} | ${s.apellidos} | ${s.sexo} | ${s.estado_civil} | ${s.telefono_celular} |`);
    I.push('');
}

// Quien llenó el formulario y no tiene ningún caso suele ser la misma persona
// contada dos veces con la cédula mal copiada: si tuviera un caso, el caso está
// colgado del otro registro. Es una señal barata y vale ponerla.
const huerfanos = solicitantes.filter((s) => !casos.some((c) => c.cedula === s.cedula));
if (huerfanos.length) {
    I.push(`## Solicitantes sin ningún caso (${huerfanos.length}) — posible duplicado`);
    I.push('');
    I.push('Llenaron el formulario pero ningún caso del libro quedó a su nombre. Casi siempre');
    I.push('es la misma persona registrada dos veces con la cédula copiada distinto: el caso');
    I.push('está colgado del otro registro. Conviene comparar y unificar desde la app.');
    I.push('');
    for (const h of huerfanos) {
        const parecidos = solicitantes.filter((o) => o !== h
            && [...distintivas(o._nombreCompleto)].some((x) => [...distintivas(h._nombreCompleto)].some((y) => casiIgual(x, y))));
        I.push(`- **${h.cedula} (${h._nombreCompleto})**`
            + (parecidos.length ? ` — se parece a ${parecidos.map((o) => `${o._nombreCompleto} (${o.cedula})`).join('; ')}` : ''));
    }
    I.push('');
}

I.push('## Separación de nombre y apellido — conviene revisar');
I.push('');
I.push('El libro mezcla dos convenciones ("Francimar Josefina Gamboa" y "Poleo Ferrer, Daniel');
I.push('Alejandro") y sin coma de por medio no hay manera de saber cuál se usó en cada fila.');
I.push('Se aplicó el patrón dominante: los nombres primero. Esta tabla sirve para detectar los');
I.push('que quedaron al revés; corregirlos es editar el solicitante desde la app, no hace falta');
I.push('volver a correr el ETL.');
I.push('');
I.push('| Cédula | Como está en el libro | Nombres | Apellidos |');
I.push('|---|---|---|---|');
// Los de relleno no entran: su separación se escribió a mano y ya está arriba.
for (const s of solicitantes.filter((x) => !x._sinFormulario))
    I.push(`| ${s.cedula} | ${s._nombreCompleto} | ${s.nombres} | ${s.apellidos} |`);
I.push('');

writeFileSync(join(destino, 'carga-inicial-informe.md'), I.join('\n') + '\n', 'utf-8');

console.log(`solicitantes  ${String(solicitantes.length).padStart(3)}  (omitidas ${omitidos.solicitantes.length})`);
console.log(`viviendas     ${String(viviendas.length).padStart(3)}  (omitidas ${omitidos.viviendas.length})`);
console.log(`familias      ${String(familias.length).padStart(3)}  (omitidas ${omitidos.familias.length})`);
console.log(`caracteristicas ${String(asignadas.length).padStart(3)}`);
const totalAcciones = casos.reduce((n, c) => n + c.acciones.length, 0);
console.log(`casos         ${String(casos.length).padStart(3)}  (omitidos ${omitidos.casos.length})`);
console.log(`acciones      ${String(totalAcciones).padStart(3)}  (revisiones del libro)`);
console.log(`\ndatabase/seeds/carga-inicial-2024-2025.sql`);
console.log(`database/seeds/carga-inicial-informe.md`);
