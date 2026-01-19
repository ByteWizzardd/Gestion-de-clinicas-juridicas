'use client';

import { motion } from 'motion/react';
import Sidebar from '../sidebar/Sidebar';
import type { UserRole } from '../sidebar/menu-config';
import Notification from '../ui/feedback/Notification';
import DateTime from '../ui/calendar/DateTime';
import { mapSystemRoleToSidebarRole } from '@/lib/utils/role-mapper';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface DashboardLayoutClientProps {
  user: {
    cedula: string;
    nombres: string;
    apellidos: string;
    correo: string;
    rol: string;
  };
  children: React.ReactNode;
}

export default function DashboardLayoutClient({ user, children }: DashboardLayoutClientProps) {
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
      <div className="shrink-0 hidden md:block">
        <Sidebar role={userRole} userName={userName} />
      </div>

      {/* Sidebar móvil (off-canvas) */}
      <div className="md:hidden">
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
          <Sidebar role={userRole} userName={userName} onNavigate={() => setIsMobileSidebarOpen(false)} />
        </div>
      </div>

      {/* Botón hamburguesa (móvil) */}
      <button
        type="button"
        className="md:hidden fixed top-6 left-6 z-60 inline-flex items-center justify-center rounded-xl bg-white p-1.5 border border-gray-200 shadow-sm"
        aria-label={isMobileSidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-controls="mobile-sidebar"
        aria-expanded={isMobileSidebarOpen}
        onClick={() => setIsMobileSidebarOpen((v: boolean) => !v)}
        style={{ width: 28, height: 28 }}
      >
        {isMobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      <div className="flex-1 flex flex-col w-full min-w-0 overflow-x-hidden">
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.4, delay: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
          className="absolute top-6 right-6 flex items-center gap-4 z-30 text-lg bg-white rounded-3xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] px-4 py-2"
        >
          <Notification />
          <DateTime />
        </motion.div>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}

