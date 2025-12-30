import { z } from 'zod';

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
  correo_electronico: z.string().email('Correo electrónico inválido').optional(),
  telefono: z.string().optional(),
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

