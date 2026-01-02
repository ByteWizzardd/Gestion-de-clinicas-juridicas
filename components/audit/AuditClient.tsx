'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { FileX, CalendarX, CalendarCheck, UserX, UserCheck } from 'lucide-react';
import AuditTypeCard from './AuditTypeCard';
import { getAuditCountsAction } from '@/app/actions/audit';
import type { AuditCounts } from '@/types/audit';
import Spinner from '@/components/ui/feedback/Spinner';
import Search from '@/components/CaseTools/search';

interface AuditCard {
  title: string;
  description: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

export default function AuditClient() {
  const [counts, setCounts] = useState<AuditCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Definir todas las cards de auditoría (antes de los returns condicionales)
  const allCards: AuditCard[] = useMemo(() => {
    if (!counts) {
      return [];
    }
    return [
      {
        title: "Soportes Eliminados",
        description: "Documentos y archivos que han sido eliminados del sistema",
        count: counts.soportes,
        icon: FileX,
        href: "/dashboard/audit/soportes"
      },
      {
        title: "Citas Eliminadas",
        description: "Citas que han sido eliminadas del sistema",
        count: counts.citasEliminadas,
        icon: CalendarX,
        href: "/dashboard/audit/citas-eliminadas"
      },
      {
        title: "Citas Actualizadas",
        description: "Registro de cambios realizados en las citas",
        count: counts.citasActualizadas,
        icon: CalendarCheck,
        href: "/dashboard/audit/citas-actualizadas"
      },
      {
        title: "Usuarios Eliminados",
        description: "Usuarios que han sido eliminados del sistema",
        count: counts.usuariosEliminados,
        icon: UserX,
        href: "/dashboard/audit/usuarios-eliminados"
      },
      {
        title: "Usuarios Actualizados",
        description: "Registro completo de todos los cambios en usuarios",
        count: counts.usuariosActualizadosCampos,
        icon: UserCheck,
        href: "/dashboard/audit/usuarios-actualizados-campos"
      }
    ];
  }, [counts]);

  // Filtrar cards basándose en la búsqueda
  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) {
      return allCards;
    }
    const query = searchQuery.toLowerCase().trim();
    return allCards.filter(card => 
      card.title.toLowerCase().includes(query) ||
      card.description.toLowerCase().includes(query)
    );
  }, [searchQuery, allCards]);

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
      {/* Barra de búsqueda */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Search
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por tipo de auditoría..."
        />
      </motion.div>

      {/* Cards filtradas */}
      {filteredCards.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500 text-lg">No se encontraron resultados para "{searchQuery}"</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {filteredCards.map((card) => (
            <AuditTypeCard
              key={card.href}
              title={card.title}
              description={card.description}
              count={card.count}
              icon={card.icon}
              href={card.href}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
