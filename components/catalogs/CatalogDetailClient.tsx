'use client';

import { useState, useMemo } from 'react';
import CaseTools from "@/components/CaseTools/CaseTools";
import Table from "@/components/Table/Table";

interface CatalogDetailClientProps {
    data: any[];
    columns: string[];
    addLabel: string;
    searchPlaceholder?: string;
    // Filter options - can be provided or auto-generated
    filterField?: string; // Campo por el cual filtrar (ej: 'habilitado', 'nombre_estado')
    filterOptions?: { value: string; label: string }[];
    filterLabel?: string; // Label para el filtro (ej: 'Estado', 'Habilitado')
    autoGenerateFilter?: boolean; // Si es true, genera opciones automáticamente desde los datos
}

export default function CatalogDetailClient({
    data,
    columns,
    addLabel,
    searchPlaceholder = "Buscar...",
    filterField,
    filterOptions,
    filterLabel = "Filtro",
    autoGenerateFilter = false
}: CatalogDetailClientProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterValue, setFilterValue] = useState('');

    // Auto-generate filter options from data if requested
    const generatedFilterOptions = useMemo(() => {
        if (!autoGenerateFilter || !filterField || filterOptions) {
            return filterOptions || [];
        }

        // Extract unique values from the filter field
        const uniqueValues = new Set<string>();
        data.forEach((item: any) => {
            const value = item[filterField];
            if (value !== null && value !== undefined) {
                uniqueValues.add(value.toString());
            }
        });

        // Convert to options array
        return Array.from(uniqueValues)
            .sort()
            .map(value => ({
                value: value,
                label: value
            }));
    }, [data, filterField, filterOptions, autoGenerateFilter]);

    // Filter data based on search and filter
    const filteredData = useMemo(() => {
        let result = data;

        // Apply filter if configured
        if (filterValue && filterField) {
            result = result.filter((item: any) => {
                const fieldValue = item[filterField];
                // Handle boolean values
                if (typeof fieldValue === 'boolean') {
                    return fieldValue.toString() === filterValue;
                }
                return fieldValue?.toString() === filterValue;
            });
        }

        // Apply search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter((item: any) => {
                // Search in all values of the object
                return Object.values(item).some(value =>
                    value?.toString().toLowerCase().includes(query)
                );
            });
        }

        return result;
    }, [data, searchQuery, filterValue, filterField]);

    // Only show filter if options are available
    const hasFilter = generatedFilterOptions.length > 0 && filterField;

    return (
        <>
            <CaseTools
                addLabel={addLabel}
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                {...(hasFilter && {
                    estatusFilter: filterValue,
                    onEstatusChange: setFilterValue,
                    estatusOptions: generatedFilterOptions,
                    tramiteFilter: '',
                    onTramiteChange: () => { },
                    tramiteOptions: []
                })}
            />
            <div className="mt-10"></div>
            <Table
                data={filteredData}
                columns={columns}
            />
        </>
    );
}
