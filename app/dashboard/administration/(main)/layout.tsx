import { ReactNode } from 'react';

export default function AdministrationMainLayout({ children }: { children: ReactNode }) {
    return (
        <div className="pt-2 px-6 pb-6 space-y-6 overflow-x-hidden max-w-full">
            {/* Header always preloaded */}
            <div className="mb-4 md:mb-6 mt-4">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl m-3 font-semibold font-primary">Administración</h1>
                <p className="mb-6 ml-3 text-base">Mantenimiento de los catálogos del sistema</p>
            </div>
            {children}
        </div>
    );
}
