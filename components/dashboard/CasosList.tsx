'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { Briefcase, Calendar, User, MapPin } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import CasosListSkeleton from '@/components/ui/skeletons/CasosListSkeleton';

interface Caso {
  id_caso: number;
  fecha_inicio_caso: string;
  fecha_fin_caso: string | null;
  tramite: string;
  estatus: string;
  nombre_completo_solicitante: string;
  nombre_nucleo: string;
  nombre_materia: string;
  nombre_categoria: string;
  nombre_subcategoria: string;
  rol_usuario: string;
}

interface CasosListProps {
  casos: Caso[];
  loading?: boolean;
  error?: string | null;
}

export default function CasosList({ casos, loading, error }: CasosListProps) {


  if (loading) {
    return <CasosListSkeleton count={4} />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!casos || casos.length === 0) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center">
        <EmptyState
          icon={Briefcase}
          title="Aún no tienes casos asignados"
          description="Cuando seas asignado a un caso o participes en alguno, aparecerá aquí"
          action={{
            label: "Ver todos los casos",
            href: "/dashboard/cases"
          }}
        />
      </div>
    );
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      return date.toLocaleDateString('es-VE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const getEstatusColor = (estatus: string) => {
    switch (estatus) {
      case 'En proceso':
        return 'bg-blue-100 text-blue-700';
      case 'Archivado':
        return 'bg-gray-100 text-gray-700';
      case 'Entregado':
        return 'bg-green-100 text-green-700';
      case 'Asesoría':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRolColor = (rol: string) => {
    switch (rol) {
      case 'Supervisor':
        return 'bg-primary/10 text-primary';
      case 'Asignado':
        return 'bg-blue-50 text-blue-700';
      case 'Ejecutor':
        return 'bg-orange-50 text-orange-700';
      case 'Atiende':
        return 'bg-green-50 text-green-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="space-y-3 w-full">
      {casos.map((caso, index) => {
        // Validar que el caso tenga los datos necesarios
        if (!caso || !caso.id_caso) {
          console.warn('Caso inválido en índice', index, caso);
          return null;
        }

        return (
          <motion.div
            key={caso.id_caso}
            className="w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <Link
              href={`/dashboard/cases/${caso.id_caso}`}
              className="block bg-[var(--card-bg)] rounded-xl p-4 hover:shadow-md transition-shadow border border-[var(--card-border)] hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-[var(--card-text)]">
                      Caso #{caso.id_caso}
                    </span>
                    {caso.rol_usuario && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRolColor(caso.rol_usuario)}`}>
                        {caso.rol_usuario}
                      </span>
                    )}
                  </div>
                  <h4 className="font-medium text-[var(--card-text)] mb-1">
                    {caso.tramite || 'Sin trámite'}
                  </h4>
                  <p className="text-sm text-[var(--card-text-muted)] mb-2">
                    {(() => {
                      const materia = caso.nombre_materia || 'Sin materia';
                      const categoria = caso.nombre_categoria?.trim() || '';
                      const subcategoria = caso.nombre_subcategoria?.trim() || '';

                      const hasCategoria = categoria && categoria.toLowerCase() !== 'sin categoría' && categoria.toLowerCase() !== 'n/a';
                      const hasSubcategoria = subcategoria && subcategoria.toLowerCase() !== 'sin subcategoría' && subcategoria.toLowerCase() !== 'n/a';

                      let text = materia;
                      if (hasCategoria && hasSubcategoria) {
                        text += ` - ${categoria} ${subcategoria}`;
                      } else if (hasCategoria) {
                        text += ` - ${categoria}`;
                      } else if (hasSubcategoria) {
                        text += ` - ${subcategoria}`;
                      }
                      return text;
                    })()}
                  </p>
                </div>
                {caso.estatus && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstatusColor(caso.estatus)}`}>
                    {caso.estatus}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-[var(--card-text-muted)]">
                {caso.nombre_completo_solicitante && (
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{caso.nombre_completo_solicitante}</span>
                  </div>
                )}
                {caso.nombre_nucleo && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{caso.nombre_nucleo}</span>
                  </div>
                )}
                {caso.fecha_inicio_caso && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Inicio: {formatDate(caso.fecha_inicio_caso)}</span>
                  </div>
                )}
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}