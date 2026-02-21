import { ReactNode } from 'react';
import CatalogBackButton from '@/components/catalogs/CatalogBackButton';

export default function SubcategoriasLayout({ children }: { children: ReactNode }) {
    return (
        <div className="w-full">
            <div className="mb-4 md:mb-6 mt-4">
                <h1 className="text-4xl m-3 font-semibold font-primary">Subcategorías</h1>
                <p className="mb-4 ml-3 text-gray-600">Subcategorías dentro de cada categoría</p>
                <div className="ml-3">
                    <CatalogBackButton />
                </div>
            </div>
            {children}
        </div>
    );
}
