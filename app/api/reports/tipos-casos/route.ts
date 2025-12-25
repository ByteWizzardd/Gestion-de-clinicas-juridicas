import { NextRequest, NextResponse } from 'next/server';
import { getCasosGroupedByAmbitoLegal } from '@/app/actions/reports';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fechaInicio, fechaFin } = body;

    const result = await getCasosGroupedByAmbitoLegal(fechaInicio, fechaFin);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('Error en API route tipos-casos:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

