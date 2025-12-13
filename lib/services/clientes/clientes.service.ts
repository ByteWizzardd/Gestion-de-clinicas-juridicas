import { clientesQueries } from '@/lib/db/queries/clientes/clientes.queries';
import { AppError } from '@/lib/utils/errors';

export class ClientesService {
  /**
   * Busca clientes por cédula (búsqueda parcial)
   * @param cedula - Cédula del cliente (puede ser parcial)
   * @returns Promise con lista de clientes encontrados
   * @throws {AppError} - Si ocurre un error al obtener los datos
   */
  static async searchByCedula(cedula: string): Promise<Array<{
    cedula: string;
    nombres: string;
    apellidos: string;
    nombre_completo: string;
  }>> {
    try {
      return await clientesQueries.searchByCedula(cedula);
    } catch (error) {
      console.error('[ClientesService] Error searching by cedula:', error);
      if (error instanceof Error) {
        console.error(`Error details: ${error.message}`);
      }
      throw new AppError(
        'No se pudieron buscar los clientes. Por favor, intente más tarde.',
        500,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  /**
   * Obtiene un cliente completo por su cédula con todas sus relaciones
   * (núcleo, educación, trabajo, hogar, vivienda, casos)
   * @param cedula - Cédula del cliente
   * @returns Promise<any | null> - Información completa del cliente o null si no existe
   * @throws {AppError} - Si ocurre un error al obtener los datos
   */
  static async getClienteCompleto(cedula: string): Promise<any | null> {
    try {
      return await clientesQueries.getClienteCompleto(cedula);
    } catch (error) {
      console.error('[ClientesService] Error fetching cliente completo:', error);
      if (error instanceof Error) {
        console.error(`Error details: ${error.message}`);
      }
      throw new AppError(
        'No se pudo obtener la información completa del cliente. Por favor, intente más tarde.',
        500,
        error instanceof Error ? error.message : String(error)
      );
    }
  }
}

export const clientesService = new ClientesService();

