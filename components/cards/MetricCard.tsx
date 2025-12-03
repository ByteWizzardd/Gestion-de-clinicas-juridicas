'use client';

interface MetricCardProps {
    title: string;
    mainValue: string;
    subtitle: string;
}

export default function MetricCard({
    title,
    mainValue,
    subtitle
}: MetricCardProps) {
    return (
        <div className="bg-white rounded-3xl shadow-md relative overflow-visible p-6 min-h-48">
            {/* Título arriba-izquierda */}
            <h3 className="text-xl font-normal text-neutral-800 mb-6">
                {title}
            </h3>

            {/* Contenido principal alineado a la derecha */}
            <div className="flex flex-col items-end mb-8 pr-2">
                <div className="text-5xl font-semibold text-neutral-800 mb-2">
                    {mainValue}
                </div>
                <div className="text-base text-neutral-600">
                    {subtitle}
                </div>
            </div>

            {/* Línea separadora naranja en la parte inferior, con márgenes laterales */}
            <div className="absolute bottom-4 left-6 right-6 h-0.5 bg-secondary"></div>
        </div>
    );
}
