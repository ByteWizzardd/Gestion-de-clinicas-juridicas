import { ReactNode } from 'react';
import CatalogBackButton from '@/components/catalogs/CatalogBackButton';
import { authorizeRole } from '@/lib/utils/auth-utils';

export default async function MateriasLayout({ children }: { children: ReactNode }) {
    await authorizeRole(['coordinator']);

    return (
        <div className="w-full">
            <div className="mb-4 md:mb-6 mt-4">
                <h1 className="text-4xl m-3 font-semibold font-primary text-foreground transition-colors">Materias</h1>
                <p className="mb-4 ml-3 text-base text-(--card-text-muted) transition-colors">Materias principales registradas en el sistema</p>
                <div className="ml-3">
                    <CatalogBackButton />
                </div>
            </div>
            {children}
        </div>
    );
}
