import { NextRequest } from 'next/server';
import { authService } from '@/lib/services/auth/auth.service';
import { successResponse, errorResponse } from '@/lib/utils/responses';

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
    response.cookies.set('auth_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/',
    });

    return response;
  } catch (error) {
    return errorResponse(error);
  }
}

