import { cookies } from 'next/headers';

/**
 * Obtiene el token de autenticación (auth_token) de las cookies.
 * Retorna el valor del token o null si no existe.
 */
export async function getAuthTokenFromCookies(): Promise<string | null> {
  const cookieStore = cookies();
  return (await cookieStore).get('auth_token')?.value || null;
}
