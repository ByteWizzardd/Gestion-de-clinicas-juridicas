import { Skeleton } from '@/components/ui/Skeleton';
import TableSkeleton from '@/components/ui/skeletons/TableSkeleton';

export default function StudentsLoading() {
    return (
        <div className="p-4">
            {/* Título */}
            <div className="mb-4 md:mb-6 mt-4">
                <div className="m-3">
                    <Skeleton width="16%" height={32} borderRadius="8px" />
                </div>
                <div className="ml-3 mt-2">
                    <Skeleton width="50%" height={14} borderRadius="6px" />
                </div>
            </div>

            {/* Barra de herramientas */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 sm:gap-4 w-full px-3 mb-10">
                <div className="flex-1 min-w-0">
                    <Skeleton width="100%" height={40} borderRadius="9999px" />
                </div>
                <Skeleton width={150} height={40} borderRadius="9999px" />
            </div>

            {/* Tabla skeleton */}
            <div className="px-3">
                <TableSkeleton columns={5} rows={8} />
            </div>
        </div>
    );
}
