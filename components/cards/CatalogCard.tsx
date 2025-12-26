'use client';

import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface CatalogCardProps {
    title: string;
    description: string;
    count: number;
    icon: LucideIcon;
    href: string;
}

export default function CatalogCard({
    title,
    description,
    count,
    icon: Icon,
    href
}: CatalogCardProps) {
    return (
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-[0px_4px_10px_0px_rgba(0,0,0,0.30)] relative overflow-hidden px-6 md:px-8 py-4 md:py-5 min-h-[160px] md:min-h-[180px] flex flex-col">
            {/* Icono de fondo decorativo */}
            <div className="absolute top-2 w-full h-full flex items-center justify-center right-15">
                <Icon className="w-28 h-28 md:w-32 md:h-32 text-secondary-light/30" strokeWidth={2} />
            </div>

            {/* Título arriba-izquierda */}
            <h3 className="text-lg md:text-xl font-medium text-neutral-800 mb-1.5 relative z-10">
                {title}
            </h3>

            {/* Descripción */}
            <p className="text-xs md:text-sm text-neutral-600 mb-3 relative z-10 flex-grow leading-relaxed">
                {description}
            </p>

            {/* Contador y botón */}
            <div className="flex items-center justify-between relative z-10">
                <div className="text-2xl md:text-3xl font-semibold text-neutral-800">
                    {count}
                </div>
                <Link href={href}>
                    <button className="bg-secondary hover:bg-secondary/90 h-9 px-6 rounded-lg text-white text-sm md:text-base font-normal transition-colors cursor-pointer">
                        Actualizar
                    </button>
                </Link>
            </div>

            {/* Línea separadora naranja en el lado izquierdo */}
            <div className="absolute top-5 md:top-6 bottom-5 md:bottom-6 left-2 md:left-3 w-0.5 md:w-1 bg-secondary rounded-full z-10"></div>
        </div>
    );
}
