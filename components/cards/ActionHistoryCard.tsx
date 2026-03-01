'use client';

import { Clock } from 'lucide-react';

interface ActionHistoryCardProps {
  mainText: string;
  subText?: string;
  caseInfo: string;
  date: string;
  time?: string; // Opcional, ya no se muestra
  isLast?: boolean;
}

const actionIcon = Clock;
const actionColor = 'bg-secondary-light text-secondary border-secondary';

export default function ActionHistoryCard({
  mainText,
  subText,
  caseInfo,
  date,
  time,
  isLast = false,
}: ActionHistoryCardProps) {
  const Icon = actionIcon;
  const colorClass = actionColor;

  return (
    <div className="relative flex gap-3 md:gap-4 pb-4 md:pb-6">
      {/* Línea vertical de la línea de tiempo */}
      {!isLast && (
        <div className="absolute left-4 md:left-5 top-8 md:top-10 w-0.5 h-full bg-secondary" />
      )}

      {/* Punto/Icono de la línea de tiempo */}
      <div className={`relative z-0 shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full ${colorClass} border-2 flex items-center justify-center`}>
        <Icon className="w-4 h-4 md:w-5 md:h-5" />
      </div>

      {/* Contenido del historial */}
      <div className="flex-1 min-w-0 pt-0.5">
        {/* Fecha */}
        <div className="mb-1.5">
          <span className="text-xs md:text-sm font-semibold text-[var(--card-text)] opacity-80 transition-colors">
            {date}
          </span>
        </div>

        {/* Acción principal */}
        <div className="text-sm md:text-base font-semibold text-[var(--card-text)] mb-1 truncate transition-colors" title={mainText}>
          {mainText}
        </div>

        {/* Subtexto opcional */}
        {subText && (
          <div className="text-xs md:text-sm text-[var(--card-text-muted)] mb-1.5 truncate transition-colors" title={subText}>
            {subText}
          </div>
        )}

        {/* Información del caso */}
        <div className="text-xs md:text-sm text-[var(--card-text-muted)] opacity-70 font-medium truncate transition-colors" title={caseInfo}>
          {caseInfo}
        </div>
      </div>
    </div>
  );
}

