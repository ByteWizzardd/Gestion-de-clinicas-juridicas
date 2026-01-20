import { Pool } from 'pg';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

// Cargar variables de entorno manualmente (similar a otros scripts del repo)
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    if (existsSync(file)) {
      const content = readFileSync(file, 'utf-8');
      content.split('\n').forEach((line) => {
        const match = line.match(/^([^=:#]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^["']|["']$/g, '');
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      });
    }
  }
}

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

async function resolveCedulaEmisor(pool) {
  // Siempre usa el primer Coordinador habilitado como emisor
  const { rows: coordRows } = await pool.query(
    "SELECT cedula FROM usuarios WHERE habilitado_sistema = TRUE AND tipo_usuario = 'Coordinador' ORDER BY cedula LIMIT 1"
  );
  const cedulaCoordinador = coordRows?.[0]?.cedula;
  if (cedulaCoordinador) {
    return cedulaCoordinador;
  }
  throw new Error(
    'No hay usuarios habilitados de tipo Coordinador en la tabla usuarios para usar como emisor. Crea/rehabilita un Coordinador.'
  );
}

async function main() {
  loadEnv();

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no está configurada en las variables de entorno');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const cedulaEmisor = await resolveCedulaEmisor(pool);
  const daysAhead = getDaysAheadFromEnv();

  const reminderSql = readFileSync(
    path.join(process.cwd(), 'database/queries/citas/reminder.sql'),
    'utf-8'
  );
  const lockSql = readFileSync(
    path.join(process.cwd(), 'database/queries/citas/lock-reminder.sql'),
    'utf-8'
  );
  const createNotifSql = readFileSync(
    path.join(process.cwd(), 'database/queries/notificaciones/create.sql'),
    'utf-8'
  );

  let recordatoriosEnviados = 0;

  try {
    // Validación previa: asegurar tabla idempotente de locks
    const { rows: regRows } = await pool.query(
      "SELECT to_regclass('public.cita_recordatorios') AS reg"
    );
    if (!regRows?.[0]?.reg) {
      throw new Error(
        'Falta la tabla cita_recordatorios. Ejecuta la migración database/migrations/cita-recordatorio.sql y vuelve a correr el script.'
      );
    }

    const { rows: citas } = await pool.query(reminderSql, [daysAhead]);

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
          'Recordatorio de cita',
          `Tienes una cita del caso #${idCaso} programada para el día ${fechaStr}.`,
        ]);
        recordatoriosEnviados += 1;
      }
    }

    console.log(
      `[send-cita-reminders] recordatoriosEnviados=${recordatoriosEnviados} daysAhead=${daysAhead}`
    );
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('[send-cita-reminders] Error:', error?.message ?? error);
  process.exit(1);
});
