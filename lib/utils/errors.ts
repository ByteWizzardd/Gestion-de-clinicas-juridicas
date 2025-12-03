/**
 * Clase base para errores de la aplicación
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error de validación (400)
 * Se usa cuando los datos enviados no cumplen con las reglas de validación
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public fields?: Record<string, string[]>
  ) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

/**
 * Error cuando no se encuentra un recurso (404)
 */
export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404, 'NOT_FOUND');
  }
}

/**
 * Error de autenticación (401)
 * Se usa cuando el usuario no está autenticado
 */
export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * Error de autorización (403)
 * Se usa cuando el usuario no tiene permisos para la acción
 */
export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * Error de base de datos (500)
 * Se usa cuando hay un error al interactuar con la base de datos
 */
export class DatabaseError extends AppError {
  constructor(
    message: string,
    public originalError?: unknown
  ) {
    super(message, 500, 'DATABASE_ERROR');
  }
}

/**
 * Error de conflicto (409)
 * Se usa cuando hay un conflicto con el estado actual del recurso
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

