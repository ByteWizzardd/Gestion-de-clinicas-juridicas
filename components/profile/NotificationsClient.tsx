'use client';

import { motion } from 'motion/react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Bell } from 'lucide-react';

export default function NotificationsClient() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1, ease: "easeOut" }}
      >
        <Breadcrumbs
          items={[
            { label: 'Perfil', href: '/dashboard/profile' },
            { label: 'Notificaciones' },
          ]}
        />
      </motion.div>

      <motion.h1
        className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-6 sm:mb-8 mt-4"
        style={{ fontFamily: 'var(--font-league-spartan)' }}
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1, ease: "easeOut" }}
      >
        Notificaciones
      </motion.h1>

      <motion.div
        className="bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--card-border)] p-6 sm:p-8 transition-colors"
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1, ease: "easeOut" }}
      >
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Bell className="w-16 h-16 text-[var(--card-text-muted)] mb-4 transition-colors" />
          <h3 className="text-xl font-semibold text-[var(--card-text)] mb-2 transition-colors">
            Sistema de Notificaciones
          </h3>
          <p className="text-[var(--card-text-muted)] max-w-md transition-colors">
            El sistema de notificaciones estará disponible próximamente.
            Aquí podrás ver y gestionar todas tus notificaciones.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
