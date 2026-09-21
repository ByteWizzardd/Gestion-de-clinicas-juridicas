import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  COOKIE_ACCESO,
  DURACION_ACCESO,
  PARAM_ACCESO,
  comparaEnTiempoConstante,
  obtenerTokenEscritorio,
  userAgentAutorizado,
} from '@/lib/utils/desktop-gate';

/**
 * Middleware de Next.js. Hace dos cosas, en este orden:
 *
 * 1. Puerta de escritorio: descarta el tráfico que no viene de la app nativa.
 * 2. Autenticación: protege /dashboard/* y redirige según haya token o no.
 *
 * Nota: la verificación real del token de sesión se hace en las Server Actions,
 * que pueden usar el runtime de Node.js. Aquí solo se comprueba que la cookie
 * exista, para evitar redirecciones innecesarias.
 */

/** Respuesta para quien no pasa la puerta: 404 seco, sin pistas de qué hay detrás. */
function noEncontrado(): NextResponse {
  return new NextResponse('404', {
    status: 404,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'x-robots-tag': 'noindex, nofollow',
      'cache-control': 'no-store',
    },
  });
}

/**
 * Deja pasar solo a la app de escritorio.
 *
 * Devuelve null cuando la petición puede seguir su curso, o la respuesta que
 * corta el paso. Ver lib/utils/desktop-gate.ts: esto filtra ruido, no protege
 * datos.
 *
 * Salida de emergencia para abrir la app en un navegador normal (demos,
 * soporte): visitar cualquier ruta con `?acceso=<DESKTOP_APP_TOKEN>`. Deja la
 * cookie puesta 30 días. El token queda escrito en los registros de acceso del
 * servidor, así que conviene rotarlo después de usarla en público.
 */
function puertaEscritorio(request: NextRequest): NextResponse | null {
  // En desarrollo se trabaja desde el navegador: la puerta estorbaría.
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  const token = obtenerTokenEscritorio();

  // Sin token configurado la puerta queda abierta, a propósito.
  if (!token) {
    return null;
  }

  if (userAgentAutorizado(request.headers.get('user-agent'), token)) {
    return null;
  }

  const acceso = request.cookies.get(COOKIE_ACCESO)?.value;
  if (acceso && comparaEnTiempoConstante(acceso, token)) {
    return null;
  }

  const solicitado = request.nextUrl.searchParams.get(PARAM_ACCESO);
  if (solicitado && comparaEnTiempoConstante(solicitado, token)) {
    // Se quita el parámetro de la URL para que no quede en el historial ni se
    // comparta al copiar el enlace.
    const destino = request.nextUrl.clone();
    destino.searchParams.delete(PARAM_ACCESO);

    const respuesta = NextResponse.redirect(destino);
    respuesta.cookies.set(COOKIE_ACCESO, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: DURACION_ACCESO,
    });
    return respuesta;
  }

  return noEncontrado();
}

export async function middleware(request: NextRequest) {
  const cortada = puertaEscritorio(request);
  if (cortada) {
    return cortada;
  }

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

/**
 * La puerta de escritorio tiene que ver todo el sitio, no solo /auth y
 * /dashboard, así que el matcher pasó a ser "todo salvo los estáticos".
 *
 * Quedan fuera los recursos que sirve Next.js para pintar una página y
 * robots.txt, que debe seguir siendo legible por los buscadores justamente
 * para pedirles que no indexen.
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt).*)',
  ],
};
