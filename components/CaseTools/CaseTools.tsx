import Add from "./Add";
import Filter from "./Filter";
import Search from "./search";

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
    nucleoLabel?: string;
    nucleoAllLabel?: string;
    estatusLabel?: string;
    estadoCivilFilter?: string;
    onEstadoCivilChange?: (value: string) => void;
    estadoCivilOptions?: { value: string; label: string }[];
    estadoCivilLabel?: string;
    nacionalidadFilter?: string;
    onNacionalidadChange?: (value: string) => void;
    nacionalidadOptions?: { value: string; label: string }[];

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
    nucleoLabel,
    nucleoAllLabel,
    estatusLabel,
    estadoCivilFilter = '',
    onEstadoCivilChange,
    estadoCivilOptions,
    estadoCivilLabel,
    nacionalidadFilter = '',
    onNacionalidadChange,
    nacionalidadOptions,
    onClearFilters,
    showDateRange = false,
    fechaInicio,
    fechaFin,
    onFechaInicioChange,
    onFechaFinChange,
    termFilter = '',
    onTermChange,
    termOptions
}: CaseToolsProps) {
    const hasSearch = onSearchChange !== undefined;
    const hasAdd = Boolean(addLabel || onAddClick);
    const hasFilter =
        onNucleoChange !== undefined ||
        onTramiteChange !== undefined ||
        onEstatusChange !== undefined ||
        onCasosAsignadosChange !== undefined ||
        onMateriaChange !== undefined ||
        onEstadoCivilChange !== undefined ||
        onNacionalidadChange !== undefined ||
        onFechaInicioChange !== undefined ||
        onFechaFinChange !== undefined ||
        onTermChange !== undefined;

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
        await call(onTramiteChange, '');
        await call(onEstatusChange, '');
        await call(onEstadoCivilChange, '');
        await call(onNacionalidadChange, '');
        await call(onCasosAsignadosChange, false);
        await call(onFechaInicioChange, '');
        await call(onCasosAsignadosChange, false);
        await call(onFechaInicioChange, '');
        await call(onFechaFinChange, '');
        await call(onTermChange, '');
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
                        estatusOptions={estatusOptions}
                        showCasosAsignados={showCasosAsignados}
                        materiaFilter={materiaFilter}
                        onMateriaChange={onMateriaChange}
                        materias={materias}
                        materiaOptions={materiaOptions}
                        nucleoLabel={nucleoLabel}
                        nucleoAllLabel={nucleoAllLabel}
                        estatusLabel={estatusLabel}
                        estadoCivilFilter={estadoCivilFilter}
                        onEstadoCivilChange={onEstadoCivilChange}
                        estadoCivilOptions={estadoCivilOptions}
                        estadoCivilLabel={estadoCivilLabel}
                        nacionalidadFilter={nacionalidadFilter}
                        onNacionalidadChange={onNacionalidadChange}
                        nacionalidadOptions={nacionalidadOptions}

                        showDateRange={showDateRange}
                        fechaInicio={fechaInicio}
                        fechaFin={fechaFin}
                        onFechaInicioChange={onFechaInicioChange}
                        onFechaFinChange={onFechaFinChange}
                        termFilter={termFilter}
                        onTermChange={onTermChange}
                        termOptions={termOptions}
                    />
                )}
                {hasAdd && <Add label={addLabel} onClick={onAddClick} />}
            </div>
        </div>
    );
}

export default CaseTools;