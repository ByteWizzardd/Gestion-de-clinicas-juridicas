import { ReactNode } from 'react';

export default function AuditEquipoLayout({ children }: { children: ReactNode }) {
    return (
        <div className="w-full">
            <div className="mb-4 md:mb-6 mt-4">
                <h1 className="text-4xl m-3 font-semibold font-primary">Auditoría de Equipo de Casos</h1>
                <p className="mb-6 ml-3 text-gray-600">Registro completo de cambios en la asignación de estudiantes y profesores a casos</p>
            </div>
            {children}
        </div>
    );
}
