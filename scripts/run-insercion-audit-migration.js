import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Dividir SQL en sentencias individuales
function splitSQLStatements(sql) {
  const statements = [];
  let current = '';
  let inFunction = false;
  let dollarQuote = null;
  let depth = 0;

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const nextChar = sql[i + 1];

    // Detectar inicio de función ($$)
    if (char === '$' && nextChar === '$') {
      if (dollarQuote === null) {
        dollarQuote = '$$';
        inFunction = true;
        depth++;
      } else if (dollarQuote === '$$') {
        depth--;
        if (depth === 0) {
          dollarQuote = null;
          inFunction = false;
        }
      }
      current += char + nextChar;
      i++;
      continue;
    }

    current += char;

    // Si estamos dentro de una función, no dividir por punto y coma
    if (inFunction) {
      continue;
    }

    // Si encontramos un punto y coma fuera de una función, es el final de una sentencia
    if (char === ';' && !inFunction) {
      const trimmed = current.trim();
      if (trimmed && !trimmed.startsWith('--')) {
        statements.push(trimmed);
      }
      current = '';
    }
  }

  // Agregar última sentencia si queda algo
  if (current.trim() && !current.trim().startsWith('--')) {
    statements.push(current.trim());
  }

  return statements.filter(s => s.length > 0);
}

async function runMigration() {
  try {
    console.log('📦 Ejecutando migración: add-auditoria-insercion-catalogos.sql');
    
    const migrationPath = join(__dirname, '..', 'database', 'migrations', 'add-auditoria-insercion-catalogos.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    const statements = splitSQLStatements(migrationSQL);
    
    console.log(`📝 Encontradas ${statements.length} sentencias SQL`);
    
    // Mostrar las sentencias (solo las primeras 3 para debug)
    statements.slice(0, 3).forEach((stmt, idx) => {
      console.log(`\n--- Sentencia ${idx + 1} (primeros 100 caracteres) ---`);
      console.log(stmt.substring(0, 100) + '...');
    });
    
    console.log('\n✅ Script preparado. Ejecuta las sentencias manualmente en Neon o usa el MCP.');
    console.log('💡 Usa mcp_Gestion-de-clinicas-juridicas-Neon_run_sql_transaction con las sentencias divididas.');
    
  } catch (error) {
    console.error('❌ Error al procesar migración:', error.message);
    process.exit(1);
  }
}

runMigration();
