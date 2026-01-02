'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, FileText, Calendar, User, X, Check } from 'lucide-react';
import Link from 'next/link';
import type { 
  SoporteAuditRecord, 
  CitaEliminadaAuditRecord, 
  CitaActualizadaAuditRecord,
  UsuarioEliminadoAuditRecord,
  UsuarioActualizadoAuditRecord 
} from '@/types/audit';

type AuditRecord = SoporteAuditRecord | CitaEliminadaAuditRecord | CitaActualizadaAuditRecord | UsuarioEliminadoAuditRecord | UsuarioActualizadoAuditRecord;

type AuditRecordType = 'soporte' | 'cita-eliminada' | 'cita-actualizada' | 'usuario-eliminado' | 'usuario-actualizado';

interface AuditRecordCardProps {
  record: AuditRecord;
  type: AuditRecordType;
}

export default function AuditRecordCard({ record, type }: AuditRecordCardProps) {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const renderSummary = () => {
    switch (type) {
      case 'soporte': {
        const r = record as SoporteAuditRecord;
        return (
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-secondary" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{r.nombre_archivo}</p>
              <p className="text-sm text-gray-600">
                Caso #{r.id_caso} • {r.nombre_completo_usuario_elimino || r.id_usuario_elimino}
              </p>
            </div>
          </div>
        );
      }
      case 'cita-eliminada': {
        const r = record as CitaEliminadaAuditRecord;
        return (
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-red-500" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                Cita #{r.num_cita} - Caso #{r.id_caso}
              </p>
              <p className="text-sm text-gray-600">
                {formatDate(r.fecha_encuentro)} • {r.nombre_completo_usuario_elimino || r.id_usuario_elimino}
              </p>
            </div>
          </div>
        );
      }
      case 'cita-actualizada': {
        const r = record as CitaActualizadaAuditRecord;
        return (
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-blue-500" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                Cita #{r.num_cita} - Caso #{r.id_caso}
              </p>
              <p className="text-sm text-gray-600">
                {r.nombre_completo_usuario_actualizo || r.id_usuario_actualizo}
              </p>
            </div>
          </div>
        );
      }
      case 'usuario-eliminado': {
        const r = record as UsuarioEliminadoAuditRecord;
        return (
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-red-500" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{r.usuario_eliminado}</p>
              <p className="text-sm text-gray-600">Eliminado por: {r.eliminado_por}</p>
            </div>
          </div>
        );
      }
      case 'usuario-actualizado': {
        const r = record as UsuarioActualizadoAuditRecord;
        return (
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-blue-500" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{r.ci_usuario}</p>
              <p className="text-sm text-gray-600">
                {r.tipo_usuario_anterior} → {r.tipo_usuario_nuevo}
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
                {r.fecha_subida && (
                  <p className="text-sm text-gray-600">Subida: {formatDate(r.fecha_subida)}</p>
                )}
                <p className="text-sm text-gray-600">Eliminación: {formatDate(r.fecha_eliminacion)}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Subido por</p>
                <p className="text-sm text-gray-600">
                  {r.nombre_completo_usuario_subio || r.id_usuario_subio || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Eliminado por</p>
                <p className="text-sm text-gray-600">
                  {r.nombre_completo_usuario_elimino || r.id_usuario_elimino}
                </p>
              </div>
            </div>
            {r.motivo && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Motivo de eliminación</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{r.motivo}</p>
              </div>
            )}
            <div className="pt-2">
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
                    Registrado por: {r.nombre_completo_usuario_registro || r.id_usuario_registro}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  Eliminado por: {r.nombre_completo_usuario_elimino || r.id_usuario_elimino}
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
            <div className="pt-2">
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
                  Actualizado por: {r.nombre_completo_usuario_actualizo || r.id_usuario_actualizo}
                </p>
                <p className="text-sm text-gray-600">
                  Fecha actualización: {formatDate(r.fecha_actualizacion)}
                </p>
              </div>
            </div>
            <div className="pt-2">
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
        return (
          <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Información</p>
              <p className="text-sm text-gray-600">Usuario eliminado: {r.usuario_eliminado}</p>
              <p className="text-sm text-gray-600">Eliminado por: {r.eliminado_por}</p>
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
      case 'usuario-actualizado': {
        const r = record as UsuarioActualizadoAuditRecord;
        return (
          <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Cambio de Tipo</p>
              <p className="text-sm text-gray-600">Usuario: {r.ci_usuario}</p>
              <p className="text-sm text-gray-600">
                <span className="line-through text-red-500">{r.tipo_usuario_anterior}</span>
                {' → '}
                <span className="text-green-600">{r.tipo_usuario_nuevo}</span>
              </p>
              <p className="text-sm text-gray-600">Actualizado por: {r.actualizado_por}</p>
              <p className="text-sm text-gray-600">Fecha: {formatDate(r.fecha)}</p>
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
      case 'usuario-actualizado':
        return (record as UsuarioActualizadoAuditRecord).fecha;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {renderSummary()}
          <p className="text-xs text-gray-500 mt-2">{formatDate(getDate())}</p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label={expanded ? 'Contraer' : 'Expandir'}
        >
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </button>
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
