import { Pool } from 'pg';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const filePath = join(__dirname, '..', file);
    if (existsSync(filePath)) {
      console.log(`Cargando variables de ${file}`);
      const content = readFileSync(filePath, 'utf-8');
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

loadEnv();

if (!process.env.DATABASE_URL) {
  console.error('Error: DATABASE_URL no está definida');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    console.log('Iniciando verificación de casos inactivos...');

    // 1. Cargar Queries
    const getInactiveCasesSql = readFileSync(
      join(__dirname, '../database/queries/casos/get-inactive-cases.sql'),
      'utf-8'
    );
    const getCoordinatorsSql = readFileSync(
      join(__dirname, '../database/queries/usuarios/get-all-coordinators.sql'),
      'utf-8'
    );
    const createNotificationSql = readFileSync(
      join(__dirname, '../database/queries/notificaciones/create.sql'),
      'utf-8'
    );
    const existsUnreadSql = readFileSync(
      join(__dirname, '../database/queries/notificaciones/exists-unread.sql'),
      'utf-8'
    );

    // 2. Obtener Coordinadores (para enviarles las notificaciones)
    const coordsResult = await pool.query(getCoordinatorsSql);
    const coordinadores = coordsResult.rows;

    if (coordinadores.length === 0) {
      console.log('No se encontraron coordinadores activos. Abortando.');
      return;
    }

    // Usaremos al primer coordinador como "remitente" si no hay usuario sistema,
    // o idealmente deberíamos tener un usuario sistema.
    // Por ahora usaremos el mismo receptor como emisor o el primero de la lista.
    const senderId = coordinadores[0].cedula; 

    // 3. Buscar Casos Inactivos
    // Nota: El query get-inactive-cases.sql ya maneja la lógica de semestres internamente
    // y no requiere parámetros para la opción por defecto (usando semestres).
    const inactiveResult = await pool.query(getInactiveCasesSql);
    const inactiveCases = inactiveResult.rows;

    console.log(`Se encontraron ${inactiveCases.length} casos inactivos.`);
    console.log('IDs de casos inactivos:', inactiveCases.map(c => c.id_caso));

    // Notificación resumen a coordinadores
    const cantidadInactivos = inactiveCases.length;
    const titulo = "Casos inactivos";
    const mensaje = `Actualmente hay ${cantidadInactivos} casos inactivos de los 2 últimos semestres. Los casos son: ${inactiveCases.map((c) => c.id_caso).join(', ')}.`;

    for (const coord of coordinadores) {
      try {
        const existeResultado = await pool.query(existsUnreadSql, [coord.cedula, titulo]);
        if (existeResultado.rowCount > 0) {
          console.log(`[SKIP] El coordinador ${coord.cedula} ya tiene una notificación resumen pendiente.`);
          continue;
        }
        await pool.query(createNotificationSql, [
          coord.cedula,
          senderId,
          titulo,
          mensaje
        ]);
        console.log(`[ENVIADO] Notificación resumen enviada al coordinador ${coord.cedula}.`);
      } catch (notifError) {
        console.error(`Error enviando notificación a ${coord.cedula}:`, notifError.message);
      }
    }

    // Notificación individual a profesores supervisores de cada caso inactivo
    const getProfSupervisoresSql = readFileSync(
      join(__dirname, '../database/queries/casos/get-profesors-sup.sql'),
      'utf-8'
    );
    for (const caso of inactiveCases) {
      const profResult = await pool.query(getProfSupervisoresSql, [caso.id_caso]);
      const profesores = profResult.rows.map(r => r.cedula_profesor || r.cedula_usuario).filter(Boolean);
      for (const cedulaProfesor of profesores) {
        const tituloProf = `Alerta: Caso inactivo asignado #${caso.id_caso}`;
        const mensajeProf = `El caso #${caso.id_caso} ("${caso.tramite}") que supervisa no ha tenido actividad en los últimos 2 semestres. Última actividad: ${new Date(caso.fecha_ultima_actividad).toLocaleDateString()}`;
        const existeProf = await pool.query(existsUnreadSql, [cedulaProfesor, tituloProf]);
        if (existeProf.rowCount > 0) {
          console.log(`[SKIP] El profesor ${cedulaProfesor} ya tiene alerta pendiente para el caso ${caso.id_caso}.`);
          continue;
        }
        await pool.query(createNotificationSql, [
          cedulaProfesor,
          senderId,
          tituloProf,
          mensajeProf
        ]);
        console.log(`[ENVIADO] Notificación enviada al profesor ${cedulaProfesor} sobre caso ${caso.id_caso}.`);
      }
    }

    console.log('Verificación completada exitosamente.');

  } catch (err) {
    console.error('Error en el script:', err);
  } finally {
    await pool.end();
  }
}

main();
