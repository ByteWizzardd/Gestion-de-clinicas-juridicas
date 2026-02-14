import { Skeleton } from "@/components/ui/Skeleton";
import TableSkeleton from "@/components/ui/skeletons/TableSkeleton";

export default function Loading() {
    return (
        <div className="w-full">
            <div className="m-3">
                <Skeleton width={300} height={40} borderRadius="8px" />
            </div>
            <div className="mb-6 ml-3">
                <Skeleton width={400} height={20} borderRadius="4px" />
            </div>
            <TableSkeleton columns={5} rows={8} />
        </div>
    );
}
