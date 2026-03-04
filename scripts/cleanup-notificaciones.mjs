import { Pool } from "pg";
import { existsSync, readFileSync } from "fs";
import dotenv from "dotenv";

if (existsSync(".env.local")) dotenv.config({ path: ".env.local" });
if (existsSync(".env")) dotenv.config({ path: ".env" });

const logger = {
  info: (m, d = "") => console.log(`ℹ️ [${new Date().toISOString()}] ${m}`, d),
  warn: (m, d = "") => console.warn(`⚠️ [${new Date().toISOString()}] ${m}`, d),
  error: (m, d = "") => console.error(`❌ [${new Date().toISOString()}] ${m}`, d),
  debug: (m, d = "") => { if (process.env.DEBUG) console.log(`🔍 [${new Date().toISOString()}] ${m}`, d); }
};

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL no está configurada en las variables de entorno",
    );
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const ttlDays = 30;

  const deleteOlderThanSql = readFileSync(
    "database/queries/notificaciones/delete-older-than.sql",
    "utf-8",
  );

  try {
    const result = await pool.query(deleteOlderThanSql, [ttlDays]);

  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  const message =
    typeof error === "string"
      ? error
      : (error?.message && String(error.message).trim())
        ? String(error.message)
        : "(sin mensaje)";
  logger.error("[cleanup-notificaciones] Error:", message);
  if (error?.code) logger.error("[cleanup-notificaciones] code:", error.code);
  if (error?.detail) logger.error("[cleanup-notificaciones] detail:", error.detail);
  if (error?.hint) logger.error("[cleanup-notificaciones] hint:", error.hint);
  if (error?.stack) logger.error(error.stack);
  process.exit(1);
});