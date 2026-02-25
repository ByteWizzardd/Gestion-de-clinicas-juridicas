'use client';

import { Filter as FilterIcon, ChevronLeft, Layers, UserCheck, Calendar, FileText, X, Users, BookOpen } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { AppointmentViewMode } from '@/components/ui/navigation/AppointmentViewSwitcher';
import DatePicker from '@/components/forms/DatePicker';
import { AnimatePresence, motion } from 'motion/react';
import { createPortal } from 'react-dom';

interface AppointmentFilterOptions {
  nucleos: Array<{ id_nucleo: number; nombre_nucleo: string }>;
  usuarios: Array<{ cedula: string; nombres: string; apellidos: string; nombre_completo: string }>;
  casos: Array<{ id_caso: number; tramite: string }>;
}

interface AppointmentsToolbarProps {
  viewMode: AppointmentViewMode;
  onViewModeChange: (view: AppointmentViewMode) => void;
  nucleoFilter: string;
  usuarioFilter: string[];
  caseFilter: string[];
  misCasosFilter: boolean;
  dateRangeFilter: string;
  customDateStart: string;
  customDateEnd: string;
  termFilter?: string;
  semestresOptions?: Array<{ term: string; fecha_inicio: string; fecha_fin: string }>;
  onNucleoFilterChange: (value: string) => void;
  onUsuarioFilterChange: (value: string[]) => void;
  onCaseFilterChange: (value: string[]) => void;
  onMisCasosFilterChange: (value: boolean) => void;
  onDateRangeFilterChange: (value: string) => void;
  onCustomDateStartChange: (value: string) => void;
  onCustomDateEndChange: (value: string) => void;
  onTermChange?: (value: string) => void;
  filterOptions: AppointmentFilterOptions;
}

export default function AppointmentsToolbar({
  viewMode,
  nucleoFilter,
  usuarioFilter,
  caseFilter,
  misCasosFilter,
  dateRangeFilter,
  customDateStart,
  customDateEnd,
  termFilter = '',
  semestresOptions = [],
  onNucleoFilterChange,
  onUsuarioFilterChange,
  onCaseFilterChange,
  onMisCasosFilterChange,
  onDateRangeFilterChange,
  onCustomDateStartChange,
  onCustomDateEndChange,
  onTermChange,
  filterOptions,
}: AppointmentsToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<'nucleo' | 'usuario' | 'caso' | 'fechas' | 'semestre' | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });
  const [submenuPosition, setSubmenuPosition] = useState({ top: 0, left: 0, width: 0 });

  const menuRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
  const isMobileViewport = () => window.innerWidth < 640; // Tailwind sm

  const handleSubmenuToggle = (type: 'nucleo' | 'usuario' | 'caso' | 'fechas' | 'semestre', e: React.MouseEvent<HTMLButtonElement>) => {
    if (activeSubmenu === type) {
      setActiveSubmenu(null);
    } else {
      const buttonRect = e.currentTarget.getBoundingClientRect();
      const menuRect = menuRef.current?.getBoundingClientRect();
      const submenuWidth = 240; // Mantener ancho consistente de 240px para todos los submenús

      const margin = 8;
      const estimatedSubmenuHeight = 300; // Altura máxima aproximada definida en el CSS (max-h-300)

      // Base: alinear el top del submenú con el componente que lo activó
      let topPosition = buttonRect.top;

      // Si el submenú se sale por abajo de la pantalla, lo ajustamos hacia arriba
      const spaceBelow = window.innerHeight - topPosition - margin;
      if (spaceBelow < estimatedSubmenuHeight) {
        // Lo subimos lo necesario para que quepa, pero sin pasarnos del tope de la pantalla
        topPosition = Math.max(margin, window.innerHeight - estimatedSubmenuHeight - margin);
      }

      if (isMobileViewport()) {
        setSubmenuPosition({
          top: topPosition,
          left: margin,
          width: submenuWidth,
        });
      } else if (menuRect) {
        const preferredLeft = menuRect.left - margin - submenuWidth;
        const alternativeLeft = menuRect.right + margin;
        const maxLeft = Math.max(margin, window.innerWidth - submenuWidth - margin);

        const left =
          preferredLeft >= margin
            ? preferredLeft
            : (alternativeLeft + submenuWidth <= window.innerWidth - margin
              ? alternativeLeft
              : clamp(preferredLeft, margin, maxLeft));

        setSubmenuPosition({
          top: topPosition,
          left,
          width: submenuWidth,
        });
      }
      setActiveSubmenu(type);
    }
  };

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideMenu = menuRef.current?.contains(target);
      const isInsideSubmenu = submenuRef.current?.contains(target);
      const isInsideTrigger = triggerRef.current?.contains(target);
      const isInsideDatePicker = (target as Element).closest?.('.datepicker-portal') !== null;

      if (activeSubmenu === 'fechas' && isInsideSubmenu) {
        return;
      }

      if (!isInsideMenu && !isInsideSubmenu && !isInsideTrigger && !isInsideDatePicker) {
        setIsOpen(false);
        setActiveSubmenu(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, activeSubmenu]);

  const activeFilterCount =
    (nucleoFilter ? 1 : 0) +
    (usuarioFilter.length > 0 ? 1 : 0) +
    (caseFilter.length > 0 ? 1 : 0) +
    (misCasosFilter ? 1 : 0) +
    (dateRangeFilter !== 'all' ? 1 : 0) +
    (termFilter && termFilter !== 'all' ? 1 : 0);

  const hasActiveFilter = activeFilterCount > 0;

  const handleClearFilters = () => {
    onNucleoFilterChange('');
    onUsuarioFilterChange([]);
    onCaseFilterChange([]);
    onMisCasosFilterChange(false);
    onDateRangeFilterChange('all');
    onCustomDateStartChange('');
    onCustomDateEndChange('');
    onTermChange?.('');
    setActiveSubmenu(null);
  };

  // Preparar opciones
  const nucleoOptions = filterOptions.nucleos.map((n) => ({
    // El filtro en AppointmentsClient compara contra el texto de location,
    // así que aquí usamos el nombre (no el id) como valor.
    value: n.nombre_nucleo,
    label: n.nombre_nucleo,
  }));

  const usuarioOptions = filterOptions.usuarios.map((u) => ({
    value: u.cedula,
    label: u.nombre_completo,
  }));

  const casoOptions = filterOptions.casos.map((c) => ({
    value: c.id_caso.toString(),
    label: `C-${c.id_caso} - ${c.tramite}`,
  }));

  const semestreOptions = (semestresOptions || []).map((s) => ({
    value: s.term,
    label: s.term,
  }));

  // Renderizar submenú
  const renderSubmenu = () => {
    if (!activeSubmenu) return null;
    if (typeof document === 'undefined') return null;

    // Submenú de Fechas
    if (activeSubmenu === 'fechas') {
      return createPortal(
        <AnimatePresence>
          <motion.div
            key="fechas-submenu"
            ref={submenuRef}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              top: submenuPosition.top,
              left: submenuPosition.left,
              zIndex: 10000,
              width: submenuPosition.width || undefined,
            }}
            className="bg-white border border-gray-300 rounded-2xl shadow-lg w-auto p-4"
          >
            <div className="space-y-3">
              {/* Opciones rápidas de fecha */}
              {['all', 'today', 'week', 'month'].map((range) => (
                <motion.button
                  key={range}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
                  onClick={() => {
                    onDateRangeFilterChange(range);
                    if (range !== 'custom') {
                      setActiveSubmenu(null);
                    }
                  }}
                  className={`w-full px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-end ${dateRangeFilter === range
                    ? 'bg-primary-light text-primary font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {range === 'all' && 'Todas las fechas'}
                  {range === 'today' && 'Hoy'}
                  {range === 'week' && 'Última semana'}
                  {range === 'month' && 'Último mes'}
                </motion.button>
              ))}

              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
                onClick={() => onDateRangeFilterChange('custom')}
                className={`w-full px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-end ${dateRangeFilter === 'custom'
                  ? 'bg-primary-light text-primary font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                Rango personalizado
              </motion.button>

              {dateRangeFilter === 'custom' && (
                <div className="mt-3 space-y-2 pl-2 border-l-2 border-primary-light">
                  <DatePicker
                    label="Fecha inicio"
                    value={customDateStart}
                    onChange={(value) => onCustomDateStartChange(value || '')}
                  />
                  <DatePicker
                    label="Fecha fin"
                    value={customDateEnd}
                    onChange={(value) => onCustomDateEndChange(value || '')}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      );
    }

    // Submenús de selección simple/múltiple
    let options: { value: string; label: string }[] = [];
    let filterValue: string | string[] = '';
    let isMultiple = false;
    let handler: ((value: string) => void) | ((values: string[]) => void) = () => { };
    let allLabel = '';

    switch (activeSubmenu) {
      case 'nucleo':
        options = nucleoOptions;
        filterValue = nucleoFilter;
        handler = onNucleoFilterChange;
        allLabel = 'Todos los núcleos';
        break;
      case 'usuario':
        options = usuarioOptions;
        filterValue = usuarioFilter;
        isMultiple = true;
        handler = onUsuarioFilterChange;
        allLabel = 'Todos los usuarios';
        break;
      case 'caso':
        options = casoOptions;
        filterValue = caseFilter;
        isMultiple = true;
        handler = onCaseFilterChange;
        allLabel = 'Todos los casos';
        break;
      case 'semestre':
        options = semestreOptions;
        filterValue = termFilter || '';
        handler = onTermChange || (() => {});
        allLabel = 'Todos los semestres';
        break;
    }

    return createPortal(
      <AnimatePresence>
        <motion.div
          key="submenu"
          ref={submenuRef}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'fixed',
            top: submenuPosition.top,
            left: submenuPosition.left,
            zIndex: 10000,
            width: submenuPosition.width || undefined,
          }}
          className="bg-white border border-gray-300 rounded-2xl shadow-lg w-auto p-2 max-h-[300px] overflow-y-auto"
        >
          {/* Opción "Todos" */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
            onClick={() => {
              if (isMultiple) {
                (handler as (values: string[]) => void)([]);
              } else {
                (handler as (value: string) => void)('');
                setActiveSubmenu(null);
              }
            }}
            className={`w-full px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-end ${(isMultiple ? (filterValue as string[]).length === 0 : filterValue === '')
              ? 'bg-primary-light text-primary font-medium'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <div className="flex-1" />
            {allLabel}
          </motion.button>

          {/* Opciones */}
          {options.map((option) => {
            const isSelected = isMultiple
              ? (filterValue as string[]).includes(option.value)
              : filterValue === option.value;

            return (
              <motion.button
                key={option.value}
                type="button"
                whileTap={{ scale: 0.95 }}
                whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
                onClick={() => {
                  if (isMultiple) {
                    const currentValues = filterValue as string[];
                    if (isSelected) {
                      (handler as (values: string[]) => void)(currentValues.filter(v => v !== option.value));
                    } else {
                      (handler as (values: string[]) => void)([...currentValues, option.value]);
                    }
                  } else {
                    (handler as (value: string) => void)(option.value);
                    setActiveSubmenu(null);
                  }
                }}
                className={`w-full px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${isSelected
                  ? 'bg-primary-light text-primary font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {isMultiple && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => { }}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                  />
                )}
                <div className="flex-1" />
                <span className="truncate">{option.label}</span>
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>,
      document.body
    );
  };

  // Solo mostrar el filtro en vista de lista o agendadas
  const shouldRender = viewMode === 'list' || viewMode === 'scheduled';
  if (!shouldRender) return null;

  return (
    <div className="relative">
      {/* Botón trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (isOpen) {
            setIsOpen(false);
            setActiveSubmenu(null);
            return;
          }

          const rect = triggerRef.current?.getBoundingClientRect();
          if (!rect) return;

          const margin = 8;
          const isMobile = isMobileViewport();
          const width = 240; // Mantener ancho consistente de 240px tanto en móvil como desktop
          const maxLeft = Math.max(margin, window.innerWidth - width - margin);
          const left = isMobile ? margin : clamp(rect.right - width, margin, maxLeft);

          setMenuPosition({
            top: rect.bottom + 8,
            left,
            width,
          });

          setIsOpen(true);
        }}
        className={`h-10 w-full sm:w-auto px-4 cursor-pointer rounded-full bg-transparent border border-primary text-foreground flex items-center justify-center gap-1.5 whitespace-nowrap hover:bg-primary-light transition-colors ${hasActiveFilter ? 'bg-primary-light border-primary-dark' : ''
          }`}
      >
        <FilterIcon className="w-[18px] h-[18px] text-[#414040]" />
        <span className="text-base text-center">Filtro</span>
        {hasActiveFilter && (
          <span className="ml-1 bg-primary text-on-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Menú principal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.1 }}
              ref={menuRef}
              style={{
                position: 'fixed',
                top: menuPosition.top,
                left: menuPosition.left,
                zIndex: 9999,
                width: menuPosition.width || undefined,
              }}
              className="bg-white border border-gray-300 rounded-2xl shadow-lg w-auto p-2"
            >
              {/* Opción: Rango de Fechas */}
              <motion.button
                ref={activeSubmenu === 'fechas' ? activeButtonRef : undefined}
                type="button"
                whileTap={{ scale: 0.95 }}
                whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
                onClick={(e) => handleSubmenuToggle('fechas', e)}
                className={`w-full px-3 py-2.5 text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-end gap-2 ${activeSubmenu === 'fechas'
                  ? 'bg-primary-light text-primary'
                  : dateRangeFilter !== 'all'
                    ? 'text-primary hover:bg-gray-100'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <ChevronLeft className={`w-4 h-4 transition-transform ${activeSubmenu === 'fechas' ? '-rotate-90' : ''}`} />
                <div className="flex-1" />
                <span>Rango de fechas</span>
                <Calendar className="w-4 h-4" />
              </motion.button>
              <div className="border-t border-gray-200 my-2"></div>

              {/* Opción: Semestre */}
              <motion.button
                ref={activeSubmenu === 'semestre' ? activeButtonRef : undefined}
                type="button"
                whileTap={{ scale: 0.95 }}
                whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
                onClick={(e) => handleSubmenuToggle('semestre', e)}
                className={`w-full px-3 py-2.5 text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-end gap-2 ${activeSubmenu === 'semestre'
                  ? 'bg-primary-light text-primary'
                  : (termFilter && termFilter !== 'all')
                    ? 'text-primary hover:bg-gray-100'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <ChevronLeft className={`w-4 h-4 transition-transform ${activeSubmenu === 'semestre' ? '-rotate-90' : ''}`} />
                <div className="flex-1" />
                <span>Semestre</span>
                <BookOpen className="w-4 h-4" />
              </motion.button>
              <div className="border-t border-gray-200 my-2"></div>

              {/* Opción: Núcleo */}
              <motion.button
                ref={activeSubmenu === 'nucleo' ? activeButtonRef : undefined}
                type="button"
                whileTap={{ scale: 0.95 }}
                whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
                onClick={(e) => handleSubmenuToggle('nucleo', e)}
                className={`w-full px-3 py-2.5 text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-end gap-2 ${activeSubmenu === 'nucleo'
                  ? 'bg-primary-light text-primary'
                  : nucleoFilter
                    ? 'text-primary hover:bg-gray-100'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <ChevronLeft className={`w-4 h-4 transition-transform ${activeSubmenu === 'nucleo' ? '-rotate-90' : ''}`} />
                <div className="flex-1" />
                <span>Núcleo</span>
                <Layers className="w-4 h-4" />
              </motion.button>
              <div className="border-t border-gray-200 my-2"></div>

              {/* Opción: Usuario que Atendió */}
              <motion.button
                ref={activeSubmenu === 'usuario' ? activeButtonRef : undefined}
                type="button"
                whileTap={{ scale: 0.95 }}
                whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
                onClick={(e) => handleSubmenuToggle('usuario', e)}
                className={`w-full px-3 py-2.5 text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-end gap-2 ${activeSubmenu === 'usuario'
                  ? 'bg-primary-light text-primary'
                  : usuarioFilter.length > 0
                    ? 'text-primary hover:bg-gray-100'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <ChevronLeft className={`w-4 h-4 transition-transform ${activeSubmenu === 'usuario' ? '-rotate-90' : ''}`} />
                <div className="flex-1" />
                <span>Usuario que Atendió</span>
                <Users className="w-4 h-4" />
              </motion.button>
              <div className="border-t border-gray-200 my-2"></div>

              {/* Opción: Caso */}
              <motion.button
                ref={activeSubmenu === 'caso' ? activeButtonRef : undefined}
                type="button"
                whileTap={{ scale: 0.95 }}
                whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
                onClick={(e) => handleSubmenuToggle('caso', e)}
                className={`w-full px-3 py-2.5 text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-end gap-2 ${activeSubmenu === 'caso'
                  ? 'bg-primary-light text-primary'
                  : caseFilter.length > 0
                    ? 'text-primary hover:bg-gray-100'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <ChevronLeft className={`w-4 h-4 transition-transform ${activeSubmenu === 'caso' ? '-rotate-90' : ''}`} />
                <div className="flex-1" />
                <span>Caso</span>
                <FileText className="w-4 h-4" />
              </motion.button>
              <div className="border-t border-gray-200 my-2"></div>

              {/* Opción: Mis Casos (toggle) */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
                onClick={() => onMisCasosFilterChange(!misCasosFilter)}
                className={`w-full px-3 py-2.5 text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-end gap-2 group ${misCasosFilter ? 'text-red-600' : 'text-gray-600'
                  }`}
              >
                <div className="flex-1" />
                <span>Mis casos</span>
                <UserCheck className={`w-4 h-4 ${misCasosFilter ? 'text-red-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              </motion.button>
              <div className="border-t border-gray-200 my-2"></div>

              {/* Botón limpiar filtros */}
              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="w-full px-3 py-2 text-sm text-center text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Limpiar filtros
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Submenú flotante a la izquierda */}
      {renderSubmenu()}
    </div>
  );
}
