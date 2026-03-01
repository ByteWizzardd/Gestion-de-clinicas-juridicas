'use client';

import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Skeleton específico para la página de Perfil.
 * Replica EXACTAMENTE la estructura de ProfileClient + GeneralInfoTab:
 * 
 * ProfileClient layout:
 *   <div className="p-4 sm:p-6 lg:p-8">
 *     <Breadcrumbs> — nav.flex.items-center.gap-2.text-xl.mb-6
 *     <div className="mb-6 sm:mb-8">
 *       <div className="flex items-center gap-4 mb-4">
 *         <PhotoUploadHeader> — w-20 h-20 rounded-full (80px)
 *         <div>
 *           <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-2">
 *           <p className="text-sm sm:text-base text-gray-500">
 * 
 * GeneralInfoTab layout:
 *   <div className="space-y-4 sm:space-y-6">
 *     Card 1: "Información de Contacto" — 1 field (Correo)
 *     Card 2: "Datos Personales" — 3 fields grid-cols-2
 */
export default function ProfileSkeleton({
    showTabs = false,
    tabsCount = 0,
    breadcrumbsCount = 2
}: {
    showTabs?: boolean;
    tabsCount?: number;
    breadcrumbsCount?: number;
}) {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            {/* === Breadcrumbs === */}
            {/* Real: nav.flex.items-center.gap-2.text-xl.mb-6 */}
            <nav className="flex items-center gap-2 text-xl mb-6">
                {/* Segment 1: "Dashboard" */}
                <Skeleton width={90} height={20} borderRadius="6px" />

                {/* Segment 2: Chevron + Next item */}
                <div className="flex items-center gap-2">
                    <Skeleton width={16} height={16} borderRadius="4px" />
                    <Skeleton width={breadcrumbsCount === 3 ? 80 : 50} height={20} borderRadius="6px" />
                </div>

                {/* Optional Segment 3: Chevron + Final item */}
                {breadcrumbsCount === 3 && (
                    <div className="flex items-center gap-2">
                        <Skeleton width={16} height={16} borderRadius="4px" />
                        <Skeleton width={120} height={20} borderRadius="6px" />
                    </div>
                )}
            </nav>

            {/* === Header: Avatar + Name + Cédula === */}
            <div className="mb-6 sm:mb-8">
                <div className="flex items-center gap-4 mb-4">
                    {/* PhotoUploadHeader: w-20 h-20 = 80px */}
                    <Skeleton width={80} height={80} borderRadius="50%" />
                    <div>
                        <Skeleton width={360} height={36} borderRadius="8px" />
                        <div className="mt-2">
                            <Skeleton width={150} height={16} borderRadius="6px" />
                        </div>
                    </div>
                </div>
            </div>

            {/* === Tabs (Optional) === */}
            {showTabs && (
                <div className="border-b border-[var(--card-border)] mb-4 sm:mb-6 transition-colors">
                    <div className="flex gap-1">
                        {Array.from({ length: tabsCount }).map((_, i) => (
                            <div key={i} className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 border-b-2 border-transparent transition-colors">
                                <Skeleton width={i === 0 ? 120 : 100} height={16} borderRadius="4px" />
                                {i === 0 && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--card-border)] mt-2 transition-colors"></div>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* === Content Area: Cards === */}
            <div className="space-y-4 sm:space-y-6">
                {/* Card 1: "Información de Contacto" */}
                <div className="bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--card-border)] p-4 sm:p-6 transition-colors">
                    <div className="flex items-center gap-2 mb-4">
                        <Skeleton width={20} height={20} borderRadius="4px" />
                        <Skeleton width={220} height={24} borderRadius="6px" />
                    </div>
                    <div>
                        <Skeleton width={55} height={14} borderRadius="4px" />
                        <div className="flex items-center gap-2 mt-1">
                            <Skeleton width={16} height={16} borderRadius="4px" />
                            <Skeleton width={260} height={16} borderRadius="6px" />
                        </div>
                    </div>
                </div>

                {/* Card 2: "Datos Personales" */}
                <div className="bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--card-border)] p-4 sm:p-6 transition-colors">
                    <div className="flex items-center gap-2 mb-4">
                        <Skeleton width={20} height={20} borderRadius="4px" />
                        <Skeleton width={180} height={24} borderRadius="6px" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Skeleton width={130} height={14} borderRadius="4px" />
                            <div className="flex items-center gap-2 mt-1">
                                <Skeleton width={16} height={16} borderRadius="4px" />
                                <Skeleton width={190} height={16} borderRadius="6px" />
                            </div>
                        </div>
                        <div>
                            <Skeleton width={60} height={14} borderRadius="4px" />
                            <div className="flex items-center gap-2 mt-1">
                                <Skeleton width={16} height={16} borderRadius="4px" />
                                <Skeleton width={110} height={16} borderRadius="6px" />
                            </div>
                        </div>
                        <div>
                            <Skeleton width={30} height={14} borderRadius="4px" />
                            <div className="flex items-center gap-2 mt-1">
                                <Skeleton width={16} height={16} borderRadius="4px" />
                                <Skeleton width={110} height={16} borderRadius="6px" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
