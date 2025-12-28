'use client';

import { useState, useMemo, useEffect } from 'react';
import ConfirmModal from '../ui/feedback/ConfirmModal';
import CaseTools from '@/components/CaseTools/CaseTools';
import Table from '@/components/Table/Table';
import BulkUploadModal from './BulkUploadModal';
import { getUsuariosAction, deleteUsuarioFisicoAction, toggleHabilitadoUsuarioAction } from '@/app/actions/usuarios';

// Simulación: obtener tipo de usuario actual (debería venir de contexto/auth real)
function getCurrentUserTipo(): string {
  // TODO: Reemplazar por lógica real de autenticación
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem('tipo_usuario') || '';
  }
  return '';
}

interface Usuario extends Record<string, unknown> {
  cedula: string;
  nombre_completo: string;
  nombre_usuario: string;
  habilitado_sistema: boolean;
  tipo_usuario: string;
}

interface UsersClientProps {
  initialUsuarios?: Usuario[];
}

export default function UsersClient({ initialUsuarios = [] }: UsersClientProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Usuario | null>(null);
  const [deleteMotivo, setDeleteMotivo] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [, setDisableLoading] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>(initialUsuarios);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [loading, setLoading] = useState(false);

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
        normalizeText(usuario.nombre_completo || '').includes(normalizedSearch) ||
        normalizeText(usuario.nombre_usuario || '').includes(normalizedSearch);

      const matchesTipo = !tipoFilter || usuario.tipo_usuario === tipoFilter;

      return matchesSearch && matchesTipo;
    });
  }, [usuarios, searchValue, tipoFilter]);

  const handleView = (data: Record<string, unknown>) => {
    const usuario = data as Usuario;
    alert(`Ver detalles de: ${usuario.nombre_completo}`);
  };

  const handleEdit = (data: Record<string, unknown>) => {
    const usuario = data as Usuario;
    alert(`Editar usuario: ${usuario.nombre_completo}`);
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

  const handleDelete = (data: Record<string, unknown>) => {
    const usuario = data as Usuario;
    // Solo permitir si el usuario actual es coordinador
    if (getCurrentUserTipo() !== 'Coordinador') {
      alert('Solo los coordinadores pueden eliminar usuarios permanentemente.');
      return;
    }
    setItemToDelete(usuario);
    setShowConfirm(true);
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

  // Formatear información adicional para mostrar en la tabla
  /* 
  const formatInfo = (usuario: Usuario): string => {
    if (usuario.tipo_usuario === 'Estudiante' && usuario.info_estudiante) {
      return typeof usuario.info_estudiante === 'string'
        ? usuario.info_estudiante
        : JSON.stringify(usuario.info_estudiante);
    }
    if (usuario.tipo_usuario === 'Profesor' && usuario.info_profesor) {
      return typeof usuario.info_profesor === 'string'
        ? usuario.info_profesor
        : JSON.stringify(usuario.info_profesor);
    }
    if (usuario.tipo_usuario === 'Coordinador' && usuario.info_coordinador) {
      return typeof usuario.info_coordinador === 'string'
        ? usuario.info_coordinador
        : JSON.stringify(usuario.info_coordinador);
    }
    return '-';
  };
  */
 
  // Validación de motivo
  const isMotivoValido = deleteMotivo.trim().length > 0;

  return (
    <>
      <h1 className="text-4xl m-3 font-semibold font-primary">Gestión de Usuarios</h1>
      <p className="mb-6 ml-3">
        Administración de usuarios del sistema: estudiantes, profesores y coordinadores
      </p>
      
      <CaseTools 
        addLabel="Cargar Estudiantes por Lotes" 
        onAddClick={() => setIsBulkUploadModalOpen(true)}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        estatusFilter={tipoFilter}
        onEstatusChange={setTipoFilter}
        estatusOptions={tipoOptions}
        tramiteFilter=""
        onTramiteChange={() => {}}
        tramiteOptions={[]}
      />
      
      <div className="mt-10"></div>

      {loading ? (
        <div className="m-3 p-4 text-center">
          <p className="text-gray-600">Cargando usuarios...</p>
        </div>
      ) : (
        <Table
          data={filteredUsuarios.map((u) => ({
            cedula: u.cedula,
            nombre_completo: u.nombre_completo,
            nombre_usuario: u.nombre_usuario,
            tipo_usuario: u.tipo_usuario,
            estado: u.habilitado_sistema ? 'Habilitado' : 'Deshabilitado',
          }))}
          columns={["Cédula", "Nombre Completo", "Usuario", "Tipo", "Estado"]}
          onView={handleView}
          onEdit={handleEdit}
          actions={[
            {
              label: (row: unknown) => {
                const estado = (row as { estado: string }).estado;
                const isHabilitado = estado === 'Habilitado';
                return (
                  <span
                    className={`flex items-center gap-2 px-2 py-1 rounded transition-colors
                      ${isHabilitado
                        ? ' '
                        : ' '}
                    `}
                  >
                    {isHabilitado ? (
                      // SVG de candado cerrado (deshabilitar)
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
                      // SVG de candado abierto (habilitar)
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
          onDelete={handleDelete}
        />
      )}

      <BulkUploadModal
        isOpen={isBulkUploadModalOpen}
        onClose={() => setIsBulkUploadModalOpen(false)}
        onSuccess={handleBulkUploadSuccess}
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
            <p>¿Está seguro de que desea eliminar al usuario <b>{itemToDelete?.nombre_completo || ''}</b>?</p>
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

