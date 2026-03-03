import { ReactNode } from 'react';

export default function AuditAccionesLayout({ children }: { children: ReactNode }) {
    return (
        <div className="w-full">
            <div className="mb-4 md:mb-6 mt-4">
                <h1 className="text-4xl m-3 font-semibold font-primary text-foreground transition-colors">Auditoría de Acciones de Casos</h1>
                <p className="mb-6 ml-3 text-base text-(--card-text-muted) transition-colors">Registro de todas las acciones procesales, administrativas y jurídicas realizadas en cada caso</p>
            </div>
            {children}
        </div>
    );
}
