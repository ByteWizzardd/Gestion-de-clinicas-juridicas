/**
 * Puerta de acceso para el cliente de escritorio.
 *
 * El despliegue es público: cualquiera con la URL ve al menos la pantalla de
 * login. Esta puerta filtra ese ruido — bots, buscadores, curiosos — dejando
 * pasar solo a quien llega desde la app de escritorio, que se identifica con
 * un marcador en su User-Agent, o a quien trae la cookie de acceso.
 *
 * NO es un límite de seguridad. El marcador viaja dentro de un binario que se
 * distribuye y `strings app.exe` lo saca; replicarlo es un `curl -A`. El
 * límite real siguen siendo el login, los roles y la verificación de sesión en
 * cada Server Action. No quitar ninguna de esas comprobaciones confiando en
 * esta puerta.
 *
 * El módulo es puro y sin dependencias de Node para poder usarse desde el
 * middleware, que corre en el runtime Edge.
 */

/** Nombre del producto dentro del User-Agent. Debe coincidir con desktop/src-tauri/src/lib.rs */
export const MARCADOR_ESCRITORIO = 'ClinicaJuridicaDesktop';

/** Cookie que recuerda un acceso concedido desde un navegador normal. */
export const COOKIE_ACCESO = 'acceso_cliente';

/** Parámetro de la URL que concede ese acceso: `?acceso=<token>`. */
export const PARAM_ACCESO = 'acceso';

/** Duración de la cookie de acceso, en segundos (30 días). */
export const DURACION_ACCESO = 60 * 60 * 24 * 30;

/**
 * Un token corto sería adivinable y, peor, un valor de relleno olvidado en el
 * panel de Vercel parecería que la puerta está puesta cuando no lo está.
 */
const LARGO_MINIMO_TOKEN = 24;

const PATRON_MARCADOR = new RegExp(String.raw`${MARCADOR_ESCRITORIO}/[\d.]+ \(([^)]*)\)`);

/**
 * Token compartido entre el servidor y el binario de escritorio.
 *
 * Devuelve null cuando no está configurado, y eso **abre** la puerta a
 * propósito: si el código llegara a producción antes que la variable de
 * entorno, fallar cerrado dejaría fuera a todo el mundo, incluida la app de
 * escritorio. Como esto filtra ruido y no protege datos (de eso se encarga el
 * login), quedarse abierto es el modo degradado correcto.
 */
export function obtenerTokenEscritorio(): string | null {
  const token = process.env.DESKTOP_APP_TOKEN?.trim();

  if (!token || token.length < LARGO_MINIMO_TOKEN) {
    return null;
  }

  return token;
}

/**
 * Comparación en tiempo constante. `crypto.timingSafeEqual` no existe en el
 * runtime Edge, así que se compara a mano recorriendo siempre la cadena
 * completa.
 */
export function comparaEnTiempoConstante(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let diferencia = 0;
  for (let i = 0; i < a.length; i++) {
    diferencia |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return diferencia === 0;
}

/** ¿El User-Agent es el de la app de escritorio, con el token correcto? */
export function userAgentAutorizado(userAgent: string | null, token: string): boolean {
  if (!userAgent) {
    return false;
  }

  const encontrado = PATRON_MARCADOR.exec(userAgent);

  if (!encontrado) {
    return false;
  }

  return comparaEnTiempoConstante(encontrado[1], token);
}
