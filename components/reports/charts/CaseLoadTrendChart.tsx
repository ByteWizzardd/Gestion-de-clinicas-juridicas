'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getStatusNamesFromTrend } from '@/lib/utils/reports-data-mapper';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

interface CaseLoadTrendData {
    mes: string;
    [key: string]: number | string;
}

interface CaseLoadTrendChartProps {
    data: CaseLoadTrendData[];
}

// Color mapping for status lines
const STATUS_LINE_COLORS: Record<string, string> = {
    'En proceso': '#4A90E2',
    'Archivado': '#7B68EE',
    'Entregado': '#50C878',
    'Asesoría': '#D2691E',
    'Sin estatus': '#9E9E9E',
};

export default function CaseLoadTrendChart({ data }: CaseLoadTrendChartProps) {
    // Get unique status names from data
    const statusNames = getStatusNamesFromTrend(data);

    // Format month labels (YYYY-MM to short format)
    const formattedData = data.map(item => ({
        ...item,
        mesLabel: item.mes.toString().substring(5) // Get MM part
    }));

    const hasData = data && data.length > 0 && data.some(item => {
        // Check if any status count is > 0
        return Object.keys(item).some(key => key !== 'mes' && typeof item[key] === 'number' && (item[key] as number) > 0);
    });

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
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-6 shadow-sm transition-colors">
            <h3 className="text-xl font-medium text-[var(--foreground)] mb-4 text-center transition-colors">Tendencia de Carga de Casos</h3>
            {!hasData ? (
                <div className="h-[300px] w-full flex items-center justify-center">
                    <p className="text-[var(--card-text-muted)] text-sm transition-colors">No hay casos con los filtros seleccionados</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                        <XAxis
                            dataKey="mesLabel"
                            tick={{ fill: axisColor, fontSize: 12 }}
                            axisLine={{ stroke: lineStroke }}
                        />
                        <YAxis
                            tick={{ fill: axisColor, fontSize: 12 }}
                            axisLine={{ stroke: lineStroke }}
                        />
                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-3 shadow-lg z-50 transition-colors">
                                            <p className="text-sm font-medium text-[var(--card-text-muted)] mb-2">{label}</p>
                                            {payload.map((entry, index) => (
                                                <p key={index} className="text-base font-semibold text-[var(--card-text)]">
                                                    {entry.name}: {entry.value}
                                                </p>
                                            ))}
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value) => <span className="text-sm text-[var(--card-text)] transition-colors">{value}</span>}
                        />
                        {statusNames.map((status) => (
                            <Line
                                key={status}
                                type="monotone"
                                dataKey={status}
                                stroke={STATUS_LINE_COLORS[status] || '#9E9E9E'}
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
