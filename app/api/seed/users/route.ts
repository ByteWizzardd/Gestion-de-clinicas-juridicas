import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db/pool';
import { readFileSync } from 'fs';
import { join } from 'path';
import { logger } from '@/lib/utils/logger';

/**
 * POST /api/seed/users
 * Ejecuta el seed de usuarios y clientes
 * ⚠️ Solo para desarrollo - en producción ejecutar manualmente
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar que estemos en desarrollo
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, message: 'Este endpoint solo está disponible en desarrollo' },
        { status: 403 }
      );
    }

    // Leer el archivo de seed
    const seedPath = join(process.cwd(), 'database', 'seeds', 'seed-usuarios-clientes.sql');
    const seedSQL = readFileSync(seedPath, 'utf-8');

    // Dividir el SQL en statements individuales (separados por ;)
    // Filtrar comentarios y líneas vacías
    const statements = seedSQL
      .split(';')
      .map(stmt => {
        // Remover comentarios de línea (-- hasta el final de la línea)
        const lines = stmt.split('\n').map(line => {
          const commentIndex = line.indexOf('--');
          if (commentIndex !== -1) {
            return line.substring(0, commentIndex);
          }
          return line;
        });
        return lines.join('\n').trim();
      })
      .filter(stmt => {
        const trimmed = stmt.trim();
        return trimmed.length > 0 && 
               !trimmed.startsWith('/*') &&
               trimmed !== '==========================================================' &&
               !trimmed.match(/^--/);
      });

    // Ejecutar cada statement por separado
    for (const statement of statements) {
      if (statement.length > 0 && statement.trim().length > 0) {
        try {
          await pool.query(statement + ';');
        } catch (error: any) {
          // Ignorar errores de duplicados (ON CONFLICT ya los maneja)
          if (!error.message?.includes('duplicate key') && 
              error.code !== '23505' &&
              !error.message?.includes('already exists')) {
            logger.error('Error ejecutando statement:', statement.substring(0, 100));
            throw error;
          }
        }
      }
    }

    logger.info('Seed de usuarios ejecutado exitosamente');

    return NextResponse.json({
      success: true,
      message: 'Seed de usuarios ejecutado exitosamente',
      note: 'Todos los usuarios tienen la contraseña: password123',
    }, { status: 200 });
  } catch (error) {
    logger.error('Error al ejecutar seed de usuarios', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al ejecutar seed de usuarios',
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

