import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/db/pool';

/**
 * GET /api/health/db
 * Endpoint para verificar la conexión a la base de datos
 */
export async function GET() {
  try {
    const status = await testConnection();
    
    if (status.connected) {
      return NextResponse.json({
        success: true,
        message: 'Conexión a la base de datos exitosa',
        data: {
          timestamp: status.timestamp,
          version: status.version,
        },
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Error de conexión a la base de datos',
        error: status.error,
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Error al verificar conexión',
      error: error instanceof Error ? error.message : 'Error desconocido',
    }, { status: 500 });
  }
}

