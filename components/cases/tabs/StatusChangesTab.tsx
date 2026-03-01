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
      <div className="bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--card-border)] p-8 text-center transition-colors">
        <TrendingUp className="w-12 h-12 text-[var(--card-text-muted)] opacity-20 mx-auto mb-4" />
        <p className="text-[var(--card-text-muted)] text-lg transition-colors">No hay cambios de estatus registrados para este caso</p>
      </div>
    );
  }

  const getStatusColor = (estatus: string) => {
    const colors: Record<string, string> = {
      'En proceso': 'bg-blue-500/10 text-blue-500',
      'Archivado': 'bg-gray-500/10 text-gray-500',
      'Entregado': 'bg-green-500/10 text-green-500',
      'Asesoría': 'bg-purple-500/10 text-purple-500',
    };
    return colors[estatus] || 'bg-gray-500/10 text-gray-500';
  };

  return (
    <div className="space-y-4">
      {cambiosEstatus.map((cambio, index) => (
        <div key={`${cambio.num_cambio}-${cambio.id_caso}`} className="bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--card-border)] p-4 sm:p-6 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="text-base sm:text-lg font-semibold text-[var(--card-text)] transition-colors">
                  Cambio #{cambio.num_cambio}
                </h4>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(cambio.nuevo_estatus)}`}>
                  {cambio.nuevo_estatus}
                </span>
              </div>
              <p className="text-sm text-[var(--card-text-muted)] transition-colors">
                {formatDate(cambio.fecha)}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {cambio.motivo && (
              <div>
                <label className="text-sm font-medium text-[var(--card-text-muted)] mb-2">
                  Motivo del Cambio
                </label>
                <p className="text-base text-[var(--card-text)] mt-1 whitespace-pre-wrap bg-[var(--ui-bg-muted)] rounded-lg p-3 border border-[var(--card-border)] transition-colors">
                  {cambio.motivo}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-[var(--card-text-muted)]">Cambiado por</label>
              <p className="text-base text-[var(--card-text)] mt-1">
                {cambio.nombre_completo_usuario}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

