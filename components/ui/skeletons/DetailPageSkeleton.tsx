'use client';

import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';

/**
 * Skeleton para páginas de detalle (caso, usuario, solicitante, perfil).
 * Simula breadcrumbs, título, avatar/badge, y tabs con contenido.
 */
export default function DetailPageSkeleton({
    showAvatar = false,
    showBadge = false,
    tabsCount = 3,
    showActions = false,
    cardsCount = 3,
}: {
    showAvatar?: boolean;
    showBadge?: boolean;
    tabsCount?: number;
    showActions?: boolean;
    cardsCount?: number;
}) {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 mb-4">
                <Skeleton width={80} height={14} borderRadius="6px" />
                <Skeleton width={8} height={14} borderRadius="4px" />
                <Skeleton width={120} height={14} borderRadius="6px" />
            </div>

            {/* Header section */}
            <div className="flex flex-col gap-6 mb-10">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        {showAvatar && (
                            <Skeleton width={64} height={64} borderRadius="50%" />
                        )}
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                                <Skeleton width="40%" height={36} borderRadius="8px" />
                                {showBadge && (
                                    <Skeleton width={100} height={28} borderRadius="9999px" />
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Action buttons placeholder */}
                    {showActions && (
                        <div className="flex items-center gap-3">
                            <Skeleton width={40} height={40} borderRadius="50%" />
                            <Skeleton width={140} height={40} borderRadius="9999px" />
                            <Skeleton width={140} height={40} borderRadius="9999px" />
                        </div>
                    )}
                </div>

                {/* Subtitle / Applicant Info Link */}
                <div className="flex items-center gap-2 mb-2">
                    <Skeleton width={100} height={16} borderRadius="4px" />
                    <Skeleton width={200} height={16} borderRadius="4px" />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200 pb-2 mb-6">
                {Array.from({ length: tabsCount }).map((_, i) => (
                    <Skeleton
                        key={i}
                        width={i === 0 ? 140 : 110}
                        height={16}
                        borderRadius="6px"
                    />
                ))}
            </div>

            {/* Tab content placeholder */}
            <div className="space-y-6">
                {/* Section 1 - General Info */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Skeleton width={24} height={24} borderRadius="4px" />
                        <Skeleton width="45%" height={24} borderRadius="6px" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton width="30%" height={14} borderRadius="4px" />
                                <Skeleton width="70%" height={18} borderRadius="6px" />
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-100">
                        <Skeleton width="20%" height={14} borderRadius="4px" className="mb-2" />
                        <SkeletonText lines={2} />
                    </div>
                </div>

                {/* Section 2 - Solicitante/Info Adicional */}
                {cardsCount >= 2 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Skeleton width={24} height={24} borderRadius="4px" />
                            <Skeleton width="35%" height={24} borderRadius="6px" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton width="30%" height={14} borderRadius="4px" />
                                    <Skeleton width="80%" height={18} borderRadius="6px" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Section 3 - Beneficiarios/Listas */}
                {cardsCount >= 3 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Skeleton width={24} height={24} borderRadius="4px" />
                            <Skeleton width="40%" height={24} borderRadius="6px" />
                        </div>
                        <div className="space-y-4">
                            {Array.from({ length: 2 }).map((_, i) => (
                                <div key={i} className="border border-gray-100 rounded-lg p-4 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <Skeleton width="50%" height={18} borderRadius="6px" />
                                        <Skeleton width={24} height={24} borderRadius="50%" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Skeleton width="60%" height={14} borderRadius="4px" />
                                        <Skeleton width="60%" height={14} borderRadius="4px" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
