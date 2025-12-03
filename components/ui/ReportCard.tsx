'use client';

import Button from './Button';

interface ReportCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onGenerate: () => void;
    variant?: 'primary' | 'secondary' | 'success' | 'danger';
}

export default function ReportCard({
    title,
    description,
    icon,
    onGenerate,
    variant = 'primary'
}: ReportCardProps) {
    // Subtle background colors matching reference
    const cardBgStyles = {
        primary: 'bg-white border-gray-200',
        secondary: 'bg-white border-gray-200',
        success: 'bg-white border-gray-200',
        danger: 'bg-white border-gray-200'
    };

    // Icon circle background colors matching Figma design exactly
    const iconBgStyles = {
        primary: 'bg-red-800',
        secondary: 'bg-orange-500',
        success: 'bg-red-700',
        danger: 'bg-orange-500'
    };

    return (
        <div className={`${cardBgStyles[variant]} border rounded-xl p-5 flex flex-col gap-3 hover:shadow-lg transition-shadow min-h-[200px]`}>
            <div className="flex items-start gap-4 justify-between">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base text-gray-800 mb-2 leading-tight">{title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
                </div>
                <div className={`${iconBgStyles[variant]} p-3 rounded-full flex-shrink-0 text-white`}>
                    {icon}
                </div>
            </div>
            <div className="mt-auto">
                <Button
                    variant={variant}
                    size="sm"
                    onClick={onGenerate}
                    className="w-full"
                >
                    Generar Informe
                </Button>
            </div>
        </div>
    );
}
