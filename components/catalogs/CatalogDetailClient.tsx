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
    enableEstadoFilter?: boolean;
    enableMunicipioFilter?: boolean;
    enableParroquiaFilter?: boolean;
    enableCategoriaFilter?: boolean;
    enableSubcategoriaFilter?: boolean;
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
    hideBackButton = false,
    enableEstadoFilter = false,
    enableMunicipioFilter = false,
    enableParroquiaFilter = false,
    enableCategoriaFilter = false,
    enableSubcategoriaFilter = false
}: CatalogDetailClientProps & { filterAllLabel?: string; hideHeader?: boolean }) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterValue, setFilterValue] = useState('');
    const [estatusFilterValue, setEstatusFilterValue] = useState('');
    const [estadoFilterValue, setEstadoFilterValue] = useState('');
    const [municipioFilterValue, setMunicipioFilterValue] = useState('');
    const [parroquiaFilterValue, setParroquiaFilterValue] = useState('');
    const [categoriaFilterValue, setCategoriaFilterValue] = useState('');
    const [subcategoriaFilterValue, setSubcategoriaFilterValue] = useState('');

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

    const estadoOptions = useMemo(() => {
        if (!enableEstadoFilter) return [];
        const unique = new Set<string>();
        data.forEach((item: any) => { if (item.nombre_estado) unique.add(item.nombre_estado); });
        return Array.from(unique).sort().map(value => ({ value, label: value }));
    }, [data, enableEstadoFilter]);

    const municipioOptions = useMemo(() => {
        if (!enableMunicipioFilter) return [];
        const unique = new Set<string>();
        data.forEach((item: any) => {
            if (item.nombre_municipio && (!estadoFilterValue || item.nombre_estado === estadoFilterValue)) {
                unique.add(item.nombre_municipio);
            }
        });
        return Array.from(unique).sort().map(value => ({ value, label: value }));
    }, [data, enableMunicipioFilter, estadoFilterValue]);

    const parroquiaOptions = useMemo(() => {
        if (!enableParroquiaFilter) return [];
        const unique = new Set<string>();
        data.forEach((item: any) => {
            if (item.nombre_parroquia &&
                (!estadoFilterValue || item.nombre_estado === estadoFilterValue) &&
                (!municipioFilterValue || item.nombre_municipio === municipioFilterValue)) {
                unique.add(item.nombre_parroquia);
            }
        });
        return Array.from(unique).sort().map(value => ({ value, label: value }));
    }, [data, enableParroquiaFilter, estadoFilterValue, municipioFilterValue]);

    const categoriaOptions = useMemo(() => {
        if (!enableCategoriaFilter) return [];
        const unique = new Set<string>();
        data.forEach((item: any) => {
            if (item.nombre_categoria && (!filterValue || item.nombre_materia === filterValue)) {
                unique.add(item.nombre_categoria);
            }
        });
        return Array.from(unique).sort().map(value => ({ value, label: value }));
    }, [data, enableCategoriaFilter, filterValue]);

    const subcategoriaOptions = useMemo(() => {
        if (!enableSubcategoriaFilter) return [];
        const unique = new Set<string>();
        data.forEach((item: any) => {
            if (item.nombre_subcategoria &&
                (!filterValue || item.nombre_materia === filterValue) &&
                (!categoriaFilterValue || item.nombre_categoria === categoriaFilterValue)) {
                unique.add(item.nombre_subcategoria);
            }
        });
        return Array.from(unique).sort().map(value => ({ value, label: value }));
    }, [data, enableSubcategoriaFilter, filterValue, categoriaFilterValue]);

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
        if (estadoFilterValue) {
            result = result.filter((item: any) => item.nombre_estado === estadoFilterValue);
        }
        if (municipioFilterValue) {
            result = result.filter((item: any) => item.nombre_municipio === municipioFilterValue);
        }
        if (parroquiaFilterValue) {
            result = result.filter((item: any) => item.nombre_parroquia === parroquiaFilterValue);
        }
        if (categoriaFilterValue) {
            result = result.filter((item: any) => item.nombre_categoria === categoriaFilterValue);
        }
        if (subcategoriaFilterValue) {
            result = result.filter((item: any) => item.nombre_subcategoria === subcategoriaFilterValue);
        }
        return result;
    }, [data, searchQuery, filterValue, filterField, estatusFilterValue, estadoFilterValue, municipioFilterValue, parroquiaFilterValue, categoriaFilterValue, subcategoriaFilterValue]);

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
    const hasActiveMultiFilters = enableEstadoFilter || enableMunicipioFilter || enableParroquiaFilter || enableCategoriaFilter || enableSubcategoriaFilter;
    const shouldShowFilter = !disableFilter && (
        (filterField && generatedFilterOptions.length > 0) ||
        (loading && filterField && (autoGenerateFilter || !!filterOptions)) ||
        hasActiveMultiFilters
    );

    return (
        <div>
            {!hideBackButton && (
                <div className="mb-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/dashboard/administration')}
                        className="flex items-center gap-2 px-2 hover:bg-[var(--sidebar-hover)]"
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
                    ...(enableEstadoFilter ? {
                        estadoFilter: estadoFilterValue,
                        onEstadoChange: (val: string) => {
                            setEstadoFilterValue(val);
                            setMunicipioFilterValue('');
                            setParroquiaFilterValue('');
                        },
                        estadoOptions
                    } : {}),
                    ...(enableMunicipioFilter ? {
                        municipioFilter: municipioFilterValue,
                        onMunicipioChange: (val: string) => {
                            setMunicipioFilterValue(val);
                            setParroquiaFilterValue('');
                        },
                        municipioOptions
                    } : {}),
                    ...(enableParroquiaFilter ? {
                        parroquiaFilter: parroquiaFilterValue,
                        onParroquiaChange: setParroquiaFilterValue,
                        parroquiaOptions
                    } : {}),
                    // Map filter functionality based on filterTarget
                    ...(filterField ? (
                        filterTarget === 'materia' ? {
                            materiaFilter: filterValue,
                            onMateriaChange: (val: string) => {
                                setFilterValue(val);
                                if (enableCategoriaFilter) setCategoriaFilterValue('');
                                if (enableSubcategoriaFilter) setSubcategoriaFilterValue('');
                            },
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
                        }
                    ) : {}),
                    // Standard Estatus Filter (if not primary target)
                    ...((filterTarget !== 'estatus' || !filterField) ? {
                        estatusFilter: estatusFilterValue,
                        onEstatusChange: setEstatusFilterValue,
                        estatusOptions: estatusOptions
                    } : {}),
                    ...(enableCategoriaFilter ? {
                        categoriaFilter: categoriaFilterValue,
                        onCategoriaChange: (val: string) => {
                            setCategoriaFilterValue(val);
                            if (enableSubcategoriaFilter) setSubcategoriaFilterValue('');
                        },
                        categoriaOptions
                    } : {}),
                    ...(enableSubcategoriaFilter ? {
                        subcategoriaFilter: subcategoriaFilterValue,
                        onSubcategoriaChange: setSubcategoriaFilterValue,
                        subcategoriaOptions
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
