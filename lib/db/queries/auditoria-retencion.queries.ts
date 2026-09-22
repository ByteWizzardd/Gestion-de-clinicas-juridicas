import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { DatabaseError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';

/**
 * Purga manual de `auditoria_eventos`.
 *
 * Toda la lógica vive en la base (migración
 * 20260921_120000_purga_manual_auditoria.sql): `auditoria_retencion_resumen()`
 * dice qué se borraría y `auditoria_purgar()` lo borra. Este módulo solo las
 * llama. Ningún rol de la app tiene DELETE sobre la tabla, así que no hay
 * forma de borrar auditoría por fuera de esa función.
 *
 * Nada de esto corre solo: siempre lo dispara un Coordinador.
 */

/** Una clase de registros de auditoría con su plazo y lo que ya venció. */
export interface ClaseRetencion {
    clase: string;
    etiqueta: string;
    descripcion: string;
    meses_retencion: number;
    /** Piso que la app no deja bajar (ver los comentarios de la migración). */
    meses_minimo: number;
    /** Fecha a partir de la cual se conserva, en formato YYYY-MM-DD. */
    fecha_corte: string;
    eventos_purgables: number;
    eventos_totales: number;
    evento_mas_viejo: string | null;
    evento_mas_nuevo: string | null;
}

export interface ResultadoPurga {
    clase: string;
    eventos_borrados: number;
    /**
     * Eventos que ya cumplieron el plazo pero se quedan porque comparten
     * fecha_evento con otro que no se purga: el panel fusiona esos hermanos en
     * una sola tarjeta, así que se van juntos o no se va ninguno.
     */
    eventos_retenidos: number;
    evento_mas_viejo: string | null;
    evento_mas_nuevo: string | null;
}

export interface UltimaPurga {
    fecha: string;
    usuario_id: string;
    usuario_nombre: string;
    eventos_borrados: number;
    clases: string[];
}

/** pg devuelve los BIGINT/NUMERIC como string. */
function aEntero(valor: unknown): number {
    const n = Number(valor);
    return Number.isFinite(n) ? n : 0;
}

/**
 * Traduce el fallo a algo accionable en vez de un "error al obtener…" mudo.
 *
 * El caso que más se repite es tener el código nuevo contra una base donde
 * todavía no se corrió la migración: Postgres responde 42P01 (tabla que no
 * existe) o 42883 (función que no existe), y sin este aviso la pantalla solo
 * dice que algo falló.
 */
function errorDeBaseDeDatos(error: unknown, accion: string): DatabaseError {
    const codigo = (error as { code?: string } | null)?.code;

    if (codigo === '42P01' || codigo === '42883') {
        return new DatabaseError(
            'Falta aplicar la migración de depuración de auditoría ' +
                '(database/migrations/20260921_120000_purga_manual_auditoria.sql) en esta base de datos.',
            error
        );
    }
    if (codigo === '42501') {
        return new DatabaseError(
            'El usuario de base de datos no tiene permiso para consultar la política de retención.',
            error
        );
    }
    return new DatabaseError(accion, error);
}

export const auditoriaRetencionQueries = {
    getResumen: async (): Promise<ClaseRetencion[]> => {
        try {
            const query = loadSQL('auditoria-retencion/get-resumen.sql');
            const result = await pool.query(query);
            return result.rows.map((row) => ({
                ...row,
                meses_retencion: aEntero(row.meses_retencion),
                meses_minimo: aEntero(row.meses_minimo),
                eventos_purgables: aEntero(row.eventos_purgables),
                eventos_totales: aEntero(row.eventos_totales),
            }));
        } catch (error) {
            logger.error('Error en auditoriaRetencionQueries.getResumen', error);
            throw errorDeBaseDeDatos(error, 'Error al obtener la política de retención');
        }
    },

    updateMeses: async (clase: string, meses: number, actor: string): Promise<ClaseRetencion | null> => {
        try {
            const query = loadSQL('auditoria-retencion/update-meses.sql');
            const result = await pool.query(query, [clase, meses, actor]);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error('Error en auditoriaRetencionQueries.updateMeses', error);
            throw errorDeBaseDeDatos(error, 'Error al actualizar el plazo de retención');
        }
    },

    /**
     * @param simular true (por defecto) cuenta sin borrar. La UI siempre
     *                simula antes de confirmar.
     */
    purgar: async (clases: string[], actor: string, simular = true): Promise<ResultadoPurga[]> => {
        try {
            const query = loadSQL('auditoria-retencion/purgar.sql');
            const result = await pool.query(query, [clases, actor, simular]);
            return result.rows.map((row) => ({
                ...row,
                eventos_borrados: aEntero(row.eventos_borrados),
                eventos_retenidos: aEntero(row.eventos_retenidos),
            }));
        } catch (error) {
            logger.error('Error en auditoriaRetencionQueries.purgar', error);
            throw errorDeBaseDeDatos(error, 'Error al depurar los registros de auditoría');
        }
    },

    getUltimaPurga: async (): Promise<UltimaPurga | null> => {
        try {
            const query = loadSQL('auditoria-retencion/get-ultima-purga.sql');
            const result = await pool.query(query);
            const row = result.rows[0];
            if (!row) return null;
            return {
                ...row,
                eventos_borrados: aEntero(row.eventos_borrados),
                clases: Array.isArray(row.clases) ? row.clases : [],
            };
        } catch (error) {
            logger.error('Error en auditoriaRetencionQueries.getUltimaPurga', error);
            return null;
        }
    },
};
