'use client';

import { TrendingUp, User, Calendar, MessageSquare } from 'lucide-react';
import { formatDate } from '@/lib/utils/date-formatter';

interface StatusChangesTabProps {
  cambiosEstatus?: Array<{
    num_cambio: number;
    id_caso: number;
    motivo: string | null;
    nuevo_estatus: string;
    fecha: string;
    id_usuario_cambia: string;
    nombres_usuario: string;
    apellidos_usuario: string;
    nombre_completo_usuario: string;
  }>;
}

export default function StatusChangesTab({ cambiosEstatus }: StatusChangesTabProps) {
  if (!cambiosEstatus || cambiosEstatus.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No hay cambios de estatus registrados para este caso</p>
      </div>
    );
  }

  const getStatusColor = (estatus: string) => {
    const colors: Record<string, string> = {
      'En proceso': 'bg-blue-100 text-blue-800',
      'Archivado': 'bg-gray-100 text-gray-800',
      'Entregado': 'bg-green-100 text-green-800',
      'Asesoría': 'bg-purple-100 text-purple-800',
    };
    return colors[estatus] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      {cambiosEstatus.map((cambio, index) => (
        <div key={`${cambio.num_cambio}-${cambio.id_caso}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                  Cambio #{cambio.num_cambio}
                </h4>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(cambio.nuevo_estatus)}`}>
                  {cambio.nuevo_estatus}
                </span>
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(cambio.fecha)}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {cambio.motivo && (
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4" />
                  Motivo del Cambio
                </label>
                <p className="text-base text-gray-900 mt-1 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 border border-gray-200">
                  {cambio.motivo}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-500">Cambiado por</label>
              <p className="text-base text-gray-900 mt-1 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                {cambio.nombre_completo_usuario}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

