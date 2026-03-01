'use client';

import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Skeleton para el dropdown de notificaciones.
 * Simula items de notificación con punto, título y mensaje.
 */
export default function NotificationSkeleton({ count = 3 }: { count?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="w-full px-4 py-3 border-b border-[var(--dropdown-divider)] last:border-b-0 transition-colors">
                    <div className="flex items-start gap-3">
                        <Skeleton width={8} height={8} borderRadius="50%" style={{ marginTop: 8 }} />
                        <div className="flex-1 min-w-0">
                            <Skeleton width="60%" height={14} borderRadius="6px" />
                            <div className="mt-1.5">
                                <Skeleton width="85%" height={12} borderRadius="6px" />
                            </div>
                        </div>
                        <Skeleton width={50} height={14} borderRadius="6px" />
                    </div>
                </div>
            ))}
        </>
    );
}
