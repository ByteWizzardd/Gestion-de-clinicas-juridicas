'use client';

import { TrendingUp, User, Calendar, MessageSquare } from 'lucide-react';
import { formatDate } from '@/lib/utils/date-formatter';
import Link from 'next/link';

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
      <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg shadow-sm border border-gray-200 dark:border-[var(--card-border)] p-8 text-center transition-colors">
        <TrendingUp className="w-12 h-12 text-gray-400 dark:text-[var(--card-text-muted)] mx-auto mb-4" />
        <p className="text-gray-500 dark:text-[var(--card-text-muted)] text-lg">No hay cambios de estatus registrados para este caso</p>
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
        <div key={`${cambio.num_cambio}-${cambio.id_caso}`} className="bg-white dark:bg-[var(--card-bg)] rounded-lg shadow-sm border border-gray-200 dark:border-[var(--card-border)] p-4 sm:p-6 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-[var(--card-text)]">
                  Cambio #{cambio.num_cambio}
                </h4>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(cambio.nuevo_estatus)}`}>
                  {cambio.nuevo_estatus}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-[var(--card-text-muted)]">
                {formatDate(cambio.fecha)}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {cambio.motivo && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-[var(--card-text-muted)] mb-2">
                  Motivo del Cambio
                </label>
                <p className="text-base text-gray-900 dark:text-[var(--card-text)] mt-1 whitespace-pre-wrap bg-gray-50 dark:bg-[var(--ui-bg-muted)] rounded-lg p-3 border border-gray-200 dark:border-[var(--card-border)] transition-colors">
                  {cambio.motivo}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-[var(--card-text-muted)]">Cambiado por</label>
              <p className="text-base text-gray-900 dark:text-[var(--card-text)] mt-1">
                <Link
                  href={`/dashboard/users/${cambio.id_usuario_cambia}`}
                  className="text-primary hover:underline font-medium transition-colors cursor-pointer"
                >
                  {cambio.nombre_completo_usuario}
                </Link>
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}