/**
 * Códigos de error estándar de la aplicación
 */
export const ERROR_CODES = {
  // Errores de validación
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Errores de autenticación y autorización
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  
  // Errores de recursos
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  
  // Errores de base de datos
  DATABASE_ERROR: 'DATABASE_ERROR',
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  QUERY_ERROR: 'QUERY_ERROR',
  
  // Errores del servidor
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

