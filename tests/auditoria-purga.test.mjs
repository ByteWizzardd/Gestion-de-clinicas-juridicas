/**
 * Pruebas de la purga manual de auditoría
 * (migración 20260921_120000_purga_manual_auditoria.sql).
 *
 *   npm run test:auditoria-purga
 *
 * Corren contra la base REAL y no dejan rastro: cada prueba que muta datos lo
 * hace dentro de un bloque plpgsql con EXCEPTION, lanza a propósito y captura
 * el error, de modo que la subtransacción se revierte pero las variables con
 * los resultados sobreviven. Al final se comprueba que el total de eventos
 * quedó igual que al empezar.
 *
 * Transporte: se usa `pg` (el driver de la app). Si el 5432 está bloqueado por
 * la red, se cae al endpoint SQL por HTTPS de Neon, que ejecuta un lote de
 * sentencias en una sola transacción. Da igual cuál se use: las pruebas son
 * las mismas.
 */
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
for (const archivo of ['.env.local', '.env']) {
    const ruta = join(__dirname, '..', archivo);
    if (existsSync(ruta)) dotenv.config({ path: ruta });
}

const DATABASE_URL = process.env.DATABASE_URL;
const COORDINADOR = process.env.TEST_COORDINADOR_CEDULA || null;

// ---------------------------------------------------------------------------
// Transporte
// ---------------------------------------------------------------------------
let ejecutarLote;
let cerrar = async () => {};
let transporte = '';

async function prepararTransporte() {
    const { Pool } = await import('pg');
    const pool = new Pool({ connectionString: DATABASE_URL, connectionTimeoutMillis: 10000 });
    try {
        const cliente = await pool.connect();
        cliente.release();
        transporte = 'pg (TCP 5432)';
        ejecutarLote = async (sentencias) => {
            const cliente = await pool.connect();
            try {
                const salida = [];
                for (const sentencia of sentencias) salida.push(await cliente.query(sentencia));
                return salida.map((r) => r.rows);
            } finally {
                cliente.release();
            }
        };
        cerrar = () => pool.end();
        return;
    } catch {
        await pool.end().catch(() => {});
    }

    // Respaldo: endpoint SQL por HTTPS de Neon (un lote = una transacción).
    const host = new URL(DATABASE_URL.replace(/^postgres(ql)?:/, 'https:')).hostname;
    transporte = 'HTTPS (endpoint SQL de Neon)';
    ejecutarLote = async (sentencias) => {
        const respuesta = await fetch(`https://${host}/sql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Neon-Connection-String': DATABASE_URL,
                'Neon-Array-Mode': 'false',
            },
            body: JSON.stringify({ queries: sentencias.map((query) => ({ query, params: [] })) }),
        });
        if (!respuesta.ok) throw new Error(`Neon HTTP ${respuesta.status}: ${await respuesta.text()}`);
        return (await respuesta.json()).results.map((r) => r.rows);
    };
}

/** Una sola consulta; devuelve las filas. */
async function consultar(sql) {
    const [filas] = await ejecutarLote([sql]);
    return filas;
}

/**
 * Ejecuta un cuerpo plpgsql que va llenando `v` (jsonb) y revierte todo lo que
 * haya tocado. Devuelve `v`.
 */
async function conReversion(cuerpo) {
    const fn = `
        CREATE OR REPLACE FUNCTION pg_temp.prueba_auditoria() RETURNS jsonb
        LANGUAGE plpgsql AS $prueba$
        DECLARE v jsonb := '{}'::jsonb;
        BEGIN
          BEGIN
            ${cuerpo}
            RAISE EXCEPTION 'REVERTIR_PRUEBA';
          EXCEPTION WHEN OTHERS THEN
            IF SQLERRM <> 'REVERTIR_PRUEBA' THEN
              v := v || jsonb_build_object('error_inesperado', SQLERRM);
            END IF;
          END;
          RETURN v;
        END $prueba$;`;
    const resultados = await ejecutarLote([fn, 'SELECT pg_temp.prueba_auditoria() AS v']);
    const fila = resultados[resultados.length - 1][0];
    const v = typeof fila.v === 'string' ? JSON.parse(fila.v) : fila.v;
    assert.equal(v.error_inesperado, undefined, `plpgsql falló: ${v.error_inesperado}`);
    return v;
}

const num = (x) => Number(x);

/**
 * Las clases que se prueban a fondo y el SQL que las deja al plazo mínimo.
 * Sin esto las pruebas de purga serían vacías: con los plazos por defecto
 * (12 y 24 meses) no hay nada vencido en ninguna de las dos ramas, así que
 * "no borró nada" pasaría sin haber ejercitado el borrado. Bajar el plazo
 * ocurre DENTRO de la subtransacción que luego se revierte.
 */
const CLASES_CORTAS = "ARRAY['operativo','catalogo']";
const ACORTAR_PLAZOS =
    "UPDATE auditoria_retencion SET meses_retencion = meses_minimo " +
    "WHERE clase IN ('operativo', 'catalogo');";

let totalInicial = 0;
let coordinador = COORDINADOR;

before(async () => {
    assert.ok(DATABASE_URL, 'DATABASE_URL no está configurada');
    await prepararTransporte();
    console.log(`   transporte: ${transporte}`);

    totalInicial = num((await consultar('SELECT count(*) AS n FROM auditoria_eventos'))[0].n);

    if (!coordinador) {
        const filas = await consultar(
            `SELECT cedula FROM usuarios
             WHERE tipo_usuario = 'Coordinador' AND habilitado_sistema = TRUE
             ORDER BY cedula LIMIT 1`
        );
        assert.ok(filas.length, 'No hay ningún Coordinador habilitado para probar la purga');
        coordinador = filas[0].cedula;
    }
});

after(async () => {
    const total = num((await consultar('SELECT count(*) AS n FROM auditoria_eventos'))[0].n);
    assert.equal(total, totalInicial, 'Las pruebas dejaron rastro en auditoria_eventos');
    await cerrar();
});

// ---------------------------------------------------------------------------

test('la migración dejó la tabla, las funciones y los índices en su sitio', async () => {
    const [{ tabla, clase, resumen, purgar, idx_fecha, idx_gin, trigger }] = await consultar(`
        SELECT
            to_regclass('public.auditoria_retencion') IS NOT NULL                       AS tabla,
            to_regprocedure('public.auditoria_clase(text,text,jsonb)') IS NOT NULL      AS clase,
            to_regprocedure('public.auditoria_retencion_resumen()') IS NOT NULL         AS resumen,
            to_regprocedure('public.auditoria_purgar(text[],varchar,boolean)') IS NOT NULL AS purgar,
            EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_auditoria_eventos_fecha')             AS idx_fecha,
            EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_auditoria_eventos_datos_nuevos_gin')  AS idx_gin,
            EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_auditoria_retencion')              AS trigger`);

    assert.ok(tabla, 'falta la tabla auditoria_retencion');
    assert.ok(clase && resumen && purgar, 'falta alguna de las funciones de purga');
    assert.ok(idx_fecha, 'falta el índice por fecha_evento');
    assert.equal(idx_gin, false, 'el índice GIN muerto sigue ahí');
    assert.ok(trigger, 'los cambios de política no se están auditando');
});

test('ningún rol de la app puede borrar auditoría por su cuenta', async () => {
    const filas = await consultar(`
        SELECT grantee FROM information_schema.role_table_grants
        WHERE table_name = 'auditoria_eventos' AND privilege_type IN ('DELETE', 'TRUNCATE')
          AND grantee LIKE 'rol_%'`);
    assert.deepEqual(filas, [], 'algún rol tiene DELETE/TRUNCATE directo sobre auditoria_eventos');
});

test('cada evento cae en una clase, salvo el rastro de la propia depuración', async () => {
    const filas = await consultar(`
        SELECT COALESCE(auditoria_clase(entidad, operacion, metadata), '(ninguna)') AS clase,
               count(*) AS n
        FROM auditoria_eventos GROUP BY 1`);

    const clases = Object.fromEntries(filas.map((f) => [f.clase, num(f.n)]));
    const conocidas = ['operativo', 'catalogo', 'negocio', 'eliminacion', '(ninguna)'];
    for (const clase of Object.keys(clases)) {
        assert.ok(conocidas.includes(clase), `clase inesperada: ${clase}`);
    }

    // Lo único sin clase debe ser el rastro de la depuración.
    const [{ n }] = await consultar(`
        SELECT count(*) AS n FROM auditoria_eventos
        WHERE auditoria_clase(entidad, operacion, metadata) IS NULL
          AND entidad NOT IN ('auditoria', 'retencion_auditoria')`);
    assert.equal(num(n), 0, 'hay eventos sin clase que no son de la depuración');
});

test('las eliminaciones de casos nunca caen en una clase de plazo corto', async () => {
    const filas = await consultar(`
        SELECT DISTINCT auditoria_clase(entidad, operacion, metadata) AS clase
        FROM auditoria_eventos
        WHERE operacion = 'eliminacion' AND entidad IN ('caso', 'usuario', 'solicitante')`);
    for (const { clase } of filas) {
        assert.equal(clase, 'eliminacion', `una eliminación quedó clasificada como "${clase}"`);
    }
});

test('el resumen no borra nada y respeta los plazos configurados', async () => {
    const filas = await consultar(`
        SELECT clase, meses_retencion, fecha_corte, eventos_purgables, eventos_totales
        FROM auditoria_retencion_resumen()`);

    assert.equal(filas.length, 4, 'deberían ser cuatro clases de retención');
    for (const f of filas) {
        assert.ok(num(f.eventos_purgables) <= num(f.eventos_totales));
    }

    // Lo que el resumen llama "purgable" tiene que ser exactamente lo que está
    // por debajo de la fecha de corte de su clase, ni uno más.
    const descuadres = await consultar(`
        WITH recuento AS (
            SELECT r.clase,
                   count(*) FILTER (
                       WHERE e.fecha_evento < ((now() AT TIME ZONE 'America/Caracas')::date
                                               - make_interval(months => r.meses_retencion))
                   ) AS vencidos
            FROM auditoria_retencion r
            LEFT JOIN auditoria_eventos e
              ON auditoria_clase(e.entidad, e.operacion, e.metadata) = r.clase
            GROUP BY r.clase
        )
        SELECT s.clase, s.eventos_purgables, c.vencidos
        FROM auditoria_retencion_resumen() s
        JOIN recuento c ON c.clase = s.clase
        WHERE s.eventos_purgables <> c.vencidos`);
    assert.deepEqual(descuadres, [], 'el resumen no cuadra con los eventos vencidos');

    const total = num((await consultar('SELECT count(*) AS n FROM auditoria_eventos'))[0].n);
    assert.equal(total, totalInicial, 'el resumen borró algo');
});

test('la simulación cuenta pero no borra; la purga real borra eso mismo', async () => {
    const v = await conReversion(`
        ${ACORTAR_PLAZOS}
        v := v || jsonb_build_object('antes', (SELECT count(*) FROM auditoria_eventos));

        v := v || jsonb_build_object('simulacion',
            (SELECT jsonb_agg(to_jsonb(p)) FROM auditoria_purgar(${CLASES_CORTAS}, '${coordinador}', TRUE) p));
        v := v || jsonb_build_object('tras_simular', (SELECT count(*) FROM auditoria_eventos));

        v := v || jsonb_build_object('purga',
            (SELECT jsonb_agg(to_jsonb(p)) FROM auditoria_purgar(${CLASES_CORTAS}, '${coordinador}', FALSE) p));
        v := v || jsonb_build_object('tras_purgar', (SELECT count(*) FROM auditoria_eventos));

        v := v || jsonb_build_object('eventos_de_purga',
            (SELECT count(*) FROM auditoria_eventos WHERE entidad = 'auditoria' AND operacion = 'purga'));
    `);

    const simulados = (v.simulacion || []).reduce((s, r) => s + r.eventos_borrados, 0);
    const borrados = (v.purga || []).reduce((s, r) => s + r.eventos_borrados, 0);

    assert.equal(v.tras_simular, v.antes, 'la simulación borró registros');
    assert.equal(simulados, borrados, 'la simulación no coincide con lo que se borró');
    // +1 por el evento que registra la propia purga.
    assert.equal(v.tras_purgar, v.antes - borrados + (borrados > 0 ? 1 : 0));
    assert.equal(v.eventos_de_purga, borrados > 0 ? 1 : 0, 'la purga no quedó registrada');
});

test('la purga no parte en dos los eventos que el panel muestra fusionados', async () => {
    // filtro-eventos.sql fusiona los hermanos que comparten fecha_evento; si se
    // borrara media pareja quedarían tarjetas huérfanas.
    const v = await conReversion(`
        CREATE TEMP TABLE censo_fechas ON COMMIT DROP AS
            SELECT fecha_evento, count(*) AS n FROM auditoria_eventos GROUP BY 1;

        ${ACORTAR_PLAZOS}
        PERFORM auditoria_purgar(${CLASES_CORTAS}, '${coordinador}', FALSE);

        v := v || jsonb_build_object('fechas_partidas', (
            SELECT COALESCE(jsonb_agg(c.fecha_evento), '[]'::jsonb)
            FROM censo_fechas c
            JOIN (SELECT fecha_evento, count(*) AS n FROM auditoria_eventos GROUP BY 1) a
              ON a.fecha_evento = c.fecha_evento
            WHERE a.n <> c.n));
    `);
    assert.deepEqual(v.fechas_partidas, [], 'quedaron fechas con eventos a medio borrar');
});

test('nada vencido de las clases purgadas sobrevive salvo lo retenido por agrupación', async () => {
    const v = await conReversion(`
        ${ACORTAR_PLAZOS}
        v := v || jsonb_build_object('resultado',
            (SELECT jsonb_agg(to_jsonb(p)) FROM auditoria_purgar(${CLASES_CORTAS}, '${coordinador}', FALSE) p));
        v := v || jsonb_build_object('vencidos_vivos', (
            SELECT count(*) FROM auditoria_eventos e
            JOIN auditoria_retencion r ON r.clase = auditoria_clase(e.entidad, e.operacion, e.metadata)
            WHERE r.clase IN ('operativo', 'catalogo')
              AND e.fecha_evento < ((now() AT TIME ZONE 'America/Caracas')::date
                                    - make_interval(months => r.meses_retencion))));
    `);
    const retenidos = (v.resultado || []).reduce((s, r) => s + r.eventos_retenidos, 0);
    assert.equal(v.vencidos_vivos, retenidos,
        'sobrevivieron registros vencidos que no se explican por la agrupación');
});

test('la purga rechaza clases inventadas, listas vacías y actores no autorizados', async () => {
    const v = await conReversion(`
        CREATE OR REPLACE FUNCTION pg_temp.intentar(p_sql text) RETURNS text
        LANGUAGE plpgsql AS $i$
        BEGIN
          BEGIN EXECUTE p_sql; RETURN 'SIN ERROR';
          EXCEPTION WHEN OTHERS THEN RETURN SQLERRM; END;
        END $i$;

        v := v || jsonb_build_object(
          'clase_inventada', pg_temp.intentar($q$SELECT * FROM auditoria_purgar(ARRAY['xyz'], '${coordinador}', TRUE)$q$),
          'lista_vacia',     pg_temp.intentar($q$SELECT * FROM auditoria_purgar(ARRAY[]::text[], '${coordinador}', TRUE)$q$),
          'actor_nulo',      pg_temp.intentar($q$SELECT * FROM auditoria_purgar(ARRAY['operativo'], NULL, TRUE)$q$),
          'actor_inventado', pg_temp.intentar($q$SELECT * FROM auditoria_purgar(ARRAY['operativo'], 'V-00000001', TRUE)$q$),
          'no_coordinador',  pg_temp.intentar((
              SELECT format($q$SELECT * FROM auditoria_purgar(ARRAY['operativo'], %L, TRUE)$q$, u.cedula)
              FROM usuarios u WHERE u.tipo_usuario <> 'Coordinador' LIMIT 1)));
    `);

    assert.match(v.clase_inventada, /desconocida/i);
    assert.match(v.lista_vacia, /al menos una clase/i);
    assert.match(v.actor_nulo, /Coordinador/i);
    assert.match(v.actor_inventado, /Coordinador/i);
    assert.match(v.no_coordinador, /Coordinador/i);
});

test('el plazo de cada clase no puede bajar de su mínimo, y cambiarlo queda auditado', async () => {
    const v = await conReversion(`
        CREATE OR REPLACE FUNCTION pg_temp.intentar(p_sql text) RETURNS text
        LANGUAGE plpgsql AS $i$
        BEGIN
          BEGIN EXECUTE p_sql; RETURN 'SIN ERROR';
          EXCEPTION WHEN OTHERS THEN RETURN SQLERRM; END;
        END $i$;

        v := v || jsonb_build_object(
          'por_debajo', pg_temp.intentar($q$UPDATE auditoria_retencion SET meses_retencion = 1 WHERE clase = 'negocio'$q$),
          'absurdo',    pg_temp.intentar($q$UPDATE auditoria_retencion SET meses_retencion = 9999 WHERE clase = 'negocio'$q$),
          'valido',     pg_temp.intentar($q$UPDATE auditoria_retencion SET meses_retencion = 36 WHERE clase = 'negocio'$q$));

        v := v || jsonb_build_object('evento', (
            SELECT jsonb_build_object('entidad', a.entidad, 'antes', a.datos_anteriores, 'despues', a.datos_nuevos)
            FROM auditoria_eventos a
            WHERE a.entidad = 'retencion_auditoria' ORDER BY a.id DESC LIMIT 1));

        UPDATE auditoria_retencion SET meses_retencion = 600;
        v := v || jsonb_build_object('purgables_con_plazo_maximo',
            (SELECT COALESCE(sum(eventos_purgables), 0) FROM auditoria_retencion_resumen()));
    `);

    assert.match(v.por_debajo, /auditoria_retencion_meses_check/);
    assert.match(v.absurdo, /auditoria_retencion_tope_check/);
    assert.equal(v.valido, 'SIN ERROR');
    assert.equal(v.evento?.entidad, 'retencion_auditoria', 'el cambio de política no se auditó');
    assert.equal(v.evento?.despues?.meses_retencion, 36);
    assert.equal(Number(v.purgables_con_plazo_maximo), 0,
        'con el plazo al máximo no debería haber nada purgable');
});

test('el rastro de la depuración nunca se purga a sí mismo', async () => {
    const v = await conReversion(`
        UPDATE auditoria_retencion SET meses_retencion = meses_minimo;
        PERFORM auditoria_purgar(
            ARRAY['operativo','catalogo','negocio','eliminacion'], '${coordinador}', FALSE);
        v := v || jsonb_build_object('rastro_vivo', (
            SELECT count(*) FROM auditoria_eventos
            WHERE entidad IN ('auditoria', 'retencion_auditoria')));
    `);
    assert.ok(v.rastro_vivo >= 1, 'la purga se borró su propio registro');
});
