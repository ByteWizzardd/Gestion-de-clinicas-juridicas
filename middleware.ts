import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware de Next.js para manejar autenticación automáticamente
 * 
 * - Protege rutas /dashboard/* requiriendo autenticación (verifica existencia del token)
 * - Redirige usuarios no autenticados a /auth/login
 * - Redirige usuarios autenticados desde /auth/* a /dashboard
 * 
 * Nota: La verificación real del token se hace en las Server Actions que pueden usar Node.js runtime.
 * Este middleware solo verifica la existencia del token para evitar redirecciones innecesarias.
 */
export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  const isAuthPage = pathname.startsWith('/auth');
  const isDashboardPage = pathname.startsWith('/dashboard');
  const hasInvalidTokenParam = searchParams.get('invalid_token') === 'true';

  // Si está en dashboard sin token → redirigir a login
  if (isDashboardPage && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si está en dashboard con token → permitir acceso (la verificación real se hace en Server Actions)
  if (isDashboardPage && token) {
    return NextResponse.next();
  }

  // Si está en auth sin token → permitir acceso normal (navegación entre login/register)
  if (isAuthPage && !token) {
    return NextResponse.next();
  }

  // Si está en auth con token pero viene de invalid_token → permitir acceso (el layout ya limpió la cookie)
  // Esto evita loops de redirección cuando el token es inválido
  if (isAuthPage && token && hasInvalidTokenParam) {
    return NextResponse.next();
  }

  // Si está en auth con token válido → redirigir a dashboard
  // Solo redirigir desde la página principal de auth, no desde login/register específicos
  // para permitir que usuarios autenticados puedan hacer logout si lo desean
  if (isAuthPage && token && pathname === '/auth') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Permitir acceso normal a todas las demás rutas de auth (login, register, etc.)
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/:path*',
  ],
};

