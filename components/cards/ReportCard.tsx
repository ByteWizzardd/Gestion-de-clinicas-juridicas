'use client';

import Button from '../ui/Button';

interface ReportCardProps {
    title: string;
    icon: React.ReactNode;
    onGenerate: () => void;
    buttonColor?: 'red' | 'orange';
    className?: string;
}

export default function ReportCard({
    title,
    icon,
    onGenerate,
    buttonColor = 'red',
    className = ''
}: ReportCardProps) {
    const buttonStyles = {
        red: 'bg-[#9c2327] hover:bg-[#7a1b1f]',
        orange: 'bg-[#f47e1f] hover:bg-[#c66519]'
    };

    const iconColorStyles = {
        red: 'text-primary/20',
        orange: 'text-secondary/20'
    };

    return (
        <div className={`bg-neutral-50 rounded-3xl shadow-[0px_4px_10px_0px_rgba(0,0,0,0.3)] h-full min-h-40 w-full relative overflow-hidden p-4 flex flex-col ${className}`}>
            {/* Título */}
            <h3 className="text-xl text-neutral-800/85 font-normal leading-tight pr-20 my-auto">
                {title}
            </h3>

            {/* Icono decorativo grande en la esquina superior derecha */}
            <div className={`absolute top-2 right-2 w-24 h-24 ${iconColorStyles[buttonColor]} flex items-center justify-center pointer-events-none`}>
                {icon}
            </div>

            {/* Botón en la parte inferior */}
            <div className="mt-auto flex justify-center pt-2">
                <button
                    onClick={onGenerate}
                    className={`${buttonStyles[buttonColor]} h-9 w-40 rounded-lg text-white text-base font-normal transition-colors cursor-pointer`}
                >
                    Generar Informe
                </button>
            </div>
        </div>
    );
}
