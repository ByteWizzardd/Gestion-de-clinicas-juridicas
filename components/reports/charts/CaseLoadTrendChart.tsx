'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getStatusNamesFromTrend } from '@/lib/utils/reports-data-mapper';

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

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-medium text-foreground mb-4 text-center">Tendencia de Carga de Casos</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="mesLabel"
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        axisLine={{ stroke: '#d1d5db' }}
                    />
                    <YAxis
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        axisLine={{ stroke: '#d1d5db' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => <span className="text-sm">{value}</span>}
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
        </div>
    );
}
