'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { UserPlus, Users, UserX, CalendarX2, Activity, UserCheck } from 'lucide-react';
import ConfirmModal from '../ui/feedback/ConfirmModal';
import CaseTools from '@/components/CaseTools/CaseTools';
import Table from '@/components/Table/Table';
import BulkUploadModal from './BulkUploadModal';
import { getUsuariosAction, deleteUsuarioFisicoAction, getUsuarioInfoByCedulaAction, toggleHabilitadoUsuarioAction, disableUsuariosLoteAction, enableUsuariosLoteAction } from '@/app/actions/usuarios';
import { getSemestresAction, getCurrentTermAction, deshabilitarUsuariosSemestreFinalizadoAction } from '@/app/actions/estudiantes';
import EditUserModal from './EditUserModal';
import CreateUserModal from './CreateUserModal';
import DropdownMenu from '@/components/ui/navigation/DropdownMenu';
import TableSkeleton from '@/components/ui/skeletons/TableSkeleton';

interface Usuario extends Record<string, unknown> {
  cedula: string;
  nombres?: string;
  apellidos?: string;
  nombre_usuario: string;
  habilitado_sistema?: boolean;
  tipo_usuario: string;
  correo_electronico?: string;
}

interface UsersClientProps {
  initialUsuarios?: Usuario[];
  currentUserCedula?: string;
}

export default function UsersClient({ initialUsuarios = [], currentUserCedula = '' }: UsersClientProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [usuarioToEdit, setUsuarioToEdit] = useState<Usuario | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Usuario | null>(null);
  const [deleteMotivo, setDeleteMotivo] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [disableLoading, setDisableLoading] = useState(false);

  const [usuarios, setUsuarios] = useState<Usuario[]>(initialUsuarios);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [semestreFilter, setSemestreFilter] = useState('');
  const [semestres, setSemestres] = useState<Array<{ term: string; fecha_inicio: Date; fecha_fin: Date }>>([]);
  const [loading, setLoading] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Selección por lotes
  const [selectedCedulas, setSelectedCedulas] = useState<string[]>([]);
  const [isBatchDisabling, setIsBatchDisabling] = useState(false);
  const [showBatchConfirm, setShowBatchConfirm] = useState(false);
  const [isBatchEnabling, setIsBatchEnabling] = useState(false);
  const [showBatchEnableConfirm, setShowBatchEnableConfirm] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Cerrar semestre (deshabilitar usuarios de semestres finalizados)
  const [showCerrarSemestreConfirm, setShowCerrarSemestreConfirm] = useState(false);
  const [isCerrandoSemestre, setIsCerrandoSemestre] = useState(false);

  const router = useRouter();

  // Cerrar el dropdown cuando se detecta que un modal se ha abierto
  useEffect(() => {
    if (!isDropdownOpen) return;

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            const element = node as HTMLElement;
            if (
              element.getAttribute('role') === 'dialog' ||
              element.getAttribute('aria-modal') === 'true' ||
              (element.classList.contains('fixed') && element.classList.contains('z-50')) ||
              element.querySelector('[role="dialog"]') ||
              element.querySelector('[aria-modal="true"]')
            ) {
              setIsDropdownOpen(false);
              return;
            }
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'role', 'aria-modal']
    });

    const checkBodyOverflow = () => {
      if (document.body.style.overflow === 'hidden') {
        const modal = document.querySelector('[role="dialog"]') ||
          document.querySelector('[aria-modal="true"]');
        if (modal) {
          setIsDropdownOpen(false);
        }
      }
    };

    const styleObserver = new MutationObserver(checkBodyOverflow);
    styleObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['style']
    });

    checkBodyOverflow();

    return () => {
      observer.disconnect();
      styleObserver.disconnect();
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (initialUsuarios.length === 0) {
      loadUsuarios();
    }
    // Cargar semestres para el filtro
    loadSemestres();
  }, [initialUsuarios.length]);

  const loadSemestres = async () => {
    try {
      const result = await getSemestresAction();
      if (result.success && result.data) {
        setSemestres(result.data);
      }
      // Cargar el semestre actual como valor predeterminado
      const currentTermResult = await getCurrentTermAction();
      if (currentTermResult.success && currentTermResult.data) {
        setSemestreFilter(currentTermResult.data.term);
      }
    } catch (error) {
      console.error('Error al cargar semestres:', error);
    }
  };

  const loadUsuarios = async () => {
    setLoading(true);
    try {
      const result = await getUsuariosAction();
      if (result.success && result.data) {
        setUsuarios(result.data);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (data: Record<string, unknown>) => {
    const usuario = data as Usuario;
    setItemToDelete(usuario);
    setShowConfirm(true);
  };

  const tipoOptions = useMemo(() => {
    const tipos = new Set<string>();
    usuarios.forEach(u => {
      if (u.tipo_usuario) {
        tipos.add(u.tipo_usuario);
      }
    });
    return Array.from(tipos).map(tipo => ({
      value: tipo,
      label: tipo
    }));
  }, [usuarios]);

  // Opciones de semestres para el filtro
  const semestreOptions = useMemo(() => {
    return semestres.map(s => ({
      value: s.term,
      label: s.term
    }));
  }, [semestres]);

  const normalizeText = (text: string): string => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  const filteredUsuarios = useMemo(() => {
    if (!searchValue && !tipoFilter && !estadoFilter && !semestreFilter) {
      return usuarios;
    }

    return usuarios.filter((usuario) => {
      const normalizedSearch = normalizeText(searchValue);
      const matchesSearch =
        !searchValue ||
        usuario.cedula.includes(searchValue) ||
        normalizeText((usuario.nombres || '') + ' ' + (usuario.apellidos || '')).includes(normalizedSearch) ||
        normalizeText(usuario.nombre_usuario || '').includes(normalizedSearch);

      const matchesTipo = !tipoFilter || usuario.tipo_usuario === tipoFilter;

      const matchesEstado = !estadoFilter ||
        (estadoFilter === 'Habilitado' && usuario.habilitado_sistema) ||
        (estadoFilter === 'Deshabilitado' && !usuario.habilitado_sistema);

      // El usuario actual siempre debe ser visible para sí mismo, independientemente del filtro de semestre
      const matchesSemestre = !semestreFilter ||
        usuario.cedula === currentUserCedula ||
        ((usuario as any).info_estudiante && (usuario as any).info_estudiante.includes(semestreFilter)) ||
        ((usuario as any).info_profesor && (usuario as any).info_profesor.includes(semestreFilter)) ||
        ((usuario as any).info_coordinador && (usuario as any).info_coordinador.includes(semestreFilter));

      return matchesSearch && matchesTipo && matchesEstado && matchesSemestre;
    });
  }, [usuarios, searchValue, tipoFilter, estadoFilter, semestreFilter]);

  const handleView = (data: Record<string, unknown>) => {
    const usuario = data as Usuario;
    router.push(`/dashboard/users/${usuario.cedula}`);
  };

  const handleSaveEdit = (usuarioEditado: Usuario) => {
    setUsuarios((prev) => prev.map(u => u.cedula === usuarioEditado.cedula ? { ...u, ...usuarioEditado } : u));
    setShowEditModal(false);
    setUsuarioToEdit(null);
  };

  const handleDisable = async (data: Record<string, unknown>) => {
    const usuario = data as Usuario;
    setDisableLoading(true);
    const result = await toggleHabilitadoUsuarioAction(usuario.cedula);
    setDisableLoading(false);
    if (!result.success) {
      alert(result.error?.message || 'Error al cambiar el estado del usuario');
      return;
    }
    setUsuarios((prev) =>
      prev.map((u) =>
        u.cedula === usuario.cedula
          ? { ...u, habilitado_sistema: !u.habilitado_sistema }
          : u
      )
    );
  };

  const handleEdit = async (data: Record<string, unknown>) => {
    const usuario = data as Usuario;
    const result = await getUsuarioInfoByCedulaAction(usuario.cedula);
    if (result.success && result.data) {
      setUsuarioToEdit({
        ...usuario,
        correo_electronico: result.data.correo_electronico,
        telefono: result.data.telefono_celular,
        nombre_usuario: result.data.nombre_usuario || usuario.nombre_usuario || '',
        term:
          result.data.estudiante?.term ||
          result.data.profesor?.term ||
          result.data.coordinador?.term || '',
        tipo_estudiante: result.data.estudiante?.tipo_estudiante || '',
        tipo_profesor: result.data.profesor?.tipo_profesor || '',
        nrc: result.data.estudiante?.nrc || '',
        nombres: result.data.nombres || usuario.nombres || '',
        apellidos: result.data.apellidos || usuario.apellidos || '',
      });
    } else {
      setUsuarioToEdit(usuario);
    }
    setShowEditModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleteLoading(true);

    const result = await deleteUsuarioFisicoAction(
      itemToDelete.cedula,
      deleteMotivo
    );

    setDeleteLoading(false);

    if (!result.success) {
      alert(result.error?.message || 'Error al eliminar usuario');
      return;
    }

    setUsuarios((prev) => prev.filter(u => u.cedula !== itemToDelete.cedula));
    setShowConfirm(false);
    setItemToDelete(null);
    setDeleteMotivo('');
  };

  const handleBatchDisable = async () => {
    if (selectedCedulas.length === 0) return;

    setIsBatchDisabling(true);
    try {
      const result = await disableUsuariosLoteAction(selectedCedulas);

      if (result.success) {
        // Actualizar lista local
        setUsuarios(prev => prev.map(u =>
          selectedCedulas.includes(u.cedula)
            ? { ...u, habilitado_sistema: false }
            : u
        ));
        setSelectedCedulas([]);
        setIsSelectionMode(false);
        setShowBatchConfirm(false);
      } else {
        alert(result.error?.message || 'Error al deshabilitar usuarios');
      }
    } catch (error) {
      console.error('Error batch disable:', error);
      alert('Error inesperado al procesar la solicitud');
    } finally {
      setIsBatchDisabling(false);
    }
  };

  const handleBatchEnable = async () => {
    if (selectedCedulas.length === 0) return;

    setIsBatchEnabling(true);
    try {
      const result = await enableUsuariosLoteAction(selectedCedulas);

      if (result.success) {
        // Actualizar lista local
        setUsuarios(prev => prev.map(u =>
          selectedCedulas.includes(u.cedula)
            ? { ...u, habilitado_sistema: true }
            : u
        ));
        setSelectedCedulas([]);
        setIsSelectionMode(false);
        setShowBatchEnableConfirm(false);
      } else {
        alert(result.error?.message || 'Error al habilitar usuarios');
      }
    } catch (error) {
      console.error('Error batch enable:', error);
      alert('Error inesperado al procesar la solicitud');
    } finally {
      setIsBatchEnabling(false);
    }
  };

  const handleBulkUploadSuccess = () => {
    loadUsuarios();
  };

  const handleCreateUserSuccess = () => {
    loadUsuarios();
  };

  const handleCerrarSemestre = async () => {
    setIsCerrandoSemestre(true);
    try {
      const result = await deshabilitarUsuariosSemestreFinalizadoAction();

      if (result.success) {
        const total = (result.data?.estudiantes_deshabilitados || 0) + (result.data?.profesores_deshabilitados || 0);
        alert(`Semestre cerrado exitosamente.\n\nUsuarios deshabilitados:\n- Estudiantes: ${result.data?.estudiantes_deshabilitados || 0}\n- Profesores: ${result.data?.profesores_deshabilitados || 0}\n\nTotal: ${total}`);
        loadUsuarios(); // Recargar la lista
      } else {
        alert(result.error?.message || 'Error al cerrar el semestre');
      }
    } catch (error) {
      console.error('Error al cerrar semestre:', error);
      alert('Error inesperado al cerrar el semestre');
    } finally {
      setIsCerrandoSemestre(false);
      setShowCerrarSemestreConfirm(false);
    }
  };
  const isMotivoValido = deleteMotivo.trim().length > 0;

  return (
    <>

      <div className="flex flex-col lg:flex-row lg:items-center gap-4 w-full px-3">
        <div className="flex-1 min-w-0">
          <CaseTools
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            searchPlaceholder="Buscar usuario..."
            estatusFilter={tipoFilter}
            onEstatusChange={setTipoFilter}
            estatusOptions={tipoOptions}
            estatusLabel="Rol"
            estatusIcon={UserCheck}
            tramiteFilter={estadoFilter}
            onTramiteChange={setEstadoFilter}
            tramiteOptions={[
              { value: 'Habilitado', label: 'Habilitados' },
              { value: 'Deshabilitado', label: 'Deshabilitados' }
            ]}
            tramiteLabel="Estado"
            tramiteIcon={Activity}
            termFilter={semestreFilter}
            onTermChange={setSemestreFilter}
            termOptions={semestreOptions}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center shrink-0 w-full lg:w-auto">
          {isSelectionMode ? (
            <div className="flex flex-wrap gap-2 items-center w-full justify-end">
              <button
                onClick={() => {
                  setIsSelectionMode(false);
                  setSelectedCedulas([]);
                }}
                className="h-10 px-4 flex items-center cursor-pointer justify-center gap-2 bg-gray-100 text-gray-700 border border-gray-200 rounded-full hover:bg-gray-200 transition-colors font-medium whitespace-nowrap"
              >
                <span>Cancelar</span>
              </button>

              {selectedCedulas.length > 0 && (
                <>
                  {usuarios.some(u => selectedCedulas.includes(u.cedula) && u.habilitado_sistema) && (
                    <button
                      onClick={() => setShowBatchConfirm(true)}
                      className="h-10 px-4 flex items-center cursor-pointer justify-center gap-2 bg-red-50 text-red-600 border border-red-200 rounded-full hover:bg-red-100 transition-colors font-medium whitespace-nowrap"
                    >
                      <UserX className="w-5 h-5" />
                      <span className="text-sm sm:text-base">Deshabilitar ({selectedCedulas.filter(id => usuarios.find(u => u.cedula === id)?.habilitado_sistema).length})</span>
                    </button>
                  )}

                  {usuarios.some(u => selectedCedulas.includes(u.cedula) && !u.habilitado_sistema) && (
                    <button
                      onClick={() => setShowBatchEnableConfirm(true)}
                      className="h-10 px-4 flex items-center cursor-pointer justify-center gap-2 bg-green-50 text-green-600 border border-green-200 rounded-full hover:bg-green-100 transition-colors font-medium whitespace-nowrap"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm sm:text-base">Habilitar ({selectedCedulas.filter(id => !usuarios.find(u => u.cedula === id)?.habilitado_sistema).length})</span>
                    </button>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
              <DropdownMenu
                trigger={(isOpen) => (
                  <div
                    className="h-10 px-4 w-full flex items-center cursor-pointer justify-center gap-2 bg-white text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors font-medium whitespace-nowrap"
                  >
                    <UserX className="w-5 h-5 text-gray-500" />
                    <span>Gestión en lote</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                )}
                align="left"
                className="w-full"
                menuClassName="bg-white border border-gray-300 rounded-2xl shadow-xl min-w-[220px] overflow-hidden py-2"
              >
                <div onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setIsSelectionMode(true);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3 cursor-pointer"
                  >
                    <Users className="w-5 h-5 text-gray-500" />
                    <span>Seleccionar usuarios</span>
                  </button>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setShowCerrarSemestreConfirm(true);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 cursor-pointer"
                  >
                    <CalendarX2 className="w-5 h-5 text-red-500" />
                    <span>Cerrar Semestre</span>
                  </button>
                </div>
              </DropdownMenu>

              <DropdownMenu
                trigger={(isOpen) => (
                  <div
                    className="h-10 px-4 w-full flex items-center cursor-pointer justify-center gap-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors font-medium whitespace-nowrap"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Registrar Usuario</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                )}
                onOpenChange={setIsDropdownOpen}
                align="left"
                className="w-full"
                menuClassName="bg-white border border-gray-300 rounded-2xl shadow-xl min-w-[220px] overflow-hidden py-2"
              >
                <div onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setIsDropdownOpen(false);
                      Promise.resolve().then(() => {
                        setIsCreateUserModalOpen(true);
                      });
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3 cursor-pointer"
                  >
                    <UserPlus className="w-5 h-5 text-primary" />
                    <span>Registrar usuario</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setIsDropdownOpen(false);
                      Promise.resolve().then(() => {
                        setIsBulkUploadModalOpen(true);
                      });
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3 cursor-pointer"
                  >
                    <Users className="w-5 h-5 text-primary" />
                    <span>Registrar por lotes</span>
                  </button>
                </div>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10"></div>

      {loading ? (
        <div className="m-3">
          <TableSkeleton columns={5} rows={10} />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1, ease: "easeOut" }}
        >
          <Table
            data={filteredUsuarios.map((u) => {
              // Extraer el semestre más reciente según el tipo de usuario
              let semestreActual = 'Sin semestre';
              const infoField = (u as any).info_estudiante || (u as any).info_profesor || (u as any).info_coordinador;
              if (infoField) {
                const match = infoField.match(/(\d{4}-\d{2})/);
                if (match) {
                  semestreActual = match[1];
                }
              }
              return {
                cedula: u.cedula,
                nombre_completo: `${u.nombres || ''} ${u.apellidos || ''}`.trim(),
                rol: u.tipo_usuario,
                semestre: semestreActual,
                estado: u.habilitado_sistema ? 'Habilitado' : 'Deshabilitado',
              };
            })}
            columns={["Cédula", "Nombre Completo", "Rol", "Semestre", "Estado"]}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            selectable={isSelectionMode}
            selectedIds={selectedCedulas}
            onSelectionChange={(ids) => {
              // No permitir seleccionarse a sí mismo en lote
              const filteredIds = ids.filter(id => id !== currentUserCedula);
              setSelectedCedulas(filteredIds);
            }}
            idKey="cedula"
            actions={[
              {
                label: (row) => {
                  if (row.cedula === currentUserCedula) return '';
                  const isHabilitado = row.estado === 'Habilitado';
                  return (
                    <span className="flex items-center gap-2">
                      {isHabilitado ? (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-4 h-4 text-yellow-600"
                        >
                          <rect x="3" y="11" width="18" height="10" rx="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          <circle cx="12" cy="16" r="1" />
                        </svg>
                      ) : (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-4 h-4 text-yellow-600"
                        >
                          <rect x="3" y="11" width="18" height="10" rx="2" />
                          <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                          <circle cx="12" cy="16" r="1" />
                        </svg>
                      )}
                      {isHabilitado ? 'Deshabilitar' : 'Habilitar'}
                    </span>
                  );
                },
                onClick: (row) => {
                  if (row.cedula !== currentUserCedula) handleDisable(row);
                },
              },
            ]}
            hideEdit={() => false}
            hideDelete={(row: { cedula: string }) => row.cedula === currentUserCedula}
          />
        </motion.div>
      )}

      <BulkUploadModal
        isOpen={isBulkUploadModalOpen}
        onClose={() => setIsBulkUploadModalOpen(false)}
        onSuccess={handleBulkUploadSuccess}
      />

      <CreateUserModal
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
        onSuccess={handleCreateUserSuccess}
      />

      <EditUserModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setUsuarioToEdit(null); }}
        usuario={usuarioToEdit}
        onSave={handleSaveEdit}
      />

      {/* Modal de confirmación para deshabilitación masiva */}
      <ConfirmModal
        isOpen={showBatchConfirm}
        onClose={() => setShowBatchConfirm(false)}
        onConfirm={handleBatchDisable}
        title="Deshabilitar usuarios por lote"
        message={
          <div>
            <p className="mb-4 text-base text-foreground">
              ¿Estás seguro de que deseas deshabilitar el acceso a los <strong>{selectedCedulas.filter(id => usuarios.find(u => u.cedula === id)?.habilitado_sistema).length}</strong> usuarios seleccionados?
            </p>
            <p className="text-gray-600 text-sm">
              Estos usuarios ya no podrán ingresar al sistema, pero su información histórica se mantendrá preservada en todos los registros de casos y citas.
            </p>
          </div>
        }
        confirmLabel={isBatchDisabling ? 'Procesando...' : 'Deshabilitar usuarios'}
        cancelLabel="Cancelar"
        disabled={isBatchDisabling}
        confirmVariant="primary"
      />

      {/* Modal de confirmación para habilitación masiva */}
      <ConfirmModal
        isOpen={showBatchEnableConfirm}
        onClose={() => setShowBatchEnableConfirm(false)}
        onConfirm={handleBatchEnable}
        title="Habilitar usuarios por lote"
        message={
          <div>
            <p className="mb-4 text-base text-foreground">
              ¿Estás seguro de que deseas reactivar el acceso a los <strong>{selectedCedulas.filter(id => !usuarios.find(u => u.cedula === id)?.habilitado_sistema).length}</strong> usuarios seleccionados?
            </p>
            <p className="text-gray-600 text-sm">
              Estos usuarios podrán ingresar nuevamente al sistema con sus credenciales habituales.
            </p>
          </div>
        }
        confirmLabel={isBatchEnabling ? 'Procesando...' : 'Habilitar usuarios'}
        cancelLabel="Cancelar"
        disabled={isBatchEnabling}
        confirmVariant="primary"
      />

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setDeleteMotivo('');
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar usuario permanentemente"
        message={
          <div>
            <p className="mb-4 text-base text-foreground">
              ¿Estás seguro de que deseas eliminar al usuario <strong>{itemToDelete ? `${itemToDelete.nombres || ''} ${itemToDelete.apellidos || ''}` : ''}</strong>?
            </p>
            <p className="mb-6 text-red-600 font-semibold text-base">
              Esta acción es irreversible y solo puede realizarla un coordinador.
            </p>
            <div className="flex flex-col gap-1">
              <label className="text-base font-normal text-foreground mb-1">
                Motivo de la eliminación
              </label>
              <textarea
                className={`
                  w-full p-4 rounded-lg border bg-[#E5E7EB] border-transparent
                  focus:outline-none focus:ring-1 focus:ring-primary
                  text-base placeholder:text-[#717171] resize-none
                  ${deleteLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                rows={4}
                maxLength={250}
                value={deleteMotivo}
                onChange={e => setDeleteMotivo(e.target.value)}
                placeholder="Describe el motivo de la eliminación..."
                disabled={deleteLoading}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {deleteMotivo.length} / 250 caracteres
              </div>
            </div>
          </div>
        }
        confirmLabel={deleteLoading ? 'Eliminando...' : 'Eliminar'}
        cancelLabel="Cancelar"
        disabled={deleteLoading || !isMotivoValido}
        confirmVariant="danger"
      />

      {/* Modal de confirmación para cerrar semestre */}
      <ConfirmModal
        isOpen={showCerrarSemestreConfirm}
        onClose={() => setShowCerrarSemestreConfirm(false)}
        onConfirm={handleCerrarSemestre}
        title="Cerrar Semestre"
        message={
          <div className="space-y-4">
            <p>Esta acción deshabilitará las inscripciones de <strong>estudiantes y profesores</strong> de semestres que ya finalizaron.</p>
            <p className="text-sm text-gray-600">Solo afecta a semestres cuya fecha de fin ya pasó.</p>
          </div>
        }
        confirmLabel={isCerrandoSemestre ? 'Procesando...' : 'Cerrar Semestre'}
        cancelLabel="Cancelar"
        disabled={isCerrandoSemestre}
        confirmVariant="danger"
      />
    </>
  );
}
