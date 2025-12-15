import { NextRequest, NextResponse } from 'next/server';
import { ClientesService } from '../../../../lib/services/clientes/clientes.service';
import { requireApiAuth } from '@/lib/utils/api-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cedula: string }> | { cedula: string } }
): Promise<NextResponse> {
  try {
    const unauthorized = requireApiAuth(request);
    if (unauthorized) return unauthorized;

    // Handle both Promise and direct params (Next.js 15 compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;
    const { cedula } = resolvedParams;
    
    if (!cedula) {
      return NextResponse.json(
        {
          success: false,
          message: 'Cédula del cliente es requerida',
        },
        { status: 400 }
      );
    }

    const cliente = await ClientesService.getClienteCompleto(cedula);

    if (!cliente) {
      return NextResponse.json(
        {
          success: false,
          message: 'Cliente no encontrado',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: cliente,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('[ClientesRoute] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    const errorStack = error instanceof Error ? error.stack : undefined;

    return NextResponse.json(
      {
        success: false,
        message: 'No se pudo obtener el cliente',
        error: errorMessage,
        stack: errorStack,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

