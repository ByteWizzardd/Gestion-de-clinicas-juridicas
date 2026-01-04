'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, FileText, Calendar, User, X, Check, BookOpen, GraduationCap, Building, Briefcase, Activity, Tag, Tags, Scale, MapPin, Building2, Home, FolderTree } from 'lucide-react';
import Link from 'next/link';
import UserAvatar from '@/components/ui/UserAvatar';
import type { 
  SoporteAuditRecord,
  SoporteCreadoAuditRecord,
  CitaEliminadaAuditRecord, 
  CitaActualizadaAuditRecord,
  CitaCreadaAuditRecord,
  UsuarioEliminadoAuditRecord,
  UsuarioActualizadoCamposAuditRecord,
  UsuarioCreadoAuditRecord
} from '@/types/audit';

type AuditRecord = SoporteAuditRecord | SoporteCreadoAuditRecord | CitaEliminadaAuditRecord | CitaActualizadaAuditRecord | CitaCreadaAuditRecord | UsuarioEliminadoAuditRecord | UsuarioActualizadoCamposAuditRecord | UsuarioCreadoAuditRecord | any;

type AuditRecordType = 'soporte' | 'soporte-creado' | 'cita-eliminada' | 'cita-actualizada' | 'cita-creada' | 'usuario-eliminado' | 'usuario-actualizado-campos' | 'usuario-creado'
  | 'estado-eliminado' | 'estado-actualizado' | 'estado-insertado'
  | 'materia-eliminada' | 'materia-actualizada' | 'materia-insertada'
  | 'nivel-educativo-eliminado' | 'nivel-educativo-actualizado' | 'nivel-educativo-insertado'
  | 'nucleo-eliminado' | 'nucleo-actualizado' | 'nucleo-insertado'
  | 'condicion-trabajo-eliminada' | 'condicion-trabajo-actualizada' | 'condicion-trabajo-insertada'
  | 'condicion-actividad-eliminada' | 'condicion-actividad-actualizada' | 'condicion-actividad-insertada'
  | 'tipo-caracteristica-eliminado' | 'tipo-caracteristica-actualizado' | 'tipo-caracteristica-insertado'
  | 'semestre-eliminado' | 'semestre-actualizado' | 'semestre-insertado'
  | 'municipio-eliminado' | 'municipio-actualizado' | 'municipio-insertado'
  | 'parroquia-eliminada' | 'parroquia-actualizada' | 'parroquia-insertada'
  | 'categoria-eliminada' | 'categoria-actualizada' | 'categoria-insertada'
  | 'subcategoria-eliminada' | 'subcategoria-actualizada' | 'subcategoria-insertada'
  | 'ambito-legal-eliminado' | 'ambito-legal-actualizado' | 'ambito-legal-insertado'
  | 'caracteristica-eliminada' | 'caracteristica-actualizada' | 'caracteristica-insertada';

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

  const formatOnlyDate = (dateInput: string | Date | null | undefined) => {
    if (!dateInput) return 'Fecha no disponible';
    
    let date: Date;
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string') {
      const parts = dateInput.split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts.map(Number);
        date = new Date(year, month - 1, day);
      } else {
        date = new Date(dateInput);
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
      case 'usuario-creado': {
        const r = record as UsuarioCreadoAuditRecord;
        // Construir nombre completo
        let nombreCompleto = `${r.nombres} ${r.apellidos}`.trim();
        if (!nombreCompleto) {
          nombreCompleto = 'Usuario desconocido';
        }

        return (
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-600" />
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
                    <p className="text-sm text-gray-600">Orientación:</p>
                    <p className="text-sm line-through text-red-500 bg-red-50 p-2 rounded">
                      {r.orientacion_anterior || 'N/A'}
                    </p>
                    <p className="text-sm text-green-600 bg-green-50 p-2 rounded mt-1">
                      {r.orientacion_nueva || 'N/A'}
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
            {r.motivo && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Motivo</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{r.motivo}</p>
              </div>
            )}
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
            {r.cedula && (
              <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                <Link
                  href={`/dashboard/users/${r.cedula}`}
                  className="text-sm text-primary hover:underline"
                >
                  Ver usuario →
                </Link>
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
            {r.motivo && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Motivo de eliminación</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{r.motivo}</p>
              </div>
            )}
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
