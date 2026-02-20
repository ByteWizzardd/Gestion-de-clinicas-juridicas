'use client';

import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Skeleton que imita la estructura del AuditRecordCard (card expandible de registros de auditoría).
 * Similar visualmente a las SesionCards.
 */
export default function AuditRecordCardSkeleton() {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    {/* Summary Section */}
                    <div className="flex items-start gap-3">
                        {/* Icono */}
                        <div className="mt-0.5">
                            <Skeleton width={20} height={20} borderRadius="4px" />
                        </div>
                        <div className="flex-1">
                            {/* Línea principal */}
                            <Skeleton width="70%" height={16} borderRadius="6px" />
                            {/* Sublínea */}
                            <div className="mt-1.5">
                                <Skeleton width="45%" height={12} borderRadius="6px" />
                            </div>
                        </div>
                    </div>
                    {/* Fecha */}
                    <div className="mt-2">
                        <Skeleton width="30%" height={10} borderRadius="4px" />
                    </div>
                </div>
                {/* Flecha de expandir */}
                <Skeleton width={28} height={28} borderRadius="50%" />
            </div>
        </div>
    );
}
