'use client';

import { useState } from 'react';

import { Bell } from 'lucide-react';
import DropdownMenu from '../navigation/DropdownMenu';
import { AnimatePresence, motion } from 'motion/react';
import { useNotifications } from '../../../lib/hook/useNotifications';
import { useRouter } from 'next/navigation';
import NotificationSkeleton from '@/components/ui/skeletons/NotificationSkeleton';

interface NotificationProps {
  count?: number;
  onClick?: () => void;
}

// NotificationItem viene de useNotifications

const Notification: React.FC<NotificationProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, loading, error, markAsRead, remove } = useNotifications();
  const router = useRouter();
  const unreadCount = notifications.filter(n => !n.read).length;

  // Extrae el ID de caso (número) o cita (string tipo cita-123) de un texto
  const extractCasoId = (text: string): number | null => {
    const match = text.match(/\bcaso\b\s*(?:#|:)?\s*(\d+)\b/i);
    if (!match) {
      return null;
    }
    const value = Number(match[1]);
    return Number.isFinite(value) ? value : null;
  };

  const extractCitaId = (text: string): string | null => {
    // Soporta formatos: "cita #cita-123", "cita: cita-123"
    const match = text.match(/\bcita\b\s*(?:#|:)?\s*(cita-\d+)\b/i);
    return match ? match[1] : null;
  };

  const getNotificationHref = (notification: { title: string; message: string }): string | null => {
    // Buscar link directo en el mensaje (citas de caso)
    const linkMatch = notification.message.match(/(\/dashboard\/cases\/\d+\?tab=citas)/);
    if (linkMatch) {
      return linkMatch[1];
    }

    // Notificación de Casos Inactivos (Automatización)
    if (notification.title.toLowerCase().includes('casos inactivos')) {
      return '/dashboard/cases?archiveInactive=true';
    }

    const citaId = extractCitaId(notification.title) || extractCitaId(notification.message);
    if (citaId) {
      return `/dashboard/appointments/${citaId}`;
    }
    const casoId = extractCasoId(notification.title) ?? extractCasoId(notification.message);
    if (casoId) {
      return `/dashboard/cases/${casoId}`;
    }
    return null;
  };

  const triggerButton = (
    <button
      className="relative flex items-center justify-center p-2 cursor-pointer hover:bg-[var(--dropdown-hover)] rounded-lg transition-colors"
      aria-label="Notificaciones"
    >
      <Bell className={`w-6 h-6 ${isOpen ? 'text-primary' : 'text-foreground'}`} />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-primary rounded-full">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      notifications.forEach((notification) => {
        if (!notification.read) {
          markAsRead(notification.id);
        }
      });
    }
  };

  return (
    <DropdownMenu
      trigger={triggerButton}
      align="right"
      menuClassName="w-[90vw] max-w-lg sm:w-[32rem] md:w-[36rem] lg:w-[40rem]"
      onOpenChange={handleOpenChange}
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1, ease: 'easeOut' }}
          className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-xl flex flex-col max-h-[80vh] transition-colors"
        >
          <div className="p-4 border-b border-[var(--dropdown-divider)] shrink-0 transition-colors">
            <h3 className="text-lg font-semibold text-[var(--foreground)] transition-colors">Notificaciones</h3>
          </div>
          <div className="overflow-y-auto flex-1 min-h-0">
            {loading ? (
              <NotificationSkeleton count={3} />
            ) : error ? (
              <div className="px-4 py-8 text-base text-red-500 text-center">{error}</div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`
                    w-full px-4 py-3 text-left hover:bg-[var(--dropdown-hover)] transition-colors border-b border-[var(--dropdown-divider)] last:border-b-0
                    ${!notification.read ? 'bg-[var(--primary-light)]' : ''}
                    ${getNotificationHref(notification) || !notification.read ? 'cursor-pointer' : 'cursor-default'}
                  `}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (!notification.read) {
                      markAsRead(notification.id);
                    }
                    const href = getNotificationHref(notification);
                    if (href) {
                      router.push(href);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (!notification.read) {
                        markAsRead(notification.id);
                      }
                      const href = getNotificationHref(notification);
                      if (href) {
                        router.push(href);
                      }
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-md font-medium text-[var(--foreground)] transition-colors">{notification.title}</p>
                      <p className="text-base text-[var(--card-text-muted)] transition-colors mt-1 line-clamp-2">{notification.message}</p>
                    </div>

                    <button
                      type="button"
                      className="text-sm text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 font-medium shrink-0 cursor-pointer transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        remove(notification.id);
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-base text-[var(--card-text-muted)] transition-colors text-center">
                No hay notificaciones
              </div>
            )}
          </div>

        </motion.div>
      </AnimatePresence>
    </DropdownMenu>
  );
};

export default Notification;