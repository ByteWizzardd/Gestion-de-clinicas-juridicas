import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Directorio base donde se encuentran los archivos SQL
 */
const SQL_BASE_DIR = join(process.cwd(), 'database', 'queries');

/**
 * Carga un archivo SQL desde el sistema de archivos
 * 
 * @param filename Nombre del archivo SQL (con o sin extensión .sql)
 *                 Puede incluir subcarpetas: 'casos/get-all.sql'
 * @returns Contenido del archivo SQL como string
 * @throws Error si el archivo no existe
 * 
 * @example
 * const query = loadSQL('casos/get-all.sql');
 * const result = await pool.query(query);
 */
export function loadSQL(filename: string): string {
  // Asegurar que tiene extensión .sql
  const sqlFile = filename.endsWith('.sql') ? filename : `${filename}.sql`;
  const filePath = join(SQL_BASE_DIR, sqlFile);
  
  try {
    const sql = readFileSync(filePath, 'utf-8');
    return sql.trim(); // Remover espacios en blanco al inicio/final
  } catch (error) {
    throw new Error(
      `No se pudo cargar el archivo SQL: ${filePath}. ` +
      `Asegúrate de que el archivo existe en database/queries/`
    );
  }
}

/**
 * Carga múltiples archivos SQL y los retorna como un objeto
 * Útil para cargar todas las queries de un módulo a la vez
 * 
 * @param filenames Array de nombres de archivos SQL
 * @returns Objeto con los nombres de archivos como keys y el SQL como valores
 * 
 * @example
 * const queries = loadSQLFiles(['casos/get-all.sql', 'casos/get-by-id.sql']);
 * // { 'get-all': 'SELECT * FROM...', 'get-by-id': 'SELECT * FROM...' }
 */
export function loadSQLFiles(filenames: string[]): Record<string, string> {
  const queries: Record<string, string> = {};
  
  for (const filename of filenames) {
    const key = filename.replace('.sql', '').split('/').pop() || filename;
    queries[key] = loadSQL(filename);
  }
  
  return queries;
}

