'use client';

import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface AuditOperation {
  label: string;
  count: number;
}

interface AuditEntityCardProps {
  title: string;
  description: string;
  totalCount: number;
  icon: LucideIcon;
  operations: AuditOperation[];
  href: string; // URL de la página de detalle de la entidad
}

export default function AuditEntityCard({
  title,
  description,
  totalCount,
  icon: Icon,
  operations,
  href
}: AuditEntityCardProps) {
  return (
    <div className="bg-[var(--card-bg)] border-[var(--card-border)] border rounded-2xl md:rounded-3xl shadow-[0px_4px_10px_0px_rgba(0,0,0,0.30)] relative overflow-hidden px-4 sm:px-6 md:px-8 py-4 md:py-5 min-h-[160px] md:min-h-[180px] flex flex-col w-full transition-colors">
      {/* Icono de fondo decorativo */}
      <div className="absolute top-2 w-full h-full flex items-center justify-center right-0">
        <Icon className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 text-secondary-light/30" strokeWidth={2} />
      </div>

      {/* Título arriba-izquierda */}
      <h3 className="text-base sm:text-lg md:text-xl font-medium text-[var(--card-text)] mb-1.5 relative z-10">
        {title}
      </h3>

      {/* Descripción */}
      <p className="text-xs md:text-sm text-[var(--card-text-muted)] mb-3 relative z-10 grow leading-relaxed">
        {description}
      </p>

      {/* Contador total y botón */}
      <div className="flex items-center justify-between gap-2 relative z-10">
        <div className="text-xl sm:text-2xl md:text-3xl font-semibold text-[var(--card-text)]">
          {totalCount}
        </div>
        <Link href={href}>
          <button className="bg-secondary hover:bg-secondary/90 h-8 sm:h-9 px-4 sm:px-6 rounded-lg text-white text-xs sm:text-sm md:text-base font-normal transition-colors cursor-pointer whitespace-nowrap">
            Ver detalles
          </button>
        </Link>
      </div>

      {/* Línea separadora naranja en el lado izquierdo */}
      <div className="absolute top-4 sm:top-5 md:top-6 bottom-4 sm:bottom-5 md:bottom-6 left-2 md:left-3 w-0.5 md:w-1 bg-secondary rounded-full z-10"></div>
    </div>
  );
}
