'use client';

import { useEffect, useState } from 'react';
import Select from '@/components/forms/Select';
import ViewSwitcher, { ViewMode } from '../ui/navigation/ViewSwitcher';
import { Calendar } from 'lucide-react';

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

interface FilterOptions {
    dateRangeOptions: { value: string; label: string }[];
    nucleoOptions: { value: string; label: string }[];
    termOptions: { value: string; label: string }[];
}

export default function FilterBar({
    filters,
    onFilterChange,
    viewMode,
    onViewModeChange
}: FilterBarProps) {
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        dateRangeOptions: [{ value: 'last-month', label: 'Último mes' }],
        nucleoOptions: [{ value: 'all', label: 'Todos los núcleos' }],
        termOptions: [{ value: 'all', label: 'Todos los periodos' }],
    });

    useEffect(() => {
        // Fetch filter options from server action
        const fetchFilterOptions = async () => {
            try {
                const { getFilterOptions } = await import('@/app/actions/reports');
                const result = await getFilterOptions();

                if (result.success && result.data) {
                    setFilterOptions(result.data);
                }
            } catch (error) {
                console.error('Error fetching filter options:', error);
            }
        };

        fetchFilterOptions();
    }, []);

    const handleFilterUpdate = (key: keyof ReportFilters, value: string) => {
        onFilterChange({ ...filters, [key]: value });
    };

    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-4 justify-between w-full min-w-0">
            {/* Filters Section */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3 flex-1 min-w-0">
                <div className="flex-1 sm:flex-initial sm:min-w-0 sm:max-w-[320px] w-full">
                    <Select
                        options={filterOptions.dateRangeOptions}
                        value={filters.dateRange}
                        onChange={(e) => handleFilterUpdate('dateRange', e.target.value)}
                        placeholder="Rango de Fechas"
                        className="text-md w-full"
                        icon={<Calendar className="w-5 h-5 text-neutral-700" />}
                    />
                </div>

                <div className="flex-1 sm:flex-initial sm:min-w-0 sm:max-w-[280px] w-full">
                    <Select
                        options={filterOptions.nucleoOptions}
                        value={filters.nucleo}
                        onChange={(e) => handleFilterUpdate('nucleo', e.target.value)}
                        placeholder="Núcleo"
                        className="text-md w-full"
                    />
                </div>

                <div className="flex-1 sm:flex-initial sm:min-w-0 sm:max-w-[300px] w-full">
                    <Select
                        options={filterOptions.termOptions}
                        value={filters.term}
                        onChange={(e) => handleFilterUpdate('term', e.target.value)}
                        placeholder="TERM - Periodo"
                        className="text-md w-full"
                    />
                </div>
            </div>

            {/* View Switcher */}
            <div className="flex-shrink-0 w-full sm:w-auto flex justify-start sm:justify-end">
                <ViewSwitcher
                    activeView={viewMode}
                    onViewChange={onViewModeChange}
                />
            </div>
        </div>
    );
}
