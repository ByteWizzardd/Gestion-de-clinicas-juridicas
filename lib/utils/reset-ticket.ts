/**
 * Comprobante de verificación para el restablecimiento de contraseña.
 *
 * El flujo tiene tres pasos (pedir código -> verificar código -> nueva
 * contraseña) y cada paso es una Server Action, es decir, un endpoint HTTP
 * independiente. Sin este comprobante el último paso no tendría forma de saber
 * que el segundo ocurrió: bastaría con invocarlo directamente con una cédula
 * ajena.
 *
 * El comprobante se firma con una clave DERIVADA del JWT_SECRET, no con el
 * secreto mismo. Así un comprobante de reseteo nunca puede presentarse como
 * cookie de sesión, ni al revés, aunque alguien confunda los dos.
 */

import crypto from 'crypto';
import jwt, { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { getJwtSecret } from './security';
import { logger } from './logger';

const PROPOSITO = 'password_reset';
const ALGORITMO = 'HS256' as const;

/** Ventana para escribir la contraseña nueva tras acertar el código. */
export const TICKET_TTL_SEGUNDOS = 15 * 60;

export interface ResetTicketPayload {
  /** Cédula del usuario que restablece. Nunca viene del cliente. */
  cedula: string;
  /** Fila de password_reset_tokens que se consumirá. Da un solo uso. */
  idToken: number;
}

interface ResetTicketClaims {
  sub: string;
  jti: string;
  proposito: string;
}

/**
 * Clave de firma exclusiva de este propósito.
 */
function claveDeTicket(): string {
  return crypto
    .createHmac('sha256', getJwtSecret())
    .update(PROPOSITO)
    .digest('hex');
}

/**
 * Emite un comprobante tras verificar correctamente el código.
 */
export function emitirResetTicket(payload: ResetTicketPayload): string {
  return jwt.sign(
    {
      sub: payload.cedula,
      jti: String(payload.idToken),
      proposito: PROPOSITO,
    },
    claveDeTicket(),
    {
      expiresIn: TICKET_TTL_SEGUNDOS,
      algorithm: ALGORITMO,
    }
  );
}

/**
 * Valida un comprobante y devuelve a quién pertenece.
 *
 * @returns el payload, o null si el comprobante es inválido, ajeno o venció
 */
export function verificarResetTicket(ticket: string): ResetTicketPayload | null {
  if (!ticket || typeof ticket !== 'string') {
    return null;
  }

  try {
    const claims = jwt.verify(ticket, claveDeTicket(), {
      algorithms: [ALGORITMO],
    }) as unknown as ResetTicketClaims;

    // Cinturón y tirantes: la clave derivada ya impide reutilizar un token de
    // sesión aquí, pero el propósito se comprueba igual.
    if (claims.proposito !== PROPOSITO) {
      logger.error('[resetTicket] Comprobante con propósito incorrecto');
      return null;
    }

    const idToken = Number.parseInt(claims.jti, 10);
    if (!claims.sub || !Number.isInteger(idToken)) {
      logger.error('[resetTicket] Comprobante sin cédula o sin id de token');
      return null;
    }

    return { cedula: claims.sub, idToken };
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      logger.error('[resetTicket] Comprobante vencido');
    } else if (error instanceof JsonWebTokenError) {
      logger.error('[resetTicket] Comprobante inválido');
    } else {
      logger.error('[resetTicket] Error al verificar el comprobante', error);
    }
    return null;
  }
}
