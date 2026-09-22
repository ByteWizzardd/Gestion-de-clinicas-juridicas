/**
 * Chequeo de retención de la auditoría.
 *
 * Mira qué registros de `auditoria_eventos` ya cumplieron su plazo y, si hay,
 * deja una notificación a los Coordinadores. NO BORRA NADA: la depuración la
 * confirma una persona desde /dashboard/audit (pestaña Mantenimiento).
 *
 * Mismo patrón que scripts/check-inactive-cases.mjs. La app ya hace este mismo
 * chequeo al entrar al dashboard (triggerAuditRetentionCheckAction); este
 * script sirve para correrlo a mano o desde una tarea programada.
 *
 *   npm run check:auditoria
 */
import { Pool } from "pg";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envLocalPath = join(__dirname, "..", ".env.local");
const envPath = join(__dirname, "..", ".env");
if (existsSync(envLocalPath)) dotenv.config({ path: envLocalPath });
if (existsSync(envPath)) dotenv.config({ path: envPath });

const logger = {
  info: (m, d = "") => console.log(`ℹ️ [${new Date().toISOString()}] ${m}`, d),
  warn: (m, d = "") => console.warn(`⚠️ [${new Date().toISOString()}] ${m}`, d),
  error: (m, d = "") => console.error(`❌ [${new Date().toISOString()}] ${m}`, d),
};

// Debe coincidir con TITULO_NOTIFICACION_PURGA en
// lib/services/audit-retention.service.ts: Notification.tsx usa ese título
// para saber que la notificación lleva a la pestaña de Mantenimiento.
const TITULO = "Registros de auditoría por depurar";

function sql(ruta) {
  return readFileSync(join(__dirname, "..", "database", "queries", ruta), "utf-8");
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no está configurada en las variables de entorno");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const coordinadores = (await pool.query(sql("usuarios/get-all-coordinators.sql"))).rows;
    if (coordinadores.length === 0) {
      logger.warn("No hay coordinadores habilitados a quienes avisar.");
      return;
    }

    const resumen = (await pool.query(sql("auditoria-retencion/get-resumen.sql"))).rows;
    const vencidas = resumen.filter((c) => Number(c.eventos_purgables) > 0);
    const total = vencidas.reduce((suma, c) => suma + Number(c.eventos_purgables), 0);

    logger.info(
      `Auditoría: ${resumen.reduce((s, c) => s + Number(c.eventos_totales), 0)} registros, ${total} vencidos.`
    );

    if (total === 0) {
      logger.info("No hay nada que depurar; no se envían notificaciones.");
      return;
    }

    for (const clase of vencidas) {
      logger.info(
        `  · ${clase.etiqueta}: ${clase.eventos_purgables} anteriores al ${clase.fecha_corte} ` +
          `(se conserva ${clase.meses_retencion} meses)`
      );
    }

    const detalle = vencidas
      .map((c) => `${c.etiqueta.toLowerCase()} (${c.eventos_purgables})`)
      .join(", ");
    const mensaje =
      `Hay ${total} ${total === 1 ? "registro de auditoría que superó" : "registros de auditoría que superaron"} ` +
      `su plazo de conservación: ${detalle}. Haz clic aquí para revisarlos y depurarlos.`;

    const senderId = coordinadores[0].cedula;
    const createNotificationSql = sql("notificaciones/create.sql");
    const existsUnreadSql = sql("notificaciones/exists-unread.sql");
    let enviadas = 0;

    for (const coord of coordinadores) {
      try {
        const existe = await pool.query(existsUnreadSql, [coord.cedula, TITULO, mensaje]);
        if (existe.rowCount > 0) continue;
        await pool.query(createNotificationSql, [coord.cedula, senderId, TITULO, mensaje]);
        enviadas++;
      } catch (notifError) {
        logger.error(`Error enviando notificación a ${coord.cedula}:`, notifError.message);
      }
    }

    logger.info(`Notificaciones enviadas: ${enviadas} de ${coordinadores.length} coordinadores.`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  logger.error("[check-auditoria-retencion] Error:", error?.message ?? error);
  if (error?.code) logger.error("code:", error.code);
  if (error?.detail) logger.error("detail:", error.detail);
  process.exit(1);
});
