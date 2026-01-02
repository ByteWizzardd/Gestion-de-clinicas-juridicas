import { useCallback, useEffect, useState } from 'react';
import { getNotificacionesAction, GetNotificacionesResult } from '@/app/actions/notificaciones';

// Debe coincidir con la interfaz Notificacion del backend
type Notificacion = {
  id_notificacion: number;
  cedula_receptor: string;
  cedula_emisor: string;
  titulo: string;
  mensaje: string;
  fecha_creacion: string | Date;
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
            time: typeof n.fecha_creacion === 'string' ? new Date(n.fecha_creacion).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }) : n.fecha_creacion.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }),
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
    } catch  {
      setError('Error al obtener notificaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return { notifications, loading, error, refetch: fetchNotifications };
}
