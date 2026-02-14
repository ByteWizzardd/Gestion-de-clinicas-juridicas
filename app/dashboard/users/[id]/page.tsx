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
import DetailPageSkeleton from '@/components/ui/skeletons/DetailPageSkeleton'; // Importar el componente de la pestaña

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
  const [casos, setCasos] = useState<any[]>([]); // Estado para los casos

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
  }, [id]);

  if (loading) {
    return <DetailPageSkeleton showAvatar tabsCount={3} />;
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
        <div className="bg-red-50 border border-red-200 text-danger px-4 py-3 rounded">
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
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


      <motion.div
        className="mb-6 sm:mb-8 relative"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
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
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-2" style={{ fontFamily: 'var(--font-league-spartan)' }}>
              {usuario.nombre_completo}
            </h1>
            <p className="text-sm sm:text-base text-gray-500">
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
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                Operación exitosa
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Tabs tabs={tabs} defaultTab="general" />
      </motion.div>
    </div>
  );
}

