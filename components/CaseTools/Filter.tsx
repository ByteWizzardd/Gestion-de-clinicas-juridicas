'use client';
import { Filter as FilterIcon } from 'lucide-react';
import { useState } from 'react';
import DropdownMenu from '../ui/navigation/DropdownMenu';

interface FilterOption {
  value: string;
  label: string;
  type: 'estatus' | 'tramite' | 'all';
}

interface FilterProps {
  estatusFilter: string;
  tramiteFilter: string;
  onEstatusChange: (value: string) => void;
  onTramiteChange: (value: string) => void;
  estatusOptions: { value: string; label: string }[];
  tramiteOptions: { value: string; label: string }[];
}

function Filter({ 
  estatusFilter, 
  tramiteFilter, 
  onEstatusChange, 
  onTramiteChange,
  estatusOptions,
  tramiteOptions
}: FilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasActiveFilter = estatusFilter !== '' || (tramiteFilter !== '' && tramiteOptions && tramiteOptions.length > 0);

  const handleClearFilters = () => {
    onEstatusChange('');
    onTramiteChange('');
    setIsOpen(false);
  };

  const triggerButton = (isOpenState: boolean) => (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpenState)}
      className={`h-10 px-4 cursor-pointer rounded-full bg-transparent border border-primary text-foreground flex items-center justify-center gap-1.5 whitespace-nowrap hover:bg-primary-light transition-colors ${
        hasActiveFilter ? 'bg-primary-light border-primary-dark' : ''
      }`}
    >
      <FilterIcon className="w-[18px] h-[18px] text-[#414040]" />
      <span className="text-base text-center">Filtro</span>
      {hasActiveFilter && (
        <span className="ml-1 bg-primary text-on-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">
          {(estatusFilter ? 1 : 0) + (tramiteFilter && tramiteOptions && tramiteOptions.length > 0 ? 1 : 0)}
        </span>
      )}
    </button>
  );

  return (
    <DropdownMenu
      trigger={triggerButton}
      onOpenChange={setIsOpen}
      align="right"
      menuClassName="bg-white border border-gray-300 rounded-2xl shadow-lg min-w-[280px] p-2"
    >
      <div>
            {/* Filtro por Estatus/Núcleo */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1 px-2">
                {estatusOptions.length > 0 && estatusOptions[0]?.label?.includes('UCAB') ? 'Núcleo' : 'Estatus'}
              </label>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => onEstatusChange('')}
                  className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors ${
                    estatusFilter === ''
                      ? 'bg-primary-light text-primary font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {estatusOptions.length > 0 && estatusOptions[0]?.label?.includes('UCAB') ? 'Todos los núcleos' : 'Todos los estatus'}
                </button>
                {estatusOptions && estatusOptions.length > 0 && estatusOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onEstatusChange(option.value)}
                    className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors ${
                      estatusFilter === option.value
                        ? 'bg-primary-light text-primary font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Separador - Solo si hay filtro de trámite */}
            {tramiteOptions && tramiteOptions.length > 0 && (
              <>
                <div className="border-t border-gray-200 my-2"></div>

                {/* Filtro por Trámite */}
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 px-2">
                    Trámite
                  </label>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => onTramiteChange('')}
                      className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors ${
                        tramiteFilter === ''
                          ? 'bg-primary-light text-primary font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Todos los trámites
                    </button>
                    {tramiteOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => onTramiteChange(option.value)}
                        className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors ${
                          tramiteFilter === option.value
                            ? 'bg-primary-light text-primary font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Botón para limpiar filtros */}
            {hasActiveFilter && (
              <>
                <div className="border-t border-gray-200 my-2"></div>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="w-full px-3 py-2 text-sm text-center text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Limpiar filtros
                </button>
              </>
            )}
      </div>
    </DropdownMenu>
  );
}

export default Filter;