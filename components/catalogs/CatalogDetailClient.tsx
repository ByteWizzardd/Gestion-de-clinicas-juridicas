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
    hideBackButton?: boolean; // If true, hides the default back button
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
    keys,
    hideHeader = false,
    hideBackButton = false
}: CatalogDetailClientProps & { filterAllLabel?: string; hideHeader?: boolean }) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterValue, setFilterValue] = useState('');
    const [estatusFilterValue, setEstatusFilterValue] = useState('');

    // Auto-generate filter options from data if requested
    const generatedFilterOptions = useMemo(() => {
        if (disableFilter || !filterField || filterOptions) {
            return disableFilter ? [] : (filterOptions || []);
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
    }, [data, filterField, filterOptions, disableFilter]);

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

    // El filtro de estatus SIEMPRE debería aparecer a menos que se deshabilite explícitamente y no haya otros.
    // Actualmente, 'hasFilter' requiere que haya un `filterField` Y opciones autogeneradas Opciones pasadas por prop.
    // Necesitamos asegurarnos de que el filtro siempre aparezca a menos que desactivemos los filtros o no tengamos *ningún* filtro que mostrar.
    // Si queremos que el filtro principal (materia, nucleo, etc) se oculte, necesitamos usar disableFilter={true} desde la página o hacer comprobación sobre generatedFilterOptions

    // Mostramos el componente de filtro si:
    // 1. NO estamos deshabilitando explícitamente el filtro `!disableFilter`
    // 2. Y hay al menos Opciones principales qué mostrar (ya sea auto-generadas, prop `filterOptions` o mediante el `filterField`) o si está cargando y esperamos opciones predeterminadas
    const hasFilter = !disableFilter && (
        (filterField && (generatedFilterOptions.length > 0 || (loading && (autoGenerateFilter || filterOptions)))) ||
        (!filterField && disableFilter === false) // Si no hay filterField pero no hemos deshabilitado el filtro por completo, podríamos mostrar solo el estatus (aunque CaseTools exige al menos uno principal, mejor dejar validación con filterField || si queremos habilitar estatus independientemente)
    );

    // Ajuste final más simple para el caso del cliente:
    // Si autoGenerateFilter es falso, filterField es null y filterOptions está vacío, NO debe mostrar filtro adicional.
    const shouldShowFilter = !disableFilter && (
        (filterField && generatedFilterOptions.length > 0) ||
        (loading && filterField && (autoGenerateFilter || !!filterOptions))
    );

    return (
        <div>
            {!hideBackButton && (
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
            )}
            <CaseTools
                addLabel={addLabel}
                onAddClick={onAddClick}
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder={searchPlaceholder}
                {...(shouldShowFilter && {
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
