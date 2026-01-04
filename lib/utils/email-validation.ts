/**
 * Valida que el correo electrónico tenga un dominio UCAB válido
 * @param email - Correo electrónico a validar
 * @returns true si el correo tiene dominio @est.ucab.edu.ve o @ucab.edu.ve
 */
export function validateEmailDomain(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  const trimmed = email.trim().toLowerCase();
  return trimmed.endsWith('@est.ucab.edu.ve') || trimmed.endsWith('@ucab.edu.ve');
}

/**
 * Valida el formato básico de un correo electrónico
 * @param email - Correo electrónico a validar
 * @returns true si el formato es válido
 */
export function validateEmailFormat(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Valida tanto el formato como el dominio del correo electrónico UCAB
 * @param email - Correo electrónico a validar
 * @returns true si el formato y dominio son válidos
 */
export function validateUCABEmail(email: string): boolean {
  return validateEmailFormat(email) && validateEmailDomain(email);
}
