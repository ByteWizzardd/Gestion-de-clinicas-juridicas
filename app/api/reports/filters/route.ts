import { NextResponse } from 'next/server';
import { pool } from '@/lib/db/pool';
import { verifyToken } from '@/lib/utils/security';
import { cookies } from 'next/headers';

export async function GET() {
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

        // Obtener núcleos
        const nucleosResult = await pool.query(
            'SELECT id_nucleo, nombre_nucleo FROM nucleos ORDER BY nombre_nucleo'
        );

        // Obtener términos (semestres)
        const termsResult = await pool.query(
            'SELECT term FROM semestres ORDER BY term DESC'
        );

        // Opciones de rango de fechas (predefinidas)
        const dateRangeOptions = [
            { value: 'all', label: 'Todo el tiempo' },
            { value: 'last-week', label: 'Última semana' },
            { value: 'last-month', label: 'Último mes' },
            { value: 'last-3-months', label: 'Últimos 3 meses' },
            { value: 'last-year', label: 'Último año' },
        ];

        // Formatear núcleos
        const nucleoOptions = [
            { value: 'all', label: 'Todos los núcleos' },
            ...nucleosResult.rows.map((row) => ({
                value: row.id_nucleo.toString(),
                label: row.nombre_nucleo,
            })),
        ];

        // Formatear términos
        const termOptions = [
            { value: 'all', label: 'Todos los periodos' },
            ...termsResult.rows.map((row) => ({
                value: row.term,
                label: row.term,
            })),
        ];

        return NextResponse.json({
            success: true,
            data: {
                dateRangeOptions,
                nucleoOptions,
                termOptions,
            },
        });
    } catch (error) {
        console.error('Error al obtener opciones de filtros:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido',
            },
            { status: 500 }
        );
    }
}
