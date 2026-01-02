'use server';

import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { mapSystemRoleToSidebarRole } from '@/lib/utils/role-mapper';
import { auditoriaEliminacionSoportesQueries } from '@/lib/db/queries/auditoria-eliminacion-soportes.queries';
import { auditoriaEliminacionCitasQueries } from '@/lib/db/queries/auditoria-eliminacion-citas.queries';
import { auditoriaActualizacionCitasQueries } from '@/lib/db/queries/auditoria-actualizacion-citas.queries';
import { auditoriaEliminacionUsuarioQueries } from '@/lib/db/queries/auditoria-eliminacion-usuario.queries';
import { auditoriaActualizacionTipoUsuarioQueries } from '@/lib/db/queries/auditoria-actualizacion-tipo-usuario.queries';
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
    const [soportes, citasEliminadas, citasActualizadas, usuariosEliminados, usuariosActualizados] = await Promise.all([
      auditoriaEliminacionSoportesQueries.getCount(),
      auditoriaEliminacionCitasQueries.getCount(),
      auditoriaActualizacionCitasQueries.getCount(),
      auditoriaEliminacionUsuarioQueries.getCount(),
      auditoriaActualizacionTipoUsuarioQueries.getCount(),
    ]);

    return {
      soportes,
      citasEliminadas,
      citasActualizadas,
      usuariosEliminados,
      usuariosActualizados,
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
 * Obtiene cambios de tipo de usuario con filtros
 */
export async function getUsuariosActualizadosAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }

  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }

  try {
    return await auditoriaActualizacionTipoUsuarioQueries.getAll(filters);
  } catch (error) {
    console.error('Error obteniendo auditoría de usuarios actualizados:', error);
    throw new Error('Error al obtener auditoría de usuarios actualizados');
  }
}
