'use client';

interface KPICardProps {
    title: string;
    mainValue: string;
    mainLabel?: string;
    contextText?: string;
    detailText?: string;
    description?: string;
    icon?: React.ReactNode;
    iconColor?: 'orange' | 'red';
    variant?: 'default' | 'success' | 'warning' | 'danger';
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    showRedLine?: boolean;
    mainValueSize?: '5xl' | '4xl' | '6xl';
}

export default function KPICard({
    title,
    mainValue,
    mainLabel,
    contextText,
    detailText,
    description,
    icon,
    iconColor = 'orange',
    variant = 'default',
    trend,
    trendValue,
    showRedLine = false,
    mainValueSize = '5xl'
}: KPICardProps) {
    return (
        <div className="bg-neutral-50 rounded-3xl shadow-[0px_4px_10px_0px_rgba(0,0,0,0.30)] p-4 relative overflow-hidden font-primary">
            {/* Large decorative icon in background - faint orange or red */}
            {icon && (
                <div className={`absolute top-0 right-0 overflow-hidden pointer-events-none ${iconColor === 'red' ? 'w-16 h-16' : 'w-10 h-10'}`}>
                    <div className={`${iconColor === 'red' ? 'bg-red-800/20 w-full h-full rounded-full' : 'bg-orange-500/20 w-full h-full'} transform ${iconColor === 'red' ? 'translate-x-4 -translate-y-5' : 'translate-x-6 -translate-y-4'}`}>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="relative z-10">
                {/* Title */}
                <h3 className="text-base font-normal text-neutral-800 mb-2">{title}</h3>

                {/* Red line separator (only for first card) */}
                {showRedLine && (
                    <div className="h-0.5 bg-red-800 mb-3 -mx-1"></div>
                )}

                {/* Description before main value (for card 2) */}
                {description && !detailText && !contextText && (
                    <div className="text-xs text-neutral-800/50 mb-2">
                        {description}
                    </div>
                )}

                {/* Main Value */}
                <div className="mb-2">
                    <div className={`${mainValueSize === '6xl' ? 'text-3xl' : mainValueSize === '5xl' ? 'text-2xl' : 'text-xl'} font-medium text-neutral-800`}>{mainValue}</div>
                    {mainLabel && (
                        <div className="text-xl font-medium text-neutral-800 mt-0.5">{mainLabel}</div>
                    )}
                </div>

                {/* Context/Trend */}
                {contextText && (
                    <div className="mb-1.5">
                        <span className="text-base text-neutral-800/50">{contextText}</span>
                    </div>
                )}

                {/* Detail Text */}
                {detailText && (
                    <div className={`${showRedLine ? 'text-base' : 'text-xs'} text-neutral-800/50 mb-1.5`}>
                        {detailText}
                    </div>
                )}

                {/* Description after main value (for cards 3 and 4) */}
                {description && (detailText || contextText) && (
                    <div className="text-xs text-neutral-800/50 mt-1.5">
                        {description}
                    </div>
                )}
            </div>
        </div>
    );
}
