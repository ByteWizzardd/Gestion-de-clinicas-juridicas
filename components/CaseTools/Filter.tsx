'use client';
import {
  Activity,
  BookOpen,
  Building,
  Building2,
  Calendar,
  ChevronLeft,
  Clock,
  FileText,
  Filter as FilterIcon,
  Flag,
  FolderTree,
  Hash,
  Home,
  Layers,
  MapPin,
  Tag,
  User,
  UserCheck,
  X,
  ArrowUpDown
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
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
  estadoCivilLabel?: string;
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
  tramiteOptions?: { value: string; label: string }[];
  tramiteLabel?: string;
  estatusOptions?: { value: string; label: string }[];
  estatusLabel?: string;
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
  nucleoIcon?: LucideIcon;
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
  operacionFilter?: string;
  onOperacionChange?: (value: string) => void;
  operacionOptions?: { value: string; label: string }[];
  operacionLabel?: string;
  // Filtro de Ordenamiento
  sortFilter?: string;
  onSortChange?: (value: string) => void;
  sortOptions?: { value: string; label: string }[];
  sortLabel?: string;
  tramiteIcon?: LucideIcon;
  estatusIcon?: LucideIcon;
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
  estadoCivilLabel = 'Estado civil',
  nacionalidadOptions = [
    { value: 'V', label: 'Venezolano (V)' },
    { value: 'E', label: 'Extranjero (E)' },
  ],
  estadoFilter,
  onEstadoChange,
  estadoOptions = [],
  estadoLabel = 'Estado',
  municipioFilter,
  onMunicipioChange,
  municipioOptions = [],
  municipioLabel = 'Municipio',
  parroquiaFilter,
  onParroquiaChange,
  parroquiaOptions = [],
  parroquiaLabel = 'Parroquia',
  tramiteOptions = [],
  tramiteLabel = 'Trámite',
  estatusOptions = [],
  estatusLabel = 'Estatus',
  showCasosAsignados = false,
  materiaFilter,
  onMateriaChange,
  materias = [],
  materiaOptions,
  materiaLabel = 'Materia',
  categoriaFilter,
  onCategoriaChange,
  categoriaOptions = [],
  categoriaLabel = 'Categoría',
  subcategoriaFilter,
  onSubcategoriaChange,
  subcategoriaOptions = [],
  subcategoriaLabel = 'Subcategoría',
  nucleoLabel = 'Núcleo',
  nucleoAllLabel = 'Todos los núcleos',
  nucleoIcon: NucleoIcon = Building,
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
  operacionFilter,
  onOperacionChange,
  operacionOptions = [],
  operacionLabel = 'Operación',
  sortFilter,
  onSortChange,
  sortOptions = [],
  sortLabel = 'Orden',
  tramiteIcon: TramiteIcon = FileText,
  estatusIcon: EstatusIcon = Activity,
}: FilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<
    | 'nucleo' | 'materia' | 'categoria' | 'subcategoria' | 'term' | 'tramite'
    | 'estatus' | 'estadoCivil' | 'nacionalidad' | 'fechas' | 'operacion'
    | 'sort' | 'estado' | 'municipio' | 'parroquia' | null
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
    type: 'nucleo' | 'materia' | 'categoria' | 'subcategoria' | 'term' | 'tramite' | 'estatus' | 'estadoCivil' | 'nacionalidad' | 'fechas' | 'operacion' | 'sort' | 'estado' | 'municipio' | 'parroquia',
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
        // En móvil: usar un ancho fijo razonable en lugar de ocupar toda la pantalla
        const mobileWidth = type === 'fechas' ? 220 : 190;
        const maxLeft = Math.max(margin, window.innerWidth - mobileWidth - margin);
        // Intentar alinear con el botón si es posible, si no, centrar o ajustar a márgenes
        const left = clamp(buttonRect.left, margin, maxLeft);

        setSubmenuPosition({
          top: (menuRect?.top ?? buttonRect.bottom) + 8,
          left,
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
      const width = 220; // Ancho fijo razonable para móvil
      const maxLeft = Math.max(margin, window.innerWidth - width - margin);
      const left = clamp(rect.left, margin, maxLeft);
      setMenuPosition({
        top: menuPosition.top,
        left,
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
    (estadoFilter ? 1 : 0) +
    (municipioFilter ? 1 : 0) +
    (parroquiaFilter ? 1 : 0) +
    (casosAsignadosFilter ? 1 : 0) +
    (materiaFilter ? 1 : 0) +
    (categoriaFilter ? 1 : 0) +
    (subcategoriaFilter ? 1 : 0) +
    (termFilter ? 1 : 0) +
    ((fechaInicio || fechaFin) ? 1 : 0) +
    (recentActivityFilter ? 1 : 0) +
    (operacionFilter ? 1 : 0) +
    (sortFilter ? 1 : 0);

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
        if (onEstadoChange) onEstadoChange('');
        if (onMunicipioChange) onMunicipioChange('');
        if (onParroquiaChange) onParroquiaChange('');
        if (onMateriaChange) onMateriaChange('');
        if (onCategoriaChange) onCategoriaChange('');
        if (onSubcategoriaChange) onSubcategoriaChange('');
        if (onTermChange) onTermChange('');
        if (onCasosAsignadosChange) onCasosAsignadosChange(false);
        if (onFechaInicioChange) onFechaInicioChange('');
        if (onFechaFinChange) onFechaFinChange('');
        if (onOperacionChange) onOperacionChange('');
        if (onSortChange) onSortChange('');
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
          allLabel = tramiteLabel.toLowerCase() === 'estado'
            ? 'Todos los estados'
            : tramiteLabel.toLowerCase() === 'trámite'
              ? 'Todos los trámites'
              : `Todos los ${tramiteLabel.toLowerCase()}`;
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
        case 'categoria':
          options = categoriaOptions;
          handler = onCategoriaChange || (() => { });
          allLabel = `Todas las categorías`;
          break;
        case 'subcategoria':
          options = subcategoriaOptions;
          handler = onSubcategoriaChange || (() => { });
          allLabel = `Todas las subcategorías`;
          break;
        case 'term':
          options = termOptions || [];
          handler = onTermChange || (() => { });
          allLabel = 'Todos los semestres';
          break;
        case 'estatus':
          options = estatusOptions;
          handler = onEstatusChange || (() => { });
          allLabel = estatusLabel.toLowerCase() === 'rol'
            ? 'Todos los roles'
            : `Todos los ${estatusLabel.toLowerCase()}`;
          break;
        case 'estadoCivil':
          options = estadoCivilOptions;
          handler = onEstadoCivilChange || (() => { });
          allLabel = `Todos los ${estadoCivilLabel.toLowerCase()}`;
          break;
        case 'nacionalidad':
          options = nacionalidadOptions;
          handler = onNacionalidadChange || (() => { });
          allLabel = 'Todas las nacionalidades';
          break;
        case 'estado':
          options = estadoOptions;
          handler = onEstadoChange || (() => { });
          allLabel = `Todos los estados`;
          break;
        case 'municipio':
          options = municipioOptions;
          handler = onMunicipioChange || (() => { });
          allLabel = `Todos los municipios`;
          break;
        case 'parroquia':
          options = parroquiaOptions;
          handler = onParroquiaChange || (() => { });
          allLabel = `Todas las parroquias`;
          break;
        case 'operacion':
          options = operacionOptions;
          handler = onOperacionChange || (() => { });
          allLabel = `Todas las operaciones`;
          break;
        case 'sort':
          options = sortOptions;
          handler = onSortChange || (() => { });
          allLabel = 'Orden por defecto';
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
      case 'categoria':
        filterValue = categoriaFilter || '';
        break;
      case 'subcategoria':
        filterValue = subcategoriaFilter || '';
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
      case 'estado':
        filterValue = estadoFilter || '';
        break;
      case 'municipio':
        filterValue = municipioFilter || '';
        break;
      case 'parroquia':
        filterValue = parroquiaFilter || '';
        break;
      case 'operacion':
        filterValue = operacionFilter || '';
        break;
      case 'sort':
        filterValue = sortFilter || '';
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
                maxHeight: isBrowser ? `calc(100vh - ${submenuPosition.top + 16}px)` : '450px',
              }}
              className="bg-[var(--dropdown-bg)] border border-[var(--dropdown-border)] rounded-2xl shadow-lg w-[200px] p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent shadow-xl transition-colors"
            >
              <div className="space-y-3">
                {/* Opciones rápidas de fecha (mismo patrón que Citas) */}
                {(['all', 'today', 'week', 'month'] as const).map((range) => (
                  <motion.button
                    key={range}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ x: 4, backgroundColor: 'var(--dropdown-hover)' }}
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
                      : 'text-[var(--card-text-muted)] hover:bg-[var(--dropdown-hover)]'
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
                  whileHover={{ x: 4, backgroundColor: 'var(--dropdown-hover)' }}
                  onClick={() => {
                    setDateRangeFilter('custom');
                  }}
                  className={`w-full px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-end ${dateRangeFilter === 'custom'
                    ? 'bg-primary-light text-primary font-medium'
                    : 'text-[var(--card-text-muted)] hover:bg-[var(--dropdown-hover)]'
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
              maxHeight: isBrowser ? `calc(100vh - ${submenuPosition.top + 16}px)` : '350px',
            }}
            className="bg-[var(--dropdown-bg)] border border-[var(--dropdown-border)] rounded-2xl shadow-lg w-[180px] p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent shadow-xl transition-colors"
          >
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              whileHover={{ x: 4, backgroundColor: 'var(--dropdown-hover)' }}
              onClick={() => {
                handler('');
                setActiveSubmenu(null);
              }}
              className={`w-full px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-end text-right ${filterValue === ''
                ? 'bg-primary-light text-primary font-medium'
                : 'text-[var(--card-text-muted)] hover:bg-[var(--dropdown-hover)]'
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
                whileHover={{ x: 4, backgroundColor: 'var(--dropdown-hover)' }}
                onClick={() => {
                  handler(option.value);
                  setActiveSubmenu(null);
                }}
                className={`w-full px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-end text-right ${filterValue === option.value
                  ? 'bg-primary-light text-primary font-medium'
                  : 'text-[var(--card-text-muted)] hover:bg-[var(--dropdown-hover)]'
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
        className={`h-10 w-full sm:w-auto px-4 cursor-pointer rounded-full bg-transparent border border-primary text-foreground flex items-center justify-center gap-1.5 whitespace-nowrap hover:bg-primary-light transition-all ${hasActiveFilter ? 'bg-primary-light border-primary-dark' : ''}`}
      >
        <FilterIcon className="w-[18px] h-[18px] text-foreground opacity-60" />
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
                  maxHeight: isBrowser ? `calc(100vh - ${menuPosition.top + 16}px)` : '450px',
                }}
                className="bg-[var(--dropdown-bg)] border border-[var(--dropdown-border)] rounded-2xl shadow-lg w-auto min-w-[180px] p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent shadow-xl transition-colors"
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
                      <span>{materiaLabel}</span>
                      <BookOpen className="w-4 h-4" />
                    </motion.button>
                    <div className="border-t border-gray-200 my-2"></div>
                  </>
                )}

                {/* Opción: Categoría */}
                {onCategoriaChange && (
                  <>
                    <motion.button
                      ref={activeSubmenu === 'categoria' ? activeButtonRef : undefined}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
                      onClick={(e) => handleSubmenuToggle('categoria', e)}
                      className={`w-full px-3 py-2.5 text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-end gap-2 ${activeSubmenu === 'categoria'
                        ? 'bg-primary-light text-primary'
                        : categoriaFilter
                          ? 'text-primary hover:bg-gray-100'
                          : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <ChevronLeft className={`w-4 h-4 transition-transform ${activeSubmenu === 'categoria' ? '-rotate-90' : ''}`} />
                      <div className="flex-1" />
                      <span>{categoriaLabel}</span>
                      <FolderTree className="w-4 h-4" />
                    </motion.button>
                    <div className="border-t border-gray-200 my-2"></div>
                  </>
                )}

                {/* Opción: Subcategoría */}
                {onSubcategoriaChange && (
                  <>
                    <motion.button
                      ref={activeSubmenu === 'subcategoria' ? activeButtonRef : undefined}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
                      onClick={(e) => handleSubmenuToggle('subcategoria', e)}
                      className={`w-full px-3 py-2.5 text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-end gap-2 ${activeSubmenu === 'subcategoria'
                        ? 'bg-primary-light text-primary'
                        : subcategoriaFilter
                          ? 'text-primary hover:bg-gray-100'
                          : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <ChevronLeft className={`w-4 h-4 transition-transform ${activeSubmenu === 'subcategoria' ? '-rotate-90' : ''}`} />
                      <div className="flex-1" />
                      <span>{subcategoriaLabel}</span>
                      <FileText className="w-4 h-4" />
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
                      <div className="flex-1" />
                      <span>{nucleoLabel}</span>
                      <NucleoIcon className="w-4 h-4" />
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
                      <span>{tramiteLabel}</span>
                      <TramiteIcon className="w-4 h-4" />
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
                      <EstatusIcon className="w-4 h-4" />
                    </motion.button>
                    <div className="border-t border-gray-200 my-2"></div>
                  </>
                )}

                {/* Opción: Estado */}
                {onEstadoChange && (
                  <>
                    <motion.button
                      ref={activeSubmenu === 'estado' ? activeButtonRef : undefined}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
                      onClick={(e) => handleSubmenuToggle('estado', e)}
                      className={`w-full px-3 py-2.5 text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-end gap-2 ${activeSubmenu === 'estado'
                        ? 'bg-primary-light text-primary'
                        : estadoFilter
                          ? 'text-primary hover:bg-gray-100'
                          : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      <ChevronLeft
                        className={`w-4 h-4 transition-transform ${activeSubmenu === 'estado' ? '-rotate-90' : ''}`}
                      />
                      <div className="flex-1" />
                      <span>{estadoLabel}</span>
                      <MapPin className="w-4 h-4" />
                    </motion.button>
                    <div className="border-t border-gray-200 my-2"></div>
                  </>
                )}

                {/* Opción: Municipio */}
                {onMunicipioChange && (
                  <>
                    <motion.button
                      ref={activeSubmenu === 'municipio' ? activeButtonRef : undefined}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
                      onClick={(e) => handleSubmenuToggle('municipio', e)}
                      className={`w-full px-3 py-2.5 text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-end gap-2 ${activeSubmenu === 'municipio'
                        ? 'bg-primary-light text-primary'
                        : municipioFilter
                          ? 'text-primary hover:bg-gray-100'
                          : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      <ChevronLeft
                        className={`w-4 h-4 transition-transform ${activeSubmenu === 'municipio' ? '-rotate-90' : ''}`}
                      />
                      <div className="flex-1" />
                      <span>{municipioLabel}</span>
                      <Building2 className="w-4 h-4" />
                    </motion.button>
                    <div className="border-t border-gray-200 my-2"></div>
                  </>
                )}

                {/* Opción: Parroquia */}
                {onParroquiaChange && (
                  <>
                    <motion.button
                      ref={activeSubmenu === 'parroquia' ? activeButtonRef : undefined}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
                      onClick={(e) => handleSubmenuToggle('parroquia', e)}
                      className={`w-full px-3 py-2.5 text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-end gap-2 ${activeSubmenu === 'parroquia'
                        ? 'bg-primary-light text-primary'
                        : parroquiaFilter
                          ? 'text-primary hover:bg-gray-100'
                          : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      <ChevronLeft
                        className={`w-4 h-4 transition-transform ${activeSubmenu === 'parroquia' ? '-rotate-90' : ''}`}
                      />
                      <div className="flex-1" />
                      <span>{parroquiaLabel}</span>
                      <Home className="w-4 h-4" />
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
                      <span>{estadoCivilLabel}</span>
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

                {/* Opción: Operación */}
                {onOperacionChange && (
                  <>
                    <motion.button
                      ref={activeSubmenu === 'operacion' ? activeButtonRef : undefined}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
                      onClick={(e) => handleSubmenuToggle('operacion', e)}
                      className={`w-full px-3 py-2.5 text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-end gap-2 ${activeSubmenu === 'operacion'
                        ? 'bg-primary-light text-primary'
                        : operacionFilter
                          ? 'text-primary hover:bg-gray-100'
                          : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <ChevronLeft className={`w-4 h-4 transition-transform ${activeSubmenu === 'operacion' ? '-rotate-90' : ''}`} />
                      <div className="flex-1" />
                      <span>{operacionLabel}</span>
                      <Activity className="w-4 h-4" />
                    </motion.button>
                    <div className="border-t border-gray-200 my-2"></div>
                  </>
                )}

                {/* Opción: Orden */}
                {onSortChange && (
                  <>
                    <motion.button
                      ref={activeSubmenu === 'sort' ? activeButtonRef : undefined}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
                      onClick={(e) => handleSubmenuToggle('sort', e)}
                      className={`w-full px-3 py-2.5 text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-end gap-2 ${activeSubmenu === 'sort'
                        ? 'bg-primary-light text-primary'
                        : sortFilter
                          ? 'text-primary hover:bg-gray-100'
                          : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <ChevronLeft className={`w-4 h-4 transition-transform ${activeSubmenu === 'sort' ? '-rotate-90' : ''}`} />
                      <div className="flex-1" />
                      <span>{sortLabel}</span>
                      <ArrowUpDown className="w-4 h-4" />
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