'use client';

import { useState, useMemo, useEffect } from 'react';
import Search from '@/components/CaseTools/search';
import CatalogsGrid, { CatalogCount } from '@/components/catalogs/CatalogsGrid';
import { motion } from 'motion/react';

interface CatalogsClientProps {
    counts: CatalogCount;
}

export default function CatalogsClient({ counts }: CatalogsClientProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setPrefersReducedMotion(mediaQuery.matches);

        const handleChange = (e: MediaQueryListEvent) => {
            setPrefersReducedMotion(e.matches);
        };

        mediaQuery.addEventListener("change", handleChange);

        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    return (
        <div className="space-y-6">
            {/* Buscador */}
            <div className="mb-6">
                <Search
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Buscar catálogo..."
                />
            </div>

            {/* Grid de catálogos */}
            <motion.div
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1, ease: "easeOut" }}
            >
                <CatalogsGrid counts={counts} searchQuery={searchQuery} />
            </motion.div>
        </div>
    );
}
