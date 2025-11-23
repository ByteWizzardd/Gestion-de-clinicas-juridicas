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
    const variantStyles = {
        primary: 'from-primary/10 to-primary/5 border-primary/20',
        secondary: 'from-secondary/10 to-secondary/5 border-secondary/20',
        success: 'from-success/10 to-success/5 border-success/20',
        danger: 'from-danger/10 to-danger/5 border-danger/20'
    };

    const iconColors = {
        primary: 'text-primary',
        secondary: 'text-secondary',
        success: 'text-success',
        danger: 'text-danger'
    };

    return (
        <div className={`bg-gradient-to-br ${variantStyles[variant]} border rounded-lg p-6 flex flex-col gap-4 hover:shadow-md transition-shadow`}>
            <div className="flex items-start gap-4">
                <div className={`${iconColors[variant]} flex-shrink-0`}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-foreground mb-2">{title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
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
