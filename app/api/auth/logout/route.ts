import { NextRequest, NextResponse } from 'next/server';
import { successResponse } from '@/lib/utils/responses';

/**
 * POST /api/auth/logout
 * Cierra la sesión del usuario eliminando la cookie
 */
export async function POST(request: NextRequest) {
  const response = successResponse(
    { message: 'Sesión cerrada exitosamente' },
    200
  );

  // Eliminar la cookie de autenticación
  response.cookies.set('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Expirar inmediatamente
    path: '/',
  });

  return response;
}

