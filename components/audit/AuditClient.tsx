'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileX, CalendarX, CalendarCheck, UserX, UserCheck } from 'lucide-react';
import AuditTypeCard from './AuditTypeCard';
import { getAuditCountsAction } from '@/app/actions/audit';
import type { AuditCounts } from '@/types/audit';
import Spinner from '@/components/ui/feedback/Spinner';

export default function AuditClient() {
  const [counts, setCounts] = useState<AuditCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCounts() {
      try {
        setLoading(true);
        const data = await getAuditCountsAction();
        setCounts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar contadores');
        console.error('Error loading audit counts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCounts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!counts) {
    return null;
  }

  return (
    <div className="w-full">
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AuditTypeCard
          title="Soportes Eliminados"
          description="Documentos y archivos que han sido eliminados del sistema"
          count={counts.soportes}
          icon={FileX}
          href="/dashboard/audit/soportes"
        />
        <AuditTypeCard
          title="Citas Eliminadas"
          description="Citas que han sido eliminadas del sistema"
          count={counts.citasEliminadas}
          icon={CalendarX}
          href="/dashboard/audit/citas-eliminadas"
        />
        <AuditTypeCard
          title="Citas Actualizadas"
          description="Registro de cambios realizados en las citas"
          count={counts.citasActualizadas}
          icon={CalendarCheck}
          href="/dashboard/audit/citas-actualizadas"
        />
        <AuditTypeCard
          title="Usuarios Eliminados"
          description="Usuarios que han sido eliminados del sistema"
          count={counts.usuariosEliminados}
          icon={UserX}
          href="/dashboard/audit/usuarios-eliminados"
        />
        <AuditTypeCard
          title="Cambios de Tipo de Usuario"
          description="Registro de cambios en los tipos de usuario"
          count={counts.usuariosActualizados}
          icon={UserCheck}
          href="/dashboard/audit/usuarios-actualizados"
        />
      </motion.div>
    </div>
  );
}
