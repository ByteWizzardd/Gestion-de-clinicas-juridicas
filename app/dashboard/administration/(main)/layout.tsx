import { ReactNode } from 'react';

export default function AdministrationMainLayout({ children }: { children: ReactNode }) {
    return (
        <div className="w-full">
            {/* Header always preloaded */}
            <div className="mb-4 md:mb-6 mt-4">
                <h1 className="text-4xl m-3 font-semibold font-primary">Administración</h1>
                <p className="mb-6 ml-3 text-base text-gray-600">Mantenimiento de los catálogos del sistema</p>
            </div>
            {children}
        </div>
    );
}
