'use client';

import { useState, useEffect, memo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { getMenuByRole, type UserRole } from './menu-config';
import ProfileDropdown from '@/components/ui/navigation/ProfileDropdown';
import { getCurrentUserAction } from '@/app/actions/auth';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  userName?: string;
  onNavigate?: () => void;
  initialCollapsed?: boolean;
  userCedula?: string;
}

const Sidebar = memo(function Sidebar({ role, userName = 'Nombre Apellido', onNavigate, initialCollapsed = false, userCedula }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const menu = getMenuByRole(role);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ nombre: string; rol: string } | null>(null);

  // Estado para colapsar el sidebar con persistencia
  const [isCollapsedState, setIsCollapsed] = useState(initialCollapsed);
  const [isMounted, setIsMounted] = useState(false);

  // Forzamos a que el sidebar de móvil/tablet (cuando tiene onNavigate) NUNCA se colapse
  const isCollapsed = onNavigate ? false : isCollapsedState;

  // Sincronizar con prop inicial al montar
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Función para cambiar estado y guardar preferencia en cookie y localStorage
  const toggleSidebar = () => {
    const newState = !isCollapsedState;
    setIsCollapsed(newState);
    try {
      // Usar llave específica del usuario si la cédula está disponible
      const storageKey = userCedula ? `sidebar_collapsed_${userCedula}` : 'sidebar_collapsed';

      // Guardar en localStorage para compatibilidad
      localStorage.setItem(storageKey, JSON.stringify(newState));

      // Guardar en cookie para que el servidor lo sepa en la próxima carga
      document.cookie = `${storageKey}=${newState}; path=/; max-age=31536000`; // 1 año
    } catch (error) {
      console.error('Error al guardar preferencia del sidebar:', error);
    }
  };

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`bg-background flex flex-col h-[calc(100vh-2rem)] rounded-2xl md:rounded-3xl shadow-[0px_4px_10px_0px_rgba(0,0,0,0.30)] m-2 md:m-4 relative group transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16 md:w-20' : 'w-52 md:w-56'}`}
    >
      {/* Botón de toggle (visible al hacer hover o siempre visible) */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-2 lg:-right-3 top-6 lg:top-8 bg-[var(--dropdown-bg)] rounded-full p-1 lg:p-1.5 shadow-md border border-[var(--dropdown-border)] text-[var(--foreground)] opacity-60 hover:opacity-100 hover:text-primary transition-all duration-300 z-50 lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100 cursor-pointer hidden lg:flex items-center justify-center"
        aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
        )}
      </button>

      {/* Botón de cerrar para móvil/tablet */}
      {onNavigate && (
        <button
          onClick={onNavigate}
          className="absolute right-3 top-5 bg-[var(--sidebar-hover)] opacity-80 backdrop-blur-sm rounded-full p-1.5 text-[var(--foreground)] hover:text-primary transition-all duration-300 z-50 lg:hidden flex items-center justify-center cursor-pointer shadow-sm"
          aria-label="Cerrar menú"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className={`p-4 md:p-6 flex justify-center items-center overflow-hidden transition-all duration-300 ${isCollapsed ? 'px-2' : ''}`}>
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
              <Link href="/dashboard" onClick={onNavigate}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 group/logo p-2">
                  <Image
                    src="/logo-mini-v2.png"
                    alt="Logo DER"
                    width={48}
                    height={48}
                    className="object-contain transition-transform duration-300 group-hover/logo:scale-110"
                  />
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
              <Link href="/dashboard" onClick={onNavigate}>
                <Image src="/image.png" alt="DER Logo" width={240} height={87} className="object-contain cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 w-40 md:w-60 h-auto" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Menú de Navegación */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden mt-[-8] p-3 md:p-4">
        <ul className="space-y-1">
          {menu.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <motion.li
                key={item.href}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={`flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 transition-all duration-200 whitespace-nowrap
                      ${isActive ? 'bg-primary text-white font-semibold rounded-3xl'
                      : 'text-foreground hover:bg-[var(--sidebar-hover)] rounded-lg hover:rounded-3xl'}
                      ${isCollapsed ? 'justify-center px-2' : ''}
                  `}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={`w-4 h-4 md:w-5 md:h-5 shrink-0 ${isActive ? 'text-white' : 'text-foreground'}`} />
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="overflow-hidden text-sm md:text-base"
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`px-4 pb-8 ${isCollapsed ? 'px-2 flex justify-center' : ''}`}
      >
        <ProfileDropdown
          userName={displayName}
          userRole={displayRole}
          onProfileClick={() => {
            onNavigate?.();
            router.push('/dashboard/profile');
          }}
          onPasswordClick={() => {
            onNavigate?.();
            router.push('/dashboard/profile/change-password');
          }}
          onHelpClick={() => {
            onNavigate?.();
            router.push('/dashboard/profile/help');
          }}
          onLogoutClick={handleLogout}
        >
          <div className={`flex items-center gap-3 mb-5 cursor-pointer hover:opacity-80 transition-opacity ${isCollapsed ? 'justify-center mb-2' : ''}`}>
            {fotoPerfil ? (
              <Image
                src={fotoPerfil}
                alt="Foto de perfil"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-[var(--background)]"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[var(--sidebar-hover)] shrink-0 flex items-center justify-center transition-colors border-2 border-[var(--background)]">
                <span className="text-[var(--foreground)] opacity-60 text-sm font-medium">
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
