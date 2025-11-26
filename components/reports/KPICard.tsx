'use client';

interface KPICardProps {
    title: string;
    mainValue: string;
    mainLabel?: string;
    contextText: string;
    detailText?: string;
    icon: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger';
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
}

export default function KPICard({
    title,
    mainValue,
    mainLabel,
    contextText,
    detailText,
    icon,
    variant = 'default',
    trend,
    trendValue
}: KPICardProps) {
    // Subtle pastel backgrounds matching reference
    const variantStyles = {
        default: 'bg-orange-50/30 border-gray-200',
        success: 'bg-green-50/40 border-green-100',
        warning: 'bg-orange-50/40 border-orange-100',
        danger: 'bg-red-50/40 border-red-100'
    };

    // Large semi-transparent circular icon backgrounds
    const iconBgStyles = {
        default: 'bg-orange-200/30 text-orange-400',
        success: 'bg-green-200/30 text-green-400',
        warning: 'bg-orange-200/30 text-orange-400',
        danger: 'bg-red-200/30 text-red-400'
    };

    const trendStyles = {
        up: 'text-green-600',
        down: 'text-red-600',
        neutral: 'text-gray-600'
    };

    return (
        <div className={`${variantStyles[variant]} border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden`}>
            {/* Large decorative icon in top-right corner */}
            <div className={`absolute -top-4 -right-4 ${iconBgStyles[variant]} p-8 rounded-full opacity-60`}>
                {icon}
            </div>

            {/* Content */}
            <div className="relative z-10">
                {/* Title */}
                <h3 className="text-base font-semibold text-gray-700 mb-4">{title}</h3>

                {/* Main Value */}
                <div className="mb-3">
                    <div className="text-4xl font-bold text-gray-900">{mainValue}</div>
                    {mainLabel && (
                        <div className="text-sm text-gray-600 mt-1 font-medium">{mainLabel}</div>
                    )}
                </div>

                {/* Context/Trend */}
                <div className="mb-3">
                    {trend && trendValue && (
                        <span className={`text-sm font-semibold ${trendStyles[trend]} mr-2`}>
                            {trendValue}
                        </span>
                    )}
                    <span className="text-sm text-gray-600">{contextText}</span>
                </div>

                {/* Detail Text */}
                {detailText && (
                    <div className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200/50">
                        {detailText}
                    </div>
                )}
            </div>
        </div>
    );
}
