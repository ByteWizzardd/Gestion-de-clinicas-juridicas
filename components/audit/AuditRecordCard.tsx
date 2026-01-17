'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, FileText, Calendar, User, X, Check, BookOpen, GraduationCap, Building, Briefcase, Activity, Tag, Tags, Scale, MapPin, Building2, Home, FolderTree, FolderOpen, UserCircle, Users, ArrowRight, UserX } from 'lucide-react';
import Link from 'next/link';
import UserAvatar from '@/components/ui/UserAvatar';
import { formatDateTime } from '@/lib/utils/date-formatter';
import type {
  SoporteAuditRecord,
  SoporteCreadoAuditRecord,
  CitaEliminadaAuditRecord,
  CitaActualizadaAuditRecord,
  CitaCreadaAuditRecord,
  UsuarioEliminadoAuditRecord,
  UsuarioHabilitadoAuditRecord,
  UsuarioActualizadoCamposAuditRecord,
  UsuarioCreadoAuditRecord,
  CasoEliminadoAuditRecord,
  CasoActualizadoAuditRecord,
  CasoCreadoAuditRecord,
  SolicitanteEliminadoAuditRecord,
  SolicitanteActualizadoAuditRecord,
  SolicitanteCreadoAuditRecord,
  EstudianteInscritoAuditRecord,
  BeneficiarioEliminadoAuditRecord,
  BeneficiarioActualizadoAuditRecord,
  BeneficiarioInscritoAuditRecord,
  AccionCreadaAuditRecord,
  AccionActualizadaAuditRecord,
  AccionEliminadaAuditRecord,
  EquipoActualizadoAuditRecord,
  MiembroEquipoAudit
} from '@/types/audit';

type AuditRecord = SoporteAuditRecord | SoporteCreadoAuditRecord | CitaEliminadaAuditRecord | CitaActualizadaAuditRecord | CitaCreadaAuditRecord | UsuarioEliminadoAuditRecord | UsuarioHabilitadoAuditRecord | UsuarioActualizadoCamposAuditRecord | UsuarioCreadoAuditRecord | CasoEliminadoAuditRecord | CasoActualizadoAuditRecord | CasoCreadoAuditRecord | SolicitanteEliminadoAuditRecord | SolicitanteActualizadoAuditRecord | SolicitanteCreadoAuditRecord | EstudianteInscritoAuditRecord | BeneficiarioEliminadoAuditRecord | BeneficiarioActualizadoAuditRecord | BeneficiarioInscritoAuditRecord | AccionCreadaAuditRecord | AccionActualizadaAuditRecord | AccionEliminadaAuditRecord | EquipoActualizadoAuditRecord | any;

import type { AuditRecordType } from '@/types/audit';

interface AuditRecordCardProps {
  record: AuditRecord;
  type: AuditRecordType;
}

export default function AuditRecordCard({ record, type }: AuditRecordCardProps) {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateInput: string | Date | null | undefined) => {
    // Si es null o undefined, retornar mensaje
    if (!dateInput) {
      return 'Fecha no disponible';
    }

    // Si ya es un objeto Date, usarlo directamente
    let date: Date;
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string') {
      // Si el string incluye 'T' o espacio (PostgreSQL), parsearlo correctamente
      // PostgreSQL devuelve timestamps en formato "YYYY-MM-DD HH:MM:SS" o "YYYY-MM-DDTHH:MM:SS"
      if (dateInput.includes('T') || dateInput.includes(' ')) {
        // Es un timestamp (con T o espacio)
        // Normalizar: reemplazar espacio por T para parsear consistentemente
        const normalizedInput = dateInput.replace(' ', 'T');
        const isoMatch = normalizedInput.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
        if (isoMatch) {
          const [, year, month, day, hour, minute] = isoMatch.map(Number);
          // Crear fecha usando componentes locales (no UTC)
          date = new Date(year, month - 1, day, hour, minute);
        } else {
          date = new Date(dateInput);
        }
      } else {
        // Es solo una fecha (ej: "2026-01-02")
        const parts = dateInput.split('-');
        if (parts.length === 3) {
          const [year, month, day] = parts.map(Number);
          date = new Date(year, month - 1, day);
        } else {
          date = new Date(dateInput);
        }
      }
    } else {
      return 'Fecha no disponible';
    }

    // Validar que la fecha sea válida
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }

    return date.toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Caracas', // Zona horaria de Venezuela
    });
  };

  const formatOnlyDate = (dateInput: string | Date | null | undefined) => {
    if (!dateInput) return 'Fecha no disponible';

    let date: Date;
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string') {
      // Manejar timestamps de PostgreSQL con espacio o T
      if (dateInput.includes('T') || dateInput.includes(' ')) {
        const normalizedInput = dateInput.replace(' ', 'T');
        const isoMatch = normalizedInput.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
        if (isoMatch) {
          const [, year, month, day] = isoMatch.map(Number);
          date = new Date(year, month - 1, day);
        } else {
          date = new Date(dateInput);
        }
      } else {
        // Es solo una fecha (ej: "2026-01-02")
        // En PostgreSQL las fechas DATE a veces vienen como strings simples
        // Si usamos new Date(str) podría interpretar UTC y cambiar el día
        // Mejor parsear manualmente año-mes-día
        const parts = dateInput.split('-');
        if (parts.length === 3) {
          const [year, month, day] = parts.map(Number);
          date = new Date(year, month - 1, day);
        } else {
          date = new Date(dateInput);
        }
      }
    } else {
      return 'Fecha no disponible';
    }

    if (isNaN(date.getTime())) return 'Fecha inválida';

    return date.toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const areDatesEqual = (d1: any, d2: any) => {
    if (!d1 && !d2) return true;
    if (!d1 || !d2) return false;
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) return d1 === d2;
    // Comparar solo la parte de la fecha (año, mes, día)
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  };

  // Helper para verificar si un valor es efectivamente vacío (null, undefined, o cadena vacía)
  const isEffectivelyEmpty = (value: any): boolean => {
    return value === null || value === undefined || value === '';
  };

  // Helper para comparar valores considerando cadenas vacías como equivalentes a null
  const areValuesEffectivelyEqual = (v1: any, v2: any): boolean => {
    // Si ambos son efectivamente vacíos, son iguales
    if (isEffectivelyEmpty(v1) && isEffectivelyEmpty(v2)) return true;
    // Si solo uno es vacío, son diferentes
    if (isEffectivelyEmpty(v1) || isEffectivelyEmpty(v2)) return false;
    // Comparar valores normales
    return v1 === v2;
  };

  const formatDateOnly = (dateInput: string | Date | null | undefined) => {
    // Si es null o undefined, retornar mensaje
    if (!dateInput) {
      return 'Fecha no disponible';
    }

    // Si ya es un objeto Date, usarlo directamente
    let date: Date;
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string') {
      // Si el string incluye 'T' o es un timestamp, parsearlo correctamente
      if (dateInput.includes('T')) {
        // Es un timestamp ISO (ej: "2026-01-02T05:24:00.000Z")
        // Extraer los componentes de fecha sin interpretar como UTC
        const isoMatch = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})T/);
        if (isoMatch) {
          const [, year, month, day] = isoMatch.map(Number);
          // Crear fecha usando componentes locales (no UTC)
          date = new Date(year, month - 1, day);
        } else {
          date = new Date(dateInput);
        }
      } else {
        // Es solo una fecha (ej: "2026-01-02")
        const parts = dateInput.split('-');
        if (parts.length === 3) {
          const [year, month, day] = parts.map(Number);
          date = new Date(year, month - 1, day);
        } else {
          date = new Date(dateInput);
        }
      }
    } else {
      return 'Fecha no disponible';
    }

    // Validar que la fecha sea válida
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }

    return date.toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Caracas', // Zona horaria de Venezuela
    });
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Helper para renderizar nombre de usuario como enlace
  const renderUserLink = (
    nombreCompleto: string | null | undefined,
    nombres: string | null | undefined,
    apellidos: string | null | undefined,
    cedula: string | null | undefined
  ) => {

    // Construir nombre completo
    let nombre = nombreCompleto;
    if (!nombre && (nombres || apellidos)) {
      nombre = `${nombres || ''} ${apellidos || ''}`.trim();
    }
    if (!nombre) {
      nombre = 'Usuario desconocido';
    }

    // Si hay cédula, renderizar como enlace
    if (cedula) {
      return (
        <>
          <Link
            href={`/dashboard/users/${cedula}`}
            className="text-primary hover:underline font-medium transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {nombre}
          </Link>
          <span className="text-gray-600"> (Cédula: {cedula})</span>
        </>
      );
    }

    // Sin cédula, solo texto
    return <span className="text-gray-600">{nombre}</span>;
  };

  // Helper para renderizar nombre de usuario eliminado como texto (sin enlace)
  const renderDeletedUser = (
    nombreCompleto: string | null | undefined,
    nombres: string | null | undefined,
    apellidos: string | null | undefined,
    cedula: string | null | undefined
  ) => {

    // Construir nombre completo
    let nombre = nombreCompleto;
    if (!nombre && (nombres || apellidos)) {
      nombre = `${nombres || ''} ${apellidos || ''}`.trim();
    }
    if (!nombre) {
      nombre = 'Usuario desconocido';
    }

    // Mostrar como texto normal (sin enlace)
    if (cedula) {
      return (
        <span className="text-gray-900">
          {nombre} <span className="text-gray-600">(Cédula: {cedula})</span>
        </span>
      );
    }

    return <span className="text-gray-900">{nombre}</span>;
  };

  const renderSummary = () => {
    switch (type) {
      // Acciones
      case 'accion-creada': {
        const r = record as AccionCreadaAuditRecord;
        return (
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                Acción #{r.num_accion} -{' '}
                <Link
                  href={`/dashboard/cases/${r.id_caso}`}
                  className="text-primary hover:underline font-medium transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Caso #{r.id_caso}
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Creada por:{' '}
                {renderUserLink(
                  r.nombre_completo_usuario_creo,
                  r.nombres_usuario_creo,
                  r.apellidos_usuario_creo,
                  r.id_usuario_creo
                )}
              </p>
            </div>
          </div>
        );
      }
      case 'accion-actualizada': {
        const r = record as AccionActualizadaAuditRecord;
        return (
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                Acción #{r.num_accion} -{' '}
                <Link
                  href={`/dashboard/cases/${r.id_caso}`}
                  className="text-primary hover:underline font-medium transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Caso #{r.id_caso}
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Actualizada por:{' '}
                {renderUserLink(
                  r.nombre_completo_usuario_actualizo,
                  r.nombres_usuario_actualizo,
                  r.apellidos_usuario_actualizo,
                  r.id_usuario_actualizo
                )}
              </p>
            </div>
          </div>
        );
      }
      case 'accion-eliminada': {
        const r = record as AccionEliminadaAuditRecord;
        return (
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                Acción #{r.num_accion} -{' '}
                <Link
                  href={`/dashboard/cases/${r.id_caso}`}
                  className="text-primary hover:underline font-medium transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Caso #{r.id_caso}
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Eliminada por:{' '}
                {renderUserLink(
                  r.nombre_completo_eliminado_por,
                  r.nombres_eliminado_por,
                  r.apellidos_eliminado_por,
                  r.eliminado_por
                )}
              </p>
            </div>
          </div>
        );
      }
      case 'soporte': {
        const r = record as SoporteAuditRecord;
        return (
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{r.nombre_archivo}</p>
              <p className="text-sm text-gray-600">
                Caso #{r.id_caso} • Eliminado por:{' '}
                {renderUserLink(
                  r.nombre_completo_usuario_elimino,
                  r.nombres_usuario_elimino,
                  r.apellidos_usuario_elimino,
                  r.id_usuario_elimino
                )}
              </p>
            </div>
          </div>
        );
      }
      case 'soporte-creado': {
        const r = record as SoporteCreadoAuditRecord;
        return (
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{r.nombre_archivo}</p>
              <p className="text-sm text-gray-600">
                Caso #{r.id_caso} • Subido por:{' '}
                {renderUserLink(
                  r.nombre_completo_usuario_subio,
                  r.nombres_usuario_subio,
                  r.apellidos_usuario_subio,
                  r.id_usuario_subio
                )}
              </p>
            </div>
          </div>
        );
      }
      case 'cita-eliminada': {
        const r = record as CitaEliminadaAuditRecord;
        return (
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                Cita #{r.num_cita} -{' '}
                <Link
                  href={`/dashboard/cases/${r.id_caso}`}
                  className="text-primary hover:underline font-medium transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Caso #{r.id_caso}
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Eliminado por:{' '}
                {renderUserLink(
                  r.nombre_completo_usuario_elimino,
                  r.nombres_usuario_elimino,
                  r.apellidos_usuario_elimino,
                  r.id_usuario_elimino
                )}
              </p>
            </div>
          </div>
        );
      }
      case 'cita-creada': {
        const r = record as CitaCreadaAuditRecord;
        return (
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                Cita #{r.num_cita} -{' '}
                <Link
                  href={`/dashboard/cases/${r.id_caso}`}
                  className="text-primary hover:underline font-medium transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Caso #{r.id_caso}
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Creado por:{' '}
                {renderUserLink(
                  r.nombre_completo_usuario_creo,
                  r.nombres_usuario_creo,
                  r.apellidos_usuario_creo,
                  r.id_usuario_creo
                )}
              </p>
            </div>
          </div>
        );
      }
      case 'cita-actualizada': {
        const r = record as CitaActualizadaAuditRecord;
        return (
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                Cita #{r.num_cita} -{' '}
                <Link
                  href={`/dashboard/cases/${r.id_caso}`}
                  className="text-primary hover:underline font-medium transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Caso #{r.id_caso}
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Actualizado por:{' '}
                {renderUserLink(
                  r.nombre_completo_usuario_actualizo,
                  r.nombres_usuario_actualizo,
                  r.apellidos_usuario_actualizo,
                  r.id_usuario_actualizo
                )}
              </p>
            </div>
          </div>
        );
      }
      case 'usuario-eliminado': {
        const r = record as UsuarioEliminadoAuditRecord;
        return (
          <div className="flex items-start gap-3">
            <UserAvatar
              fotoPerfil={null}
              nombre={r.nombre_completo_usuario_eliminado || `${r.nombres_usuario_eliminado || ''} ${r.apellidos_usuario_eliminado || ''}`.trim() || 'Usuario Eliminado'}
              size={25}
            />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                {renderDeletedUser(
                  r.nombre_completo_usuario_eliminado,
                  r.nombres_usuario_eliminado,
                  r.apellidos_usuario_eliminado,
                  undefined
                )}
              </p>
              <p className="text-sm text-gray-600">
                Cédula: {r.usuario_eliminado} • Eliminado por:{' '}
                {renderUserLink(
                  r.nombre_completo_eliminado_por,
                  r.nombres_eliminado_por,
                  r.apellidos_eliminado_por,
                  r.eliminado_por
                )}
              </p>
            </div>
          </div>
        );
      }
      case 'usuario-habilitado': {
        const r = record as UsuarioHabilitadoAuditRecord;
        return (
          <div className="flex items-center gap-3">
            <UserCircle className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                {r.usuario_habilitado ? (
                  <Link
                    href={`/dashboard/users/${r.usuario_habilitado}`}
                    className="text-primary hover:underline font-medium transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {r.nombre_completo_usuario_habilitado || `${r.nombres_usuario_habilitado} ${r.apellidos_usuario_habilitado}`}
                  </Link>
                ) : (
                  r.nombre_completo_usuario_habilitado || `${r.nombres_usuario_habilitado} ${r.apellidos_usuario_habilitado}`
                )}
              </p>
              <p className="text-sm text-gray-600">
                Reactivado por:{' '}
                {renderUserLink(
                  r.nombre_completo_habilitado_por,
                  r.nombres_habilitado_por,
                  r.apellidos_habilitado_por,
                  r.habilitado_por
                )}
              </p>
            </div>
          </div>
        );
      }
      case 'usuario-creado': {
        const r = record as UsuarioCreadoAuditRecord;
        // Construir nombre completo
        let nombreCompleto = `${r.nombres} ${r.apellidos}`.trim();
        if (!nombreCompleto) {
          nombreCompleto = 'Usuario desconocido';
        }

        return (
          <div className="flex items-start gap-3">
            <UserAvatar fotoPerfil={r.foto_perfil_usuario} nombre={nombreCompleto} size={25} />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                {r.cedula ? (
                  <Link
                    href={`/dashboard/users/${r.cedula}`}
                    className="text-primary hover:underline font-medium transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {nombreCompleto}
                  </Link>
                ) : (
                  nombreCompleto
                )}
              </p>
              <p className="text-sm text-gray-600">
                Cédula: {r.cedula} • Creado por:{' '}
                {renderUserLink(
                  r.nombre_completo_usuario_creo,
                  r.nombres_usuario_creo,
                  r.apellidos_usuario_creo,
                  r.id_usuario_creo
                )}
              </p>
            </div>
          </div>
        );
      }
      case 'usuario-actualizado-campos': {
        const r = record as UsuarioActualizadoCamposAuditRecord;
        // Construir nombre completo
        let nombreCompleto = r.nombre_completo_usuario;
        if (!nombreCompleto && (r.nombres_usuario || r.apellidos_usuario)) {
          nombreCompleto = `${r.nombres_usuario || ''} ${r.apellidos_usuario || ''}`.trim();
        }
        if (!nombreCompleto) {
          nombreCompleto = 'Usuario desconocido';
        }

        return (
          <div className="flex items-start gap-3">
            <UserAvatar fotoPerfil={r.foto_perfil_usuario} nombre={nombreCompleto} size={25} />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                {r.ci_usuario ? (
                  <Link
                    href={`/dashboard/users/${r.ci_usuario}`}
                    className="text-primary hover:underline font-medium transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {nombreCompleto}
                  </Link>
                ) : (
                  nombreCompleto
                )}
              </p>
              <p className="text-sm text-gray-600">
                Cédula: {r.ci_usuario}
                {r.tipo_usuario_anterior !== r.tipo_usuario_nuevo && (
                  <> • {r.tipo_usuario_anterior} → {r.tipo_usuario_nuevo}</>
                )}
                {' • '}Actualizado por:{' '}
                {renderUserLink(
                  r.nombre_completo_usuario_actualizo,
                  r.nombres_usuario_actualizo,
                  r.apellidos_usuario_actualizo,
                  r.id_usuario_actualizo
                )}
              </p>
            </div>
          </div>
        );
      }
      case 'caso-eliminado': {
        const r = record as CasoEliminadoAuditRecord;
        return (
          <div className="flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                Caso #{r.caso_eliminado} -{' '}
                <span className="text-gray-600">
                  {r.cedula_solicitante ? (
                    <Link
                      href={`/dashboard/applicants/${r.cedula_solicitante}`}
                      className="text-primary hover:underline font-medium transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {r.nombre_completo_solicitante || r.cedula_solicitante}
                    </Link>
                  ) : <span className="italic">Solicitante desconocido</span>}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Eliminado por:{' '}
                {renderUserLink(
                  r.nombre_completo_usuario_elimino,
                  r.nombres_usuario_elimino,
                  r.apellidos_usuario_elimino,
                  r.eliminado_por
                )}
              </p>
            </div>
          </div>
        );
      }
      case 'caso-creado': {
        const r = record as CasoCreadoAuditRecord;
        return (
          <div className="flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                <Link
                  href={`/dashboard/cases/${r.id_caso}`}
                  className="text-primary hover:underline transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Caso #{r.id_caso}
                </Link>
                {' '}-{' '}
                <span className="text-gray-600">
                  {r.cedula_solicitante ? (
                    <Link
                      href={`/dashboard/applicants/${r.cedula_solicitante}`}
                      className="text-primary hover:underline font-medium transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {r.nombre_completo_solicitante || r.cedula_solicitante}
                    </Link>
                  ) : <span className="italic">Solicitante desconocido</span>}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Creado por:{' '}
                {renderUserLink(
                  r.nombre_completo_usuario_creo,
                  r.nombres_usuario_creo,
                  r.apellidos_usuario_creo,
                  r.id_usuario_creo
                )}
              </p>
            </div>
          </div>
        );
      }
      case 'estudiante-inscrito': {
        const r = record as EstudianteInscritoAuditRecord;
        const nombreCompleto = r.nombres && r.apellidos
          ? `${r.nombres} ${r.apellidos}`.trim()
          : (r.nombres || r.apellidos || 'Estudiante desconocido');

        return (
          <div className="flex items-start gap-3">
            <UserAvatar fotoPerfil={r.foto_perfil_usuario} nombre={nombreCompleto} size={25} />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                <Link
                  href={`/dashboard/users/${r.cedula}`}
                  className="text-primary hover:underline transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {nombreCompleto}
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Cédula: {r.cedula} • Inscrito por:{' '}
                {renderUserLink(
                  r.nombre_completo_usuario_creo,
                  r.nombres_usuario_creo,
                  r.apellidos_usuario_creo,
                  r.id_usuario_creo
                )}
              </p>
            </div>
          </div>
        );
      }
      case 'profesor-asignado': {
        const r = record as any;
        const nombreCompleto = r.nombres && r.apellidos
          ? `${r.nombres} ${r.apellidos}`.trim()
          : (r.nombres || r.apellidos || 'Profesor desconocido');

        return (
          <div className="flex items-start gap-3">
            <UserAvatar fotoPerfil={r.foto_perfil_usuario} nombre={nombreCompleto} size={25} />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                <Link
                  href={`/dashboard/users/${r.cedula}`}
                  className="text-primary hover:underline transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {nombreCompleto}
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Cédula: {r.cedula} • Asignado por:{' '}
                {renderUserLink(
                  r.nombre_completo_usuario_creo,
                  r.nombres_usuario_creo,
                  r.apellidos_usuario_creo,
                  r.id_usuario_creo
                )}
              </p>
            </div>
          </div>
        );
      }
      case 'beneficiario-actualizado': {
        const r = record as BeneficiarioActualizadoAuditRecord;
        // Usar nombres nuevos si existen, si no, anteriores.
        // Esto previene "Beneficiario desconocido" si solo cambian algunos campos y los nuevos vienen null (aunque no deberian por trigger)
        const nombres = r.nombres_nuevo || r.nombres_anterior || '';
        const apellidos = r.apellidos_nuevo || r.apellidos_anterior || '';
        const nombreCompleto = `${nombres} ${apellidos}`.trim() || 'Beneficiario desconocido';

        return (
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                {nombreCompleto}
              </p>
              <p className="text-sm text-gray-600">
                Caso #{r.id_caso} • Actualizado por:{' '}
                {renderUserLink(
                  r.nombre_completo_usuario_accion || r.usuario_nombre_completo,
                  null,
                  null,
                  r.id_usuario_actualizo
                )}
              </p>
            </div>
          </div>
        );
      }

      // Solicitantes

      case 'solicitante-eliminado': {
        const r = record as SolicitanteEliminadoAuditRecord;
        return (
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                {r.nombres_solicitante_eliminado || 'N/A'} {r.apellidos_solicitante_eliminado || ''}
                {r.solicitante_eliminado && (
                  <span className="text-gray-600 font-normal"> (Cédula: {r.solicitante_eliminado})</span>
                )}
              </p>
              <p className="text-sm text-gray-600">
                Eliminado por:{' '}
                {renderUserLink(
                  r.nombre_completo_usuario_elimino,
                  r.nombres_usuario_elimino,
                  r.apellidos_usuario_elimino,
                  r.eliminado_por
                )}
              </p>
            </div>
          </div>
        );
      }
      case 'solicitante-creado': {
        const r = record as SolicitanteCreadoAuditRecord;
        const nombreCompleto = r.nombres && r.apellidos
          ? `${r.nombres} ${r.apellidos}`.trim()
          : (r.nombres || r.apellidos || 'Solicitante desconocido');
        return (
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                <Link
                  href={`/dashboard/applicants/${r.cedula}`}
                  className="text-primary hover:underline transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {nombreCompleto}
                </Link>
                {r.cedula && (
                  <span className="text-gray-600 font-normal"> (Cédula: {r.cedula})</span>
                )}
              </p>
              <p className="text-sm text-gray-600">
                Creado por:{' '}
                {renderUserLink(
                  r.nombre_completo_usuario_creo,
                  r.nombres_usuario_creo,
                  r.apellidos_usuario_creo,
                  r.id_usuario_creo
                )}
              </p>
            </div>
          </div>
        );
      }
      case 'solicitante-actualizado': {
        const r = record as SolicitanteActualizadoAuditRecord;
        const nombreCompleto = r.nombres_solicitante && r.apellidos_solicitante
          ? `${r.nombres_solicitante} ${r.apellidos_solicitante}`.trim()
          : (r.nombres_solicitante || r.apellidos_solicitante || 'Solicitante desconocido');
        return (
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                <Link
                  href={`/dashboard/applicants/${r.cedula_solicitante}`}
                  className="text-primary hover:underline transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {nombreCompleto}
                </Link>
                {r.cedula_solicitante && (
                  <span className="text-gray-600 font-normal"> (Cédula: {r.cedula_solicitante})</span>
                )}
              </p>
              <p className="text-sm text-gray-600">
                Actualizado por:{' '}
                {renderUserLink(
                  r.nombre_completo_usuario_actualizo,
                  r.nombres_usuario_actualizo,
                  r.apellidos_usuario_actualizo,
                  r.id_usuario_actualizo
                )}
              </p>
            </div>
          </div>
        );
      }
      // Catálogos - casos genéricos para eliminados
      case 'estado-eliminado':
      case 'materia-eliminada':
      case 'nivel-educativo-eliminado':
      case 'nucleo-eliminado':
      case 'condicion-trabajo-eliminada':
      case 'condicion-actividad-eliminada':
      case 'tipo-caracteristica-eliminado':
      case 'semestre-eliminado':
      case 'municipio-eliminado':
      case 'parroquia-eliminada':
      case 'categoria-eliminada':
      case 'subcategoria-eliminada':
      case 'ambito-legal-eliminado':
      case 'caracteristica-eliminada':
      // Inserciones
      case 'estado-insertado':
      case 'materia-insertada':
      case 'nivel-educativo-insertado':
      case 'nucleo-insertado':
      case 'condicion-trabajo-insertada':
      case 'condicion-actividad-insertada':
      case 'tipo-caracteristica-insertado':
      case 'semestre-insertado':
      case 'municipio-insertado':
      case 'parroquia-insertada':
      case 'categoria-insertada':
      case 'subcategoria-insertada':
      case 'ambito-legal-insertado':
      case 'caracteristica-insertada': {
        const r = record as any;
        const iconMap: Record<string, any> = {
          'estado-eliminado': MapPin,
          'materia-eliminada': BookOpen,
          'nivel-educativo-eliminado': GraduationCap,
          'nucleo-eliminado': Building,
          'condicion-trabajo-eliminada': Briefcase,
          'condicion-actividad-eliminada': Activity,
          'tipo-caracteristica-eliminado': Tag,
          'semestre-eliminado': Calendar,
          'municipio-eliminado': Building2,
          'parroquia-eliminada': Home,
          'categoria-eliminada': FolderTree,
          'subcategoria-eliminada': FileText,
          'ambito-legal-eliminado': Scale,
          'caracteristica-eliminada': Tags,
          // Inserciones
          'estado-insertado': MapPin,
          'materia-insertada': BookOpen,
          'nivel-educativo-insertado': GraduationCap,
          'nucleo-insertado': Building,
          'condicion-trabajo-insertada': Briefcase,
          'condicion-actividad-insertada': Activity,
          'tipo-caracteristica-insertado': Tag,
          'semestre-insertado': Calendar,
          'municipio-insertado': Building2,
          'parroquia-insertada': Home,
          'categoria-insertada': FolderTree,
          'subcategoria-insertada': FileText,
          'ambito-legal-insertado': Scale,
          'caracteristica-insertada': Tags,
        };
        const Icon = iconMap[type] || FileText;

        // Priorizar el nombre de la entidad misma sobre las entidades fuertes
        // Determinar el nombre según el tipo específico de auditoría
        let nameField: string;
        if (type === 'categoria-eliminada' || type === 'categoria-insertada') {
          nameField = r.nombre_categoria || 'N/A';
        } else if (type === 'subcategoria-eliminada' || type === 'subcategoria-insertada') {
          nameField = r.nombre_subcategoria || 'N/A';
        } else if (type === 'ambito-legal-eliminado' || type === 'ambito-legal-insertado') {
          nameField = r.nombre_ambito_legal || 'N/A';
        } else if (type === 'estado-eliminado' || type === 'estado-insertado') {
          nameField = r.nombre_estado || 'N/A';
        } else if (type === 'materia-eliminada' || type === 'materia-insertada') {
          nameField = r.nombre_materia || 'N/A';
        } else if (type === 'nucleo-eliminado' || type === 'nucleo-insertado') {
          nameField = r.nombre_nucleo || 'N/A';
        } else if (type === 'condicion-trabajo-eliminada' || type === 'condicion-trabajo-insertada') {
          nameField = r.nombre_trabajo || 'N/A';
        } else if (type === 'condicion-actividad-eliminada' || type === 'condicion-actividad-insertada') {
          nameField = r.nombre_actividad || 'N/A';
        } else if (type === 'tipo-caracteristica-eliminado' || type === 'tipo-caracteristica-insertado') {
          nameField = r.nombre_tipo_caracteristica || 'N/A';
        } else if (type === 'municipio-eliminado' || type === 'municipio-insertado') {
          nameField = r.nombre_municipio || 'N/A';
        } else if (type === 'parroquia-eliminada' || type === 'parroquia-insertada') {
          nameField = r.nombre_parroquia || 'N/A';
        } else if (type === 'nivel-educativo-eliminado' || type === 'nivel-educativo-insertado' ||
          type === 'caracteristica-eliminada' || type === 'caracteristica-insertada') {
          // Estos usan descripcion en lugar de nombre
          nameField = r.descripcion || 'N/A';
        } else if (type === 'semestre-eliminado' || type === 'semestre-insertado') {
          nameField = r.term || 'N/A';
        } else {
          // Fallback para otros casos
          nameField = r.descripcion || 'N/A';
        }

        // Para características, mostrar solo num_caracteristica (sin guión)
        const caracteristicaId = r.num_caracteristica != null ? r.num_caracteristica : null;

        const idField = r.id_estado || r.id_materia || r.id_nivel_educativo || r.id_nucleo ||
          r.id_trabajo || r.id_actividad || r.id_tipo || r.term ||
          (r.id_estado != null && r.num_municipio != null ? `${r.id_estado}-${r.num_municipio}` : null) ||
          (r.id_estado != null && r.num_municipio != null && r.num_parroquia != null ? `${r.id_estado}-${r.num_municipio}-${r.num_parroquia}` : null) ||
          (r.id_materia != null && r.num_categoria != null ? `${r.id_materia}-${r.num_categoria}` : null) ||
          (r.id_materia != null && r.num_categoria != null && r.num_subcategoria != null ? `${r.id_materia}-${r.num_categoria}-${r.num_subcategoria}` : null) ||
          (r.id_materia != null && r.num_categoria != null && r.num_subcategoria != null && r.num_ambito_legal != null ? `${r.id_materia}-${r.num_categoria}-${r.num_subcategoria}-${r.num_ambito_legal}` : null) ||
          caracteristicaId || 'N/A';

        const isInserted = type.includes('-insertado') || type.includes('-insertada');
        const actionText = isInserted ? 'Creado por' : 'Eliminado por';
        const usuarioField = isInserted ? {
          nombre: r.nombre_completo_usuario_creo,
          nombres: r.nombres_usuario_creo,
          apellidos: r.apellidos_usuario_creo,
          id: r.id_usuario_creo
        } : {
          nombre: r.nombre_completo_usuario_elimino,
          nombres: r.nombres_usuario_elimino,
          apellidos: r.apellidos_usuario_elimino,
          id: r.id_usuario_elimino
        };

        // Para características, mostrar también el tipo de característica
        const tipoCaracteristica = (type === 'caracteristica-eliminada' || type === 'caracteristica-insertada')
          ? r.nombre_tipo_caracteristica
          : null;

        // Para categorías, mostrar también la materia
        const materiaCategoria = (type === 'categoria-eliminada' || type === 'categoria-insertada')
          ? r.nombre_materia
          : null;

        // Para subcategorías, mostrar también la categoría
        const categoriaSubcategoria = (type === 'subcategoria-eliminada' || type === 'subcategoria-insertada')
          ? r.nombre_categoria
          : null;

        // Para ámbitos legales, mostrar también la subcategoría
        const subcategoriaAmbito = (type === 'ambito-legal-eliminado' || type === 'ambito-legal-insertado')
          ? r.nombre_subcategoria
          : null;

        // Para municipios, mostrar también el estado
        const estadoMunicipio = (type === 'municipio-eliminado' || type === 'municipio-insertado')
          ? r.nombre_estado
          : null;

        // Para parroquias, mostrar también el municipio y el estado
        const municipioParroquia = (type === 'parroquia-eliminada' || type === 'parroquia-insertada')
          ? r.nombre_municipio
          : null;
        const estadoParroquia = (type === 'parroquia-eliminada' || type === 'parroquia-insertada')
          ? r.nombre_estado
          : null;

        return (
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                {nameField}
                {tipoCaracteristica && (
                  <span className="text-gray-500 font-normal ml-2">({tipoCaracteristica})</span>
                )}
                {materiaCategoria && (
                  <span className="text-gray-500 font-normal ml-2">({materiaCategoria})</span>
                )}
                {categoriaSubcategoria && (
                  <span className="text-gray-500 font-normal ml-2">({categoriaSubcategoria})</span>
                )}
                {subcategoriaAmbito && (
                  <span className="text-gray-500 font-normal ml-2">({subcategoriaAmbito})</span>
                )}
              </p>
              <p className="text-sm text-gray-600">
                ID: {idField} • {actionText}:{' '}
                {renderUserLink(
                  usuarioField.nombre,
                  usuarioField.nombres,
                  usuarioField.apellidos,
                  usuarioField.id
                )}
              </p>
            </div>
          </div>
        );
      }
      // Catálogos - casos genéricos para actualizados
      case 'estado-actualizado':
      case 'materia-actualizada':
      case 'nivel-educativo-actualizado':
      case 'nucleo-actualizado':
      case 'condicion-trabajo-actualizada':
      case 'condicion-actividad-actualizada':
      case 'tipo-caracteristica-actualizado':
      case 'semestre-actualizado':
      case 'municipio-actualizado':
      case 'parroquia-actualizada':
      case 'categoria-actualizada':
      case 'subcategoria-actualizada':
      case 'ambito-legal-actualizado':
      case 'caracteristica-actualizada': {
        const r = record as any;
        const iconMap: Record<string, any> = {
          'estado-actualizado': MapPin,
          'materia-actualizada': BookOpen,
          'nivel-educativo-actualizado': GraduationCap,
          'nucleo-actualizado': Building,
          'condicion-trabajo-actualizada': Briefcase,
          'condicion-actividad-actualizada': Activity,
          'tipo-caracteristica-actualizado': Tag,
          'semestre-actualizado': Calendar,
          'municipio-actualizado': Building2,
          'parroquia-actualizada': Home,
          'categoria-actualizada': FolderTree,
          'subcategoria-actualizada': FileText,
          'ambito-legal-actualizado': Scale,
          'caracteristica-actualizada': Tags,
        };
        const Icon = iconMap[type] || FileText;

        // Priorizar el nombre de la entidad misma sobre las entidades fuertes
        // Determinar el nombre según el tipo específico de auditoría
        let nameField: string;
        if (type === 'categoria-actualizada') {
          nameField = r.nombre_categoria_nuevo || 'N/A';
        } else if (type === 'subcategoria-actualizada') {
          nameField = r.nombre_subcategoria_nuevo || 'N/A';
        } else if (type === 'ambito-legal-actualizado') {
          nameField = r.nombre_ambito_legal_nuevo || 'N/A';
        } else if (type === 'estado-actualizado') {
          nameField = r.nombre_estado_nuevo || 'N/A';
        } else if (type === 'materia-actualizada') {
          nameField = r.nombre_materia_nuevo || 'N/A';
        } else if (type === 'nucleo-actualizado') {
          nameField = r.nombre_nucleo_nuevo || 'N/A';
        } else if (type === 'condicion-trabajo-actualizada') {
          nameField = r.nombre_trabajo_nuevo || 'N/A';
        } else if (type === 'condicion-actividad-actualizada') {
          nameField = r.nombre_actividad_nuevo || 'N/A';
        } else if (type === 'tipo-caracteristica-actualizado') {
          nameField = r.nombre_tipo_caracteristica_nuevo || 'N/A';
        } else if (type === 'municipio-actualizado') {
          nameField = r.nombre_municipio_nuevo || 'N/A';
        } else if (type === 'parroquia-actualizada') {
          nameField = r.nombre_parroquia_nuevo || 'N/A';
        } else if (type === 'nivel-educativo-actualizado' || type === 'caracteristica-actualizada') {
          // Estos usan descripcion en lugar de nombre
          nameField = r.descripcion_nuevo || 'N/A';
        } else if (type === 'semestre-actualizado') {
          nameField = r.term || 'N/A';
        } else {
          // Fallback para otros casos
          nameField = r.descripcion_nuevo || 'N/A';
        }

        // Para características, mostrar solo num_caracteristica (sin guión)
        const caracteristicaId = r.num_caracteristica != null ? r.num_caracteristica : null;

        const idField = r.id_estado || r.id_materia || r.id_nivel_educativo || r.id_nucleo ||
          r.id_trabajo || r.id_actividad || r.id_tipo || r.term ||
          (r.id_estado != null && r.num_municipio != null ? `${r.id_estado}-${r.num_municipio}` : null) ||
          (r.id_estado != null && r.num_municipio != null && r.num_parroquia != null ? `${r.id_estado}-${r.num_municipio}-${r.num_parroquia}` : null) ||
          (r.id_materia != null && r.num_categoria != null ? `${r.id_materia}-${r.num_categoria}` : null) ||
          (r.id_materia != null && r.num_categoria != null && r.num_subcategoria != null ? `${r.id_materia}-${r.num_categoria}-${r.num_subcategoria}` : null) ||
          (r.id_materia != null && r.num_categoria != null && r.num_subcategoria != null && r.num_ambito_legal != null ? `${r.id_materia}-${r.num_categoria}-${r.num_subcategoria}-${r.num_ambito_legal}` : null) ||
          caracteristicaId || 'N/A';

        // Para características, mostrar también el tipo de característica
        const tipoCaracteristica = type === 'caracteristica-actualizada'
          ? r.nombre_tipo_caracteristica
          : null;

        // Para categorías, mostrar también la materia
        const materiaCategoria = type === 'categoria-actualizada'
          ? r.nombre_materia
          : null;

        // Para subcategorías, mostrar también la categoría
        const categoriaSubcategoria = type === 'subcategoria-actualizada'
          ? r.nombre_categoria
          : null;

        // Para ámbitos legales, mostrar también la subcategoría
        const subcategoriaAmbito = type === 'ambito-legal-actualizado'
          ? r.nombre_subcategoria
          : null;

        // Para municipios, mostrar también el estado
        const estadoMunicipioActualizado = type === 'municipio-actualizado'
          ? r.nombre_estado
          : null;

        // Para parroquias, mostrar también el municipio y el estado
        const municipioParroquiaActualizada = type === 'parroquia-actualizada'
          ? r.nombre_municipio
          : null;
        const estadoParroquiaActualizada = type === 'parroquia-actualizada'
          ? r.nombre_estado
          : null;

        return (
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                {nameField}
                {tipoCaracteristica && (
                  <span className="text-gray-500 font-normal ml-2">({tipoCaracteristica})</span>
                )}
                {materiaCategoria && (
                  <span className="text-gray-500 font-normal ml-2">({materiaCategoria})</span>
                )}
                {categoriaSubcategoria && (
                  <span className="text-gray-500 font-normal ml-2">({categoriaSubcategoria})</span>
                )}
                {subcategoriaAmbito && (
                  <span className="text-gray-500 font-normal ml-2">({subcategoriaAmbito})</span>
                )}
                {estadoMunicipioActualizado && (
                  <span className="text-gray-500 font-normal ml-2">({estadoMunicipioActualizado})</span>
                )}
                {municipioParroquiaActualizada && estadoParroquiaActualizada && (
                  <span className="text-gray-500 font-normal ml-2">({municipioParroquiaActualizada}, {estadoParroquiaActualizada})</span>
                )}
              </p>
              <p className="text-sm text-gray-600">
                ID: {idField} • Actualizado por:{' '}
                {renderUserLink(
                  r.nombre_completo_usuario_actualizo,
                  r.nombres_usuario_actualizo,
                  r.apellidos_usuario_actualizo,
                  r.id_usuario_actualizo
                )}
              </p>
            </div>
          </div>
        );
      }
      case 'caso-actualizado': {
        const r = record as CasoActualizadoAuditRecord;
        return (
          <div className="flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                <Link
                  href={`/dashboard/cases/${r.id_caso}`}
                  className="text-primary hover:underline font-medium transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Caso #{r.id_caso}
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Actualizado por:{' '}
                {renderUserLink(
                  r.nombre_completo_usuario_actualizo,
                  r.nombres_usuario_actualizo,
                  r.apellidos_usuario_actualizo,
                  r.id_usuario_actualizo
                )}
              </p>
            </div>
          </div>
        );
      }

      // Beneficiarios
      case 'beneficiario-creado': {
        const r = record as BeneficiarioInscritoAuditRecord;
        const nombreCompleto = r.nombres && r.apellidos
          ? `${r.nombres} ${r.apellidos}`.trim()
          : (r.nombres || r.apellidos || 'Beneficiario desconocido');

        return (
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                {nombreCompleto}
                {r.cedula && <span className="text-gray-600 font-normal"> (Cédula: {r.cedula})</span>}
              </p>
              <p className="text-sm text-gray-600">
                Caso #{r.id_caso} • Inscrito por:{' '}
                {renderUserLink(
                  r.usuario_nombre_completo || null,
                  null,
                  null,
                  r.id_usuario_registro
                )}
              </p>
            </div>
          </div>
        );
      }
      case 'beneficiario-actualizado': {
        const r = record as BeneficiarioActualizadoAuditRecord;
        const nombreCompleto = r.nombres || 'Beneficiario desconocido';

        return (
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                {nombreCompleto}
                {r.cedula_anterior && <span className="text-gray-600 font-normal"> (Cédula: {r.cedula_anterior})</span>}
              </p>
              <p className="text-sm text-gray-600">
                Caso #{r.id_caso} • Actualizado por:{' '}
                {renderUserLink(
                  r.usuario_nombre_completo || null,
                  null,
                  null,
                  r.id_usuario_actualizo
                )}
              </p>
            </div>
          </div>
        );
      }
      case 'beneficiario-eliminado': {
        const r = record as BeneficiarioEliminadoAuditRecord;
        const nombreCompleto = r.nombres || 'Beneficiario desconocido';

        return (
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                {nombreCompleto}
                {r.cedula && <span className="text-gray-600 font-normal"> (Cédula: {r.cedula})</span>}
              </p>
              <p className="text-sm text-gray-600">
                Caso #{r.id_caso} • Eliminado por:{' '}
                {renderUserLink(
                  r.usuario_nombre_completo || null,
                  null,
                  null,
                  r.id_usuario_elimino
                )}
              </p>
            </div>
          </div>
        );
      }
      case 'equipo-actualizado': {
        const r = record as EquipoActualizadoAuditRecord;

        return (
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-gray-500" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                <Link href={`/dashboard/cases/${r.id_caso}`} className="hover:underline text-primary">
                  Caso #{r.id_caso}
                </Link>
                {' - '}
                {r.miembros_anteriores.length === 0 ? 'Equipo asignado' : 'Equipo actualizado'}
              </p>
              <p className="text-sm text-gray-600">
                Modificado por: {' '}
                {renderUserLink(
                  r.nombre_completo_usuario_modifico || null,
                  r.nombres_usuario_modifico,
                  r.apellidos_usuario_modifico,
                  r.id_usuario_modifico
                )}
              </p>
            </div>
          </div>
        );
      }

      default:
        console.warn('Tipo de auditoría no reconocido en renderSummary:', type);
        return (
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 mb-1">Registro de Auditoría</p>
              <p className="font-semibold text-gray-900">
                Tipo: {type}
              </p>
              <p className="text-sm text-gray-600">
                No se pudo renderizar el resumen para este tipo de registro
              </p>
            </div>
          </div>
        );
    }
  };


  const renderDetails = () => {
    switch (type) {
      case 'accion-creada': {
        const r = record as AccionCreadaAuditRecord;
        // Parsear ejecutores si vienen como JSON string (depende del driver de PostgreSQL)
        let ejecutoresArray: Array<{ nombre: string; cedula: string; fecha_ejecucion: string }> | null = null;
        if (r.ejecutores) {
          if (typeof r.ejecutores === 'string') {
            try {
              ejecutoresArray = JSON.parse(r.ejecutores);
            } catch {
              ejecutoresArray = null;
            }
          } else if (Array.isArray(r.ejecutores)) {
            ejecutoresArray = r.ejecutores;
          }
        }
        // Obtener fechas de ejecución únicas de los ejecutores
        const fechasEjecucion = ejecutoresArray
          ? [...new Set(ejecutoresArray.map(e => e.fecha_ejecucion).filter(Boolean))]
          : [];
        return (
          <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Información de la Acción</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">Detalle: {r.detalle_accion}</p>
              {r.comentario && <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">Comentario: {r.comentario}</p>}
              <p className="text-sm text-gray-600 mt-1">
                Usuarios Ejecutores:{' '}
                {ejecutoresArray && ejecutoresArray.length > 0 ? (
                  ejecutoresArray.map((e, idx) => (
                    <span key={e.cedula}>
                      <Link
                        href={`/dashboard/users/${e.cedula}`}
                        className="text-primary hover:underline"
                        onClick={(ev) => ev.stopPropagation()}
                      >
                        {e.nombre}
                      </Link>
                      {idx < ejecutoresArray!.length - 1 && ', '}
                    </span>
                  ))
                ) : (
                  'Ninguno asignado'
                )}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Fecha de Ejecución:{' '}
                {fechasEjecucion.length > 0
                  ? fechasEjecucion.map((d: string) => formatOnlyDate(d)).join(', ')
                  : 'No especificada'}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Auditoría</p>
              <p className="text-sm text-gray-600">Fecha creación: {formatDateTime(r.fecha_creacion)}</p>
              <p className="text-sm text-gray-600">
                Creada por:{' '}
                {renderUserLink(
                  r.nombre_completo_usuario_creo,
                  r.nombres_usuario_creo,
                  r.apellidos_usuario_creo,
                  r.id_usuario_creo
                )}
              </p>
            </div>
            <div className="pt-2" onClick={(e) => e.stopPropagation()}>
              <Link
                href={`/dashboard/cases/${r.id_caso}`}
                className="text-sm text-primary hover:underline"
              >
                Ver caso #{r.id_caso} →
              </Link>
            </div>
          </div>
        );
      }
      case 'accion-actualizada': {
        const r = record as AccionActualizadaAuditRecord;

        // Parsear ejecutores anteriores (pueden venir como JSON string o array)
        let ejecutoresAnteriorArray: Array<{ nombre: string; cedula: string; fecha_ejecucion: string }> | null = null;
        if (r.ejecutores_anterior) {
          if (typeof r.ejecutores_anterior === 'string') {
            try {
              ejecutoresAnteriorArray = JSON.parse(r.ejecutores_anterior);
            } catch {
              ejecutoresAnteriorArray = null;
            }
          } else if (Array.isArray(r.ejecutores_anterior)) {
            ejecutoresAnteriorArray = r.ejecutores_anterior;
          }
        }

        // Parsear ejecutores nuevos
        let ejecutoresNuevoArray: Array<{ nombre: string; cedula: string; fecha_ejecucion: string }> | null = null;
        if (r.ejecutores_nuevo) {
          if (typeof r.ejecutores_nuevo === 'string') {
            try {
              ejecutoresNuevoArray = JSON.parse(r.ejecutores_nuevo);
            } catch {
              ejecutoresNuevoArray = null;
            }
          } else if (Array.isArray(r.ejecutores_nuevo)) {
            ejecutoresNuevoArray = r.ejecutores_nuevo;
          }
        }

        // Obtener fechas de ejecución únicas
        const fechasAnterior = ejecutoresAnteriorArray
          ? [...new Set(ejecutoresAnteriorArray.map(e => e.fecha_ejecucion).filter(Boolean))]
          : [];
        const fechasNuevo = ejecutoresNuevoArray
          ? [...new Set(ejecutoresNuevoArray.map(e => e.fecha_ejecucion).filter(Boolean))]
          : [];

        // Comparar si ejecutores cambiaron (comparando strings de nombres)
        const ejecutoresAnteriorStr = ejecutoresAnteriorArray
          ? ejecutoresAnteriorArray.map(e => e.nombre).join(', ')
          : '';
        const ejecutoresNuevoStr = ejecutoresNuevoArray
          ? ejecutoresNuevoArray.map(e => e.nombre).join(', ')
          : '';

        // Comparar si fechas cambiaron
        const fechasAnteriorStr = fechasAnterior.join(', ');
        const fechasNuevoStr = fechasNuevo.join(', ');

        return (
          <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Cambios Realizados</p>
              {r.detalle_accion_anterior !== r.detalle_accion_nuevo && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Detalle:{' '}
                    <span className="line-through text-red-500">
                      {r.detalle_accion_anterior || 'N/A'}
                    </span>
                    {' → '}
                    <span className="text-green-600">
                      {r.detalle_accion_nuevo || 'N/A'}
                    </span>
                  </p>
                </div>
              )}
              {r.comentario_anterior !== r.comentario_nuevo && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Comentario:{' '}
                    <span className="line-through text-red-500">
                      {r.comentario_anterior || 'Sin comentario'}
                    </span>
                    {' → '}
                    <span className="text-green-600">
                      {r.comentario_nuevo || 'Sin comentario'}
                    </span>
                  </p>
                </div>
              )}
              {ejecutoresAnteriorStr !== ejecutoresNuevoStr && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Ejecutores:{' '}
                    <span className="line-through text-red-500">
                      {ejecutoresAnteriorArray && ejecutoresAnteriorArray.length > 0
                        ? ejecutoresAnteriorArray.map((e, idx) => (
                          <span key={e.cedula}>
                            <Link
                              href={`/dashboard/users/${e.cedula}`}
                              className="text-red-500 hover:underline"
                              onClick={(ev) => ev.stopPropagation()}
                            >
                              {e.nombre}
                            </Link>
                            {idx < ejecutoresAnteriorArray!.length - 1 && ', '}
                          </span>
                        ))
                        : 'Ninguno'}
                    </span>
                    {' → '}
                    <span className="text-green-600">
                      {ejecutoresNuevoArray && ejecutoresNuevoArray.length > 0
                        ? ejecutoresNuevoArray.map((e, idx) => (
                          <span key={e.cedula}>
                            <Link
                              href={`/dashboard/users/${e.cedula}`}
                              className="text-green-600 hover:underline"
                              onClick={(ev) => ev.stopPropagation()}
                            >
                              {e.nombre}
                            </Link>
                            {idx < ejecutoresNuevoArray!.length - 1 && ', '}
                          </span>
                        ))
                        : 'Ninguno'}
                    </span>
                  </p>
                </div>
              )}
              {fechasAnteriorStr !== fechasNuevoStr && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Fecha de Ejecución:{' '}
                    <span className="line-through text-red-500">
                      {fechasAnterior.length > 0
                        ? fechasAnterior.map((d: string) => formatOnlyDate(d)).join(', ')
                        : 'Ninguna'}
                    </span>
                    {' → '}
                    <span className="text-green-600">
                      {fechasNuevo.length > 0
                        ? fechasNuevo.map((d: string) => formatOnlyDate(d)).join(', ')
                        : 'Ninguna'}
                    </span>
                  </p>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Auditoría</p>
              <p className="text-sm text-gray-600">Fecha actualización: {formatDateTime(r.fecha_actualizacion)}</p>
              <p className="text-sm text-gray-600">
                Actualizada por:{' '}
                {renderUserLink(
                  r.nombre_completo_usuario_actualizo,
                  r.nombres_usuario_actualizo,
                  r.apellidos_usuario_actualizo,
                  r.id_usuario_actualizo
                )}
              </p>
            </div>
            <div className="pt-2" onClick={(e) => e.stopPropagation()}>
              <Link
                href={`/dashboard/cases/${r.id_caso}`}
                className="text-sm text-primary hover:underline"
              >
                Ver caso #{r.id_caso} →
              </Link>
            </div>
          </div>
        );
      }
      case 'accion-eliminada': {
        const r = record as AccionEliminadaAuditRecord;
        // Parsear ejecutores si vienen como JSON string
        let ejecutoresArray: Array<{ nombre: string; cedula: string; fecha_ejecucion: string }> | null = null;
        if (r.ejecutores) {
          if (typeof r.ejecutores === 'string') {
            try {
              ejecutoresArray = JSON.parse(r.ejecutores);
            } catch {
              ejecutoresArray = null;
            }
          } else if (Array.isArray(r.ejecutores)) {
            ejecutoresArray = r.ejecutores;
          }
        }
        // Obtener fechas de ejecución únicas de los ejecutores
        const fechasEjecucion = ejecutoresArray
          ? [...new Set(ejecutoresArray.map(e => e.fecha_ejecucion).filter(Boolean))]
          : [];
        return (
          <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Información de la Acción Eliminada</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">Detalle: {r.detalle_accion}</p>
              {r.comentario && <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">Comentario: {r.comentario}</p>}
              <p className="text-sm text-gray-600 mt-1">
                Usuarios Ejecutores:{' '}
                {ejecutoresArray && ejecutoresArray.length > 0 ? (
                  ejecutoresArray.map((e, idx) => (
                    <span key={e.cedula}>
                      <Link
                        href={`/dashboard/users/${e.cedula}`}
                        className="text-primary hover:underline"
                        onClick={(ev) => ev.stopPropagation()}
                      >
                        {e.nombre}
                      </Link>
                      {idx < ejecutoresArray!.length - 1 && ', '}
                    </span>
                  ))
                ) : (
                  'Ninguno asignado'
                )}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Fecha de Ejecución:{' '}
                {fechasEjecucion.length > 0
                  ? fechasEjecucion.map((d: string) => formatOnlyDate(d)).join(', ')
                  : 'No especificada'}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Datos de Eliminación</p>
              <p className="text-sm text-gray-600">Fecha eliminación: {formatDateTime(r.fecha)}</p>
              <p className="text-sm text-gray-600">
                Eliminada por:{' '}
                {renderUserLink(
                  r.nombre_completo_eliminado_por,
                  r.nombres_eliminado_por,
                  r.apellidos_eliminado_por,
                  r.eliminado_por
                )}
              </p>
              {r.motivo && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 font-medium">Motivo:</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-1">{r.motivo}</p>
                </div>
              )}
            </div>
            <div className="pt-2" onClick={(e) => e.stopPropagation()}>
              <Link
                href={`/dashboard/cases/${r.id_caso}`}
                className="text-sm text-primary hover:underline"
              >
                Ver caso #{r.id_caso} →
              </Link>
            </div>
          </div>
        );
      }
      case 'soporte': {
        const r = record as SoporteAuditRecord;
        return (
          <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Información del Documento</p>
                <p className="text-sm text-gray-600">Nombre: {r.nombre_archivo}</p>
                <p className="text-sm text-gray-600">Tipo: {r.tipo_mime || 'N/A'}</p>
                <p className="text-sm text-gray-600">Tamaño: {formatFileSize(r.tamano_bytes)}</p>
                {r.descripcion && (
                  <p className="text-sm text-gray-600">Descripción: {r.descripcion}</p>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Fechas</p>
                {r.fecha_consignacion && (
                  <p className="text-sm text-gray-600">Consignación: {formatDate(r.fecha_consignacion)}</p>
                )}
                <p className="text-sm text-gray-600">Eliminación: {formatDate(r.fecha_eliminacion)}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Subido por</p>
                <p className="text-sm text-gray-600">
                  {r.id_usuario_subio ? (
                    renderUserLink(
                      r.nombre_completo_usuario_subio,
                      r.nombres_usuario_subio,
                      r.apellidos_usuario_subio,
                      r.id_usuario_subio
                    )
                  ) : (
                    <span className="text-gray-600">N/A</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Eliminado por</p>
                <p className="text-sm text-gray-600">
                  {renderUserLink(
                    r.nombre_completo_usuario_elimino,
                    r.nombres_usuario_elimino,
                    r.apellidos_usuario_elimino,
                    r.id_usuario_elimino
                  )}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Motivo de eliminación</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{r.motivo || 'Sin motivo registrado'}</p>
            </div>
            <div className="pt-2" onClick={(e) => e.stopPropagation()}>
              <Link
                href={`/dashboard/cases/${r.id_caso}`}
                className="text-sm text-primary hover:underline"
              >
                Ver caso #{r.id_caso} →
              </Link>
            </div>
          </div>
        );
      }
      case 'soporte-creado': {
        const r = record as SoporteCreadoAuditRecord;
        return (
          <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Información del Documento</p>
                <p className="text-sm text-gray-600">Nombre: {r.nombre_archivo}</p>
                <p className="text-sm text-gray-600">Tipo: {r.tipo_mime || 'N/A'}</p>
                <p className="text-sm text-gray-600">Tamaño: {formatFileSize(r.tamano_bytes)}</p>
                {r.descripcion && (
                  <p className="text-sm text-gray-600">Descripción: {r.descripcion}</p>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Fechas</p>
                {r.fecha_consignacion && (
                  <p className="text-sm text-gray-600">Consignación: {formatDateOnly(r.fecha_consignacion)}</p>
                )}
                <p className="text-sm text-gray-600">Fecha creación: {formatDate(r.fecha_creacion)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Subido por</p>
              <p className="text-sm text-gray-600">
                {r.id_usuario_subio ? (
                  renderUserLink(
                    r.nombre_completo_usuario_subio,
                    r.nombres_usuario_subio,
                    r.apellidos_usuario_subio,
                    r.id_usuario_subio
                  )
                ) : (
                  <span className="text-gray-600">N/A</span>
                )}
              </p>
            </div>
            <div className="pt-2" onClick={(e) => e.stopPropagation()}>
              <Link
                href={`/dashboard/cases/${r.id_caso}`}
                className="text-sm text-primary hover:underline"
              >
                Ver caso #{r.id_caso} →
              </Link>
            </div>
          </div>
        );
      }
      // Beneficiarios
      case 'beneficiario-creado': {
        const r = record as BeneficiarioInscritoAuditRecord;
        const nombreCompleto = r.nombres && r.apellidos
          ? `${r.nombres} ${r.apellidos}`.trim()
          : (r.nombres || r.apellidos || 'Beneficiario desconocido');

        return (
          <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Información del Beneficiario</p>
              {r.cedula && <p className="text-sm text-gray-600">Cédula: {r.cedula}</p>}
              <p className="text-sm text-gray-600">Nombres: {r.nombres}</p>
              <p className="text-sm text-gray-600">Apellidos: {r.apellidos}</p>
              <p className="text-sm text-gray-600">Fecha Nacimiento: {formatOnlyDate(r.fecha_nacimiento)}</p>
              <p className="text-sm text-gray-600">Sexo: {r.sexo}</p>
              <p className="text-sm text-gray-600">Tipo: {r.tipo_beneficiario}</p>
              <p className="text-sm text-gray-600">Parentesco: {r.parentesco}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Auditoría</p>
              <p className="text-sm text-gray-600">Fecha: {formatDateTime(r.fecha_registro)}</p>
              <p className="text-sm text-gray-600">
                Inscrito por:{' '}
                {renderUserLink(
                  r.usuario_nombre_completo || null,
                  null,
                  null,
                  r.id_usuario_registro
                )}
              </p>
            </div>
            <div className="pt-2" onClick={(e) => e.stopPropagation()}>
              <Link
                href={`/dashboard/cases/${r.id_caso}`}
                className="text-sm text-primary hover:underline"
              >
                Ver caso #{r.id_caso} →
              </Link>
            </div>
          </div>
        );
      }
      case 'beneficiario-actualizado': {
        const r = record as BeneficiarioActualizadoAuditRecord;
        return (
          <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Cambios Realizados</p>

              {r.cedula_anterior !== r.cedula_nuevo && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Cédula: <span className="line-through text-red-500">{r.cedula_anterior || 'N/A'}</span>
                    {' → '}
                    <span className="text-green-600">{r.cedula_nuevo || 'N/A'}</span>
                  </p>
                </div>
              )}
              {r.nombres_anterior !== r.nombres_nuevo && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Nombres: <span className="line-through text-red-500">{r.nombres_anterior || 'N/A'}</span>
                    {' → '}
                    <span className="text-green-600">{r.nombres_nuevo || 'N/A'}</span>
                  </p>
                </div>
              )}
              {r.apellidos_anterior !== r.apellidos_nuevo && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Apellidos: <span className="line-through text-red-500">{r.apellidos_anterior || 'N/A'}</span>
                    {' → '}
                    <span className="text-green-600">{r.apellidos_nuevo || 'N/A'}</span>
                  </p>
                </div>
              )}
              {r.sexo_anterior !== r.sexo_nuevo && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Sexo: <span className="line-through text-red-500">{r.sexo_anterior || 'N/A'}</span>
                    {' → '}
                    <span className="text-green-600">{r.sexo_nuevo || 'N/A'}</span>
                  </p>
                </div>
              )}
              {r.tipo_beneficiario_anterior !== r.tipo_beneficiario_nuevo && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Tipo: <span className="line-through text-red-500">{r.tipo_beneficiario_anterior || 'N/A'}</span>
                    {' → '}
                    <span className="text-green-600">{r.tipo_beneficiario_nuevo || 'N/A'}</span>
                  </p>
                </div>
              )}
              {r.parentesco_anterior !== r.parentesco_nuevo && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Parentesco: <span className="line-through text-red-500">{r.parentesco_anterior || 'N/A'}</span>
                    {' → '}
                    <span className="text-green-600">{r.parentesco_nuevo || 'N/A'}</span>
                  </p>
                </div>
              )}
              {r.edad_mental_anterior !== r.edad_mental_nuevo && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Edad Mental: <span className="line-through text-red-500">{r.edad_mental_anterior || 'N/A'}</span>
                    {' → '}
                    <span className="text-green-600">{r.edad_mental_nuevo || 'N/A'}</span>
                  </p>
                </div>
              )}
              {r.ingresos_anterior !== r.ingresos_nuevo && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Ingresos: <span className="line-through text-red-500">{r.ingresos_anterior || 'N/A'}</span>
                    {' → '}
                    <span className="text-green-600">{r.ingresos_nuevo || 'N/A'}</span>
                  </p>
                </div>
              )}
              {!areDatesEqual(r.fecha_nacimiento_anterior, r.fecha_nacimiento_nuevo) && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Fecha Nacimiento: <span className="line-through text-red-500">{formatOnlyDate(r.fecha_nacimiento_anterior)}</span>
                    {' → '}
                    <span className="text-green-600">{formatOnlyDate(r.fecha_nacimiento_nuevo)}</span>
                  </p>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Auditoría</p>
              <p className="text-sm text-gray-600">Fecha: {formatDateTime(r.fecha_actualizacion)}</p>
              <p className="text-sm text-gray-600">
                Actualizado por:{' '}
                {renderUserLink(
                  r.usuario_nombre_completo || null,
                  null,
                  null,
                  r.id_usuario_actualizo
                )}
              </p>
            </div>
            <div className="pt-2" onClick={(e) => e.stopPropagation()}>
              <Link
                href={`/dashboard/cases/${r.id_caso}`}
                className="text-sm text-primary hover:underline"
              >
                Ver caso #{r.id_caso} →
              </Link>
            </div>
          </div>
        );
      }
      case 'beneficiario-eliminado': {
        const r = record as BeneficiarioEliminadoAuditRecord;
        const nombreCompleto = r.nombres && r.apellidos
          ? `${r.nombres} ${r.apellidos}`.trim()
          : (r.nombres || r.apellidos || 'Beneficiario desconocido');

        return (
          <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Información del Beneficiario</p>
              <p className="text-sm text-gray-600">Nombre: {nombreCompleto}</p>
              <p className="text-sm text-gray-600">Cédula: {r.cedula || 'N/A'}</p>
              <p className="text-sm text-gray-600">Fecha Nacimiento: {formatOnlyDate(r.fecha_nacimiento)}</p>
              <p className="text-sm text-gray-600">Sexo: {r.sexo || 'N/A'}</p>
              <p className="text-sm text-gray-600">Tipo: {r.tipo_beneficiario || 'N/A'}</p>
              <p className="text-sm text-gray-600">Parentesco: {r.parentesco || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Auditoría</p>
              <p className="text-sm text-gray-600">Fecha: {formatDateTime(r.fecha_eliminacion)}</p>
              <p className="text-sm text-gray-600">
                Eliminado por:{' '}
                {renderUserLink(
                  r.usuario_nombre_completo || null,
                  null,
                  null,
                  r.id_usuario_elimino
                )}
              </p>
            </div>
            <div className="pt-2" onClick={(e) => e.stopPropagation()}>
              <Link
                href={`/dashboard/cases/${r.id_caso}`}
                className="text-sm text-primary hover:underline"
              >
                Ver caso #{r.id_caso} →
              </Link>
            </div>
          </div>
        );
      }
      case 'cita-eliminada': {
        const r = record as CitaEliminadaAuditRecord;
        return (
          <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Información de la Cita</p>
                <p className="text-sm text-gray-600">Número: {r.num_cita}</p>
                <p className="text-sm text-gray-600">Fecha encuentro: {formatDateOnly(r.fecha_encuentro)}</p>
                {r.fecha_proxima_cita && (
                  <p className="text-sm text-gray-600">Próxima cita: {formatDateOnly(r.fecha_proxima_cita)}</p>
                )}
                <p className="text-sm text-gray-600">Orientación: {r.orientacion}</p>
                {r.usuarios_atendieron && Array.isArray(r.usuarios_atendieron) && r.usuarios_atendieron.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Atendida por:</p>
                    <div className="space-y-1">
                      {r.usuarios_atendieron.map((usuario: any, idx: number) => (
                        <p key={idx} className="text-sm text-gray-600">
                          {renderUserLink(
                            usuario.nombre_completo,
                            usuario.nombres,
                            usuario.apellidos,
                            usuario.id_usuario
                          )}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Auditoría</p>
                {r.id_usuario_registro && (
                  <p className="text-sm text-gray-600">
                    Registrado por:{' '}
                    {renderUserLink(
                      r.nombre_completo_usuario_registro,
                      r.nombres_usuario_registro,
                      r.apellidos_usuario_registro,
                      r.id_usuario_registro
                    )}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  Eliminado por:{' '}
                  {renderUserLink(
                    r.nombre_completo_usuario_elimino,
                    r.nombres_usuario_elimino,
                    r.apellidos_usuario_elimino,
                    r.id_usuario_elimino
                  )}
                </p>
                <p className="text-sm text-gray-600">Fecha eliminación: {formatDate(r.fecha_eliminacion)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Motivo de eliminación</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{r.motivo || 'Sin motivo registrado'}</p>
            </div>
            <div className="pt-2" onClick={(e) => e.stopPropagation()}>
              <Link
                href={`/dashboard/cases/${r.id_caso}`}
                className="text-sm text-primary hover:underline"
              >
                Ver caso #{r.id_caso} →
              </Link>
            </div>
          </div>
        );
      }
      case 'cita-creada': {
        const r = record as CitaCreadaAuditRecord;
        return (
          <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Información de la Cita</p>
                <p className="text-sm text-gray-600">Número: {r.num_cita}</p>
                <p className="text-sm text-gray-600">Fecha encuentro: {formatDateOnly(r.fecha_encuentro)}</p>
                {r.fecha_proxima_cita && (
                  <p className="text-sm text-gray-600">Próxima cita: {formatDateOnly(r.fecha_proxima_cita)}</p>
                )}
                <p className="text-sm text-gray-600">Orientación: {r.orientacion}</p>
                {r.usuarios_atendieron && Array.isArray(r.usuarios_atendieron) && r.usuarios_atendieron.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Atendida por:</p>
                    <div className="space-y-1">
                      {r.usuarios_atendieron.map((usuario: any, idx: number) => (
                        <p key={idx} className="text-sm text-gray-600">
                          {renderUserLink(
                            usuario.nombre_completo,
                            usuario.nombres,
                            usuario.apellidos,
                            usuario.id_usuario
                          )}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Auditoría</p>
                <p className="text-sm text-gray-600">
                  Creado por:{' '}
                  {renderUserLink(
                    r.nombre_completo_usuario_creo,
                    r.nombres_usuario_creo,
                    r.apellidos_usuario_creo,
                    r.id_usuario_creo
                  )}
                </p>
                <p className="text-sm text-gray-600">Fecha creación: {formatDate(r.fecha_creacion)}</p>
              </div>
            </div>
            <div className="pt-2" onClick={(e) => e.stopPropagation()}>
              <Link
                href={`/dashboard/cases/${r.id_caso}`}
                className="text-sm text-primary hover:underline"
              >
                Ver caso #{r.id_caso} →
              </Link>
            </div>
          </div>
        );
      }
      case 'cita-actualizada': {
        const r = record as CitaActualizadaAuditRecord;
        return (
          <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Cambios Realizados</p>
                {r.fecha_encuentro_anterior !== r.fecha_encuentro_nueva && (
                  <div className="mb-2">
                    <p className="text-sm text-gray-600">
                      <span className="line-through text-red-500">
                        {r.fecha_encuentro_anterior ? formatDateOnly(r.fecha_encuentro_anterior) : 'N/A'}
                      </span>
                      {' → '}
                      <span className="text-green-600">
                        {r.fecha_encuentro_nueva ? formatDateOnly(r.fecha_encuentro_nueva) : 'N/A'}
                      </span>
                    </p>
                  </div>
                )}
                {r.fecha_proxima_cita_anterior !== r.fecha_proxima_cita_nueva && (
                  <div className="mb-2">
                    <p className="text-sm text-gray-600">
                      Próxima cita:{' '}
                      <span className="line-through text-red-500">
                        {r.fecha_proxima_cita_anterior ? formatDateOnly(r.fecha_proxima_cita_anterior) : 'N/A'}
                      </span>
                      {' → '}
                      <span className="text-green-600">
                        {r.fecha_proxima_cita_nueva ? formatDateOnly(r.fecha_proxima_cita_nueva) : 'N/A'}
                      </span>
                    </p>
                  </div>
                )}
                {r.orientacion_anterior !== r.orientacion_nueva && (
                  <div className="mb-2">
                    <p className="text-sm text-gray-600">
                      Orientación:{' '}
                      <span className="line-through text-red-500">
                        {r.orientacion_anterior || 'N/A'}
                      </span>
                      {' → '}
                      <span className="text-green-600">
                        {r.orientacion_nueva || 'N/A'}
                      </span>
                    </p>
                  </div>
                )}
                {r.usuarios_atendieron && Array.isArray(r.usuarios_atendieron) && r.usuarios_atendieron.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Atendida por:</p>
                    <div className="space-y-1">
                      {r.usuarios_atendieron.map((usuario: any, idx: number) => (
                        <p key={idx} className="text-sm text-gray-600">
                          {renderUserLink(
                            usuario.nombre_completo,
                            usuario.nombres,
                            usuario.apellidos,
                            usuario.id_usuario
                          )}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Auditoría</p>
                <p className="text-sm text-gray-600">
                  Actualizado por:{' '}
                  {renderUserLink(
                    r.nombre_completo_usuario_actualizo,
                    r.nombres_usuario_actualizo,
                    r.apellidos_usuario_actualizo,
                    r.id_usuario_actualizo
                  )}
                </p>
                <p className="text-sm text-gray-600">
                  Fecha actualización: {formatDate(r.fecha_actualizacion)}
                </p>
              </div>
            </div>
            <div className="pt-2" onClick={(e) => e.stopPropagation()}>
              <Link
                href={`/dashboard/cases/${r.id_caso}`}
                className="text-sm text-primary hover:underline"
              >
                Ver caso #{r.id_caso} →
              </Link>
            </div>
          </div>
        );
      }
      case 'usuario-eliminado': {
        const r = record as UsuarioEliminadoAuditRecord;
        // Construir nombre completo del usuario eliminado
        let nombreCompletoEliminado = r.nombre_completo_usuario_eliminado;
        if (!nombreCompletoEliminado && (r.nombres_usuario_eliminado || r.apellidos_usuario_eliminado)) {
          nombreCompletoEliminado = `${r.nombres_usuario_eliminado || ''} ${r.apellidos_usuario_eliminado || ''}`.trim();
        }
        if (!nombreCompletoEliminado) {
          nombreCompletoEliminado = 'Usuario desconocido';
        }

        // Construir nombre completo del usuario que eliminó
        let nombreCompletoEliminoPor = r.nombre_completo_eliminado_por;
        if (!nombreCompletoEliminoPor && (r.nombres_eliminado_por || r.apellidos_eliminado_por)) {
          nombreCompletoEliminoPor = `${r.nombres_eliminado_por || ''} ${r.apellidos_eliminado_por || ''}`.trim();
        }
        if (!nombreCompletoEliminoPor) {
          nombreCompletoEliminoPor = 'Usuario desconocido';
        }

        return (
          <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Información</p>
              <p className="text-sm text-gray-600">
                Usuario eliminado:{' '}
                {renderDeletedUser(
                  r.nombre_completo_usuario_eliminado,
                  r.nombres_usuario_eliminado,
                  r.apellidos_usuario_eliminado,
                  r.usuario_eliminado
                )}
              </p>
              <p className="text-sm text-gray-600">
                Eliminado por:{' '}
                {renderUserLink(
                  r.nombre_completo_eliminado_por,
                  r.nombres_eliminado_por,
                  r.apellidos_eliminado_por,
                  r.eliminado_por
                )}
              </p>
              <p className="text-sm text-gray-600">Fecha: {formatDate(r.fecha)}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Motivo</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{r.motivo || 'Sin motivo registrado'}</p>
            </div>
          </div>
        );
      }
      case 'usuario-habilitado': {
        const r = record as UsuarioHabilitadoAuditRecord;
        return (
          <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Información</p>
              <p className="text-sm text-gray-600">
                Usuario reactivado:{' '}
                {r.usuario_habilitado ? (
                  <Link
                    href={`/dashboard/users/${r.usuario_habilitado}`}
                    className="text-primary hover:underline font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {r.nombre_completo_usuario_habilitado || `${r.nombres_usuario_habilitado} ${r.apellidos_usuario_habilitado}`} (CI: {r.usuario_habilitado})
                  </Link>
                ) : (
                  r.nombre_completo_usuario_habilitado || `${r.nombres_usuario_habilitado} ${r.apellidos_usuario_habilitado}`
                )}
              </p>
              <p className="text-sm text-gray-600">
                Reactivado por:{' '}
                {renderUserLink(
                  r.nombre_completo_habilitado_por,
                  r.nombres_habilitado_por,
                  r.apellidos_habilitado_por,
                  r.habilitado_por
                )}
              </p>
              <p className="text-sm text-gray-600">Fecha: {formatDate(r.fecha)}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Motivo</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{r.motivo || 'Sin motivo registrado'}</p>
            </div>
          </div>
        );
      }
      case 'usuario-creado': {
        const r = record as UsuarioCreadoAuditRecord;
        // Construir nombre completo del usuario
        let nombreCompleto = `${r.nombres} ${r.apellidos}`.trim();
        if (!nombreCompleto) {
          nombreCompleto = 'Usuario desconocido';
        }

        return (
          <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Información del Usuario</p>
              <p className="text-sm text-gray-600">
                Nombre:{' '}
                {r.cedula ? (
                  <Link
                    href={`/dashboard/users/${r.cedula}`}
                    className="text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {nombreCompleto}
                  </Link>
                ) : (
                  nombreCompleto
                )}
              </p>
              <p className="text-sm text-gray-600">Cédula: {r.cedula}</p>
              <p className="text-sm text-gray-600">Correo: {r.correo_electronico || 'N/A'}</p>
              <p className="text-sm text-gray-600">Nombre de usuario: {r.nombre_usuario || 'N/A'}</p>
              {r.telefono_celular && (
                <p className="text-sm text-gray-600">Teléfono: {r.telefono_celular}</p>
              )}
              <p className="text-sm text-gray-600">Tipo: {r.tipo_usuario || 'N/A'}</p>
              {r.tipo_estudiante && (
                <p className="text-sm text-gray-600">Tipo estudiante: {r.tipo_estudiante}</p>
              )}
              {r.term && (
                <p className="text-sm text-gray-600">Semestre: {r.term}</p>
              )}
              {r.tipo_profesor && (
                <p className="text-sm text-gray-600">Tipo profesor: {r.tipo_profesor}</p>
              )}
              <p className="text-sm text-gray-600">Habilitado: {r.habilitado_sistema ? 'Sí' : 'No'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Auditoría</p>
              <p className="text-sm text-gray-600">Fecha creación: {formatDate(r.fecha_creacion)}</p>
              <p className="text-sm text-gray-600">
                Creado por:{' '}
                {renderUserLink(
                  r.nombre_completo_usuario_creo,
                  r.nombres_usuario_creo,
                  r.apellidos_usuario_creo,
                  r.id_usuario_creo
                )}
              </p>
            </div>

          </div>
        );
      }
      case 'estudiante-inscrito': {
        const r = record as EstudianteInscritoAuditRecord;
        // Construir nombre completo del estudiante
        let nombreCompleto = r.nombres && r.apellidos
          ? `${r.nombres} ${r.apellidos}`.trim()
          : (r.nombres || r.apellidos || 'Estudiante desconocido');

        return (
          <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Información del Estudiante</p>
              <p className="text-sm text-gray-600">
                Nombre:{' '}
                {r.cedula ? (
                  <Link
                    href={`/dashboard/users/${r.cedula}`}
                    className="text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {nombreCompleto}
                  </Link>
                ) : (
                  nombreCompleto
                )}
              </p>
              {r.cedula && <p className="text-sm text-gray-600">Cédula: {r.cedula}</p>}
              <p className="text-sm text-gray-600">Correo: {r.correo_electronico || 'N/A'}</p>
              <p className="text-sm text-gray-600">Usuario: {r.nombre_usuario || 'N/A'}</p>
              {r.telefono_celular && (
                <p className="text-sm text-gray-600">Teléfono: {r.telefono_celular}</p>
              )}
              <p className="text-sm text-gray-600">Tipo: {r.tipo_usuario || 'N/A'}</p>
              {r.tipo_estudiante && (
                <p className="text-sm text-gray-600">Tipo estudiante: {r.tipo_estudiante}</p>
              )}
              {r.term && (
                <p className="text-sm text-gray-600">Semestre: {r.term}</p>
              )}
              {r.nrc && (
                <p className="text-sm text-gray-600">NRC: {r.nrc}</p>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Auditoría</p>
              <p className="text-sm text-gray-600">Fecha inscripción: {formatOnlyDate(r.fecha_creacion)}</p>
              <p className="text-sm text-gray-600">
                Inscrito por:{' '}
                {renderUserLink(
                  r.nombre_completo_usuario_creo,
                  r.nombres_usuario_creo,
                  r.apellidos_usuario_creo,
                  r.id_usuario_creo
                )}
              </p>
            </div>
          </div>
        );
      }
      case 'usuario-actualizado-campos': {
        const r = record as UsuarioActualizadoCamposAuditRecord;
        // Construir nombre completo del usuario
        let nombreCompleto = r.nombre_completo_usuario;
        if (!nombreCompleto && (r.nombres_usuario || r.apellidos_usuario)) {
          nombreCompleto = `${r.nombres_usuario || ''} ${r.apellidos_usuario || ''}`.trim();
        }
        if (!nombreCompleto) {
          nombreCompleto = 'Usuario desconocido';
        }

        return (
          <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Cambios Realizados</p>
              <p className="text-sm text-gray-600 mb-3">
                Usuario:{' '}
                {renderUserLink(
                  r.nombre_completo_usuario,
                  r.nombres_usuario,
                  r.apellidos_usuario,
                  r.ci_usuario
                )}
              </p>

              {/* Mostrar solo los campos que cambiaron */}
              {(r.nombres_anterior !== r.nombres_nuevo) && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Nombres:{' '}
                    <span className="line-through text-red-500">
                      {r.nombres_anterior || 'N/A'}
                    </span>
                    {' → '}
                    <span className="text-green-600">
                      {r.nombres_nuevo || 'N/A'}
                    </span>
                  </p>
                </div>
              )}

              {(r.apellidos_anterior !== r.apellidos_nuevo) && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Apellidos:{' '}
                    <span className="line-through text-red-500">
                      {r.apellidos_anterior || 'N/A'}
                    </span>
                    {' → '}
                    <span className="text-green-600">
                      {r.apellidos_nuevo || 'N/A'}
                    </span>
                  </p>
                </div>
              )}

              {(r.correo_electronico_anterior !== r.correo_electronico_nuevo) && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Correo electrónico:{' '}
                    <span className="line-through text-red-500">
                      {r.correo_electronico_anterior || 'N/A'}
                    </span>
                    {' → '}
                    <span className="text-green-600">
                      {r.correo_electronico_nuevo || 'N/A'}
                    </span>
                  </p>
                </div>
              )}

              {(r.nombre_usuario_anterior !== r.nombre_usuario_nuevo) && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Nombre de usuario:{' '}
                    <span className="line-through text-red-500">
                      {r.nombre_usuario_anterior || 'N/A'}
                    </span>
                    {' → '}
                    <span className="text-green-600">
                      {r.nombre_usuario_nuevo || 'N/A'}
                    </span>
                  </p>
                </div>
              )}

              {!areValuesEffectivelyEqual(r.telefono_celular_anterior, r.telefono_celular_nuevo) && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Teléfono celular:{' '}
                    <span className="line-through text-red-500">
                      {r.telefono_celular_anterior || 'N/A'}
                    </span>
                    {' → '}
                    <span className="text-green-600">
                      {r.telefono_celular_nuevo || 'N/A'}
                    </span>
                  </p>
                </div>
              )}

              {(r.habilitado_sistema_anterior !== r.habilitado_sistema_nuevo) && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Habilitado en sistema:{' '}
                    <span className="line-through text-red-500">
                      {r.habilitado_sistema_anterior ? 'Sí' : 'No'}
                    </span>
                    {' → '}
                    <span className="text-green-600">
                      {r.habilitado_sistema_nuevo ? 'Sí' : 'No'}
                    </span>
                  </p>
                </div>
              )}

              {(r.tipo_usuario_anterior !== r.tipo_usuario_nuevo) && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Tipo de usuario:{' '}
                    <span className="line-through text-red-500">
                      {r.tipo_usuario_anterior || 'N/A'}
                    </span>
                    {' → '}
                    <span className="text-green-600">
                      {r.tipo_usuario_nuevo || 'N/A'}
                    </span>
                  </p>
                </div>
              )}

              {/* Solo mostrar cambios de tipo_estudiante si el tipo_usuario NO cambió */}
              {(r.tipo_usuario_anterior === r.tipo_usuario_nuevo && r.tipo_estudiante_anterior !== r.tipo_estudiante_nuevo) && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Tipo de estudiante:{' '}
                    <span className="line-through text-red-500">
                      {r.tipo_estudiante_anterior || 'N/A'}
                    </span>
                    {' → '}
                    <span className="text-green-600">
                      {r.tipo_estudiante_nuevo || 'N/A'}
                    </span>
                  </p>
                </div>
              )}

              {/* Solo mostrar cambios de tipo_profesor si el tipo_usuario NO cambió */}
              {(r.tipo_usuario_anterior === r.tipo_usuario_nuevo && r.tipo_profesor_anterior !== r.tipo_profesor_nuevo) && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Tipo de profesor:{' '}
                    <span className="line-through text-red-500">
                      {r.tipo_profesor_anterior || 'N/A'}
                    </span>
                    {' → '}
                    <span className="text-green-600">
                      {r.tipo_profesor_nuevo || 'N/A'}
                    </span>
                  </p>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Auditoría</p>
              <p className="text-sm text-gray-600">
                Actualizado por:{' '}
                {renderUserLink(
                  r.nombre_completo_usuario_actualizo,
                  r.nombres_usuario_actualizo,
                  r.apellidos_usuario_actualizo,
                  r.id_usuario_actualizo
                )}
              </p>
              <p className="text-sm text-gray-600">
                Fecha actualización: {formatDate(r.fecha_actualizacion)}
              </p>
            </div>
          </div>
        );
      }

      // Catálogos - casos genéricos para eliminados
      case 'estado-eliminado':
      case 'materia-eliminada':
      case 'nivel-educativo-eliminado':
      case 'nucleo-eliminado':
      case 'condicion-trabajo-eliminada':
      case 'condicion-actividad-eliminada':
      case 'tipo-caracteristica-eliminado':
      case 'semestre-eliminado':
      case 'municipio-eliminado':
      case 'parroquia-eliminada':
      case 'categoria-eliminada':
      case 'subcategoria-eliminada':
      case 'ambito-legal-eliminado':
      case 'caracteristica-eliminada': {
        const r = record as any;

        // Determinar el nombre según el tipo específico de auditoría
        let nameField: string;
        if (type === 'categoria-eliminada') {
          nameField = r.nombre_categoria || 'N/A';
        } else if (type === 'subcategoria-eliminada') {
          nameField = r.nombre_subcategoria || 'N/A';
        } else if (type === 'ambito-legal-eliminado') {
          nameField = r.nombre_ambito_legal || 'N/A';
        } else if (type === 'estado-eliminado') {
          nameField = r.nombre_estado || 'N/A';
        } else if (type === 'materia-eliminada') {
          nameField = r.nombre_materia || 'N/A';
        } else if (type === 'nucleo-eliminado') {
          nameField = r.nombre_nucleo || 'N/A';
        } else if (type === 'condicion-trabajo-eliminada') {
          nameField = r.nombre_trabajo || 'N/A';
        } else if (type === 'condicion-actividad-eliminada') {
          nameField = r.nombre_actividad || 'N/A';
        } else if (type === 'tipo-caracteristica-eliminado') {
          nameField = r.nombre_tipo_caracteristica || 'N/A';
        } else if (type === 'municipio-eliminado') {
          nameField = r.nombre_municipio || 'N/A';
        } else if (type === 'parroquia-eliminada') {
          nameField = r.nombre_parroquia || 'N/A';
        } else if (type === 'nivel-educativo-eliminado' || type === 'caracteristica-eliminada') {
          // Estos usan descripcion en lugar de nombre
          nameField = r.descripcion || 'N/A';
        } else if (type === 'semestre-eliminado') {
          nameField = r.term || 'N/A';
        } else {
          // Fallback para otros casos
          nameField = r.descripcion || 'N/A';
        }

        // Para características, mostrar solo num_caracteristica (sin guión)
        const caracteristicaId = r.num_caracteristica != null ? r.num_caracteristica : null;

        const idField = r.id_estado || r.id_materia || r.id_nivel_educativo || r.id_nucleo ||
          r.id_trabajo || r.id_actividad || r.id_tipo || r.term ||
          (r.id_estado != null && r.num_municipio != null ? `${r.id_estado}-${r.num_municipio}` : null) ||
          (r.id_estado != null && r.num_municipio != null && r.num_parroquia != null ? `${r.id_estado}-${r.num_municipio}-${r.num_parroquia}` : null) ||
          (r.id_materia != null && r.num_categoria != null ? `${r.id_materia}-${r.num_categoria}` : null) ||
          (r.id_materia != null && r.num_categoria != null && r.num_subcategoria != null ? `${r.id_materia}-${r.num_categoria}-${r.num_subcategoria}` : null) ||
          (r.id_materia != null && r.num_categoria != null && r.num_subcategoria != null && r.num_ambito_legal != null ? `${r.id_materia}-${r.num_categoria}-${r.num_subcategoria}-${r.num_ambito_legal}` : null) ||
          caracteristicaId || 'N/A';

        // Obtener información de la entidad fuerte
        const entidadFuerte =
          type === 'categoria-eliminada' ? r.nombre_materia :
            type === 'subcategoria-eliminada' ? r.nombre_categoria :
              type === 'ambito-legal-eliminado' ? r.nombre_subcategoria :
                type === 'caracteristica-eliminada' ? r.nombre_tipo_caracteristica :
                  type === 'municipio-eliminado' ? r.nombre_estado :
                    type === 'parroquia-eliminada' ? r.nombre_municipio :
                      null;

        // Para parroquias, también mostrar el estado
        const estadoParroquiaEliminada = type === 'parroquia-eliminada' ? r.nombre_estado : null;

        return (
          <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Información</p>
                <p className="text-sm text-gray-600">Nombre: {nameField}</p>
                {entidadFuerte && (
                  <p className="text-sm text-gray-600">
                    {type === 'categoria-eliminada' ? 'Materia' :
                      type === 'subcategoria-eliminada' ? 'Categoría' :
                        type === 'ambito-legal-eliminado' ? 'Subcategoría' :
                          type === 'municipio-eliminado' ? 'Estado' :
                            type === 'parroquia-eliminada' ? 'Municipio' :
                              'Tipo'}: {entidadFuerte}
                  </p>
                )}
                {estadoParroquiaEliminada && (
                  <p className="text-sm text-gray-600">Estado: {estadoParroquiaEliminada}</p>
                )}
                {/* Para semestres, el term es el ID, así que no mostramos ID por separado */}
                {type !== 'semestre-eliminado' && (
                  <p className="text-sm text-gray-600">ID: {idField}</p>
                )}
                {/* Para semestres, mostrar todos los atributos */}
                {type === 'semestre-eliminado' && (
                  <>
                    {r.fecha_inicio && (
                      <p className="text-sm text-gray-600">Fecha inicio: {formatOnlyDate(r.fecha_inicio)}</p>
                    )}
                    {r.fecha_fin && (
                      <p className="text-sm text-gray-600">Fecha fin: {formatOnlyDate(r.fecha_fin)}</p>
                    )}
                  </>
                )}
                {r.habilitado !== null && (
                  <p className="text-sm text-gray-600">Habilitado: {r.habilitado ? 'Sí' : 'No'}</p>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Auditoría</p>
                <p className="text-sm text-gray-600">
                  Eliminado por:{' '}
                  {renderUserLink(
                    r.nombre_completo_usuario_elimino,
                    r.nombres_usuario_elimino,
                    r.apellidos_usuario_elimino,
                    r.id_usuario_elimino
                  )}
                </p>
                <p className="text-sm text-gray-600">Fecha eliminación: {formatDate(r.fecha_eliminacion)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Motivo de eliminación</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{r.motivo || 'Sin motivo registrado'}</p>
            </div>
          </div>
        );
      }
      // Inserciones
      case 'estado-insertado':
      case 'materia-insertada':
      case 'nivel-educativo-insertado':
      case 'nucleo-insertado':
      case 'condicion-trabajo-insertada':
      case 'condicion-actividad-insertada':
      case 'tipo-caracteristica-insertado':
      case 'semestre-insertado':
      case 'municipio-insertado':
      case 'parroquia-insertada':
      case 'categoria-insertada':
      case 'subcategoria-insertada':
      case 'ambito-legal-insertado':
      case 'caracteristica-insertada': {
        const r = record as any;

        // Determinar el nombre según el tipo específico de auditoría
        let nameField: string;
        if (type === 'categoria-insertada') {
          nameField = r.nombre_categoria || 'N/A';
        } else if (type === 'subcategoria-insertada') {
          nameField = r.nombre_subcategoria || 'N/A';
        } else if (type === 'ambito-legal-insertado') {
          nameField = r.nombre_ambito_legal || 'N/A';
        } else if (type === 'estado-insertado') {
          nameField = r.nombre_estado || 'N/A';
        } else if (type === 'materia-insertada') {
          nameField = r.nombre_materia || 'N/A';
        } else if (type === 'nucleo-insertado') {
          nameField = r.nombre_nucleo || 'N/A';
        } else if (type === 'condicion-trabajo-insertada') {
          nameField = r.nombre_trabajo || 'N/A';
        } else if (type === 'condicion-actividad-insertada') {
          nameField = r.nombre_actividad || 'N/A';
        } else if (type === 'tipo-caracteristica-insertado') {
          nameField = r.nombre_tipo_caracteristica || 'N/A';
        } else if (type === 'municipio-insertado') {
          nameField = r.nombre_municipio || 'N/A';
        } else if (type === 'parroquia-insertada') {
          nameField = r.nombre_parroquia || 'N/A';
        } else if (type === 'nivel-educativo-insertado' || type === 'caracteristica-insertada') {
          // Estos usan descripcion en lugar de nombre
          nameField = r.descripcion || 'N/A';
        } else if (type === 'semestre-insertado') {
          nameField = r.term || 'N/A';
        } else {
          // Fallback para otros casos
          nameField = r.descripcion || 'N/A';
        }

        // Para características, mostrar solo num_caracteristica (sin guión)
        const caracteristicaId = r.num_caracteristica != null ? r.num_caracteristica : null;

        const idField = r.id_estado || r.id_materia || r.id_nivel_educativo || r.id_nucleo ||
          r.id_trabajo || r.id_actividad || r.id_tipo || r.term ||
          (r.id_estado != null && r.num_municipio != null ? `${r.id_estado}-${r.num_municipio}` : null) ||
          (r.id_estado != null && r.num_municipio != null && r.num_parroquia != null ? `${r.id_estado}-${r.num_municipio}-${r.num_parroquia}` : null) ||
          (r.id_materia != null && r.num_categoria != null ? `${r.id_materia}-${r.num_categoria}` : null) ||
          (r.id_materia != null && r.num_categoria != null && r.num_subcategoria != null ? `${r.id_materia}-${r.num_categoria}-${r.num_subcategoria}` : null) ||
          (r.id_materia != null && r.num_categoria != null && r.num_subcategoria != null && r.num_ambito_legal != null ? `${r.id_materia}-${r.num_categoria}-${r.num_subcategoria}-${r.num_ambito_legal}` : null) ||
          caracteristicaId || 'N/A';

        // Obtener información de la entidad fuerte
        const entidadFuerte =
          type === 'categoria-insertada' ? r.nombre_materia :
            type === 'subcategoria-insertada' ? r.nombre_categoria :
              type === 'ambito-legal-insertado' ? r.nombre_subcategoria :
                type === 'caracteristica-insertada' ? r.nombre_tipo_caracteristica :
                  type === 'municipio-insertado' ? r.nombre_estado :
                    type === 'parroquia-insertada' ? r.nombre_municipio :
                      null;

        // Para parroquias, también mostrar el estado
        const estadoParroquiaInsertada = type === 'parroquia-insertada' ? r.nombre_estado : null;

        return (
          <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Información</p>
                <p className="text-sm text-gray-600">Nombre: {nameField}</p>
                {entidadFuerte && (
                  <p className="text-sm text-gray-600">
                    {type === 'categoria-insertada' ? 'Materia' :
                      type === 'subcategoria-insertada' ? 'Categoría' :
                        type === 'ambito-legal-insertado' ? 'Subcategoría' :
                          type === 'municipio-insertado' ? 'Estado' :
                            type === 'parroquia-insertada' ? 'Municipio' :
                              'Tipo'}: {entidadFuerte}
                  </p>
                )}
                {estadoParroquiaInsertada && (
                  <p className="text-sm text-gray-600">Estado: {estadoParroquiaInsertada}</p>
                )}
                {/* Para semestres, el term es el ID, así que no mostramos ID por separado */}
                {type !== 'semestre-insertado' && (
                  <p className="text-sm text-gray-600">ID: {idField}</p>
                )}
                {/* Para semestres, mostrar todos los atributos */}
                {type === 'semestre-insertado' && (
                  <>
                    {r.fecha_inicio && (
                      <p className="text-sm text-gray-600">Fecha inicio: {formatOnlyDate(r.fecha_inicio)}</p>
                    )}
                    {r.fecha_fin && (
                      <p className="text-sm text-gray-600">Fecha fin: {formatOnlyDate(r.fecha_fin)}</p>
                    )}
                  </>
                )}
                {r.habilitado !== null && (
                  <p className="text-sm text-gray-600">Habilitado: {r.habilitado ? 'Sí' : 'No'}</p>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Auditoría</p>
                <p className="text-sm text-gray-600">
                  Creado por:{' '}
                  {renderUserLink(
                    r.nombre_completo_usuario_creo,
                    r.nombres_usuario_creo,
                    r.apellidos_usuario_creo,
                    r.id_usuario_creo
                  )}
                </p>
                <p className="text-sm text-gray-600">Fecha creación: {formatDate(r.fecha_creacion)}</p>
              </div>
            </div>
          </div>
        );
      }
      // Solicitantes - detalles expandidos
      case 'solicitante-eliminado': {
        const r = record as SolicitanteEliminadoAuditRecord;
        let nombreCompletoEliminado = r.nombre_completo_solicitante_eliminado;
        if (!nombreCompletoEliminado && (r.nombres_solicitante_eliminado || r.apellidos_solicitante_eliminado)) {
          nombreCompletoEliminado = `${r.nombres_solicitante_eliminado || ''} ${r.apellidos_solicitante_eliminado || ''}`.trim();
        }
        if (!nombreCompletoEliminado) {
          nombreCompletoEliminado = 'Solicitante desconocido';
        }

        // Agrupar características por tipo
        const caracteristicasAgrupadas: Record<string, string[]> = {};
        if (r.caracteristicas_vivienda && Array.isArray(r.caracteristicas_vivienda)) {
          r.caracteristicas_vivienda.forEach((c) => {
            if (!caracteristicasAgrupadas[c.tipo]) {
              caracteristicasAgrupadas[c.tipo] = [];
            }
            caracteristicasAgrupadas[c.tipo].push(c.caracteristica);
          });
        }

        return (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {/* Grid uniforme de 4 columnas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              {/* Columna 1: Datos Personales */}
              <div className="space-y-1">
                <p className="font-semibold text-gray-700">Datos Personales</p>
                <p className="text-gray-600">Nombre: {nombreCompletoEliminado}</p>
                <p className="text-gray-600">Cédula: {r.solicitante_eliminado}</p>
                {r.fecha_nacimiento && <p className="text-gray-600">Nacimiento: {formatOnlyDate(r.fecha_nacimiento)}</p>}
                {r.sexo && <p className="text-gray-600">Sexo: {r.sexo === 'M' ? 'Masculino' : 'Femenino'}</p>}
                {r.nacionalidad && <p className="text-gray-600">Nacionalidad: {r.nacionalidad === 'V' ? 'Venezolano' : 'Extranjero'}</p>}
                {r.estado_civil && <p className="text-gray-600">Estado Civil: {r.estado_civil}</p>}
                {r.concubinato !== null && <p className="text-gray-600">Concubinato: {r.concubinato ? 'Sí' : 'No'}</p>}
              </div>

              {/* Columna 2: Contacto + Académico/Laboral */}
              <div className="space-y-1">
                <p className="font-semibold text-gray-700">Contacto y Ubicación</p>
                {r.correo_electronico && <p className="text-gray-600">Correo: {r.correo_electronico}</p>}
                {r.telefono_celular && <p className="text-gray-600">Celular: {r.telefono_celular}</p>}
                {r.telefono_local && <p className="text-gray-600">Tel. Local: {r.telefono_local}</p>}
                {r.estado && (
                  <p className="text-gray-600">
                    Ubicación: {r.estado}{r.municipio && `, ${r.municipio}`}{r.parroquia && `, ${r.parroquia}`}
                  </p>
                )}
                {/* Académico/Laboral dentro de la misma columna */}
                {(r.nivel_educativo || r.condicion_trabajo) && (
                  <>
                    <p className="font-semibold text-gray-700 pt-2">Académico/Laboral</p>
                    {r.nivel_educativo && <p className="text-gray-600">Nivel Educativo: {r.nivel_educativo}</p>}
                    {r.condicion_trabajo && <p className="text-gray-600">Condición: {r.condicion_trabajo}</p>}
                  </>
                )}
              </div>

              {/* Columna 3: Vivienda */}
              <div className="space-y-1">
                <p className="font-semibold text-gray-700">Vivienda</p>
                {r.cant_habitaciones !== null && <p className="text-gray-600">Habitaciones: {r.cant_habitaciones}</p>}
                {r.cant_banos !== null && <p className="text-gray-600">Baños: {r.cant_banos}</p>}
                {Object.entries(caracteristicasAgrupadas).map(([tipo, caracteristicas]) => (
                  <p key={tipo} className="text-gray-600">
                    <span className="font-medium">{tipo}:</span> {caracteristicas.join(', ')}
                  </p>
                ))}
              </div>

              {/* Columna 4: Familia y Hogar */}
              <div className="space-y-1">
                <p className="font-semibold text-gray-700">Familia y Hogar</p>
                {r.cant_personas !== null && <p className="text-gray-600">Personas: {r.cant_personas}</p>}
                {r.cant_trabajadores !== null && <p className="text-gray-600">Trabajadores: {r.cant_trabajadores}</p>}
                {r.cant_no_trabajadores !== null && <p className="text-gray-600">No trabajadores: {r.cant_no_trabajadores}</p>}
                {r.cant_ninos !== null && <p className="text-gray-600">Niños: {r.cant_ninos}</p>}
                {r.cant_ninos_estudiando !== null && <p className="text-gray-600">Niños estudiando: {r.cant_ninos_estudiando}</p>}
                {r.jefe_hogar !== null && <p className="text-gray-600">Jefe del hogar: {r.jefe_hogar ? 'Sí' : 'No'}</p>}
                {r.ingresos_mensuales !== null && (
                  <p className="text-gray-600">Ingresos: Bs. {Number(r.ingresos_mensuales).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</p>
                )}
                {r.nivel_educativo_jefe && <p className="text-gray-600">Nivel edu. jefe: {r.nivel_educativo_jefe}</p>}
              </div>
            </div>

            {/* Motivo de eliminación */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-1">Motivo de eliminación</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{r.motivo || 'Sin motivo registrado'}</p>
            </div>
          </div>
        );
      }
      case 'solicitante-creado': {
        const r = record as SolicitanteCreadoAuditRecord;
        const nombreCompleto = r.nombres && r.apellidos
          ? `${r.nombres} ${r.apellidos}`.trim()
          : (r.nombres || r.apellidos || 'Solicitante desconocido');
        return (
          <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Datos Personales</p>
                <p className="text-sm text-gray-600">Nombre: {nombreCompleto}</p>
                <p className="text-sm text-gray-600">Cédula: {r.cedula || 'N/A'}</p>
                {r.fecha_nacimiento && (
                  <p className="text-sm text-gray-600">Fecha Nacimiento: {formatOnlyDate(r.fecha_nacimiento)}</p>
                )}
                {r.sexo && <p className="text-sm text-gray-600">Sexo: {r.sexo}</p>}
                {r.estado_civil && <p className="text-sm text-gray-600">Estado Civil: {r.estado_civil}</p>}
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Contacto y Ubicación</p>
                {r.correo_electronico && (
                  <p className="text-sm text-gray-600">Correo: {r.correo_electronico}</p>
                )}
                {r.telefono_celular && (
                  <p className="text-sm text-gray-600">Teléfono: {r.telefono_celular}</p>
                )}
                {(r.nombre_estado || r.telefono_local) && (
                  <div className="mt-1">
                    {r.telefono_local && <p className="text-sm text-gray-600">Tlf. Local: {r.telefono_local}</p>}
                    {r.nombre_estado && (
                      <div className="text-sm text-gray-600 mt-1">
                        <p className="font-medium text-xs text-gray-500 uppercase">Ubicación</p>
                        <p>{r.nombre_estado}
                          {r.nombre_municipio && `, ${r.nombre_municipio}`}
                          {r.nombre_parroquia && `, ${r.nombre_parroquia}`}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Información Adicional</p>
                {r.nivel_educativo && <p className="text-sm text-gray-600">Nivel Educativo: {r.nivel_educativo}</p>}
                {r.condicion_trabajo && <p className="text-sm text-gray-600">Condición Trabajo: {r.condicion_trabajo}</p>}
                {r.condicion_actividad && <p className="text-sm text-gray-600">Actividad: {r.condicion_actividad}</p>}
                {r.nacionalidad && <p className="text-sm text-gray-600">Nacionalidad: {r.nacionalidad.toLowerCase() === 'v' ? 'Venezolano' : 'Extranjero'}</p>}
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Auditoría</p>
                <p className="text-sm text-gray-600">Fecha creación: {formatDate(r.fecha_creacion)}</p>
                <p className="text-sm text-gray-600">
                  Creado por:{' '}
                  {renderUserLink(
                    r.nombre_completo_usuario_creo,
                    r.nombres_usuario_creo,
                    r.apellidos_usuario_creo,
                    r.id_usuario_creo
                  )}
                </p>
              </div>
            </div>
          </div>
        );
      }
      case 'solicitante-actualizado': {
        const r = record as SolicitanteActualizadoAuditRecord;
        const nombreCompleto = r.nombres_solicitante && r.apellidos_solicitante
          ? `${r.nombres_solicitante} ${r.apellidos_solicitante}`.trim()
          : (r.nombres_solicitante || r.apellidos_solicitante || 'Solicitante desconocido');

        // Helper para formatear nacionalidad
        const formatNacionalidad = (val: string | null) => {
          if (!val) return 'N/A';
          return val.toLowerCase() === 'v' ? 'Venezolano' : 'Extranjero';
        };

        // Helper para comparar solo la parte de fecha (sin hora)
        const areDatesEqual = (date1: string | null, date2: string | null): boolean => {
          if (date1 === date2) return true;
          if (!date1 || !date2) return false;

          try {
            // Convertir a string y extraer solo la parte de fecha (YYYY-MM-DD)
            const str1 = String(date1);
            const str2 = String(date2);
            const d1 = str1.split('T')[0];
            const d2 = str2.split('T')[0];
            return d1 === d2;
          } catch {
            return false;
          }
        };

        return (
          <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Cambios Realizados</p>

              {/* Nombres */}
              {(r.nombres_anterior !== r.nombres_nuevo) && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Nombres:{' '}
                    <span className="line-through text-red-500">{r.nombres_anterior || 'N/A'}</span>
                    {' → '}
                    <span className="text-green-600">{r.nombres_nuevo || 'N/A'}</span>
                  </p>
                </div>
              )}

              {/* Apellidos */}
              {(r.apellidos_anterior !== r.apellidos_nuevo) && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Apellidos:{' '}
                    <span className="line-through text-red-500">{r.apellidos_anterior || 'N/A'}</span>
                    {' → '}
                    <span className="text-green-600">{r.apellidos_nuevo || 'N/A'}</span>
                  </p>
                </div>
              )}

              {/* Fecha de Nacimiento */}
              {!areDatesEqual(r.fecha_nacimiento_anterior, r.fecha_nacimiento_nuevo) && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Fecha Nacimiento:{' '}
                    <span className="line-through text-red-500">
                      {r.fecha_nacimiento_anterior ? formatOnlyDate(r.fecha_nacimiento_anterior) : 'N/A'}
                    </span>
                    {' → '}
                    <span className="text-green-600">
                      {r.fecha_nacimiento_nuevo ? formatOnlyDate(r.fecha_nacimiento_nuevo) : 'N/A'}
                    </span>
                  </p>
                </div>
              )}

              {/* Sexo */}
              {(r.sexo_anterior !== r.sexo_nuevo) && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Sexo:{' '}
                    <span className="line-through text-red-500">{r.sexo_anterior || 'N/A'}</span>
                    {' → '}
                    <span className="text-green-600">{r.sexo_nuevo || 'N/A'}</span>
                  </p>
                </div>
              )}

              {/* Estado Civil */}
              {(r.estado_civil_anterior !== r.estado_civil_nuevo) && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Estado Civil:{' '}
                    <span className="line-through text-red-500">{r.estado_civil_anterior || 'N/A'}</span>
                    {' → '}
                    <span className="text-green-600">{r.estado_civil_nuevo || 'N/A'}</span>
                  </p>
                </div>
              )}

              {/* Nacionalidad */}
              {(r.nacionalidad_anterior !== r.nacionalidad_nuevo) && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Nacionalidad:{' '}
                    <span className="line-through text-red-500">{formatNacionalidad(r.nacionalidad_anterior)}</span>
                    {' → '}
                    <span className="text-green-600">{formatNacionalidad(r.nacionalidad_nuevo)}</span>
                  </p>
                </div>
              )}

              {/* Teléfono Local */}
              {(r.telefono_local_anterior !== r.telefono_local_nuevo) && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Teléfono Local:{' '}
                    <span className="line-through text-red-500">{r.telefono_local_anterior || 'N/A'}</span>
                    {' → '}
                    <span className="text-green-600">{r.telefono_local_nuevo || 'N/A'}</span>
                  </p>
                </div>
              )}

              {/* Teléfono Celular */}
              {(r.telefono_celular_anterior !== r.telefono_celular_nuevo) && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Teléfono Celular:{' '}
                    <span className="line-through text-red-500">{r.telefono_celular_anterior || 'N/A'}</span>
                    {' → '}
                    <span className="text-green-600">{r.telefono_celular_nuevo || 'N/A'}</span>
                  </p>
                </div>
              )}

              {/* Correo Electrónico */}
              {(r.correo_electronico_anterior !== r.correo_electronico_nuevo) && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Correo:{' '}
                    <span className="line-through text-red-500">{r.correo_electronico_anterior || 'N/A'}</span>
                    {' → '}
                    <span className="text-green-600">{r.correo_electronico_nuevo || 'N/A'}</span>
                  </p>
                </div>
              )}

              {/* Nivel Educativo */}
              {(r.id_nivel_educativo_anterior !== r.id_nivel_educativo_nuevo) && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Nivel Educativo:{' '}
                    <span className="line-through text-red-500">{r.nivel_educativo_anterior || 'N/A'}</span>
                    {' → '}
                    <span className="text-green-600">{r.nivel_educativo_nuevo || 'N/A'}</span>
                  </p>
                </div>
              )}

              {/* Condición de Trabajo */}
              {(r.id_trabajo_anterior !== r.id_trabajo_nuevo) && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Condición Trabajo:{' '}
                    <span className="line-through text-red-500">{r.condicion_trabajo_anterior || 'N/A'}</span>
                    {' → '}
                    <span className="text-green-600">{r.condicion_trabajo_nuevo || 'N/A'}</span>
                  </p>
                </div>
              )}

              {/* Condición de Actividad */}
              {(r.id_actividad_anterior !== r.id_actividad_nuevo) && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Actividad:{' '}
                    <span className="line-through text-red-500">{r.condicion_actividad_anterior || 'N/A'}</span>
                    {' → '}
                    <span className="text-green-600">{r.condicion_actividad_nuevo || 'N/A'}</span>
                  </p>
                </div>
              )}

              {/* Estado */}
              {(r.id_estado_anterior !== r.id_estado_nuevo) && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Estado:{' '}
                    <span className="line-through text-red-500">{r.estado_anterior || 'N/A'}</span>
                    {' → '}
                    <span className="text-green-600">{r.estado_nuevo || 'N/A'}</span>
                  </p>
                </div>
              )}

              {/* Municipio */}
              {(r.num_municipio_anterior !== r.num_municipio_nuevo || r.id_estado_anterior !== r.id_estado_nuevo) && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Municipio:{' '}
                    <span className="line-through text-red-500">{r.municipio_anterior || 'N/A'}</span>
                    {' → '}
                    <span className="text-green-600">{r.municipio_nuevo || 'N/A'}</span>
                  </p>
                </div>
              )}

              {/* Parroquia */}
              {(r.num_parroquia_anterior !== r.num_parroquia_nuevo || r.num_municipio_anterior !== r.num_municipio_nuevo || r.id_estado_anterior !== r.id_estado_nuevo) && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Parroquia:{' '}
                    <span className="line-through text-red-500">{r.parroquia_anterior || 'N/A'}</span>
                    {' → '}
                    <span className="text-green-600">{r.parroquia_nuevo || 'N/A'}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Jefe del Hogar */}
            {(Boolean(r.jefe_hogar_anterior) !== Boolean(r.jefe_hogar_nuevo)) && (
              <div className="mb-2">
                <p className="text-sm text-gray-600">
                  Jefe del Hogar:{' '}
                  <span className="line-through text-red-500">{r.jefe_hogar_anterior ? 'Sí' : 'No'}</span>
                  {' → '}
                  <span className="text-green-600">{r.jefe_hogar_nuevo ? 'Sí' : 'No'}</span>
                </p>
              </div>
            )}

            {/* Nivel Educativo del Jefe */}
            {((r.nivel_educativo_jefe_anterior ?? '') !== (r.nivel_educativo_jefe_nuevo ?? '')) && (
              <div className="mb-2">
                <p className="text-sm text-gray-600">
                  Nivel Educativo del Jefe:{' '}
                  <span className="line-through text-red-500">{r.nivel_educativo_jefe_anterior || 'N/A'}</span>
                  {' → '}
                  <span className="text-green-600">{r.nivel_educativo_jefe_nuevo || 'N/A'}</span>
                </p>
              </div>
            )}

            {/* Ingresos Mensuales */}
            {(String(r.ingresos_mensuales_anterior ?? '') !== String(r.ingresos_mensuales_nuevo ?? '')) && (
              <div className="mb-2">
                <p className="text-sm text-gray-600">
                  Ingresos Mensuales:{' '}
                  <span className="line-through text-red-500">
                    {r.ingresos_mensuales_anterior != null ? `Bs. ${Number(r.ingresos_mensuales_anterior).toLocaleString('es-VE', { minimumFractionDigits: 2 })}` : 'N/A'}
                  </span>
                  {' → '}
                  <span className="text-green-600">
                    {r.ingresos_mensuales_nuevo != null ? `Bs. ${Number(r.ingresos_mensuales_nuevo).toLocaleString('es-VE', { minimumFractionDigits: 2 })}` : 'N/A'}
                  </span>
                </p>
              </div>
            )}

            {/* Habitaciones */}
            {(r.cant_habitaciones_anterior !== r.cant_habitaciones_nuevo) && (r.cant_habitaciones_anterior != null || r.cant_habitaciones_nuevo != null) && (
              <div className="mb-2">
                <p className="text-sm text-gray-600">
                  Habitaciones:{' '}
                  <span className="line-through text-red-500">{r.cant_habitaciones_anterior ?? 'N/A'}</span>
                  {' → '}
                  <span className="text-green-600">{r.cant_habitaciones_nuevo ?? 'N/A'}</span>
                </p>
              </div>
            )}

            {/* Baños */}
            {(r.cant_banos_anterior !== r.cant_banos_nuevo) && (r.cant_banos_anterior != null || r.cant_banos_nuevo != null) && (
              <div className="mb-2">
                <p className="text-sm text-gray-600">
                  Baños:{' '}
                  <span className="line-through text-red-500">{r.cant_banos_anterior ?? 'N/A'}</span>
                  {' → '}
                  <span className="text-green-600">{r.cant_banos_nuevo ?? 'N/A'}</span>
                </p>
              </div>
            )}

            {/* Personas en el hogar */}
            {(r.cant_personas_anterior !== r.cant_personas_nuevo) && (r.cant_personas_anterior != null || r.cant_personas_nuevo != null) && (
              <div className="mb-2">
                <p className="text-sm text-gray-600">
                  Personas en el hogar:{' '}
                  <span className="line-through text-red-500">{r.cant_personas_anterior ?? 'N/A'}</span>
                  {' → '}
                  <span className="text-green-600">{r.cant_personas_nuevo ?? 'N/A'}</span>
                </p>
              </div>
            )}

            {/* Trabajadores */}
            {(r.cant_trabajadores_anterior !== r.cant_trabajadores_nuevo) && (r.cant_trabajadores_anterior != null || r.cant_trabajadores_nuevo != null) && (
              <div className="mb-2">
                <p className="text-sm text-gray-600">
                  Trabajadores:{' '}
                  <span className="line-through text-red-500">{r.cant_trabajadores_anterior ?? 'N/A'}</span>
                  {' → '}
                  <span className="text-green-600">{r.cant_trabajadores_nuevo ?? 'N/A'}</span>
                </p>
              </div>
            )}

            {/* No trabajadores */}
            {(r.cant_no_trabajadores_anterior !== r.cant_no_trabajadores_nuevo) && (r.cant_no_trabajadores_anterior != null || r.cant_no_trabajadores_nuevo != null) && (
              <div className="mb-2">
                <p className="text-sm text-gray-600">
                  No trabajadores:{' '}
                  <span className="line-through text-red-500">{r.cant_no_trabajadores_anterior ?? 'N/A'}</span>
                  {' → '}
                  <span className="text-green-600">{r.cant_no_trabajadores_nuevo ?? 'N/A'}</span>
                </p>
              </div>
            )}

            {/* Niños */}
            {(r.cant_ninos_anterior !== r.cant_ninos_nuevo) && (r.cant_ninos_anterior != null || r.cant_ninos_nuevo != null) && (
              <div className="mb-2">
                <p className="text-sm text-gray-600">
                  Niños:{' '}
                  <span className="line-through text-red-500">{r.cant_ninos_anterior ?? 'N/A'}</span>
                  {' → '}
                  <span className="text-green-600">{r.cant_ninos_nuevo ?? 'N/A'}</span>
                </p>
              </div>
            )}

            {/* Niños estudiando */}
            {(r.cant_ninos_estudiando_anterior !== r.cant_ninos_estudiando_nuevo) && (r.cant_ninos_estudiando_anterior != null || r.cant_ninos_estudiando_nuevo != null) && (
              <div className="mb-2">
                <p className="text-sm text-gray-600">
                  Niños estudiando:{' '}
                  <span className="line-through text-red-500">{r.cant_ninos_estudiando_anterior ?? 'N/A'}</span>
                  {' → '}
                  <span className="text-green-600">{r.cant_ninos_estudiando_nuevo ?? 'N/A'}</span>
                </p>
              </div>
            )}

            {/* Artefactos Domésticos */}
            {(r.artefactos_eliminados?.length > 0 || r.artefactos_agregados?.length > 0) && (
              <div className="mb-2">
                <p className="text-sm font-semibold text-gray-700 mb-1">Artefactos Domésticos:</p>
                {r.artefactos_eliminados?.length > 0 && (
                  <p className="text-sm text-gray-600 ml-2">
                    <span className="text-red-500 font-medium">Eliminados:</span>{' '}
                    {r.artefactos_eliminados.join(', ')}
                  </p>
                )}
                {r.artefactos_agregados?.length > 0 && (
                  <p className="text-sm text-gray-600 ml-2">
                    <span className="text-green-600 font-medium">Agregados:</span>{' '}
                    {r.artefactos_agregados.join(', ')}
                  </p>
                )}
                {r.artefactos_sin_cambio?.length > 0 && (
                  <p className="text-sm text-gray-500 ml-2 text-xs">
                    Sin cambio: {r.artefactos_sin_cambio.join(', ')}
                  </p>
                )}
              </div>
            )}

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Auditoría</p>
              <p className="text-sm text-gray-600">
                Actualizado por:{' '}
                {renderUserLink(
                  r.nombre_completo_usuario_actualizo,
                  r.nombres_usuario_actualizo,
                  r.apellidos_usuario_actualizo,
                  r.id_usuario_actualizo
                )}
              </p>
              <p className="text-sm text-gray-600">Fecha actualización: {formatDate(r.fecha_actualizacion)}</p>
            </div>
          </div>
        );
      }
      case 'caso-eliminado': {
        const r = record as CasoEliminadoAuditRecord;
        return (
          <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Información del Caso</p>
              <p className="text-sm text-gray-600">ID Caso: {r.caso_eliminado}</p>
              {r.cedula_solicitante && (
                <p className="text-sm text-gray-600">
                  Solicitante: {r.nombre_completo_solicitante || 'N/A'} ({r.cedula_solicitante})
                </p>
              )}
              {r.fecha_solicitud && (
                <p className="text-sm text-gray-600">Fecha Solicitud: {formatOnlyDate(r.fecha_solicitud)}</p>
              )}
              {r.tramite && (
                <p className="text-sm text-gray-600">Trámite: {r.tramite}</p>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Auditoría</p>
              <p className="text-sm text-gray-600">
                Eliminado por:{' '}
                {renderUserLink(
                  r.nombre_completo_usuario_elimino,
                  r.nombres_usuario_elimino,
                  r.apellidos_usuario_elimino,
                  r.eliminado_por
                )}
              </p>
              <p className="text-sm text-gray-600">Fecha eliminación: {formatDate(r.fecha)}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Motivo</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{r.motivo || 'Sin motivo registrado'}</p>
            </div>
          </div>
        );
      }
      case 'caso-creado': {
        const r = record as CasoCreadoAuditRecord;
        return (
          <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Información del Caso</p>
              <p className="text-sm text-gray-600">ID Caso: {r.id_caso}</p>
              {r.cedula_solicitante && (
                <p className="text-sm text-gray-600">
                  Solicitante: {r.nombre_completo_solicitante || 'N/A'} ({r.cedula_solicitante})
                </p>
              )}
              {r.fecha_solicitud && (
                <p className="text-sm text-gray-600">Fecha Solicitud: {formatOnlyDate(r.fecha_solicitud)}</p>
              )}
              {r.tramite && (
                <p className="text-sm text-gray-600">Trámite: {r.tramite}</p>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Auditoría</p>
              <p className="text-sm text-gray-600">Fecha creación: {formatDate(r.fecha_creacion)}</p>
              <p className="text-sm text-gray-600">
                Creado por:{' '}
                {renderUserLink(
                  r.nombre_completo_usuario_creo,
                  r.nombres_usuario_creo,
                  r.apellidos_usuario_creo,
                  r.id_usuario_creo
                )}
              </p>
            </div>

          </div>
        );
      }
      case 'caso-actualizado': {
        const r = record as CasoActualizadoAuditRecord;
        const isCambioEstatus = r.tipo_cambio === 'cambio_estatus';

        // Detectar cambios en campos
        const hasFechaSolicitudChange = !areDatesEqual(r.fecha_solicitud_anterior, r.fecha_solicitud_nuevo);
        const hasFechaInicioCasoChange = !areDatesEqual(r.fecha_inicio_caso_anterior, r.fecha_inicio_caso_nuevo);
        const hasFechaFinCasoChange = !areDatesEqual(r.fecha_fin_caso_anterior, r.fecha_fin_caso_nuevo);
        const hasTramiteChange = r.tramite_anterior !== r.tramite_nuevo;
        const hasObservacionesChange = r.observaciones_anterior !== r.observaciones_nuevo;
        const hasNucleoChange = r.id_nucleo_anterior !== r.id_nucleo_nuevo;
        const hasSolicitanteChange = r.cedula_solicitante_anterior !== r.cedula_solicitante_nuevo;
        const hasMateriaChange = r.id_materia_anterior !== r.id_materia_nuevo;
        const hasCategoriaChange = r.num_categoria_anterior !== r.num_categoria_nuevo;
        const hasSubcategoriaChange = r.num_subcategoria_anterior !== r.num_subcategoria_nuevo;
        const hasAmbitoLegalChange = r.num_ambito_legal_anterior !== r.num_ambito_legal_nuevo;

        return (
          <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Cambios Realizados</p>

              {/* Cambio de estatus */}
              {/* Cambio de estatus */}
              {isCambioEstatus && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600 mb-2">
                    Estatus:{' '}
                    <span className="line-through text-red-500">{r.estatus_anterior || 'N/A'}</span>
                    {' → '}
                    <span className="text-green-600 font-medium">{r.estatus_nuevo || 'N/A'}</span>
                  </p>
                </div>
              )}

              {/* Cambios en campos (solo si no es cambio de estatus) */}
              {!isCambioEstatus && (
                <>
                  {hasFechaSolicitudChange && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">
                        Fecha Solicitud:{' '}
                        <span className="line-through text-red-500">{r.fecha_solicitud_anterior ? formatOnlyDate(r.fecha_solicitud_anterior) : 'N/A'}</span>
                        {' → '}
                        <span className="text-green-600">{r.fecha_solicitud_nuevo ? formatOnlyDate(r.fecha_solicitud_nuevo) : 'N/A'}</span>
                      </p>
                    </div>
                  )}

                  {hasFechaInicioCasoChange && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">
                        Fecha Inicio Caso:{' '}
                        <span className="line-through text-red-500">{r.fecha_inicio_caso_anterior ? formatOnlyDate(r.fecha_inicio_caso_anterior) : 'N/A'}</span>
                        {' → '}
                        <span className="text-green-600">{r.fecha_inicio_caso_nuevo ? formatOnlyDate(r.fecha_inicio_caso_nuevo) : 'N/A'}</span>
                      </p>
                    </div>
                  )}

                  {hasFechaFinCasoChange && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">
                        Fecha Fin Caso:{' '}
                        <span className="line-through text-red-500">{r.fecha_fin_caso_anterior ? formatOnlyDate(r.fecha_fin_caso_anterior) : 'N/A'}</span>
                        {' → '}
                        <span className="text-green-600">{r.fecha_fin_caso_nuevo ? formatOnlyDate(r.fecha_fin_caso_nuevo) : 'N/A'}</span>
                      </p>
                    </div>
                  )}

                  {hasTramiteChange && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">
                        Trámite:{' '}
                        <span className="line-through text-red-500">{r.tramite_anterior || 'N/A'}</span>
                        {' → '}
                        <span className="text-green-600">{r.tramite_nuevo || 'N/A'}</span>
                      </p>
                    </div>
                  )}

                  {hasSolicitanteChange && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">
                        Cédula Solicitante:{' '}
                        <span className="line-through text-red-500">{r.cedula_solicitante_anterior || 'N/A'}</span>
                        {' → '}
                        <span className="text-green-600">{r.cedula_solicitante_nuevo || 'N/A'}</span>
                      </p>
                    </div>
                  )}

                  {hasNucleoChange && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">
                        Núcleo:{' '}
                        <span className="line-through text-red-500">{r.nombre_nucleo_anterior || r.id_nucleo_anterior || 'N/A'}</span>
                        {' → '}
                        <span className="text-green-600">{r.nombre_nucleo_nuevo || r.id_nucleo_nuevo || 'N/A'}</span>
                      </p>
                    </div>
                  )}

                  {hasMateriaChange && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">
                        Materia:{' '}
                        <span className="line-through text-red-500">{r.nombre_materia_anterior || r.id_materia_anterior || 'N/A'}</span>
                        {' → '}
                        <span className="text-green-600">{r.nombre_materia_nuevo || r.id_materia_nuevo || 'N/A'}</span>
                      </p>
                    </div>
                  )}

                  {hasCategoriaChange && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">
                        Categoría:{' '}
                        <span className="line-through text-red-500">{r.nombre_categoria_anterior || (r.num_categoria_anterior !== null ? `#${r.num_categoria_anterior}` : 'N/A')}</span>
                        {' → '}
                        <span className="text-green-600">{r.nombre_categoria_nuevo || (r.num_categoria_nuevo !== null ? `#${r.num_categoria_nuevo}` : 'N/A')}</span>
                      </p>
                    </div>
                  )}

                  {hasSubcategoriaChange && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">
                        Subcategoría:{' '}
                        <span className="line-through text-red-500">{r.nombre_subcategoria_anterior || (r.num_subcategoria_anterior !== null ? `#${r.num_subcategoria_anterior}` : 'N/A')}</span>
                        {' → '}
                        <span className="text-green-600">{r.nombre_subcategoria_nuevo || (r.num_subcategoria_nuevo !== null ? `#${r.num_subcategoria_nuevo}` : 'N/A')}</span>
                      </p>
                    </div>
                  )}

                  {hasAmbitoLegalChange && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">
                        Ámbito Legal:{' '}
                        <span className="line-through text-red-500">{r.nombre_ambito_legal_anterior || (r.num_ambito_legal_anterior !== null ? `#${r.num_ambito_legal_anterior}` : 'N/A')}</span>
                        {' → '}
                        <span className="text-green-600">{r.nombre_ambito_legal_nuevo || (r.num_ambito_legal_nuevo !== null ? `#${r.num_ambito_legal_nuevo}` : 'N/A')}</span>
                      </p>
                    </div>
                  )}

                  {hasObservacionesChange && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-600 mb-1">Observaciones:</p>
                      <p className="text-sm line-through text-red-500 bg-red-50 p-2 rounded mb-1">
                        {r.observaciones_anterior || 'Sin observaciones'}
                      </p>
                      <p className="text-sm text-green-600 bg-green-50 p-2 rounded">
                        {r.observaciones_nuevo || 'Sin observaciones'}
                      </p>
                    </div>
                  )}
                </>
              )}

            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Auditoría</p>
              <p className="text-sm text-gray-600">
                Actualizado por:{' '}
                {renderUserLink(
                  r.nombre_completo_usuario_actualizo,
                  r.nombres_usuario_actualizo,
                  r.apellidos_usuario_actualizo,
                  r.id_usuario_actualizo
                )}
              </p>
              <p className="text-sm text-gray-600">Fecha actualización: {formatDate(r.fecha_actualizacion)}</p>
            </div>

            {r.motivo && (
              <div className="mt-3 text-sm">
                <span className="font-semibold text-gray-700 block mb-1">Motivo:</span>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-600 border border-gray-100">
                  <p className="whitespace-pre-wrap">{r.motivo}</p>
                </div>
              </div>
            )}


          </div>
        );
      }
      // Catálogos - casos genéricos para actualizados

      case 'estado-actualizado':
      case 'materia-actualizada':
      case 'nivel-educativo-actualizado':
      case 'nucleo-actualizado':
      case 'condicion-trabajo-actualizada':
      case 'condicion-actividad-actualizada':
      case 'tipo-caracteristica-actualizado':
      case 'semestre-actualizado':
      case 'municipio-actualizado':
      case 'parroquia-actualizada':
      case 'categoria-actualizada':
      case 'subcategoria-actualizada':
      case 'ambito-legal-actualizado':
      case 'caracteristica-actualizada': {
        const r = record as any;

        // Determinar el nombre según el tipo específico de auditoría
        let nameFieldAnterior: string;
        let nameFieldNuevo: string;
        if (type === 'categoria-actualizada') {
          nameFieldAnterior = r.nombre_categoria_anterior || 'N/A';
          nameFieldNuevo = r.nombre_categoria_nuevo || 'N/A';
        } else if (type === 'subcategoria-actualizada') {
          nameFieldAnterior = r.nombre_subcategoria_anterior || 'N/A';
          nameFieldNuevo = r.nombre_subcategoria_nuevo || 'N/A';
        } else if (type === 'ambito-legal-actualizado') {
          nameFieldAnterior = r.nombre_ambito_legal_anterior || 'N/A';
          nameFieldNuevo = r.nombre_ambito_legal_nuevo || 'N/A';
        } else if (type === 'estado-actualizado') {
          nameFieldAnterior = r.nombre_estado_anterior || 'N/A';
          nameFieldNuevo = r.nombre_estado_nuevo || 'N/A';
        } else if (type === 'materia-actualizada') {
          nameFieldAnterior = r.nombre_materia_anterior || 'N/A';
          nameFieldNuevo = r.nombre_materia_nuevo || 'N/A';
        } else if (type === 'nucleo-actualizado') {
          nameFieldAnterior = r.nombre_nucleo_anterior || 'N/A';
          nameFieldNuevo = r.nombre_nucleo_nuevo || 'N/A';
        } else if (type === 'condicion-trabajo-actualizada') {
          nameFieldAnterior = r.nombre_trabajo_anterior || 'N/A';
          nameFieldNuevo = r.nombre_trabajo_nuevo || 'N/A';
        } else if (type === 'condicion-actividad-actualizada') {
          nameFieldAnterior = r.nombre_actividad_anterior || 'N/A';
          nameFieldNuevo = r.nombre_actividad_nuevo || 'N/A';
        } else if (type === 'tipo-caracteristica-actualizado') {
          nameFieldAnterior = r.nombre_tipo_caracteristica_anterior || 'N/A';
          nameFieldNuevo = r.nombre_tipo_caracteristica_nuevo || 'N/A';
        } else if (type === 'municipio-actualizado') {
          nameFieldAnterior = r.nombre_municipio_anterior || 'N/A';
          nameFieldNuevo = r.nombre_municipio_nuevo || 'N/A';
        } else if (type === 'parroquia-actualizada') {
          nameFieldAnterior = r.nombre_parroquia_anterior || 'N/A';
          nameFieldNuevo = r.nombre_parroquia_nuevo || 'N/A';
        } else if (type === 'nivel-educativo-actualizado' || type === 'caracteristica-actualizada') {
          // Estos usan descripcion en lugar de nombre
          nameFieldAnterior = r.descripcion_anterior || 'N/A';
          nameFieldNuevo = r.descripcion_nuevo || 'N/A';
        } else {
          // Fallback para otros casos
          nameFieldAnterior = r.descripcion_anterior || 'N/A';
          nameFieldNuevo = r.descripcion_nuevo || 'N/A';
        }

        // Para características, mostrar solo num_caracteristica (sin guión)
        const caracteristicaId = r.num_caracteristica != null ? r.num_caracteristica : null;

        const idField = r.id_estado || r.id_materia || r.id_nivel_educativo || r.id_nucleo ||
          r.id_trabajo || r.id_actividad || r.id_tipo || r.term ||
          (r.id_estado != null && r.num_municipio != null ? `${r.id_estado}-${r.num_municipio}` : null) ||
          (r.id_estado != null && r.num_municipio != null && r.num_parroquia != null ? `${r.id_estado}-${r.num_municipio}-${r.num_parroquia}` : null) ||
          (r.id_materia != null && r.num_categoria != null ? `${r.id_materia}-${r.num_categoria}` : null) ||
          (r.id_materia != null && r.num_categoria != null && r.num_subcategoria != null ? `${r.id_materia}-${r.num_categoria}-${r.num_subcategoria}` : null) ||
          (r.id_materia != null && r.num_categoria != null && r.num_subcategoria != null && r.num_ambito_legal != null ? `${r.id_materia}-${r.num_categoria}-${r.num_subcategoria}-${r.num_ambito_legal}` : null) ||
          caracteristicaId || 'N/A';

        // Obtener información de la entidad fuerte
        const entidadFuerte =
          type === 'categoria-actualizada' ? r.nombre_materia :
            type === 'subcategoria-actualizada' ? r.nombre_categoria :
              type === 'ambito-legal-actualizado' ? r.nombre_subcategoria :
                type === 'caracteristica-actualizada' ? r.nombre_tipo_caracteristica :
                  type === 'municipio-actualizado' ? r.nombre_estado :
                    type === 'parroquia-actualizada' ? r.nombre_municipio :
                      null;

        // Para parroquias, también mostrar el estado
        const estadoParroquiaActualizadaDetalle = type === 'parroquia-actualizada' ? r.nombre_estado : null;

        return (
          <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Cambios Realizados</p>
              {/* Para semestres, el term es el ID, así que no mostramos ID por separado */}
              {type !== 'semestre-actualizado' && (
                <p className="text-sm text-gray-600 mb-3">ID: {idField}</p>
              )}

              {(nameFieldAnterior !== nameFieldNuevo) && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Nombre:{' '}
                    <span className="line-through text-red-500">
                      {nameFieldAnterior}
                    </span>
                    {' → '}
                    <span className="text-green-600">
                      {nameFieldNuevo}
                    </span>
                  </p>
                </div>
              )}

              {(r.habilitado_anterior !== null && r.habilitado_nuevo !== null && r.habilitado_anterior !== r.habilitado_nuevo) && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Habilitado:{' '}
                    <span className="line-through text-red-500">
                      {r.habilitado_anterior ? 'Sí' : 'No'}
                    </span>
                    {' → '}
                    <span className="text-green-600">
                      {r.habilitado_nuevo ? 'Sí' : 'No'}
                    </span>
                  </p>
                </div>
              )}

              {/* Campos específicos para semestres */}
              {type === 'semestre-actualizado' && (
                <>
                  {!areDatesEqual(r.fecha_inicio_anterior, r.fecha_inicio_nuevo) && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">
                        Fecha inicio:{' '}
                        <span className="line-through text-red-500">
                          {r.fecha_inicio_anterior ? formatOnlyDate(r.fecha_inicio_anterior) : 'N/A'}
                        </span>
                        {' → '}
                        <span className="text-green-600">
                          {r.fecha_inicio_nuevo ? formatOnlyDate(r.fecha_inicio_nuevo) : 'N/A'}
                        </span>
                      </p>
                    </div>
                  )}
                  {!areDatesEqual(r.fecha_fin_anterior, r.fecha_fin_nuevo) && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">
                        Fecha fin:{' '}
                        <span className="line-through text-red-500">
                          {r.fecha_fin_anterior ? formatOnlyDate(r.fecha_fin_anterior) : 'N/A'}
                        </span>
                        {' → '}
                        <span className="text-green-600">
                          {r.fecha_fin_nuevo ? formatOnlyDate(r.fecha_fin_nuevo) : 'N/A'}
                        </span>
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Campos específicos para núcleos: estado, municipio y parroquia */}
              {type === 'nucleo-actualizado' && (
                <>
                  {(r.id_estado_anterior !== r.id_estado_nuevo || r.num_municipio_anterior !== r.num_municipio_nuevo || r.num_parroquia_anterior !== r.num_parroquia_nuevo) && (
                    <>
                      {(r.id_estado_anterior !== r.id_estado_nuevo || (r.nombre_estado_anterior !== r.nombre_estado_nuevo && (r.nombre_estado_anterior || r.nombre_estado_nuevo))) && (
                        <div className="mb-2">
                          <p className="text-sm text-gray-600">
                            Estado:{' '}
                            <span className="line-through text-red-500">
                              {r.nombre_estado_anterior || 'N/A'}
                            </span>
                            {' → '}
                            <span className="text-green-600">
                              {r.nombre_estado_nuevo || 'N/A'}
                            </span>
                          </p>
                        </div>
                      )}
                      {(r.num_municipio_anterior !== r.num_municipio_nuevo || (r.nombre_municipio_anterior !== r.nombre_municipio_nuevo && (r.nombre_municipio_anterior || r.nombre_municipio_nuevo))) && (
                        <div className="mb-2">
                          <p className="text-sm text-gray-600">
                            Municipio:{' '}
                            <span className="line-through text-red-500">
                              {r.nombre_municipio_anterior || 'N/A'}
                            </span>
                            {' → '}
                            <span className="text-green-600">
                              {r.nombre_municipio_nuevo || 'N/A'}
                            </span>
                          </p>
                        </div>
                      )}
                      {(r.num_parroquia_anterior !== r.num_parroquia_nuevo || (r.nombre_parroquia_anterior !== r.nombre_parroquia_nuevo && (r.nombre_parroquia_anterior || r.nombre_parroquia_nuevo))) && (
                        <div className="mb-2">
                          <p className="text-sm text-gray-600">
                            Parroquia:{' '}
                            <span className="line-through text-red-500">
                              {r.nombre_parroquia_anterior || 'N/A'}
                            </span>
                            {' → '}
                            <span className="text-green-600">
                              {r.nombre_parroquia_nuevo || 'N/A'}
                            </span>
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {/* Campos específicos para parroquias: estado y municipio */}
              {type === 'parroquia-actualizada' && (
                <>
                  {(r.id_estado_anterior !== r.id_estado_nuevo || r.num_municipio_anterior !== r.num_municipio_nuevo) && (
                    <>
                      {(r.id_estado_anterior !== r.id_estado_nuevo || (r.nombre_estado_anterior !== r.nombre_estado_nuevo && (r.nombre_estado_anterior || r.nombre_estado_nuevo))) && (
                        <div className="mb-2">
                          <p className="text-sm text-gray-600">
                            Estado:{' '}
                            <span className="line-through text-red-500">
                              {r.nombre_estado_anterior || 'N/A'}
                            </span>
                            {' → '}
                            <span className="text-green-600">
                              {r.nombre_estado_nuevo || 'N/A'}
                            </span>
                          </p>
                        </div>
                      )}
                      {(r.num_municipio_anterior !== r.num_municipio_nuevo || (r.nombre_municipio_anterior !== r.nombre_municipio_nuevo && (r.nombre_municipio_anterior || r.nombre_municipio_nuevo))) && (
                        <div className="mb-2">
                          <p className="text-sm text-gray-600">
                            Municipio:{' '}
                            <span className="line-through text-red-500">
                              {r.nombre_municipio_anterior || 'N/A'}
                            </span>
                            {' → '}
                            <span className="text-green-600">
                              {r.nombre_municipio_nuevo || 'N/A'}
                            </span>
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {/* Campos específicos para subcategorías: materia y categoría */}
              {type === 'subcategoria-actualizada' && (
                <>
                  {(r.id_materia_anterior !== r.id_materia_nuevo || (r.nombre_materia_anterior !== r.nombre_materia_nuevo && (r.nombre_materia_anterior || r.nombre_materia_nuevo))) && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">
                        Materia:{' '}
                        <span className="line-through text-red-500">
                          {r.nombre_materia_anterior || 'N/A'}
                        </span>
                        {' → '}
                        <span className="text-green-600">
                          {r.nombre_materia_nuevo || 'N/A'}
                        </span>
                      </p>
                    </div>
                  )}
                  {(r.num_categoria_anterior !== r.num_categoria_nuevo || r.id_materia_anterior !== r.id_materia_nuevo || (r.nombre_categoria_anterior !== r.nombre_categoria_nuevo && (r.nombre_categoria_anterior || r.nombre_categoria_nuevo))) && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">
                        Categoría:{' '}
                        <span className="line-through text-red-500">
                          {r.nombre_categoria_anterior || 'N/A'}
                        </span>
                        {' → '}
                        <span className="text-green-600">
                          {r.nombre_categoria_nuevo || 'N/A'}
                        </span>
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
            {/* Para semestres actualizados, mostrar sección de Información con todos los atributos */}
            {type === 'semestre-actualizado' && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Información</p>
                <p className="text-sm text-gray-600">Nombre: {nameFieldNuevo}</p>
                {r.fecha_inicio_nuevo && (
                  <p className="text-sm text-gray-600">Fecha inicio: {formatOnlyDate(r.fecha_inicio_nuevo)}</p>
                )}
                {r.fecha_fin_nuevo && (
                  <p className="text-sm text-gray-600">Fecha fin: {formatOnlyDate(r.fecha_fin_nuevo)}</p>
                )}
                {r.habilitado_nuevo !== null && (
                  <p className="text-sm text-gray-600">Habilitado: {r.habilitado_nuevo ? 'Sí' : 'No'}</p>
                )}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Auditoría</p>
              <p className="text-sm text-gray-600">
                Actualizado por:{' '}
                {renderUserLink(
                  r.nombre_completo_usuario_actualizo,
                  r.nombres_usuario_actualizo,
                  r.apellidos_usuario_actualizo,
                  r.id_usuario_actualizo
                )}
              </p>
              <p className="text-sm text-gray-600">
                Fecha actualización: {formatDate(r.fecha_actualizacion)}
              </p>
            </div>
          </div>
        );
      }
      case 'equipo-actualizado': {
        const r = record as EquipoActualizadoAuditRecord;
        const miembrosAnteriores = r.miembros_anteriores || [];
        const miembrosNuevos = r.miembros_nuevos || [];

        const estudiantesAnteriores = miembrosAnteriores.filter((m: MiembroEquipoAudit) => m.tipo === 'estudiante');
        const profesoresAnteriores = miembrosAnteriores.filter((m: MiembroEquipoAudit) => m.tipo === 'profesor');
        const estudiantesNuevos = miembrosNuevos.filter((m: MiembroEquipoAudit) => m.tipo === 'estudiante');
        const profesoresNuevos = miembrosNuevos.filter((m: MiembroEquipoAudit) => m.tipo === 'profesor');

        return (
          <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Cambios en el Equipo</p>

              {/* Profesores */}
              <div className="mb-2">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-700">Profesores:</span>{' '}
                  <span className="line-through text-red-500">
                    {profesoresAnteriores.length > 0 ? (
                      profesoresAnteriores.map((m: MiembroEquipoAudit, i: number) => (
                        <span key={i}>
                          {m.nombre_completo}
                          {i < profesoresAnteriores.length - 1 && ', '}
                        </span>
                      ))
                    ) : 'Ninguno'}
                  </span>
                  {' → '}
                  <span className="text-green-600">
                    {profesoresNuevos.length > 0 ? (
                      profesoresNuevos.map((m: MiembroEquipoAudit, i: number) => (
                        <span key={i}>
                          <Link
                            href={`/dashboard/users/${m.cedula}`}
                            className="text-green-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {m.nombre_completo}
                          </Link>
                          {i < profesoresNuevos.length - 1 && ', '}
                        </span>
                      ))
                    ) : 'Ninguno'}
                  </span>
                </p>
              </div>

              {/* Estudiantes */}
              <div className="mb-2">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-700">Estudiantes:</span>{' '}
                  <span className="line-through text-red-500">
                    {estudiantesAnteriores.length > 0 ? (
                      estudiantesAnteriores.map((m: MiembroEquipoAudit, i: number) => (
                        <span key={i}>
                          {m.nombre_completo}
                          {i < estudiantesAnteriores.length - 1 && ', '}
                        </span>
                      ))
                    ) : 'Ninguno'}
                  </span>
                  {' → '}
                  <span className="text-green-600">
                    {estudiantesNuevos.length > 0 ? (
                      estudiantesNuevos.map((m: MiembroEquipoAudit, i: number) => (
                        <span key={i}>
                          <Link
                            href={`/dashboard/users/${m.cedula}`}
                            className="text-green-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {m.nombre_completo}
                          </Link>
                          {i < estudiantesNuevos.length - 1 && ', '}
                        </span>
                      ))
                    ) : 'Ninguno'}
                  </span>
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-1">Auditoría</p>
              <p className="text-sm text-gray-600">
                Modificado por:{' '}
                {renderUserLink(
                  r.nombre_completo_usuario_modifico,
                  r.nombres_usuario_modifico,
                  r.apellidos_usuario_modifico,
                  r.id_usuario_modifico
                )}
              </p>
              <p className="text-sm text-gray-600">
                Fecha modificación: {formatDate(r.fecha)}
              </p>
            </div>
          </div>
        );
      }
    }
  };


  const getDate = () => {

    switch (type) {
      case 'soporte':
        return (record as SoporteAuditRecord).fecha_eliminacion;
      case 'soporte-creado':
        return (record as SoporteCreadoAuditRecord).fecha_creacion;
      case 'cita-eliminada':
        return (record as CitaEliminadaAuditRecord).fecha_eliminacion;
      case 'cita-creada':
        return (record as CitaCreadaAuditRecord).fecha_creacion;
      case 'cita-actualizada':
        return (record as CitaActualizadaAuditRecord).fecha_actualizacion;
      case 'usuario-eliminado':
        return (record as UsuarioEliminadoAuditRecord).fecha;
      case 'usuario-actualizado-campos':
        return (record as UsuarioActualizadoCamposAuditRecord).fecha_actualizacion;
      case 'usuario-creado':
        return (record as UsuarioCreadoAuditRecord).fecha_creacion;
      case 'solicitante-eliminado':
        return (record as any).fecha;
      case 'solicitante-actualizado':
        return (record as any).fecha_actualizacion;
      case 'solicitante-creado':
        return (record as any).fecha_creacion;
      case 'caso-eliminado':
        return (record as CasoEliminadoAuditRecord).fecha;
      case 'caso-actualizado':
        return (record as CasoActualizadoAuditRecord).fecha_actualizacion;
      case 'caso-creado':
        return (record as CasoCreadoAuditRecord).fecha_creacion;
      case 'estudiante-inscrito':
        return (record as EstudianteInscritoAuditRecord).fecha_creacion;
      case 'profesor-asignado':
        return (record as any).fecha_creacion;
      // Catálogos eliminados
      case 'estado-eliminado':
      case 'materia-eliminada':
      case 'nivel-educativo-eliminado':
      case 'nucleo-eliminado':
      case 'condicion-trabajo-eliminada':
      case 'condicion-actividad-eliminada':
      case 'tipo-caracteristica-eliminado':
      case 'semestre-eliminado':
      case 'municipio-eliminado':
      case 'parroquia-eliminada':
      case 'categoria-eliminada':
      case 'subcategoria-eliminada':
      case 'ambito-legal-eliminado':
      case 'caracteristica-eliminada':
        return (record as any).fecha_eliminacion;
      // Catálogos insertados
      case 'estado-insertado':
      case 'materia-insertada':
      case 'nivel-educativo-insertado':
      case 'nucleo-insertado':
      case 'condicion-trabajo-insertada':
      case 'condicion-actividad-insertada':
      case 'tipo-caracteristica-insertado':
      case 'semestre-insertado':
      case 'municipio-insertado':
      case 'parroquia-insertada':
      case 'categoria-insertada':
      case 'subcategoria-insertada':
      case 'ambito-legal-insertado':
      case 'caracteristica-insertada':
        return (record as any).fecha_creacion;
      // Catálogos actualizados
      case 'estado-actualizado':
      case 'materia-actualizada':
      case 'nivel-educativo-actualizado':
      case 'nucleo-actualizado':
      case 'condicion-trabajo-actualizada':
      case 'condicion-actividad-actualizada':
      case 'tipo-caracteristica-actualizado':
      case 'semestre-actualizado':
      case 'municipio-actualizado':
      case 'parroquia-actualizada':
      case 'categoria-actualizada':
      case 'subcategoria-actualizada':
      case 'ambito-legal-actualizado':
      case 'caracteristica-actualizada':
        return (record as any).fecha_actualizacion;
      case 'beneficiario-creado':
        return (record as BeneficiarioInscritoAuditRecord).fecha_registro;
      case 'beneficiario-actualizado':
        return (record as BeneficiarioActualizadoAuditRecord).fecha_actualizacion;
      case 'beneficiario-eliminado':
        return (record as BeneficiarioEliminadoAuditRecord).fecha_eliminacion;
      // Acciones
      case 'accion-creada':
        return (record as AccionCreadaAuditRecord).fecha_creacion;
      case 'accion-actualizada':
        return (record as AccionActualizadaAuditRecord).fecha_actualizacion;
      case 'accion-eliminada':
        return (record as AccionEliminadaAuditRecord).fecha;
      // Equipo actualizado
      case 'equipo-actualizado':
        return (record as EquipoActualizadoAuditRecord).fecha;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div
        className="flex items-start justify-between gap-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          {renderSummary()}
          <p className="text-xs text-gray-500 mt-2">{formatOnlyDate(getDate())}</p>
        </div>
        <div className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors">
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {renderDetails()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
