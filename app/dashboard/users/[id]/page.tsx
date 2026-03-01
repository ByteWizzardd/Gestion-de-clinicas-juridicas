"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Tabs from "@/components/ui/Tabs";
import GeneralInfoTab from "@/components/users/tabs/GeneralInfoTab";
import RolesTab from "@/components/users/tabs/RolesTab";
import EditableAvatar from "@/components/users/EditableAvatar";
import { getUsuarioInfoByCedulaAction } from "@/app/actions/usuarios";
import { getCurrentUserAction } from "@/app/actions/auth";
import { getCasosByUsuarioCedulaAction } from "@/app/actions/casos"; // Importar acción para casos
import UserCasesTab from "@/components/users/tabs/UserCasesTab";
import ProfileSkeleton from '@/components/ui/skeletons/ProfileSkeleton';
import ActionMenu from "@/components/ui/ActionMenu";
import EditUserModal from "@/components/users/EditUserModal";
import ConfirmModal from "@/components/ui/feedback/ConfirmModal";
import { useToast } from "@/components/ui/feedback/ToastProvider";
import { toggleHabilitadoUsuarioAction, deleteUsuarioFisicoAction } from "@/app/actions/usuarios";
import { UserX, UserCheck } from "lucide-react";

interface Usuario {
  cedula: string;
  nombres: string;
  apellidos: string;
  correo_electronico: string;
  telefono_celular: string | null;
  nombre_completo: string;
  nombre_usuario: string;
  habilitado_sistema?: boolean;
  tipo_usuario?: string;
  fotoPerfil?: string | null;
  info_estudiante?: string | null;
  info_profesor?: string | null;
  info_coordinador?: string | null;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [currentUserCedula, setCurrentUserCedula] = useState<string | null>(null);
  const [casos, setCasos] = useState<any[]>([]); // Estado para los casos
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteMotivo, setDeleteMotivo] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingHabilitado, setIsTogglingHabilitado] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      const fetchUsuario = async () => {
        try {
          setLoading(true);
          setError(null);

          const [result, userResult, casosResult] = await Promise.all([
            getUsuarioInfoByCedulaAction(id),
            getCurrentUserAction(),
            getCasosByUsuarioCedulaAction(id) // Obtener casos del usuario
          ]);

          if (userResult.success && userResult.data) {
            setCurrentUserRole(userResult.data.rol);
            setCurrentUserCedula(userResult.data.cedula);
          }

          if (!result.success) {
            throw new Error(
              result.error?.message || "Error al cargar la información del usuario"
            );
          }
          if (result.data) {
            setUsuario(result.data);
          } else {
            throw new Error("No se pudo obtener la información");
          }

          if (casosResult.success && casosResult.data) {
            setCasos(casosResult.data);
          }

        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Error desconocido";
          setError(errorMessage);
          console.error("Error fetching usuario:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchUsuario();
    }
  }, [id, id]);

  const handleEdit = () => {
    setShowEditModal(true);
  };

  // Build the usuario object for EditUserModal with flat fields
  const usuarioForEdit = usuario ? {
    cedula: usuario.cedula,
    nombres: usuario.nombres,
    apellidos: usuario.apellidos,
    correo_electronico: usuario.correo_electronico,
    telefono: usuario.telefono_celular,
    nombre_usuario: usuario.nombre_usuario,
    tipo_usuario: usuario.tipo_usuario || '',
    term:
      (usuario as any).estudiante?.term ||
      (usuario as any).profesor?.term ||
      (usuario as any).coordinador?.term || '',
    tipo_estudiante: (usuario as any).estudiante?.tipo_estudiante || '',
    tipo_profesor: (usuario as any).profesor?.tipo_profesor || '',
    nrc: (usuario as any).estudiante?.nrc || '',
  } : null;

  const handleSaveEdit = (usuarioEditado: any) => {
    setUsuario(prev => prev ? { ...prev, ...usuarioEditado } : null);
    setShowEditModal(false);
  };

  const handleToggleHabilitado = async () => {
    if (!usuario || isTogglingHabilitado) return;

    setIsTogglingHabilitado(true);
    try {
      const result = await toggleHabilitadoUsuarioAction(usuario.cedula);
      if (result.success) {
        setUsuario(prev => prev ? { ...prev, habilitado_sistema: !prev.habilitado_sistema } : null);
        toast.success(`Usuario ${!usuario.habilitado_sistema ? 'habilitado' : 'deshabilitado'} correctamente`);
      } else {
        toast.error(result.error?.message || 'Error al cambiar estado');
      }
    } catch (error) {
      toast.error('Error inesperado al cambiar estado');
    } finally {
      setIsTogglingHabilitado(false);
    }
  };

  const handleDelete = async () => {
    if (!usuario || isDeleting) return;

    setIsDeleting(true);
    try {
      const result = await deleteUsuarioFisicoAction(usuario.cedula, deleteMotivo);
      if (result.success) {
        toast.success('Usuario eliminado permanentemente');
        router.push(currentUserRole === 'Profesor' ? '/dashboard/students' : '/dashboard/users');
      } else {
        toast.error(result.error?.message || 'Error al eliminar usuario');
      }
    } catch (error) {
      toast.error('Error inesperado al eliminar usuario');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton showTabs tabsCount={3} breadcrumbsCount={3} />;
  }

  if (error || !usuario) {
    return (
      <div className="p-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded transition-colors">
          <strong className="font-bold">Error: </strong>
          <span>{error || "No se encontró el usuario"}</span>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'general',
      label: 'Información General',
      content: <GeneralInfoTab usuario={usuario} />,
    },
    {
      id: 'roles',
      label: 'Roles y Perfiles',
      content: <RolesTab usuario={usuario} />,
    },
    {
      id: 'cases',
      label: 'Casos',
      content: <UserCasesTab casos={casos} />,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1, ease: "easeOut" }}
        className="hidden md:block mb-4 sm:mb-6"
      >
        <Breadcrumbs
          items={[
            {
              label: currentUserRole === 'Profesor' ? "Estudiantes" : "Usuarios",
              href: currentUserRole === 'Profesor' ? "/dashboard/students" : "/dashboard/users"
            },
            { label: usuario.nombre_completo },
          ]}
        />
      </motion.div>

      {/* Botón de volver para móvil */}
      <motion.div
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1, ease: "easeOut" }}
        className="md:hidden mb-4"
      >
        <button
          onClick={() => router.push(currentUserRole === 'Profesor' ? '/dashboard/students' : '/dashboard/users')}
          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors cursor-pointer font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver a {currentUserRole === 'Profesor' ? "Estudiantes" : "Usuarios"}</span>
        </button>
      </motion.div>


      <motion.div
        className="mb-6 sm:mb-8 relative"
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1, ease: "easeOut" }}
      >
        <div className="flex items-center gap-4 mb-4">
          <EditableAvatar
            fotoPerfil={usuario.fotoPerfil || null}
            cedula={usuario.cedula}
            nombreInicial={usuario.nombres}
            allowUpload={false}
            onPhotoUpdated={() => {
              // Refrescar datos del usuario
              const fetchUsuario = async () => {
                try {
                  const result = await getUsuarioInfoByCedulaAction(id);
                  if (result.success && result.data) {
                    setUsuario(result.data);
                  }
                } catch (err) {
                  console.error('Error al actualizar usuario:', err);
                }
              };
              fetchUsuario();
            }}
            onSuccess={setShowSuccess}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold transition-all duration-200" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                {usuario.nombre_completo}
              </h1>
              <ActionMenu
                variant="vertical"
                onEdit={handleEdit}
                onDelete={usuario.cedula === currentUserCedula ? undefined : () => setShowDeleteConfirm(true)}
                customActions={[
                  ...(usuario.cedula !== currentUserCedula ? [{
                    label: (
                      <span className="flex items-center gap-2">
                        {usuario.habilitado_sistema ? (
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
                        {usuario.habilitado_sistema ? 'Deshabilitar' : 'Habilitar'}
                      </span>
                    ),
                    onClick: handleToggleHabilitado
                  }] : [])
                ]}
              />
            </div>
            <p className="text-sm sm:text-base text-[var(--card-text-muted)] transition-colors">
              Cédula: {usuario.cedula}
            </p>
          </div>
        </div>

        {/* Notificación de éxito centrada abajo de la sección */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-center mt-4"
            >
              <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-400 rounded-lg text-sm transition-colors">
                Operación exitosa
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1, ease: "easeOut" }}
      >
        <Tabs tabs={tabs} defaultTab="general" />
      </motion.div>

      {/* Modales */}
      <EditUserModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        usuario={usuarioForEdit as any}
        onSave={handleSaveEdit}
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteMotivo("");
        }}
        onConfirm={handleDelete}
        title="Eliminar usuario permanentemente"
        message={
          <div>
            <p className="mb-4 text-base text-foreground">
              ¿Estás seguro de que deseas eliminar permanentemente a <strong>{usuario.nombre_completo}</strong>?
            </p>
            <p className="mb-6 text-red-600 font-semibold text-base">
              Esta acción es irreversible y eliminará todos los registros históricos asociados a este usuario.
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
                  ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                rows={4}
                maxLength={250}
                value={deleteMotivo}
                onChange={e => setDeleteMotivo(e.target.value)}
                placeholder="Describe el motivo de la eliminación..."
                disabled={isDeleting}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {deleteMotivo.length} / 250 caracteres
              </div>
            </div>
          </div>
        }
        confirmLabel={isDeleting ? 'Eliminando...' : 'Eliminar usuario'}
        cancelLabel="Cancelar"
        disabled={isDeleting || !deleteMotivo.trim()}
        confirmVariant="danger"
      />
    </div>
  );
}

