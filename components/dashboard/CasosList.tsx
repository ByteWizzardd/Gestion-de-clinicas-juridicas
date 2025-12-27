'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { Briefcase, Calendar, User, FileText } from 'lucide-react';

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
  rol_usuario: string;
}

interface CasosListProps {
  casos: Caso[];
  loading?: boolean;
  error?: string | null;
}

export default function CasosList({ casos, loading, error }: CasosListProps) {
  // Debug: ver qué datos estamos recibiendo
  console.log('CasosList - casos recibidos:', casos);
  console.log('CasosList - loading:', loading);
  console.log('CasosList - error:', error);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando casos...</div>
      </div>
    );
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
      <div className="w-full flex flex-col items-center justify-center text-gray-500">
        <Briefcase className="w-16 h-16 mb-4 opacity-40" />
        <p className="text-lg font-medium text-gray-600">No tienes casos asignados</p>
        <p className="text-sm mt-2 text-gray-500">Los casos donde participas aparecerán aquí</p>
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
    <div className="space-y-3">
      {casos.map((caso, index) => {
        // Validar que el caso tenga los datos necesarios
        if (!caso || !caso.id_caso) {
          console.warn('Caso inválido en índice', index, caso);
          return null;
        }

        return (
          <motion.div
            key={caso.id_caso}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <Link
              href={`/dashboard/cases/${caso.id_caso}`}
              className="block bg-white rounded-xl p-4 hover:shadow-md transition-shadow border border-gray-200 hover:border-primary/30"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-foreground">
                      Caso #{caso.id_caso}
                    </span>
                    {caso.rol_usuario && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRolColor(caso.rol_usuario)}`}>
                        {caso.rol_usuario}
                      </span>
                    )}
                  </div>
                  <h4 className="font-medium text-foreground mb-1">
                    {caso.tramite || 'Sin trámite'}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {caso.nombre_materia || 'Sin materia'} - {caso.nombre_categoria || 'Sin categoría'}
                  </p>
                </div>
                {caso.estatus && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstatusColor(caso.estatus)}`}>
                    {caso.estatus}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {caso.nombre_completo_solicitante && (
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{caso.nombre_completo_solicitante}</span>
                  </div>
                )}
                {caso.nombre_nucleo && (
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
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

