'use client';

import { motion } from 'motion/react';
import Sidebar from '../sidebar/Sidebar';
import type { UserRole } from '../sidebar/menu-config';
import Notification from '../ui/feedback/Notification';
import DateTime from '../ui/calendar/DateTime';
import { mapSystemRoleToSidebarRole } from '@/lib/utils/role-mapper';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';

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
      <div className="shrink-0 hidden lg:block">
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

      <div className="flex-1 flex flex-col w-full min-w-0 overflow-x-hidden">
        {/* Header móvil (reserva espacio arriba para no tapar títulos) */}
        <div className="lg:hidden sticky top-0 z-30 bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="px-4 pt-[calc(env(safe-area-inset-top)+12px)] pb-1">
            <div className="h-14 flex items-center justify-between gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl bg-[var(--card-bg)] p-2 shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] shrink-0 transition-transform active:scale-95 cursor-pointer border border-[var(--card-border)]"
                aria-label={isMobileSidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-controls="mobile-sidebar"
                aria-expanded={isMobileSidebarOpen}
                onClick={() => setIsMobileSidebarOpen((v: boolean) => !v)}
              >
                {isMobileSidebarOpen ? <X className="w-8 h-8 text-[var(--foreground)] opacity-70" /> : <Menu className="w-8 h-8 text-[var(--foreground)] opacity-70" />}
              </button>

              <div className="min-w-0">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="flex items-center gap-3 text-base bg-[var(--card-bg)] rounded-3xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] px-3 py-2 max-w-[calc(100vw-5rem)] overflow-hidden border border-[var(--card-border)]"
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
          className="hidden lg:flex absolute top-6 right-6 items-center gap-4 z-30 text-lg bg-[var(--card-bg)] rounded-3xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] px-4 py-2 border border-[var(--card-border)] transition-colors"
        >
          <Notification />
          <DateTime />
        </motion.div>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}

