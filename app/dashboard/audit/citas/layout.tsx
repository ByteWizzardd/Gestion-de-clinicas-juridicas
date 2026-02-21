import { ReactNode } from 'react';

export default function AuditCitasLayout({ children }: { children: ReactNode }) {
    return (
        <div className="w-full">
            <div className="mb-4 md:mb-6 mt-4">
                <h1 className="text-4xl m-3 font-semibold font-primary">Auditoría de Citas</h1>
                <p className="mb-6 ml-3">Registro de todas las citas agendadas, reprogramadas y gestionadas</p>
            </div>
            {children}
        </div>
    );
}
