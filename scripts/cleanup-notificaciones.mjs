import { Pool } from "pg";
import { existsSync, readFileSync } from "fs";
import dotenv from "dotenv";

if (existsSync(".env.local")) dotenv.config({ path: ".env.local" });
if (existsSync(".env")) dotenv.config({ path: ".env" });

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

    console.log(
      `[cleanup-notificaciones] Eliminadas: ${result.rowCount ?? 0} (TTL: ${ttlDays} days)`,
    );
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("[cleanup-notificaciones] Error:", error.message ?? error);
  process.exit(1);
});