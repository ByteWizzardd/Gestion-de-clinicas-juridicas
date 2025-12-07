import { NextRequest, NextResponse } from "next/server";
import { SolicitantesService } from "../../../lib/services/solicitantes/solicitantes.service";


// El request aun no se usa pero se deja para futuras mejoras
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const solicitantes = await SolicitantesService.getAllSolicitantes();

    return NextResponse.json(
      {
        success: true,
        data: solicitantes,
        count: solicitantes.length,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[SolicitantesRoute] Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "No se pudieron obtener los solicitantes",
        error: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
