'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { FileText, Calendar, Users } from 'lucide-react';
import AuditEntityCard from './AuditEntityCard';
import { getAuditCountsAction } from '@/app/actions/audit';
import type { AuditCounts } from '@/types/audit';
import Spinner from '@/components/ui/feedback/Spinner';
import Search from '@/components/CaseTools/search';

interface AuditOperation {
  label: string;
  count: number;
  href: string;
}

interface AuditEntity {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  operations: AuditOperation[];
  totalCount: number;
  href: string; // URL de la página de detalle de la entidad
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

  // Agrupar cards por entidad con sus operaciones
  const entities: AuditEntity[] = useMemo(() => {
    if (!counts) {
      return [];
    }
    return [
      {
        title: "Soportes",
        description: "Documentos y archivos del sistema",
        icon: FileText,
        totalCount: counts.soportes,
        href: "/dashboard/audit/soportes",
        operations: [
          {
            label: "Eliminados",
            count: counts.soportes,
            href: "/dashboard/audit/soportes"
          }
        ]
      },
      {
        title: "Citas",
        description: "Registro de citas del sistema",
        icon: Calendar,
        totalCount: counts.citasEliminadas + counts.citasActualizadas,
        href: "/dashboard/audit/citas",
        operations: [
          {
            label: "Eliminadas",
            count: counts.citasEliminadas,
            href: "/dashboard/audit/citas-eliminadas"
          },
          {
            label: "Actualizadas",
            count: counts.citasActualizadas,
            href: "/dashboard/audit/citas-actualizadas"
          }
        ]
      },
      {
        title: "Usuarios",
        description: "Registro de usuarios del sistema",
        icon: Users,
        totalCount: counts.usuariosEliminados + counts.usuariosActualizadosCampos,
        href: "/dashboard/audit/usuarios",
        operations: [
          {
            label: "Eliminados",
            count: counts.usuariosEliminados,
            href: "/dashboard/audit/usuarios-eliminados"
          },
          {
            label: "Actualizados",
            count: counts.usuariosActualizadosCampos,
            href: "/dashboard/audit/usuarios-actualizados-campos"
          }
        ]
      }
    ];
  }, [counts]);

  // Filtrar entidades basándose en la búsqueda
  const filteredEntities = useMemo(() => {
    if (!searchQuery.trim()) {
      return entities;
    }
    const query = searchQuery.toLowerCase().trim();
    return entities.filter(entity => 
      entity.title.toLowerCase().includes(query) ||
      entity.description.toLowerCase().includes(query) ||
      entity.operations.some(op => op.label.toLowerCase().includes(query))
    );
  }, [searchQuery, entities]);

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
          placeholder="Buscar por entidad..."
        />
      </motion.div>

      {/* Cards de entidades filtradas */}
      {filteredEntities.length === 0 ? (
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
          {filteredEntities.map((entity) => (
            <AuditEntityCard
              key={entity.title}
              title={entity.title}
              description={entity.description}
              totalCount={entity.totalCount}
              icon={entity.icon}
              operations={entity.operations}
              href={entity.href}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
