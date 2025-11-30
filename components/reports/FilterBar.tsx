'use client';

import Select from '../ui/Select';
import ViewSwitcher, { ViewMode } from '../ui/ViewSwitcher';
import { CalendarIcon } from '@heroicons/react/24/solid';

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

    const dateRangeOptions: { value: string; label: string }[] = [];
    const nucleoOptions: { value: string; label: string }[] = [];
    const termOptions: { value: string; label: string }[] = [];

    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-4 justify-between">
            {/* Filters Section */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3 flex-1">
                <div className="flex-1 sm:flex-initial sm:w-[320px]">
                    <Select
                        options={dateRangeOptions}
                        value={filters.dateRange}
                        onChange={(e) => handleFilterUpdate('dateRange', e.target.value)}
                        placeholder="Rango de Fechas"
                        className="text-sm w-full"
                        icon={<CalendarIcon className="w-5 h-5 text-neutral-700" />}
                    />
                </div>

                <div className="flex-1 sm:flex-initial sm:w-[280px]">
                    <Select
                        options={nucleoOptions}
                        value={filters.nucleo}
                        onChange={(e) => handleFilterUpdate('nucleo', e.target.value)}
                        placeholder="Núcleo"
                        className="text-sm w-full"
                    />
                </div>

                <div className="flex-1 sm:flex-initial sm:w-[300px]">
                    <Select
                        options={termOptions}
                        value={filters.term}
                        onChange={(e) => handleFilterUpdate('term', e.target.value)}
                        placeholder="TERM - Periodo"
                        className="text-sm w-full"
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
