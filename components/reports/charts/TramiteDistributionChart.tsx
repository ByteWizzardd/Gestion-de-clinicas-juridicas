'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

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
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg z-50">
                    <p className="text-sm font-medium text-gray-700 mb-1">{payload[0].name}</p>
                    <p className="text-base font-semibold text-gray-900">
                        {value} ({(percent * 100).toFixed(1)}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm flex flex-col h-full min-h-[400px] w-full min-w-0 overflow-hidden">
            <h3 className="text-lg sm:text-xl font-medium text-foreground mb-6 text-center">Distribución por Trámite</h3>
            {(!data || data.length === 0 || data.every(item => item.value === 0)) ? (
                <div className="grow flex items-center justify-center">
                    <p className="text-gray-500 text-sm">No hay casos con los filtros seleccionados</p>
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
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                layout="horizontal"
                                verticalAlign="bottom"
                                align="center"
                                wrapperStyle={{ fontSize: '12px', marginTop: '20px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
