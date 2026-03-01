'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

interface TramiteData {
    name: string;
    value: number;
    [key: string]: any;
}

interface TramiteDistributionChartProps {
    data: TramiteData[];
}

const COLORS = [
    '#0EA5E9', // Sky 500
    '#22C55E', // Green 500
    '#EAB308', // Yellow 500
    '#F97316', // Orange 500
    '#EF4444', // Red 500
    '#A855F7', // Purple 500
    '#EC4899', // Pink 500
    '#6366F1', // Indigo 500
    '#14B8A6', // Teal 500
    '#8B5CF6', // Violet 500
];

export default function TramiteDistributionChart({ data }: TramiteDistributionChartProps) {
    const total = data?.reduce((sum, item) => sum + item.value, 0) || 0;

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const value = payload[0].value;
            const percent = total > 0 ? (value / total) : 0;

            return (
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-3 shadow-lg z-50 transition-colors">
                    <p className="text-sm font-medium text-[var(--card-text-muted)] mb-1">{payload[0].name}</p>
                    <p className="text-base font-semibold text-[var(--card-text)]">
                        {value} ({(percent * 100).toFixed(1)}%)
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
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-4 sm:p-6 shadow-sm flex flex-col h-full min-h-[400px] w-full min-w-0 overflow-hidden transition-colors">
            <h3 className="text-lg sm:text-xl font-medium text-[var(--foreground)] mb-6 text-center transition-colors">Distribución por Trámite</h3>
            {(!data || data.length === 0 || data.every(item => item.value === 0)) ? (
                <div className="grow flex items-center justify-center">
                    <p className="text-[var(--card-text-muted)] text-sm transition-colors">No hay casos con los filtros seleccionados</p>
                </div>
            ) : (
                <div className="grow w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius="45%"
                                outerRadius="75%"
                                fill="#8884d8"
                                paddingAngle={0}
                                stroke="var(--card-bg)"
                                strokeWidth={2}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="var(--card-bg)" strokeWidth={2} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                layout="horizontal"
                                verticalAlign="bottom"
                                align="center"
                                wrapperStyle={{ fontSize: '12px', marginTop: '20px' }}
                                formatter={(value) => <span className="text-[var(--card-text)] transition-colors">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
