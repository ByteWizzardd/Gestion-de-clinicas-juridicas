'use server';

import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { mapSystemRoleToSidebarRole } from '@/lib/utils/role-mapper';
import { auditoriaEliminacionSoportesQueries } from '@/lib/db/queries/auditoria-eliminacion-soportes.queries';
import { auditoriaEliminacionCitasQueries } from '@/lib/db/queries/auditoria-eliminacion-citas.queries';
import { auditoriaActualizacionCitasQueries } from '@/lib/db/queries/auditoria-actualizacion-citas.queries';
import { auditoriaEliminacionUsuarioQueries } from '@/lib/db/queries/auditoria-eliminacion-usuario.queries';
import { auditoriaActualizacionUsuariosQueries } from '@/lib/db/queries/auditoria-actualizacion-usuarios.queries';
import { auditoriaEliminacionEstadosQueries } from '@/lib/db/queries/auditoria-eliminacion-estados.queries';
import { auditoriaActualizacionEstadosQueries } from '@/lib/db/queries/auditoria-actualizacion-estados.queries';
import { auditoriaEliminacionMateriasQueries } from '@/lib/db/queries/auditoria-eliminacion-materias.queries';
import { auditoriaActualizacionMateriasQueries } from '@/lib/db/queries/auditoria-actualizacion-materias.queries';
import { auditoriaEliminacionNivelesEducativosQueries } from '@/lib/db/queries/auditoria-eliminacion-niveles-educativos.queries';
import { auditoriaActualizacionNivelesEducativosQueries } from '@/lib/db/queries/auditoria-actualizacion-niveles-educativos.queries';
import { auditoriaEliminacionNucleosQueries } from '@/lib/db/queries/auditoria-eliminacion-nucleos.queries';
import { auditoriaActualizacionNucleosQueries } from '@/lib/db/queries/auditoria-actualizacion-nucleos.queries';
import { auditoriaEliminacionCondicionesTrabajoQueries } from '@/lib/db/queries/auditoria-eliminacion-condiciones-trabajo.queries';
import { auditoriaActualizacionCondicionesTrabajoQueries } from '@/lib/db/queries/auditoria-actualizacion-condiciones-trabajo.queries';
import { auditoriaEliminacionCondicionesActividadQueries } from '@/lib/db/queries/auditoria-eliminacion-condiciones-actividad.queries';
import { auditoriaActualizacionCondicionesActividadQueries } from '@/lib/db/queries/auditoria-actualizacion-condiciones-actividad.queries';
import { auditoriaEliminacionTiposCaracteristicasQueries } from '@/lib/db/queries/auditoria-eliminacion-tipos-caracteristicas.queries';
import { auditoriaActualizacionTiposCaracteristicasQueries } from '@/lib/db/queries/auditoria-actualizacion-tipos-caracteristicas.queries';
import { auditoriaEliminacionSemestresQueries } from '@/lib/db/queries/auditoria-eliminacion-semestres.queries';
import { auditoriaActualizacionSemestresQueries } from '@/lib/db/queries/auditoria-actualizacion-semestres.queries';
import { auditoriaEliminacionMunicipiosQueries } from '@/lib/db/queries/auditoria-eliminacion-municipios.queries';
import { auditoriaActualizacionMunicipiosQueries } from '@/lib/db/queries/auditoria-actualizacion-municipios.queries';
import { auditoriaEliminacionParroquiasQueries } from '@/lib/db/queries/auditoria-eliminacion-parroquias.queries';
import { auditoriaActualizacionParroquiasQueries } from '@/lib/db/queries/auditoria-actualizacion-parroquias.queries';
import { auditoriaEliminacionCategoriasQueries } from '@/lib/db/queries/auditoria-eliminacion-categorias.queries';
import { auditoriaActualizacionCategoriasQueries } from '@/lib/db/queries/auditoria-actualizacion-categorias.queries';
import { auditoriaEliminacionSubcategoriasQueries } from '@/lib/db/queries/auditoria-eliminacion-subcategorias.queries';
import { auditoriaActualizacionSubcategoriasQueries } from '@/lib/db/queries/auditoria-actualizacion-subcategorias.queries';
import { auditoriaEliminacionAmbitosLegalesQueries } from '@/lib/db/queries/auditoria-eliminacion-ambitos-legales.queries';
import { auditoriaActualizacionAmbitosLegalesQueries } from '@/lib/db/queries/auditoria-actualizacion-ambitos-legales.queries';
import { auditoriaEliminacionCaracteristicasQueries } from '@/lib/db/queries/auditoria-eliminacion-caracteristicas.queries';
import { auditoriaActualizacionCaracteristicasQueries } from '@/lib/db/queries/auditoria-actualizacion-caracteristicas.queries';
import type { AuditFilters, AuditCounts } from '@/types/audit';

/**
 * Obtiene los contadores de cada tipo de auditoría
 */
export async function getAuditCountsAction(): Promise<AuditCounts> {
  const authResult = await requireAuthInServerActionWithCode();
  
  // Solo coordinadores pueden ver auditorías
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }

  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }

  try {
    const [
      soportes, citasEliminadas, citasActualizadas, usuariosEliminados, usuariosActualizadosCampos,
      estadosEliminados, estadosActualizados,
      materiasEliminadas, materiasActualizadas,
      nivelesEducativosEliminados, nivelesEducativosActualizados,
      nucleosEliminados, nucleosActualizados,
      condicionesTrabajoEliminadas, condicionesTrabajoActualizadas,
      condicionesActividadEliminadas, condicionesActividadActualizadas,
      tiposCaracteristicasEliminados, tiposCaracteristicasActualizados,
      semestresEliminados, semestresActualizados,
      municipiosEliminados, municipiosActualizados,
      parroquiasEliminadas, parroquiasActualizadas,
      categoriasEliminadas, categoriasActualizadas,
      subcategoriasEliminadas, subcategoriasActualizadas,
      ambitosLegalesEliminados, ambitosLegalesActualizados,
      caracteristicasEliminadas, caracteristicasActualizadas
    ] = await Promise.all([
      auditoriaEliminacionSoportesQueries.getCount(),
      auditoriaEliminacionCitasQueries.getCount(),
      auditoriaActualizacionCitasQueries.getCount(),
      auditoriaEliminacionUsuarioQueries.getCount(),
      auditoriaActualizacionUsuariosQueries.getCount(),
      // Catálogos - manejar errores si las tablas aún no existen
      auditoriaEliminacionEstadosQueries.getCount().catch(() => 0),
      auditoriaActualizacionEstadosQueries.getCount().catch(() => 0),
      auditoriaEliminacionMateriasQueries.getCount().catch(() => 0),
      auditoriaActualizacionMateriasQueries.getCount().catch(() => 0),
      auditoriaEliminacionNivelesEducativosQueries.getCount().catch(() => 0),
      auditoriaActualizacionNivelesEducativosQueries.getCount().catch(() => 0),
      auditoriaEliminacionNucleosQueries.getCount().catch(() => 0),
      auditoriaActualizacionNucleosQueries.getCount().catch(() => 0),
      auditoriaEliminacionCondicionesTrabajoQueries.getCount().catch(() => 0),
      auditoriaActualizacionCondicionesTrabajoQueries.getCount().catch(() => 0),
      auditoriaEliminacionCondicionesActividadQueries.getCount().catch(() => 0),
      auditoriaActualizacionCondicionesActividadQueries.getCount().catch(() => 0),
      auditoriaEliminacionTiposCaracteristicasQueries.getCount().catch(() => 0),
      auditoriaActualizacionTiposCaracteristicasQueries.getCount().catch(() => 0),
      auditoriaEliminacionSemestresQueries.getCount().catch(() => 0),
      auditoriaActualizacionSemestresQueries.getCount().catch(() => 0),
      auditoriaEliminacionMunicipiosQueries.getCount().catch(() => 0),
      auditoriaActualizacionMunicipiosQueries.getCount().catch(() => 0),
      auditoriaEliminacionParroquiasQueries.getCount().catch(() => 0),
      auditoriaActualizacionParroquiasQueries.getCount().catch(() => 0),
      auditoriaEliminacionCategoriasQueries.getCount().catch(() => 0),
      auditoriaActualizacionCategoriasQueries.getCount().catch(() => 0),
      auditoriaEliminacionSubcategoriasQueries.getCount().catch(() => 0),
      auditoriaActualizacionSubcategoriasQueries.getCount().catch(() => 0),
      auditoriaEliminacionAmbitosLegalesQueries.getCount().catch(() => 0),
      auditoriaActualizacionAmbitosLegalesQueries.getCount().catch(() => 0),
      auditoriaEliminacionCaracteristicasQueries.getCount().catch(() => 0),
      auditoriaActualizacionCaracteristicasQueries.getCount().catch(() => 0),
    ]);

    return {
      soportes,
      citasEliminadas,
      citasActualizadas,
      usuariosEliminados,
      usuariosActualizadosCampos,
      estadosEliminados: estadosEliminados || 0,
      estadosActualizados: estadosActualizados || 0,
      materiasEliminadas: materiasEliminadas || 0,
      materiasActualizadas: materiasActualizadas || 0,
      nivelesEducativosEliminados: nivelesEducativosEliminados || 0,
      nivelesEducativosActualizados: nivelesEducativosActualizados || 0,
      nucleosEliminados: nucleosEliminados || 0,
      nucleosActualizados: nucleosActualizados || 0,
      condicionesTrabajoEliminadas: condicionesTrabajoEliminadas || 0,
      condicionesTrabajoActualizadas: condicionesTrabajoActualizadas || 0,
      condicionesActividadEliminadas: condicionesActividadEliminadas || 0,
      condicionesActividadActualizadas: condicionesActividadActualizadas || 0,
      tiposCaracteristicasEliminados: tiposCaracteristicasEliminados || 0,
      tiposCaracteristicasActualizados: tiposCaracteristicasActualizados || 0,
      semestresEliminados: semestresEliminados || 0,
      semestresActualizados: semestresActualizados || 0,
      municipiosEliminados: municipiosEliminados || 0,
      municipiosActualizados: municipiosActualizados || 0,
      parroquiasEliminadas: parroquiasEliminadas || 0,
      parroquiasActualizadas: parroquiasActualizadas || 0,
      categoriasEliminadas: categoriasEliminadas || 0,
      categoriasActualizadas: categoriasActualizadas || 0,
      subcategoriasEliminadas: subcategoriasEliminadas || 0,
      subcategoriasActualizadas: subcategoriasActualizadas || 0,
      ambitosLegalesEliminados: ambitosLegalesEliminados || 0,
      ambitosLegalesActualizados: ambitosLegalesActualizados || 0,
      caracteristicasEliminadas: caracteristicasEliminadas || 0,
      caracteristicasActualizadas: caracteristicasActualizadas || 0,
    };
  } catch (error) {
    console.error('Error obteniendo contadores de auditoría:', error);
    throw new Error('Error al obtener contadores de auditoría');
  }
}

/**
 * Obtiene soportes eliminados con filtros
 */
export async function getSoportesAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }

  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }

  try {
    const records = await auditoriaEliminacionSoportesQueries.getAll(filters);
    // Mapear campos para compatibilidad con tipos
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_eliminacion,
      usuario_accion: r.id_usuario_elimino,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_elimino || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de soportes:', error);
    throw new Error('Error al obtener auditoría de soportes');
  }
}

/**
 * Obtiene citas eliminadas con filtros
 */
export async function getCitasEliminadasAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }

  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }

  try {
    const records = await auditoriaEliminacionCitasQueries.getAll(filters);
    // Mapear campos para compatibilidad con tipos
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_eliminacion,
      usuario_accion: r.id_usuario_elimino,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_elimino || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de citas eliminadas:', error);
    throw new Error('Error al obtener auditoría de citas eliminadas');
  }
}

/**
 * Obtiene citas actualizadas con filtros
 */
export async function getCitasActualizadasAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }

  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }

  try {
    const records = await auditoriaActualizacionCitasQueries.getAll(filters);
    // Mapear campos para compatibilidad con tipos
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_actualizacion,
      usuario_accion: r.id_usuario_actualizo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_actualizo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de citas actualizadas:', error);
    throw new Error('Error al obtener auditoría de citas actualizadas');
  }
}

/**
 * Obtiene usuarios eliminados con filtros
 */
export async function getUsuariosEliminadosAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }

  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }

  try {
    return await auditoriaEliminacionUsuarioQueries.getAll(filters);
  } catch (error) {
    console.error('Error obteniendo auditoría de usuarios eliminados:', error);
    throw new Error('Error al obtener auditoría de usuarios eliminados');
  }
}

/**
 * Obtiene actualizaciones de campos de usuarios (incluyendo cambios de tipo) con filtros
 */
export async function getUsuariosActualizadosCamposAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }

  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }

  try {
    const records = await auditoriaActualizacionUsuariosQueries.getAll(filters);
    // Mapear campos para compatibilidad con tipos
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_actualizacion,
      usuario_accion: r.id_usuario_actualizo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_actualizo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de usuarios actualizados (campos):', error);
    throw new Error('Error al obtener auditoría de usuarios actualizados (campos)');
  }
}

/**
 * Obtiene estados eliminados con filtros
 */
export async function getEstadosEliminadosAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }

  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }

  try {
    const records = await auditoriaEliminacionEstadosQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_eliminacion,
      usuario_accion: r.id_usuario_elimino,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_elimino || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de estados eliminados:', error);
    throw new Error('Error al obtener auditoría de estados eliminados');
  }
}

/**
 * Obtiene estados actualizados con filtros
 */
export async function getEstadosActualizadosAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }

  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }

  try {
    const records = await auditoriaActualizacionEstadosQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_actualizacion,
      usuario_accion: r.id_usuario_actualizo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_actualizo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de estados actualizados:', error);
    throw new Error('Error al obtener auditoría de estados actualizados');
  }
}

// =========================================================
// ACCIONES DE AUDITORÍA PARA CATÁLOGOS
// =========================================================

/**
 * Obtiene materias eliminadas con filtros
 */
export async function getMateriasEliminadasAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaEliminacionMateriasQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_eliminacion,
      usuario_accion: r.id_usuario_elimino,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_elimino || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de materias eliminadas:', error);
    throw new Error('Error al obtener auditoría de materias eliminadas');
  }
}

/**
 * Obtiene materias actualizadas con filtros
 */
export async function getMateriasActualizadasAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaActualizacionMateriasQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_actualizacion,
      usuario_accion: r.id_usuario_actualizo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_actualizo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de materias actualizadas:', error);
    throw new Error('Error al obtener auditoría de materias actualizadas');
  }
}

/**
 * Obtiene niveles educativos eliminados con filtros
 */
export async function getNivelesEducativosEliminadosAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaEliminacionNivelesEducativosQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_eliminacion,
      usuario_accion: r.id_usuario_elimino,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_elimino || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de niveles educativos eliminados:', error);
    throw new Error('Error al obtener auditoría de niveles educativos eliminados');
  }
}

/**
 * Obtiene niveles educativos actualizados con filtros
 */
export async function getNivelesEducativosActualizadosAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaActualizacionNivelesEducativosQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_actualizacion,
      usuario_accion: r.id_usuario_actualizo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_actualizo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de niveles educativos actualizados:', error);
    throw new Error('Error al obtener auditoría de niveles educativos actualizados');
  }
}

/**
 * Obtiene nucleos eliminados con filtros
 */
export async function getNucleosEliminadosAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaEliminacionNucleosQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_eliminacion,
      usuario_accion: r.id_usuario_elimino,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_elimino || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de nucleos eliminados:', error);
    throw new Error('Error al obtener auditoría de nucleos eliminados');
  }
}

/**
 * Obtiene nucleos actualizados con filtros
 */
export async function getNucleosActualizadosAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaActualizacionNucleosQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_actualizacion,
      usuario_accion: r.id_usuario_actualizo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_actualizo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de nucleos actualizados:', error);
    throw new Error('Error al obtener auditoría de nucleos actualizados');
  }
}

/**
 * Obtiene condiciones de trabajo eliminadas con filtros
 */
export async function getCondicionesTrabajoEliminadasAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaEliminacionCondicionesTrabajoQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_eliminacion,
      usuario_accion: r.id_usuario_elimino,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_elimino || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de condiciones de trabajo eliminadas:', error);
    throw new Error('Error al obtener auditoría de condiciones de trabajo eliminadas');
  }
}

/**
 * Obtiene condiciones de trabajo actualizadas con filtros
 */
export async function getCondicionesTrabajoActualizadasAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaActualizacionCondicionesTrabajoQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_actualizacion,
      usuario_accion: r.id_usuario_actualizo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_actualizo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de condiciones de trabajo actualizadas:', error);
    throw new Error('Error al obtener auditoría de condiciones de trabajo actualizadas');
  }
}

/**
 * Obtiene condiciones de actividad eliminadas con filtros
 */
export async function getCondicionesActividadEliminadasAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaEliminacionCondicionesActividadQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_eliminacion,
      usuario_accion: r.id_usuario_elimino,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_elimino || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de condiciones de actividad eliminadas:', error);
    throw new Error('Error al obtener auditoría de condiciones de actividad eliminadas');
  }
}

/**
 * Obtiene condiciones de actividad actualizadas con filtros
 */
export async function getCondicionesActividadActualizadasAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaActualizacionCondicionesActividadQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_actualizacion,
      usuario_accion: r.id_usuario_actualizo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_actualizo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de condiciones de actividad actualizadas:', error);
    throw new Error('Error al obtener auditoría de condiciones de actividad actualizadas');
  }
}

/**
 * Obtiene tipos de características eliminados con filtros
 */
export async function getTiposCaracteristicasEliminadosAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaEliminacionTiposCaracteristicasQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_eliminacion,
      usuario_accion: r.id_usuario_elimino,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_elimino || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de tipos de características eliminados:', error);
    throw new Error('Error al obtener auditoría de tipos de características eliminados');
  }
}

/**
 * Obtiene tipos de características actualizados con filtros
 */
export async function getTiposCaracteristicasActualizadosAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaActualizacionTiposCaracteristicasQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_actualizacion,
      usuario_accion: r.id_usuario_actualizo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_actualizo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de tipos de características actualizados:', error);
    throw new Error('Error al obtener auditoría de tipos de características actualizados');
  }
}

/**
 * Obtiene semestres eliminados con filtros
 */
export async function getSemestresEliminadosAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaEliminacionSemestresQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_eliminacion,
      usuario_accion: r.id_usuario_elimino,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_elimino || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de semestres eliminados:', error);
    throw new Error('Error al obtener auditoría de semestres eliminados');
  }
}

/**
 * Obtiene semestres actualizados con filtros
 */
export async function getSemestresActualizadosAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaActualizacionSemestresQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_actualizacion,
      usuario_accion: r.id_usuario_actualizo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_actualizo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de semestres actualizados:', error);
    throw new Error('Error al obtener auditoría de semestres actualizados');
  }
}

/**
 * Obtiene municipios eliminados con filtros
 */
export async function getMunicipiosEliminadosAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaEliminacionMunicipiosQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_eliminacion,
      usuario_accion: r.id_usuario_elimino,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_elimino || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de municipios eliminados:', error);
    throw new Error('Error al obtener auditoría de municipios eliminados');
  }
}

/**
 * Obtiene municipios actualizados con filtros
 */
export async function getMunicipiosActualizadosAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaActualizacionMunicipiosQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_actualizacion,
      usuario_accion: r.id_usuario_actualizo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_actualizo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de municipios actualizados:', error);
    throw new Error('Error al obtener auditoría de municipios actualizados');
  }
}

/**
 * Obtiene parroquias eliminadas con filtros
 */
export async function getParroquiasEliminadasAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaEliminacionParroquiasQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_eliminacion,
      usuario_accion: r.id_usuario_elimino,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_elimino || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de parroquias eliminadas:', error);
    throw new Error('Error al obtener auditoría de parroquias eliminadas');
  }
}

/**
 * Obtiene parroquias actualizadas con filtros
 */
export async function getParroquiasActualizadasAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaActualizacionParroquiasQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_actualizacion,
      usuario_accion: r.id_usuario_actualizo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_actualizo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de parroquias actualizadas:', error);
    throw new Error('Error al obtener auditoría de parroquias actualizadas');
  }
}

/**
 * Obtiene categorias eliminadas con filtros
 */
export async function getCategoriasEliminadasAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaEliminacionCategoriasQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_eliminacion,
      usuario_accion: r.id_usuario_elimino,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_elimino || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de categorias eliminadas:', error);
    throw new Error('Error al obtener auditoría de categorias eliminadas');
  }
}

/**
 * Obtiene categorias actualizadas con filtros
 */
export async function getCategoriasActualizadasAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaActualizacionCategoriasQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_actualizacion,
      usuario_accion: r.id_usuario_actualizo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_actualizo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de categorias actualizadas:', error);
    throw new Error('Error al obtener auditoría de categorias actualizadas');
  }
}

/**
 * Obtiene subcategorias eliminadas con filtros
 */
export async function getSubcategoriasEliminadasAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaEliminacionSubcategoriasQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_eliminacion,
      usuario_accion: r.id_usuario_elimino,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_elimino || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de subcategorias eliminadas:', error);
    throw new Error('Error al obtener auditoría de subcategorias eliminadas');
  }
}

/**
 * Obtiene subcategorias actualizadas con filtros
 */
export async function getSubcategoriasActualizadasAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaActualizacionSubcategoriasQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_actualizacion,
      usuario_accion: r.id_usuario_actualizo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_actualizo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de subcategorias actualizadas:', error);
    throw new Error('Error al obtener auditoría de subcategorias actualizadas');
  }
}

/**
 * Obtiene ambitos legales eliminados con filtros
 */
export async function getAmbitosLegalesEliminadosAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaEliminacionAmbitosLegalesQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_eliminacion,
      usuario_accion: r.id_usuario_elimino,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_elimino || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de ambitos legales eliminados:', error);
    throw new Error('Error al obtener auditoría de ambitos legales eliminados');
  }
}

/**
 * Obtiene ambitos legales actualizados con filtros
 */
export async function getAmbitosLegalesActualizadosAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaActualizacionAmbitosLegalesQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_actualizacion,
      usuario_accion: r.id_usuario_actualizo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_actualizo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de ambitos legales actualizados:', error);
    throw new Error('Error al obtener auditoría de ambitos legales actualizados');
  }
}

/**
 * Obtiene caracteristicas eliminadas con filtros
 */
export async function getCaracteristicasEliminadasAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaEliminacionCaracteristicasQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_eliminacion,
      usuario_accion: r.id_usuario_elimino,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_elimino || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de caracteristicas eliminadas:', error);
    throw new Error('Error al obtener auditoría de caracteristicas eliminadas');
  }
}

/**
 * Obtiene caracteristicas actualizadas con filtros
 */
export async function getCaracteristicasActualizadasAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaActualizacionCaracteristicasQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_actualizacion,
      usuario_accion: r.id_usuario_actualizo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_actualizo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de caracteristicas actualizadas:', error);
    throw new Error('Error al obtener auditoría de caracteristicas actualizadas');
  }
}
