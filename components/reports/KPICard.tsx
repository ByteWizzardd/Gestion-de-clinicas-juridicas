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
    const variantStyles = {
        default: 'bg-gradient-to-br from-gray-50 to-white border-gray-200',
        success: 'bg-gradient-to-br from-green-50 to-white border-green-200',
        warning: 'bg-gradient-to-br from-orange-50 to-white border-orange-200',
        danger: 'bg-gradient-to-br from-red-50 to-white border-red-200'
    };

    const iconBgStyles = {
        default: 'bg-gray-100 text-gray-600',
        success: 'bg-green-100 text-green-600',
        warning: 'bg-orange-100 text-orange-600',
        danger: 'bg-red-100 text-red-600'
    };

    const trendStyles = {
        up: 'text-green-600',
        down: 'text-red-600',
        neutral: 'text-gray-600'
    };

    return (
        <div className={`${variantStyles[variant]} border-2 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-start justify-between gap-4">
                {/* Left Content */}
                <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">{title}</h3>

                    {/* Main Value */}
                    <div className="mb-2">
                        <div className="text-4xl font-bold text-foreground">{mainValue}</div>
                        {mainLabel && (
                            <div className="text-sm text-gray-600 mt-1">{mainLabel}</div>
                        )}
                    </div>

                    {/* Context/Trend */}
                    <div className="flex items-center gap-2 mb-3">
                        {trend && trendValue && (
                            <span className={`text-sm font-semibold ${trendStyles[trend]}`}>
                                {trendValue}
                            </span>
                        )}
                        <span className="text-sm text-gray-600">{contextText}</span>
                    </div>

                    {/* Detail Text */}
                    {detailText && (
                        <div className="text-sm text-gray-500 mt-2 pt-2 border-t border-gray-200">
                            {detailText}
                        </div>
                    )}
                </div>

                {/* Right Icon */}
                <div className={`${iconBgStyles[variant]} p-4 rounded-xl flex-shrink-0`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
