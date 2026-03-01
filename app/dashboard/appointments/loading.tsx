import { Skeleton } from '@/components/ui/Skeleton';

export default function AppointmentsLoading() {
    return (
        <div className="h-full relative">
            {/* Header */}
            <div className="mb-4 md:mb-6 mt-4">
                <h1 className="text-4xl m-3 font-semibold font-primary text-[var(--foreground)] transition-colors">
                    Citas
                </h1>
                <p className="mb-6 ml-3 text-[var(--card-text-muted)] transition-colors">
                    Vista de programación de las citas.
                </p>
            </div>

            {/* Tabs (real) */}
            <div className="w-full">
                <div className="border-b border-[var(--card-border)] mb-4 sm:mb-6 transition-colors">
                    <div className="flex gap-1 w-full">
                        <button className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-medium whitespace-nowrap shrink border-b-2 border-primary text-primary">
                            Calendario
                        </button>
                        <button className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-medium whitespace-nowrap shrink border-b-2 border-transparent text-[var(--card-text-muted)] transition-colors">
                            Lista
                        </button>
                        <button className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-medium whitespace-nowrap shrink border-b-2 border-transparent text-[var(--card-text-muted)] transition-colors">
                            Agendadas
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar view layout — two columns */}
            <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-6 pb-6">
                {/* Calendar widget skeleton */}
                <div className="h-[calc(100vh-16rem)]">
                    <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.30)] p-6 h-full flex flex-col transition-colors">
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
                    <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.30)] px-4 py-5 flex-1 flex flex-col transition-colors">
                        {/* List header */}
                        <div className="flex items-center justify-between mb-5">
                            <Skeleton width="55%" height={16} borderRadius="6px" />
                            <Skeleton width={32} height={32} borderRadius="50%" />
                        </div>

                        {/* Appointment items */}
                        <div className="flex-1 space-y-3 overflow-hidden">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--ui-bg-muted)] transition-colors">
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
