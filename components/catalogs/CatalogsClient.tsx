'use client';

import { useState, useMemo } from 'react';
import Search from '@/components/CaseTools/search';
import CatalogsGrid, { CatalogCount } from '@/components/catalogs/CatalogsGrid';

interface CatalogsClientProps {
    counts: CatalogCount;
}

export default function CatalogsClient({ counts }: CatalogsClientProps) {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <>
            {/* Buscador */}
            <div className="mb-6">
                <Search
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Buscar catálogo..."
                />
            </div>

            {/* Grid de catálogos */}
            <CatalogsGrid counts={counts} searchQuery={searchQuery} />
        </>
    );
}
