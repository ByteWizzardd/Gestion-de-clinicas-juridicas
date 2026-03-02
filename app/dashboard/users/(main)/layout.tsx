import { ReactNode } from 'react';

export default function UsersMainLayout({ children }: { children: ReactNode }) {
    return (
        <div className="w-full">
            <div className="mb-4 md:mb-6 mt-4">
                <h1 className="text-4xl m-3 font-semibold text-[var(--foreground)] transition-colors" style={{ fontFamily: 'var(--font-league-spartan)' }}>Usuarios</h1>
                <p className="mb-6 ml-3 text-base text-[var(--card-text-muted)] transition-colors" style={{ fontFamily: 'var(--font-urbanist)' }}>
                    Administración de usuarios del sistema: estudiantes, profesores y coordinadores
                </p>
            </div>
            {children}
        </div>
    );
}
