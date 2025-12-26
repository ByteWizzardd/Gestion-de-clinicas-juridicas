import { z } from 'zod';

// Esquema de validación para el formulario de cita
export const appointmentSchema = z.object({
	caseId: z.union([
		z.string().min(1, 'Selecciona un caso'),
		z.number({ invalid_type_error: 'Selecciona un caso' })
	]),
	date: z.string().min(1, 'La fecha de encuentro es obligatoria'),
	endDate: z.string().optional(),
	orientacion: z
		.string()
		.min(1, 'La orientación es obligatoria')
		.max(500, 'La descripción no puede superar 500 caracteres'),
	usuariosAtienden: z.array(z.string()).optional(),
}).transform((data) => ({
	...data,
	caseId: typeof data.caseId === 'number' ? data.caseId.toString() : data.caseId,
})).refine((data) => {
	if (!data.endDate) return true;
	return new Date(data.endDate) > new Date(data.date);
}, {
	message: 'La fecha de la próxima cita debe ser posterior a la fecha de encuentro',
	path: ['endDate'],
});