'use server';

import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { mapSystemRoleToSidebarRole } from '@/lib/utils/role-mapper';
import { auditoriaEliminacionSoportesQueries } from '@/lib/db/queries/auditoria-eliminacion-soportes.queries';
import { auditoriaInsercionSoportesQueries } from '@/lib/db/queries/auditoria-insercion-soportes.queries';
import { auditoriaEliminacionCitasQueries } from '@/lib/db/queries/auditoria-eliminacion-citas.queries';
import { auditoriaActualizacionCitasQueries } from '@/lib/db/queries/auditoria-actualizacion-citas.queries';
import { auditoriaInsercionCitasQueries } from '@/lib/db/queries/auditoria-insercion-citas.queries';
import { auditoriaEliminacionUsuarioQueries } from '@/lib/db/queries/auditoria-eliminacion-usuario.queries';
import { auditoriaActualizacionUsuariosQueries } from '@/lib/db/queries/auditoria-actualizacion-usuarios.queries';
import { auditoriaInsercionUsuariosQueries } from '@/lib/db/queries/auditoria-insercion-usuarios.queries';
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
import { auditoriaInsercionEstadosQueries } from '@/lib/db/queries/auditoria-insercion-estados.queries';
import { auditoriaInsercionMateriasQueries } from '@/lib/db/queries/auditoria-insercion-materias.queries';
import { auditoriaInsercionNivelesEducativosQueries } from '@/lib/db/queries/auditoria-insercion-niveles-educativos.queries';
import { auditoriaInsercionNucleosQueries } from '@/lib/db/queries/auditoria-insercion-nucleos.queries';
import { auditoriaInsercionCondicionesTrabajoQueries } from '@/lib/db/queries/auditoria-insercion-condiciones-trabajo.queries';
import { auditoriaInsercionCondicionesActividadQueries } from '@/lib/db/queries/auditoria-insercion-condiciones-actividad.queries';
import { auditoriaInsercionTiposCaracteristicasQueries } from '@/lib/db/queries/auditoria-insercion-tipos-caracteristicas.queries';
import { auditoriaInsercionSemestresQueries } from '@/lib/db/queries/auditoria-insercion-semestres.queries';
import { auditoriaInsercionMunicipiosQueries } from '@/lib/db/queries/auditoria-insercion-municipios.queries';
import { auditoriaInsercionParroquiasQueries } from '@/lib/db/queries/auditoria-insercion-parroquias.queries';
import { auditoriaInsercionCategoriasQueries } from '@/lib/db/queries/auditoria-insercion-categorias.queries';
import { auditoriaInsercionSubcategoriasQueries } from '@/lib/db/queries/auditoria-insercion-subcategorias.queries';
import { auditoriaInsercionAmbitosLegalesQueries } from '@/lib/db/queries/auditoria-insercion-ambitos-legales.queries';
import { auditoriaInsercionCaracteristicasQueries } from '@/lib/db/queries/auditoria-insercion-caracteristicas.queries';
import { auditoriaEliminacionCasosQueries } from '@/lib/db/queries/auditoria-eliminacion-casos.queries';
import { auditoriaActualizacionCasosQueries } from '@/lib/db/queries/auditoria-actualizacion-casos.queries';
import { auditoriaInsercionCasosQueries } from '@/lib/db/queries/auditoria-insercion-casos.queries';
import { auditoriaEliminacionSolicitantesQueries } from '@/lib/db/queries/auditoria-eliminacion-solicitantes.queries';
import { auditoriaActualizacionSolicitantesQueries } from '@/lib/db/queries/auditoria-actualizacion-solicitantes.queries';
import { auditoriaInsercionSolicitantesQueries } from '@/lib/db/queries/auditoria-insercion-solicitantes.queries';
import { auditoriaInsercionEstudiantesQueries } from '@/lib/db/queries/auditoria-insercion-estudiantes.queries';
import { auditoriaInsercionProfesoresQueries } from '@/lib/db/queries/auditoria-insercion-profesores.queries';
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
      soportesEliminados, soportesCreados, citasEliminadas, citasActualizadas, citasCreadas, usuariosEliminados, usuariosActualizadosCampos, usuariosCreados,
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
      caracteristicasEliminadas, caracteristicasActualizadas,
      // Inserciones
      estadosInsertados, materiasInsertadas, nivelesEducativosInsertados, nucleosInsertados,
      condicionesTrabajoInsertadas, condicionesActividadInsertadas, tiposCaracteristicasInsertados,
      semestresInsertados, municipiosInsertados, parroquiasInsertadas, categoriasInsertadas,
      subcategoriasInsertadas, ambitosLegalesInsertados, caracteristicasInsertadas,
      // Casos
      casosEliminados, casosActualizados, casosCreados,
      // Solicitantes
      solicitantesEliminados, solicitantesActualizados, solicitantesCreados
    ] = await Promise.all([
      auditoriaEliminacionSoportesQueries.getCount(),
      auditoriaInsercionSoportesQueries.getCount().catch(() => 0),
      auditoriaEliminacionCitasQueries.getCount(),
      auditoriaActualizacionCitasQueries.getCount().catch(() => 0),
      auditoriaInsercionCitasQueries.getCount().catch(() => 0),
      auditoriaEliminacionUsuarioQueries.getCount(),
      auditoriaActualizacionUsuariosQueries.getCount().catch(() => 0),
      auditoriaInsercionUsuariosQueries.getCount().catch(() => 0),
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
      // Inserciones
      auditoriaInsercionEstadosQueries.getCount().catch(() => 0),
      auditoriaInsercionMateriasQueries.getCount().catch(() => 0),
      auditoriaInsercionNivelesEducativosQueries.getCount().catch(() => 0),
      auditoriaInsercionNucleosQueries.getCount().catch(() => 0),
      auditoriaInsercionCondicionesTrabajoQueries.getCount().catch(() => 0),
      auditoriaInsercionCondicionesActividadQueries.getCount().catch(() => 0),
      auditoriaInsercionTiposCaracteristicasQueries.getCount().catch(() => 0),
      auditoriaInsercionSemestresQueries.getCount().catch(() => 0),
      auditoriaInsercionMunicipiosQueries.getCount().catch(() => 0),
      auditoriaInsercionParroquiasQueries.getCount().catch(() => 0),
      auditoriaInsercionCategoriasQueries.getCount().catch(() => 0),
      auditoriaInsercionSubcategoriasQueries.getCount().catch(() => 0),
      auditoriaInsercionAmbitosLegalesQueries.getCount().catch(() => 0),
      auditoriaInsercionCaracteristicasQueries.getCount().catch(() => 0),
      // Casos
      auditoriaEliminacionCasosQueries.getCount().catch(() => 0),
      auditoriaActualizacionCasosQueries.getCount().catch(() => 0),
      auditoriaInsercionCasosQueries.getCount().catch(() => 0),
      // Solicitantes
      auditoriaEliminacionSolicitantesQueries.getCount().catch(() => 0),
      auditoriaActualizacionSolicitantesQueries.getCount().catch(() => 0),
      auditoriaInsercionSolicitantesQueries.getCount().catch(() => 0),
    ]);

    return {
      soportes: soportesEliminados,
      soportesCreados: soportesCreados || 0,
      citasEliminadas,
      citasActualizadas,
      citasCreadas: citasCreadas || 0,
      usuariosEliminados,
      usuariosActualizadosCampos,
      usuariosCreados: usuariosCreados || 0,
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
      // Inserciones
      estadosInsertados: estadosInsertados || 0,
      materiasInsertadas: materiasInsertadas || 0,
      nivelesEducativosInsertados: nivelesEducativosInsertados || 0,
      nucleosInsertados: nucleosInsertados || 0,
      condicionesTrabajoInsertadas: condicionesTrabajoInsertadas || 0,
      condicionesActividadInsertadas: condicionesActividadInsertadas || 0,
      tiposCaracteristicasInsertados: tiposCaracteristicasInsertados || 0,
      semestresInsertados: semestresInsertados || 0,
      municipiosInsertados: municipiosInsertados || 0,
      parroquiasInsertadas: parroquiasInsertadas || 0,
      categoriasInsertadas: categoriasInsertadas || 0,
      subcategoriasInsertadas: subcategoriasInsertadas || 0,
      ambitosLegalesInsertados: ambitosLegalesInsertados || 0,
      caracteristicasInsertadas: caracteristicasInsertadas || 0,
      // Casos
      casosEliminados: casosEliminados || 0,
      casosActualizados: casosActualizados || 0,
      casosCreados: casosCreados || 0,
      // Solicitantes
      solicitantesEliminados: solicitantesEliminados || 0,
      solicitantesActualizados: solicitantesActualizados || 0,
      solicitantesCreados: solicitantesCreados || 0,
    };
  } catch (error) {
    console.error('Error obteniendo contadores de auditoría:', error);
    // Log detallado del error para debugging
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    throw new Error(`Error al obtener contadores de auditoría: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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
 * Obtiene soportes creados con filtros
 */
export async function getSoportesCreadosAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();

  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }

  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }

  try {
    const records = await auditoriaInsercionSoportesQueries.getAll(filters);
    // Mapear campos para compatibilidad con tipos
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_creacion,
      usuario_accion: r.id_usuario_subio,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_subio || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de soportes creados:', error);
    throw new Error('Error al obtener auditoría de soportes creados');
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
 * Obtiene citas creadas con filtros
 */
export async function getCitasCreadasAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();

  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }

  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }

  try {
    const records = await auditoriaInsercionCitasQueries.getAll(filters);
    // Mapear campos para compatibilidad con tipos
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_creacion,
      usuario_accion: r.id_usuario_creo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_creo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de citas creadas:', error);
    throw new Error('Error al obtener auditoría de citas creadas');
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
 * Obtiene usuarios creados con filtros
 */
export async function getUsuariosCreadosAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();

  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }

  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }

  try {
    // Usar la consulta combinada que incluye usuarios creados, estudiantes inscritos y profesores asignados
    const records = await auditoriaInsercionUsuariosQueries.getCombined(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_creacion,
      usuario_accion: r.id_usuario_creo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_creo || undefined,
      // Mapear tipos de registro de BD a tipos de frontend si es necesario
      // Si el backend devuelve 'usuario-creado', 'estudiante-inscrito', 'profesor-asignado'
      // y coinciden con los del frontend, todo bien.
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de usuarios creados:', error);
    throw new Error('Error al obtener auditoría de usuarios creados');
  }
}

/**
 * Obtiene estudiantes inscritos (auditoría de inserción en estudiantes) con filtros
 */
export async function getEstudiantesInscritosAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();

  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }

  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }

  try {
    const records = await auditoriaInsercionEstudiantesQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_creacion,
      usuario_accion: r.id_usuario_creo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_creo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de estudiantes inscritos:', error);
    throw new Error('Error al obtener auditoría de estudiantes inscritos');
  }
}

/**
 * Obtiene profesores inscritos (auditoría de inserción en profesores) con filtros
 */
export async function getProfesoresInscritosAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();

  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }

  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }

  try {
    const records = await auditoriaInsercionProfesoresQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_creacion,
      usuario_accion: r.id_usuario_creo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_creo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de profesores inscritos:', error);
    throw new Error('Error al obtener auditoría de profesores inscritos');
  }
}

// =========================================================
// ACCIONES DE AUDITORÍA PARA CASOS
// =========================================================

/**
 * Obtiene casos eliminados con filtros
 */
export async function getCasosEliminadosAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();

  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }

  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }

  try {
    const records = await auditoriaEliminacionCasosQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha,
      usuario_accion: r.eliminado_por,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_elimino || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de casos eliminados:', error);
    throw new Error('Error al obtener auditoría de casos eliminados');
  }
}

/**
 * Obtiene casos actualizados con filtros
 */
export async function getCasosActualizadosAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();

  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }

  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }

  try {
    const records = await auditoriaActualizacionCasosQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_actualizacion,
      usuario_accion: r.id_usuario_actualizo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_actualizo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de casos actualizados:', error);
    throw new Error('Error al obtener auditoría de casos actualizados');
  }
}

/**
 * Obtiene casos creados con filtros
 */
export async function getCasosCreadosAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();

  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }

  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }

  try {
    const records = await auditoriaInsercionCasosQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_creacion,
      usuario_accion: r.id_usuario_creo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_creo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de casos creados:', error);
    throw new Error('Error al obtener auditoría de casos creados');
  }
}

// =========================================================
// ACCIONES DE AUDITORÍA PARA SOLICITANTES
// =========================================================

/**
 * Obtiene solicitantes eliminados con filtros
 */
export async function getSolicitantesEliminadosAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();

  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }

  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }

  try {
    const records = await auditoriaEliminacionSolicitantesQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha,
      usuario_accion: r.eliminado_por,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_elimino || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de solicitantes eliminados:', error);
    throw new Error('Error al obtener auditoría de solicitantes eliminados');
  }
}

/**
 * Obtiene solicitantes actualizados con filtros
 */
export async function getSolicitantesActualizadosAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();

  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }

  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }

  try {
    const records = await auditoriaActualizacionSolicitantesQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_actualizacion,
      usuario_accion: r.id_usuario_actualizo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_actualizo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de solicitantes actualizados:', error);
    throw new Error('Error al obtener auditoría de solicitantes actualizados');
  }
}

/**
 * Obtiene solicitantes creados con filtros
 */
export async function getSolicitantesCreadosAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();

  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }

  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }

  try {
    const records = await auditoriaInsercionSolicitantesQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_creacion,
      usuario_accion: r.id_usuario_creo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_creo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de solicitantes creados:', error);
    throw new Error('Error al obtener auditoría de solicitantes creados');
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

// =========================================================
// FUNCIONES DE AUDITORÍA DE INSERCIONES
// =========================================================

/**
 * Obtiene estados insertados con filtros
 */
export async function getEstadosInsertadosAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaInsercionEstadosQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_creacion,
      usuario_accion: r.id_usuario_creo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_creo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de estados insertados:', error);
    throw new Error('Error al obtener auditoría de estados insertados');
  }
}

/**
 * Obtiene materias insertadas con filtros
 */
export async function getMateriasInsertadasAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaInsercionMateriasQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_creacion,
      usuario_accion: r.id_usuario_creo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_creo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de materias insertadas:', error);
    throw new Error('Error al obtener auditoría de materias insertadas');
  }
}

/**
 * Obtiene niveles educativos insertados con filtros
 */
export async function getNivelesEducativosInsertadosAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaInsercionNivelesEducativosQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_creacion,
      usuario_accion: r.id_usuario_creo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_creo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de niveles educativos insertados:', error);
    throw new Error('Error al obtener auditoría de niveles educativos insertados');
  }
}

/**
 * Obtiene nucleos insertados con filtros
 */
export async function getNucleosInsertadosAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaInsercionNucleosQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_creacion,
      usuario_accion: r.id_usuario_creo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_creo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de nucleos insertados:', error);
    throw new Error('Error al obtener auditoría de nucleos insertados');
  }
}

/**
 * Obtiene condiciones trabajo insertadas con filtros
 */
export async function getCondicionesTrabajoInsertadasAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaInsercionCondicionesTrabajoQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_creacion,
      usuario_accion: r.id_usuario_creo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_creo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de condiciones trabajo insertadas:', error);
    throw new Error('Error al obtener auditoría de condiciones trabajo insertadas');
  }
}

/**
 * Obtiene condiciones actividad insertadas con filtros
 */
export async function getCondicionesActividadInsertadasAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaInsercionCondicionesActividadQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_creacion,
      usuario_accion: r.id_usuario_creo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_creo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de condiciones actividad insertadas:', error);
    throw new Error('Error al obtener auditoría de condiciones actividad insertadas');
  }
}

/**
 * Obtiene tipos caracteristicas insertados con filtros
 */
export async function getTiposCaracteristicasInsertadosAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaInsercionTiposCaracteristicasQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_creacion,
      usuario_accion: r.id_usuario_creo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_creo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de tipos caracteristicas insertados:', error);
    throw new Error('Error al obtener auditoría de tipos caracteristicas insertados');
  }
}

/**
 * Obtiene semestres insertados con filtros
 */
export async function getSemestresInsertadosAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaInsercionSemestresQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_creacion,
      usuario_accion: r.id_usuario_creo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_creo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de semestres insertados:', error);
    throw new Error('Error al obtener auditoría de semestres insertados');
  }
}

/**
 * Obtiene municipios insertados con filtros
 */
export async function getMunicipiosInsertadosAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaInsercionMunicipiosQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_creacion,
      usuario_accion: r.id_usuario_creo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_creo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de municipios insertados:', error);
    throw new Error('Error al obtener auditoría de municipios insertados');
  }
}

/**
 * Obtiene parroquias insertadas con filtros
 */
export async function getParroquiasInsertadasAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaInsercionParroquiasQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_creacion,
      usuario_accion: r.id_usuario_creo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_creo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de parroquias insertadas:', error);
    throw new Error('Error al obtener auditoría de parroquias insertadas');
  }
}

/**
 * Obtiene categorias insertadas con filtros
 */
export async function getCategoriasInsertadasAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaInsercionCategoriasQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_creacion,
      usuario_accion: r.id_usuario_creo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_creo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de categorias insertadas:', error);
    throw new Error('Error al obtener auditoría de categorias insertadas');
  }
}

/**
 * Obtiene subcategorias insertadas con filtros
 */
export async function getSubcategoriasInsertadasAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaInsercionSubcategoriasQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_creacion,
      usuario_accion: r.id_usuario_creo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_creo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de subcategorias insertadas:', error);
    throw new Error('Error al obtener auditoría de subcategorias insertadas');
  }
}

/**
 * Obtiene ambitos legales insertados con filtros
 */
export async function getAmbitosLegalesInsertadosAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaInsercionAmbitosLegalesQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_creacion,
      usuario_accion: r.id_usuario_creo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_creo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de ambitos legales insertados:', error);
    throw new Error('Error al obtener auditoría de ambitos legales insertados');
  }
}

/**
 * Obtiene caracteristicas insertadas con filtros
 */
export async function getCaracteristicasInsertadasAuditAction(filters?: AuditFilters) {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
  if (userSidebarRole !== 'coordinator') {
    throw new Error('No autorizado');
  }
  try {
    const records = await auditoriaInsercionCaracteristicasQueries.getAll(filters);
    return records.map((r) => ({
      ...r,
      fecha: r.fecha_creacion,
      usuario_accion: r.id_usuario_creo,
      nombre_completo_usuario_accion: r.nombre_completo_usuario_creo || undefined,
    }));
  } catch (error) {
    console.error('Error obteniendo auditoría de caracteristicas insertadas:', error);
    throw new Error('Error al obtener auditoría de caracteristicas insertadas');
  }
}
