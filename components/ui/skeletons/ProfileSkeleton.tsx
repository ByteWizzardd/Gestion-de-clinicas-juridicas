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
export default function ProfileSkeleton() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            {/* === Breadcrumbs === */}
            {/* Real: nav.flex.items-center.gap-2.text-xl.mb-6 */}
            {/* "Dashboard" (gray) + ChevronRight + "Perfil" (bold) */}
            <nav className="flex items-center gap-2 text-xl mb-6">
                <Skeleton width={90} height={20} borderRadius="6px" />
                <Skeleton width={16} height={16} borderRadius="4px" />
                <Skeleton width={50} height={20} borderRadius="6px" />
            </nav>

            {/* === Header: Avatar + Name + Cédula === */}
            {/* Real: div.mb-6.sm:mb-8 > div.flex.items-center.gap-4.mb-4 */}
            <div className="mb-6 sm:mb-8">
                <div className="flex items-center gap-4 mb-4">
                    {/* PhotoUploadHeader: w-20 h-20 = 80px, rounded-full, border-4 */}
                    <Skeleton width={80} height={80} borderRadius="50%" />
                    <div>
                        {/* h1.text-2xl.sm:text-3xl.lg:text-4xl.font-semibold.mb-2 */}
                        <Skeleton width={360} height={36} borderRadius="8px" />
                        {/* p.text-sm.sm:text-base.text-gray-500, mt implied by mb-2 on h1 */}
                        <div className="mt-2">
                            <Skeleton width={150} height={16} borderRadius="6px" />
                        </div>
                    </div>
                </div>
            </div>

            {/* === GeneralInfoTab: Cards === */}
            {/* Real: div.space-y-4.sm:space-y-6 */}
            <div className="space-y-4 sm:space-y-6">

                {/* Card 1: "Información de Contacto" — 1 field */}
                {/* Real: bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    {/* Title: h3.text-lg.sm:text-xl.font-semibold.mb-4.flex.items-center.gap-2 */}
                    <div className="flex items-center gap-2 mb-4">
                        <Skeleton width={20} height={20} borderRadius="4px" />
                        <Skeleton width={220} height={24} borderRadius="6px" />
                    </div>
                    {/* Field: Correo */}
                    <div>
                        <Skeleton width={55} height={14} borderRadius="4px" />
                        <div className="flex items-center gap-2 mt-1">
                            <Skeleton width={16} height={16} borderRadius="4px" />
                            <Skeleton width={260} height={16} borderRadius="6px" />
                        </div>
                    </div>
                </div>

                {/* Card 2: "Datos Personales" — 3 fields */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    {/* Title: icon + "Datos Personales" */}
                    <div className="flex items-center gap-2 mb-4">
                        <Skeleton width={20} height={20} borderRadius="4px" />
                        <Skeleton width={180} height={24} borderRadius="6px" />
                    </div>
                    {/* Grid: grid-cols-1 sm:grid-cols-2 gap-4 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Field 1: Nombre Completo */}
                        <div>
                            <Skeleton width={130} height={14} borderRadius="4px" />
                            <div className="flex items-center gap-2 mt-1">
                                <Skeleton width={16} height={16} borderRadius="4px" />
                                <Skeleton width={190} height={16} borderRadius="6px" />
                            </div>
                        </div>
                        {/* Field 2: Cédula */}
                        <div>
                            <Skeleton width={60} height={14} borderRadius="4px" />
                            <div className="flex items-center gap-2 mt-1">
                                <Skeleton width={16} height={16} borderRadius="4px" />
                                <Skeleton width={110} height={16} borderRadius="6px" />
                            </div>
                        </div>
                        {/* Field 3: Rol */}
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
