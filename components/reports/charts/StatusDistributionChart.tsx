'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, TooltipProps } from 'recharts';

interface StatusDistributionData {
    name: string;
    value: number;
    color: string;
}

interface StatusDistributionChartProps {
    data: StatusDistributionData[];
}

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
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

export default function StatusDistributionChart({ data }: StatusDistributionChartProps) {
    // Transform data to match Recharts expected format
    const chartData = data.map(item => ({
        name: item.name,
        value: item.value,
        fill: item.color
    }));

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-medium text-foreground mb-4 text-center">Distribución por Estatus</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
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
                        formatter={(value) => <span className="text-sm">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
