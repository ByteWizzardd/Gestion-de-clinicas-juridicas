'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DistributionData {
    name: string;
    value: number;
    color: string;
}

interface DistributionChartProps {
    data: DistributionData[];
}

export default function DistributionChart({ data }: DistributionChartProps) {
    const total = data?.reduce((sum, item) => sum + item.value, 0) || 0;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const value = payload[0].value;
            const percent = total > 0 ? (value / total) * 100 : 0;
            return (
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                    <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
                    <p className="text-base font-semibold text-gray-900">
                        {value} ({percent.toFixed(1)}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-medium text-foreground mb-4 text-center">Distribución por Origen</h3>
            {(!data || data.length === 0 || data.every(item => item.value === 0)) ? (
                <div className="h-[300px] w-full flex items-center justify-center">
                    <p className="text-gray-500 text-sm">No hay casos con los filtros seleccionados</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="name"
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            axisLine={{ stroke: '#d1d5db' }}
                        />
                        <YAxis
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            axisLine={{ stroke: '#d1d5db' }}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: 'rgba(156, 35, 39, 0.1)' }}
                        />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
