'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
            <h3 className="text-xl font-medium text-foreground mb-4 text-center">Top 5 Tipos de Caso (Materia)</h3>
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
                            cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                        />
                        <Bar
                            dataKey="value"
                            radius={[8, 8, 0, 0]}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
