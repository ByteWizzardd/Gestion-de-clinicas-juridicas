import { solicitantesQueries } from "@/lib/db/queries/solicitantes/solicitantes.queries";
import { AppError } from "@/lib/utils/errors";
import type { Solicitante } from "@/lib/db/queries/solicitantes/solicitantes.queries";

export class SolicitantesService {
  /**
   * Obtiene todos los solicitantes del sistema
   * @returns Promise<Solicitante[]> - Lista de solicitantes
   * @throws {AppError} - Si ocurre un error al obtener los datos
   */
  static async getAllSolicitantes(): Promise<Solicitante[]> {
    try {
      return await solicitantesQueries.getAllSolicitantes();
    } catch (error) {
      console.error("[SolicitantesService] Error fetching solicitantes:", error);
      if (error instanceof Error) {
        console.error(`Error details: ${error.message}`);
      }
      throw new AppError(
        "No se pudieron obtener los solicitantes. Por favor, intente más tarde.",
        500,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  /**
   * Obtiene un solicitante por su cédula con toda su información relacionada
   * @param cedula - Cédula del solicitante
   * @returns Promise<any | null> - Información completa del solicitante o null si no existe
   * @throws {AppError} - Si ocurre un error al obtener los datos
   */
  static async getSolicitanteById(cedula: string): Promise<any | null> {
    try {
      return await solicitantesQueries.getSolicitanteById(cedula);
    } catch (error) {
      console.error("[SolicitantesService] Error fetching solicitante by id:", error);
      if (error instanceof Error) {
        console.error(`Error details: ${error.message}`);
      }
      throw new AppError(
        "No se pudo obtener el solicitante. Por favor, intente más tarde.",
        500,
        error instanceof Error ? error.message : String(error)
      );
    }
  }
}

export const solicitantesService = new SolicitantesService();