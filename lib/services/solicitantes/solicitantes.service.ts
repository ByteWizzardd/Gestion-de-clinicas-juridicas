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
}

export const solicitantesService = new SolicitantesService();