import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/utils/security';
import { authQueries } from '@/lib/db/queries/auth/auth.queries';
import { successResponse, errorResponse } from '@/lib/utils/responses';
import { UnauthorizedError } from '@/lib/utils/errors';

/**
 * GET /api/auth/me
 * Obtiene la información del usuario autenticado desde el token en la cookie
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener token de la cookie
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      throw new UnauthorizedError('No hay sesión activa');
    }

    // Verificar token
    const decoded = await verifyToken(token);

    // Obtener información completa del usuario
    const user = await authQueries.getUserByCedula(decoded.cedula);

    if (!user) {
      throw new UnauthorizedError('Usuario no encontrado');
    }

    return successResponse({
      cedula: user.cedula,
      nombres: user.nombres,
      apellidos: user.apellidos,
      correo: user.correo_electronico,
      rol: user.rol_sistema || decoded.rol,
    }, 200);
  } catch (error) {
    return errorResponse(error);
  }
}

