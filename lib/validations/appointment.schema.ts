import { z } from 'zod';

// Esquema de validación para el formulario de cita
export const appointmentSchema = z.object({
    //Datos obligatorios
	caseId: z.string().min(1, 'Selecciona un caso'),
	date: z.string().min(1, 'La fecha de encuentro es obligatoria'),
	endDate: z.string().optional(),
	notes: z
		.string()
		.min(10, 'La descripción debe tener al menos 10 caracteres')
		.max(500, 'La descripción no puede superar 500 caracteres'),
    
}).refine((data) => {
    if (!data.endDate) return true;
    return new Date(data.endDate) > new Date(data.date);
}, {
    message: 'La fecha de la próxima cita debe ser posterior a la fecha de encuentro',
    path: ['endDate'],
});