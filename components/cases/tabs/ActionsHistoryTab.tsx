'use client';

import { History, User, Calendar, Users } from 'lucide-react';
import { formatDate } from '@/lib/utils/date-formatter';

interface ActionsHistoryTabProps {
  acciones?: Array<{
    num_accion: number;
    id_caso: number;
    detalle_accion: string;
    comentario: string | null;
    id_usuario_registra: string;
    fecha_registro: string;
    fecha_ejecucion?: string;
    nombres_usuario_registra: string;
    apellidos_usuario_registra: string;
    nombre_completo_usuario_registra: string;
    ejecutores: Array<{
      id_usuario: string;
      nombres: string;
      apellidos: string;
      nombre_completo: string;
      fecha_ejecucion: string;
    }>;
  }>;
}

export default function ActionsHistoryTab({ acciones }: ActionsHistoryTabProps) {
  if (!acciones || acciones.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg mb-2">No hay acciones registradas</p>
        <p className="text-sm text-gray-400">Registre una nueva acción para comenzar el historial</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {acciones.map((accion) => (
        <div key={`${accion.num_accion}-${accion.id_caso}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-900">Acción #{accion.num_accion}</h4>
              {(accion.fecha_ejecucion || (accion.ejecutores && accion.ejecutores.length > 0)) && (
                <p className="text-sm text-gray-500 mt-1">
                  Fecha de ejecución: {accion.fecha_ejecucion ? formatDate(accion.fecha_ejecucion) : formatDate(accion.ejecutores[0].fecha_ejecucion)}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Detalle de la Acción</label>
              <p className="text-base text-gray-900 mt-1 whitespace-pre-wrap break-words overflow-wrap-anywhere hyphens-auto" style={{ wordBreak: 'break-word', hyphens: 'auto' }}>{accion.detalle_accion}</p>
            </div>

            {accion.comentario && (
              <div>
                <label className="text-sm font-medium text-gray-500">Comentario</label>
                <p className="text-base text-gray-900 mt-1 whitespace-pre-wrap break-words overflow-wrap-anywhere hyphens-auto" style={{ wordBreak: 'break-word', hyphens: 'auto' }}>{accion.comentario}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-500">Registrado por</label>
              <p className="text-base text-gray-900 mt-1">
                {accion.nombre_completo_usuario_registra}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Fecha de registro: {formatDate(accion.fecha_registro)}
              </p>
            </div>

            {accion.ejecutores && accion.ejecutores.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-500 mb-2">
                  Ejecutores ({accion.ejecutores.length})
                </label>
                <div className="space-y-2">
                  {accion.ejecutores.map((ejecutor, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-sm text-gray-900 font-medium">{ejecutor.nombre_completo}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

