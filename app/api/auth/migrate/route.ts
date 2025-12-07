import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db/pool';
import { readFileSync } from 'fs';
import { join } from 'path';
import { logger } from '@/lib/utils/logger';

/**
 * POST /api/auth/migrate
 * Ejecuta la migración para agregar password_hash a usuarios
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

    // Leer el archivo de migración
    const migrationPath = join(process.cwd(), 'database', 'migrations', 'add-password-to-usuarios.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    // Ejecutar la migración
    await pool.query(migrationSQL);

    logger.info('Migración ejecutada exitosamente');

    return NextResponse.json({
      success: true,
      message: 'Migración ejecutada exitosamente',
    }, { status: 200 });
  } catch (error) {
    logger.error('Error al ejecutar migración', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al ejecutar migración',
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

