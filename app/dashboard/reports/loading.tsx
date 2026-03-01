import { Skeleton } from '@/components/ui/Skeleton';
import { FileBarChart, Clock, Briefcase, History, User, Home } from 'lucide-react';

export default function ReportsLoading() {
    const skeletonIcons = [FileBarChart, Clock, Briefcase, History, User, Home];

    return (
        <div className="w-full">
            {/* Header */}
            <div className="mb-4 md:mb-6 mt-4">
                <h1 className="text-4xl m-3 font-semibold font-primary text-[var(--foreground)] transition-colors">Reportes</h1>
                <p className="mb-6 ml-3 text-base text-[var(--card-text-muted)] transition-colors">Presentación de las métricas clave a través de gráficas y cuadros.</p>
            </div>

            <div className="px-3 md:px-1 space-y-6">
                {/* Report cards grid — 3x2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-[10rem] gap-4 md:gap-6 mb-6 w-full">
                    {Array.from({ length: 6 }).map((_, i) => {
                        const Icon = skeletonIcons[i] || FileBarChart;
                        return (
                            <div
                                key={i}
                                className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-[0px_4px_10px_0px_rgba(0,0,0,0.30)] h-full min-h-40 w-full relative overflow-hidden p-4 flex flex-col transition-colors"
                            >
                                {/* Título del card */}
                                <div className="my-auto pr-20">
                                    <Skeleton
                                        width={i % 2 === 0 ? '65%' : '80%'}
                                        height={18}
                                        borderRadius="6px"
                                    />
                                </div>
                                {/* Ícono decorativo */}
                                <div className={`absolute top-2 right-2 w-24 h-24 flex items-center justify-center pointer-events-none transition-colors duration-200 ${i % 2 === 0 ? 'text-primary/20 dark:text-primary/10' : 'text-secondary/20 dark:text-secondary/10'}`}>
                                    <Icon className="w-full h-full" strokeWidth={1.5} />
                                </div>
                                {/* Botón */}
                                <div className="mt-auto flex justify-center pt-2">
                                    <Skeleton
                                        width={160}
                                        height={36}
                                        borderRadius="8px"
                                        style={{
                                            background: i % 2 === 0
                                                ? 'rgba(156,35,39,0.15)'
                                                : 'rgba(244,126,31,0.15)',
                                            animation: 'none',
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Filter bar */}
                <div className="flex flex-wrap items-center gap-3 py-3">
                    <Skeleton width={120} height={36} borderRadius="9999px" />
                    <Skeleton width={140} height={36} borderRadius="9999px" />
                    <Skeleton width={130} height={36} borderRadius="9999px" />
                </div>

                {/* Charts grid — 2x2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-6 shadow-[0px_4px_10px_0px_rgba(0,0,0,0.30)] h-96 flex flex-col transition-colors"
                        >
                            {/* Chart title */}
                            <div className="flex justify-center mb-4">
                                <Skeleton width="45%" height={18} borderRadius="6px" />
                            </div>
                            {/* Chart area */}
                            <div className="flex-1 flex items-end justify-center gap-3 px-4 pb-4">
                                {/* Bar chart skeleton */}
                                {Array.from({ length: 5 }).map((_, barIdx) => {
                                    const heights = ['55%', '75%', '40%', '90%', '60%'];
                                    return (
                                        <div key={barIdx} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                                            <Skeleton
                                                width="70%"
                                                height={heights[barIdx]}
                                                borderRadius="6px 6px 0 0"
                                            />
                                            <Skeleton width="80%" height={10} borderRadius="4px" />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
