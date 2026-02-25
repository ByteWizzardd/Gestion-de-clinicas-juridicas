import { ReactNode } from 'react';

export default function AuditMunicipiosLayout({ children }: { children: ReactNode }) {
    return (
        <div className="w-full">
            <div className="mb-4 md:mb-6 mt-4">
                <h1 className="text-4xl m-3 font-semibold font-primary">Auditoría de Municipios</h1>
                <p className="mb-6 ml-3 text-gray-600">Registro completo de todas las acciones realizadas sobre los municipios del sistema</p>
            </div>
            {children}
        </div>
    );
}
