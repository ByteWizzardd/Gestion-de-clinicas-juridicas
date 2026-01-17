'use client';

import { useState, useEffect, memo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { getMenuByRole, type UserRole } from './menu-config';
import ProfileDropdown from '@/components/ui/navigation/ProfileDropdown';
import { getCurrentUserAction } from '@/app/actions/auth';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  userName?: string;
}

const Sidebar = memo(function Sidebar({ role, userName = 'Nombre Apellido' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const menu = getMenuByRole(role);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ nombre: string; rol: string } | null>(null);

  // Estado para colapsar el sidebar
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Función para obtener datos del usuario
  const fetchUserData = async () => {
    try {
      const result = await getCurrentUserAction();
      if (result.success && result.data) {
        setCurrentUser({
          nombre: `${result.data.nombres} ${result.data.apellidos}`,
          rol: result.data.rol,
        });
        setFotoPerfil(result.data.fotoPerfil || null);
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
    }
  };

  // Obtener información del usuario y foto de perfil al montar
  useEffect(() => {
    fetchUserData();
  }, []);

  // Escuchar eventos de actualización de foto de perfil
  useEffect(() => {
    const handlePhotoUpdate = () => {
      fetchUserData();
    };

    window.addEventListener('photoProfileUpdated', handlePhotoUpdate);
    return () => {
      window.removeEventListener('photoProfileUpdated', handlePhotoUpdate);
    };
  }, []);

  // Función para obtener el label del rol en español
  const getRoleLabel = (role: UserRole): string => {
    const roleLabels: Record<UserRole, string> = {
      coordinator: 'Coordinador',
      professor: 'Profesor',
      student: 'Estudiante',
    };
    return roleLabels[role];
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      // Limpiar todos los datos del formulario de solicitante del localStorage
      try {
        localStorage.removeItem('applicant_form_data');
        localStorage.removeItem('applicant_form_current_step');
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('applicant_form_data')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      } catch (error) {
        console.error('Error al limpiar localStorage:', error);
      }

      const { logoutAction } = await import('@/app/actions/auth');
      const result = await logoutAction();

      if (result.success) {
        router.push('/auth/login');
      } else {
        console.error('Error al cerrar sesión');
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const displayName = currentUser?.nombre || userName;
  const displayRole = currentUser?.rol || getRoleLabel(role);

  return (
    <motion.aside
      initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: "easeInOut" }}
      className={`bg-background flex flex-col h-[calc(100vh-2rem)] rounded-3xl shadow-[0px_4px_10px_0px_rgba(0,0,0,0.30)] m-4 relative group transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-56'}`}
    >
      {/* Botón de toggle (visible al hacer hover o siempre visible) */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-white rounded-full p-1.5 shadow-md border border-gray-100 text-gray-500 hover:text-primary transition-colors z-50 opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div className={`p-6 flex justify-center items-center overflow-hidden transition-all duration-300 ${isCollapsed ? 'px-2' : ''}`}>
        <AnimatePresence mode="wait">
          {isCollapsed ? (
            <motion.div
              key="small-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Versión ícono/pequeña del logo con hover y link */}
              <Link href="/dashboard">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center font-bold text-xl cursor-pointer transition-colors duration-200 text-primary hover:bg-red-100 hover:text-red-600">
                  D
                </div>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="full-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Link href="/dashboard">
                <Image src="/image.png" alt="DER Logo" width={240} height={87} className="object-contain cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Menú de Navegación */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden mt-[-8] p-4">
        <ul className="space-y-1">
          {menu.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <motion.li
                key={item.href}
                initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: prefersReducedMotion ? 0 : 0.1 + index * 0.05, ease: "easeOut" }}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 whitespace-nowrap
                      ${isActive ? 'bg-primary text-white font-semibold rounded-3xl'
                      : 'text-foreground hover:bg-gray-100 rounded-lg hover:rounded-3xl'}
                      ${isCollapsed ? 'justify-center px-2' : ''}
                  `}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-foreground'}`} />
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      {/* Footer del Sidebar */}
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: prefersReducedMotion ? 0 : 0.4, ease: "easeOut" }}
        className={`px-4 pb-8 ${isCollapsed ? 'px-2 flex justify-center' : ''}`}
      >
        <ProfileDropdown
          userName={displayName}
          userRole={displayRole}
          onProfileClick={() => router.push('/dashboard/profile')}
          onPasswordClick={() => router.push('/dashboard/profile/change-password')}
          onNotificationsClick={() => router.push('/dashboard/profile/notifications')}
          onHelpClick={() => router.push('/dashboard/profile/help')}
          onLogoutClick={handleLogout}
        >
          <div className={`flex items-center gap-3 mb-5 cursor-pointer hover:opacity-80 transition-opacity ${isCollapsed ? 'justify-center mb-2' : ''}`}>
            {fotoPerfil ? (
              <img
                src={fotoPerfil}
                alt="Foto de perfil"
                className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-gray-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0 flex items-center justify-center">
                <span className="text-gray-500 text-sm font-medium">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <p className="text-base font-medium text-foreground truncate">{displayName}</p>
                <p className="text-xs text-gray-600 truncate">{displayRole}</p>
              </motion.div>
            )}
          </div>
        </ProfileDropdown>
      </motion.div>
    </motion.aside>
  );
});

export default Sidebar;
