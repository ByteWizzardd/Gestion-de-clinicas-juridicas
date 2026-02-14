import { Skeleton } from '@/components/ui/Skeleton';
import AuditEntityCardSkeleton from '@/components/ui/skeletons/AuditEntityCardSkeleton';

export default function AdministrationLoading() {
    return (
        <div className="p-4">
            {/* Título */}
            <div className="m-3">
                <Skeleton width="22%" height={32} borderRadius="8px" />
            </div>
            <div className="ml-3 mt-2 mb-6">
                <Skeleton width="50%" height={14} borderRadius="6px" />
            </div>

            {/* Barra de búsqueda */}
            <div className="m-3 mb-6">
                <div className="w-full flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                        <Skeleton width="100%" height={40} borderRadius="9999px" />
                    </div>
                    <Skeleton width={150} height={40} borderRadius="9999px" />
                </div>
            </div>

            {/* Grid de cards skeleton */}
            <div className="m-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                    <AuditEntityCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
