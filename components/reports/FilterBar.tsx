'use client';

import Select from '../ui/Select';
import ViewSwitcher, { ViewMode } from '../ui/ViewSwitcher';
import { CalendarIcon } from '@heroicons/react/24/outline';

export interface ReportFilters {
    dateRange: string;
    nucleo: string;
    term: string;
}

interface FilterBarProps {
    filters: ReportFilters;
    onFilterChange: (filters: ReportFilters) => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
}

export default function FilterBar({
    filters,
    onFilterChange,
    viewMode,
    onViewModeChange
}: FilterBarProps) {
    const handleFilterUpdate = (key: keyof ReportFilters, value: string) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const dateRangeOptions = [
        { value: 'last-week', label: 'Última semana' },
        { value: 'last-month', label: 'Último mes' },
        { value: 'last-quarter', label: 'Último trimestre' },
        { value: 'last-year', label: 'Último año' },
        { value: 'custom', label: 'Personalizado' }
    ];

    const nucleoOptions = [
        { value: 'all', label: 'Todos los núcleos' },
        { value: 'nucleo-1', label: 'Núcleo 1' },
        { value: 'nucleo-2', label: 'Núcleo 2' },
        { value: 'nucleo-3', label: 'Núcleo 3' },
        { value: 'nucleo-4', label: 'Núcleo 4' }
    ];

    const termOptions = [
        { value: 'all', label: 'Todos los periodos' },
        { value: '2024-1', label: '2024-1' },
        { value: '2024-2', label: '2024-2' },
        { value: '2023-2', label: '2023-2' },
        { value: '2023-1', label: '2023-1' }
    ];

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex flex-wrap items-end gap-4">
                {/* Filters Section */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-w-0">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <Select
                            options={dateRangeOptions}
                            value={filters.dateRange}
                            onChange={(e) => handleFilterUpdate('dateRange', e.target.value)}
                            placeholder="Rango de Fechas"
                            className="text-sm"
                        />
                    </div>

                    <Select
                        options={nucleoOptions}
                        value={filters.nucleo}
                        onChange={(e) => handleFilterUpdate('nucleo', e.target.value)}
                        placeholder="Núcleo"
                        className="text-sm"
                    />

                    <Select
                        options={termOptions}
                        value={filters.term}
                        onChange={(e) => handleFilterUpdate('term', e.target.value)}
                        placeholder="TERM - Periodo"
                        className="text-sm"
                    />
                </div>

                {/* View Switcher */}
                <div className="flex-shrink-0">
                    <ViewSwitcher
                        activeView={viewMode}
                        onViewChange={onViewModeChange}
                    />
                </div>
            </div>
        </div>
    );
}
