import { ReactNode } from 'react';

export default function AuditCondicionesTrabajoLayout({ children }: { children: ReactNode }) {
    return (
        <div className="w-full">
            <div className="mb-4 md:mb-6 mt-4">
                <h1 className="text-4xl m-3 font-semibold font-primary">Auditoría de Condiciones de Trabajo</h1>
                <p className="mb-6 ml-3 text-gray-600">Registro completo de todas las acciones realizadas sobre las condiciones de trabajo del sistema</p>
            </div>
            {children}
        </div>
    );
}
