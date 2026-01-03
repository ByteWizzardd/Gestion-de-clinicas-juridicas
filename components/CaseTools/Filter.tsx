'use client';
import { Filter as FilterIcon, ChevronLeft, Building2, FileText, UserCheck, X, Activity, BookOpen, Calendar } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { createPortal } from 'react-dom';
import { getNucleosAction } from '@/app/actions/nucleos';
import DatePicker from '@/components/forms/DatePicker';

interface FilterProps {
  nucleoFilter?: string;
  tramiteFilter?: string;
  estatusFilter?: string;
  casosAsignadosFilter?: boolean;
  onNucleoChange?: (value: string) => void;
  onTramiteChange?: (value: string) => void;
  onEstatusChange?: (value: string) => void;
  onCasosAsignadosChange?: (value: boolean) => void;
  nucleoOptions?: { value: string; label: string }[];
  tramiteOptions: { value: string; label: string }[];
  estatusOptions: { value: string; label: string }[];
  showCasosAsignados?: boolean;
  materiaFilter?: string;
  onMateriaChange?: (value: string) => void;
  materias?: { id_materia: number; nombre_materia: string; habilitado?: boolean }[];
  nucleoLabel?: string;
  nucleoAllLabel?: string;
  fechaInicio?: string;
  fechaFin?: string;
  onFechaInicioChange?: (value: string) => void;
  onFechaFinChange?: (value: string) => void;
  showDateRange?: boolean;
}

function Filter({
  nucleoFilter,
  tramiteFilter,
  estatusFilter,
  casosAsignadosFilter,
  onNucleoChange,
  onTramiteChange,
  onEstatusChange,
  onCasosAsignadosChange,
  nucleoOptions,
  tramiteOptions,
  estatusOptions,
  showCasosAsignados = false,
  materiaFilter,
  onMateriaChange,
  materias = [],
  nucleoLabel = 'Núcleo',
  nucleoAllLabel = 'Todos los núcleos',
  fechaInicio,
  fechaFin,
  onFechaInicioChange,
  onFechaFinChange,
  showDateRange = false
}: FilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<'nucleo' | 'materia' | 'tramite' | 'estatus' | 'fechas' | null>(null);
  const [nucleos, setNucleos] = useState<Array<{ id_nucleo: number; nombre_nucleo: string; habilitado?: boolean }>>([]);
  const [mounted, setMounted] = useState(false);
  const [submenuPosition, setSubmenuPosition] = useState({ top: 0, right: 0 });

  const menuRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
  const handleSubmenuToggle = (type: 'nucleo' | 'materia' | 'tramite' | 'estatus' | 'fechas', e: React.MouseEvent<HTMLButtonElement>) => {
    if (activeSubmenu === type) {
      setActiveSubmenu(null);
    } else {
      const buttonRect = e.currentTarget.getBoundingClientRect();
      const menuRect = menuRef.current?.getBoundingClientRect();

      setSubmenuPosition({
        top: buttonRect.top,
        right: menuRect ? (window.innerWidth - menuRect.left + 8) : 0
      });
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
    (casosAsignadosFilter ? 1 : 0) +
    (materiaFilter ? 1 : 0) +
    (fechaInicio ? 1 : 0) +
    (fechaFin ? 1 : 0);

  const hasActiveFilter = activeFilterCount > 0;

  const handleClearFilters = () => {
    if (onNucleoChange) onNucleoChange('');
    if (onTramiteChange) onTramiteChange('');
    if (onEstatusChange) onEstatusChange('');
    if (onMateriaChange) onMateriaChange('');
    if (onCasosAsignadosChange) onCasosAsignadosChange(false);
    if (onFechaInicioChange) onFechaInicioChange('');
    if (onFechaFinChange) onFechaFinChange('');
    setActiveSubmenu(null);
  };

  // Obtener nombres seleccionados
  const selectedNucleoName = nucleos.find(n => n.id_nucleo.toString() === nucleoFilter)?.nombre_nucleo;
  const selectedTramiteName = tramiteOptions.find(t => t.value === tramiteFilter)?.label;
  const selectedEstatusName = estatusOptions.find(e => e.value === estatusFilter)?.label;

  // Renderizar el submenú como portal
  // Guardar opciones para la animación de salida
  const [currentOptions, setCurrentOptions] = useState<{ options: { value: string; label: string }[], allLabel: string, handler: (value: string) => void, menuType: string } | null>(null);

  useEffect(() => {
    if (activeSubmenu) {
      let options: { value: string; label: string }[] = [];
      let onChangeHandler: (value: string) => void = () => { };
      let allLabel = '';

      switch (activeSubmenu) {
        case 'nucleo':
          if (nucleoOptions && nucleoOptions.length > 0) {
            options = nucleoOptions;
          } else {
            options = nucleos
              .filter((n) => n.habilitado !== false)
              .map(n => ({ value: n.id_nucleo.toString(), label: n.nombre_nucleo }));
          }
          onChangeHandler = onNucleoChange || (() => { });
          allLabel = nucleoAllLabel;
          break;
        case 'tramite':
          options = tramiteOptions;
          onChangeHandler = onTramiteChange || (() => { });
          allLabel = 'Todos los trámites';
          break;
        case 'materia':
          options = materias
            .filter((m) => m.habilitado !== false)
            .map(m => ({ value: m.id_materia.toString(), label: m.nombre_materia }));
          onChangeHandler = onMateriaChange || (() => { });
          allLabel = 'Todas las materias';
          break;
        case 'estatus':
          options = estatusOptions;
          onChangeHandler = onEstatusChange || (() => { });
          allLabel = 'Todos los estatus';
          break;
      }
      setCurrentOptions({ options, allLabel, handler: onChangeHandler, menuType: activeSubmenu });
    }
  }, [activeSubmenu, nucleos, tramiteOptions, estatusOptions, onNucleoChange, onTramiteChange, onEstatusChange]);

  const renderSubmenu = () => {
    if (!mounted) return null;

    // Usar opciones guardadas si se está cerrando
    const displayData = activeSubmenu ? null : currentOptions;
    // Si hay un submenú activo, ya se habrá actualizado el efecto o se usará currentOptions del render anterior si coincide
    // Pero mejor recalcular si está activo para reactividad instantánea, o confiar en el efecto.
    // El efecto puede tener un ligero retraso. Para evitar parpadeo al abrir, calculamos si está activo.

    let options: { value: string; label: string }[] = [];
    let filterValue = '';
    let handler: (value: string) => void = () => { };
    let allLabel = '';
    let type = activeSubmenu || (currentOptions ? currentOptions.menuType : '');

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
          options = materias
            .filter((m) => m.habilitado !== false)
            .map(m => ({ value: m.id_materia.toString(), label: m.nombre_materia }));
          handler = onMateriaChange || (() => { });
          allLabel = 'Todas las materias';
          break;
        case 'estatus':
          options = estatusOptions;
          handler = onEstatusChange || (() => { });
          allLabel = 'Todos los estatus';
          break;
      }
    } else if (currentOptions) {
      options = currentOptions.options;
      handler = currentOptions.handler;
      allLabel = currentOptions.allLabel;
    }

    // Resolver filterValue dinámicamente
    switch (type) {
      case 'nucleo': filterValue = nucleoFilter || ''; break;
      case 'materia': filterValue = materiaFilter || ''; break;
      case 'tramite': filterValue = tramiteFilter || ''; break;
      case 'estatus': filterValue = estatusFilter || ''; break;
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
                right: submenuPosition.right,
                zIndex: 10000,
              }}
              className="bg-white border border-gray-300 rounded-2xl shadow-lg w-[280px] p-4"
            >
              <div className="space-y-3">
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
                    }}
                    className="w-full px-3 py-2 text-sm text-center text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Limpiar fechas
                  </button>
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
              right: submenuPosition.right,
              zIndex: 10000,
            }}
            className="bg-white border border-gray-300 rounded-2xl shadow-lg w-[220px] p-2 max-h-[300px] overflow-y-auto"
          >
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
              onClick={() => {
                handler('');
                setActiveSubmenu(null);
              }}
              className={`w-full px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-end ${filterValue === ''
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
                className={`w-full px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-end ${filterValue === option.value
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
          setIsOpen(!isOpen);
          if (isOpen) setActiveSubmenu(null);
        }}
        className={`h-10 px-4 cursor-pointer rounded-full bg-transparent border border-primary text-foreground flex items-center justify-center gap-1.5 whitespace-nowrap hover:bg-primary-light transition-colors ${hasActiveFilter ? 'bg-primary-light border-primary-dark' : ''
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
      {mounted && createPortal(
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
                top: triggerRef.current ? triggerRef.current.getBoundingClientRect().bottom + 8 : 0,
                right: triggerRef.current ? window.innerWidth - triggerRef.current.getBoundingClientRect().right : 0,
                zIndex: 9999,
              }}
              className="bg-white border border-gray-300 rounded-2xl shadow-lg w-auto p-2"
            >
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
                        : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <ChevronLeft className={`w-4 h-4 transition-transform ${activeSubmenu === 'nucleo' ? '-rotate-90' : ''}`} />
                    <div className="flex-1" /> {/* Spacer agregado nuevamente para asegurar alineación derecha */}
                    <span>{nucleoLabel}</span>
                    <Building2 className="w-4 h-4" />
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
                    <span>Estatus</span>
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
                      : (fechaInicio || fechaFin)
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