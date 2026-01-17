'use client';

import React from 'react';
import { pdf } from '@react-pdf/renderer';
import JSZip from 'jszip';
import { CasoHistorialData } from '../types/report-types';
import { CasoHistorialPDF as CasoHistorialDocument } from '../../components/cases/CasoHistorialPDF';
import { generateCasoHistorialExcelFormatoUCAB } from './case-history-excel-generator';
import { imageToBase64 } from './pdf-generator-react'; // We will ensure this is exported

/**
 * Genera y descarga un PDF con el historial completo de un caso (versión simple)
 */
export async function generateCasoHistorialPDF(data: CasoHistorialData): Promise<void> {
    try {
        // Cargar el logo como base64 para preservar la transparencia
        const logoBase64 = await imageToBase64('/logo escuela derecho.png');

        // Generar el documento PDF
        const doc = React.createElement(CasoHistorialDocument, {
            data: {
                ...data,
                acciones: data.acciones || [],
                citas: data.citas || [],
                soportes: data.soportes || [],
                beneficiarios: data.beneficiarios || [],
                equipo: data.equipo || [],
                cambiosEstatus: data.cambiosEstatus || []
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
        link.download = `Historial_Caso_${data.caso?.id_caso || 'N/A'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

    } catch (error) {
        console.error('Error al generar PDF de historial de caso:', error);
        alert('Error al generar el PDF');
        throw error;
    }
}

/**
 * Genera y descarga un Excel con formato UCAB para el historial del caso
 */
export async function generateCasoHistorialExcelUCAB(data: CasoHistorialData): Promise<void> {
    try {
        // Generar el buffer del Excel
        const buffer = await generateCasoHistorialExcelFormatoUCAB(data);

        // Crear URL y descargar
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Historial_Caso_UCAB_${data.caso?.id_caso || 'N/A'}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

    } catch (error) {
        console.error('Error al generar Excel UCAB de historial de caso:', error);
        alert('Error al generar el Excel');
        throw error;
    }
}

/**
 * Genera y descarga un archivo ZIP con el historial del caso (PDF + Excel)
 */
export async function generateCasoHistorialZip(data: CasoHistorialData): Promise<void> {
    try {
        const zip = new JSZip();
        const idCaso = data.caso?.id_caso || 'N_A';

        // 1. Generar PDF
        // Cargar el logo como base64 para preservar la transparencia
        const logoBase64 = await imageToBase64('/logo escuela derecho.png');

        // Generar el documento PDF
        const doc = React.createElement(CasoHistorialDocument, {
            data: {
                ...data,
                acciones: data.acciones || [],
                citas: data.citas || [],
                soportes: data.soportes || [],
                beneficiarios: data.beneficiarios || [],
                equipo: data.equipo || [],
                cambiosEstatus: data.cambiosEstatus || []
            },
            logoBase64
        });

        // Crear el blob del PDF
        // @ts-ignore - React PDF types issue with React 19
        const pdfBlob = await pdf(doc).toBlob();

        // Agregar PDF al ZIP
        zip.file(`Historial_Caso_${idCaso}.pdf`, pdfBlob);

        // 2. Generar Excel con formato UCAB
        try {
            const excelBuffer = await generateCasoHistorialExcelFormatoUCAB(data);
            zip.file(`Historial_Caso_${idCaso}.xlsx`, excelBuffer);
        } catch (excelError) {
            console.error('Error generando Excel para ZIP:', excelError);
            // Continuamos aunque falle el excel, para al menos entregar el PDF
        }

        // 3. Generar archivo ZIP
        const zipContent = await zip.generateAsync({ type: 'blob' });

        // 4. Descargar
        const url = URL.createObjectURL(zipContent);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Expediente_Caso_${idCaso}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

    } catch (error) {
        console.error('Error al generar ZIP de expediente:', error);
        alert('Error al generar el Expediente (ZIP)');
        throw error;
    }
}

/**
 * Genera y descarga un archivo ZIP que contiene carpetas para cada caso del solicitante.
 * Cada carpeta tendrá el PDF y Excel del historial de ese caso.
 */
export async function generateHistorialSolicitanteZIP(
    casos: CasoHistorialData[],
    nombreSolicitante: string
): Promise<void> {
    try {
        const zip = new JSZip();
        // Cargar logo una sola vez
        const logoBase64 = await imageToBase64('/logo escuela derecho.png');

        // Procesar cada caso
        await Promise.all(casos.map(async (casoData) => {
            const idCaso = casoData.caso?.id_caso || 'N_A';
            const folderName = `Caso_${idCaso}`;
            const caseFolder = zip.folder(folderName);

            if (!caseFolder) return;

            // 1. Generar PDF
            const doc = React.createElement(CasoHistorialDocument, {
                data: {
                    ...casoData,
                    acciones: casoData.acciones || [],
                    citas: casoData.citas || [],
                    soportes: casoData.soportes || [],
                    beneficiarios: casoData.beneficiarios || [],
                    equipo: casoData.equipo || [],
                    cambiosEstatus: casoData.cambiosEstatus || []
                },
                logoBase64
            });

            // @ts-ignore
            const pdfBlob = await pdf(doc).toBlob();
            caseFolder.file(`Historial_Caso_${idCaso}.pdf`, pdfBlob);

            // 2. Generar Excel
            try {
                const excelBuffer = await generateCasoHistorialExcelFormatoUCAB(casoData);
                caseFolder.file(`Historial_Caso_${idCaso}.xlsx`, excelBuffer);
            } catch (excelError) {
                console.error(`Error generando Excel para caso ${idCaso}:`, excelError);
            }
        }));

        // Generar ZIP final
        const zipContent = await zip.generateAsync({ type: 'blob' });

        // Descargar
        const url = URL.createObjectURL(zipContent);
        const link = document.createElement('a');
        link.href = url;
        // Nombre del archivo: Historial_Solicitante_[Nombre]_Fecha.zip
        const dateStr = new Date().toISOString().split('T')[0];
        const safeName = nombreSolicitante.replace(/[^a-zA-Z0-9]/g, '_');
        link.download = `Historial_Solicitante_${safeName}_${dateStr}.zip`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

    } catch (error) {
        console.error('Error al generar ZIP de historial de solicitante:', error);
        alert('Error al generar el archivo ZIP del solicitante');
        throw error;
    }
}
