/**
 * Reglas del calendario de semestres (TERM = YYYY-15 | YYYY-25):
 *  - YYYY-15: empieza en septiembre de YYYY-1 y termina en enero de YYYY.
 *  - YYYY-25: empieza en marzo y termina en julio del mismo año YYYY.
 * Ej.: 2027-15 = sep 2026 – ene 2027 → 2027-25 = mar–jul 2027 → 2028-15 = sep 2027 …
 * Solo se valida el mes (y el año); el día es libre.
 */

export const TERM_REGEX = /^\d{4}-(15|25)$/;

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
    'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** Mes como índice absoluto (año * 12 + mes0), para comparar año y mes de una vez. */
const idx = (anio: number, mes1: number) => anio * 12 + (mes1 - 1);

function mesesEsperados(term: string): { inicio: number; fin: number } | null {
    if (!TERM_REGEX.test(term)) return null;
    const anio = Number(term.slice(0, 4));
    return term.endsWith('-15')
        ? { inicio: idx(anio - 1, 9), fin: idx(anio, 1) }   // septiembre de YYYY-1 → enero de YYYY
        : { inicio: idx(anio, 3), fin: idx(anio, 7) };      // marzo → julio de YYYY
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

const nombre = (i: number) => `${MESES[i % 12]} de ${Math.floor(i / 12)}`;

export function validarFechaInicioSemestre(term: string, fecha: FechaEntrada): string | undefined {
    const esperado = mesesEsperados(term);
    const mes = mesDe(aISO(fecha));
    if (!esperado || mes === null) return undefined;
    if (mes !== esperado.inicio) {
        return `El ${term} debe empezar en ${nombre(esperado.inicio)}`;
    }
    return undefined;
}

export function validarFechaFinSemestre(term: string, fechaInicio: FechaEntrada, fecha: FechaEntrada): string | undefined {
    const iniISO = aISO(fechaInicio);
    const finISO = aISO(fecha);
    if (iniISO && finISO && finISO <= iniISO) {
        return 'La fecha de fin debe ser posterior a la fecha de inicio';
    }
    const esperado = mesesEsperados(term);
    const mes = mesDe(finISO);
    if (!esperado || mes === null) return undefined;
    if (mes !== esperado.fin) {
        return `El ${term} debe terminar en ${nombre(esperado.fin)}`;
    }
    return undefined;
}

/** Primer error encontrado (para el servidor), o undefined si todo cuadra. */
export function validarSemestre(term: string, fechaInicio: FechaEntrada, fechaFin: FechaEntrada): string | undefined {
    if (!TERM_REGEX.test(term)) return 'El formato del semestre debe ser YYYY-15 o YYYY-25 (ej: 2026-15)';
    return validarFechaInicioSemestre(term, fechaInicio)
        ?? validarFechaFinSemestre(term, fechaInicio, fechaFin);
}
