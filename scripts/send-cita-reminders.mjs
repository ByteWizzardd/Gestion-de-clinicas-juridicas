import { readFileSync, existsSync } from "fs";
import path from "path";
import { Pool } from "pg";
import dotenv from "dotenv";

const SCRIPT_TAG = "[send-cita-reminders]";
if (existsSync(".env.local")) dotenv.config({ path: ".env.local" });
if (existsSync(".env")) dotenv.config({ path: ".env" });

const DEBUG_SEND_CITA_REMINDERS = ["1", "true", "yes"].includes(
  String(process.env.DEBUG_SEND_CITA_REMINDERS || "").toLowerCase()
);

const logger = {
  info: (m, d = "") => console.log(`ℹ️ [${new Date().toISOString()}] ${m}`, d),
  warn: (m, d = "") => console.warn(`⚠️ [${new Date().toISOString()}] ${m}`, d),
  error: (m, d = "") => console.error(`❌ [${new Date().toISOString()}] ${m}`, d),
  debug: (m, d = "") => { if (DEBUG_SEND_CITA_REMINDERS) console.log(`🔍 [${new Date().toISOString()}] ${m}`, d); }
};

const logInfo = (m, d = "") => logger.info(`${SCRIPT_TAG} ${m}`, d);
const logDebug = (m, d = "") => logger.debug(`${SCRIPT_TAG} ${m}`, d);


logInfo(`boot: node=${process.version} debug=${DEBUG_SEND_CITA_REMINDERS}`);

function getDateYYYYMMDD(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getDaysAheadFromEnv() {
  const raw = process.env.CITA_REMINDER_DAYS_AHEAD;
  if (!raw) return 1;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return 1;
  return Math.floor(value);
}

function parsePgTextArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];

  const trimmed = value.trim();
  if (trimmed === '{}' || trimmed === '') return [];
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    const inner = trimmed.slice(1, -1);
    if (!inner) return [];
    return inner
      .split(',')
      .map((s) => s.trim().replace(/^"|"$/g, ''))
      .filter(Boolean);
  }
  return [];
}

function getDatabaseUrlInfo(databaseUrl) {
  try {
    const url = new URL(databaseUrl);
    const database = url.pathname?.startsWith('/') ? url.pathname.slice(1) : url.pathname;
    return {
      protocol: url.protocol,
      host: url.hostname,
      port: url.port || '(default)',
      database: database || '(default)',
      user: url.username || '(default)',
      sslmode: url.searchParams.get('sslmode') || null,
      ssl: url.searchParams.get('ssl') || null,
    };
  } catch {
    return null;
  }
}

function buildPoolConfigFromEnv() {
  const connectionString = process.env.DATABASE_URL;
  const info = connectionString ? getDatabaseUrlInfo(connectionString) : null;

  const sslmode = info?.sslmode?.toLowerCase();
  const sslParam = info?.ssl?.toLowerCase();
  const shouldUseSsl = sslmode === 'require' || sslParam === 'true' || sslParam === '1';

  const timeoutRaw = process.env.PGCONNECT_TIMEOUT_MS;
  const timeoutParsed = timeoutRaw ? Number(timeoutRaw) : NaN;
  const connectionTimeoutMillis =
    Number.isFinite(timeoutParsed) && timeoutParsed > 0 ? Math.floor(timeoutParsed) : 15_000;

  return {
    connectionString,
    connectionTimeoutMillis,
    ...(shouldUseSsl ? { ssl: { rejectUnauthorized: false } } : null),
  };
}

async function resolveCedulaEmisor(pool) {
  // Usa la query de coordinadores/first-coordinadores.sql para obtener el emisor prioritario
  const sqlPath = path.join(
    process.cwd(),
    'database/queries/coordinadores/first-coordinadores.sql'
  );
  logDebug('resolveCedulaEmisor: leyendo SQL', sqlPath);
  const firstCoordinadorSql = readFileSync(sqlPath, 'utf-8');

  logDebug('resolveCedulaEmisor: ejecutando query');
  const { rows } = await pool.query(firstCoordinadorSql);
  const cedula = rows?.[0]?.cedula;
  if (cedula) {
    logDebug('resolveCedulaEmisor: cedulaEmisor=', cedula);
    return cedula;
  }
  throw new Error(
    'No hay usuarios habilitados en la tabla usuarios para usar como emisor. Crea/rehabilita un Coordinador, Profesor o Estudiante.'
  );
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no está configurada en las variables de entorno");
  }

  const dbInfo = getDatabaseUrlInfo(process.env.DATABASE_URL);
  logDebug('init: DATABASE_URL info=', dbInfo ?? '(no parseable)');

  const poolConfig = buildPoolConfigFromEnv();
  logInfo(
    `init: connecting host=${dbInfo?.host ?? '(unknown)'} db=${dbInfo?.database ?? '(unknown)'} ssl=${Boolean(poolConfig.ssl)} timeoutMs=${poolConfig.connectionTimeoutMillis}`
  );
  const pool = new Pool(poolConfig);

  const readSql = (relativePath) =>
    readFileSync(path.join(process.cwd(), relativePath), "utf-8");

  const reminderSql = readSql("database/queries/citas/reminder.sql");
  const lockSql = readSql("database/queries/citas/lock-reminder.sql");
  const createNotifSql = readSql("database/queries/notificaciones/create.sql");

  let recordatoriosEnviados = 0;

  try {
    const startedAt = Date.now();
    logInfo('start');

    const connectStartedAt = Date.now();
    logDebug('healthcheck: SELECT 1');
    await pool.query('SELECT 1 AS ok');
    logInfo(`db: connected (${Date.now() - connectStartedAt}ms)`);

    const cedulaEmisor = await resolveCedulaEmisor(pool);
    logInfo('emisor: resuelto');
    const daysAhead = getDaysAheadFromEnv();
    logInfo(`params: daysAhead=${daysAhead}`);
    logDebug('params: cedulaEmisor=', cedulaEmisor);

    // Validación previa: asegurar tabla idempotente de locks
    const { rows: regRows } = await pool.query(
      "SELECT to_regclass('public.cita_recordatorios') AS reg"
    );
    if (!regRows?.[0]?.reg) {
      throw new Error(
        "Falta la tabla cita_recordatorios. Crea esa tabla (idempotencia de recordatorios) y vuelve a correr el script."
      );
    }

    logDebug('consultando citas (reminder.sql)');
    const { rows: citas } = await pool.query(reminderSql, [daysAhead]);
    logInfo(`citas: encontradas=${citas.length}`);

    for (const c of citas) {
      const appointmentId = c.appointment_id;
      const idCaso = c.id_caso;
      const fecha = c.fecha instanceof Date ? c.fecha : new Date(String(c.fecha));
      const fechaStr = getDateYYYYMMDD(fecha);

      const usuariosAtienden = parsePgTextArray(c.usuarios_atienden);
      if (!appointmentId || !idCaso || usuariosAtienden.length === 0) continue;

      // lock idempotente para evitar duplicados
      const { rows: lockedRows } = await pool.query(lockSql, [
        appointmentId,
        `D-${daysAhead}`,
        fechaStr,
      ]);
      if (lockedRows.length === 0) continue;

      for (const cedulaReceptor of usuariosAtienden) {
        await pool.query(createNotifSql, [
          cedulaReceptor,
          cedulaEmisor,
          "Recordatorio de cita",
          `Tienes una cita del caso #${idCaso} programada para el día ${fechaStr}.`,
        ]);
        recordatoriosEnviados += 1;
      }
    }

    logInfo(
      `done: recordatoriosEnviados=${recordatoriosEnviados} daysAhead=${daysAhead} durationMs=${Date.now() - startedAt}`
    );
  } finally {
    logDebug('closing pool');
    await pool.end();
  }
}

main().catch((error) => {
  const message =
    typeof error === 'string'
      ? error
      : error?.message && String(error.message).trim()
        ? String(error.message)
        : error?.name
          ? String(error.name)
          : String(error);

  logger.error(`${SCRIPT_TAG} Error:`, message);

  if (error?.code) logger.error(`${SCRIPT_TAG} code:`, error.code);
  if (error?.detail) logger.error(`${SCRIPT_TAG} detail:`, error.detail);
  if (error?.hint) logger.error(`${SCRIPT_TAG} hint:`, error.hint);

  // AggregateError (p.ej. ETIMEDOUT) puede contener errores internos más específicos
  if (error instanceof AggregateError && Array.isArray(error.errors)) {
    for (const [i, inner] of error.errors.entries()) {
      const innerMsg =
        inner?.message && String(inner.message).trim()
          ? String(inner.message)
          : inner?.code
            ? String(inner.code)
            : String(inner);
      logger.error(`${SCRIPT_TAG} inner[${i}]`, innerMsg);
      if (inner?.code) logger.error(`${SCRIPT_TAG} inner[${i}].code`, inner.code);
      if (inner?.stack) logger.error(inner.stack);
    }
  }

  if (error?.stack) logger.error(error.stack);
  process.exit(1);
});
