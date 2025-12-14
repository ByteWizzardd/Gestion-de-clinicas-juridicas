import { NextRequest } from 'next/server';
import { authService } from '@/lib/services/auth/auth.service';
import { successResponse, errorResponse } from '@/lib/utils/responses';
import { jwtExpiresInToSeconds } from '@/lib/utils/security';

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

/**
 * POST /api/auth/login
 * Inicia sesión de un usuario
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await authService.login(body);

    // Crear respuesta con token en cookie
    const response = successResponse(result, 200);
    
    // Configurar cookie HTTP-only para el token
    // Sincronizar el tiempo de expiración de la cookie con el del JWT
    const cookieMaxAge = jwtExpiresInToSeconds(JWT_EXPIRES_IN);
    response.cookies.set('auth_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: cookieMaxAge,
      path: '/',
    });

    return response;
  } catch (error) {
    return errorResponse(error);
  }
}

