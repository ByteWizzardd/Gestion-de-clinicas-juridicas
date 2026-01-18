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
        <div className="flex flex-col items-center justify-center py-8">
            {/* Ícono con color de marca */}
            <div className="bg-primary/5 rounded-full p-6 mb-4">
                <Icon className="w-12 h-12 text-primary/60" />
            </div>

            {/* Título */}
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {title}
            </h3>

            {/* Descripción */}
            <p className="text-sm text-gray-600 mb-6 text-center max-w-sm">
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
