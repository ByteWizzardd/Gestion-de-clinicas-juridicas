'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, FileText, Calendar, User, X, Check, BookOpen, GraduationCap, Building, Briefcase, Activity, Tag, Tags, Scale, MapPin, Building2, Home, FolderTree } from 'lucide-react';
import Link from 'next/link';
import UserAvatar from '@/components/ui/UserAvatar';
import type { 
  SoporteAuditRecord, 
  CitaEliminadaAuditRecord, 
  CitaActualizadaAuditRecord,
  UsuarioEliminadoAuditRecord,
  UsuarioActualizadoCamposAuditRecord
} from '@/types/audit';

type AuditRecord = SoporteAuditRecord | CitaEliminadaAuditRecord | CitaActualizadaAuditRecord | UsuarioEliminadoAuditRecord | UsuarioActualizadoCamposAuditRecord | any;

type AuditRecordType = 'soporte' | 'cita-eliminada' | 'cita-actualizada' | 'usuario-eliminado' | 'usuario-actualizado-campos'
  | 'estado-eliminado' | 'estado-actualizado'
  | 'materia-eliminada' | 'materia-actualizada'
  | 'nivel-educativo-eliminado' | 'nivel-educativo-actualizado'
  | 'nucleo-eliminado' | 'nucleo-actualizado'
  | 'condicion-trabajo-eliminada' | 'condicion-trabajo-actualizada'
  | 'condicion-actividad-eliminada' | 'condicion-actividad-actualizada'
  | 'tipo-caracteristica-eliminado' | 'tipo-caracteristica-actualizado'
  | 'semestre-eliminado' | 'semestre-actualizado'
  | 'municipio-eliminado' | 'municipio-actualizado'
  | 'parroquia-eliminada' | 'parroquia-actualizada'
  | 'categoria-eliminada' | 'categoria-actualizada'
  | 'subcategoria-eliminada' | 'subcategoria-actualizada'
  | 'ambito-legal-eliminado' | 'ambito-legal-actualizado'
  | 'caracteristica-eliminada' | 'caracteristica-actualizada';

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
      // Si el string incluye 'T' o es un timestamp, parsearlo correctamente
      // PostgreSQL devuelve timestamps en formato ISO, que JavaScript interpreta como UTC
      // Necesitamos extraer los componentes de fecha/hora localmente
      if (dateInput.includes('T')) {
        // Es un timestamp ISO (ej: "2026-01-02T05:24:00.000Z")
        // Extraer los componentes de fecha y hora sin interpretar como UTC
        const isoMatch = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
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

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Helper para renderizar nombre de usuario como enlace
  const renderUserLink = (
    nombreCompleto: string | null,
    nombres: string | null,
    apellidos: string | null,
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
    nombreCompleto: string | null,
    nombres: string | null,
    apellidos: string | null,
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
                {formatDate(r.fecha_encuentro)} • Eliminado por:{' '}
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
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
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
          <div className="flex items-center gap-3">
            <UserAvatar fotoPerfil={r.foto_perfil_usuario} size={25} />
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
        };
        const Icon = iconMap[type] || FileText;
        const nameField = r.nombre_estado || r.nombre_materia || r.descripcion || r.nombre_nucleo || 
          r.nombre_trabajo || r.nombre_actividad || r.nombre_tipo_caracteristica || r.term || 
          r.nombre_municipio || r.nombre_parroquia || r.nombre_categoria || r.nombre_subcategoria || 
          r.nombre_ambito_legal || r.descripcion || 'N/A';
        const idField = r.id_estado || r.id_materia || r.id_nivel_educativo || r.id_nucleo || 
          r.id_trabajo || r.id_actividad || r.id_tipo || r.term || 
          `${r.id_estado || ''}-${r.num_municipio || ''}` || 
          `${r.id_estado || ''}-${r.num_municipio || ''}-${r.num_parroquia || ''}` ||
          `${r.id_materia || ''}-${r.num_categoria || ''}` ||
          `${r.id_materia || ''}-${r.num_categoria || ''}-${r.num_subcategoria || ''}` ||
          `${r.id_materia || ''}-${r.num_categoria || ''}-${r.num_subcategoria || ''}-${r.num_ambito_legal || ''}` ||
          `${r.id_tipo_caracteristica || ''}-${r.num_caracteristica || ''}` || 'N/A';
        
        return (
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{nameField}</p>
              <p className="text-sm text-gray-600">
                ID: {idField} • Eliminado por:{' '}
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
        const nameField = r.nombre_estado_nuevo || r.nombre_materia_nuevo || r.descripcion_nuevo || r.nombre_nucleo_nuevo || 
          r.nombre_trabajo_nuevo || r.nombre_actividad_nuevo || r.nombre_tipo_caracteristica_nuevo || r.term || 
          r.nombre_municipio_nuevo || r.nombre_parroquia_nuevo || r.nombre_categoria_nuevo || r.nombre_subcategoria_nuevo || 
          r.nombre_ambito_legal_nuevo || r.descripcion_nuevo || 'N/A';
        const idField = r.id_estado || r.id_materia || r.id_nivel_educativo || r.id_nucleo || 
          r.id_trabajo || r.id_actividad || r.id_tipo || r.term || 
          `${r.id_estado || ''}-${r.num_municipio || ''}` || 
          `${r.id_estado || ''}-${r.num_municipio || ''}-${r.num_parroquia || ''}` ||
          `${r.id_materia || ''}-${r.num_categoria || ''}` ||
          `${r.id_materia || ''}-${r.num_categoria || ''}-${r.num_subcategoria || ''}` ||
          `${r.id_materia || ''}-${r.num_categoria || ''}-${r.num_subcategoria || ''}-${r.num_ambito_legal || ''}` ||
          `${r.id_tipo_caracteristica || ''}-${r.num_caracteristica || ''}` || 'N/A';
        
        return (
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{nameField}</p>
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
    }
  };

  const renderDetails = () => {
    switch (type) {
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
            {r.motivo && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Motivo de eliminación</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{r.motivo}</p>
              </div>
            )}
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
                <p className="text-sm text-gray-600">Fecha encuentro: {formatDate(r.fecha_encuentro)}</p>
                {r.fecha_proxima_cita && (
                  <p className="text-sm text-gray-600">Próxima cita: {formatDate(r.fecha_proxima_cita)}</p>
                )}
                <p className="text-sm text-gray-600">Orientación: {r.orientacion}</p>
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
            {r.motivo && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Motivo de eliminación</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{r.motivo}</p>
              </div>
            )}
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
                        {r.fecha_encuentro_anterior ? formatDate(r.fecha_encuentro_anterior) : 'N/A'}
                      </span>
                      {' → '}
                      <span className="text-green-600">
                        {r.fecha_encuentro_nueva ? formatDate(r.fecha_encuentro_nueva) : 'N/A'}
                      </span>
                    </p>
                  </div>
                )}
                {r.fecha_proxima_cita_anterior !== r.fecha_proxima_cita_nueva && (
                  <div className="mb-2">
                    <p className="text-sm text-gray-600">
                      Próxima cita:{' '}
                      <span className="line-through text-red-500">
                        {r.fecha_proxima_cita_anterior ? formatDate(r.fecha_proxima_cita_anterior) : 'N/A'}
                      </span>
                      {' → '}
                      <span className="text-green-600">
                        {r.fecha_proxima_cita_nueva ? formatDate(r.fecha_proxima_cita_nueva) : 'N/A'}
                      </span>
                    </p>
                  </div>
                )}
                {r.orientacion_anterior !== r.orientacion_nueva && (
                  <div className="mb-2">
                    <p className="text-sm text-gray-600">Orientación:</p>
                    <p className="text-sm line-through text-red-500 bg-red-50 p-2 rounded">
                      {r.orientacion_anterior || 'N/A'}
                    </p>
                    <p className="text-sm text-green-600 bg-green-50 p-2 rounded mt-1">
                      {r.orientacion_nueva || 'N/A'}
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
            {r.motivo && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Motivo</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{r.motivo}</p>
              </div>
            )}
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
              
              {(r.telefono_celular_anterior !== r.telefono_celular_nuevo) && (
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
        const nameField = r.nombre_estado || r.nombre_materia || r.descripcion || r.nombre_nucleo || 
          r.nombre_trabajo || r.nombre_actividad || r.nombre_tipo_caracteristica || r.term || 
          r.nombre_municipio || r.nombre_parroquia || r.nombre_categoria || r.nombre_subcategoria || 
          r.nombre_ambito_legal || r.descripcion || 'N/A';
        const idField = r.id_estado || r.id_materia || r.id_nivel_educativo || r.id_nucleo || 
          r.id_trabajo || r.id_actividad || r.id_tipo || r.term || 
          `${r.id_estado || ''}-${r.num_municipio || ''}` || 
          `${r.id_estado || ''}-${r.num_municipio || ''}-${r.num_parroquia || ''}` ||
          `${r.id_materia || ''}-${r.num_categoria || ''}` ||
          `${r.id_materia || ''}-${r.num_categoria || ''}-${r.num_subcategoria || ''}` ||
          `${r.id_materia || ''}-${r.num_categoria || ''}-${r.num_subcategoria || ''}-${r.num_ambito_legal || ''}` ||
          `${r.id_tipo_caracteristica || ''}-${r.num_caracteristica || ''}` || 'N/A';
        
        return (
          <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Información</p>
                <p className="text-sm text-gray-600">Nombre: {nameField}</p>
                <p className="text-sm text-gray-600">ID: {idField}</p>
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
            {r.motivo && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Motivo de eliminación</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{r.motivo}</p>
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
        const nameFieldAnterior = r.nombre_estado_anterior || r.nombre_materia_anterior || r.descripcion_anterior || r.nombre_nucleo_anterior || 
          r.nombre_trabajo_anterior || r.nombre_actividad_anterior || r.nombre_tipo_caracteristica_anterior || r.term || 
          r.nombre_municipio_anterior || r.nombre_parroquia_anterior || r.nombre_categoria_anterior || r.nombre_subcategoria_anterior || 
          r.nombre_ambito_legal_anterior || r.descripcion_anterior || 'N/A';
        const nameFieldNuevo = r.nombre_estado_nuevo || r.nombre_materia_nuevo || r.descripcion_nuevo || r.nombre_nucleo_nuevo || 
          r.nombre_trabajo_nuevo || r.nombre_actividad_nuevo || r.nombre_tipo_caracteristica_nuevo || r.term || 
          r.nombre_municipio_nuevo || r.nombre_parroquia_nuevo || r.nombre_categoria_nuevo || r.nombre_subcategoria_nuevo || 
          r.nombre_ambito_legal_nuevo || r.descripcion_nuevo || 'N/A';
        const idField = r.id_estado || r.id_materia || r.id_nivel_educativo || r.id_nucleo || 
          r.id_trabajo || r.id_actividad || r.id_tipo || r.term || 
          `${r.id_estado || ''}-${r.num_municipio || ''}` || 
          `${r.id_estado || ''}-${r.num_municipio || ''}-${r.num_parroquia || ''}` ||
          `${r.id_materia || ''}-${r.num_categoria || ''}` ||
          `${r.id_materia || ''}-${r.num_categoria || ''}-${r.num_subcategoria || ''}` ||
          `${r.id_materia || ''}-${r.num_categoria || ''}-${r.num_subcategoria || ''}-${r.num_ambito_legal || ''}` ||
          `${r.id_tipo_caracteristica || ''}-${r.num_caracteristica || ''}` || 'N/A';
        
        return (
          <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Cambios Realizados</p>
              <p className="text-sm text-gray-600 mb-3">ID: {idField}</p>
              
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
                  {(r.fecha_inicio_anterior !== r.fecha_inicio_nuevo) && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">
                        Fecha inicio:{' '}
                        <span className="line-through text-red-500">
                          {r.fecha_inicio_anterior ? formatDate(r.fecha_inicio_anterior) : 'N/A'}
                        </span>
                        {' → '}
                        <span className="text-green-600">
                          {r.fecha_inicio_nuevo ? formatDate(r.fecha_inicio_nuevo) : 'N/A'}
                        </span>
                      </p>
                    </div>
                  )}
                  {(r.fecha_fin_anterior !== r.fecha_fin_nuevo) && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">
                        Fecha fin:{' '}
                        <span className="line-through text-red-500">
                          {r.fecha_fin_anterior ? formatDate(r.fecha_fin_anterior) : 'N/A'}
                        </span>
                        {' → '}
                        <span className="text-green-600">
                          {r.fecha_fin_nuevo ? formatDate(r.fecha_fin_nuevo) : 'N/A'}
                        </span>
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
              <p className="text-sm text-gray-600">
                Fecha actualización: {formatDate(r.fecha_actualizacion)}
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
      case 'cita-eliminada':
        return (record as CitaEliminadaAuditRecord).fecha_eliminacion;
      case 'cita-actualizada':
        return (record as CitaActualizadaAuditRecord).fecha_actualizacion;
      case 'usuario-eliminado':
        return (record as UsuarioEliminadoAuditRecord).fecha;
      case 'usuario-actualizado-campos':
        return (record as UsuarioActualizadoCamposAuditRecord).fecha_actualizacion;
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
          <p className="text-xs text-gray-500 mt-2">{formatDate(getDate())}</p>
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
