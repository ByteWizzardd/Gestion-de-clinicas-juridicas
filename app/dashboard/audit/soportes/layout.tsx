import { ReactNode } from 'react';

export default function AuditSoportesLayout({ children }: { children: ReactNode }) {
    return (
        <div className="w-full">
            <div className="mb-4 md:mb-6 mt-4">
                <h1 className="text-4xl m-3 font-semibold font-primary text-[var(--foreground)] transition-colors">Auditoría de Soportes</h1>
                <p className="mb-6 ml-3 text-base text-[var(--card-text-muted)] transition-colors">Registro completo de todas las acciones realizadas sobre los documentos y archivos del sistema</p>
            </div>
            {children}
        </div>
    );
}
