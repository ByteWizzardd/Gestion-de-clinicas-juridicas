'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import AuditEntityCardSkeleton from '@/components/ui/skeletons/AuditEntityCardSkeleton';
import Search from '@/components/CaseTools/search';

import AuditEntityCard from './AuditEntityCard';
import { getAuditCountsAction } from '@/app/actions/audit';
import type { AuditCounts } from '@/types/audit';
import { LucideIcon, FileText, Calendar, Users, User, MapPin, BookOpen, FolderTree, Building2, Home, Building, Briefcase, Activity, GraduationCap, Tag, Tags, Scale, Calendar as CalendarIcon, Clock, ArrowDown, ArrowUp, FileBarChart } from 'lucide-react';

interface AuditOperation {
  label: string;
  count: number;
  href: string;
}

interface AuditEntity {
  title: string;
  description: string;
  icon: LucideIcon;
  operations: AuditOperation[];
  totalCount: number;
  href: string; // URL de la página de detalle de la entidad
  lastActivity?: string | null;
}


export default function AuditClient() {
  const [counts, setCounts] = useState<AuditCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

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

    const list: AuditEntity[] = [
      {
        title: "Soportes",
        description: "Documentos y archivos del sistema",
        icon: FileText,
        totalCount: counts.soportes + (counts.soportesCreados || 0) + (counts.soportesDescargados || 0),
        href: "/dashboard/audit/soportes",
        lastActivity: counts.lastActivities?.soportes,
        operations: [
          {
            label: "Eliminados",
            count: counts.soportes,
            href: "/dashboard/audit/soportes"
          },
          {
            label: "Creados",
            count: counts.soportesCreados || 0,
            href: "/dashboard/audit/soportes?tab=soportes-creados"
          },
          {
            label: "Descargados",
            count: counts.soportesDescargados || 0,
            href: "/dashboard/audit/soportes?tab=soportes-descargados"
          }
        ]
      },
      {
        title: "Reportes",
        description: "Registro de reportes generados en el sistema",
        icon: FileBarChart,
        totalCount: counts.reportesGenerados || 0,
        href: "/dashboard/audit/reportes",
        lastActivity: counts.lastActivities?.reportes,
        operations: [
          {
            label: "Generados",
            count: counts.reportesGenerados || 0,
            href: "/dashboard/audit/reportes"
          }
        ]
      },
      {
        title: "Citas",
        description: "Registro de citas del sistema",
        icon: Calendar,
        totalCount: counts.citasEliminadas + counts.citasActualizadas + (counts.citasCreadas || 0),
        href: "/dashboard/audit/citas",
        lastActivity: counts.lastActivities?.citas,
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
        totalCount: counts.usuariosEliminados + counts.usuariosActualizadosCampos + (counts.usuariosCreados || 0) + (counts.estudiantesInscritos || 0) + (counts.profesoresAsignados || 0),
        href: "/dashboard/audit/usuarios",
        lastActivity: counts.lastActivities?.usuarios,
        operations: [
          {
            label: "Creados",
            count: (counts.usuariosCreados || 0) + (counts.estudiantesInscritos || 0) + (counts.profesoresAsignados || 0),
            href: "/dashboard/audit/usuarios?tab=usuarios-creados"
          },
          {
            label: "Actualizados",
            count: counts.usuariosActualizadosCampos,
            href: "/dashboard/audit/usuarios?tab=usuarios-actualizados-campos"
          },
          {
            label: "Eliminados",
            count: counts.usuariosEliminados,
            href: "/dashboard/audit/usuarios?tab=usuarios-eliminados"
          }
        ]
      },
      {
        title: "Casos",
        description: "Registro de casos del sistema",
        icon: Briefcase,
        totalCount: (counts.casosEliminados || 0) + (counts.casosActualizados || 0) + (counts.casosCreados || 0),
        href: "/dashboard/audit/casos",
        lastActivity: counts.lastActivities?.casos,
        operations: [
          {
            label: "Creados",
            count: counts.casosCreados || 0,
            href: "/dashboard/audit/casos?tab=casos-creados"
          },
          {
            label: "Actualizados",
            count: counts.casosActualizados || 0,
            href: "/dashboard/audit/casos?tab=casos-actualizados"
          },
          {
            label: "Eliminados",
            count: counts.casosEliminados || 0,
            href: "/dashboard/audit/casos?tab=casos-eliminados"
          }
        ]
      },
      {
        title: "Solicitantes",
        description: "Registro de solicitantes del sistema",
        icon: User,
        totalCount: (counts.solicitantesEliminados || 0) + (counts.solicitantesActualizados || 0) + (counts.solicitantesCreados || 0),
        href: "/dashboard/audit/solicitantes",
        lastActivity: counts.lastActivities?.solicitantes,
        operations: [
          {
            label: "Creados",
            count: counts.solicitantesCreados || 0,
            href: "/dashboard/audit/solicitantes?tab=solicitantes-creados"
          },
          {
            label: "Actualizados",
            count: counts.solicitantesActualizados || 0,
            href: "/dashboard/audit/solicitantes?tab=solicitantes-actualizados"
          },
          {
            label: "Eliminados",
            count: counts.solicitantesEliminados || 0,
            href: "/dashboard/audit/solicitantes?tab=solicitantes-eliminados"
          }
        ]
      },
      {
        title: "Beneficiarios",
        description: "Registro de beneficiarios de casos",
        icon: Users,
        totalCount: (counts.beneficiariosEliminados || 0) + (counts.beneficiariosActualizados || 0) + (counts.beneficiariosCreados || 0),
        href: "/dashboard/audit/beneficiarios",
        lastActivity: counts.lastActivities?.beneficiarios,
        operations: [
          {
            label: "Creados",
            count: counts.beneficiariosCreados || 0,
            href: "/dashboard/audit/beneficiarios?tab=beneficiarios-creados"
          },
          {
            label: "Actualizados",
            count: counts.beneficiariosActualizados || 0,
            href: "/dashboard/audit/beneficiarios?tab=beneficiarios-actualizados"
          },
          {
            label: "Eliminados",
            count: counts.beneficiariosEliminados || 0,
            href: "/dashboard/audit/beneficiarios?tab=beneficiarios-eliminados"
          }
        ]
      },
      {
        title: "Acciones",
        description: "Registro de acciones de seguimiento realizadas sobre los casos",
        icon: Activity,
        totalCount: (counts.accionesEliminadas || 0) + (counts.accionesActualizadas || 0) + (counts.accionesCreadas || 0),
        href: "/dashboard/audit/acciones",
        lastActivity: counts.lastActivities?.acciones,
        operations: [
          {
            label: "Creadas",
            count: counts.accionesCreadas || 0,
            href: "/dashboard/audit/acciones?tab=acciones-creadas"
          },
          {
            label: "Actualizadas",
            count: counts.accionesActualizadas || 0,
            href: "/dashboard/audit/acciones?tab=acciones-actualizadas"
          },
          {
            label: "Eliminadas",
            count: counts.accionesEliminadas || 0,
            href: "/dashboard/audit/acciones?tab=acciones-eliminadas"
          }
        ]
      },
      {
        title: "Equipo de Casos",
        description: "Registro de cambios en la asignación de estudiantes y profesores a casos",
        icon: Users,
        totalCount: counts.equiposActualizados || 0,
        href: "/dashboard/audit/equipo",
        lastActivity: counts.lastActivities?.equipo,
        operations: [
          {
            label: "Actualizados",
            count: counts.equiposActualizados || 0,
            href: "/dashboard/audit/equipo"
          }
        ]
      },
      {
        title: "Sesiones",
        description: "Registro de inicios y cierres de sesión en el sistema",
        icon: Clock,
        totalCount: counts.sesiones || 0,
        href: "/dashboard/audit/sesiones",
        lastActivity: counts.lastActivities?.sesiones,
        operations: [
          {
            label: "Ver todo",
            count: counts.sesiones || 0,
            href: "/dashboard/audit/sesiones"
          }
        ]
      },
      // Catálogos
      ...(counts.estadosEliminados !== undefined || counts.estadosActualizados !== undefined || counts.estadosInsertados !== undefined ? [{
        title: "Estados",
        description: "Registro de estados del sistema",
        icon: MapPin,
        totalCount: (counts.estadosEliminados || 0) + (counts.estadosActualizados || 0) + (counts.estadosInsertados || 0),
        href: "/dashboard/audit/catalogos/estados",
        lastActivity: counts.lastActivities?.estados,
        operations: [
          {
            label: "Eliminados",
            count: counts.estadosEliminados || 0,
            href: "/dashboard/audit/catalogos/estados"
          },
          {
            label: "Actualizados",
            count: counts.estadosActualizados || 0,
            href: "/dashboard/audit/catalogos/estados"
          }
        ]
      } as AuditEntity] : []),
      ...(counts.materiasEliminadas !== undefined || counts.materiasActualizadas !== undefined || counts.materiasInsertadas !== undefined ? [{
        title: "Materias",
        description: "Registro de materias del sistema",
        icon: BookOpen,
        totalCount: (counts.materiasEliminadas || 0) + (counts.materiasActualizadas || 0) + (counts.materiasInsertadas || 0),
        href: "/dashboard/audit/catalogos/materias",
        lastActivity: counts.lastActivities?.materias,
        operations: [
          {
            label: "Eliminadas",
            count: counts.materiasEliminadas || 0,
            href: "/dashboard/audit/catalogos/materias"
          },
          {
            label: "Actualizadas",
            count: counts.materiasActualizadas || 0,
            href: "/dashboard/audit/catalogos/materias"
          }
        ]
      } as AuditEntity] : []),
      ...(counts.nivelesEducativosEliminados !== undefined || counts.nivelesEducativosActualizados !== undefined || counts.nivelesEducativosInsertados !== undefined ? [{
        title: "Niveles Educativos",
        description: "Registro de niveles educativos del sistema",
        icon: GraduationCap,
        totalCount: (counts.nivelesEducativosEliminados || 0) + (counts.nivelesEducativosActualizados || 0) + (counts.nivelesEducativosInsertados || 0),
        href: "/dashboard/audit/catalogos/niveles-educativos",
        lastActivity: counts.lastActivities?.niveles_educativos,
        operations: [
          {
            label: "Eliminados",
            count: counts.nivelesEducativosEliminados || 0,
            href: "/dashboard/audit/catalogos/niveles-educativos"
          },
          {
            label: "Actualizados",
            count: counts.nivelesEducativosActualizados || 0,
            href: "/dashboard/audit/catalogos/niveles-educativos"
          }
        ]
      } as AuditEntity] : []),
      ...(counts.nucleosEliminados !== undefined || counts.nucleosActualizados !== undefined || counts.nucleosInsertados !== undefined ? [{
        title: "Núcleos",
        description: "Registro de núcleos del sistema",
        icon: Building,
        totalCount: (counts.nucleosEliminados || 0) + (counts.nucleosActualizados || 0) + (counts.nucleosInsertados || 0),
        href: "/dashboard/audit/catalogos/nucleos",
        lastActivity: counts.lastActivities?.nucleos,
        operations: [
          {
            label: "Eliminados",
            count: counts.nucleosEliminados || 0,
            href: "/dashboard/audit/catalogos/nucleos"
          },
          {
            label: "Actualizados",
            count: counts.nucleosActualizados || 0,
            href: "/dashboard/audit/catalogos/nucleos"
          }
        ]
      } as AuditEntity] : []),
      ...(counts.condicionesTrabajoEliminadas !== undefined || counts.condicionesTrabajoActualizadas !== undefined || counts.condicionesTrabajoInsertadas !== undefined ? [{
        title: "Condiciones de Trabajo",
        description: "Registro de condiciones de trabajo del sistema",
        icon: Briefcase,
        totalCount: (counts.condicionesTrabajoEliminadas || 0) + (counts.condicionesTrabajoActualizadas || 0) + (counts.condicionesTrabajoInsertadas || 0),
        href: "/dashboard/audit/catalogos/condiciones-trabajo",
        lastActivity: counts.lastActivities?.condiciones_trabajo,
        operations: [
          {
            label: "Eliminadas",
            count: counts.condicionesTrabajoEliminadas || 0,
            href: "/dashboard/audit/catalogos/condiciones-trabajo"
          },
          {
            label: "Actualizadas",
            count: counts.condicionesTrabajoActualizadas || 0,
            href: "/dashboard/audit/catalogos/condiciones-trabajo"
          }
        ]
      } as AuditEntity] : []),
      ...(counts.condicionesActividadEliminadas !== undefined || counts.condicionesActividadActualizadas !== undefined || counts.condicionesActividadInsertadas !== undefined ? [{
        title: "Condiciones de Actividad",
        description: "Registro de condiciones de actividad del sistema",
        icon: Activity,
        totalCount: (counts.condicionesActividadEliminadas || 0) + (counts.condicionesActividadActualizadas || 0) + (counts.condicionesActividadInsertadas || 0),
        href: "/dashboard/audit/catalogos/condiciones-actividad",
        lastActivity: counts.lastActivities?.condiciones_actividad,
        operations: [
          {
            label: "Eliminadas",
            count: counts.condicionesActividadEliminadas || 0,
            href: "/dashboard/audit/catalogos/condiciones-actividad"
          },
          {
            label: "Actualizadas",
            count: counts.condicionesActividadActualizadas || 0,
            href: "/dashboard/audit/catalogos/condiciones-actividad"
          }
        ]
      } as AuditEntity] : []),
      ...(counts.tiposCaracteristicasEliminados !== undefined || counts.tiposCaracteristicasActualizados !== undefined || counts.tiposCaracteristicasInsertados !== undefined ? [{
        title: "Tipos de Características",
        description: "Registro de tipos de características del sistema",
        icon: Tag,
        totalCount: (counts.tiposCaracteristicasEliminados || 0) + (counts.tiposCaracteristicasActualizados || 0) + (counts.tiposCaracteristicasInsertados || 0),
        href: "/dashboard/audit/catalogos/tipos-caracteristicas",
        lastActivity: counts.lastActivities?.tipos_caracteristicas,
        operations: [
          {
            label: "Eliminados",
            count: counts.tiposCaracteristicasEliminados || 0,
            href: "/dashboard/audit/catalogos/tipos-caracteristicas"
          },
          {
            label: "Actualizados",
            count: counts.tiposCaracteristicasActualizados || 0,
            href: "/dashboard/audit/catalogos/tipos-caracteristicas"
          }
        ]
      } as AuditEntity] : []),
      ...(counts.semestresEliminados !== undefined || counts.semestresActualizados !== undefined || counts.semestresInsertados !== undefined ? [{
        title: "Semestres",
        description: "Registro de semestres del sistema",
        icon: CalendarIcon,
        totalCount: (counts.semestresEliminados || 0) + (counts.semestresActualizados || 0) + (counts.semestresInsertados || 0),
        href: "/dashboard/audit/catalogos/semestres",
        lastActivity: counts.lastActivities?.semestres,
        operations: [
          {
            label: "Eliminados",
            count: counts.semestresEliminados || 0,
            href: "/dashboard/audit/catalogos/semestres"
          },
          {
            label: "Actualizados",
            count: counts.semestresActualizados || 0,
            href: "/dashboard/audit/catalogos/semestres"
          }
        ]
      } as AuditEntity] : []),
      ...(counts.municipiosEliminados !== undefined || counts.municipiosActualizados !== undefined || counts.municipiosInsertados !== undefined ? [{
        title: "Municipios",
        description: "Registro de municipios del sistema",
        icon: Building2,
        totalCount: (counts.municipiosEliminados || 0) + (counts.municipiosActualizados || 0) + (counts.municipiosInsertados || 0),
        href: "/dashboard/audit/catalogos/municipios",
        lastActivity: counts.lastActivities?.municipios,
        operations: [
          {
            label: "Eliminados",
            count: counts.municipiosEliminados || 0,
            href: "/dashboard/audit/catalogos/municipios"
          },
          {
            label: "Actualizados",
            count: counts.municipiosActualizados || 0,
            href: "/dashboard/audit/catalogos/municipios"
          }
        ]
      } as AuditEntity] : []),
      ...(counts.parroquiasEliminadas !== undefined || counts.parroquiasActualizadas !== undefined || counts.parroquiasInsertadas !== undefined ? [{
        title: "Parroquias",
        description: "Registro de parroquias del sistema",
        icon: Home,
        totalCount: (counts.parroquiasEliminadas || 0) + (counts.parroquiasActualizadas || 0) + (counts.parroquiasInsertadas || 0),
        href: "/dashboard/audit/catalogos/parroquias",
        lastActivity: counts.lastActivities?.parroquias,
        operations: [
          {
            label: "Eliminadas",
            count: counts.parroquiasEliminadas || 0,
            href: "/dashboard/audit/catalogos/parroquias"
          },
          {
            label: "Actualizadas",
            count: counts.parroquiasActualizadas || 0,
            href: "/dashboard/audit/catalogos/parroquias"
          }
        ]
      } as AuditEntity] : []),
      ...(counts.categoriasEliminadas !== undefined || counts.categoriasActualizadas !== undefined || counts.categoriasInsertadas !== undefined ? [{
        title: "Categorías",
        description: "Registro de categorías del sistema",
        icon: FolderTree,
        totalCount: (counts.categoriasEliminadas || 0) + (counts.categoriasActualizadas || 0) + (counts.categoriasInsertadas || 0),
        href: "/dashboard/audit/catalogos/categorias",
        lastActivity: counts.lastActivities?.categorias,
        operations: [
          {
            label: "Eliminadas",
            count: counts.categoriasEliminadas || 0,
            href: "/dashboard/audit/catalogos/categorias"
          },
          {
            label: "Actualizadas",
            count: counts.categoriasActualizadas || 0,
            href: "/dashboard/audit/catalogos/categorias"
          }
        ]
      } as AuditEntity] : []),
      ...(counts.subcategoriasEliminadas !== undefined || counts.subcategoriasActualizadas !== undefined || counts.subcategoriasInsertadas !== undefined ? [{
        title: "Subcategorías",
        description: "Registro de subcategorías del sistema",
        icon: FileText,
        totalCount: (counts.subcategoriasEliminadas || 0) + (counts.subcategoriasActualizadas || 0) + (counts.subcategoriasInsertadas || 0),
        href: "/dashboard/audit/catalogos/subcategorias",
        lastActivity: counts.lastActivities?.subcategorias,
        operations: [
          {
            label: "Eliminadas",
            count: counts.subcategoriasEliminadas || 0,
            href: "/dashboard/audit/catalogos/subcategorias"
          },
          {
            label: "Actualizadas",
            count: counts.subcategoriasActualizadas || 0,
            href: "/dashboard/audit/catalogos/subcategorias"
          }
        ]
      } as AuditEntity] : []),
      ...(counts.ambitosLegalesEliminados !== undefined || counts.ambitosLegalesActualizados !== undefined || counts.ambitosLegalesInsertados !== undefined ? [{
        title: "Ámbitos Legales",
        description: "Registro de ámbitos legales del sistema",
        icon: Scale,
        totalCount: (counts.ambitosLegalesEliminados || 0) + (counts.ambitosLegalesActualizados || 0) + (counts.ambitosLegalesInsertados || 0),
        href: "/dashboard/audit/catalogos/ambitos-legales",
        lastActivity: counts.lastActivities?.ambitos_legales,
        operations: [
          {
            label: "Eliminados",
            count: counts.ambitosLegalesEliminados || 0,
            href: "/dashboard/audit/catalogos/ambitos-legales"
          },
          {
            label: "Actualizados",
            count: counts.ambitosLegalesActualizados || 0,
            href: "/dashboard/audit/catalogos/ambitos-legales"
          }
        ]
      } as AuditEntity] : []),
      ...(counts.caracteristicasEliminadas !== undefined || counts.caracteristicasActualizadas !== undefined || counts.caracteristicasInsertadas !== undefined ? [{
        title: "Características",
        description: "Registro de características de vivienda del sistema",
        icon: Tag,
        totalCount: (counts.caracteristicasEliminadas || 0) + (counts.caracteristicasActualizadas || 0) + (counts.caracteristicasInsertadas || 0),
        href: "/dashboard/audit/catalogos/caracteristicas",
        lastActivity: counts.lastActivities?.caracteristicas,
        operations: [
          {
            label: "Eliminadas",
            count: counts.caracteristicasEliminadas || 0,
            href: "/dashboard/audit/catalogos/caracteristicas"
          },
          {
            label: "Actualizadas",
            count: counts.caracteristicasActualizadas || 0,
            href: "/dashboard/audit/catalogos/caracteristicas"
          }
        ]
      } as AuditEntity] : []),
    ];

    // Ordenar por fecha de última actividad
    // Helper para parsear fechas de PostgreSQL correctamente
    const parseDate = (dateStr: string | null | undefined): number => {
      if (!dateStr) return 0;
      // PostgreSQL devuelve "2026-02-03 21:32:53.167599+00" pero JS espera ISO con "T"
      // Convertir a formato ISO: reemplazar espacio por T y normalizar timezone
      const normalized = dateStr
        .replace(' ', 'T')
        .replace(/\+00$/, 'Z')
        .replace(/\+00:00$/, 'Z');
      const timestamp = new Date(normalized).getTime();
      return isNaN(timestamp) ? 0 : timestamp;
    };

    return list.sort((a, b) => {
      const dateA = parseDate(a.lastActivity);
      const dateB = parseDate(b.lastActivity);

      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [counts, sortOrder]);

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
      <div className="w-full">
        {/* Skeleton de la barra de búsqueda */}
        <div className="mb-6">
          <div className="w-full flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="skeleton-shimmer h-10 rounded-full" style={{ width: '100%' }} />
            </div>
            <div className="skeleton-shimmer h-10 rounded-full" style={{ width: 150 }} />
          </div>
        </div>
        {/* Skeleton de las cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <AuditEntityCardSkeleton key={i} />
          ))}
        </div>
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
      <div className="mb-6">
        <div className="w-full flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <Search
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Buscar por entidad..."
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="h-10 px-4 cursor-pointer rounded-full bg-transparent border border-primary text-foreground flex items-center justify-center gap-1.5 whitespace-nowrap hover:bg-primary-light transition-colors"
              title={sortOrder === 'desc' ? 'Más reciente primero' : 'Más antiguo primero'}
            >
              {sortOrder === 'desc' ? (
                <ArrowDown className="w-[18px] h-[18px] text-[#414040]" />
              ) : (
                <ArrowUp className="w-[18px] h-[18px] text-[#414040]" />
              )}
              <span className="text-base text-center">
                {sortOrder === 'desc' ? 'Más reciente' : 'Más antiguo'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Cards de entidades filtradas */}
      {filteredEntities.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500 text-lg">No se encontraron resultados para "{searchQuery}"</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
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
