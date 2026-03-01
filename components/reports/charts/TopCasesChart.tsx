'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

interface TopCasesData {
    name: string;
    value: number;
}

interface TopCasesChartProps {
    data: TopCasesData[];
}

const COLORS = [
    '#8979ff', '#ff928a', '#3cc3df', '#ffae4c', '#537ff1',
    '#6fd195', '#8c63da', '#2bb7dc', '#1f94ff', '#f4cf3b',
    '#55c4ae', '#6186cc',
];

export default function TopCasesChart({ data }: TopCasesChartProps) {
    const total = data?.reduce((sum, item) => sum + item.value, 0) || 0;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const value = payload[0].value;
            const percent = total > 0 ? (value / total) * 100 : 0;
            return (
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-3 shadow-lg transition-colors">
                    <p className="text-sm font-medium text-[var(--card-text-muted)] mb-1">{label}</p>
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
    const gridColor = isDark ? '#374151' : '#e5e7eb';
    const axisColor = isDark ? '#9ca3af' : '#6b7280';
    const lineStroke = isDark ? '#4b5563' : '#d1d5db';

    return (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-4 sm:p-6 shadow-sm w-full min-w-0 overflow-hidden transition-colors">
            <h3 className="text-lg sm:text-xl font-medium text-[var(--foreground)] mb-4 text-center transition-colors">Top 5 Tipos de Caso (Materia)</h3>
            {(!data || data.length === 0 || data.every(item => item.value === 0)) ? (
                <div className="h-[300px] w-full flex items-center justify-center">
                    <p className="text-[var(--card-text-muted)] text-sm transition-colors">No hay casos con los filtros seleccionados</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                        <XAxis
                            dataKey="name"
                            tick={{ fill: axisColor, fontSize: 12 }}
                            axisLine={{ stroke: lineStroke }}
                        />
                        <YAxis
                            tick={{ fill: axisColor, fontSize: 12 }}
                            axisLine={{ stroke: lineStroke }}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                        />
                        <Bar
                            dataKey="value"
                            radius={[8, 8, 0, 0]}
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
