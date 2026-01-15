import ExcelJS from 'exceljs';
import { SolicitanteFichaData } from '../types/report-types';
import { formatDate, calculateAge } from './date-formatter';

/**
 * Genera un archivo Excel con la ficha del solicitante
 */
export async function generateSolicitanteFichaExcel(data: SolicitanteFichaData): Promise<ArrayBuffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema de Gestión de Clínicas Jurídicas';
    workbook.created = new Date();

    // 1. Información Personal (General)
    const sheetInfo = workbook.addWorksheet('Información Personal');
    sheetInfo.columns = [
        { header: 'Campo', key: 'campo', width: 35 },
        { header: 'Valor', key: 'valor', width: 60 },
    ];

    const s = data.solicitante || {};

    sheetInfo.addRows([
        { campo: 'Cédula', valor: s.cedula },
        { campo: 'Nombres', valor: s.nombres },
        { campo: 'Apellidos', valor: s.apellidos },
        { campo: 'Fecha de Nacimiento', valor: s.fecha_nac ? formatDate(s.fecha_nac) : 'N/A' },
        { campo: 'Edad', valor: s.edad ?? (s.fecha_nac ? calculateAge(s.fecha_nac) : 'N/A') },
        { campo: 'Sexo', valor: s.sexo === 'M' ? 'Masculino' : s.sexo === 'F' ? 'Femenino' : s.sexo },
        { campo: 'Lugar de Nacimiento', valor: s.lugar_nacimiento },
        { campo: 'Estado Civil', valor: s.estado_civil },
        { campo: 'Teléfono Celular', valor: s.telefono_celular },
        { campo: 'Teléfono Habitación', valor: s.telefono_habitacion },
        { campo: 'Correo Electrónico', valor: s.correo_electronico },
        { campo: 'Dirección Habitación', valor: s.direccion_habitacion },
        { campo: 'Dirección Trabajo', valor: s.direccion_trabajo || 'No trabaja' },
        { campo: 'Núcleo', valor: s.nucleo },
        { campo: 'Nivel Educativo', valor: s.nivel_educativo },
        { campo: 'Ocupación', valor: s.ocupacion },
    ]);

    // Datos Socioeconómicos
    sheetInfo.addRow({ campo: '--- DATOS SOCIOECONÓMICOS ---', valor: '' });
    sheetInfo.getRow(sheetInfo.rowCount).font = { bold: true, color: { argb: 'FF9C2327' } };

    sheetInfo.addRows([
        { campo: 'Tipo de Vivienda', valor: s.tipo_vivienda },
        { campo: 'Condición de la Vivienda', valor: `${s.tenencia_vivienda || ''}`.trim() },
        { campo: 'Ingreso Mensual Aprox.', valor: s.ingreso_mensual ? `${s.ingreso_mensual} $` : 'N/A' },
        { campo: 'Ingreso Familiar Total', valor: s.ingreso_familiar_total ? `${s.ingreso_familiar_total} $` : 'N/A' },
    ]);

    sheetInfo.getRow(1).font = { bold: true };

    // 2. Beneficiarios (Carga Familiar)
    const sheetBeneficiarios = workbook.addWorksheet('Carga Familiar');
    sheetBeneficiarios.columns = [
        { header: 'Nombre', key: 'nombre', width: 30 },
        { header: 'Edad', key: 'edad', width: 10 },
        { header: 'Parentesco', key: 'parentesco', width: 20 },
        { header: 'Ocupación', key: 'ocupacion', width: 25 },
    ];

    // El objeto solicitante a veces trae beneficiarios (carga familiar) como 'beneficiarios' o 'carga_familiar'
    // Pero en data.beneficiarios vienen los beneficiarios de los CASOS.
    // Para la ficha del solicitante, generalmente nos interesa su carga familiar directa si existe en el objeto solicitante
    // O los beneficiarios de sus casos. Vamos a mostrar los que vengan en data.beneficiarios que es lo que tenemos normalizado.

    (data.beneficiarios || []).forEach(ben => {
        sheetBeneficiarios.addRow({
            nombre: ben.nombre_completo,
            edad: ben.edad || (ben.fecha_nac ? calculateAge(ben.fecha_nac) : ''),
            parentesco: ben.parentesco,
            ocupacion: ben.ocupacion || 'N/A',
        });
    });
    sheetBeneficiarios.getRow(1).font = { bold: true };

    // 3. Historial de Casos
    const sheetCasos = workbook.addWorksheet('Historial de Casos');
    sheetCasos.columns = [
        { header: 'ID Caso', key: 'id', width: 10 },
        { header: 'Fecha Inicio', key: 'fecha', width: 15 },
        { header: 'Materia', key: 'materia', width: 20 },
        { header: 'Trámite', key: 'tramite', width: 25 },
        { header: 'Estatus', key: 'estatus', width: 15 },
        { header: 'Asunto / Detalle', key: 'asunto', width: 40 },
    ];

    (data.casos || []).sort((a, b) => new Date(b.fecha_inicio_caso || '').getTime() - new Date(a.fecha_inicio_caso || '').getTime())
        .forEach(c => {
            sheetCasos.addRow({
                id: c.id_caso,
                fecha: formatDate(c.fecha_inicio_caso),
                materia: c.nombre_materia || 'N/A',
                tramite: c.tramite || 'N/A',
                estatus: c.estatus,
                asunto: c.asunto || c.observaciones || '',
            });
        });
    sheetCasos.getRow(1).font = { bold: true };

    // Generate buffer
    return await workbook.xlsx.writeBuffer();
}
