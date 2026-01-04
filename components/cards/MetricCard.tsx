'use client';

import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
    title: string;
    mainValue: string;
    subtitle: string;
    icon?: LucideIcon;
}

export default function MetricCard({
    title,
    mainValue,
    subtitle,
    icon: Icon
}: MetricCardProps) {
    return (
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-[0px_4px_10px_0px_rgba(0,0,0,0.30)] relative overflow-hidden px-6 md:px-8 py-4 md:py-6 min-h-48 md:min-h-52 min-w-[280px] md:min-w-[360px]">
            {/* Icono de fondo decorativo */}
            {Icon && (
                <div className="absolute top-2 w-full h-full flex items-center justify-center right-15">
                    <Icon className="w-32 h-32 md:w-40 md:h-40 text-secondary-light/30" strokeWidth={2} />
                </div>
            )}

            {/* Título arriba-izquierda */}
            <h3 className="text-lg md:text-xl font-medium text-neutral-800 mb-4 md:mb-6 relative z-10">
                {title}
            </h3>

            {/* Contenido principal alineado a la derecha */}
            <div className="flex flex-col items-end mb-6 md:mb-8 pr-2 relative z-10">
                <div className="text-3xl md:text-5xl font-semibold text-neutral-800 mb-2">
                    {mainValue}
                </div>
                <div className="text-sm md:text-base font-normal text-neutral-600">
                    {subtitle}
                </div>
            </div>

            {/* Línea separadora naranja en el lado izquierdo */}
            <div className="absolute top-6 md:top-8 bottom-6 md:bottom-8 left-2 md:left-3 w-0.5 md:w-1 bg-secondary rounded-full z-10"></div>
        </div>
    );
}