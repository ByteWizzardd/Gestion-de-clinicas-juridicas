'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import Sidebar from '../sidebar/Sidebar';
import type { UserRole } from '../sidebar/menu-config';
import Notification from '../ui/feedback/Notification';
import DateTime from '../ui/calendar/DateTime';
import { mapSystemRoleToSidebarRole } from '@/lib/utils/role-mapper';
import { useState, useEffect } from 'react';

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
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <div className="flex h-screen bg-background relative overflow-x-hidden">
      <div className="flex-shrink-0">
        <Sidebar role={userRole} userName={userName} />
      </div>

      <div className="flex-1 flex flex-col w-full min-w-0 overflow-x-hidden">
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.4, delay: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
          className="absolute top-6 right-6 flex items-center gap-4 z-30 text-lg bg-white rounded-3xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] px-4 py-2"
        >
          <Notification count={3} />
          <DateTime />
        </motion.div>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}

