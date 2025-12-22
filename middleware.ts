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
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  const isAuthPage = pathname.startsWith('/auth');
  const isDashboardPage = pathname.startsWith('/dashboard');

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

  // Si está en auth con token → redirigir a dashboard
  // La verificación real del token se hace en getCurrentUserAction
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Permitir acceso normal
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/:path*',
  ],
};

