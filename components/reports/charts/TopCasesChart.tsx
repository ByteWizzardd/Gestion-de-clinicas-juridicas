'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';

interface TopCasesData {
    name: string;
    value: number;
}

interface TopCasesChartProps {
    data: TopCasesData[];
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
                <p className="text-base font-semibold text-gray-900">{payload[0].value}</p>
            </div>
        );
    }
    return null;
};

export default function TopCasesChart({ data }: TopCasesChartProps) {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-medium text-foreground mb-4 text-center">Top 5 Tipos de Caso (Materia)</h3>
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
                        fill="#6366F1"
                        radius={[8, 8, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
