'use client';

import { motion } from 'motion/react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Bell } from 'lucide-react';

export default function NotificationsClient() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        Notificaciones
      </motion.h1>

      <motion.div
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Bell className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Sistema de Notificaciones
          </h3>
          <p className="text-gray-600 max-w-md">
            El sistema de notificaciones estará disponible próximamente. 
            Aquí podrás ver y gestionar todas tus notificaciones.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
