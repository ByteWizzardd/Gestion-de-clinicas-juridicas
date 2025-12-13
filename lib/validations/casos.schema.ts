import { z } from 'zod';
import { TRAMITES, ESTATUS_CASO } from '@/lib/constants/status';

/**
 * Schema de validación para crear un caso
 */
export const CreateCasoSchema = z.object({
  fecha_solicitud: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida. Formato: YYYY-MM-DD').optional(),
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
  cedula_cliente: z.string().min(1, 'La cédula del cliente es requerida'),
  id_nucleo: z.number().int().positive('El núcleo es requerido'),
  id_ambito_legal: z.number().int().positive('El ámbito legal es requerido'),
  id_expediente: z.string().optional().nullable(),
});

export type CreateCasoInput = z.infer<typeof CreateCasoSchema>;

