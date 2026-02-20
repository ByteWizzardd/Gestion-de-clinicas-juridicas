'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getCitasAction, deleteCitaAction } from '@/app/actions/citas';
import CalendarWidget from '@/components/ui/calendar/CalendarWidget';
import AppointmentList from '@/components/cards/AppointmentList';
import AppointmentCardList from './AppointmentCardList';
import { AppointmentViewMode } from '@/components/ui/navigation/AppointmentViewSwitcher';
import AppointmentsToolbar from './AppointmentsToolbar';
import { Search as SearchIcon } from 'lucide-react';
import Tabs from '@/components/ui/Tabs';
import type { Appointment } from '@/types/appointment';
import { AppointmentModal } from '../appointmentModal/AppointmentModal';
import { AppointmentDetailModal } from '../appointmentModal/AppointmentDetailModal';
import { AppointmentScheduleModal } from '../appointmentModal/AppointmentScheduleModal';
import NewAppointmentButton from './NewAppointmentButton';
import ConfirmModal from '@/components/ui/feedback/ConfirmModal';

interface AppointmentFilterOptions {
  nucleos: Array<{ id_nucleo: number; nombre_nucleo: string }>;
  usuarios: Array<{ cedula: string; nombres: string; apellidos: string; nombre_completo: string }>;
  casos: Array<{ id_caso: number; tramite: string }>;
}

interface AppointmentsClientProps {
  initialAppointments: Appointment[];
  initialUserAppointments: Appointment[];
  initialFilterOptions?: AppointmentFilterOptions;
}

export default function AppointmentsClient({
  initialAppointments,
  initialUserAppointments,
  initialFilterOptions = { nucleos: [], usuarios: [], casos: [] }
}: AppointmentsClientProps) {
  const [viewMode, setViewMode] = useState<AppointmentViewMode>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  const [filterByDate, setFilterByDate] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const [appointments, setAppointments] = useState<Appointment[]>(
    initialAppointments.map((apt) => ({ ...apt, date: new Date(apt.date) }))
  );
  const [userAppointments, setUserAppointments] = useState<Appointment[]>(
    initialUserAppointments.map((apt) => ({ ...apt, date: new Date(apt.date) }))
  );
  const [showModal, setShowModal] = useState(false);
  const [modalDate, setModalDate] = useState<Date | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMotivo, setDeleteMotivo] = useState('');
  const [searchValue, setSearchValue] = useState('');

  // Filtros
  const [nucleoFilter, setNucleoFilter] = useState<string>('');
  const [usuarioFilter, setUsuarioFilter] = useState<string[]>([]);
  const [caseFilter, setCaseFilter] = useState<string[]>([]);
  const [misCasosFilter, setMisCasosFilter] = useState<boolean>(false);
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all'); // 'all', 'today', 'week', 'month', 'custom'
  const [customDateStart, setCustomDateStart] = useState<string>('');
  const [customDateEnd, setCustomDateEnd] = useState<string>('');

  const normalizeText = (text: string): string => {
    return (text ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  // Opciones del filtro de casos: deben reflejar los casos realmente asociados
  // al/los usuarios seleccionados (y al resto de filtros activos), para que el dropdown no muestre casos imposibles.
  const availableCaseIdsForFilter = useMemo(() => {
    // Base igual que la lista (si "Mis casos" está activo, usar solo citas del usuario autenticado)
    let filtered = misCasosFilter ? userAppointments : appointments;

    // Núcleo
    if (nucleoFilter) {
      const nucleoNeedle = normalizeText(nucleoFilter);
      filtered = filtered.filter((apt) => normalizeText(apt.location || '').includes(nucleoNeedle));
    }

    // Usuario(s) que atendió (AND: todos los seleccionados deben estar en la cita)
    if (usuarioFilter.length > 0) {
      filtered = filtered.filter((apt) => {
        const list = apt.attendingUsersList || [];
        if (list.length === 0) return false;
        const userIdsInAppointment = list.map((u) => u.id_usuario);
        return usuarioFilter.every((selectedUserId) => userIdsInAppointment.includes(selectedUserId));
      });
    }

    // Rango de fechas
    if (dateRangeFilter !== 'all') {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      filtered = filtered.filter((apt) => {
        const aptDateOriginal = new Date(apt.date);
        const aptDate = new Date(apt.date);
        aptDate.setHours(0, 0, 0, 0);

        switch (dateRangeFilter) {
          case 'today':
            return aptDate.getTime() === now.getTime();
          case 'week': {
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return aptDate >= weekAgo && aptDate <= now;
          }
          case 'month': {
            const monthAgo = new Date(now);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return aptDate >= monthAgo && aptDate <= now;
          }
          case 'custom': {
            if (customDateStart && customDateEnd) {
              const start = new Date(customDateStart);
              start.setHours(0, 0, 0, 0);
              const end = new Date(customDateEnd);
              end.setHours(23, 59, 59, 999);
              return aptDateOriginal >= start && aptDateOriginal <= end;
            }
            return true;
          }
          default:
            return true;
        }
      });
    }

    return new Set(filtered.map((apt) => String(apt.caseId)));
  }, [appointments, userAppointments, misCasosFilter, nucleoFilter, usuarioFilter, dateRangeFilter, customDateStart, customDateEnd]);

  const filterOptionsForToolbar = useMemo(() => {
    const casos = initialFilterOptions.casos.filter((c) => availableCaseIdsForFilter.has(String(c.id_caso)));
    return {
      ...initialFilterOptions,
      casos,
    };
  }, [initialFilterOptions, availableCaseIdsForFilter]);

  // Si el usuario cambia y deja seleccionados casos que ya no están asociados, limpiarlos.
  useEffect(() => {
    if (caseFilter.length === 0) return;
    const next = caseFilter.filter((id) => availableCaseIdsForFilter.has(String(id)));
    if (next.length !== caseFilter.length) {
      setCaseFilter(next);
    }
  }, [caseFilter, availableCaseIdsForFilter]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Sincronizar estado con props cuando cambian (ej: después de un server action o navegación)
  useEffect(() => {
    if (initialAppointments) {
      setAppointments(initialAppointments.map((apt) => ({ ...apt, date: new Date(apt.date) })));
    }
    if (initialUserAppointments) {
      setUserAppointments(initialUserAppointments.map((apt) => ({ ...apt, date: new Date(apt.date) })));
    }
  }, [initialAppointments, initialUserAppointments]);

  // Filtrar citas según el modo: por día específico o por mes completo (Solo para Calendario personal)
  const displayedAppointments = useMemo(() => {
    // Para la vista de calendario, usamos SOLO las citas del usuario
    let filtered = userAppointments;

    // Aplicar filtros de búsqueda (igual que en vista de lista)
    // Filtro por núcleo
    if (nucleoFilter) {
      const nucleoNeedle = normalizeText(nucleoFilter);
      filtered = filtered.filter((apt) => {
        // El location contiene el nombre del núcleo
        return normalizeText(apt.location || '').includes(nucleoNeedle);
      });
    }

    // Filtro por usuario que atendió (múltiple) - todos los usuarios seleccionados deben estar en la cita
    if (usuarioFilter.length > 0) {
      filtered = filtered.filter((apt) => {
        if (!apt.attendingUsersList || apt.attendingUsersList.length === 0) {
          return false;
        }
        // Verificar que TODOS los usuarios seleccionados estén en la cita
        const userIdsInAppointment = apt.attendingUsersList.map(user => user.id_usuario);
        return usuarioFilter.every(selectedUserId => userIdsInAppointment.includes(selectedUserId));
      });
    }

    // Filtro por caso (múltiple) - la cita debe estar en uno de los casos seleccionados
    if (caseFilter.length > 0) {
      filtered = filtered.filter((apt) => {
        const caseIdStr = String(apt.caseId);
        return caseFilter.includes(caseIdStr);
      });
    }

    // Aplicar filtros de fecha (igual que antes)
    if (filterByDate) {
      // Filtrar solo las citas del día seleccionado
      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.date);
        const selectedDateOnly = new Date(selectedDate);
        selectedDateOnly.setHours(0, 0, 0, 0);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate.getTime() === selectedDateOnly.getTime();
      });
    } else {
      // Filtrar citas del mes seleccionado
      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.date);
        return (
          aptDate.getFullYear() === selectedMonth.getFullYear() &&
          aptDate.getMonth() === selectedMonth.getMonth()
        );
      });
    }

    return filtered;
  }, [userAppointments, selectedMonth, selectedDate, filterByDate, nucleoFilter, usuarioFilter, caseFilter]);

  // Filtrar citas por búsqueda y filtros (solo para vista de lista)
  const filteredAppointmentsForList = useMemo(() => {
    // Si misCasosFilter está activo, usar solo las citas del usuario
    // De lo contrario, usar todas las citas
    let filtered = misCasosFilter ? userAppointments : appointments;

    // Filtro por búsqueda de texto
    if (searchValue.trim()) {
      const searchLower = searchValue.toLowerCase().trim();
      filtered = filtered.filter((apt) => {
        const clientMatch = apt.client?.toLowerCase().includes(searchLower);
        const caseMatch = apt.caseDetail?.toLowerCase().includes(searchLower);
        const locationMatch = apt.location?.toLowerCase().includes(searchLower);
        const orientationMatch = apt.orientation?.toLowerCase().includes(searchLower);
        const attendingUsersMatch = apt.attendingUsers?.toLowerCase().includes(searchLower);
        const titleMatch = apt.title?.toLowerCase().includes(searchLower);

        return clientMatch || caseMatch || locationMatch || orientationMatch || attendingUsersMatch || titleMatch;
      });
    }

    // Filtro por núcleo
    if (nucleoFilter) {
      const nucleoNeedle = normalizeText(nucleoFilter);
      filtered = filtered.filter((apt) => {
        // El location contiene el nombre del núcleo
        return normalizeText(apt.location || '').includes(nucleoNeedle);
      });
    }

    // Filtro por usuario que atendió (múltiple) - todos los usuarios seleccionados deben estar en la cita
    if (usuarioFilter.length > 0) {
      filtered = filtered.filter((apt) => {
        if (!apt.attendingUsersList || apt.attendingUsersList.length === 0) {
          return false;
        }
        // Verificar que TODOS los usuarios seleccionados estén en la cita
        const userIdsInAppointment = apt.attendingUsersList.map(user => user.id_usuario);
        return usuarioFilter.every(selectedUserId => userIdsInAppointment.includes(selectedUserId));
      });
    }

    // Filtro por caso (múltiple) - la cita debe estar en uno de los casos seleccionados
    if (caseFilter.length > 0) {
      filtered = filtered.filter((apt) => {
        const caseIdStr = String(apt.caseId);
        return caseFilter.includes(caseIdStr);
      });
    }

    // Filtro por rango de fechas
    if (dateRangeFilter !== 'all') {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      filtered = filtered.filter((apt) => {
        const aptDateOriginal = new Date(apt.date);
        const aptDate = new Date(apt.date);
        aptDate.setHours(0, 0, 0, 0);

        switch (dateRangeFilter) {
          case 'today':
            return aptDate.getTime() === now.getTime();
          case 'week': {
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return aptDate >= weekAgo && aptDate <= now;
          }
          case 'month': {
            const monthAgo = new Date(now);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return aptDate >= monthAgo && aptDate <= now;
          }
          case 'custom': {
            if (customDateStart && customDateEnd) {
              const start = new Date(customDateStart);
              start.setHours(0, 0, 0, 0); // Inicio del día de inicio (00:00:00)
              const end = new Date(customDateEnd);
              end.setHours(23, 59, 59, 999); // Fin del día de fin (23:59:59.999)

              // Usar la fecha original de la cita (con hora) para comparar con el rango completo
              // Esto incluye citas del mismo día de inicio y fin
              return aptDateOriginal >= start && aptDateOriginal <= end;
            }
            return true;
          }
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [appointments, userAppointments, misCasosFilter, searchValue, nucleoFilter, usuarioFilter, caseFilter, dateRangeFilter, customDateStart, customDateEnd]);

  // Filtrar citas agendadas (citas programadas)
  const scheduledAppointments = useMemo(() => {
    // Usar filteredAppointmentsForList como base para aprovechar todos los filtros (búsqueda, núcleo, usuario, fechas)
    return filteredAppointmentsForList.filter((apt) => {
      // Solo mostrar citas que están explícitamente programadas
      const orientation = apt.orientation?.trim() || '';
      return orientation === 'Cita programada';
    });
  }, [filteredAppointmentsForList]);

  // Preparar datos para el calendario (solo fechas - usar citas del USUARIO)
  const calendarAppointments = useMemo(() => {
    return userAppointments.map((apt) => ({
      date: new Date(apt.date),
    }));
  }, [userAppointments]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    const newMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    setSelectedMonth(newMonth);
    // Activar filtro por día cuando se selecciona un día específico
    setFilterByDate(true);
  };

  const handleShowAllMonth = () => {
    // Desactivar filtro por día para mostrar todas las citas del mes
    setFilterByDate(false);
  };

  const handleMonthChange = (date: Date) => {
    const newMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    setSelectedMonth(newMonth);
  };
  // Abrir modal para agregar nueva cita (Registrar)
  const handleAddAppointment = () => {
    // Pequeño delay para asegurar que el dropdown se cierre primero
    setTimeout(() => {
      setModalDate(selectedDate);
      setShowModal(true);
    }, 50);
  };

  // Abrir modal para programar cita
  const handleScheduleAppointment = () => {
    // Pequeño delay para asegurar que el dropdown se cierre primero
    setTimeout(() => {
      setShowScheduleModal(true);
    }, 50);
  };

  // Cerrar modal de programar cita
  const handleScheduleModalClose = () => {
    setShowScheduleModal(false);
  };

  // Guardar cita programada
  const handleScheduleModalSave = async () => {
    // Recargar citas desde el backend (ambas listas)
    const [result, userResult] = await Promise.all([
      getCitasAction(),
      getCitasAction({ onlyMine: true })
    ]);

    if (result.success && result.data) {
      if (Array.isArray(result.data)) {
        setAppointments(result.data.map((apt: Appointment) => ({ ...apt, date: new Date(apt.date) })));
      } else {
        setAppointments([]);
      }
    }

    if (userResult.success && userResult.data) {
      if (Array.isArray(userResult.data)) {
        setUserAppointments(userResult.data.map((apt: Appointment) => ({ ...apt, date: new Date(apt.date) })));
      } else {
        setUserAppointments([]);
      }
    }
    setShowScheduleModal(false);
  };

  // Cerrar modal
  const handleModalClose = () => {
    setShowModal(false);
    setModalDate(null);
    setEditingAppointment(null);
  };

  const handleModalSave = async () => {
    // Recargar citas desde el backend (ambas listas)
    const [result, userResult] = await Promise.all([
      getCitasAction(),
      getCitasAction({ onlyMine: true })
    ]);

    if (result.success && result.data) {
      if (Array.isArray(result.data)) {
        setAppointments(result.data.map((apt: Appointment) => ({ ...apt, date: new Date(apt.date) })));
      } else {
        setAppointments([]);
      }
    }

    if (userResult.success && userResult.data) {
      if (Array.isArray(userResult.data)) {
        setUserAppointments(userResult.data.map((apt: Appointment) => ({ ...apt, date: new Date(apt.date) })));
      } else {
        setUserAppointments([]);
      }
    }
    setShowModal(false);
    setModalDate(null);
    setEditingAppointment(null);
  };

  // Abrir modal de detalles de cita
  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  // Cerrar modal de detalles
  const handleDetailModalClose = () => {
    setShowDetailModal(false);
    setSelectedAppointment(null);
  };

  // Manejar edición de cita
  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setModalDate(appointment.date);
    setShowModal(true);
  };

  // Manejar eliminación de cita - Abre el modal de confirmación
  const handleDeleteAppointment = (appointment: Appointment) => {
    setAppointmentToDelete(appointment);
    setShowDeleteConfirmModal(true);
  };

  // Confirmar eliminación de cita
  const handleConfirmDelete = async () => {
    if (!appointmentToDelete) return;

    if (!deleteMotivo.trim()) {
      alert('El motivo de eliminación es obligatorio');
      return;
    }

    setIsDeleting(true);

    try {
      // Eliminar la cita
      const deleteResult = await deleteCitaAction({
        appointmentId: appointmentToDelete.id,
        motivo: deleteMotivo.trim(),
      });

      if (deleteResult.success) {
        // Cerrar el modal
        setShowDeleteConfirmModal(false);
        setAppointmentToDelete(null);

        // Recargar citas después de eliminar (ambale listas)
        const [result, userResult] = await Promise.all([
          getCitasAction(),
          getCitasAction({ onlyMine: true })
        ]);

        if (result.success && result.data) {
          if (Array.isArray(result.data)) {
            setAppointments(result.data.map((apt: Appointment) => ({ ...apt, date: new Date(apt.date) })));
          }
        }

        if (userResult.success && userResult.data) {
          if (Array.isArray(userResult.data)) {
            setUserAppointments(userResult.data.map((apt: Appointment) => ({ ...apt, date: new Date(apt.date) })));
          }
        }
      } else {
        // Mostrar error si la eliminación falló
        alert(deleteResult.error?.message || 'Error al eliminar la cita');
      }
    } catch (error) {
      alert('Error inesperado al eliminar la cita');
      console.error('Error al eliminar cita:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancelar eliminación
  const handleCancelDelete = () => {
    setShowDeleteConfirmModal(false);
    setAppointmentToDelete(null);
  };

  // Manejar cuando se marca una cita programada como completada
  const handleAppointmentCompleted = (appointment: Appointment) => {
    // Abrir el modal de registro de cita para ingresar la orientación
    setEditingAppointment(appointment);
    setModalDate(appointment.date);
    setShowModal(true);
  };

  // Manejar cuando se marca una cita programada como no realizada
  const handleAppointmentCancelled = (appointment: Appointment) => {
    // Por ahora, simplemente mostrar confirmación y eliminar la cita programada
    const confirmCancel = window.confirm(
      `¿Está seguro de que la cita programada para el ${formatDate(appointment.date)} no se realizó? Se eliminará del sistema.`
    );

    if (confirmCancel) {
      handleDeleteAppointment(appointment);
    }
  };

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="h-full relative ">
      <div className="mb-4 md:mb-6 mt-4">
        <div className="mb-4">
          <h1 className="text-3xl font-medium text-foreground mb-1" style={{ fontFamily: 'var(--font-league-spartan)' }}>
            Citas
          </h1>
          <p className="text-base text-gray-600" style={{ fontFamily: 'var(--font-urbanist)' }}>
            Vista de programación de las citas.
          </p>
        </div>
      </div>

      {/* Tabs para cambiar entre vistas */}
      <Tabs
        onTabChange={(tabId) => setViewMode(tabId as AppointmentViewMode)}
        defaultTab={viewMode}
        tabs={[
          {
            id: 'calendar',
            label: 'Calendario',
            content: (
              <motion.div
                key="calendar-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-6 pb-6">
                  <motion.div
                    className="h-[calc(100vh-10rem)]"
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.1, ease: "easeOut" }}
                  >
                    <CalendarWidget
                      selectedDate={selectedDate}
                      onDateChange={handleDateChange}
                      onMonthChange={handleMonthChange}
                      appointments={calendarAppointments}
                    />
                  </motion.div>

                  <motion.div
                    className="pr-6 h-[calc(100vh-10rem)] flex flex-col"
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.1, ease: "easeOut" }}
                  >
                    <div className="flex-1 min-h-0">
                      <AppointmentList
                        appointments={displayedAppointments}
                        selectedMonth={selectedMonth}
                        selectedDate={filterByDate ? selectedDate : null}
                        onAddAppointment={handleAddAppointment}
                        onScheduleAppointment={handleScheduleAppointment}
                        onShowAllMonth={filterByDate ? handleShowAllMonth : undefined}
                        onAppointmentClick={handleAppointmentClick}
                      />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ),
          },
          {
            id: 'list',
            label: 'Lista',
            content: (
              <motion.div
                key="list-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Barra de búsqueda y filtro */}
                <div className="mb-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                    {/* Buscador */}
                    <div className="flex-1 min-w-0">
                      <search className="flex items-center">
                        <form
                          className="flex items-center h-10 border border-primary rounded-full bg-transparent w-full"
                          onSubmit={(e) => e.preventDefault()}
                        >
                          <label className="flex items-center w-full">
                            <input
                              id="search-appointments-input"
                              type="search"
                              name="q"
                              autoComplete="off"
                              placeholder="Buscar cita..."
                              value={searchValue}
                              onChange={(e) => setSearchValue(e.target.value)}
                              className="flex-1 px-4 py-2.5 h-full focus:outline-none bg-transparent text-base text-foreground placeholder:text-gray-500"
                            />
                            <SearchIcon className="w-[18px] h-[18px] text-[#414040] mr-3 shrink-0" />
                          </label>
                        </form>
                      </search>
                    </div>

                    {/* Filtro y Botón Nueva Cita */}
                    <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                      {/* Filtro */}
                      <AppointmentsToolbar
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        nucleoFilter={nucleoFilter}
                        usuarioFilter={usuarioFilter}
                        caseFilter={caseFilter}
                        misCasosFilter={misCasosFilter}
                        dateRangeFilter={dateRangeFilter}
                        customDateStart={customDateStart}
                        customDateEnd={customDateEnd}
                        onNucleoFilterChange={setNucleoFilter}
                        onUsuarioFilterChange={setUsuarioFilter}
                        onCaseFilterChange={setCaseFilter}
                        onMisCasosFilterChange={setMisCasosFilter}
                        onDateRangeFilterChange={setDateRangeFilter}
                        onCustomDateStartChange={setCustomDateStart}
                        onCustomDateEndChange={setCustomDateEnd}
                        filterOptions={filterOptionsForToolbar}
                      />

                      {/* Botón Nueva Cita con Dropdown */}
                      <NewAppointmentButton
                        onRegister={handleAddAppointment}
                        onSchedule={handleScheduleAppointment}
                      />
                    </div>
                  </div>
                </div>

                {/* Lista de cards */}
                <AppointmentCardList
                  appointments={filteredAppointmentsForList}
                  onEdit={handleEditAppointment}
                  onDelete={handleDeleteAppointment}
                  onView={handleAppointmentClick}
                />
              </motion.div>
            ),
          },
          {
            id: 'scheduled',
            label: 'Agendadas',
            content: (
              <motion.div
                key="scheduled-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Barra de búsqueda y filtro para citas agendadas */}
                <div className="mb-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                    {/* Buscador */}
                    <div className="flex-1 min-w-0">
                      <search className="flex items-center">
                        <form
                          className="flex items-center h-10 border border-primary rounded-full bg-transparent w-full"
                          onSubmit={(e) => e.preventDefault()}
                        >
                          <label className="flex items-center w-full">
                            <input
                              id="search-scheduled-appointments-input"
                              type="search"
                              name="q"
                              autoComplete="off"
                              placeholder="Buscar cita agendada..."
                              value={searchValue}
                              onChange={(e) => setSearchValue(e.target.value)}
                              className="flex-1 px-4 py-2.5 h-full focus:outline-none bg-transparent text-base text-foreground placeholder:text-gray-500"
                            />
                            <SearchIcon className="w-[18px] h-[18px] text-[#414040] mr-3 shrink-0" />
                          </label>
                        </form>
                      </search>
                    </div>

                    {/* Filtro y Botón Nueva Cita */}
                    <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                      {/* Filtro */}
                      <AppointmentsToolbar
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        nucleoFilter={nucleoFilter}
                        usuarioFilter={usuarioFilter}
                        caseFilter={caseFilter}
                        misCasosFilter={misCasosFilter}
                        dateRangeFilter={dateRangeFilter}
                        customDateStart={customDateStart}
                        customDateEnd={customDateEnd}
                        onNucleoFilterChange={setNucleoFilter}
                        onUsuarioFilterChange={setUsuarioFilter}
                        onCaseFilterChange={setCaseFilter}
                        onMisCasosFilterChange={setMisCasosFilter}
                        onDateRangeFilterChange={setDateRangeFilter}
                        onCustomDateStartChange={setCustomDateStart}
                        onCustomDateEndChange={setCustomDateEnd}
                        filterOptions={filterOptionsForToolbar}
                      />

                      {/* Botón Nueva Cita con Dropdown */}
                      <NewAppointmentButton
                        onRegister={handleAddAppointment}
                        onSchedule={handleScheduleAppointment}
                      />
                    </div>
                  </div>
                </div>

                {/* Lista de cards de citas agendadas filtradas */}
                <AppointmentCardList
                  appointments={scheduledAppointments}
                  onEdit={handleEditAppointment}
                  onDelete={handleDeleteAppointment}
                  onView={handleAppointmentClick}
                  onAppointmentCompleted={handleAppointmentCompleted}
                  onAppointmentCancelled={handleAppointmentCancelled}
                />
              </motion.div>
            ),
          },
        ]}
      />

      <AnimatePresence>
        {showModal && (
          <AppointmentModal
            onClose={handleModalClose}
            onSave={handleModalSave}
            initialDate={modalDate || selectedDate}
            appointment={editingAppointment}
          />
        )}
      </AnimatePresence>

      <AppointmentDetailModal
        appointment={selectedAppointment}
        isOpen={showDetailModal}
        onClose={handleDetailModalClose}
      />

      <AnimatePresence>
        {showScheduleModal && (
          <AppointmentScheduleModal
            onClose={handleScheduleModalClose}
            onSave={handleScheduleModalSave}
            initialDate={selectedDate}
          />
        )}
      </AnimatePresence>

      {/* Modal de confirmación para eliminar cita */}
      <ConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Eliminar cita"
        message={
          appointmentToDelete ? (
            <div>
              <p className="mb-4 text-base text-foreground">
                ¿Estás seguro de que deseas eliminar la cita del{' '}
                <strong>{formatDate(appointmentToDelete.date)}</strong>?
              </p>
              <p className="mb-2 text-base text-foreground">
                <strong>Caso:</strong> {appointmentToDelete.caseDetail}
              </p>
              <p className="mb-6 text-red-600 font-semibold text-base">
                Esta acción no se puede deshacer.
              </p>
              <div className="flex flex-col gap-1">
                <label className="text-base font-normal text-foreground mb-1">
                  Motivo de la eliminación
                </label>
                <textarea
                  className={`
                    w-full p-4 rounded-lg border bg-[#E5E7EB]
                    border-transparent
                    focus:outline-none focus:ring-1
                    focus:ring-primary
                    text-base placeholder:text-[#717171] resize-none
                    ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  rows={4}
                  maxLength={500}
                  value={deleteMotivo}
                  onChange={e => setDeleteMotivo(e.target.value)}
                  placeholder="Describe el motivo de la eliminación..."
                  disabled={isDeleting}
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {deleteMotivo.length} / 500 caracteres
                </div>
              </div>
            </div>
          ) : (
            '¿Está seguro de que desea eliminar esta cita?'
          )
        }
        confirmLabel={isDeleting ? 'Eliminando...' : 'Eliminar'}
        cancelLabel="Cancelar"
        disabled={isDeleting || !deleteMotivo.trim()}
        confirmVariant="danger"
      />
    </div>
  );
}

