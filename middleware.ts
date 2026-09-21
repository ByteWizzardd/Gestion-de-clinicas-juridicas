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

/**
 * Página de "no existe" para quien no pasa la puerta.
 *
 * Es una copia del 404 por defecto de Next.js, a propósito y palabra por
 * palabra: un "404" pelado delata que alguien escribió ese texto a mano, y
 * cualquier página propia — aunque diga poco — confirma que ahí vive algo. Así
 * el dominio se ve igual que cualquiera de los miles de despliegues de Next
 * con una ruta que no existe.
 *
 * Por lo mismo no lleva favicon ni nada en español.
 */
const PAGINA_NO_EXISTE = `<!DOCTYPE html>
<html>
<head>
<title>404: This page could not be found.</title>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
<div style="font-family:system-ui,&quot;Segoe UI&quot;,Roboto,Helvetica,Arial,sans-serif,&quot;Apple Color Emoji&quot;,&quot;Segoe UI Emoji&quot;;height:100vh;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center">
<div>
<style>body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}</style>
<h1 class="next-error-h1" style="display:inline-block;margin:0 20px 0 0;padding:0 23px 0 0;font-size:24px;font-weight:500;vertical-align:top;line-height:49px">404</h1>
<div style="display:inline-block"><h2 style="font-size:14px;font-weight:400;line-height:49px;margin:0">This page could not be found.</h2></div>
</div>
</div>
</body>
</html>
`;

/** Respuesta para quien no pasa la puerta: el 404 de un sitio cualquiera. */
function noEncontrado(): NextResponse {
  return new NextResponse(PAGINA_NO_EXISTE, {
    status: 404,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      // Sin X-Robots-Tag a proposito: un 404 no se indexa igual, y la
      // cabecera delataria a un dominio que se esconde. El noindex se pone
      // mas abajo, solo en lo que pasa la puerta.
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

/** Lógica de sesión: la de siempre, ya del otro lado de la puerta. */
function enrutar(request: NextRequest): NextResponse {
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

export async function middleware(request: NextRequest) {
  const cortada = puertaEscritorio(request);
  if (cortada) {
    return cortada;
  }

  const respuesta = enrutar(request);
  // El sistema no tiene nada que buscar desde fuera. Va aquí y no en
  // next.config.ts para que la cabecera acompañe solo a las respuestas reales
  // y el 404 de la puerta siga pareciendo el de un sitio cualquiera.
  respuesta.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return respuesta;
}

/**
 * La puerta de escritorio tiene que ver todo el sitio, no solo /auth y
 * /dashboard, así que el matcher pasó a ser "todo salvo los estáticos".
 *
 * Quedan fuera solo los recursos que sirve Next.js para pintar una página
 * (nombres con hash, no enumerables) y robots.txt, que debe seguir siendo
 * legible por los buscadores justamente para pedirles que no indexen.
 *
 * favicon.ico SÍ pasa por la puerta: es el icono de la clínica, 25 KB que
 * confirman de qué es el dominio a cualquiera que lo pida.
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|robots.txt).*)',
  ],
};
