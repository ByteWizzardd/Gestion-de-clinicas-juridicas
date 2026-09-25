'use client';

import { motion } from 'motion/react';
import Sidebar from '../sidebar/Sidebar';
import type { UserRole } from '../sidebar/menu-config';
import Notification from '../ui/feedback/Notification';
import DateTime from '../ui/calendar/DateTime';
import { mapSystemRoleToSidebarRole } from '@/lib/utils/role-mapper';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, ArrowLeft } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter, usePathname } from 'next/navigation';

interface DashboardLayoutClientProps {
  user: {
    cedula: string;
    nombres: string;
    apellidos: string;
    correo: string;
    rol: string;
    fotoPerfil?: string | null;
  };
  children: React.ReactNode;
  initialSidebarCollapsed?: boolean;
  initialTheme?: 'light' | 'dark';
}

export default function DashboardLayoutClient({ user, children, initialSidebarCollapsed = false, initialTheme }: DashboardLayoutClientProps) {
  const { setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  // Historial propio (no el del navegador) de rutas visitadas dentro del
  // dashboard: router.back() podía aterrizar en /auth/login (la pantalla
  // previa a entrar), lo cual no tiene sentido para un usuario con sesión.
  const dashboardHistory = useRef<string[]>([]);
  useEffect(() => {
    const stack = dashboardHistory.current;
    if (stack[stack.length - 1] !== pathname) {
      stack.push(pathname);
    }
  }, [pathname]);

  const handleBack = () => {
    const stack = dashboardHistory.current;
    if (stack.length > 1) {
      stack.pop();
      router.push(stack[stack.length - 1]);
    } else {
      router.push('/dashboard');
    }
  };

  // Aplicar tema inicial desde el servidor solo al montar para evitar sobreescrituras en caliente
  useEffect(() => {
    if (initialTheme) {
      setTheme(initialTheme);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo al montar

  const userRole: UserRole = mapSystemRoleToSidebarRole(user.rol);
  const userName = `${user.nombres} ${user.apellidos}`.trim() || 'Usuario';
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!isMobileSidebarOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileSidebarOpen]);

  return (
    <div className="flex h-screen bg-background relative overflow-x-hidden">
      {/* Sidebar escritorio */}
      <div className="shrink-0 hidden lg:block z-40">
        <Sidebar role={userRole} userName={userName} initialCollapsed={initialSidebarCollapsed} userCedula={user.cedula} />
      </div>

      {/* Sidebar móvil (off-canvas) */}
      <div className="lg:hidden">
        {isMobileSidebarOpen && (
          <button
            type="button"
            aria-label="Cerrar menú"
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        <div
          id="mobile-sidebar"
          className={
            `fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-out ` +
            (isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full')
          }
          aria-hidden={!isMobileSidebarOpen}
        >
          <Sidebar role={userRole} userName={userName} initialCollapsed={false} userCedula={user.cedula} onNavigate={() => setIsMobileSidebarOpen(false)} />
        </div>
      </div>

      <div className="flex-1 flex flex-col w-full min-w-0 overflow-x-hidden relative">
        {/* Header móvil (reserva espacio arriba para no tapar títulos) */}
        <div className="lg:hidden sticky top-0 z-30 bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="px-4 pt-[calc(env(safe-area-inset-top)+12px)] pb-1">
            <div className="h-14 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full bg-(--glass-bg) backdrop-blur-md p-2 shadow-[0px_0px_4px_0px_rgba(0,0,0,0.20)] shrink-0 transition-transform active:scale-95 cursor-pointer border border-(--glass-border)"
                  aria-label="Volver atrás"
                  onClick={handleBack}
                >
                  <ArrowLeft className="w-8 h-8 text-foreground opacity-70" />
                </button>

                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-xl bg-(--card-bg) p-2 shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] shrink-0 transition-transform active:scale-95 cursor-pointer border border-(--card-border)"
                  aria-label={isMobileSidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
                  aria-controls="mobile-sidebar"
                  aria-expanded={isMobileSidebarOpen}
                  onClick={() => setIsMobileSidebarOpen((v: boolean) => !v)}
                >
                  {isMobileSidebarOpen ? <X className="w-8 h-8 text-foreground opacity-70" /> : <Menu className="w-8 h-8 text-foreground opacity-70" />}
                </button>
              </div>

              <div className="min-w-0">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="flex items-center gap-3 text-base bg-(--glass-bg) backdrop-blur-md rounded-3xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.20)] px-3 py-2 max-w-[calc(100vw-5rem)] overflow-hidden border border-(--glass-border)"
                >
                  <Notification />
                  <DateTime />
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="hidden lg:flex absolute top-6 right-6 items-center gap-4 z-30 text-lg bg-(--glass-bg) backdrop-blur-md rounded-3xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.20)] px-4 py-2 border border-(--glass-border) transition-colors"
        >
          <Notification />
          <DateTime />
        </motion.div>

        {/* Flota sobre el contenido (como Notification/DateTime); el padding extra de <main>
            reserva su espacio para que no tape nada apenas se carga la página. Al hacer scroll
            sí puede quedar sobre el contenido, que es la idea de un botón flotante. */}
        <motion.button
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          aria-label="Volver atrás"
          onClick={handleBack}
          className="hidden lg:inline-flex absolute top-6 left-6 items-center gap-2 z-30 rounded-3xl bg-(--glass-bg) backdrop-blur-md px-4 py-2.5 shadow-[0px_0px_4px_0px_rgba(0,0,0,0.20)] border border-(--glass-border) transition-colors transition-transform active:scale-95 cursor-pointer hover:bg-(--card-bg)"
        >
          <ArrowLeft className="w-5 h-5 text-foreground opacity-70" />
          <span className="text-sm font-medium text-foreground opacity-70">Volver</span>
        </motion.button>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:pt-24 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}

