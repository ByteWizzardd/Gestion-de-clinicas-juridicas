import { ReactNode } from 'react';
import CatalogBackButton from '@/components/catalogs/CatalogBackButton';

export default function CaracteristicasLayout({ children }: { children: ReactNode }) {
    return (
        <div className="w-full">
            <div className="mb-4 md:mb-6 mt-4">
                <h1 className="text-4xl m-3 font-semibold font-primary">Características</h1>
                <p className="mb-4 ml-3 text-gray-600">Características de vivienda de los solicitantes</p>
                <div className="ml-3">
                    <CatalogBackButton />
                </div>
            </div>
            {children}
        </div>
    );
}
