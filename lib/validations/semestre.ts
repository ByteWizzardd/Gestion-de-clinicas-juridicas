/**
 * Reglas del calendario de semestres (TERM = YYYY-15 | YYYY-25):
 *  - YYYY-15: empieza en septiembre de YYYY-1 y termina en enero de YYYY.
 *  - YYYY-25: empieza en marzo y termina en julio del mismo año YYYY.
 * Ej.: 2027-15 = sep 2026 – ene 2027 → 2027-25 = mar–jul 2027 → 2028-15 = sep 2027 …
 * Se admite un mes de holgura a cada lado porque las fechas reales se corren
 * (p. ej. un 15 que cierra en febrero o un 25 que arranca a fines de febrero).
 */

export const TERM_REGEX = /^\d{4}-(15|25)$/;

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
    'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** Ventana permitida como índice absoluto de mes (año * 12 + mes0). */
type Ventana = { desde: number; hasta: number };

const idx = (anio: number, mes1: number) => anio * 12 + (mes1 - 1);

function ventanas(term: string): { inicio: Ventana; fin: Ventana } | null {
    if (!TERM_REGEX.test(term)) return null;
    const anio = Number(term.slice(0, 4));
    if (term.endsWith('-15')) {
        return {
            inicio: { desde: idx(anio - 1, 8), hasta: idx(anio - 1, 10) }, // ago–oct del año anterior (septiembre ±1)
            fin: { desde: idx(anio - 1, 12), hasta: idx(anio, 2) },        // dic–feb (enero ±1)
        };
    }
    return {
        inicio: { desde: idx(anio, 2), hasta: idx(anio, 4) },  // feb–abr (marzo ±1)
        fin: { desde: idx(anio, 6), hasta: idx(anio, 8) },     // jun–ago (julio ±1)
    };
}

export type FechaEntrada = string | Date | null | undefined;

/**
 * Normaliza a 'YYYY-MM-DD'. Un Date viene de una columna DATE leída por pg
 * (medianoche del servidor, que está en UTC o en UTC-4): sus componentes UTC
 * conservan el día correcto tanto en el servidor como en el navegador.
 */
function aISO(fecha: FechaEntrada): string | null {
    if (!fecha) return null;
    if (fecha instanceof Date) {
        if (isNaN(fecha.getTime())) return null;
        return fecha.toISOString().slice(0, 10);
    }
    const m = /^(\d{4}-\d{2}-\d{2})/.exec(String(fecha));
    return m ? m[1] : null;
}

function mesDe(iso: string | null): number | null {
    return iso ? idx(Number(iso.slice(0, 4)), Number(iso.slice(5, 7))) : null;
}

const nombre = (i: number) => `${MESES[i % 12]} ${Math.floor(i / 12)}`;

export function esperadoSemestre(term: string): string | null {
    if (!TERM_REGEX.test(term)) return null;
    const anio = Number(term.slice(0, 4));
    return term.endsWith('-15')
        ? `septiembre de ${anio - 1} a enero de ${anio}`
        : `marzo a julio de ${anio}`;
}

export function validarFechaInicioSemestre(term: string, fecha: FechaEntrada): string | undefined {
    const v = ventanas(term);
    const mes = mesDe(aISO(fecha));
    if (!v || mes === null) return undefined;
    if (mes < v.inicio.desde || mes > v.inicio.hasta) {
        return `El ${term} va de ${esperadoSemestre(term)}: debe empezar entre ${nombre(v.inicio.desde)} y ${nombre(v.inicio.hasta)}`;
    }
    return undefined;
}

export function validarFechaFinSemestre(term: string, fechaInicio: FechaEntrada, fecha: FechaEntrada): string | undefined {
    const iniISO = aISO(fechaInicio);
    const finISO = aISO(fecha);
    if (iniISO && finISO && finISO <= iniISO) {
        return 'La fecha de fin debe ser posterior a la fecha de inicio';
    }
    const v = ventanas(term);
    const mes = mesDe(finISO);
    if (!v || mes === null) return undefined;
    if (mes < v.fin.desde || mes > v.fin.hasta) {
        return `El ${term} va de ${esperadoSemestre(term)}: debe terminar entre ${nombre(v.fin.desde)} y ${nombre(v.fin.hasta)}`;
    }
    return undefined;
}

/** Primer error encontrado (para el servidor), o undefined si todo cuadra. */
export function validarSemestre(term: string, fechaInicio: FechaEntrada, fechaFin: FechaEntrada): string | undefined {
    if (!TERM_REGEX.test(term)) return 'El formato del semestre debe ser YYYY-15 o YYYY-25 (ej: 2026-15)';
    return validarFechaInicioSemestre(term, fechaInicio)
        ?? validarFechaFinSemestre(term, fechaInicio, fechaFin);
}
