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
        <div className="bg-white rounded-3xl shadow-md relative overflow-hidden p-6 min-h-48">
            {/* Icono de fondo decorativo */}
            {Icon && (
                <div className="absolute top-2 w-full h-full flex items-center justify-center right-15">
                    <Icon className="w-40 h-40 text-secondary-light/30" strokeWidth={2} />
                </div>
            )}

            {/* Título arriba-izquierda */}
            <h3 className="text-xl font-medium text-neutral-800 mb-6 relative z-10">
                {title}
            </h3>

            {/* Contenido principal alineado a la derecha */}
            <div className="flex flex-col items-end mb-8 pr-2 relative z-10">
                <div className="text-5xl font-semibold text-neutral-800 mb-2">
                    {mainValue}
                </div>
                <div className="text-base font-normal text-neutral-600">
                    {subtitle}
                </div>
            </div>

            {/* Línea separadora naranja en la parte inferior, con márgenes laterales */}
            <div className="absolute bottom-4 left-6 right-6 h-0.5 bg-secondary z-10"></div>
        </div>
    );
}