'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface GenderDistributionData {
    name: string;
    value: number;
    color: string;
}

interface GenderDistributionChartProps {
    data: GenderDistributionData[];
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">{payload[0].name}</p>
                <p className="text-base font-semibold text-gray-900">{payload[0].value}</p>
            </div>
        );
    }
    return null;
};

export default function GenderDistributionChart({ data }: GenderDistributionChartProps) {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-medium text-foreground mb-4 text-center">Género de Solicitantes</h3>
            {(!data || data.length === 0 || data.every(item => item.value === 0)) ? (
                <div className="h-[300px] w-full flex items-center justify-center">
                    <p className="text-gray-500 text-sm">No hay casos con los filtros seleccionados</p>
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
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value) => <span className="text-sm">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
