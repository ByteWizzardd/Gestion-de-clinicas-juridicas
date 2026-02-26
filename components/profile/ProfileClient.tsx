'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import PhotoUploadHeader from '@/components/profile/PhotoUploadHeader';
import GeneralInfoTab from '@/components/profile/tabs/GeneralInfoTab';
import { getCurrentUserAction } from '@/app/actions/auth';
import ProfileSkeleton from '@/components/ui/skeletons/ProfileSkeleton';

interface User {
  cedula: string;
  nombres: string;
  apellidos: string;
  correo: string;
  rol: string;
  fotoPerfil?: string | null;
}

interface ProfileClientProps {
  initialUser: User | null | undefined;
}

export default function ProfileClient({ initialUser }: ProfileClientProps) {
  const [user, setUser] = useState<User | null>(initialUser || null);
  const [loading, setLoading] = useState(!initialUser);

  useEffect(() => {
    if (!initialUser) {
      const fetchUser = async () => {
        try {
          const result = await getCurrentUserAction();
          if (result.success && result.data) {
            setUser(result.data);
          }
        } catch (error) {
          console.error('Error al obtener usuario:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [initialUser]);

  const handlePhotoUpdated = async () => {
    // Refrescar datos del usuario para obtener la nueva foto
    const result = await getCurrentUserAction();
    if (result.success && result.data) {
      setUser(result.data);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <strong>Error: </strong>
          <span>No se pudo cargar la información del usuario</span>
        </div>
      </div>
    );
  }

  const nombreCompleto = `${user.nombres} ${user.apellidos}`;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1, ease: "easeOut" }}
      >
        <Breadcrumbs
          items={[
            { label: 'Perfil' },
          ]}
        />
      </motion.div>

      <motion.div
        className="mb-6 sm:mb-8 relative"
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1, ease: "easeOut" }}
      >
        <div className="flex items-center gap-4 mb-4">
          <PhotoUploadHeader
            currentPhoto={user.fotoPerfil || null}
            onPhotoUpdated={handlePhotoUpdated}
            nombreInicial={user.nombres}
          />
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-2" style={{ fontFamily: 'var(--font-league-spartan)' }}>
              {nombreCompleto}
            </h1>
            <p className="text-sm sm:text-base text-gray-500">
              Cédula: {user.cedula}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1, ease: "easeOut" }}
      >
        <GeneralInfoTab user={user} />
      </motion.div>
    </div>
  );
}
