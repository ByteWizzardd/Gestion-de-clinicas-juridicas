'use client';

import { 
  Filter as FilterIcon, 
  ChevronLeft,
  Layers,
  UserCheck,
  Calendar
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import DropdownMenu from '@/components/ui/navigation/DropdownMenu';
import { AppointmentViewMode } from '@/components/ui/navigation/AppointmentViewSwitcher';
import DatePicker from '@/components/forms/DatePicker';
import { AnimatePresence, motion } from 'motion/react';
import { createPortal } from 'react-dom';

interface AppointmentFilterOptions {
  nucleos: Array<{ id_nucleo: number; nombre_nucleo: string }>;
  usuarios: Array<{ cedula: string; nombres: string; apellidos: string; nombre_completo: string }>;
}

interface AppointmentsToolbarProps {
  viewMode: AppointmentViewMode;
  onViewModeChange: (view: AppointmentViewMode) => void;
  nucleoFilter: string;
  usuarioFilter: string;
  dateRangeFilter: string;
  customDateStart: string;
  customDateEnd: string;
  onNucleoFilterChange: (value: string) => void;
  onUsuarioFilterChange: (value: string) => void;
  onDateRangeFilterChange: (value: string) => void;
  onCustomDateStartChange: (value: string) => void;
  onCustomDateEndChange: (value: string) => void;
  filterOptions: AppointmentFilterOptions;
}

interface FilterMenuItemProps {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  hasActiveFilter?: boolean;
  showArrow?: boolean;
  submenuContent?: React.ReactNode;
  itemRef?: React.RefObject<HTMLButtonElement | null>;
}

function FilterMenuItem({ 
  title, 
  icon, 
  isOpen, 
  onToggle, 
  hasActiveFilter = false,
  showArrow = true,
  submenuContent,
  itemRef
}: FilterMenuItemProps) {
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [mounted, setMounted] = useState(false);
  const submenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        submenuRef.current &&
        itemRef?.current &&
        !submenuRef.current.contains(event.target as Node) &&
        !itemRef.current.contains(event.target as Node)
      ) {
        // Verificar que el click no sea en el menú principal
        const mainMenu = document.querySelector('[data-filter-main-menu]');
        if (mainMenu && !mainMenu.contains(event.target as Node)) {
          onToggle();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, itemRef, onToggle]);

  useEffect(() => {
    if (isOpen && itemRef?.current) {
      const updatePosition = () => {
        if (itemRef.current) {
          const rect = itemRef.current.getBoundingClientRect();
          const submenuWidth = 320; // Ancho estimado del submenú
          const submenuMaxHeight = window.innerHeight * 0.8; // 80vh
          const spaceOnRight = window.innerWidth - rect.right;
          const spaceOnLeft = rect.left;
          const spaceBelow = window.innerHeight - rect.bottom;
          const spaceAbove = rect.top;
          
          // Si no hay espacio a la derecha, mostrar a la izquierda
          const shouldShowOnLeft = spaceOnRight < submenuWidth && spaceOnLeft > submenuWidth;
          
          // Calcular posición vertical para que no se corte
          let topPosition = rect.top + window.scrollY;
          if (spaceBelow < submenuMaxHeight && spaceAbove > spaceBelow) {
            // Si no hay espacio abajo pero sí arriba, ajustar hacia arriba
            topPosition = Math.max(8, rect.top + window.scrollY - (submenuMaxHeight - spaceBelow));
          } else {
            // Asegurar que no se salga por abajo
            const maxTop = window.innerHeight + window.scrollY - submenuMaxHeight - 8;
            topPosition = Math.min(topPosition, maxTop);
          }
          
          setCoords({
            top: topPosition,
            left: shouldShowOnLeft 
              ? rect.left + window.scrollX - submenuWidth + 8
              : rect.left + window.scrollX + rect.width - 8,
            width: rect.width,
            height: rect.height
          });
        }
      };

      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, itemRef]);

  return (
    <>
      <button
        ref={itemRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={`relative w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 active:bg-gray-100 transition-all duration-150 border-b border-gray-200 last:border-b-0 ${
          hasActiveFilter ? 'bg-primary-light/10 border-l-4 border-l-primary' : ''
        }`}
      >
        {showArrow && (
          <ChevronLeft className={`w-4 h-4 text-gray-500 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-90' : ''}`} />
        )}
        <span className={`flex-1 text-sm font-medium ${hasActiveFilter ? 'text-primary' : 'text-gray-700'}`}>
          {title}
        </span>
        <div className="text-gray-400 flex-shrink-0">
          {icon}
        </div>
      </button>
      
      {/* Submenú lateral */}
      {mounted && isOpen && submenuContent && createPortal(
        <AnimatePresence>
          <motion.div
            ref={submenuRef}
            initial={{ opacity: 0, x: -10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: coords.top + 8,
              left: coords.left,
              zIndex: 10000,
              pointerEvents: 'auto',
              maxHeight: '80vh',
            }}
            className="bg-white border border-gray-300 rounded-2xl shadow-xl min-w-[280px] max-w-[320px] flex flex-col"
            data-submenu
            onClick={(e) => {
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
          >
            {submenuContent}
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

export default function AppointmentsToolbar({
  viewMode,
  onViewModeChange,
  nucleoFilter,
  usuarioFilter,
  dateRangeFilter,
  customDateStart,
  customDateEnd,
  onNucleoFilterChange,
  onUsuarioFilterChange,
  onDateRangeFilterChange,
  onCustomDateStartChange,
  onCustomDateEndChange,
  filterOptions,
}: AppointmentsToolbarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    fecha: false,
    nucleo: false,
    usuario: false,
  });
  
  const fechaItemRef = useRef<HTMLButtonElement>(null);
  const nucleoItemRef = useRef<HTMLButtonElement>(null);
  const usuarioItemRef = useRef<HTMLButtonElement>(null);
  
  const hasActiveFilter = nucleoFilter !== '' || usuarioFilter !== '' || dateRangeFilter !== 'all';

  const getActiveFilterCount = () => {
    let count = 0;
    if (nucleoFilter !== '') count++;
    if (usuarioFilter !== '') count++;
    if (dateRangeFilter !== 'all') count++;
    return count;
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => {
      const newState = { ...prev };
      // Cerrar otras secciones cuando se abre una nueva
      Object.keys(newState).forEach(key => {
        if (key !== section) {
          newState[key] = false;
        }
      });
      newState[section] = !prev[section];
      return newState;
    });
  };

  const handleClearFilters = () => {
    onNucleoFilterChange('');
    onUsuarioFilterChange('');
    onDateRangeFilterChange('all');
    onCustomDateStartChange('');
    onCustomDateEndChange('');
    setIsFilterOpen(false);
    setOpenSections({ fecha: false, nucleo: false, usuario: false });
  };

  // Preparar opciones de núcleos
  const nucleoOptions = filterOptions.nucleos.map((n) => ({
    value: n.nombre_nucleo,
    label: n.nombre_nucleo,
  }));

  // Preparar opciones de usuarios
  const usuarioOptions = filterOptions.usuarios.map((u) => ({
    value: u.cedula,
    label: u.nombre_completo,
  }));

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
          {getActiveFilterCount()}
        </span>
      )}
    </button>
  );

  // Solo mostrar el filtro en vista de lista
  if (viewMode !== 'list') {
    return null;
  }

  return (
    <div className="relative">
      <DropdownMenu
        trigger={triggerButton}
        onOpenChange={setIsFilterOpen}
        align="left"
        className="relative"
        menuClassName="bg-white border border-gray-300 rounded-2xl shadow-xl min-w-[280px] max-w-[300px] overflow-hidden"
      >
        <div data-filter-main-menu onClick={(e) => e.stopPropagation()}>
          {/* Item: Rango de Fechas */}
          <FilterMenuItem
            title="Rango de Fechas"
            icon={<Calendar className="w-5 h-5" />}
            isOpen={openSections.fecha}
            onToggle={() => toggleSection('fecha')}
            hasActiveFilter={dateRangeFilter !== 'all'}
            itemRef={fechaItemRef}
            submenuContent={
              <div className="p-3 space-y-1.5 overflow-y-auto flex-1 min-h-0" style={{ maxHeight: 'calc(80vh - 24px)' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDateRangeFilterChange('all');
                    setOpenSections(prev => ({ ...prev, fecha: false }));
                  }}
                  className={`w-full px-3 py-2.5 text-left text-sm rounded-lg transition-all duration-150 ${
                    dateRangeFilter === 'all'
                      ? 'bg-primary-light text-primary font-medium shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
                  }`}
                >
                  Todas las fechas
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDateRangeFilterChange('today');
                    setOpenSections(prev => ({ ...prev, fecha: false }));
                  }}
                  className={`w-full px-3 py-2.5 text-left text-sm rounded-lg transition-all duration-150 ${
                    dateRangeFilter === 'today'
                      ? 'bg-primary-light text-primary font-medium shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
                  }`}
                >
                  Hoy
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDateRangeFilterChange('week');
                    setOpenSections(prev => ({ ...prev, fecha: false }));
                  }}
                  className={`w-full px-3 py-2.5 text-left text-sm rounded-lg transition-all duration-150 ${
                    dateRangeFilter === 'week'
                      ? 'bg-primary-light text-primary font-medium shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
                  }`}
                >
                  Última semana
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDateRangeFilterChange('month');
                    setOpenSections(prev => ({ ...prev, fecha: false }));
                  }}
                  className={`w-full px-3 py-2.5 text-left text-sm rounded-lg transition-all duration-150 ${
                    dateRangeFilter === 'month'
                      ? 'bg-primary-light text-primary font-medium shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
                  }`}
                >
                  Último mes
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDateRangeFilterChange('custom');
                  }}
                  className={`w-full px-3 py-2.5 text-left text-sm rounded-lg transition-all duration-150 ${
                    dateRangeFilter === 'custom'
                      ? 'bg-primary-light text-primary font-medium shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
                  }`}
                >
                  Rango personalizado
                </button>
                
                {/* Campos de fecha personalizada */}
                {dateRangeFilter === 'custom' && (
                  <div className="mt-3 space-y-2 pl-2 border-l-2 border-primary-light">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Fecha inicio</label>
                      <DatePicker
                        value={customDateStart}
                        onChange={(date) => onCustomDateStartChange(date || '')}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Fecha fin</label>
                      <DatePicker
                        value={customDateEnd}
                        onChange={(date) => onCustomDateEndChange(date || '')}
                      />
                    </div>
                  </div>
                )}
              </div>
            }
          />

          {/* Item: Núcleo */}
          <FilterMenuItem
            title="Núcleo"
            icon={<Layers className="w-5 h-5" />}
            isOpen={openSections.nucleo}
            onToggle={() => toggleSection('nucleo')}
            hasActiveFilter={nucleoFilter !== ''}
            itemRef={nucleoItemRef}
            submenuContent={
              <div className="p-3 space-y-1 overflow-y-auto flex-1 min-h-0" style={{ maxHeight: 'calc(80vh - 24px)' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNucleoFilterChange('');
                    setOpenSections(prev => ({ ...prev, nucleo: false }));
                  }}
                  className={`w-full px-3 py-2.5 text-left text-sm rounded-lg transition-all duration-150 ${
                    nucleoFilter === ''
                      ? 'bg-primary-light text-primary font-medium shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
                  }`}
                >
                  Todos los núcleos
                </button>
                {nucleoOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNucleoFilterChange(option.value);
                      setOpenSections(prev => ({ ...prev, nucleo: false }));
                    }}
                    className={`w-full px-3 py-2.5 text-left text-sm rounded-lg transition-all duration-150 ${
                      nucleoFilter === option.value
                        ? 'bg-primary-light text-primary font-medium shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            }
          />

          {/* Item: Usuario que Atendió */}
          <FilterMenuItem
            title="Usuario que Atendió"
            icon={<UserCheck className="w-5 h-5" />}
            isOpen={openSections.usuario}
            onToggle={() => toggleSection('usuario')}
            hasActiveFilter={usuarioFilter !== ''}
            itemRef={usuarioItemRef}
            submenuContent={
              <div className="p-3 space-y-1 overflow-y-auto flex-1 min-h-0" style={{ maxHeight: 'calc(80vh - 24px)' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUsuarioFilterChange('');
                    setOpenSections(prev => ({ ...prev, usuario: false }));
                  }}
                  className={`w-full px-3 py-2.5 text-left text-sm rounded-lg transition-all duration-150 ${
                    usuarioFilter === ''
                      ? 'bg-primary-light text-primary font-medium shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
                  }`}
                >
                  Todos los usuarios
                </button>
                {usuarioOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUsuarioFilterChange(option.value);
                      setOpenSections(prev => ({ ...prev, usuario: false }));
                    }}
                    className={`w-full px-3 py-2.5 text-left text-sm rounded-lg transition-all duration-150 ${
                      usuarioFilter === option.value
                        ? 'bg-primary-light text-primary font-medium shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            }
          />

          {/* Botón para limpiar filtros */}
          {hasActiveFilter && (
            <div className="border-t border-gray-200 p-3 bg-gray-50/50">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearFilters();
                }}
                className="w-full px-3 py-2.5 text-sm text-center text-red-600 hover:bg-red-50 active:bg-red-100 rounded-lg transition-all duration-150 font-medium"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </DropdownMenu>
    </div>
  );
}
