import { ReactNode } from 'react';

export default function AuditSesionesLayout({ children }: { children: ReactNode }) {
    return (
        <div className="w-full">
            <div className="mb-4 md:mb-6 mt-4">
                <h1 className="text-4xl m-3 font-semibold font-primary">Auditoría de Sesiones</h1>
                <p className="mb-6 ml-3 text-gray-600">Registro de actividad y seguridad de accesos al sistema</p>
            </div>
            {children}
        </div>
    );
}
