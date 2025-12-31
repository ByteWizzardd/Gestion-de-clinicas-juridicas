'use client';

import { Filter as FilterIcon } from 'lucide-react';
import { useState } from 'react';
import DropdownMenu from '@/components/ui/navigation/DropdownMenu';
import { AppointmentViewMode } from '@/components/ui/navigation/AppointmentViewSwitcher';

interface AppointmentsToolbarProps {
  viewMode: AppointmentViewMode;
  onViewModeChange: (view: AppointmentViewMode) => void;
}

export default function AppointmentsToolbar({
  viewMode,
  onViewModeChange,
}: AppointmentsToolbarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const hasActiveFilter = false; // TODO: Implementar cuando se agregue la funcionalidad de filtrado

  // Solo mostrar el filtro en vista de lista
  if (viewMode !== 'list') {
    return null;
  }

  const triggerButton = (isOpenState: boolean) => (
    <button
      type="button"
      onClick={() => setIsFilterOpen(!isOpenState)}
      className={`h-10 px-4 cursor-pointer rounded-full bg-transparent border border-primary text-foreground flex items-center justify-center gap-1.5 whitespace-nowrap hover:bg-primary-light transition-colors ${
        hasActiveFilter ? 'bg-primary-light border-primary-dark' : ''
      }`}
    >
      <FilterIcon className="w-[18px] h-[18px] text-[#414040]" />
      <span className="text-base text-center">Filtro</span>
      {hasActiveFilter && (
        <span className="ml-1 bg-primary text-on-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">
          0
        </span>
      )}
    </button>
  );

  return (
    <DropdownMenu
      trigger={triggerButton}
      onOpenChange={setIsFilterOpen}
      align="right"
      menuClassName="bg-white border border-gray-300 rounded-2xl shadow-lg min-w-[280px] p-2"
    >
      <div className="p-2">
        <p className="text-sm text-gray-500 text-center py-4">
          Los filtros estarán disponibles próximamente
        </p>
      </div>
    </DropdownMenu>
  );
}
