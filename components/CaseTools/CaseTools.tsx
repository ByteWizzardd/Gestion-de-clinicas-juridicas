import Add from "./Add";
import Filter from "./Filter";
import Search from "./search";
import type { LucideIcon } from 'lucide-react';

type CaseToolsProps = {
    addLabel?: string;
    onAddClick?: () => void;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
    nucleoFilter?: string;
    tramiteFilter?: string;
    estatusFilter?: string;
    casosAsignadosFilter?: boolean;
    onNucleoChange?: (value: string) => void;
    nucleoOptions?: { value: string; label: string }[];
    onTramiteChange?: (value: string) => void;
    onEstatusChange?: (value: string) => void;
    onCasosAsignadosChange?: (value: boolean) => void;
    tramiteOptions?: { value: string; label: string }[];
    estatusOptions?: { value: string; label: string }[];
    showCasosAsignados?: boolean;
    materiaFilter?: string;
    onMateriaChange?: (value: string) => void;
    materias?: { id_materia: number; nombre_materia: string; habilitado?: boolean }[];
    materiaOptions?: { value: string; label: string }[];
    materiaLabel?: string;
    categoriaFilter?: string;
    onCategoriaChange?: (value: string) => void;
    categoriaOptions?: { value: string; label: string }[];
    categoriaLabel?: string;
    subcategoriaFilter?: string;
    onSubcategoriaChange?: (value: string) => void;
    subcategoriaOptions?: { value: string; label: string }[];
    subcategoriaLabel?: string;
    nucleoLabel?: string;
    nucleoAllLabel?: string;
    nucleoIcon?: LucideIcon;
    estatusLabel?: string;
    tramiteLabel?: string;
    estadoCivilFilter?: string;
    onEstadoCivilChange?: (value: string) => void;
    estadoCivilOptions?: { value: string; label: string }[];
    estadoCivilLabel?: string;
    nacionalidadFilter?: string;
    onNacionalidadChange?: (value: string) => void;
    nacionalidadOptions?: { value: string; label: string }[];

    estadoFilter?: string;
    onEstadoChange?: (value: string) => void;
    estadoOptions?: { value: string; label: string }[];
    estadoLabel?: string;

    municipioFilter?: string;
    onMunicipioChange?: (value: string) => void;
    municipioOptions?: { value: string; label: string }[];
    municipioLabel?: string;

    parroquiaFilter?: string;
    onParroquiaChange?: (value: string) => void;
    parroquiaOptions?: { value: string; label: string }[];
    parroquiaLabel?: string;

    // Limpieza atómica (evita condiciones de carrera en consumers que disparan fetch)
    onClearFilters?: () => void | Promise<void>;

    // Rango de fechas (fecha de solicitud)
    showDateRange?: boolean;
    fechaInicio?: string;
    fechaFin?: string;
    onFechaInicioChange?: (value: string) => void;
    onFechaFinChange?: (value: string) => void;

    // Semestre filter
    termFilter?: string;
    onTermChange?: (value: string) => void;
    termOptions?: { value: string; label: string }[];
    // Filtro de operación
    operacionFilter?: string;
    onOperacionChange?: (value: string) => void;
    operacionOptions?: { value: string; label: string }[];
    operacionLabel?: string;
    // Filtro de orden
    sortFilter?: string;
    onSortChange?: (value: string) => void;
    sortOptions?: { value: string; label: string }[];
    sortLabel?: string;
    tramiteIcon?: LucideIcon;
    estatusIcon?: LucideIcon;
};

function CaseTools({
    addLabel,
    onAddClick,
    searchValue = '',
    onSearchChange,
    searchPlaceholder,
    nucleoFilter = '',
    tramiteFilter = '',
    estatusFilter = '',
    casosAsignadosFilter = false,
    onNucleoChange,
    nucleoOptions,
    onTramiteChange,
    onEstatusChange,
    onCasosAsignadosChange,
    tramiteOptions = [],
    estatusOptions = [],
    showCasosAsignados = false,
    materiaFilter = '',
    onMateriaChange,
    materias = [],
    materiaOptions,
    materiaLabel,
    categoriaFilter = '',
    onCategoriaChange,
    categoriaOptions,
    categoriaLabel,
    subcategoriaFilter = '',
    onSubcategoriaChange,
    subcategoriaOptions,
    subcategoriaLabel,
    nucleoLabel,
    nucleoAllLabel,
    nucleoIcon,
    estatusLabel,
    tramiteLabel,
    estadoCivilFilter = '',
    onEstadoCivilChange,
    estadoCivilOptions,
    estadoCivilLabel,
    nacionalidadFilter = '',
    onNacionalidadChange,
    nacionalidadOptions,
    estadoFilter = '',
    onEstadoChange,
    estadoOptions,
    estadoLabel,
    municipioFilter = '',
    onMunicipioChange,
    municipioOptions,
    municipioLabel,
    parroquiaFilter = '',
    onParroquiaChange,
    parroquiaOptions,
    parroquiaLabel,
    onClearFilters,
    showDateRange = false,
    fechaInicio,
    fechaFin,
    onFechaInicioChange,
    onFechaFinChange,
    termFilter = '',
    onTermChange,
    termOptions,
    operacionFilter = '',
    onOperacionChange,
    operacionOptions,
    operacionLabel,
    sortFilter,
    onSortChange,
    sortOptions,
    sortLabel,
    tramiteIcon,
    estatusIcon,
}: CaseToolsProps) {
    const hasSearch = onSearchChange !== undefined;
    const hasAdd = Boolean(addLabel || onAddClick);
    const hasFilter =
        onNucleoChange !== undefined ||
        onTramiteChange !== undefined ||
        onEstatusChange !== undefined ||
        onCasosAsignadosChange !== undefined ||
        onMateriaChange !== undefined ||
        onCategoriaChange !== undefined ||
        onSubcategoriaChange !== undefined ||
        onEstadoCivilChange !== undefined ||
        onNacionalidadChange !== undefined ||
        onEstadoChange !== undefined ||
        onMunicipioChange !== undefined ||
        onParroquiaChange !== undefined ||
        onFechaInicioChange !== undefined ||
        onFechaFinChange !== undefined ||
        onTermChange !== undefined ||
        onOperacionChange !== undefined ||
        onSortChange !== undefined;

    const handleClearFilters = async () => {
        if (onClearFilters) {
            await onClearFilters();
            return;
        }

        // Por defecto, limpiar todo lo que el toolbar controla.
        if (onSearchChange) {
            onSearchChange('');
        }

        // Ejecutar de forma secuencial por si algún handler dispara fetch.
        const call = async <T,>(fn: ((value: T) => void) | undefined, value: T) => {
            if (!fn) return;
            await Promise.resolve((fn as unknown as (v: T) => void | Promise<void>)(value));
        };

        await call(onNucleoChange, '');
        await call(onMateriaChange, '');
        await call(onCategoriaChange, '');
        await call(onSubcategoriaChange, '');
        await call(onTramiteChange, '');
        await call(onEstatusChange, '');
        await call(onEstadoCivilChange, '');
        await call(onNacionalidadChange, '');
        await call(onEstadoChange, '');
        await call(onMunicipioChange, '');
        await call(onParroquiaChange, '');
        await call(onCasosAsignadosChange, false);
        await call(onFechaInicioChange, '');
        await call(onCasosAsignadosChange, false);
        await call(onFechaInicioChange, '');
        await call(onFechaFinChange, '');
        await call(onTermChange, '');
        await call(onOperacionChange, '');
        await call(onSortChange, '');
    };

    return (
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center w-full px-3">
            {hasSearch && (
                <div className="flex-1 min-w-0">
                    <Search value={searchValue} onChange={onSearchChange} placeholder={searchPlaceholder} />
                </div>
            )}
            <div
                className={
                    `grid gap-3 w-full shrink-0 ` +
                    (hasFilter && hasAdd ? 'grid-cols-2' : 'grid-cols-1') +
                    ' sm:flex sm:w-auto sm:gap-4 sm:items-center'
                }
            >
                {hasFilter && (
                    <Filter
                        nucleoFilter={nucleoFilter}
                        nucleoOptions={nucleoOptions}
                        tramiteFilter={tramiteFilter}
                        estatusFilter={estatusFilter}
                        casosAsignadosFilter={casosAsignadosFilter}
                        onClearFilters={handleClearFilters}
                        onNucleoChange={onNucleoChange}
                        onTramiteChange={onTramiteChange}
                        onEstatusChange={onEstatusChange}
                        onCasosAsignadosChange={onCasosAsignadosChange}
                        tramiteOptions={tramiteOptions}
                        tramiteLabel={tramiteLabel}
                        estatusOptions={estatusOptions}
                        showCasosAsignados={showCasosAsignados}
                        materiaFilter={materiaFilter}
                        onMateriaChange={onMateriaChange}
                        materias={materias}
                        materiaOptions={materiaOptions}
                        materiaLabel={materiaLabel}

                        categoriaFilter={categoriaFilter}
                        onCategoriaChange={onCategoriaChange}
                        categoriaOptions={categoriaOptions}
                        categoriaLabel={categoriaLabel}

                        subcategoriaFilter={subcategoriaFilter}
                        onSubcategoriaChange={onSubcategoriaChange}
                        subcategoriaOptions={subcategoriaOptions}
                        subcategoriaLabel={subcategoriaLabel}

                        nucleoLabel={nucleoLabel}
                        nucleoAllLabel={nucleoAllLabel}
                        nucleoIcon={nucleoIcon}
                        estatusLabel={estatusLabel}
                        estadoCivilFilter={estadoCivilFilter}
                        onEstadoCivilChange={onEstadoCivilChange}
                        estadoCivilOptions={estadoCivilOptions}
                        estadoCivilLabel={estadoCivilLabel}
                        nacionalidadFilter={nacionalidadFilter}
                        onNacionalidadChange={onNacionalidadChange}
                        nacionalidadOptions={nacionalidadOptions}

                        estadoFilter={estadoFilter}
                        onEstadoChange={onEstadoChange}
                        estadoOptions={estadoOptions}
                        estadoLabel={estadoLabel}

                        municipioFilter={municipioFilter}
                        onMunicipioChange={onMunicipioChange}
                        municipioOptions={municipioOptions}
                        municipioLabel={municipioLabel}

                        parroquiaFilter={parroquiaFilter}
                        onParroquiaChange={onParroquiaChange}
                        parroquiaOptions={parroquiaOptions}
                        parroquiaLabel={parroquiaLabel}

                        showDateRange={showDateRange}
                        fechaInicio={fechaInicio}
                        fechaFin={fechaFin}
                        onFechaInicioChange={onFechaInicioChange}
                        onFechaFinChange={onFechaFinChange}
                        termFilter={termFilter}
                        onTermChange={onTermChange}
                        termOptions={termOptions}
                        operacionFilter={operacionFilter}
                        onOperacionChange={onOperacionChange}
                        operacionOptions={operacionOptions}
                        operacionLabel={operacionLabel}
                        sortFilter={sortFilter}
                        onSortChange={onSortChange}
                        sortOptions={sortOptions}
                        sortLabel={sortLabel}
                        tramiteIcon={tramiteIcon}
                        estatusIcon={estatusIcon}
                    />
                )}
                {hasAdd && <Add label={addLabel} onClick={onAddClick} />}
            </div>
        </div>
    );
}

export default CaseTools;