import { ReactNode } from 'react';

export default function AuditCatalogosLayout({ children }: { children: ReactNode }) {
    return (
        <div className="w-full">
            <div className="mb-4 md:mb-6 mt-4">
                <h1 className="text-4xl m-3 font-semibold font-primary">Auditoría de Catálogos</h1>
                <p className="mb-6 ml-3">Registro detallado de cambios en las tablas maestras y configuraciones</p>
            </div>
            {children}
        </div>
    );
}
