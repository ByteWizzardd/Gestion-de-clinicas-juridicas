import { z } from 'zod';
import { validateEmailDomain } from '@/lib/utils/email-validation';

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
  telefono: z.string().optional().refine((val) => {
    // Si está vacío o es null, es válido (opcional)
    if (!val || val.trim() === '' || val.trim() === '+58') {
      return true;
    }

    // Extraer código de país y número
    const codeMatch = val.match(/^(\+\d{1,3})/);
    const code = codeMatch ? codeMatch[1] : '';
    const number = val.replace(code, '').replace(/^-/, '').trim();

    // Si solo tiene el código sin número, es válido (se enviará como null)
    if (number === '') {
      return true;
    }

    // Para números venezolanos (+58), el número debe tener 10 dígitos y empezar con 4
    if (code === '+58') {
      if (number.length !== 10 || !number.startsWith('4')) {
        return false;
      }
    } else {
      // Para otros países, validar longitud mínima y máxima
      if (number.length < 7 || number.length > 15) {
        return false;
      }
    }

    return true;
  }, {
    message: 'Número de teléfono inválido. Para Venezuela (+58) debe tener 10 dígitos y empezar con 4 (ej: 412...). Para otros países, entre 7 y 15 dígitos.'
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

