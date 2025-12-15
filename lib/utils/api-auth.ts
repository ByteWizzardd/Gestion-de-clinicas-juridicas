import { NextRequest, NextResponse } from 'next/server';

/**
 * Autenticación simple para endpoints internos basada en JWT_SECRET.
 *
 * - En **desarrollo** (NODE_ENV !== 'production') no aplica ningún chequeo,
 *   para no romper el flujo local mientras se desarrolla.
 * - En **producción**:
 *   - Requiere header: Authorization: Bearer <token>
 *   - El <token> debe ser exactamente process.env.JWT_SECRET
 *
 * Si la validación falla, retorna un NextResponse 401.
 * Si es válida (o está desactivada), retorna null.
 */
export function requireApiAuth(request: NextRequest) {
  const nodeEnv = process.env.NODE_ENV;
  const jwtSecret = process.env.JWT_SECRET;

  // En desarrollo no forzamos auth para no romper el flujo local
  if (nodeEnv !== 'production') {
    return null;
  }

  // Si en producción no hay JWT_SECRET configurado, no podemos validar
  if (!jwtSecret) {
    console.warn(
      '[requireApiAuth] JWT_SECRET no está configurado. No se aplicará autenticación en este endpoint.'
    );
    return null;
  }

  const authHeader = request.headers.get('authorization') || '';
  const [type, token] = authHeader.split(' ');

  if (type !== 'Bearer' || !token || token !== jwtSecret) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'No autorizado',
          code: 'UNAUTHORIZED',
        },
      },
      { status: 401 }
    );
  }

  return null;
}


