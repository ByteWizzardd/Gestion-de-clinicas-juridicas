/**
 * Tipos para requests y responses de la API
 */

/**
 * Formato estándar de respuesta exitosa
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * Formato estándar de respuesta de error
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    fields?: Record<string, string[]>;
  };
}

/**
 * Tipo union para todas las respuestas de la API
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Parámetros de paginación
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Respuesta paginada
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Parámetros de filtrado comunes
 */
export interface FilterParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

