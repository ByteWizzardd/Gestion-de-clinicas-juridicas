import Add from "./Add";
import Filter from "./Filter";
import Search from "./search";

type CaseToolsProps = {
  addLabel?: string;
  onAddClick?: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  estatusFilter?: string;
  tramiteFilter?: string;
  onEstatusChange?: (value: string) => void;
  onTramiteChange?: (value: string) => void;
  estatusOptions?: { value: string; label: string }[];
  tramiteOptions?: { value: string; label: string }[];
};

function CaseTools({ 
  addLabel, 
  onAddClick,
  searchValue = '',
  onSearchChange,
  estatusFilter = '',
  tramiteFilter = '',
  onEstatusChange,
  onTramiteChange,
  estatusOptions = [],
  tramiteOptions = []
}: CaseToolsProps) {
    const hasSearch = onSearchChange !== undefined;
    const hasFilter = onEstatusChange !== undefined && onTramiteChange !== undefined;

    return (
        <div className="flex flex-nowrap gap-3 sm:gap-4 items-center w-full px-3">
            {hasSearch && (
                <div className="flex-1 min-w-0">
                    <Search value={searchValue} onChange={onSearchChange} />
                </div>
            )}
            <div className="flex gap-3 sm:gap-4 items-center flex-shrink-0">
                {hasFilter && (
                    <Filter
                      estatusFilter={estatusFilter}
                      tramiteFilter={tramiteFilter}
                      onEstatusChange={onEstatusChange}
                      onTramiteChange={onTramiteChange}
                      estatusOptions={estatusOptions}
                      tramiteOptions={tramiteOptions}
                    />
                )}
                <Add label={addLabel} onClick={onAddClick} />
            </div>
        </div>
    );
}

export default CaseTools;