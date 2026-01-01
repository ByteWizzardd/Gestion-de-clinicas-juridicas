'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import ConfirmModal from '../ui/feedback/ConfirmModal';
import CaseTools from '@/components/CaseTools/CaseTools';
import Table from '@/components/Table/Table';
import BulkUploadModal from './BulkUploadModal';
import { getUsuariosAction, deleteUsuarioFisicoAction, getUsuarioInfoByCedulaAction, toggleHabilitadoUsuarioAction } from '@/app/actions/usuarios';
import EditUserModal from './EditUserModal';

// Simulación: obtener tipo de usuario actual (debería venir de contexto/auth real)


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
}

export default function UsersClient({ initialUsuarios = [] }: UsersClientProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [usuarioToEdit, setUsuarioToEdit] = useState<Usuario | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Usuario | null>(null);
  const [deleteMotivo, setDeleteMotivo] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [disableLoading, setDisableLoading] = useState(false);

  const [usuarios, setUsuarios] = useState<Usuario[]>(initialUsuarios);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const router = useRouter();

  // Detectar preferencia de movimiento reducido
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Cargar usuarios al montar el componente si no hay datos iniciales
  useEffect(() => {
    if (initialUsuarios.length === 0) {
      loadUsuarios();
    }
  }, [initialUsuarios.length]);

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
  
  // Permite seleccionar el usuario a eliminar y mostrar el modal de confirmación
  const handleDelete = (data: Record<string, unknown>) => {
    const usuario = data as Usuario;
    setItemToDelete(usuario);
    setShowConfirm(true);
  };


  // Preparar opciones de tipo de usuario
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

  // Función para normalizar texto removiendo acentos
  const normalizeText = (text: string): string => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  // Filtrar usuarios
  const filteredUsuarios = useMemo(() => {
    if (!searchValue && !tipoFilter) {
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

      return matchesSearch && matchesTipo;
    });
  }, [usuarios, searchValue, tipoFilter]);

  const handleView = (data: Record<string, unknown>) => {
    const usuario = data as Usuario;
    router.push(`/dashboard/users/${usuario.cedula}`);
  };



  const handleSaveEdit = (usuarioEditado: Usuario) => {
    // Aquí deberías llamar a la acción de actualización real
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
    // Actualizar la lista de usuarios localmente
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
    // Buscar usuario completo con info extendida (incluyendo TERM)
    const result = await getUsuarioInfoByCedulaAction(usuario.cedula);
    if (result.success && result.data) {
      setUsuarioToEdit({
        ...usuario,
        correo_electronico: result.data.correo_electronico,
        telefono: result.data.telefono_celular,
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
      setUsuarioToEdit(usuario); // fallback
    }
    setShowEditModal(true);
  };

  // Función para eliminar usuario (debes implementar la lógica real de eliminación)
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

    // Actualiza la lista de usuarios o recarga
    setUsuarios((prev) => prev.filter(u => u.cedula !== itemToDelete.cedula));
    setShowConfirm(false);
    setItemToDelete(null);
    setDeleteMotivo('');
  };

  const handleBulkUploadSuccess = () => {
    loadUsuarios();
  };
  
  // Validación de motivo
  const isMotivoValido = deleteMotivo.trim().length > 0;

  // Obtener la cédula del usuario autenticado (simulación: localStorage)
  const getCurrentUserCedula = (): string => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('cedula') || '';
    }
    return '';
  };

  const currentUserCedula = getCurrentUserCedula();

  return (
    <>
      <motion.div 
        className="mb-4 md:mb-6 mt-4"
        initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: "easeOut" }}
      >
        <h1 className="text-4xl m-3 font-semibold font-primary">Gestión de Usuarios</h1>
        <p className="mb-6 ml-3">
          Administración de usuarios del sistema: estudiantes, profesores y coordinadores
        </p>
      </motion.div>
      
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: prefersReducedMotion ? 0 : 0.1, ease: "easeOut" }}
      >
        <CaseTools 
          addLabel="Cargar Estudiantes por Lotes" 
          onAddClick={() => setIsBulkUploadModalOpen(true)}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Buscar usuario..."
          estatusFilter={tipoFilter}
          onEstatusChange={setTipoFilter}
          estatusOptions={tipoOptions}
          tramiteFilter=""
          onTramiteChange={() => {}}
          tramiteOptions={[]}
        />
      </motion.div>
      
      <div className="mt-10"></div>

      {loading ? (
        <div className="m-3 p-4 text-center">
          <p className="text-gray-600">Cargando usuarios...</p>
        </div>
      ) : (
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
        >
          <Table
            data={filteredUsuarios.map((u) => ({
              cedula: u.cedula,
              nombre_completo: `${u.nombres || ''} ${u.apellidos || ''}`.trim(),
              nombre_usuario: u.nombre_usuario,
              tipo_usuario: u.tipo_usuario,
              estado: u.habilitado_sistema ? 'Habilitado' : 'Deshabilitado',
            }))}
            columns={["Cédula", "Nombre Completo", "Usuario", "Tipo", "Estado"]}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            actions={[
              {
                label: (row) => {
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
                onClick: handleDisable,
              },
            ]}
            hideEdit={(row: { cedula: string }) => row.cedula === currentUserCedula}
            hideDelete={(row: { cedula: string }) => row.cedula === currentUserCedula}
          />
        </motion.div>
      )}


      <BulkUploadModal
        isOpen={isBulkUploadModalOpen}
        onClose={() => setIsBulkUploadModalOpen(false)}
        onSuccess={handleBulkUploadSuccess}
      />

      <EditUserModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setUsuarioToEdit(null); }}
        usuario={usuarioToEdit}
        onSave={handleSaveEdit}
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
            <p>¿Está seguro de que desea eliminar al usuario <b>{itemToDelete ? `${itemToDelete.nombres || ''} ${itemToDelete.apellidos || ''}` : ''}</b>?</p>
            <p className="mt-2 text-danger font-semibold">Esta acción es irreversible y solo puede realizarla un coordinador.</p>
            <label className="block mt-4 mb-2 font-medium">Motivo de la eliminación:</label>
            <textarea
              className="w-full border rounded p-2"
              rows={3}
              maxLength={250}
              value={deleteMotivo}
              onChange={e => setDeleteMotivo(e.target.value)}
              placeholder="Describe el motivo..."
              disabled={deleteLoading}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {deleteMotivo.length} / 250 caracteres
              {!isMotivoValido && ' - El motivo es obligatorio.'}
            </div>
          </div>
        }
        confirmLabel={deleteLoading ? 'Eliminando...' : 'Eliminar permanentemente'}
        cancelLabel="Cancelar"
        disabled={deleteLoading || !isMotivoValido}
      />
    </>
  );
}

