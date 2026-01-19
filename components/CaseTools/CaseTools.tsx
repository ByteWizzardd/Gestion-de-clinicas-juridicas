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
    nucleoLabel?: string;
    nucleoAllLabel?: string;
    estatusLabel?: string;
    estadoCivilFilter?: string;
    onEstadoCivilChange?: (value: string) => void;
    estadoCivilOptions?: { value: string; label: string }[];
    nacionalidadFilter?: string;
    onNacionalidadChange?: (value: string) => void;
    nacionalidadOptions?: { value: string; label: string }[];
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
    nucleoLabel,
    nucleoAllLabel,
    estatusLabel,
    estadoCivilFilter = '',
    onEstadoCivilChange,
    estadoCivilOptions,
    nacionalidadFilter = '',
    onNacionalidadChange,
    nacionalidadOptions
}: CaseToolsProps) {
    const hasSearch = onSearchChange !== undefined;
    const hasFilter =
        onNucleoChange !== undefined ||
        onTramiteChange !== undefined ||
        onEstatusChange !== undefined ||
        onCasosAsignadosChange !== undefined ||
        onMateriaChange !== undefined ||
        onEstadoCivilChange !== undefined ||
        onNacionalidadChange !== undefined;

    return (
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center w-full px-3">
            {hasSearch && (
                <div className="flex-1 min-w-0">
                    <Search value={searchValue} onChange={onSearchChange} placeholder={searchPlaceholder} />
                </div>
            )}
            <div className="flex gap-3 sm:gap-4 items-center shrink-0">
                {hasFilter && (
                    <Filter
                        nucleoFilter={nucleoFilter}
                        nucleoOptions={nucleoOptions}
                        tramiteFilter={tramiteFilter}
                        estatusFilter={estatusFilter}
                        casosAsignadosFilter={casosAsignadosFilter}
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
                        nucleoLabel={nucleoLabel}
                        nucleoAllLabel={nucleoAllLabel}
                        estatusLabel={estatusLabel}
                        estadoCivilFilter={estadoCivilFilter}
                        onEstadoCivilChange={onEstadoCivilChange}
                        estadoCivilOptions={estadoCivilOptions}
                        nacionalidadFilter={nacionalidadFilter}
                        onNacionalidadChange={onNacionalidadChange}
                        nacionalidadOptions={nacionalidadOptions}
                    />
                )}
                {(addLabel || onAddClick) && <Add label={addLabel} onClick={onAddClick} />}
            </div>
        </div>
    );
}

export default CaseTools;