import { NextRequest, NextResponse } from 'next/server';
import { soportesQueries } from '@/lib/db/queries/soportes/soportes.queries';
import { successResponse, errorResponse } from '@/lib/utils/responses';
import { verifyToken } from '@/lib/utils/security';
import { UnauthorizedError, ValidationError } from '@/lib/utils/errors';
import { requireApiAuth } from '@/lib/utils/api-auth';

/**
 * POST /api/casos/[id]/soportes
 * Sube uno o más soportes/documentos para un caso
 * Requiere autenticación
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unauthorized = requireApiAuth(request);
    if (unauthorized) return unauthorized;

    // Obtener token de la cookie
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      throw new UnauthorizedError('No hay sesión activa');
    }

    // Verificar token
    await verifyToken(token);

    // En Next.js 13+, params es una Promise
    const resolvedParams = await params;
    const idCaso = parseInt(resolvedParams.id);
    
    if (isNaN(idCaso)) {
      throw new ValidationError('ID de caso inválido');
    }

    // Obtener FormData del request
    const formData = await request.formData();
    const files = formData.getAll('archivos') as File[];

    if (files.length === 0) {
      throw new ValidationError('No se proporcionaron archivos');
    }

    // Procesar cada archivo
    const resultados = [];
    for (const file of files) {
      if (!file || file.size === 0) {
        continue;
      }

      // Convertir el archivo a Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Crear el soporte en la base de datos
      const soporte = await soportesQueries.create({
        id_caso: idCaso,
        documento_data: buffer,
        nombre_archivo: file.name,
        tipo_mime: file.type || 'application/octet-stream',
        descripcion: undefined,
        fecha_consignacion: new Date(),
      });

      resultados.push({
        num_soporte: soporte.num_soporte,
        nombre_archivo: soporte.nombre_archivo,
      });
    }

    return successResponse({
      mensaje: `${resultados.length} archivo(s) subido(s) correctamente`,
      soportes: resultados,
    }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}

