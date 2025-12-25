'use server';

import { cookies } from 'next/headers';
import { casosQueries } from '@/lib/db/queries/casos.queries';
import { verifyToken } from '@/lib/utils/security';

export interface CasosGroupedData {
  id_materia: number;
  num_categoria: number;
  num_subcategoria: number;
  num_ambito_legal: number;
  nombre_materia: string;
  nombre_categoria: string;
  nombre_subcategoria: string;
  nombre_ambito_legal: string;
  cantidad_casos: number;
}

/**
 * Obtiene casos agrupados por ámbito legal para generar reportes
 */
export async function getCasosGroupedByAmbitoLegal(
  fechaInicio?: string,
  fechaFin?: string
): Promise<{ success: boolean; data?: CasosGroupedData[]; error?: string }> {
  try {
    // Verificar autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return {
        success: false,
        error: 'No autorizado',
      };
    }

    // Verificar token
    try {
      await verifyToken(token);
    } catch (error) {
      return {
        success: false,
        error: 'Token inválido o expirado',
      };
    }

    const data = await casosQueries.getGroupedByAmbitoLegal(
      fechaInicio || undefined,
      fechaFin || undefined
    );

    return { success: true, data };
  } catch (error) {
    console.error('Error al obtener casos agrupados:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

