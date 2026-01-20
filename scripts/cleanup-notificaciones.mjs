import { Pool } from 'pg';
import { readFileSync, existsSync } from 'fs';

// Cargar variables de entorno manualmente (similar a otros scripts del repo)
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    if (existsSync(file)) {
      const content = readFileSync(file, 'utf-8');
      content.split('\n').forEach(line => {
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

function getTtlDaysFromEnv() {
  const raw = process.env.NOTIFICATIONS_TTL_DAYS;
  if (!raw) return 30;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return 30;
  return Math.floor(value);
}

loadEnv();

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no está configurada en las variables de entorno');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const ttlDays = getTtlDaysFromEnv();

  const deleteOlderThanSql = readFileSync(
    'database/queries/notificaciones/delete-older-than.sql',
    'utf-8'
  );

  try {
    const result = await pool.query(deleteOlderThanSql, [ttlDays]);

    console.log(`[cleanup-notificaciones] Eliminadas: ${result.rowCount ?? 0} (TTL: ${ttlDays} days)`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('[cleanup-notificaciones] Error:', error.message ?? error);
  process.exit(1);
});
