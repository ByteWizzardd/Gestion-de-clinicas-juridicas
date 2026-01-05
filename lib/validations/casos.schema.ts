import { z } from 'zod';
import { TRAMITES, ESTATUS_CASO } from '@/lib/constants/status';

/**
 * Schema de validación para crear un caso
 */
export const CreateCasoSchema = z.object({
  fecha_solicitud: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida. Formato: YYYY-MM-DD').optional(),
  fecha_inicio_caso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida. Formato: YYYY-MM-DD'),
  tramite: z.enum([
    TRAMITES.ASESORIA,
    TRAMITES.CONCILIACION_MEDIACION,
    TRAMITES.REDACCION_DOCUMENTOS,
    TRAMITES.ASISTENCIA_JUDICIAL,
  ] as [string, ...string[]], {
    errorMap: () => ({ message: 'Trámite inválido' }),
  }),
  estatus: z.enum([
    ESTATUS_CASO.EN_PROCESO,
    ESTATUS_CASO.ARCHIVADO,
    ESTATUS_CASO.ENTREGADO,
    ESTATUS_CASO.ASESORIA,
  ] as [string, ...string[]], {
    errorMap: () => ({ message: 'Estatus inválido' }),
  }),
  observaciones: z.string().optional().nullable(),
  cedula: z.string().min(1, 'La cédula del solicitante es requerida'),
  id_nucleo: z.number().int().positive('El núcleo es requerido'),
  id_materia: z.number().int().positive('La materia es requerida'),
  num_categoria: z.number().int().nonnegative('La categoría debe ser un número no negativo').default(0),
  num_subcategoria: z.number().int().nonnegative('La subcategoría debe ser un número no negativo').default(0),
  num_ambito_legal: z.number().int().positive('El ámbito legal es requerido'),
});

export type CreateCasoInput = z.infer<typeof CreateCasoSchema>;

/**
 * Schema de validación para actualizar un caso
 */
export const UpdateCasoSchema = z.object({
  id_caso: z.number().int().positive(),
  fecha_solicitud: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida. Formato: YYYY-MM-DD').optional(),
  fecha_fin_caso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida. Formato: YYYY-MM-DD').optional().nullable(),
  tramite: z.enum([
    TRAMITES.ASESORIA,
    TRAMITES.CONCILIACION_MEDIACION,
    TRAMITES.REDACCION_DOCUMENTOS,
    TRAMITES.ASISTENCIA_JUDICIAL,
  ] as [string, ...string[]]).optional(),
  observaciones: z.string().optional().nullable(),
  // Nota: La cédula del solicitante generalmente no se actualiza, pero si fuera necesario se agregaría aquí
  // Nota: El estatus se maneja por separado
  id_nucleo: z.number().int().positive().optional(),
  id_materia: z.number().int().positive().optional(),
  num_categoria: z.number().int().nonnegative().optional(),
  num_subcategoria: z.number().int().nonnegative().optional(),
  num_ambito_legal: z.number().int().positive().optional(),
});

export type UpdateCasoInput = z.infer<typeof UpdateCasoSchema>;
