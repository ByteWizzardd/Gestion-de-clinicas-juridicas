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

function formatCaseIdList(cases, limit = 50) {
  const ids = cases.map((c) => c.id_caso).filter((v) => v !== null && v !== undefined);
  const first = ids.slice(0, limit);
  const remaining = Math.max(0, ids.length - first.length);
  const suffix = remaining > 0 ? ` y ${remaining} más` : "";
  return `${first.join(", ")}${suffix}`;
}

async function resolveCedulaEmisor(pool) {
  // Siempre usa el primer Coordinador habilitado como emisor
  const { rows } = await pool.query(
    "SELECT cedula FROM usuarios WHERE habilitado_sistema = TRUE AND tipo_usuario = 'Coordinador' ORDER BY cedula LIMIT 1",
  );
  const cedulaCoordinador = rows?.[0]?.cedula;
  if (cedulaCoordinador) return cedulaCoordinador;
  throw new Error(
    "No hay usuarios habilitados de tipo Coordinador para usar como emisor. Crea/rehabilita un Coordinador.",
  );
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no está configurada en las variables de entorno");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {

    // 1. Cargar Queries
    const getInactiveCasesSql = readFileSync(
      join(__dirname, "../database/queries/casos/get-inactive-cases.sql"),
      "utf-8",
    );
    const getCoordinatorsSql = readFileSync(
      join(__dirname, "../database/queries/usuarios/get-all-coordinators.sql"),
      "utf-8",
    );
    const createNotificationSql = readFileSync(
      join(__dirname, "../database/queries/notificaciones/create.sql"),
      "utf-8",
    );
    const existsUnreadSql = readFileSync(
      join(__dirname, "../database/queries/notificaciones/exists-unread.sql"),
      "utf-8",
    );

    // 2. Obtener Coordinadores (para enviarles las notificaciones)
    const coordsResult = await pool.query(getCoordinatorsSql);
    const coordinadores = coordsResult.rows;

    if (coordinadores.length === 0) {
      return;
    }

    const senderId = await resolveCedulaEmisor(pool);

    // 3. Buscar Casos Inactivos
    // Nota: El query get-inactive-cases.sql ya maneja la lógica de semestres internamente
    // y no requiere parámetros para la opción por defecto (usando semestres).
    const inactiveResult = await pool.query(getInactiveCasesSql);
    const inactiveCases = inactiveResult.rows;


    if (inactiveCases.length === 0) {
      return;
    }

    // Notificación resumen a coordinadores
    const cantidadInactivos = inactiveCases.length;
    const titulo = "Casos inactivos";
    const mensaje = `Actualmente hay ${cantidadInactivos} casos inactivos de los 2 últimos semestres. Casos: ${formatCaseIdList(inactiveCases)}.`;

    for (const coord of coordinadores) {
      try {
        const existeResultado = await pool.query(existsUnreadSql, [
          coord.cedula,
          titulo,
        ]);
        if (existeResultado.rowCount > 0) {
          continue;
        }
        await pool.query(createNotificationSql, [
          coord.cedula,
          senderId,
          titulo,
          mensaje,
        ]);
      } catch (notifError) {
        console.error(
          `Error enviando notificación a ${coord.cedula}:`,
          notifError.message,
        );
      }
    }

    // Notificación individual a profesores supervisores de cada caso inactivo
    const getProfSupervisoresSql = readFileSync(
      join(__dirname, "../database/queries/casos/get-profesors-sup.sql"),
      "utf-8",
    );
    for (const caso of inactiveCases) {
      const profResult = await pool.query(getProfSupervisoresSql, [
        caso.id_caso,
      ]);
      const profesores = Array.from(
        new Set(
          profResult.rows
            .map((r) => r.cedula_profesor || r.cedula_usuario)
            .filter(Boolean),
        ),
      );
      if (profesores.length === 0) continue;

      const fechaUltima = caso.fecha_ultima_actividad
        ? new Date(caso.fecha_ultima_actividad).toLocaleDateString("es-VE")
        : "(sin fecha)";

      for (const cedulaProfesor of profesores) {
        const tituloProf = `Alerta: Caso inactivo asignado #${caso.id_caso}`;
        const mensajeProf = `El caso #${caso.id_caso} ("${caso.tramite}") que supervisa no ha tenido actividad en los últimos 2 semestres. Última actividad: ${fechaUltima}`;
        const existeProf = await pool.query(existsUnreadSql, [
          cedulaProfesor,
          tituloProf,
        ]);
        if (existeProf.rowCount > 0) {
          continue;
        }
        await pool.query(createNotificationSql, [
          cedulaProfesor,
          senderId,
          tituloProf,
          mensajeProf,
        ]);
      }
    }

  } catch (err) {
    console.error("Error en el script:", err);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("[check-inactive-cases] Error:", error?.message ?? error);
  process.exit(1);
});
