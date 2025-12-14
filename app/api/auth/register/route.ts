import { NextRequest } from 'next/server';
import { authService } from '@/lib/services/auth/auth.service';
import { successResponse, errorResponse } from '@/lib/utils/responses';
import { jwtExpiresInToSeconds } from '@/lib/utils/security';

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

/**
 * POST /api/auth/register
 * Registra un nuevo usuario
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extraer nombre completo y dividirlo en nombres y apellidos
    const nombreCompleto = body.nombreCompleto || '';
    const partesNombre = nombreCompleto.trim().split(' ');
    const nombres = partesNombre.slice(0, Math.ceil(partesNombre.length / 2)).join(' ');
    const apellidos = partesNombre.slice(Math.ceil(partesNombre.length / 2)).join(' ') || nombres;

    const result = await authService.register({
      cedula: body.cedula || '',
      correo: body.correo || body.correoInstitucional || '',
      password: body.password || body.contraseña || '',
      confirmPassword: body.confirmPassword || body.confirmarContraseña || '',
      nombreCompleto: nombreCompleto,
      // Solo pasar rolSistema si viene explícitamente en el body
      // Si no viene, el servicio lo determinará automáticamente según el dominio del correo
      rolSistema: body.rolSistema || undefined,
    });

    // Crear respuesta con token en cookie
    const response = successResponse(result, 201);
    
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

