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
 * Quién queda como responsable del registro. La carga la hace el Coordinador,
 * así que es su cédula la que va en id_usuario_registro y en app.current_user_id
 * (trigger_crear_cambio_estatus_inicial la exige para poder abrir el caso).
 */
const COORDINADOR = 'V-77777777';
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

        const resolver = (estado, municipio) => {
            const ambito = municipio
                ? porParroquia.filter((p) => p.id_estado === municipio.id_estado && p.num_municipio === municipio.num_municipio)
                : porParroquia.filter((p) => p.id_estado === estado.id_estado);
            return ambito.find(apareceParroquia) ?? null;
        };
        const predeterminado = () => {
            const e = porEstado.find((x) => norm(x.nombre_estado) === PREDETERMINADO.estado);
            const m = porMunicipio.find((x) => x.id_estado === e.id_estado
                && norm(x.nombre_municipio) === PREDETERMINADO.municipio);
            return resolver(e, m);
        };

        const estado = porEstado.find(aparece);
        if (!estado) return predeterminado();

        const municipio = porMunicipio
            .filter((m) => m.id_estado === estado.id_estado)
            .find(aparece) ?? null;

        // Si en el ámbito detectado no aparece ninguna parroquia, se reintenta
        // en el predeterminado: pasa cuando una calle o un sector se llama como
        // un estado ("José Tadeo Monagas, dalla costa" detectaba Monagas).
        return resolver(estado, municipio) ?? predeterminado();
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

const omitidos = { solicitantes: [], viviendas: [], familias: [], casos: [] };
const anota = (lista, ref, motivo) => omitidos[lista].push({ ref, motivo });

const parroquias = await consultar(
    `SELECT p.id_estado, p.num_municipio, p.num_parroquia, p.nombre_parroquia,
            m.nombre_municipio, e.nombre_estado
     FROM parroquias p
     JOIN municipios m ON m.id_estado = p.id_estado AND m.num_municipio = p.num_municipio
     JOIN estados e ON e.id_estado = p.id_estado`
);
const nucleos = await consultar('SELECT id_nucleo, nombre_nucleo FROM nucleos');
const buscarParroquia = construirBuscadorParroquias(parroquias);
const idDeNucleo = (nombre) => {
    const t = norm(nombre);
    const hit = nucleos.find((x) => norm(x.nombre_nucleo) === t)
        || nucleos.find((x) => norm(x.nombre_nucleo).startsWith(t.split(' ')[0]));
    return hit ? Number(hit.id_nucleo) : null;
};

// ----- 1. Solicitantes -----------------------------------------------------
const benef = await leerHoja(rutaBenef, 'Respuestas de formulario 1', 1, 2);
const porCedula = new Map();

for (const f of benef.filas) {
    const nombreCompleto = String(f[5] ?? '').trim();
    const ref = `fila ${f._fila} (${nombreCompleto || 'sin nombre'})`;

    const digitos = String(f[4] ?? '').replace(/\D/g, '');
    if (!digitos) { anota('solicitantes', ref, `sin cédula en el formulario ("${String(f[4] ?? '').slice(0, 20)}")`); continue; }

    const nombre = partirNombre(nombreCompleto);
    if (!nombre) { anota('solicitantes', ref, 'sin nombre'); continue; }

    const nacimiento = aFecha(f[11]);
    if (!nacimiento) { anota('solicitantes', ref, `fecha de nacimiento ilegible ("${String(f[11] ?? '').slice(0, 30)}")`); continue; }

    const parroquia = buscarParroquia(f[9]);
    if (!parroquia) { anota('solicitantes', ref, `no se reconoce la parroquia en "${String(f[9] ?? '').slice(0, 60)}"`); continue; }

    const nivelTexto = norm(f[15]);
    const nivel = NIVEL_EDUCATIVO[nivelTexto] ?? (esSinRespuesta(nivelTexto) ? NIVEL_NO_SUMINISTRADO : null);
    if (!nivel) { anota('solicitantes', ref, `nivel educativo no reconocido ("${String(f[15] ?? '').slice(0, 40)}")`); continue; }

    const celular = String(f[7] ?? '').replace(/\D/g, '');
    if (!celular) { anota('solicitantes', ref, 'sin teléfono celular'); continue; }

    const ec = norm(f[13]);
    const estadoCivil = ec.startsWith('casad') ? 'Casado' : ec.startsWith('solter') ? 'Soltero'
        : ec.startsWith('divorciad') ? 'Divorciado' : ec.startsWith('viud') ? 'Viudo' : null;
    if (!estadoCivil) { anota('solicitantes', ref, `estado civil desconocido ("${String(f[13] ?? '').slice(0, 30)}")`); continue; }

    const esExtranjero = norm(f[12]).startsWith('extranj');
    const correoBruto = String(f[8] ?? '').trim();
    const fila = {
        _fila: f._fila, _raw: f, _nombreCompleto: nombreCompleto, _marca: String(f[1] ?? ''),
        cedula: `${esExtranjero ? 'E' : 'V'}-${digitos}`,
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
        num_parroquia: Number(parroquia.num_parroquia),
        direccion_habitacion: String(f[9] ?? '').trim() || null,
    };

    // Cédula repetida en el formulario: se conserva la respuesta más reciente.
    const previo = porCedula.get(fila.cedula);
    if (previo) {
        const gana = fila._marca > previo._marca ? fila : previo;
        const pierde = gana === fila ? previo : fila;
        anota('solicitantes', `fila ${pierde._fila} (${pierde._nombreCompleto})`,
            `cédula ${fila.cedula} repetida; se conservó la respuesta de la fila ${gana._fila}`);
        porCedula.set(fila.cedula, gana);
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
    new Set(norm(nombre).split(' ').filter((x) => x.length > 2 && !PARTICULAS.has(x)));

const indiceNombres = solicitantes.map((s) => ({ s, t: distintivas(s._nombreCompleto) }));

function buscarSolicitante(nombre) {
    const t = distintivas(nombre);
    let mejor = 0, quien = null, empate = false, comunesMejor = [];
    for (const e of indiceNombres) {
        const comunes = [...t].filter((x) => e.t.has(x));
        if (comunes.length > mejor) {
            mejor = comunes.length; quien = e.s; comunesMejor = comunes; empate = false;
        } else if (comunes.length === mejor && mejor > 0 && e.s !== quien) empate = true;
    }
    if (mejor < 2 || empate) return null;
    if (!comunesMejor.some((x) => !NOMBRES_COMUNES.has(x))) return null;
    return quien;
}

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
    const idNucleo = idDeNucleo(cfg.nucleo);

    for (const f of filas) {
        const nro = String(f[cNro] ?? '').trim();
        const nombre = String(f[cNombre] ?? '').trim();
        if (!nombre || /cierre de semestre/i.test(nombre)) continue; // separadores del libro
        const ref = `${cfg.nucleo} · ${nro || `fila ${f._fila}`} · ${nombre}`;

        const fecha = aFecha(f[cFecha]);
        if (!fecha) { anota('casos', ref, `fecha de atención ilegible ("${String(f[cFecha] ?? '').slice(0, 30)}")`); continue; }

        const solicitante = buscarSolicitante(nombre);
        if (!solicitante) {
            anota('casos', ref, 'el solicitante no está en el formulario socioeconómico: sin cédula, fecha de nacimiento ni domicilio no se puede registrar');
            continue;
        }

        const revisiones = [10, 11, 12, 13, 14].map((i) => String(f[i] ?? '').trim()).filter(Boolean);
        const resena = String(f[cResena] ?? '').trim();
        const alumno = String(f[cAlumno] ?? '').trim();
        const contexto = `${resena} ${revisiones.join(' ')}`;
        const [m, cat, sub, amb] = ambitoDeCaso(f[cTipo], contexto);

        const notas = [];
        if (nro) notas.push(`Expediente del control de casos: ${nro}`);
        if (String(f[cTipo] ?? '').trim()) notas.push(`Tipo según el libro: ${String(f[cTipo]).trim()}`);
        if (resena) notas.push(`Reseña: ${resena}`);
        if (alumno) notas.push(`Responsable según el control de casos: ${alumno}`);
        revisiones.forEach((r, i) => notas.push(`Revisión ${i + 1}: ${r}`));

        casos.push({
            ref, cedula: solicitante.cedula, id_nucleo: idNucleo,
            fecha_solicitud: fecha, fecha_inicio_caso: fecha,
            tramite: tramiteDeCaso(f[cTipo], contexto),
            observaciones: notas.join('\n') || null,
            id_materia: m, num_categoria: cat, num_subcategoria: sub, num_ambito_legal: amb,
            estatus: estatusDeCaso(f[cEstatus]),
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
    sqlNum(s.id_estado), sqlNum(s.num_municipio), sqlNum(s.num_parroquia), sql(s.direccion_habitacion),
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
L.push('DECLARE v_id INTEGER;');
L.push('BEGIN');
for (const c of casos) {
    L.push(`    -- ${c.ref.replace(/\n/g, ' ')}`);
    L.push(`    INSERT INTO casos (fecha_solicitud, fecha_inicio_caso, tramite, observaciones, id_nucleo,`);
    L.push(`        cedula, id_materia, num_categoria, num_subcategoria, num_ambito_legal, id_usuario_registro)`);
    L.push(`    VALUES (${[
        sql(c.fecha_solicitud), sql(c.fecha_inicio_caso), sql(c.tramite), sql(c.observaciones),
        sqlNum(c.id_nucleo), sql(c.cedula), c.id_materia, c.num_categoria, c.num_subcategoria,
        c.num_ambito_legal, sql(COORDINADOR),
    ].join(', ')})`);
    L.push('    RETURNING id_caso INTO v_id;');
    if (c.estatus) {
        L.push(`    INSERT INTO cambio_estatus (num_cambio, id_caso, motivo, nuevo_estatus, fecha,`);
        L.push(`        id_usuario_cambia, id_usuario_registro)`);
        L.push(`    VALUES (COALESCE((SELECT max(num_cambio) FROM cambio_estatus WHERE id_caso = v_id), 0) + 1,`);
        L.push(`            v_id, ${sql(c.estatus.motivo)}, ${sql(c.estatus.estatus)}, ${sql(c.fecha_inicio_caso)},`);
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
L.push(`        'familias_y_hogares', ${familias.length}, 'caracteristicas', ${asignadas.length}, 'casos', ${casos.length}),`);
L.push(`    jsonb_build_object('origen', 'Libros de la clínica 2024-2025', 'generado_por', 'scripts/etl-carga-inicial.mjs'));`);
L.push('');
L.push('COMMIT;');

writeFileSync(join(destino, 'carga-inicial-2024-2025.sql'), L.join('\n') + '\n', 'utf-8');

// ----- Informe -------------------------------------------------------------
const I = [];
I.push('# Carga inicial 2024-2025 — qué entró y qué no');
I.push('');
I.push('Generado por `scripts/etl-carga-inicial.mjs`. El criterio fue no inventar datos:');
I.push('si a una fila le falta algo que el esquema exige, queda fuera y se lista aquí con');
I.push('el motivo, para que la clínica lo complete y se vuelva a correr el ETL.');
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
I.push('');
for (const [lista, titulo2] of [
    ['casos', 'Casos que no se cargaron'],
    ['solicitantes', 'Respuestas del formulario que no se cargaron'],
    ['viviendas', 'Solicitantes sin datos de vivienda'],
    ['familias', 'Solicitantes sin datos de hogar'],
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
for (const s of solicitantes) I.push(`| ${s.cedula} | ${s._nombreCompleto} | ${s.nombres} | ${s.apellidos} |`);
I.push('');

writeFileSync(join(destino, 'carga-inicial-informe.md'), I.join('\n') + '\n', 'utf-8');

console.log(`solicitantes  ${String(solicitantes.length).padStart(3)}  (omitidas ${omitidos.solicitantes.length})`);
console.log(`viviendas     ${String(viviendas.length).padStart(3)}  (omitidas ${omitidos.viviendas.length})`);
console.log(`familias      ${String(familias.length).padStart(3)}  (omitidas ${omitidos.familias.length})`);
console.log(`caracteristicas ${String(asignadas.length).padStart(3)}`);
console.log(`casos         ${String(casos.length).padStart(3)}  (omitidos ${omitidos.casos.length})`);
console.log(`\ndatabase/seeds/carga-inicial-2024-2025.sql`);
console.log(`database/seeds/carga-inicial-informe.md`);
