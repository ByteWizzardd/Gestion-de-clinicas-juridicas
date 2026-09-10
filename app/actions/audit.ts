'use server';

import { auditoriaQueries } from '@/lib/db/queries/auditoria/get-eventos';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { mapSystemRoleToSidebarRole } from '@/lib/utils/role-mapper';

export interface GetAuditoriaResult {
  success: boolean;
  data?: any[];
  error?: {
    message: string;
    code?: string;
  };
}

async function requireCoordinador() {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user || mapSystemRoleToSidebarRole(authResult.user.rol) !== 'coordinator') {
    throw new Error('No autorizado para ver la auditoría');
  }
  return authResult.user;
}

/**
 * Obtiene el historial global unificado de auditoría.
 */
export async function getAuditoriaEventosAction(limit = 1000): Promise<GetAuditoriaResult> {
  try {
    await requireCoordinador();

    const eventos = await auditoriaQueries.getAllEventos(limit);

    return {
      success: true,
      data: eventos
    };
  } catch (error: any) {
    console.error('Error en getAuditoriaEventosAction:', error);
    return {
      success: false,
      error: { message: error?.message || 'Error interno al obtener eventos de auditoría', code: 'UNAUTHORIZED' }
    };
  }
}

/**
 * Obtiene los contadores de auditoría para el dashboard principal.
 * Igual que getAuditoriaEventosAction, restringido a coordinadores.
 */
export async function getAuditCountsAction() {
  try {
    await requireCoordinador();

    return await auditoriaQueries.getAuditCounts();
  } catch (error) {
    console.error('Error en getAuditCountsAction:', error);
    throw new Error('Error al obtener los contadores de auditoría');
  }
}

export interface GetSesionesAuditOptions {
  busqueda?: string;
  limit?: number;
  offset?: number;
  type?: 'logins' | 'logouts' | 'failed';
  sortOrder?: 'asc' | 'desc';
  idUsuario?: string;
  fechaInicio?: string | Date;
  fechaFin?: string | Date;
}

/**
 * Obtiene los registros de auditoría de sesiones (logins, logouts, fallidos).
 */
export async function getSesionesAuditAction(options: GetSesionesAuditOptions = {}) {
  await requireCoordinador();

  const { auditoriaSesionesQueries } = await import('@/lib/db/queries/auditoria-sesiones.queries');

  const {
    busqueda,
    limit = 50,
    offset = 0,
    type = 'logins',
    sortOrder = 'desc',
    idUsuario,
    fechaInicio,
    fechaFin
  } = options;

  const startDate = fechaInicio ? new Date(fechaInicio) : undefined;
  const endDate = fechaFin ? new Date(fechaFin) : undefined;

  let records: any[] = [];
  let total = 0;

  if (type === 'failed') {
    if (busqueda && busqueda.trim()) {
      records = await auditoriaSesionesQueries.searchFailed(busqueda.trim(), limit, offset, sortOrder, idUsuario, startDate, endDate);
      total = await auditoriaSesionesQueries.countSearchFailed(busqueda.trim(), idUsuario, startDate, endDate);
    } else {
      records = await auditoriaSesionesQueries.getFailed(limit, offset, sortOrder, idUsuario, startDate, endDate);
      total = await auditoriaSesionesQueries.countFailed(idUsuario, startDate, endDate);
    }
  } else if (type === 'logouts') {
    if (busqueda && busqueda.trim()) {
      records = await auditoriaSesionesQueries.searchLogouts(busqueda.trim(), limit, offset, sortOrder, idUsuario, startDate, endDate);
      total = await auditoriaSesionesQueries.countSearchLogouts(busqueda.trim(), idUsuario, startDate, endDate);
    } else {
      records = await auditoriaSesionesQueries.getLogouts(limit, offset, sortOrder, idUsuario, startDate, endDate);
      total = await auditoriaSesionesQueries.countLogouts(idUsuario, startDate, endDate);
    }
  } else {
    // logins
    if (busqueda && busqueda.trim()) {
      records = await auditoriaSesionesQueries.searchLogins(busqueda.trim(), limit, offset, sortOrder, idUsuario, startDate, endDate);
      total = await auditoriaSesionesQueries.countSearchLogins(busqueda.trim(), idUsuario, startDate, endDate);
    } else {
      records = await auditoriaSesionesQueries.getLogins(limit, offset, sortOrder, idUsuario, startDate, endDate);
      total = await auditoriaSesionesQueries.countLogins(idUsuario, startDate, endDate);
    }
  }

  return {
    records,
    total
  };
}

// Helper genérico para los endpoints del detalle de auditoría por módulo
async function getEventosHelper(entidad: string, operacion?: string, filters?: any) {
  try {
    await requireCoordinador();
    const { auditoriaEventosQueries } = await import('@/lib/db/queries/auditoria-eventos.queries');
    const page = await auditoriaEventosQueries.getEventos({
      entidad,
      operacion: operacion as any,
      busqueda: filters?.busqueda,
      idUsuario: filters?.idUsuario,
      fechaInicio: filters?.fechaInicio,
      fechaFin: filters?.fechaFin,
      limit: filters?.limit ?? 1000,
      offset: filters?.offset ?? 0,
    });
    return page.eventos || [];
  } catch (error) {
    return [];
  }
}


export async function getSoportesAuditAction(filters?: any) { return getEventosHelper('soporte', 'eliminacion', filters); }
export async function getSoportesCreadosAuditAction(filters?: any) { return getEventosHelper('soporte', 'insercion', filters); }
export async function getDescargasSoportesAuditAction(filters?: any) {
  const records = await getEventosHelper('soporte', 'descarga_soporte', filters);
  return { records, total: records.length };
}

export async function getCitasEliminadasAuditAction(filters?: any) { return getEventosHelper('cita', 'eliminacion', filters); }
export async function getCitasActualizadasAuditAction(filters?: any) { return getEventosHelper('cita', 'actualizacion', filters); }
export async function getCitasCreadasAuditAction(filters?: any) { return getEventosHelper('cita', 'insercion', filters); }

export async function getUsuariosEliminadosAuditAction(filters?: any) { return getEventosHelper('usuario', 'eliminacion', filters); }
export async function getUsuariosHabilitadosAuditAction(filters?: any) { return getEventosHelper('usuario', 'actualizacion', filters); }
export async function getUsuariosActualizadosCamposAuditAction(filters?: any) { return getEventosHelper('usuario', 'actualizacion', filters); }
export async function getUsuariosCreadosAuditAction(filters?: any) { return getEventosHelper('usuario', 'insercion', filters); }
export async function getEstudiantesInscritosAuditAction(filters?: any) { return getEventosHelper('estudiante', 'insercion', filters); }
export async function getProfesoresInscritosAuditAction(filters?: any) { return getEventosHelper('profesor', 'insercion', filters); }

export async function getSolicitantesEliminadosAuditAction(filters?: any) { return getEventosHelper('solicitante', 'eliminacion', filters); }
export async function getSolicitantesActualizadosAuditAction(filters?: any) { return getEventosHelper('solicitante', 'actualizacion', filters); }
export async function getSolicitantesCreadosAuditAction(filters?: any) { return getEventosHelper('solicitante', 'insercion', filters); }

export async function getEstadosEliminadosAuditAction(filters?: any) { return getEventosHelper('estado', 'eliminacion', filters); }
export async function getEstadosActualizadosAuditAction(filters?: any) { return getEventosHelper('estado', 'actualizacion', filters); }
export async function getEstadosInsertadosAuditAction(filters?: any) { return getEventosHelper('estado', 'insercion', filters); }

export async function getMateriasEliminadasAuditAction(filters?: any) { return getEventosHelper('materia', 'eliminacion', filters); }
export async function getMateriasActualizadasAuditAction(filters?: any) { return getEventosHelper('materia', 'actualizacion', filters); }
export async function getMateriasInsertadasAuditAction(filters?: any) { return getEventosHelper('materia', 'insercion', filters); }

export async function getNivelesEducativosEliminadosAuditAction(filters?: any) { return getEventosHelper('nivel_educativo', 'eliminacion', filters); }
export async function getNivelesEducativosActualizadosAuditAction(filters?: any) { return getEventosHelper('nivel_educativo', 'actualizacion', filters); }
export async function getNivelesEducativosInsertadosAuditAction(filters?: any) { return getEventosHelper('nivel_educativo', 'insercion', filters); }

export async function getNucleosEliminadosAuditAction(filters?: any) { return getEventosHelper('nucleo', 'eliminacion', filters); }
export async function getNucleosActualizadosAuditAction(filters?: any) { return getEventosHelper('nucleo', 'actualizacion', filters); }
export async function getNucleosInsertadosAuditAction(filters?: any) { return getEventosHelper('nucleo', 'insercion', filters); }

export async function getCondicionesTrabajoEliminadasAuditAction(filters?: any) { return getEventosHelper('condicion_trabajo', 'eliminacion', filters); }
export async function getCondicionesTrabajoActualizadasAuditAction(filters?: any) { return getEventosHelper('condicion_trabajo', 'actualizacion', filters); }
export async function getCondicionesTrabajoInsertadasAuditAction(filters?: any) { return getEventosHelper('condicion_trabajo', 'insercion', filters); }

export async function getCondicionesActividadEliminadasAuditAction(filters?: any) { return getEventosHelper('condicion_actividad', 'eliminacion', filters); }
export async function getCondicionesActividadActualizadasAuditAction(filters?: any) { return getEventosHelper('condicion_actividad', 'actualizacion', filters); }
export async function getCondicionesActividadInsertadasAuditAction(filters?: any) { return getEventosHelper('condicion_actividad', 'insercion', filters); }

export async function getTiposCaracteristicasEliminadosAuditAction(filters?: any) { return getEventosHelper('tipo_caracteristica', 'eliminacion', filters); }
export async function getTiposCaracteristicasActualizadosAuditAction(filters?: any) { return getEventosHelper('tipo_caracteristica', 'actualizacion', filters); }
export async function getTiposCaracteristicasInsertadosAuditAction(filters?: any) { return getEventosHelper('tipo_caracteristica', 'insercion', filters); }

export async function getSemestresEliminadosAuditAction(filters?: any) { return getEventosHelper('semestre', 'eliminacion', filters); }
export async function getSemestresActualizadosAuditAction(filters?: any) { return getEventosHelper('semestre', 'actualizacion', filters); }
export async function getSemestresInsertadosAuditAction(filters?: any) { return getEventosHelper('semestre', 'insercion', filters); }

export async function getMunicipiosEliminadosAuditAction(filters?: any) { return getEventosHelper('municipio', 'eliminacion', filters); }
export async function getMunicipiosActualizadosAuditAction(filters?: any) { return getEventosHelper('municipio', 'actualizacion', filters); }
export async function getMunicipiosInsertadosAuditAction(filters?: any) { return getEventosHelper('municipio', 'insercion', filters); }

export async function getParroquiasEliminadasAuditAction(filters?: any) { return getEventosHelper('parroquia', 'eliminacion', filters); }
export async function getParroquiasActualizadasAuditAction(filters?: any) { return getEventosHelper('parroquia', 'actualizacion', filters); }
export async function getParroquiasInsertadasAuditAction(filters?: any) { return getEventosHelper('parroquia', 'insercion', filters); }

export async function getCategoriasEliminadasAuditAction(filters?: any) { return getEventosHelper('categoria', 'eliminacion', filters); }
export async function getCategoriasActualizadasAuditAction(filters?: any) { return getEventosHelper('categoria', 'actualizacion', filters); }
export async function getCategoriasInsertadasAuditAction(filters?: any) { return getEventosHelper('categoria', 'insercion', filters); }

export async function getSubcategoriasEliminadasAuditAction(filters?: any) { return getEventosHelper('subcategoria', 'eliminacion', filters); }
export async function getSubcategoriasActualizadasAuditAction(filters?: any) { return getEventosHelper('subcategoria', 'actualizacion', filters); }
export async function getSubcategoriasInsertadasAuditAction(filters?: any) { return getEventosHelper('subcategoria', 'insercion', filters); }

export async function getAmbitosLegalesEliminadosAuditAction(filters?: any) { return getEventosHelper('ambito_legal', 'eliminacion', filters); }
export async function getAmbitosLegalesActualizadosAuditAction(filters?: any) { return getEventosHelper('ambito_legal', 'actualizacion', filters); }
export async function getAmbitosLegalesInsertadosAuditAction(filters?: any) { return getEventosHelper('ambito_legal', 'insercion', filters); }

export async function getCaracteristicasEliminadasAuditAction(filters?: any) { return getEventosHelper('caracteristica', 'eliminacion', filters); }
export async function getCaracteristicasActualizadasAuditAction(filters?: any) { return getEventosHelper('caracteristica', 'actualizacion', filters); }
export async function getCaracteristicasInsertadasAuditAction(filters?: any) { return getEventosHelper('caracteristica', 'insercion', filters); }

export async function getCasosEliminadosAuditAction(filters?: any) { return getEventosHelper('caso', 'eliminacion', filters); }
export async function getCasosActualizadosAuditAction(filters?: any) { return getEventosHelper('caso', 'actualizacion', filters); }
export async function getCasosCreadosAuditAction(filters?: any) { return getEventosHelper('caso', 'insercion', filters); }

export async function getBeneficiariosEliminadosAuditAction(filters?: any) { return getEventosHelper('beneficiario', 'eliminacion', filters); }
export async function getBeneficiariosActualizadosAuditAction(filters?: any) { return getEventosHelper('beneficiario', 'actualizacion', filters); }
export async function getBeneficiariosInscritosAuditAction(filters?: any) { return getEventosHelper('beneficiario', 'insercion', filters); }

export async function getAccionesCreadasAuditAction(filters?: any) { return getEventosHelper('accion_ejecutores', 'insercion', filters); }
export async function getAccionesActualizadasAuditAction(filters?: any) { return getEventosHelper('accion_ejecutores', 'actualizacion', filters); }
export async function getAccionesEliminadasAuditAction(filters?: any) { return getEventosHelper('accion_ejecutores', 'eliminacion', filters); }

export async function getEquiposActualizadosAuditAction(filters?: any) { return getEventosHelper('equipo', 'actualizacion', filters); }
export async function getEquiposCreadosAuditAction(filters?: any) { return getEventosHelper('equipo', 'insercion', filters); }

export async function getReportesGeneradosAuditAction(filters?: any) { return getEventosHelper('reporte', 'generacion_reporte', filters); }
export async function getReportesVistaPreviaAuditAction(filters?: any) { return getEventosHelper('reporte', 'vista_previa_reporte', filters); }
