import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        href: string;
    };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-4">
            {/* Ícono con color de marca */}
            <div className="bg-primary/5 rounded-full p-4 md:p-6 mb-3 md:mb-4">
                <Icon className="w-8 h-8 md:w-12 md:h-12 text-primary/60" />
            </div>

            {/* Título */}
            <h3 className="text-lg font-semibold text-[var(--card-text)] mb-2 transition-colors">
                {title}
            </h3>

            {/* Descripción */}
            <p className="text-sm text-[var(--card-text-muted)] mb-6 text-center max-w-sm transition-colors">
                {description}
            </p>

            {/* Call to Action (opcional) */}
            {action && (
                <Link href={action.href}>
                    <Button variant="primary" size="md">
                        {action.label}
                    </Button>
                </Link>
            )}
        </div>
    );
}
