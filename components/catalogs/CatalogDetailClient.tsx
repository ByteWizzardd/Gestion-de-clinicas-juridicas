'use client';

import { useState, useMemo } from 'react';
import CaseTools from "@/components/CaseTools/CaseTools";
import Table from "@/components/Table/Table";

interface CatalogDetailClientProps {
    data: any[];
    columns: string[];
    addLabel: string;
    searchPlaceholder?: string;
    onAddClick?: () => void; // Handler for add button click
    // Filter options - can be provided or auto-generated
    filterField?: string; // Campo por el cual filtrar (ej: 'habilitado', 'nombre_estado')
    filterOptions?: { value: string; label: string }[];
    filterLabel?: string; // Label para el filtro (ej: 'Estado', 'Habilitado')
    autoGenerateFilter?: boolean; // Si es true, genera opciones automáticamente desde los datos
    disableFilter?: boolean; // Si es true, no muestra filtro aunque haya opciones
    renderActions?: (item: any) => React.ReactNode; // Custom render for actions column
    filterTarget?: 'estatus' | 'materia' | 'nucleo' | 'tramite'; // Explicitly map to CaseTools filter slot
}

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function CatalogDetailClient({
    data,
    columns,
    addLabel,
    searchPlaceholder = "Buscar...",
    onAddClick,
    filterField,
    filterOptions,
    filterLabel = "Filtro",
    autoGenerateFilter = false,
    disableFilter = false,
    renderActions,
    filterTarget = 'estatus' // Default to estatus
}: CatalogDetailClientProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterValue, setFilterValue] = useState('');
    const [estatusFilterValue, setEstatusFilterValue] = useState('');

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

    const estatusOptions = [
        { value: 'true', label: 'Habilitado' },
        { value: 'false', label: 'Deshabilitado' }
    ];



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

        // Apply estatus filter
        if (estatusFilterValue) {
            result = result.filter((item: any) => {
                const status = item.habilitado ?? item.estatus ?? item.activo;
                return String(status) === estatusFilterValue;
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
    }, [data, searchQuery, filterValue, filterField, estatusFilterValue]);

    const hasFilter = !disableFilter && generatedFilterOptions.length > 0 && filterField;

    return (
        <>
            <div className="mb-4">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/dashboard/administration')}
                    className="flex items-center gap-2 px-2 hover:bg-gray-100"
                    size="sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Volver a administración</span>
                </Button>
            </div>
            <CaseTools
                addLabel={addLabel}
                onAddClick={onAddClick}
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                {...(hasFilter && {
                    // Map filter functionality based on filterTarget
                    ...(filterTarget === 'materia' ? {
                        materiaFilter: filterValue,
                        onMateriaChange: setFilterValue,
                        materias: generatedFilterOptions.map(opt => ({
                            id_materia: opt.value as any,
                            nombre_materia: opt.label
                        }))
                    } : filterTarget === 'nucleo' ? {
                        nucleoFilter: filterValue,
                        onNucleoChange: setFilterValue,
                        nucleoOptions: generatedFilterOptions
                    } : filterTarget === 'tramite' ? {
                        tramiteFilter: filterValue,
                        onTramiteChange: setFilterValue,
                        tramiteOptions: generatedFilterOptions
                    } : {
                        // Default to estatus
                        estatusFilter: filterValue,
                        onEstatusChange: setFilterValue,
                        estatusOptions: generatedFilterOptions
                    }),
                    // Standard Estatus Filter (if not primary target)
                    ...(filterTarget !== 'estatus' ? {
                        estatusFilter: estatusFilterValue,
                        onEstatusChange: setEstatusFilterValue,
                        estatusOptions: estatusOptions
                    } : {})
                })}
            />
            <div className="mt-10"></div>
            <Table
                data={filteredData}
                columns={columns}
                renderRowActions={renderActions ? (item) => renderActions(item) : undefined}
            />
        </>
    );
}
