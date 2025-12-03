'use client';

import { BellIcon } from '@heroicons/react/24/outline';
import DropdownMenu from './DropdownMenu';
import { AnimatePresence, motion } from 'motion/react';

interface NotificationProps {
  count?: number;
  onClick?: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read?: boolean;
}

export default function Notification({ count = 0, onClick }: NotificationProps) {
  // Datos de ejemplo de notificaciones
  const notifications: NotificationItem[] = [
    {
      id: '1',
      title: 'Nuevo caso asignado',
      message: 'Se te ha asignado un nuevo caso de materia familiar',
      time: 'Hace 5 minutos',
      read: false
    },
    {
      id: '2',
      title: 'Recordatorio de cita',
      message: 'Tienes una cita programada para mañana a las 10:00 AM',
      time: 'Hace 1 hora',
      read: false
    },
    {
      id: '3',
      title: 'Actualización de caso',
      message: 'El caso #12345 ha sido actualizado',
      time: 'Hace 2 horas',
      read: true
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const triggerButton = (isOpen: boolean) => (
    <button 
      className="relative flex items-center justify-center p-2 cursor-pointer hover:bg-neutral-100 rounded-lg transition-colors" 
      aria-label="Notificaciones"
    >
      <BellIcon className="w-6 h-6 text-foreground"/>
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-primary rounded-full">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );

  return (
    <DropdownMenu
      trigger={triggerButton}
      align="right"
      menuClassName="w-80"
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-white border border-gray-200 rounded-xl shadow-xl max-h-96 overflow-auto"
        >
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-neutral-800">Notificaciones</h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  className={`
                    w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0
                    ${!notification.read ? 'bg-primary-light/10' : ''}
                  `}
                >
                  <div className="flex items-start gap-3">
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-800">{notification.title}</p>
                      <p className="text-xs text-neutral-600 mt-1 line-clamp-2">{notification.message}</p>
                      <p className="text-xs text-neutral-500 mt-1">{notification.time}</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-sm text-gray-500 text-center">
                No hay notificaciones
              </div>
            )}
          </div>
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200">
              <button className="w-full text-sm text-primary hover:text-primary/80 font-medium">
                Ver todas las notificaciones
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </DropdownMenu>
  );
}