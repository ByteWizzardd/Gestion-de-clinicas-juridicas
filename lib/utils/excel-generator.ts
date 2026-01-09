
import ExcelJS from 'exceljs';
import { CasoHistorialData, SolicitanteFichaData } from './pdf-generator-react';
import { formatDate, calculateAge } from './date-formatter';

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


    // Generate buffer
    return await workbook.xlsx.writeBuffer();
}

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
