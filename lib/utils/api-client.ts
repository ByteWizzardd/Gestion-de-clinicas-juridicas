/**
 * Utilidad para centralizar llamadas a la API con cabecera de autorización.
 *
 * - En desarrollo: no agrega ningún header extra (para no complicar el flujo local).
 * - En producción (navegador): si existe NEXT_PUBLIC_INTERNAL_API_TOKEN,
 *   agrega: Authorization: Bearer <NEXT_PUBLIC_INTERNAL_API_TOKEN>
 */
export function getApiHeaders(
  headers: HeadersInit = {}
): HeadersInit {
  // En el servidor podemos usar process.env normalmente,
  // en el cliente solo estarán disponibles las variables NEXT_PUBLIC_*
  const isBrowser = typeof window !== 'undefined';

  if (process.env.NODE_ENV === 'production') {
    const token = process.env.NEXT_PUBLIC_INTERNAL_API_TOKEN;

    if (token && isBrowser) {
      return {
        ...headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  return headers;
}


