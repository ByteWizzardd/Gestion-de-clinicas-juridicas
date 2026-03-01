import { ReactNode } from 'react';

export default function ApplicantsMainLayout({ children }: { children: ReactNode }) {
    return (
        <div className="w-full">
            <div className="mb-4 md:mb-6 mt-4">
                <h1 className="text-4xl m-3 font-semibold font-primary text-[var(--foreground)] transition-colors">Solicitantes</h1>
                <p className="mb-6 ml-3 text-[var(--card-text-muted)] transition-colors">Listado y búsqueda de todas las personas atendidas.</p>
            </div>
            {children}
        </div>
    );
}
