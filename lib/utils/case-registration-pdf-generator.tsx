'use client';

import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { logger } from '@/lib/utils/logger';
import { RegistroControlCasosPDF } from '@/components/cases/RegistroControlCasosPDF';
import { imageToBase64 } from '@/lib/utils/pdf-generator-react';

import { registrarAuditoriaReporteAction } from '@/app/actions/reports';
import { TIPOS_REPORTE } from '../constants/reports';

export async function generateRegistroControlCasosPDF(data: { caso: any; equipo: any[]; beneficiarios: any[] }): Promise<void> {
    try {
        // Registrar auditoria
        await registrarAuditoriaReporteAction({
            tipoReporte: TIPOS_REPORTE.REGISTRO_CONTROL_CASO,
            filtrosAplicados: { idCaso: data.caso?.id_caso },
            formato: 'PDF',
            operacion: 'generacion',
        });

        const logoBase64 = await imageToBase64('/logo escuela derecho.png');

        const doc = React.createElement(RegistroControlCasosPDF, {
            data,
            logoBase64
        });

        // @ts-ignore
        const blob = await pdf(doc).toBlob();

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Registro_Control_Caso_${data.caso?.id_caso || 'N/A'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

    } catch (error) {
        logger.error('Error al generar PDF de Registro y Control:', error);
        alert('Error al generar el PDF de Registro y Control');
        throw error;
    }
}
