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
        <div className="pt-2 px-6 pb-6 space-y-6 overflow-x-hidden max-w-full">
            {/* Header */}
            <motion.div
                className="mb-4 md:mb-6"
                initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: "easeOut" }}
            >
                <h1 className="text-2xl sm:text-3xl lg:text-4xl m-3 font-semibold font-primary">Administración</h1>
                <p className="mb-6 ml-3 text-base">Mantenimiento de las tablas maestras del sistema</p>
            </motion.div>

            {/* Buscador */}
            <motion.div
                className="mb-6"
                initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: prefersReducedMotion ? 0 : 0.1, ease: "easeOut" }}
            >
                <Search
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Buscar catálogo..."
                />
            </motion.div>

            {/* Grid de catálogos */}
            <motion.div
                initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
            >
                <CatalogsGrid counts={counts} searchQuery={searchQuery} />
            </motion.div>
        </div>
    );
}
