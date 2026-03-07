'use client';

import React from 'react';
import { pdf } from '@react-pdf/renderer';
import JSZip from 'jszip';
import { logger } from './logger';
import { CasoHistorialData } from '../types/report-types';
import { CasoHistorialPDF as CasoHistorialDocument } from '../../components/cases/CasoHistorialPDF';
import { generateCasoHistorialExcelFormatoUCAB } from './case-history-excel-generator';
import { imageToBase64 } from './pdf-generator-react'; // We will ensure this is exported
import { SolicitanteFichaData } from '../types/report-types';
import { SolicitanteFichaPDF as SolicitanteFichaDocument } from '../../components/applicants/SolicitanteFichaPDF';
import { generateSolicitanteFichaExcel } from './applicant-file-excel-generator';
import { formatDateTimeForFilename } from './date-formatter';


/**
 * Genera y descarga un PDF con el historial completo de un caso (versión simple)
 */
export async function generateCasoHistorialPDF(data: CasoHistorialData, includeName: boolean = false): Promise<void> {

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

        let filename = `Historial_Caso_${data.caso?.id_caso || 'N/A'}`;

        if (includeName) {
            const primerNombre = (data.caso?.nombres_solicitante || '').trim().split(' ')[0];
            const primerApellido = (data.caso?.apellidos_solicitante || '').trim().split(' ')[0];
            const nombreSimple = `${primerNombre} ${primerApellido}`.trim();
            const safeName = nombreSimple ? nombreSimple.replace(/[^a-zA-Z0-9]/g, '_') : 'N_A';
            filename = `Historial_Caso_${safeName}_${data.caso?.id_caso || 'N/A'}`;
        }

        link.download = `${filename}_${formatDateTimeForFilename()}.pdf`;




        document.body.appendChild(link);

        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

    } catch (error) {
        logger.error('Error al generar PDF de historial de caso:', error);
        alert('Error al generar el PDF');
        throw error;
    }
}

/**
 * Genera y descarga un Excel con formato UCAB para el historial del caso
 */
export async function generateCasoHistorialExcelUCAB(data: CasoHistorialData, includeName: boolean = false): Promise<void> {

    try {
        // Generar el buffer del Excel
        const buffer = await generateCasoHistorialExcelFormatoUCAB(data);

        // Crear URL y descargar
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        let filename = `Historial_Caso_UCAB_${data.caso?.id_caso || 'N/A'}`;

        if (includeName) {
            const primerNombre = (data.caso?.nombres_solicitante || '').trim().split(' ')[0];
            const primerApellido = (data.caso?.apellidos_solicitante || '').trim().split(' ')[0];
            const nombreSimple = `${primerNombre} ${primerApellido}`.trim();
            const safeName = nombreSimple ? nombreSimple.replace(/[^a-zA-Z0-9]/g, '_') : 'N_A';
            filename = `Historial_Caso_UCAB_${safeName}_${data.caso?.id_caso || 'N/A'}`;
        }

        link.download = `${filename}_${formatDateTimeForFilename()}.xlsx`;




        document.body.appendChild(link);

        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

    } catch (error) {
        logger.error('Error al generar Excel UCAB de historial de caso:', error);
        alert('Error al generar el Excel');
        throw error;
    }
}

/**
 * Genera y descarga un archivo ZIP con el historial del caso (PDF + Excel)
 */
export async function generateCasoHistorialZip(data: CasoHistorialData, includeName: boolean = false): Promise<void> {

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

        const timestamp = formatDateTimeForFilename();

        // Agregar PDF al ZIP
        zip.file(`Historial_Caso_${idCaso}_${timestamp}.pdf`, pdfBlob);

        // 2. Generar Excel con formato UCAB
        try {
            const excelBuffer = await generateCasoHistorialExcelFormatoUCAB(data);
            zip.file(`Historial_Caso_${idCaso}_${timestamp}.xlsx`, excelBuffer);
        } catch (excelError) {
            logger.error('Error generando Excel para ZIP:', excelError);
            // Continuamos aunque falle el excel, para al menos entregar el PDF
        }

        // 3. Generar archivo ZIP
        const zipContent = await zip.generateAsync({ type: 'blob' });

        // 4. Descargar
        const url = URL.createObjectURL(zipContent);
        const link = document.createElement('a');
        link.href = url;

        let filename = `Historial_Caso_${idCaso}`;

        if (includeName) {
            const primerNombre = (data.caso?.nombres_solicitante || '').trim().split(' ')[0];
            const primerApellido = (data.caso?.apellidos_solicitante || '').trim().split(' ')[0];
            const nombreSimple = `${primerNombre} ${primerApellido}`.trim();
            const safeName = nombreSimple ? nombreSimple.replace(/[^a-zA-Z0-9]/g, '_') : 'N_A';
            filename = `Historial_Caso_${safeName}_${idCaso}`;
        }

        link.download = `${filename}_${timestamp}.zip`;





        document.body.appendChild(link);

        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

    } catch (error) {
        logger.error('Error al generar ZIP de expediente:', error);
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

        const timestamp = formatDateTimeForFilename();

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
            caseFolder.file(`Historial_Caso_${idCaso}_${timestamp}.pdf`, pdfBlob);

            // 2. Generar Excel
            try {
                const excelBuffer = await generateCasoHistorialExcelFormatoUCAB(casoData);
                caseFolder.file(`Historial_Caso_${idCaso}_${timestamp}.xlsx`, excelBuffer);
            } catch (excelError) {
                logger.error(`Error generando Excel para caso ${idCaso}:`, excelError);
            }
        }));

        // Generar ZIP final
        const zipContent = await zip.generateAsync({ type: 'blob' });

        // Descargar
        const url = URL.createObjectURL(zipContent);
        const link = document.createElement('a');
        link.href = url;
        // Nombre del archivo: Historial_Solicitante_[Nombre]_Fecha.zip
        const emissionStr = timestamp;

        const primerNombre = nombreSolicitante.trim().split(' ')[0];
        const apellidosArray = nombreSolicitante.trim().split(' ');
        // Si hay más de un nombre, asumimos que el primer apellido está después del primer nombre si no tenemos la estructura separada,
        // pero aquí nombreSolicitante suele ser nombre completo. Tomaremos el primero y el segundo elemento como simplificación si es nombre completo.
        const primerApellido = apellidosArray.length > 1 ? apellidosArray[apellidosArray.length - 1] : '';
        // Nota: nombreSolicitante viene de la UI, usualmente ya es "Nombres Apellidos".
        // Para ser más precisos, simplemente tomamos la primera palabra y la última si existe.
        const nombreParaArchivo = apellidosArray.length > 1 ? `${apellidosArray[0]} ${apellidosArray[apellidosArray.length - 1]}` : apellidosArray[0];

        const safeName = nombreParaArchivo.replace(/[^a-zA-Z0-9]/g, '_');
        link.download = `Historial_Solicitante_${safeName}_${emissionStr}.zip`;



        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

    } catch (error) {
        logger.error('Error al generar ZIP de historial de solicitante:', error);
        alert('Error al generar el archivo ZIP del solicitante');
        throw error;
    }
}

/**
 * Genera y descarga un archivo ZIP completo con el expediente del solicitante.
 * Contiene:
 * 1. Ficha del Solicitante (PDF + Excel)
 * 2. Carpeta con Historiales de Caso (PDF + Excel por caso)
 */
export async function generateExpedienteSolicitanteZIP(
    solicitanteData: SolicitanteFichaData,
    casos: CasoHistorialData[],
    nombreSolicitante: string
): Promise<void> {
    try {
        const zip = new JSZip();
        // Cargar logo una sola vez
        const logoBase64 = await imageToBase64('/logo escuela derecho.png');

        const timestamp = formatDateTimeForFilename();
        const nameParts = nombreSolicitante.trim().split(' ');
        const nombreParaArchivo = nameParts.length > 1 ? `${nameParts[0]} ${nameParts[nameParts.length - 1]}` : nameParts[0];
        const safeName = nombreParaArchivo.replace(/[^a-zA-Z0-9]/g, '_');

        // --- 1. Agregar Ficha del Solicitante (Raíz) ---

        // 1.1 PDF Ficha
        const fichaDoc = React.createElement(SolicitanteFichaDocument, {
            data: {
                ...solicitanteData,
                casos: solicitanteData.casos || [],
                beneficiarios: solicitanteData.beneficiarios || []
            },
            logoBase64
        });
        // @ts-ignore
        const fichaPdfBlob = await pdf(fichaDoc).toBlob();
        zip.file(`Ficha_Solicitante_${safeName}_${timestamp}.pdf`, fichaPdfBlob);

        // 1.2 Excel Ficha
        try {
            const fichaExcelBuffer = await generateSolicitanteFichaExcel(solicitanteData);
            zip.file(`Ficha_Solicitante_${safeName}_${timestamp}.xlsx`, fichaExcelBuffer);
        } catch (excelError) {
            logger.error('Error generando Excel de ficha solicitante para ZIP:', excelError);
        }


        // --- 2. Agregar Historial de Casos (Carpeta "Casos") - Solo si hay casos ---
        if (casos && casos.length > 0) {
            const casosFolder = zip.folder("Casos");
            if (casosFolder) {
                await Promise.all(casos.map(async (casoData) => {
                    const idCaso = casoData.caso?.id_caso || 'N_A';
                    const folderName = `Caso_${idCaso}`;
                    const caseSubFolder = casosFolder.folder(folderName);

                    if (!caseSubFolder) return;

                    // 2.1 PDF Historial Caso
                    const historialDoc = React.createElement(CasoHistorialDocument, {
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
                    const pdfBlob = await pdf(historialDoc).toBlob();
                    caseSubFolder.file(`Historial_Caso_${idCaso}_${timestamp}.pdf`, pdfBlob);

                    // 2.2 Excel Historial Caso
                    try {
                        const excelBuffer = await generateCasoHistorialExcelFormatoUCAB(casoData);
                        caseSubFolder.file(`Historial_Caso_${idCaso}_${timestamp}.xlsx`, excelBuffer);
                    } catch (excelError) {
                        logger.error(`Error generando Excel para caso ${idCaso}:`, excelError);
                    }
                }));
            }
        }


        // --- 3. Generar y Descargar ZIP Final ---
        const zipContent = await zip.generateAsync({ type: 'blob' });

        const url = URL.createObjectURL(zipContent);
        const link = document.createElement('a');
        link.href = url;

        const emissionStr = timestamp;

        // Nombre descriptivo: Ficha_Resumen_[Solicitante]_[Fecha].zip
        link.download = `Ficha_Resumen_${safeName}_${emissionStr}.zip`;






        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

    } catch (error) {
        logger.error('Error al generar Expediente Completo (ZIP):', error);
        alert('Error al generar el Expediente Completo');
        throw error;
    }
}
