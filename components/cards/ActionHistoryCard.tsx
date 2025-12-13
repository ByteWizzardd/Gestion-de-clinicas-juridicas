'use client';

import { FileText, Calendar, FileCheck, Eye, Clock } from 'lucide-react';
import { ReactNode } from 'react';

interface ActionHistoryCardProps {
  mainText: string;
  subText?: string;
  caseInfo: string;
  date: string;
  time: string;
  actionType: 'document' | 'appointment' | 'view' | 'update' | 'other';
  isLast?: boolean;
}

const actionIcons = {
  document: FileText,
  appointment: Calendar,
  view: Eye,
  update: FileCheck,
  other: Clock,
};

const actionColors = {
  document: 'bg-primary-light text-primary border-primary',
  appointment: 'bg-secondary-light text-secondary border-secondary',
  view: 'bg-primary-light text-primary border-primary',
  update: 'bg-secondary-light text-secondary border-secondary',
  other: 'bg-primary-light text-primary border-primary',
};

export default function ActionHistoryCard({
  mainText,
  subText,
  caseInfo,
  date,
  time,
  actionType,
  isLast = false,
}: ActionHistoryCardProps) {
  const Icon = actionIcons[actionType] || actionIcons.other;
  const colorClass = actionColors[actionType] || actionColors.other;

  return (
    <div className="relative flex gap-3 md:gap-4 pb-4 md:pb-6">
      {/* Línea vertical de la línea de tiempo */}
      {!isLast && (
        <div className="absolute left-4 md:left-5 top-8 md:top-10 w-0.5 h-full bg-secondary" />
      )}
      
      {/* Punto/Icono de la línea de tiempo */}
      <div className={`relative z-0 flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full ${colorClass} border-2 flex items-center justify-center`}>
        <Icon className="w-4 h-4 md:w-5 md:h-5" />
      </div>

      {/* Contenido del historial */}
      <div className="flex-1 min-w-0 pt-0.5">
        {/* Fecha y hora */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs md:text-sm font-semibold text-gray-700">
            {date}
          </span>
          <span className="text-xs text-gray-500">•</span>
          <span className="text-xs md:text-sm text-gray-500">
            {time}
          </span>
        </div>

        {/* Acción principal */}
        <div className="text-sm md:text-base font-semibold text-gray-900 mb-1">
          {mainText}
        </div>

        {/* Subtexto opcional */}
        {subText && (
          <div className="text-xs md:text-sm text-gray-600 mb-1.5">
            {subText}
          </div>
        )}

        {/* Información del caso */}
        <div className="text-xs md:text-sm text-gray-500 font-medium">
          {caseInfo}
        </div>
      </div>
    </div>
  );
}

