'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

interface StatusDistributionData {
    name: string;
    value: number;
    color: string;
}

interface StatusDistributionChartProps {
    data: StatusDistributionData[];
}

export default function StatusDistributionChart({ data }: StatusDistributionChartProps) {
    // Transform data to match Recharts expected format
    const chartData = data.map(item => ({
        name: item.name,
        value: item.value,
        fill: item.color
    }));

    const total = chartData?.reduce((sum, item) => sum + item.value, 0) || 0;

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const value = payload[0].value;
            const percent = total > 0 ? (value / total) * 100 : 0;
            return (
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-3 shadow-lg transition-colors">
                    <p className="text-sm font-medium text-[var(--card-text-muted)] mb-1">{payload[0].name}</p>
                    <p className="text-base font-semibold text-[var(--card-text)]">
                        {value} ({percent.toFixed(1)}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDark = mounted && theme === 'dark';

    return (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-4 sm:p-6 shadow-sm w-full min-w-0 overflow-hidden transition-colors">
            <h3 className="text-lg sm:text-xl font-medium text-[var(--foreground)] mb-4 text-center transition-colors">Distribución por Estatus</h3>
            {(!chartData || chartData.length === 0 || chartData.every(item => item.value === 0)) ? (
                <div className="h-[300px] w-full flex items-center justify-center">
                    <p className="text-[var(--card-text-muted)] text-sm transition-colors">No hay casos con los filtros seleccionados</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius="75%"
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value) => <span className="text-sm text-[var(--card-text)] transition-colors">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
