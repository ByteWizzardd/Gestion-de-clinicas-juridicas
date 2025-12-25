import { NextRequest, NextResponse } from 'next/server';
import { casosQueries } from '@/lib/db/queries/casos.queries';
import { mapCaseLoadTrendData } from '@/lib/utils/reports-data-mapper';
import { verifyToken } from '@/lib/utils/security';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    try {
        // Verificar autenticación
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, error: 'No autorizado' },
                { status: 401 }
            );
        }

        try {
            await verifyToken(token);
        } catch (error) {
            return NextResponse.json(
                { success: false, error: 'Token inválido o expirado' },
                { status: 401 }
            );
        }

        // Obtener parámetros de query
        const searchParams = request.nextUrl.searchParams;
        const fechaInicio = searchParams.get('fechaInicio') || undefined;
        const fechaFin = searchParams.get('fechaFin') || undefined;
        const idNucleo = searchParams.get('idNucleo') ? parseInt(searchParams.get('idNucleo')!) : undefined;
        const term = searchParams.get('term') || undefined;

        // Obtener datos de la base de datos
        const dbData = await casosQueries.getCaseLoadTrend(
            fechaInicio,
            fechaFin,
            idNucleo,
            term
        );

        // Mapear datos al formato de la gráfica
        const chartData = mapCaseLoadTrendData(dbData);

        return NextResponse.json({
            success: true,
            data: chartData,
        });
    } catch (error) {
        console.error('Error al obtener datos de tendencia de carga:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido',
            },
            { status: 500 }
        );
    }
}
