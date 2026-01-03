'use client';

import { Bell } from 'lucide-react';
import DropdownMenu from '../navigation/DropdownMenu';
import { AnimatePresence, motion } from 'motion/react';
import { useNotifications } from './useNotifications';

interface NotificationProps {
  count?: number;
  onClick?: () => void;
}

// NotificationItem viene de useNotifications

const Notification: React.FC<NotificationProps> = () => {
  const { notifications, loading, error } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  const triggerButton = (
    <button 
      className="relative flex items-center justify-center p-2 cursor-pointer hover:bg-neutral-100 rounded-lg transition-colors" 
      aria-label="Notificaciones"
    >
      <Bell className="w-6 h-6 text-foreground"/>
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
      menuClassName="w-[90vw] max-w-lg sm:w-[32rem] md:w-[36rem] lg:w-[40rem] left-1/2 -translate-x-[60%]"
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-white border border-gray-200 rounded-xl shadow-xl flex flex-col max-h-[80vh]"
        >
          <div className="p-4 border-b border-gray-200 shrink-0">
            <h3 className="text-lg font-semibold text-neutral-800">Notificaciones</h3>
          </div>
          <div className="overflow-y-auto flex-1 min-h-0">
            {loading ? (
              <div className="px-4 py-8 text-base text-gray-500 text-center">Cargando notificaciones...</div>
            ) : error ? (
              <div className="px-4 py-8 text-base text-red-500 text-center">{error}</div>
            ) : notifications.length > 0 ? (
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
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-md font-medium text-neutral-800">{notification.title}</p>
                      <p className="text-base text-neutral-600 mt-1 line-clamp-2">{notification.message}</p>
                      <p className="text-base text-neutral-500 mt-1">{notification.time}</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-base text-gray-500 text-center">
                No hay notificaciones
              </div>
            )}
          </div>
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 shrink-0">
              <button className="w-full text-base text-primary hover:text-primary/80 font-medium">
                Ver todas las notificaciones
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </DropdownMenu>
  );
};

export default Notification;