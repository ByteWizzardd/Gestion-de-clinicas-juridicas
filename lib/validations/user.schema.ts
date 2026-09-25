import { z } from 'zod';
import { validateEmailDomain } from '@/lib/utils/email-validation';
import { validatePhone } from '@/lib/utils/phone';

/**
 * Schema de validación para actualizar un usuario completo
 */
export const UpdateUserSchema = z.object({
  cedula: z.string().min(1, 'La cédula es requerida'),
}).extend({
  nombres: z.string().min(1, 'El nombre(s) son requeridos').optional(),
  apellidos: z.string().min(1, 'El apellido(s) son requeridos').optional(),
  nombre_usuario: z.string().min(1, 'El nombre de usuario es requerido').optional(),
  tipo_usuario: z.enum(['Estudiante', 'Profesor', 'Coordinador'], {
    errorMap: () => ({ message: 'Tipo de usuario inválido' }),
  }).optional(),
  correo_electronico: z.string()
    .email('Correo electrónico inválido')
    .refine((val) => {
      if (!val || val.trim() === '') {
        return true; // Es opcional
      }
      return validateEmailDomain(val);
    }, {
      message: 'El correo debe tener dominio @est.ucab.edu.ve o @ucab.edu.ve'
    })
    .optional(),
  telefono: z.string().optional().superRefine((val, ctx) => {
    const error = validatePhone(val);
    if (error) ctx.addIssue({ code: z.ZodIssueCode.custom, message: error });
  }),
  estudiante: z.object({
    tipo_estudiante: z.enum(['Voluntario', 'Inscrito', 'Egresado', 'Servicio Comunitario']).optional().nullable(),
    nrc: z.string().min(1, 'El NRC es requerido').optional(),
    term: z.string().min(1, 'El TERM es requerido').optional(),
  }).optional(),
  profesor: z.object({
    tipo_profesor: z.enum(['Voluntario', 'Asesor']).optional().nullable(),
    term: z.string().min(1, 'El TERM es requerido').optional(),
  }).optional(),
  coordinador: z.object({
    term: z.string().min(1, 'El TERM es requerido').optional(),
  }).optional(),
});

