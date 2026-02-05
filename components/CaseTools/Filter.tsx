'use client';
import {
  Activity,
  BookOpen,
  Building2,
  Calendar,
  ChevronLeft,
  Clock,
  FileText,
  Filter as FilterIcon,
  Flag,
  User,
  UserCheck,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { createPortal } from 'react-dom';
import { getNucleosAction } from '@/app/actions/nucleos';
import DatePicker from '@/components/forms/DatePicker';

interface FilterProps {
  nucleoFilter?: string;
  tramiteFilter?: string;
  estatusFilter?: string;
  estadoCivilFilter?: string;
  nacionalidadFilter?: string;
  casosAsignadosFilter?: boolean;
  onClearFilters?: () => void | Promise<void>;
  onNucleoChange?: (value: string) => void;
  onTramiteChange?: (value: string) => void;
  onEstatusChange?: (value: string) => void;
  onEstadoCivilChange?: (value: string) => void;
  onNacionalidadChange?: (value: string) => void;
  onCasosAsignadosChange?: (value: boolean) => void;
  nucleoOptions?: { value: string; label: string }[];
  estadoCivilOptions?: { value: string; label: string }[];
  nacionalidadOptions?: { value: string; label: string }[];
  tramiteOptions: { value: string; label: string }[];
  estatusOptions: { value: string; label: string }[];
  estatusLabel?: string;
  showCasosAsignados?: boolean;
  materiaFilter?: string;
  onMateriaChange?: (value: string) => void;
  materias?: { id_materia: number; nombre_materia: string; habilitado?: boolean }[];
  materiaOptions?: { value: string; label: string }[];
  nucleoLabel?: string;
  nucleoAllLabel?: string;
  fechaInicio?: string;
  fechaFin?: string;
  onFechaInicioChange?: (value: string) => void;
  onFechaFinChange?: (value: string) => void;
  termFilter?: string;
  onTermChange?: (value: string) => void;
  termOptions?: { value: string; label: string }[];
  showDateRange?: boolean;
  recentActivityFilter?: boolean;
  onRecentActivityChange?: (value: boolean) => void;
  showRecentActivity?: boolean;
}

function Filter({
  nucleoFilter,
  tramiteFilter,
  estatusFilter,
  estadoCivilFilter,
  nacionalidadFilter,
  casosAsignadosFilter,
  onClearFilters,
  onNucleoChange,
  onTramiteChange,
  onEstatusChange,
  onEstadoCivilChange,
  onNacionalidadChange,
  onCasosAsignadosChange,
  nucleoOptions,
  estadoCivilOptions = [
    { value: 'Soltero', label: 'Soltero' },
    { value: 'Casado', label: 'Casado' },
    { value: 'Divorciado', label: 'Divorciado' },
    { value: 'Viudo', label: 'Viudo' },
  ],
  nacionalidadOptions = [
    { value: 'V', label: 'Venezolano (V)' },
    { value: 'E', label: 'Extranjero (E)' },
  ],
  tramiteOptions,
  estatusOptions,
  estatusLabel = 'Estatus',
  showCasosAsignados = false,
  materiaFilter,
  onMateriaChange,
  materias = [],
  materiaOptions,
  nucleoLabel = 'Núcleo',
  nucleoAllLabel = 'Todos los núcleos',
  fechaInicio,
  fechaFin,
  onFechaInicioChange,
  onFechaFinChange,
  termFilter,
  onTermChange,
  termOptions,
  showDateRange = false,
  recentActivityFilter,
  onRecentActivityChange,
  showRecentActivity = false,
}: FilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<
    'nucleo' | 'materia' | 'term' | 'tramite' | 'estatus' | 'estadoCivil' | 'nacionalidad' | 'fechas' | null
  >(null);
  const [nucleos, setNucleos] = useState<Array<{ id_nucleo: number; nombre_nucleo: string; habilitado?: boolean }>>([]);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });
  const [submenuPosition, setSubmenuPosition] = useState({ top: 0, left: 0, width: 0 });

  const menuRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRectRef = useRef<DOMRect | null>(null);

  const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
  const isMobileViewport = () => window.innerWidth < 640; // Tailwind sm

  const formatISODate = (date: Date): string => date.toISOString().slice(0, 10);
  const addDays = (base: Date, days: number): Date => {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    return d;
  };

  const todayISO = formatISODate(new Date());
  const weekStartISO = formatISODate(addDays(new Date(), -7));
  const monthStartISO = formatISODate(addDays(new Date(), -30));

  const inferredDateRange = (() => {
    if (!fechaInicio && !fechaFin) return 'all';
    if (fechaInicio === todayISO && fechaFin === todayISO) return 'today';
    if (fechaInicio === weekStartISO && fechaFin === todayISO) return 'week';
    if (fechaInicio === monthStartISO && fechaFin === todayISO) return 'month';
    return 'custom';
  })();

  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>(() => inferredDateRange);

  useEffect(() => {
    if (dateRangeFilter === 'custom') {
      if (!fechaInicio && !fechaFin) {
        setDateRangeFilter('all');
      }
      return;
    }

    setDateRangeFilter(inferredDateRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaInicio, fechaFin, inferredDateRange]);

  // Cargar núcleos al montar el componente
  useEffect(() => {
    const loadNucleos = async () => {
      const result = await getNucleosAction();
      if (result.success && result.data) {
        setNucleos(result.data);
      }
    };
    loadNucleos();
  }, []);

  // Eliminar useEffect de posicionamiento automático y usar el evento de click
  const handleSubmenuToggle = (
    type: 'nucleo' | 'materia' | 'term' | 'tramite' | 'estatus' | 'estadoCivil' | 'nacionalidad' | 'fechas',
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (activeSubmenu === type) {
      setActiveSubmenu(null);
    } else {
      const buttonRect = e.currentTarget.getBoundingClientRect();
      const menuRect = menuRef.current?.getBoundingClientRect();

      const margin = 8;
      const width = type === 'fechas' ? 200 : 180;

      if (!menuRect || isMobileViewport()) {
        // En móvil: abrir el submenú como panel sobre el menú (mismo ancho) para evitar overflow lateral
        const mobileWidth = Math.max(180, window.innerWidth - margin * 2);
        setSubmenuPosition({
          top: (menuRect?.top ?? buttonRect.bottom) + 8,
          left: margin,
          width: mobileWidth,
        });
      } else {
        // Desktop: preferir abrir a la izquierda del menú; si no cabe, abrir a la derecha
        const preferredLeft = menuRect.left - margin - width;
        const alternativeLeft = menuRect.right + margin;
        const maxLeft = Math.max(margin, window.innerWidth - width - margin);

        const nextLeft =
          preferredLeft >= margin
            ? preferredLeft
            : alternativeLeft + width <= window.innerWidth - margin
              ? alternativeLeft
              : clamp(preferredLeft, margin, maxLeft);

        setSubmenuPosition({
          top: buttonRect.top,
          left: nextLeft,
          width,
        });
      }
      setActiveSubmenu(type);
    }
  };

  useEffect(() => {
    if (!isBrowser || !isOpen) return;

    const margin = 8;
    const rect = lastTriggerRectRef.current;
    const menuRect = menuRef.current?.getBoundingClientRect();
    if (!rect || !menuRect) return;

    if (isMobileViewport()) {
      const width = Math.max(180, window.innerWidth - margin * 2);
      setMenuPosition({
        top: menuPosition.top,
        left: margin,
        width,
      });
      return;
    }

    const width = menuRect.width;
    const maxLeft = Math.max(margin, window.innerWidth - width - margin);
    const left = clamp(rect.right - width, margin, maxLeft);
    setMenuPosition({
      top: menuPosition.top,
      left,
      width: 0,
    });
  }, [isBrowser, isOpen, menuPosition.top]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideMenu = menuRef.current?.contains(target);
      const isInsideSubmenu = submenuRef.current?.contains(target);
      const isInsideTrigger = triggerRef.current?.contains(target);

      // Verificar si el clic está dentro del calendario del DatePicker (que usa createPortal)
      const isInsideDatePicker = (target as Element).closest?.('.datepicker-portal') !== null;

      // Si el submenú de fechas está activo, no cerrar el menú principal al hacer clic dentro del submenú
      // Esto permite que los DatePicker funcionen correctamente
      if (activeSubmenu === 'fechas' && isInsideSubmenu) {
        return; // No cerrar si estamos dentro del submenú de fechas
      }

      if (!isInsideMenu && !isInsideSubmenu && !isInsideTrigger && !isInsideDatePicker) {
        setIsOpen(false);
        setActiveSubmenu(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Actualizar posición al hacer scroll para que el submenú siga al botón si es necesario (opcional)
      // window.addEventListener('scroll', () => setActiveSubmenu(null)); 
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, activeSubmenu]);

  const activeFilterCount =
    (nucleoFilter ? 1 : 0) +
    (tramiteFilter ? 1 : 0) +
    (estatusFilter ? 1 : 0) +
    (estadoCivilFilter ? 1 : 0) +
    (nacionalidadFilter ? 1 : 0) +
    (casosAsignadosFilter ? 1 : 0) +
    (casosAsignadosFilter ? 1 : 0) +
    (materiaFilter ? 1 : 0) +
    (termFilter ? 1 : 0) +
    ((fechaInicio || fechaFin) ? 1 : 0) +
    (recentActivityFilter ? 1 : 0);

  const hasActiveFilter = activeFilterCount > 0;

  const handleClearFilters = async () => {
    try {
      if (onClearFilters) {
        await onClearFilters();
      } else {
        if (onNucleoChange) onNucleoChange('');
        if (onTramiteChange) onTramiteChange('');
        if (onEstatusChange) onEstatusChange('');
        if (onEstadoCivilChange) onEstadoCivilChange('');
        if (onNacionalidadChange) onNacionalidadChange('');
        if (onMateriaChange) onMateriaChange('');
        if (onTermChange) onTermChange('');
        if (onCasosAsignadosChange) onCasosAsignadosChange(false);
        if (onFechaInicioChange) onFechaInicioChange('');
        if (onFechaFinChange) onFechaFinChange('');
        if (onRecentActivityChange) onRecentActivityChange(false);
      }
    } catch (e) {
      console.error('Error al limpiar filtros:', e);
    } finally {
      setActiveSubmenu(null);
      setIsOpen(false);
    }
  };

  const renderSubmenu = () => {
    if (!isBrowser) return null;

    // Usar opciones guardadas si se está cerrando
    // Si hay un submenú activo, ya se habrá actualizado el efecto o se usará currentOptions del render anterior si coincide
    // Pero mejor recalcular si está activo para reactividad instantánea, o confiar en el efecto.
    // El efecto puede tener un ligero retraso. Para evitar parpadeo al abrir, calculamos si está activo.

    let options: { value: string; label: string }[] = [];
    let filterValue = '';
    let handler: (value: string) => void = () => { };
    let allLabel = '';

    if (activeSubmenu) {
      switch (activeSubmenu) {
        case 'nucleo':
          if (nucleoOptions && nucleoOptions.length > 0) {
            options = nucleoOptions;
          } else {
            options = nucleos.map(n => ({ value: n.id_nucleo.toString(), label: n.nombre_nucleo }));
          }
          handler = onNucleoChange || (() => { });
          allLabel = nucleoAllLabel;
          break;
        case 'tramite':
          options = tramiteOptions;
          handler = onTramiteChange || (() => { });
          allLabel = 'Todos los trámites';
          break;
        case 'materia':
          options = (materiaOptions && materiaOptions.length > 0)
            ? materiaOptions
            : materias
              .filter((m) => m.habilitado !== false)
              .map(m => ({ value: m.id_materia.toString(), label: m.nombre_materia }));
          handler = onMateriaChange || (() => { });
          allLabel = 'Todas las materias';
          break;
        case 'term':
          options = termOptions || [];
          handler = onTermChange || (() => { });
          allLabel = 'Todos los semestres';
          break;
        case 'estatus':
          options = estatusOptions;
          handler = onEstatusChange || (() => { });
          allLabel = `Todos los ${estatusLabel.toLowerCase()}`;
          break;
        case 'estadoCivil':
          options = estadoCivilOptions;
          handler = onEstadoCivilChange || (() => { });
          allLabel = 'Todos los estados civiles';
          break;
        case 'nacionalidad':
          options = nacionalidadOptions;
          handler = onNacionalidadChange || (() => { });
          allLabel = 'Todas las nacionalidades';
          break;
      }
    }

    // Resolver filterValue dinámicamente
    switch (activeSubmenu) {
      case 'nucleo':
        filterValue = nucleoFilter || '';
        break;
      case 'materia':
        filterValue = materiaFilter || '';
        break;
      case 'term':
        filterValue = termFilter || '';
        break;
      case 'tramite':
        filterValue = tramiteFilter || '';
        break;
      case 'estatus':
        filterValue = estatusFilter || '';
        break;
      case 'estadoCivil':
        filterValue = estadoCivilFilter || '';
        break;
      case 'nacionalidad':
        filterValue = nacionalidadFilter || '';
        break;
    }

    // Si es el submenú de fechas, renderizar DatePickers
    if (activeSubmenu === 'fechas') {
      return createPortal(
        <AnimatePresence>
          {activeSubmenu === 'fechas' && (
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
              className="bg-white border border-gray-300 rounded-2xl shadow-lg w-[200px] p-4 max-h-[calc(100vh-120px)] overflow-y-auto shadow-xl"
            >
              <div className="space-y-3">
                {/* Opciones rápidas de fecha (mismo patrón que Citas) */}
                {(['all', 'today', 'week', 'month'] as const).map((range) => (
                  <motion.button
                    key={range}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
                    onClick={() => {
                      if (!onFechaInicioChange || !onFechaFinChange) return;

                      setDateRangeFilter(range);

                      if (range === 'all') {
                        onFechaInicioChange('');
                        onFechaFinChange('');
                        setActiveSubmenu(null);
                        return;
                      }

                      if (range === 'today') {
                        onFechaInicioChange(todayISO);
                        onFechaFinChange(todayISO);
                        setActiveSubmenu(null);
                        return;
                      }

                      if (range === 'week') {
                        onFechaInicioChange(weekStartISO);
                        onFechaFinChange(todayISO);
                        setActiveSubmenu(null);
                        return;
                      }

                      // month
                      onFechaInicioChange(monthStartISO);
                      onFechaFinChange(todayISO);
                      setActiveSubmenu(null);
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
                <div className="border-t border-gray-200 my-2" />

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
                  onClick={() => {
                    setDateRangeFilter('custom');
                  }}
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
                      value={fechaInicio || ''}
                      onChange={(value) => {
                        if (onFechaInicioChange) onFechaInicioChange(value || '');
                      }}
                    />
                    <DatePicker
                      label="Fecha fin"
                      value={fechaFin || ''}
                      onChange={(value) => {
                        if (onFechaFinChange) onFechaFinChange(value || '');
                      }}
                    />
                    {(fechaInicio || fechaFin) && (
                      <button
                        type="button"
                        onClick={() => {
                          if (onFechaInicioChange) onFechaInicioChange('');
                          if (onFechaFinChange) onFechaFinChange('');
                          setDateRangeFilter('all');
                        }}
                        className="w-full px-3 py-2 text-sm text-center text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Limpiar fechas
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      );
    }


    return createPortal(
      <AnimatePresence>
        {activeSubmenu && (
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
            className="bg-white border border-gray-300 rounded-2xl shadow-lg w-[180px] p-2 max-h-[calc(100vh-120px)] overflow-y-auto shadow-xl"
          >
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
              onClick={() => {
                handler('');
                setActiveSubmenu(null);
              }}
              className={`w-full px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-end text-right ${filterValue === ''
                ? 'bg-primary-light text-primary font-medium'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <div className="flex-1" />
              {allLabel}
            </motion.button>
            {options.map((option) => (
              <motion.button
                key={option.value}
                type="button"
                whileTap={{ scale: 0.95 }}
                whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
                onClick={() => {
                  handler(option.value);
                  setActiveSubmenu(null);
                }}
                className={`w-full px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-end text-right ${filterValue === option.value
                  ? 'bg-primary-light text-primary font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <div className="flex-1" />
                {option.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    );
  };

  return (
    <div className="relative">
      {/* Botón trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          const rect = triggerRef.current?.getBoundingClientRect();
          if (rect) {
            lastTriggerRectRef.current = rect;
            setMenuPosition({
              top: rect.bottom + 8,
              left: rect.left,
              width: 0,
            });
          }
          setIsOpen(!isOpen);
          if (isOpen) setActiveSubmenu(null);
        }}
        className={`h-10 w-full sm:w-auto px-4 cursor-pointer rounded-full bg-transparent border border-primary text-foreground flex items-center justify-center gap-1.5 whitespace-nowrap hover:bg-primary-light transition-colors ${hasActiveFilter ? 'bg-primary-light border-primary-dark' : ''}`}
      >
        <FilterIcon className="w-[18px] h-[18px] text-[#414040]" />
        <span className="text-base text-right">Filtro</span>
        {hasActiveFilter && (
          <span className="ml-1 bg-primary text-on-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Menú principal */}
      {isBrowser &&
        createPortal(
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
                className="bg-white border border-gray-300 rounded-2xl shadow-lg w-auto min-w-[180px] p-2 max-h-[calc(100vh-120px)] overflow-y-auto shadow-xl"
              >
                {/* Opción: Rango de Fechas */}
                {showDateRange && (onFechaInicioChange || onFechaFinChange) && (
                  <>
                    <motion.button
                      ref={activeSubmenu === 'fechas' ? activeButtonRef : undefined}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
                      onClick={(e) => handleSubmenuToggle('fechas', e)}
                      className={`w-full px-3 py-2.5 text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-end gap-2 ${activeSubmenu === 'fechas'
                        ? 'bg-primary-light text-primary'
                        : fechaInicio || fechaFin
                          ? 'text-primary hover:bg-gray-100'
                          : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      <ChevronLeft
                        className={`w-4 h-4 transition-transform ${activeSubmenu === 'fechas' ? '-rotate-90' : ''}`}
                      />
                      <div className="flex-1" />
                      <span>Rango de fechas</span>
                      <Calendar className="w-4 h-4" />
                    </motion.button>
                    <div className="border-t border-gray-200 my-2"></div>
                  </>
                )}

                {/* Opción: Núcleo */}
                {onNucleoChange && (
                  <>
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
                          : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      <ChevronLeft
                        className={`w-4 h-4 transition-transform ${activeSubmenu === 'nucleo' ? '-rotate-90' : ''}`}
                      />
                      <div className="flex-1" /> {/* Spacer agregado nuevamente para asegurar alineación derecha */}
                      <span>{nucleoLabel}</span>
                      <Building2 className="w-4 h-4" />
                    </motion.button>
                    <div className="border-t border-gray-200 my-2"></div>
                  </>
                )}

                {/* Opción: Estado civil */}
                {onEstadoCivilChange && (
                  <>
                    <motion.button
                      ref={activeSubmenu === 'estadoCivil' ? activeButtonRef : undefined}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
                      onClick={(e) => handleSubmenuToggle('estadoCivil', e)}
                      className={`w-full px-3 py-2.5 text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-end gap-2 ${activeSubmenu === 'estadoCivil'
                        ? 'bg-primary-light text-primary'
                        : estadoCivilFilter
                          ? 'text-primary hover:bg-gray-100'
                          : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <ChevronLeft className={`w-4 h-4 transition-transform ${activeSubmenu === 'estadoCivil' ? '-rotate-90' : ''}`} />
                      <div className="flex-1" />
                      <span>Estado civil</span>
                      <User className="w-4 h-4" />
                    </motion.button>
                    <div className="border-t border-gray-200 my-2"></div>
                  </>
                )}

                {/* Opción: Nacionalidad */}
                {onNacionalidadChange && (
                  <>
                    <motion.button
                      ref={activeSubmenu === 'nacionalidad' ? activeButtonRef : undefined}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
                      onClick={(e) => handleSubmenuToggle('nacionalidad', e)}
                      className={`w-full px-3 py-2.5 text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-end gap-2 ${activeSubmenu === 'nacionalidad'
                        ? 'bg-primary-light text-primary'
                        : nacionalidadFilter
                          ? 'text-primary hover:bg-gray-100'
                          : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <ChevronLeft className={`w-4 h-4 transition-transform ${activeSubmenu === 'nacionalidad' ? '-rotate-90' : ''}`} />
                      <div className="flex-1" />
                      <span>Nacionalidad</span>
                      <Flag className="w-4 h-4" />
                    </motion.button>
                    <div className="border-t border-gray-200 my-2"></div>
                  </>
                )}

                {/* Opción: Materia */}
                {onMateriaChange && (
                  <>
                    <motion.button
                      ref={activeSubmenu === 'materia' ? activeButtonRef : undefined}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
                      onClick={(e) => handleSubmenuToggle('materia', e)}
                      className={`w-full px-3 py-2.5 text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-end gap-2 ${activeSubmenu === 'materia'
                        ? 'bg-primary-light text-primary'
                        : materiaFilter
                          ? 'text-primary hover:bg-gray-100'
                          : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <ChevronLeft className={`w-4 h-4 transition-transform ${activeSubmenu === 'materia' ? '-rotate-90' : ''}`} />
                      <div className="flex-1" />
                      <span>Materia</span>
                      <BookOpen className="w-4 h-4" />
                    </motion.button>
                    <div className="border-t border-gray-200 my-2"></div>
                  </>
                )}

                {/* Opción: Semestre */}
                {onTermChange && (
                  <>
                    <motion.button
                      ref={activeSubmenu === 'term' ? activeButtonRef : undefined}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
                      onClick={(e) => handleSubmenuToggle('term', e)}
                      className={`w-full px-3 py-2.5 text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-end gap-2 ${activeSubmenu === 'term'
                        ? 'bg-primary-light text-primary'
                        : termFilter
                          ? 'text-primary hover:bg-gray-100'
                          : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <ChevronLeft className={`w-4 h-4 transition-transform ${activeSubmenu === 'term' ? '-rotate-90' : ''}`} />
                      <div className="flex-1" />
                      <span>Semestre</span>
                      <Calendar className="w-4 h-4" />
                    </motion.button>
                    <div className="border-t border-gray-200 my-2"></div>
                  </>
                )}

                {/* Opción: Trámite */}
                {onTramiteChange && (
                  <>
                    <motion.button
                      ref={activeSubmenu === 'tramite' ? activeButtonRef : undefined}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
                      onClick={(e) => handleSubmenuToggle('tramite', e)}
                      className={`w-full px-3 py-2.5 text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-end gap-2 ${activeSubmenu === 'tramite'
                        ? 'bg-primary-light text-primary'
                        : tramiteFilter
                          ? 'text-primary hover:bg-gray-100'
                          : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <ChevronLeft className={`w-4 h-4 transition-transform ${activeSubmenu === 'tramite' ? '-rotate-90' : ''}`} />
                      <div className="flex-1" />
                      <span>Trámite</span>
                      <FileText className="w-4 h-4" />
                    </motion.button>
                    <div className="border-t border-gray-200 my-2"></div>
                  </>
                )}

                {/* Opción: Estatus */}
                {onEstatusChange && (
                  <>
                    <motion.button
                      ref={activeSubmenu === 'estatus' ? activeButtonRef : undefined}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
                      onClick={(e) => handleSubmenuToggle('estatus', e)}
                      className={`w-full px-3 py-2.5 text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-end gap-2 ${activeSubmenu === 'estatus'
                        ? 'bg-primary-light text-primary'
                        : estatusFilter
                          ? 'text-primary hover:bg-gray-100'
                          : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <ChevronLeft className={`w-4 h-4 transition-transform ${activeSubmenu === 'estatus' ? '-rotate-90' : ''}`} />
                      <div className="flex-1" />
                      <span>{estatusLabel}</span>
                      <Activity className="w-4 h-4" />
                    </motion.button>
                    <div className="border-t border-gray-200 my-2"></div>
                  </>
                )}

                {/* Opción: Casos Asignados */}
                {showCasosAsignados && onCasosAsignadosChange && (
                  <>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
                      onClick={() => onCasosAsignadosChange(!casosAsignadosFilter)}
                      className={`w-full px-3 py-2.5 text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-end gap-2 group ${casosAsignadosFilter
                        ? 'text-red-600'
                        : 'text-gray-600'
                        }`}
                    >
                      <div className="flex-1" />
                      <span>Mis casos</span>
                      <UserCheck className={`w-4 h-4 ${casosAsignadosFilter ? 'text-red-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    </motion.button>
                    <div className="border-t border-gray-200 my-2"></div>
                  </>
                )}


                {/* Opción: Actividad Reciente */}
                {showRecentActivity && onRecentActivityChange && (
                  <>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
                      onClick={() => onRecentActivityChange(!recentActivityFilter)}
                      className={`w-full px-3 py-2.5 text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-end gap-2 group ${recentActivityFilter
                        ? 'text-primary'
                        : 'text-gray-600'
                        }`}
                    >
                      <div className="flex-1" />
                      <span>Actividad más reciente</span>
                      <Clock className={`w-4 h-4 ${recentActivityFilter ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    </motion.button>
                    <div className="border-t border-gray-200 my-2"></div>
                  </>
                )}


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

export default Filter;