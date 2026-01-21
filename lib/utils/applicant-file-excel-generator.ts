import ExcelJS from 'exceljs';
import { SolicitanteFichaData } from '../types/report-types';
import { calculateAge } from './date-formatter';

/**
 * Genera un archivo Excel con el diseño exacto de "REGISTRO Y CONTROL DE BENEFICIARIOS"
 * Replicando el diseño del PDF
 */
export async function generateSolicitanteFichaExcel(data: SolicitanteFichaData): Promise<ArrayBuffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema de Gestión de Clínicas Jurídicas';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Registro Beneficiarios', {
        pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, horizontalCentered: true },
        views: [{ showGridLines: false }]
    });

    // 55 columnas para granularidad
    const totalCols = 55;
    const columns = [];
    for (let i = 0; i < totalCols; i++) {
        columns.push({ width: 2.8 });
    }
    sheet.columns = columns;

    // ESTILOS
    const fontNormal = { name: 'Arial', size: 8 };
    const fontBold = { name: 'Arial', size: 8, bold: true };
    const fontSection = { name: 'Arial', size: 9, bold: true };
    const borderBottom = { bottom: { style: 'thin' } } as const;
    const borderBox = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } } as const;
    const alignCenter = { horizontal: 'center', vertical: 'middle' } as const;
    const fillSection = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } } as const;

    const s = data.solicitante || {};
    const beneficiarios = data.beneficiarios || [];
    let r = 2;

    // Calculate derived values
    const trabaja = !!s.nombre_trabajo && s.nombre_trabajo !== 'No trabaja';
    const ninos = beneficiarios.filter(b => {
        const age = b.edad || (b.fecha_nac ? calculateAge(b.fecha_nac) : 0);
        return age >= 7 && age <= 12;
    }).length;

    // ==========================================
    // ENCABEZADO
    // ==========================================
    try {
        const logoResponse = await fetch('/logo escuela derecho.png');
        if (logoResponse.ok) {
            const logoBlob = await logoResponse.blob();
            const logoBuffer = await logoBlob.arrayBuffer();
            const imageId = workbook.addImage({ buffer: logoBuffer, extension: 'png' });
            sheet.addImage(imageId, { tl: { col: 1, row: 1 }, ext: { width: 250, height: 45 } });
        }
    } catch { /* fallback */ }

    r = 4;
    sheet.mergeCells(r, 1, r, 55);
    const titleCell = sheet.getCell(r, 1);
    titleCell.value = 'REGISTRO Y CONTROL DE BENEFICIARIOS';
    titleCell.font = { name: 'Arial', size: 11, bold: true };
    titleCell.alignment = alignCenter;

    r += 2;

    // ==========================================
    // I. IDENTIFICACIÓN
    // ==========================================
    sheet.mergeCells(r, 1, r, 55);
    const sec1 = sheet.getCell(r, 1);
    sec1.value = 'I. IDENTIFICACIÓN';
    sec1.font = fontSection;
    sec1.fill = fillSection;
    sec1.alignment = alignCenter;
    sec1.border = borderBox;
    r += 2;

    // 1. Fecha
    sheet.mergeCells(r, 40, r, 44);
    sheet.getCell(r, 40).value = '1. Fecha:';
    sheet.getCell(r, 40).font = fontBold;
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = String(now.getFullYear());
    drawBox(sheet, r, 46, dd[0]); drawBox(sheet, r, 47, dd[1]);
    drawBox(sheet, r, 49, mm[0]); drawBox(sheet, r, 50, mm[1]);
    drawBox(sheet, r, 52, yyyy[0]); drawBox(sheet, r, 53, yyyy[1]); drawBox(sheet, r, 54, yyyy[2]); drawBox(sheet, r, 55, yyyy[3]);
    r += 2;

    // 2. Núcleo
    sheet.mergeCells(r, 40, r, 44);
    sheet.getCell(r, 40).value = '2. Núcleo:';
    sheet.getCell(r, 40).font = fontBold;
    sheet.mergeCells(r, 46, r, 55);
    sheet.getCell(r, 46).value = s.nombre_nucleo || '';
    sheet.getCell(r, 46).border = borderBottom;
    r += 2;

    // Nombres y Apellidos | C.I.
    sheet.mergeCells(r, 1, r, 8);
    sheet.getCell(r, 1).value = 'Nombres y Apellidos:';
    sheet.getCell(r, 1).font = fontBold;
    sheet.mergeCells(r, 9, r, 38);
    sheet.getCell(r, 9).value = `${s.nombres || ''} ${s.apellidos || ''}`;
    sheet.getCell(r, 9).border = borderBottom;
    sheet.mergeCells(r, 39, r, 43);
    sheet.getCell(r, 39).value = '3. C.I. N°:';
    sheet.getCell(r, 39).font = fontBold;
    sheet.mergeCells(r, 44, r, 55);
    sheet.getCell(r, 44).value = s.cedula || '';
    sheet.getCell(r, 44).border = borderBottom;
    sheet.getCell(r, 44).alignment = alignCenter;
    r += 2;

    // 4. Tel local | 5. Celular | 6. Correo
    sheet.mergeCells(r, 1, r, 5);
    sheet.getCell(r, 1).value = '4. Tel. local:';
    sheet.getCell(r, 1).font = fontBold;
    sheet.mergeCells(r, 6, r, 14);
    sheet.getCell(r, 6).value = s.telefono_local || '';
    sheet.getCell(r, 6).border = borderBottom;
    sheet.mergeCells(r, 16, r, 20);
    sheet.getCell(r, 16).value = '5. Celular:';
    sheet.getCell(r, 16).font = fontBold;
    sheet.mergeCells(r, 21, r, 30);
    sheet.getCell(r, 21).value = s.telefono_celular || '';
    sheet.getCell(r, 21).border = borderBottom;
    sheet.mergeCells(r, 32, r, 36);
    sheet.getCell(r, 32).value = '6. Correo:';
    sheet.getCell(r, 32).font = fontBold;
    sheet.mergeCells(r, 37, r, 55);
    sheet.getCell(r, 37).value = s.correo_electronico || '';
    sheet.getCell(r, 37).border = borderBottom;
    sheet.getCell(r, 37).font = { size: 7 };
    r += 2;

    // 7. Estado, Municipio y Parroquia
    sheet.mergeCells(r, 1, r, 16);
    sheet.getCell(r, 1).value = '7. Estado, Municipio y Parroquia:';
    sheet.getCell(r, 1).font = fontBold;
    sheet.mergeCells(r, 17, r, 55);
    const locationParts = [s.nombre_estado, s.nombre_municipio, s.nombre_parroquia].filter(Boolean);
    sheet.getCell(r, 17).value = locationParts.join(', ') || '';
    sheet.getCell(r, 17).border = borderBottom;
    r += 2;

    // 8. Sexo | 9. Fecha Nac | 10. Nacionalidad
    sheet.getCell(r, 1).value = '8. Sexo:';
    sheet.getCell(r, 1).font = fontBold;
    sheet.getCell(r, 4).value = 'M';
    drawBox(sheet, r, 5, s.sexo === 'M' ? 'X' : '');
    sheet.getCell(r, 7).value = 'F';
    drawBox(sheet, r, 8, s.sexo === 'F' ? 'X' : '');

    sheet.mergeCells(r, 10, r, 15);
    sheet.getCell(r, 10).value = '9. Fecha Nac:';
    sheet.getCell(r, 10).font = fontBold;
    if (s.fecha_nacimiento) {
        const fn = new Date(s.fecha_nacimiento);
        const fdd = String(fn.getDate()).padStart(2, '0');
        const fmm = String(fn.getMonth() + 1).padStart(2, '0');
        const fyyyy = String(fn.getFullYear());
        drawBox(sheet, r, 16, fdd[0]); drawBox(sheet, r, 17, fdd[1]);
        drawBox(sheet, r, 19, fmm[0]); drawBox(sheet, r, 20, fmm[1]);
        drawBox(sheet, r, 22, fyyyy[0]); drawBox(sheet, r, 23, fyyyy[1]); drawBox(sheet, r, 24, fyyyy[2]); drawBox(sheet, r, 25, fyyyy[3]);
    }

    sheet.mergeCells(r, 28, r, 34);
    sheet.getCell(r, 28).value = '10. Nacionalidad:';
    sheet.getCell(r, 28).font = fontBold;
    sheet.getCell(r, 36).value = 'Ven';
    drawBox(sheet, r, 38, (s.nacionalidad === 'V' || !s.nacionalidad) ? 'X' : '');
    sheet.getCell(r, 40).value = 'Ext';
    drawBox(sheet, r, 42, s.nacionalidad === 'E' ? 'X' : '');
    r += 2;

    // 11. Estado Civil | 12. Concubinato - Fixed boxes
    sheet.getCell(r, 1).value = '11. Estado civil:';
    sheet.getCell(r, 1).font = fontBold;
    sheet.getCell(r, 7).value = 'Soltero'; drawBox(sheet, r, 12, s.estado_civil === 'Soltero' ? 'X' : '');
    sheet.getCell(r, 14).value = 'Casado'; drawBox(sheet, r, 19, s.estado_civil === 'Casado' ? 'X' : '');
    sheet.getCell(r, 21).value = 'Divorc.'; drawBox(sheet, r, 26, s.estado_civil === 'Divorciado' ? 'X' : '');
    sheet.getCell(r, 28).value = 'Viudo'; drawBox(sheet, r, 32, s.estado_civil === 'Viudo' ? 'X' : '');
    sheet.mergeCells(r, 35, r, 41);
    sheet.getCell(r, 35).value = '12. Concubinato:';
    sheet.getCell(r, 35).font = fontBold;
    sheet.getCell(r, 43).value = 'Sí'; drawBox(sheet, r, 45, s.concubinato ? 'X' : '');
    sheet.getCell(r, 48).value = 'No'; drawBox(sheet, r, 50, !s.concubinato ? 'X' : '');
    r += 2;

    // 13. Educación alcanzada - Fixed boxes at col 10, 32, 50
    sheet.mergeCells(r, 1, r, 10);
    sheet.getCell(r, 1).value = '13. Educación alcanzada:';
    sheet.getCell(r, 1).font = fontBold;
    r++;
    sheet.getCell(r, 1).value = '0. Sin Nivel'; drawBox(sheet, r, 10, s.nivel_educativo === 'Sin Nivel' ? 'X' : '');
    sheet.getCell(r, 20).value = '12. Tec. Medio'; drawBox(sheet, r, 32, s.nivel_educativo === 'Técnico Medio' ? 'X' : '');
    sheet.getCell(r, 40).value = 'a. Años'; drawBox(sheet, r, 50, s.tipo_tiempo_estudio === 'Años' ? String(s.tiempo_estudio || '') : '');
    r++;
    sheet.getCell(r, 1).value = '1-6. Primaria'; drawBox(sheet, r, 10, s.nivel_educativo === 'Primaria' ? 'X' : '');
    sheet.getCell(r, 20).value = '13. Tec. Superior'; drawBox(sheet, r, 32, s.nivel_educativo === 'Técnico Superior' ? 'X' : '');
    sheet.getCell(r, 40).value = 'b. Semestres'; drawBox(sheet, r, 50, s.tipo_tiempo_estudio === 'Semestres' ? String(s.tiempo_estudio || '') : '');
    r++;
    sheet.getCell(r, 1).value = '7-9. Básica'; drawBox(sheet, r, 10, s.nivel_educativo === 'Básica' ? 'X' : '');
    sheet.getCell(r, 20).value = '14. Universitaria'; drawBox(sheet, r, 32, s.nivel_educativo === 'Universitaria' ? 'X' : '');
    sheet.getCell(r, 40).value = 'c. Trimestres'; drawBox(sheet, r, 50, s.tipo_tiempo_estudio === 'Trimestres' ? String(s.tiempo_estudio || '') : '');
    r++;
    sheet.getCell(r, 1).value = '10-11. Media Div.'; drawBox(sheet, r, 10, s.nivel_educativo === 'Media Diversificada' ? 'X' : '');
    r += 2;

    // 14. ¿Trabaja? - Fixed boxes
    sheet.getCell(r, 1).value = '14. ¿Trabaja?';
    sheet.getCell(r, 1).font = fontBold;
    sheet.getCell(r, 7).value = 'Sí'; drawBox(sheet, r, 10, trabaja ? 'X' : '');
    sheet.getCell(r, 12).value = 'No'; drawBox(sheet, r, 15, !trabaja ? 'X' : '');
    sheet.mergeCells(r, 18, r, 28);
    sheet.getCell(r, 18).value = '-> 14a. Condición trabajo:';
    sheet.getCell(r, 18).font = fontBold;
    sheet.getCell(r, 30).value = 'Patrono'; drawBox(sheet, r, 36, s.nombre_trabajo === 'Patrono' ? 'X' : '');
    sheet.getCell(r, 38).value = 'Empleado'; drawBox(sheet, r, 44, s.nombre_trabajo === 'Empleado' ? 'X' : '');
    sheet.getCell(r, 46).value = 'Obrero'; drawBox(sheet, r, 51, s.nombre_trabajo === 'Obrero' ? 'X' : '');
    sheet.getCell(r, 53).value = 'C. propia'; drawBox(sheet, r, 55, s.nombre_trabajo === 'Cuenta propia' ? 'X' : '');
    r++;
    // 14b, 14c
    sheet.mergeCells(r, 1, r, 10);
    sheet.getCell(r, 1).value = '-> 14b. ¿Busca trabajo?';
    sheet.getCell(r, 1).font = fontBold;
    sheet.getCell(r, 12).value = 'Sí'; drawBox(sheet, r, 15, '');
    sheet.getCell(r, 17).value = 'No'; drawBox(sheet, r, 20, '');
    sheet.mergeCells(r, 23, r, 35);
    sheet.getCell(r, 23).value = '-> 14c. Condición actividad:';
    sheet.getCell(r, 23).font = fontBold;
    r++;
    sheet.getCell(r, 23).value = 'Ama de casa'; drawBox(sheet, r, 32, (s.nombre_actividad === 'Ama de Casa' || s.nombre_actividad === 'Ama de casa') ? 'X' : '');
    sheet.getCell(r, 34).value = 'Estudiante'; drawBox(sheet, r, 42, s.nombre_actividad === 'Estudiante' ? 'X' : '');
    sheet.getCell(r, 44).value = 'Pensionado'; drawBox(sheet, r, 52, (s.nombre_actividad === 'Pensionado/Jubilado' || s.nombre_actividad === 'Pensionado') ? 'X' : '');
    sheet.getCell(r, 54).value = 'Otra'; drawBox(sheet, r, 55, s.nombre_actividad === 'Otra' ? 'X' : '');
    r += 2;

    // ==========================================
    // II. VIVIENDA Y SERVICIOS CONEXOS
    // ==========================================
    sheet.mergeCells(r, 1, r, 55);
    const sec2 = sheet.getCell(r, 1);
    sec2.value = 'II. VIVIENDA Y SERVICIOS CONEXOS';
    sec2.font = fontSection;
    sec2.fill = fillSection;
    sec2.alignment = alignCenter;
    sec2.border = borderBox;
    r += 2;

    // 15. Tipo vivienda (horizontal)
    sheet.mergeCells(r, 1, r, 20);
    sheet.getCell(r, 1).value = '15. ¿En qué tipo de vivienda habita?';
    sheet.getCell(r, 1).font = fontBold;
    r++;
    // Row 1: 4 options
    sheet.getCell(r, 1).value = '1. Quinta/Casa'; drawBox(sheet, r, 8, (s.tipo_vivienda === 'Quinta' || s.tipo_vivienda === 'Casa Urb.') ? 'X' : '');
    sheet.getCell(r, 11).value = '2. Apto'; drawBox(sheet, r, 16, s.tipo_vivienda === 'Apartamento' ? 'X' : '');
    sheet.getCell(r, 19).value = '3. Bloque'; drawBox(sheet, r, 24, s.tipo_vivienda === 'Bloque' ? 'X' : '');
    sheet.getCell(r, 27).value = '4. Casa Barrio'; drawBox(sheet, r, 35, s.tipo_vivienda === 'Casa de Barrio' ? 'X' : '');
    sheet.getCell(r, 38).value = '5. Rural'; drawBox(sheet, r, 43, s.tipo_vivienda === 'Casa rural' ? 'X' : '');
    sheet.getCell(r, 46).value = '6. Rancho'; drawBox(sheet, r, 52, s.tipo_vivienda === 'Rancho' ? 'X' : '');
    r++;
    // Row 2: 2 options
    sheet.getCell(r, 1).value = '7. Refugio'; drawBox(sheet, r, 8, s.tipo_vivienda === 'Refugio' ? 'X' : '');
    sheet.getCell(r, 11).value = '8. Otro'; drawBox(sheet, r, 16, '');
    r += 2;

    // 16. Habitaciones | 17. Baños
    sheet.mergeCells(r, 1, r, 16);
    sheet.getCell(r, 1).value = '16. ¿Cuántas habitaciones para dormir?';
    sheet.getCell(r, 1).font = fontBold;
    drawBox(sheet, r, 18, String(s.cant_habitaciones || ''));
    sheet.mergeCells(r, 28, r, 40);
    sheet.getCell(r, 28).value = '17. ¿Cuántos baños tiene?';
    sheet.getCell(r, 28).font = fontBold;
    drawBox(sheet, r, 42, String(s.cant_banos || ''));
    r += 2;

    // 18, 19, 20 Materials - Fixed columns: Label1@1, Box1@10 | Label2@19, Box2@33 | Label3@37, Box3@52
    sheet.getCell(r, 1).value = '18. Material piso';
    sheet.getCell(r, 1).font = fontBold;
    sheet.getCell(r, 19).value = '19. Material paredes';
    sheet.getCell(r, 19).font = fontBold;
    sheet.getCell(r, 37).value = '20. Material techo';
    sheet.getCell(r, 37).font = fontBold;
    r++;
    sheet.getCell(r, 1).value = '1. Tierra'; drawBox(sheet, r, 10, s.material_piso === 'Tierra' ? 'X' : '');
    sheet.getCell(r, 19).value = '1. Cartón/Palma'; drawBox(sheet, r, 33, s.material_paredes?.includes('Cartón') ? 'X' : '');
    sheet.getCell(r, 37).value = '1. Madera/Cartón'; drawBox(sheet, r, 52, s.material_techo?.includes('Madera') ? 'X' : '');
    r++;
    sheet.getCell(r, 1).value = '2. Cemento'; drawBox(sheet, r, 10, s.material_piso === 'Cemento' ? 'X' : '');
    sheet.getCell(r, 19).value = '2. Bahareque'; drawBox(sheet, r, 33, s.material_paredes === 'Bahareque' ? 'X' : '');
    sheet.getCell(r, 37).value = '2. Zinc/Acerolit'; drawBox(sheet, r, 52, s.material_techo?.includes('Zinc') ? 'X' : '');
    r++;
    sheet.getCell(r, 1).value = '3. Cerámica'; drawBox(sheet, r, 10, s.material_piso === 'Cerámica' ? 'X' : '');
    sheet.getCell(r, 19).value = '3. Bloque sin frizar'; drawBox(sheet, r, 33, s.material_paredes === 'Bloque sin frizar' ? 'X' : '');
    sheet.getCell(r, 37).value = '3. Platabanda/Tejas'; drawBox(sheet, r, 52, s.material_techo?.includes('Platabanda') ? 'X' : '');
    r++;
    sheet.getCell(r, 1).value = '4. Granito/Mármol'; drawBox(sheet, r, 10, s.material_piso?.includes('Granito') ? 'X' : '');
    sheet.getCell(r, 19).value = '4. Bloque frizado'; drawBox(sheet, r, 33, s.material_paredes === 'Bloque frizado' ? 'X' : '');
    r += 2;

    // 21, 22, 23 Services - Same fixed columns: Box1@10, Box2@33, Box3@52
    sheet.getCell(r, 1).value = '21. Agua potable';
    sheet.getCell(r, 1).font = fontBold;
    sheet.getCell(r, 19).value = '22. Eliminación excretas';
    sheet.getCell(r, 19).font = fontBold;
    sheet.getCell(r, 37).value = '23. Servicio aseo';
    sheet.getCell(r, 37).font = fontBold;
    r++;
    sheet.getCell(r, 1).value = '1. Dentro vivienda'; drawBox(sheet, r, 10, s.agua_potable === 'Dentro de la vivienda' ? 'X' : '');
    sheet.getCell(r, 19).value = '1. Poceta/cloaca'; drawBox(sheet, r, 33, s.eliminacion_aguas_n?.includes('Poceta') ? 'X' : '');
    sheet.getCell(r, 37).value = '1. Llega vivienda'; drawBox(sheet, r, 52, s.aseo === 'Llega a la vivienda' ? 'X' : '');
    r++;
    sheet.getCell(r, 1).value = '2. Fuera vivienda'; drawBox(sheet, r, 10, s.agua_potable === 'Fuera de la vivienda' ? 'X' : '');
    sheet.getCell(r, 19).value = '2. Poceta sin conexión'; drawBox(sheet, r, 33, s.eliminacion_aguas_n?.includes('sin conexión') ? 'X' : '');
    sheet.getCell(r, 37).value = '2. No llega'; drawBox(sheet, r, 52, (s.aseo === 'No llega a la vivienda' || s.aseo === 'Container') ? 'X' : '');
    r++;
    sheet.getCell(r, 1).value = '3. No tiene'; drawBox(sheet, r, 10, s.agua_potable === 'No tiene' ? 'X' : '');
    sheet.getCell(r, 19).value = '3. Letrina'; drawBox(sheet, r, 33, s.eliminacion_aguas_n?.includes('letrina') ? 'X' : '');
    sheet.getCell(r, 37).value = '3. No tiene'; drawBox(sheet, r, 52, s.aseo === 'No tiene' ? 'X' : '');
    r++;
    sheet.getCell(r, 19).value = '4. No tiene'; drawBox(sheet, r, 33, s.eliminacion_aguas_n === 'No tiene' ? 'X' : '');
    r += 2;

    // 24. Artefactos domésticos - Fixed boxes: @8, @19, @33, @52
    sheet.mergeCells(r, 1, r, 28);
    sheet.getCell(r, 1).value = '24. Artefactos domésticos, bienes o servicios del hogar';
    sheet.getCell(r, 1).font = fontBold;
    r++;
    const artefactos = s.artefactos_domesticos || [];
    sheet.getCell(r, 1).value = '1. Nevera'; drawBox(sheet, r, 8, artefactos.includes?.('Nevera') ? 'X' : '');
    sheet.getCell(r, 11).value = '2. Lavadora'; drawBox(sheet, r, 19, artefactos.includes?.('Lavadora') ? 'X' : '');
    sheet.getCell(r, 23).value = '3. Computadora'; drawBox(sheet, r, 33, artefactos.includes?.('Computadora') ? 'X' : '');
    sheet.getCell(r, 37).value = '4. Cable Satelital'; drawBox(sheet, r, 52, artefactos.includes?.('Cable Satelital') ? 'X' : '');
    r++;
    sheet.getCell(r, 1).value = '5. Internet'; drawBox(sheet, r, 8, artefactos.includes?.('Internet') ? 'X' : '');
    sheet.getCell(r, 11).value = '6. Carro'; drawBox(sheet, r, 19, artefactos.includes?.('Carro') ? 'X' : '');
    sheet.getCell(r, 23).value = '7. Moto'; drawBox(sheet, r, 33, artefactos.includes?.('Moto') ? 'X' : '');
    r += 2;

    // ==========================================
    // III. FAMILIA Y HOGAR
    // ==========================================
    sheet.mergeCells(r, 1, r, 55);
    const sec3 = sheet.getCell(r, 1);
    sec3.value = 'III. FAMILIA Y HOGAR';
    sec3.font = fontSection;
    sec3.fill = fillSection;
    sec3.alignment = alignCenter;
    sec3.border = borderBox;
    r += 2;

    // 24. Personas en vivienda
    sheet.mergeCells(r, 1, r, 25);
    sheet.getCell(r, 1).value = '24. ¿Cuántas personas viven en la vivienda?';
    sheet.getCell(r, 1).font = fontBold;
    const cantPersonasStr = String(s.cant_personas || '0');
    drawBox(sheet, r, 27, cantPersonasStr[0] || '0');
    drawBox(sheet, r, 28, cantPersonasStr[1] || '');
    r += 2;

    // 25. Jefe de hogar + 25a. Educación jefe (lado a lado como en PDF)
    sheet.mergeCells(r, 1, r, 10);
    sheet.getCell(r, 1).value = '25. ¿Es usted jefe de hogar?';
    sheet.getCell(r, 1).font = fontBold;
    // 25a título a la derecha
    sheet.mergeCells(r, 20, r, 38);
    sheet.getCell(r, 20).value = '-> 25a. Educación alcanzada por el jefe de hogar:';
    sheet.getCell(r, 20).font = fontBold;
    // Tiempo de estudio - extremo derecho
    sheet.getCell(r, 45).value = 'a. Años'; drawBox(sheet, r, 52, s.tipo_tiempo_estudio_jefe === 'Años' ? String(s.tiempo_estudio_jefe || '') : '');
    r++;
    // Fila 1: Sí + Sin Nivel
    sheet.getCell(r, 1).value = '1. Sí'; drawBox(sheet, r, 5, s.jefe_hogar ? 'X' : '');
    sheet.getCell(r, 20).value = '0. Sin Nivel'; drawBox(sheet, r, 30, s.nivel_educativo_jefe === 'Sin Nivel' ? 'X' : '');
    sheet.getCell(r, 45).value = 'b. Semestres'; drawBox(sheet, r, 52, s.tipo_tiempo_estudio_jefe === 'Semestres' ? String(s.tiempo_estudio_jefe || '') : '');
    r++;
    // Fila 2: No + Primaria
    sheet.getCell(r, 1).value = '2. No'; drawBox(sheet, r, 5, !s.jefe_hogar ? 'X' : '');
    sheet.getCell(r, 20).value = '1-6. Primaria'; drawBox(sheet, r, 30, s.nivel_educativo_jefe === 'Primaria' ? 'X' : '');
    sheet.getCell(r, 45).value = 'c. Trimestres'; drawBox(sheet, r, 52, s.tipo_tiempo_estudio_jefe === 'Trimestres' ? String(s.tiempo_estudio_jefe || '') : '');
    r++;
    // Fila 3: Básica
    sheet.getCell(r, 20).value = '7-9. Básica'; drawBox(sheet, r, 30, s.nivel_educativo_jefe === 'Básica' ? 'X' : '');
    r++;
    // Fila 4: Media Div
    sheet.getCell(r, 20).value = '10-11. Media Div.'; drawBox(sheet, r, 30, s.nivel_educativo_jefe === 'Media Diversificada' ? 'X' : '');
    r++;
    // Fila 5: Tec Medio
    sheet.getCell(r, 20).value = '12. Tec. Medio'; drawBox(sheet, r, 30, s.nivel_educativo_jefe === 'Técnico Medio' ? 'X' : '');
    r++;
    // Fila 6: Tec Superior
    sheet.getCell(r, 20).value = '13. Tec. Superior'; drawBox(sheet, r, 30, s.nivel_educativo_jefe === 'Técnico Superior' ? 'X' : '');
    r++;
    // Fila 7: Univ
    sheet.getCell(r, 20).value = '14. Univ.'; drawBox(sheet, r, 30, s.nivel_educativo_jefe === 'Universitaria' ? 'X' : '');
    r += 2;

    // 26. Trabajan | 27. No trabajan
    sheet.mergeCells(r, 1, r, 16);
    sheet.getCell(r, 1).value = '26. ¿Cuántos miembros trabajan?';
    sheet.getCell(r, 1).font = fontBold;
    drawBox(sheet, r, 18, String(s.cant_trabajadores || '')[0] || '');
    drawBox(sheet, r, 19, String(s.cant_trabajadores || '')[1] || '');
    sheet.mergeCells(r, 28, r, 42);
    sheet.getCell(r, 28).value = '27. ¿Cuántos NO trabajan?';
    sheet.getCell(r, 28).font = fontBold;
    drawBox(sheet, r, 44, String(s.cant_no_trabajadores || '')[0] || '');
    drawBox(sheet, r, 45, String(s.cant_no_trabajadores || '')[1] || '');
    r += 2;

    // 28. Niños | 28a. Estudian
    sheet.mergeCells(r, 1, r, 18);
    sheet.getCell(r, 1).value = '28. Niños entre 7 y 12 años:';
    sheet.getCell(r, 1).font = fontBold;
    drawBox(sheet, r, 20, String(ninos)[0] || '0');
    drawBox(sheet, r, 21, String(ninos)[1] || '');
    sheet.mergeCells(r, 28, r, 38);
    sheet.getCell(r, 28).value = '-> 28a. ¿Cuántos estudian?';
    sheet.getCell(r, 28).font = fontBold;
    drawBox(sheet, r, 40, String(s.cant_ninos_estudiando || '')[0] || '');
    drawBox(sheet, r, 41, String(s.cant_ninos_estudiando || '')[1] || '');
    r += 2;

    // 29. Ingresos mensuales
    sheet.mergeCells(r, 1, r, 14);
    sheet.getCell(r, 1).value = '29. Ingresos mensuales del hogar:';
    sheet.getCell(r, 1).font = fontBold;
    sheet.mergeCells(r, 15, r, 35);
    sheet.getCell(r, 15).value = s.ingresos_mensuales || '';
    sheet.getCell(r, 15).border = borderBottom;
    r += 4;

    // SIGNATURES
    sheet.mergeCells(r, 1, r, 4);
    sheet.getCell(r, 1).value = '30. Alumno:';
    sheet.getCell(r, 1).font = fontBold;
    sheet.mergeCells(r, 5, r, 22);
    sheet.getCell(r, 5).border = borderBottom;
    sheet.mergeCells(r, 28, r, 32);
    sheet.getCell(r, 28).value = '31. Profesor:';
    sheet.getCell(r, 28).font = fontBold;
    sheet.mergeCells(r, 33, r, 50);
    sheet.getCell(r, 33).border = borderBottom;

    return await workbook.xlsx.writeBuffer();
}

function drawBox(sheet: ExcelJS.Worksheet, row: number, col: number, value: string) {
    const cell = sheet.getCell(row, col);
    cell.value = value;
    cell.border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.font = { bold: true };
}
