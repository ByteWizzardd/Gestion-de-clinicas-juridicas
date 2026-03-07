'use client';

import React from 'react';
import { pdf } from '@react-pdf/renderer';
import JSZip from 'jszip';
import { logger } from './logger';
import { SolicitanteFichaData } from '../types/report-types';
import { SolicitanteFichaPDF as SolicitanteFichaDocument } from '../../components/applicants/SolicitanteFichaPDF';
import { generateSolicitanteFichaExcel } from './applicant-file-excel-generator';
import { imageToBase64 } from './pdf-generator-react';
import { formatDateTimeForFilename } from './date-formatter';


/**
 * Genera y descarga un PDF con la ficha completa de un solicitante (versión simple)
 */
export async function generateSolicitanteFichaPDF(data: SolicitanteFichaData): Promise<void> {
    try {
        // Cargar el logo como base64 para preservar la transparencia
        const logoBase64 = await imageToBase64('/logo escuela derecho.png');

        // Generar el documento PDF
        const doc = React.createElement(SolicitanteFichaDocument, {
            data: {
                ...data,
                casos: data.casos || [],
                beneficiarios: data.beneficiarios || []
            },
            logoBase64
        });

        // Crear el blob del PDF
        // @ts-ignore - React PDF types issue with React 19
        const blob = await pdf(doc).toBlob();

        // Crear URL y descargar
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        const primerNombre = (data.solicitante?.nombres || '').trim().split(' ')[0];
        const primerApellido = (data.solicitante?.apellidos || '').trim().split(' ')[0];
        const nombreSimple = `${primerNombre} ${primerApellido}`.trim();
        const safeName = nombreSimple ? nombreSimple.replace(/[^a-zA-Z0-9]/g, '_') : 'N_A';

        link.download = `Ficha_Solicitante_${safeName}_${formatDateTimeForFilename()}.pdf`;



        document.body.appendChild(link);

        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

    } catch (error) {
        logger.error('Error al generar PDF de ficha de solicitante:', error);
        alert('Error al generar el PDF');
        throw error;
    }
}

/**
 * Genera y descarga un archivo ZIP con la ficha del solicitante (PDF + Excel)
 */
export async function generateSolicitanteFichaZip(data: SolicitanteFichaData): Promise<void> {
    try {
        const zip = new JSZip();
        const cedula = data.solicitante?.cedula || 'N_A';

        // 1. Generar PDF
        // Cargar el logo como base64 para preservar la transparencia
        const logoBase64 = await imageToBase64('/logo escuela derecho.png');

        // Generar el documento PDF
        const doc = React.createElement(SolicitanteFichaDocument, {
            data: {
                ...data,
                casos: data.casos || [],
                beneficiarios: data.beneficiarios || []
            },
            logoBase64
        });

        // Crear el blob del PDF
        // @ts-ignore - React PDF types issue with React 19
        const pdfBlob = await pdf(doc).toBlob();

        const timestamp = formatDateTimeForFilename();
        const primerNombre = (data.solicitante?.nombres || '').trim().split(' ')[0];
        const primerApellido = (data.solicitante?.apellidos || '').trim().split(' ')[0];
        const nombreSimple = `${primerNombre} ${primerApellido}`.trim();
        const safeName = nombreSimple ? nombreSimple.replace(/[^a-zA-Z0-9]/g, '_') : 'N_A';

        // Agregar PDF al ZIP
        zip.file(`Ficha_Solicitante_${safeName}_${timestamp}.pdf`, pdfBlob);

        // 2. Generar Excel
        try {
            const excelBuffer = await generateSolicitanteFichaExcel(data);
            zip.file(`Ficha_Solicitante_${safeName}_${timestamp}.xlsx`, excelBuffer);
        } catch (excelError) {
            logger.error('Error generando Excel para ZIP:', excelError);
        }

        // 3. Generar archivo ZIP
        const zipContent = await zip.generateAsync({ type: 'blob' });

        // 4. Descargar
        const url = URL.createObjectURL(zipContent);
        const link = document.createElement('a');
        link.href = url;

        link.download = `Ficha_Solicitante_${safeName}_${timestamp}.zip`;






        document.body.appendChild(link);

        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

    } catch (error) {
        logger.error('Error al generar ZIP de solicitante:', error);
        alert('Error al generar el Expediente (ZIP)');
        throw error;
    }
}
