// Mock data for reports dashboard

export interface DistributionData {
    name: string;
    value: number;
    color: string;
}

export interface TopCasesData {
    name: string;
    value: number;
}

// Distribution by Origin data
export const distributionData: DistributionData[] = [
    { name: 'Civil Bienestar', value: 15, color: '#00CED1' },
    { name: 'UGAL-DY', value: 22, color: '#9C27B0' }
];

// Top 5 Case Types data
export const topCasesData: TopCasesData[] = [
    { name: 'Civil', value: 5 },
    { name: 'Familiar', value: 45 },
    { name: 'Laboral', value: 25 },
    { name: 'Otro', value: 35 }
];

// Filter data by parameters (simulated filtering)
export function filterDataByParams(
    data: DistributionData[] | TopCasesData[],
    nucleo: string,
    term: string,
    dateRange: string
): typeof data {
    // In a real application, this would filter based on actual parameters
    // For now, we'll return the same data to demonstrate the structure

    // You can add logic here to modify data based on filters
    // For example, reduce values by a factor based on the selected nucleo
    if (nucleo !== 'all') {
        return data.map(item => ({
            ...item,
            value: Math.floor(item.value * 0.7) // Simulate filtered data
        }));
    }

    return data;
}

// Simulated data for different nucleos
export const nucleoDistributionData: Record<string, DistributionData[]> = {
    'all': distributionData,
    'nucleo-1': [
        { name: 'Civil Bienestar', value: 8, color: '#00CED1' },
        { name: 'UGAL-DY', value: 12, color: '#9C27B0' }
    ],
    'nucleo-2': [
        { name: 'Civil Bienestar', value: 4, color: '#00CED1' },
        { name: 'UGAL-DY', value: 6, color: '#9C27B0' }
    ],
    'nucleo-3': [
        { name: 'Civil Bienestar', value: 2, color: '#00CED1' },
        { name: 'UGAL-DY', value: 3, color: '#9C27B0' }
    ],
    'nucleo-4': [
        { name: 'Civil Bienestar', value: 1, color: '#00CED1' },
        { name: 'UGAL-DY', value: 1, color: '#9C27B0' }
    ]
};

export const nucleoTopCasesData: Record<string, TopCasesData[]> = {
    'all': topCasesData,
    'nucleo-1': [
        { name: 'Civil', value: 3 },
        { name: 'Familiar', value: 25 },
        { name: 'Laboral', value: 15 },
        { name: 'Otro', value: 20 }
    ],
    'nucleo-2': [
        { name: 'Civil', value: 1 },
        { name: 'Familiar', value: 12 },
        { name: 'Laboral', value: 6 },
        { name: 'Otro', value: 10 }
    ],
    'nucleo-3': [
        { name: 'Civil', value: 1 },
        { name: 'Familiar', value: 6 },
        { name: 'Laboral', value: 3 },
        { name: 'Otro', value: 4 }
    ],
    'nucleo-4': [
        { name: 'Civil', value: 0 },
        { name: 'Familiar', value: 2 },
        { name: 'Laboral', value: 1 },
        { name: 'Otro', value: 1 }
    ]
};
