'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

interface GenderDistributionData {
    name: string;
    value: number;
    color: string;
    [key: string]: any;
}

interface GenderDistributionChartProps {
    data: GenderDistributionData[];
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-3 shadow-lg transition-colors">
                <p className="text-sm font-medium text-[var(--card-text-muted)] mb-1">{payload[0].name}</p>
                <p className="text-base font-semibold text-[var(--card-text)]">{payload[0].value}</p>
            </div>
        );
    }
    return null;
};

export default function GenderDistributionChart({ data }: GenderDistributionChartProps) {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDark = mounted && theme === 'dark';
    return (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-6 shadow-sm transition-colors">
            <h3 className="text-xl font-medium text-[var(--foreground)] mb-4 text-center transition-colors">Género de Solicitantes</h3>
            {(!data || data.length === 0 || data.every(item => item.value === 0)) ? (
                <div className="h-[300px] w-full flex items-center justify-center">
                    <p className="text-[var(--card-text-muted)] text-sm transition-colors">No hay casos con los filtros seleccionados</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={0}
                            stroke="var(--card-bg)"
                            strokeWidth={2}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--card-bg)" strokeWidth={2} />
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
