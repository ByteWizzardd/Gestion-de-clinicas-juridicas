'use client';

import { useState, useMemo } from 'react';
import CaseTools from "@/components/CaseTools/CaseTools";
import Table from "@/components/Table/Table";
import { motion } from 'motion/react';
import TableSkeleton from "@/components/ui/skeletons/TableSkeleton";

interface CatalogDetailClientProps {
    data: any[];
    columns: string[];
    addLabel: string;
    searchPlaceholder?: string;
    loading?: boolean;
    onAddClick?: () => void; // Handler for add button click
    // Filter options - can be provided or auto-generated
    filterField?: string; // Campo por el cual filtrar (ej: 'habilitado', 'nombre_estado')
    filterOptions?: { value: string; label: string }[];
    filterLabel?: string; // Label para el filtro (ej: 'Estado', 'Habilitado')
    autoGenerateFilter?: boolean; // Si es true, genera opciones automáticamente desde los datos
    disableFilter?: boolean; // Si es true, no muestra filtro aunque haya opciones
    renderActions?: (item: any) => React.ReactNode; // Custom render for actions column
    filterTarget?: 'estatus' | 'materia' | 'nucleo' | 'tramite'; // Explicitly map to CaseTools filter slot
    keys?: string[]; // Keys to display in the table
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
    loading = false,
    filterField,
    filterOptions,
    filterLabel = "Filtro",
    filterAllLabel,
    autoGenerateFilter = false,
    disableFilter = false,
    renderActions,
    filterTarget = 'estatus', // Default to estatus
    keys
}: CatalogDetailClientProps & { filterAllLabel?: string }) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterValue, setFilterValue] = useState('');
    const [estatusFilterValue, setEstatusFilterValue] = useState('');

    // Auto-generate filter options from data if requested
    const generatedFilterOptions = useMemo(() => {
        if (!autoGenerateFilter || !filterField || filterOptions) {
            return filterOptions || [];
        }

        const uniqueValues = new Set<string>();
        data.forEach((item: any) => {
            const value = item[filterField];
            if (value !== null && value !== undefined) {
                uniqueValues.add(value.toString());
            }
        });

        return Array.from(uniqueValues)
            .sort()
            .map(value => ({
                value: value,
                label: value
            }));
    }, [data, filterField, filterOptions, autoGenerateFilter]);

    const estatusOptions = useMemo(() => [
        { value: 'true', label: 'Habilitado' },
        { value: 'false', label: 'Deshabilitado' }
    ], []);

    // Filter data based on search and filter
    const filteredData = useMemo(() => {
        let result = data;
        if (filterValue && filterField) {
            result = result.filter((item: any) => {
                const fieldValue = item[filterField];
                if (typeof fieldValue === 'boolean') return fieldValue.toString() === filterValue;
                return fieldValue?.toString() === filterValue;
            });
        }
        if (estatusFilterValue) {
            result = result.filter((item: any) => {
                const status = item.habilitado ?? item.estatus ?? item.activo;
                return String(status) === estatusFilterValue;
            });
        }
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter((item: any) =>
                Object.values(item).some(value => value?.toString().toLowerCase().includes(query))
            );
        }
        return result;
    }, [data, searchQuery, filterValue, filterField, estatusFilterValue]);

    const hasFilter = !disableFilter && generatedFilterOptions.length > 0 && filterField;

    return (
        <div>
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
                        nucleoOptions: generatedFilterOptions,
                        nucleoLabel: filterLabel,
                        nucleoAllLabel: filterAllLabel
                    } : filterTarget === 'tramite' ? {
                        tramiteFilter: filterValue,
                        onTramiteChange: setFilterValue,
                        tramiteOptions: generatedFilterOptions
                    } : {
                        // Default to estatus
                        estatusFilter: filterValue,
                        onEstatusChange: setFilterValue,
                        estatusOptions: generatedFilterOptions,
                        estatusLabel: filterLabel
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
            {loading ? (
                <TableSkeleton columns={columns.length} rows={10} />
            ) : (
                <Table
                    data={filteredData}
                    columns={columns}
                    renderRowActions={renderActions ? (item) => renderActions(item) : undefined}
                    keys={keys}
                />
            )}
        </div>
    );
}
