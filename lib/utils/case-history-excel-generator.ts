import ExcelJS from 'exceljs';
import { CasoHistorialData } from '../types/report-types';
import { formatDate } from './date-formatter';

/**
 * Genera un archivo Excel con el historial del caso
 */
export async function generateCasoHistorialExcel(data: CasoHistorialData): Promise<ArrayBuffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema de Gestión de Clínicas Jurídicas';
    workbook.created = new Date();

    // 1. Información General
    const sheetGeneral = workbook.addWorksheet('Información General');
    sheetGeneral.columns = [
        { header: 'Campo', key: 'campo', width: 30 },
        { header: 'Valor', key: 'valor', width: 50 },
    ];

    const caso = data.caso || {};

    sheetGeneral.addRows([
        { campo: 'ID Caso', valor: caso.id_caso },
        { campo: 'Fecha Solicitud', valor: formatDate(caso.fecha_solicitud) },
        { campo: 'Fecha Inicio', valor: formatDate(caso.fecha_inicio_caso) },
        { campo: 'Fecha Fin', valor: caso.fecha_fin_caso ? formatDate(caso.fecha_fin_caso) : 'Activo' },
        { campo: 'Estatus', valor: caso.estatus },
        { campo: 'Materia', valor: caso.nombre_materia },
        { campo: 'Categoría', valor: caso.nombre_categoria },
        { campo: 'Subcategoría', valor: caso.nombre_subcategoria },
        { campo: 'Ámbito Legal', valor: caso.nombre_ambito_legal },
        { campo: 'Trámite', valor: caso.tramite },
        { campo: 'Solicitante (Nombre)', valor: caso.nombre_completo_solicitante || caso.nombres_solicitante },
        { campo: 'Solicitante (Cédula)', valor: caso.cedula },
        { campo: 'Responsable', valor: caso.nombre_responsable },
        { campo: 'Núcleo', valor: caso.nombre_nucleo },
        { campo: 'Observaciones', valor: caso.observaciones },
    ]);

    // Estilo encabezado
    sheetGeneral.getRow(1).font = { bold: true };

    // 2. Equipo
    const sheetEquipo = workbook.addWorksheet('Equipo Asignado');
    sheetEquipo.columns = [
        { header: 'Nombre', key: 'nombre', width: 30 },
        { header: 'Rol', key: 'rol', width: 20 },
        { header: 'Tipo', key: 'tipo', width: 15 },
        { header: 'Estatus', key: 'estatus', width: 15 },
    ];

    (data.equipo || []).forEach(miembro => {
        sheetEquipo.addRow({
            nombre: miembro.nombre_completo,
            rol: miembro.rol,
            tipo: miembro.tipo === 'profesor' ? 'Profesor' : 'Estudiante',
            estatus: miembro.habilitado ? 'Activo' : 'Inactivo',
        });
    });
    sheetEquipo.getRow(1).font = { bold: true };

    // 3. Beneficiarios
    const sheetBeneficiarios = workbook.addWorksheet('Beneficiarios');
    sheetBeneficiarios.columns = [
        { header: 'Nombre', key: 'nombre', width: 35 },
        { header: 'Cédula', key: 'cedula', width: 15 },
        { header: 'Edad', key: 'edad', width: 10 },
        { header: 'Parentesco', key: 'parentesco', width: 20 },
        { header: 'Tipo', key: 'tipo', width: 15 },
    ];

    (data.beneficiarios || []).forEach(ben => {
        sheetBeneficiarios.addRow({
            nombre: ben.nombre_completo,
            cedula: ben.cedula_beneficiario,
            edad: ben.edad || (ben.fecha_nac ? 'Calc' : ''),
            parentesco: ben.parentesco,
            tipo: ben.tipo_beneficiario,
        });
    });
    sheetBeneficiarios.getRow(1).font = { bold: true };

    // 4. Seguimiento (Acciones)
    const sheetSeguimiento = workbook.addWorksheet('Seguimiento');
    sheetSeguimiento.columns = [
        { header: 'Fecha', key: 'fecha', width: 15 },
        { header: 'Hora', key: 'hora', width: 10 },
        { header: 'Responsable', key: 'responsable', width: 30 },
        { header: 'Descripción', key: 'descripcion', width: 80 },
    ];

    (data.acciones || []).sort((a, b) => new Date(b.fecha_registro || b.fecha_accion).getTime() - new Date(a.fecha_registro || a.fecha_accion).getTime())
        .forEach(acc => {
            const fecha = new Date(acc.fecha_registro || acc.fecha_accion);
            sheetSeguimiento.addRow({
                fecha: formatDate(acc.fecha_registro || acc.fecha_accion),
                hora: fecha.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
                responsable: acc.nombre_completo_usuario_registra || acc.nombre_responsable,
                descripcion: acc.detalle_accion || acc.descripcion,
            });
        });
    sheetSeguimiento.getRow(1).font = { bold: true };

    // 5. Citas
    const sheetCitas = workbook.addWorksheet('Citas');
    sheetCitas.columns = [
        { header: 'Fecha', key: 'fecha', width: 15 },
        { header: 'Hora', key: 'hora', width: 10 },
        { header: 'Tipo/Orientación', key: 'tipo', width: 30 },
        { header: 'Estatus', key: 'estatus', width: 15 },
        { header: 'Observaciones', key: 'observaciones', width: 40 },
    ];

    (data.citas || []).sort((a, b) => new Date(b.fecha_encuentro || b.fecha_cita).getTime() - new Date(a.fecha_encuentro || a.fecha_cita).getTime())
        .forEach(cita => {
            const fechaDate = new Date(cita.fecha_encuentro || cita.fecha_cita);
            sheetCitas.addRow({
                fecha: formatDate(cita.fecha_encuentro || cita.fecha_cita),
                hora: !isNaN(fechaDate.getTime()) ? fechaDate.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }) : '',
                tipo: cita.orientacion || cita.tipo_cita,
                estatus: cita.estatus,
                observaciones: cita.observaciones || cita.motivo
            });
        });
    sheetCitas.getRow(1).font = { bold: true };

    // 6. Cambios de Estatus
    const sheetCambios = workbook.addWorksheet('Cambios de Estatus');
    sheetCambios.columns = [
        { header: 'Fecha', key: 'fecha', width: 20 },
        { header: 'Nuevo Estatus', key: 'estatus', width: 20 },
        { header: 'Motivo', key: 'motivo', width: 40 },
        { header: 'Responsable', key: 'responsable', width: 30 },
    ];

    (data.cambiosEstatus || []).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        .forEach(cambio => {
            const fecha = new Date(cambio.fecha);
            sheetCambios.addRow({
                fecha: fecha.toLocaleString('es-VE'),
                estatus: cambio.nuevo_estatus,
                motivo: cambio.motivo,
                responsable: cambio.nombre_completo_usuario
            });
        });
    sheetCambios.getRow(1).font = { bold: true };

    // 7. Soportes
    const sheetSoportes = workbook.addWorksheet('Soportes');
    sheetSoportes.columns = [
        { header: 'Fecha Subida', key: 'fecha', width: 20 },
        { header: 'Nombre Archivo', key: 'nombre', width: 40 },
        { header: 'Subido Por', key: 'responsable', width: 30 },
    ];

    (data.soportes || []).forEach(doc => {
        const fecha = new Date(doc.fecha_subida);
        sheetSoportes.addRow({
            fecha: fecha.toLocaleString('es-VE'),
            nombre: doc.nombre_archivo,
            responsable: doc.nombre_responsable || 'Usuario'
        });
    });
    sheetSoportes.getRow(1).font = { bold: true };


    // Ajustar columnas
    autoAdjustColumnWidth(sheetGeneral);
    autoAdjustColumnWidth(sheetEquipo);
    autoAdjustColumnWidth(sheetBeneficiarios);
    autoAdjustColumnWidth(sheetSeguimiento);
    autoAdjustColumnWidth(sheetCitas);
    autoAdjustColumnWidth(sheetCambios);
    autoAdjustColumnWidth(sheetSoportes);

    // Generate buffer
    return await workbook.xlsx.writeBuffer();
}

/**
 * Genera un archivo Excel con formato de formulario académico UCAB para el historial del caso
 * Replica fielmente el diseño del formulario "Historial de Casos" usando una cuadrícula fina
 */
export async function generateCasoHistorialExcelFormatoUCAB(data: CasoHistorialData): Promise<ArrayBuffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema de Gestión de Clínicas Jurídicas - UCAB';
    workbook.created = new Date();

    // Crear hoja principal con formato de formulario
    const sheet = workbook.addWorksheet('Historial de Caso', {
        pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true }, // A4
        views: [{ showGridLines: true }] // Mostrar lineas para ver las celdas
    });

    // === DEFINICIÓN DE COLUMNAS (Fine Grid System) ===
    // Usamos 40 columnas estrechas para tener control fino del diseño (Merging)
    // Ancho ~3 chars aprox
    const totalCols = 40;
    const columns = [];
    for (let i = 0; i < totalCols; i++) {
        columns.push({ width: 2.5 }); // Columnas muy estrechas
    }
    sheet.columns = columns;

    // Estilos Base
    const fontLabel = { name: 'Arial', size: 10, bold: true };
    const fontValue = { name: 'Arial', size: 10, bold: false };
    const fontHeader = { name: 'Arial', size: 12, bold: true };
    const fontTitleMain = { name: 'Arial', size: 14, bold: true };
    const borderBottom = { bottom: { style: 'thin' } } as const;
    const borderBox = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } } as const;

    let r = 2; // Current Row

    // === 1. ENCABEZADO ===
    // Logo (Centered approx)
    try {
        const logoResponse = await fetch('/logo escuela derecho.png');
        if (logoResponse.ok) {
            const logoBlob = await logoResponse.blob();
            const logoBuffer = await logoBlob.arrayBuffer();
            const imageId = workbook.addImage({
                buffer: logoBuffer,
                extension: 'png',
            });
            // Logo on the left
            sheet.addImage(imageId, {
                tl: { col: 1, row: 1 },
                ext: { width: 300, height: 60 }
            });
        }
    } catch (e) {
        // Fallback text centered
        sheet.mergeCells(r, 2, r + 2, 39);
        const logoCell = sheet.getCell(r, 2);
        logoCell.value = 'UCAB';
        logoCell.font = { name: 'Arial', size: 16, bold: true };
        logoCell.alignment = { horizontal: 'center' };
    }

    // Título Central (moved down to row 6)
    r = 6;
    sheet.mergeCells(r, 2, r, 39); // B6:AM6 (Full width)
    const titleCell = sheet.getCell(r, 2);
    titleCell.value = 'HISTORIAL DE CASOS';
    titleCell.alignment = { horizontal: 'center' };
    titleCell.font = fontTitleMain;

    r += 3;
    // I. HISTORIA DEL CASO
    sheet.mergeCells(r, 2, r, 39); // Full width to center properly
    const sectionCell = sheet.getCell(r, 2);
    sectionCell.value = 'I. HISTORIA DEL CASO';
    sectionCell.alignment = { horizontal: 'center' };
    sectionCell.font = fontHeader;

    r += 3;

    const caso = data.caso || {};

    // === LÍNEA 1: CI, Caso N (Cajitas), Materia ===
    // 1. C.I. N°: (Col B, width~4) -> MERGE B:F (Width increased)
    sheet.mergeCells(r, 2, r, 6);
    sheet.getCell(r, 2).value = '1. C.I. N°:';
    sheet.getCell(r, 2).font = fontLabel;

    // Linea CI (Col G:L) -> Shifted right
    sheet.mergeCells(r, 7, r, 12);
    const ciCell = sheet.getCell(r, 7);
    ciCell.value = caso.cedula || '';
    ciCell.font = fontValue;
    ciCell.border = borderBottom;
    ciCell.alignment = { horizontal: 'center' };

    // 2. Caso N°: (Col N) -> MERGE N:R (Width increased)
    sheet.mergeCells(r, 14, r, 18);
    sheet.getCell(r, 14).value = '2. Caso N°:';
    sheet.getCell(r, 14).font = fontLabel;

    // 3 Cajitas para Caso ID (Col T, U, V) -> Shifted right
    const idStr = (caso.id_caso || '').toString().padStart(3, '0');
    // Box 1
    const box1 = sheet.getCell(r, 20);
    box1.value = idStr[idStr.length - 3] || '0';
    box1.border = borderBox;
    box1.alignment = { horizontal: 'center' };
    // Box 2
    const box2 = sheet.getCell(r, 21);
    box2.value = idStr[idStr.length - 2] || '0';
    box2.border = borderBox;
    box2.alignment = { horizontal: 'center' };
    // Box 3
    const box3 = sheet.getCell(r, 22);
    box3.value = idStr[idStr.length - 1] || '0';
    box3.border = borderBox;
    box3.alignment = { horizontal: 'center' };


    // 3. Caso (Materia): (Col X) -> Merge X:AD
    sheet.mergeCells(r, 24, r, 30);
    sheet.getCell(r, 24).value = '3. Caso (Materia):';
    sheet.getCell(r, 24).font = fontLabel;

    // Box Materia (Col AE:AL)
    // El usuario muestra una barra/caja larga
    sheet.mergeCells(r, 31, r, 39);
    const materiaCell = sheet.getCell(r, 31);
    materiaCell.value = `${caso.nombre_materia || ''} ${caso.nombre_categoria || ''}`;
    materiaCell.border = borderBox;
    materiaCell.font = fontValue;
    materiaCell.alignment = { horizontal: 'left', indent: 1 };

    r += 2;

    // === LÍNEA 2: Síntesis del problema ===
    // 4. Síntesis del problema:
    sheet.mergeCells(r, 2, r, 12); // Increased merge B:L
    sheet.getCell(r, 2).value = '4. Síntesis del problema:';
    sheet.getCell(r, 2).font = fontLabel;

    r += 1;
    // SINGLE MERGED BLOCK for text "combina celdas vacias"
    const sintesisText = caso.observaciones || caso.asunto || '';
    sheet.mergeCells(r, 3, r + 4, 39); // 5 rows high, indent C:AL
    const sintesisCell = sheet.getCell(r, 3);
    sintesisCell.value = sintesisText;
    sintesisCell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
    sintesisCell.border = borderBox;

    r += 5; // Skip the 5 rows we merged
    r += 1;

    // === LÍNEA 3: Dirección habitación ===
    // 5. Dirección habitación: -> Merge B:L (Increased)
    sheet.mergeCells(r, 2, r, 12);
    sheet.getCell(r, 2).value = '5. Dirección habitación:';
    sheet.getCell(r, 2).font = fontLabel;

    sheet.mergeCells(r, 13, r, 39); // M:AL
    const dirCell = sheet.getCell(r, 13);
    dirCell.value = caso.direccion_habitacion || '';
    dirCell.font = fontValue;
    dirCell.border = borderBottom;

    r += 2;

    // === LÍNEA 4: Próximas citas ===
    // 6. Próximas citas: -> Merge B:I (Increased)
    sheet.mergeCells(r, 2, r, 9);
    sheet.getCell(r, 2).value = '6. Próximas citas:';
    sheet.getCell(r, 2).font = fontLabel;

    // 4 Cajas separadas, shifted right
    const citas = (data.citas || []).sort((a, b) => new Date(a.fecha_encuentro || a.fecha_cita).getTime() - new Date(b.fecha_encuentro || b.fecha_cita).getTime()).slice(0, 4);

    const citaBoxes = [
        { s: 11, e: 16 }, // K-P
        { s: 18, e: 23 }, // R-W
        { s: 25, e: 30 }, // Y-AD
        { s: 32, e: 37 }  // AF-AK
    ];

    citaBoxes.forEach((box, idx) => {
        sheet.mergeCells(r, box.s, r, box.e);
        const c = sheet.getCell(r, box.s);
        c.border = borderBox;
        c.font = { size: 9 };
        c.alignment = { horizontal: 'center' };
        if (citas[idx]) {
            c.value = formatCita(citas[idx]);
        }
    });

    r += 2;

    // === LÍNEA 5: Recaudos consignados ===
    sheet.mergeCells(r, 2, r, 12); // Increased B:L
    sheet.getCell(r, 2).value = '7. Recaudos consignados:';
    sheet.getCell(r, 2).font = fontLabel;
    r++;

    // SINGLE MERGED BLOCK
    const recaudosStr = (data.soportes || []).map(s => s.nombre_archivo).join(', ');
    sheet.mergeCells(r, 3, r + 3, 39); // 4 rows high
    const recaudosCell = sheet.getCell(r, 3);
    recaudosCell.value = recaudosStr;
    recaudosCell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
    recaudosCell.border = borderBox;

    r += 4;
    r += 1;

    // === LÍNEA 6: Orientación ===
    sheet.mergeCells(r, 2, r, 20);
    sheet.getCell(r, 2).value = '8. Orientación dada por el alumno responsable:';
    sheet.getCell(r, 2).font = fontLabel;
    r++;

    // SINGLE MERGED BLOCK
    const orientacionStr = (data.acciones || []).map(a => `${formatDate(a.fecha_registro)}: ${a.detalle_accion}`).join('. ');
    sheet.mergeCells(r, 3, r + 4, 39); // 5 rows high
    const orientacionCell = sheet.getCell(r, 3);
    orientacionCell.value = orientacionStr;
    orientacionCell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
    orientacionCell.border = borderBox;

    r += 5;
    r += 2;

    // === LÍNEA 7: Firma ===
    // 9. Firma: -> Merge B:F
    sheet.mergeCells(r, 2, r, 6);
    sheet.getCell(r, 2).value = '9. Firma:';
    sheet.getCell(r, 2).font = fontLabel;

    sheet.mergeCells(r, 7, r, 15);
    sheet.getCell(r, 7).border = borderBottom;

    r += 3;

    // === SECCIÓN II ===
    sheet.mergeCells(r, 2, r, 39); // Full width centered
    sheet.getCell(r, 2).value = 'II. INFORMACIÓN ADICIONAL';
    sheet.getCell(r, 2).alignment = { horizontal: 'center' };
    sheet.getCell(r, 2).font = fontHeader;

    r += 2;
    // Equipo
    sheet.getCell(r, 3).value = 'Equipo:';
    sheet.getCell(r, 3).font = fontLabel;
    (data.equipo || []).forEach(m => {
        r++;
        sheet.mergeCells(r, 4, r, 20);
        sheet.getCell(r, 4).value = `${m.nombre_completo} - ${m.rol}`;
    });

    r += 2;
    // Beneficiarios
    sheet.getCell(r, 3).value = 'Beneficiarios:';
    sheet.getCell(r, 3).font = fontLabel;
    (data.beneficiarios || []).forEach(b => {
        r++;
        sheet.mergeCells(r, 4, r, 20);
        sheet.getCell(r, 4).value = `${b.nombre_completo} (${b.parentesco})`;
    });

    r += 2;
    // Historial Cambios - Missing in previous version
    sheet.getCell(r, 3).value = 'Historial de Estatus:';
    sheet.getCell(r, 3).font = fontLabel;
    (data.cambiosEstatus || []).forEach(c => {
        r++;
        sheet.mergeCells(r, 4, r, 30);
        sheet.getCell(r, 4).value = `${formatDate(c.fecha)}: ${c.nuevo_estatus} - ${c.motivo}`;
    });

    return await workbook.xlsx.writeBuffer();
}

// Helpers
function formatCita(cita: any): string {
    if (!cita) return '';
    const d = new Date(cita.fecha_encuentro || cita.fecha_cita);
    return !isNaN(d.getTime()) ? d.toLocaleDateString('es-VE') : '';
}

/**
 * Ajusta automáticamente el ancho de las columnas basado en el contenido
 * Ignora celdas mergeadas para evitar romper el layout del formulario
 */
function autoAdjustColumnWidth(worksheet: ExcelJS.Worksheet) {
    worksheet.columns.forEach(column => {
        let maxLength = 0;
        column && column.eachCell && column.eachCell({ includeEmpty: true }, (cell) => {
            if (!cell.isMerged && cell.value) {
                const columnLength = cell.value.toString().length;
                if (columnLength > maxLength) {
                    maxLength = columnLength;
                }
            }
        });

        const desiredWidth = maxLength + 2;
        const currentWidth = column.width || 10;

        if (desiredWidth > currentWidth) {
            column.width = Math.min(desiredWidth, 100);
        }
    });
}
