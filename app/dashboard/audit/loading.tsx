import { Skeleton } from '@/components/ui/Skeleton';
import AuditRecordCardSkeleton from '@/components/ui/skeletons/AuditRecordCardSkeleton';

export default function AuditLoading() {
    return (
        <div className="p-4">
            {/* Título */}
            <div className="m-3">
                <Skeleton width="22%" height={32} borderRadius="8px" />
            </div>
            <div className="ml-3 mt-2 mb-6">
                <Skeleton width="50%" height={14} borderRadius="6px" />
            </div>

            {/* Barra de búsqueda y filtros */}
            <div className="m-3 mb-6">
                <div className="w-full flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                        <Skeleton width="100%" height={40} borderRadius="9999px" />
                    </div>
                    <Skeleton width={150} height={40} borderRadius="9999px" />
                </div>
            </div>

            {/* Cards skeleton (misma estructura que los módulos de auditoría) */}
            <div className="m-3 space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                    <AuditRecordCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
