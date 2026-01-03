import { useCallback, useEffect, useState } from 'react';
import {
  deleteNotificacionAction,
  getNotificacionesAction,
  GetNotificacionesResult,
  markNotificacionLeidaAction,
} from '@/app/actions/notificaciones';

// Debe coincidir con la interfaz Notificacion del backend
type Notificacion = {
  id_notificacion: number;
  cedula_receptor: string;
  cedula_emisor: string;
  titulo: string;
  mensaje: string;
  // En DB/migración actual la columna se llama `fecha`
  fecha?: string | Date;
  // Mantener compatibilidad si luego renombramos a `fecha_creacion`
  fecha_creacion?: string | Date;
  leida: boolean;
}

// Shape para la UI
export type NotificationUI = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res: GetNotificacionesResult = await getNotificacionesAction();
      if (res.success && Array.isArray(res.data)) {
        setNotifications(
          res.data.map((n: Notificacion) => ({
            id: String(n.id_notificacion),
            title: n.titulo,
            message: n.mensaje,
            time: (() => {
              const rawDate = n.fecha_creacion ?? n.fecha;
              if (!rawDate) return '';
              const date = rawDate instanceof Date ? rawDate : new Date(rawDate);
              if (Number.isNaN(date.getTime())) return '';
              return date.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
            })(),
            read: n.leida,
          }))
        );
      } else {
        setError(
          typeof res.error === 'string'
            ? res.error
            : res.error?.message || 'Error al obtener notificaciones'
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener notificaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(
    async (id: string) => {
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));

      const numericId = Number(id);
      if (!Number.isFinite(numericId)) return;

      const res = await markNotificacionLeidaAction(numericId);
      if (!res.success) {
        await fetchNotifications();
      }
    },
    [fetchNotifications]
  );

  const remove = useCallback(
    async (id: string) => {
      setNotifications(prev => prev.filter(n => n.id !== id));

      const numericId = Number(id);
      if (!Number.isFinite(numericId)) return;

      const res = await deleteNotificacionAction(numericId);
      if (!res.success) {
        await fetchNotifications();
      }
    },
    [fetchNotifications]
  );

  return { notifications, loading, error, refetch: fetchNotifications, markAsRead, remove };
}
