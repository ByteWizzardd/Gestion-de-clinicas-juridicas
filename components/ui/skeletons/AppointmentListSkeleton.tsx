'use client';

import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Skeleton para la lista de citas del dashboard.
 * Simula AppointmentCards compactas.
 */
export default function AppointmentListSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="flex flex-col gap-2 md:gap-2.5 h-full">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg">
                    <Skeleton width={40} height={40} borderRadius="8px" />
                    <div className="flex-1">
                        <Skeleton width="70%" height={12} borderRadius="6px" />
                        <div className="mt-1.5">
                            <Skeleton width="45%" height={10} borderRadius="4px" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
