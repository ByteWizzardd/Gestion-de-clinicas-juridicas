import { Skeleton } from '@/components/ui/Skeleton';

export default function AppointmentsLoading() {
    return (
        <div className="h-full relative p-4">
            {/* Header */}
            <div className="mb-4 md:mb-6 mt-4">
                <div className="mb-4">
                    <Skeleton width="8%" height={28} borderRadius="8px" />
                    <div className="mt-2">
                        <Skeleton width="35%" height={14} borderRadius="6px" />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6">
                {['Calendario', 'Lista', 'Agendadas'].map((_, i) => (
                    <Skeleton
                        key={i}
                        width={i === 0 ? 110 : i === 1 ? 70 : 100}
                        height={36}
                        borderRadius="9999px"
                        style={
                            i === 0
                                ? { background: 'var(--primary)', opacity: 0.15, animation: 'none' }
                                : undefined
                        }
                    />
                ))}
            </div>

            {/* Calendar view layout — two columns */}
            <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-6 pb-6">
                {/* Calendar widget skeleton */}
                <div className="h-[calc(100vh-16rem)]">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 h-full flex flex-col">
                        {/* Month header */}
                        <div className="flex items-center justify-between mb-6">
                            <Skeleton width={36} height={36} borderRadius="50%" />
                            <Skeleton width="30%" height={20} borderRadius="6px" />
                            <Skeleton width={36} height={36} borderRadius="50%" />
                        </div>

                        {/* Weekday headers */}
                        <div className="grid grid-cols-7 gap-2 mb-3">
                            {Array.from({ length: 7 }).map((_, i) => (
                                <div key={i} className="flex justify-center">
                                    <Skeleton width={28} height={12} borderRadius="4px" />
                                </div>
                            ))}
                        </div>

                        {/* Calendar grid — 5 rows x 7 cols */}
                        <div className="flex-1 grid grid-cols-7 grid-rows-5 gap-2">
                            {Array.from({ length: 35 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-center"
                                >
                                    <Skeleton
                                        width={36}
                                        height={36}
                                        borderRadius="50%"
                                        style={
                                            [8, 15, 22, 29].includes(i)
                                                ? { background: 'rgba(156,35,39,0.08)', animation: 'none' }
                                                : undefined
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Appointment list skeleton */}
                <div className="pr-6 h-[calc(100vh-16rem)] flex flex-col">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-5 flex-1 flex flex-col">
                        {/* List header */}
                        <div className="flex items-center justify-between mb-5">
                            <Skeleton width="55%" height={16} borderRadius="6px" />
                            <Skeleton width={32} height={32} borderRadius="50%" />
                        </div>

                        {/* Appointment items */}
                        <div className="flex-1 space-y-3 overflow-hidden">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/60">
                                    {/* Time badge */}
                                    <div className="shrink-0">
                                        <Skeleton width={50} height={44} borderRadius="10px" />
                                    </div>
                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <Skeleton width="75%" height={13} borderRadius="5px" />
                                        <div className="mt-1.5">
                                            <Skeleton width="50%" height={11} borderRadius="4px" />
                                        </div>
                                    </div>
                                    {/* Action dot */}
                                    <div className="shrink-0">
                                        <Skeleton width={6} height={6} borderRadius="50%" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
