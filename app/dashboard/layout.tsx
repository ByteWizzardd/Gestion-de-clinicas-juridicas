'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/sidebar/Sidebar';
import type { UserRole } from '../../components/sidebar/menu-config';
import Notification from '../../components/ui/feedback/Notification';
import DateTime from '../../components/ui/calendar/DateTime';
import { mapSystemRoleToSidebarRole } from '@/lib/utils/role-mapper';

interface User {
  cedula: string;
  nombres: string;
  apellidos: string;
  correo: string;
  rol: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener información del usuario autenticado usando Server Action
    const fetchUser = async () => {
      try {
        const { getCurrentUserAction } = await import('@/app/actions/auth');
        const result = await getCurrentUserAction();

        if (result.success && result.data) {
          setUser(result.data);
        } else {
          // Si no hay sesión, redirigir al login
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Error al obtener usuario:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-lg text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return null; // La redirección se maneja en el useEffect
  }

  const userRole: UserRole = mapSystemRoleToSidebarRole(user.rol);
  const userName = `${user.nombres} ${user.apellidos}`.trim() || 'Usuario';

  return (
    <div className="flex h-screen bg-background relative">
      <div className="flex-shrink-0">
        <Sidebar role={userRole} userName={userName} />
      </div>

      <div className="flex-1 flex flex-col w-full">
        <div className="absolute top-6 right-6 flex items-center gap-4 z-50 text-lg bg-white rounded-3xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] px-4 py-2">
          <Notification count={3} />
          <DateTime />
        </div>

        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}