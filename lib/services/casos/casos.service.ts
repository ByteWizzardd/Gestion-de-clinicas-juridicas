import { casosQueries } from '@/lib/db/queries/casos/casos.queries';
import { asignacionesQueries } from '@/lib/db/queries/asignaciones/asignaciones.queries';
import { AppError } from '@/lib/utils/errors';

/**
 * Servicio para la entidad Casos
 * Contiene la lógica de negocio para el módulo de Listado de Casos
 */
export const casosService = {
    /**
     * Obtiene todos los casos con información enriquecida
     * Incluye nombre del cliente (ya viene del query) y nombre del profesor responsable
     */
    getAllCasos: async () => {
        try {
            // Obtener todos los casos (ya incluye nombre_completo_cliente del JOIN)
            const casos = await casosQueries.getAll();

            // Enriquecer cada caso con el nombre del profesor responsable
            const casosEnriquecidos = await Promise.all(
                casos.map(async (caso) => {
                    // Obtener el profesor responsable activo del caso
                    const profesor = await asignacionesQueries.getProfesorResponsableByCaso(caso.id_caso);

                    return {
                        ...caso,
                        nombre_responsable: profesor ? profesor.nombre_completo_profesor : null,
                    };
                })
            );

            return casosEnriquecidos;
        } catch (error) {
            throw new AppError(
                'Error al obtener los casos',
                500,
                error instanceof Error ? error.message : 'Error desconocido'
            );
        }
    },
};
