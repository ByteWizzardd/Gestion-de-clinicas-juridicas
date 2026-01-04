'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowUpDown, ArrowDown, ArrowUp } from 'lucide-react';
import Search from '@/components/CaseTools/search';
import Filter from '@/components/CaseTools/Filter';
import AuditList from '../AuditList';
import AuditRecordCard from '../AuditRecordCard';
import Spinner from '@/components/ui/feedback/Spinner';
import type { AuditFilters } from '@/types/audit';

type AuditType = 'soportes' | 'citas-eliminadas' | 'citas-actualizadas' | 'usuarios-eliminados' | 'usuarios-actualizados-campos' 
  | 'estados-eliminados' | 'estados-actualizados'
  | 'materias-eliminadas' | 'materias-actualizadas'
  | 'niveles-educativos-eliminados' | 'niveles-educativos-actualizados'
  | 'nucleos-eliminados' | 'nucleos-actualizados'
  | 'condiciones-trabajo-eliminadas' | 'condiciones-trabajo-actualizadas'
  | 'condiciones-actividad-eliminadas' | 'condiciones-actividad-actualizadas'
  | 'tipos-caracteristicas-eliminados' | 'tipos-caracteristicas-actualizados'
  | 'semestres-eliminados' | 'semestres-actualizados'
  | 'municipios-eliminados' | 'municipios-actualizados'
  | 'parroquias-eliminadas' | 'parroquias-actualizadas'
  | 'categorias-eliminadas' | 'categorias-actualizadas'
  | 'subcategorias-eliminadas' | 'subcategorias-actualizadas'
  | 'ambitos-legales-eliminados' | 'ambitos-legales-actualizados'
  | 'caracteristicas-eliminadas' | 'caracteristicas-actualizadas';
type AuditRecordType = 'soporte' | 'cita-eliminada' | 'cita-actualizada' | 'usuario-eliminado' | 'usuario-actualizado-campos' 
  | 'estado-eliminado' | 'estado-actualizado'
  | 'materia-eliminada' | 'materia-actualizada'
  | 'nivel-educativo-eliminado' | 'nivel-educativo-actualizado'
  | 'nucleo-eliminado' | 'nucleo-actualizado'
  | 'condicion-trabajo-eliminada' | 'condicion-trabajo-actualizada'
  | 'condicion-actividad-eliminada' | 'condicion-actividad-actualizada'
  | 'tipo-caracteristica-eliminado' | 'tipo-caracteristica-actualizado'
  | 'semestre-eliminado' | 'semestre-actualizado'
  | 'municipio-eliminado' | 'municipio-actualizado'
  | 'parroquia-eliminada' | 'parroquia-actualizada'
  | 'categoria-eliminada' | 'categoria-actualizada'
  | 'subcategoria-eliminada' | 'subcategoria-actualizada'
  | 'ambito-legal-eliminado' | 'ambito-legal-actualizado'
  | 'caracteristica-eliminada' | 'caracteristica-actualizada';

interface AuditDetailClientProps {
  title: string;
  description: string;
  auditType: AuditType;
  emptyMessage?: string;
  hideHeader?: boolean; // Si es true, no muestra el título y descripción (útil cuando está dentro de tabs)
}

export default function AuditDetailClient({
  title,
  description,
  auditType,
  emptyMessage = 'No se encontraron registros',
  hideHeader = false,
}: AuditDetailClientProps) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AuditFilters>({ orden: 'desc' }); // Por defecto: más reciente primero
  const [usuarioOptions, setUsuarioOptions] = useState<Array<{ value: string; label: string }>>([]);

  // Mapear auditType a tipo de record card
  const recordTypeMap: Record<AuditType, AuditRecordType> = {
    'soportes': 'soporte',
    'citas-eliminadas': 'cita-eliminada',
    'citas-actualizadas': 'cita-actualizada',
    'usuarios-eliminados': 'usuario-eliminado',
    'usuarios-actualizados-campos': 'usuario-actualizado-campos',
    'estados-eliminados': 'estado-eliminado',
    'estados-actualizados': 'estado-actualizado',
    'materias-eliminadas': 'materia-eliminada',
    'materias-actualizadas': 'materia-actualizada',
    'niveles-educativos-eliminados': 'nivel-educativo-eliminado',
    'niveles-educativos-actualizados': 'nivel-educativo-actualizado',
    'nucleos-eliminados': 'nucleo-eliminado',
    'nucleos-actualizados': 'nucleo-actualizado',
    'condiciones-trabajo-eliminadas': 'condicion-trabajo-eliminada',
    'condiciones-trabajo-actualizadas': 'condicion-trabajo-actualizada',
    'condiciones-actividad-eliminadas': 'condicion-actividad-eliminada',
    'condiciones-actividad-actualizadas': 'condicion-actividad-actualizada',
    'tipos-caracteristicas-eliminados': 'tipo-caracteristica-eliminado',
    'tipos-caracteristicas-actualizados': 'tipo-caracteristica-actualizado',
    'semestres-eliminados': 'semestre-eliminado',
    'semestres-actualizados': 'semestre-actualizado',
    'municipios-eliminados': 'municipio-eliminado',
    'municipios-actualizados': 'municipio-actualizado',
    'parroquias-eliminadas': 'parroquia-eliminada',
    'parroquias-actualizadas': 'parroquia-actualizada',
    'categorias-eliminadas': 'categoria-eliminada',
    'categorias-actualizadas': 'categoria-actualizada',
    'subcategorias-eliminadas': 'subcategoria-eliminada',
    'subcategorias-actualizadas': 'subcategoria-actualizada',
    'ambitos-legales-eliminados': 'ambito-legal-eliminado',
    'ambitos-legales-actualizados': 'ambito-legal-actualizado',
    'caracteristicas-eliminadas': 'caracteristica-eliminada',
    'caracteristicas-actualizadas': 'caracteristica-actualizada',
  };

  // Cargar opciones de usuarios
  useEffect(() => {
    async function loadUsuarios() {
      try {
        const { getUsuariosAction } = await import('@/app/actions/usuarios');
        const result = await getUsuariosAction();
        if (result.success && result.data) {
          setUsuarioOptions(
            result.data.map((u) => ({
              value: u.cedula,
              label: u.nombre_completo || `${u.nombres} ${u.apellidos}`,
            }))
          );
        }
      } catch (err) {
        console.error('Error loading usuarios:', err);
      }
    }
    loadUsuarios();
  }, []);

  // Cargar datos
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        // Importar la Server Action correspondiente dinámicamente
        const { 
          getSoportesAuditAction,
          getCitasEliminadasAuditAction,
          getCitasActualizadasAuditAction,
          getUsuariosEliminadosAuditAction,
          getUsuariosActualizadosCamposAuditAction,
          getEstadosEliminadosAuditAction,
          getEstadosActualizadosAuditAction,
          getMateriasEliminadasAuditAction,
          getMateriasActualizadasAuditAction,
          getNivelesEducativosEliminadosAuditAction,
          getNivelesEducativosActualizadosAuditAction,
          getNucleosEliminadosAuditAction,
          getNucleosActualizadosAuditAction,
          getCondicionesTrabajoEliminadasAuditAction,
          getCondicionesTrabajoActualizadasAuditAction,
          getCondicionesActividadEliminadasAuditAction,
          getCondicionesActividadActualizadasAuditAction,
          getTiposCaracteristicasEliminadosAuditAction,
          getTiposCaracteristicasActualizadosAuditAction,
          getSemestresEliminadosAuditAction,
          getSemestresActualizadosAuditAction,
          getMunicipiosEliminadosAuditAction,
          getMunicipiosActualizadosAuditAction,
          getParroquiasEliminadasAuditAction,
          getParroquiasActualizadasAuditAction,
          getCategoriasEliminadasAuditAction,
          getCategoriasActualizadasAuditAction,
          getSubcategoriasEliminadasAuditAction,
          getSubcategoriasActualizadasAuditAction,
          getAmbitosLegalesEliminadosAuditAction,
          getAmbitosLegalesActualizadosAuditAction,
          getCaracteristicasEliminadasAuditAction,
          getCaracteristicasActualizadasAuditAction
        } = await import('@/app/actions/audit');

        let data: any[];
        switch (auditType) {
          case 'soportes':
            data = await getSoportesAuditAction(filters);
            break;
          case 'citas-eliminadas':
            data = await getCitasEliminadasAuditAction(filters);
            break;
          case 'citas-actualizadas':
            data = await getCitasActualizadasAuditAction(filters);
            break;
          case 'usuarios-eliminados':
            data = await getUsuariosEliminadosAuditAction(filters);
            break;
          case 'usuarios-actualizados-campos':
            data = await getUsuariosActualizadosCamposAuditAction(filters);
            break;
          case 'estados-eliminados':
            data = await getEstadosEliminadosAuditAction(filters);
            break;
          case 'estados-actualizados':
            data = await getEstadosActualizadosAuditAction(filters);
            break;
          case 'materias-eliminadas':
            data = await getMateriasEliminadasAuditAction(filters);
            break;
          case 'materias-actualizadas':
            data = await getMateriasActualizadasAuditAction(filters);
            break;
          case 'niveles-educativos-eliminados':
            data = await getNivelesEducativosEliminadosAuditAction(filters);
            break;
          case 'niveles-educativos-actualizados':
            data = await getNivelesEducativosActualizadosAuditAction(filters);
            break;
          case 'nucleos-eliminados':
            data = await getNucleosEliminadosAuditAction(filters);
            break;
          case 'nucleos-actualizados':
            data = await getNucleosActualizadosAuditAction(filters);
            break;
          case 'condiciones-trabajo-eliminadas':
            data = await getCondicionesTrabajoEliminadasAuditAction(filters);
            break;
          case 'condiciones-trabajo-actualizadas':
            data = await getCondicionesTrabajoActualizadasAuditAction(filters);
            break;
          case 'condiciones-actividad-eliminadas':
            data = await getCondicionesActividadEliminadasAuditAction(filters);
            break;
          case 'condiciones-actividad-actualizadas':
            data = await getCondicionesActividadActualizadasAuditAction(filters);
            break;
          case 'tipos-caracteristicas-eliminados':
            data = await getTiposCaracteristicasEliminadosAuditAction(filters);
            break;
          case 'tipos-caracteristicas-actualizados':
            data = await getTiposCaracteristicasActualizadosAuditAction(filters);
            break;
          case 'semestres-eliminados':
            data = await getSemestresEliminadosAuditAction(filters);
            break;
          case 'semestres-actualizados':
            data = await getSemestresActualizadosAuditAction(filters);
            break;
          case 'municipios-eliminados':
            data = await getMunicipiosEliminadosAuditAction(filters);
            break;
          case 'municipios-actualizados':
            data = await getMunicipiosActualizadosAuditAction(filters);
            break;
          case 'parroquias-eliminadas':
            data = await getParroquiasEliminadasAuditAction(filters);
            break;
          case 'parroquias-actualizadas':
            data = await getParroquiasActualizadasAuditAction(filters);
            break;
          case 'categorias-eliminadas':
            data = await getCategoriasEliminadasAuditAction(filters);
            break;
          case 'categorias-actualizadas':
            data = await getCategoriasActualizadasAuditAction(filters);
            break;
          case 'subcategorias-eliminadas':
            data = await getSubcategoriasEliminadasAuditAction(filters);
            break;
          case 'subcategorias-actualizadas':
            data = await getSubcategoriasActualizadasAuditAction(filters);
            break;
          case 'ambitos-legales-eliminados':
            data = await getAmbitosLegalesEliminadosAuditAction(filters);
            break;
          case 'ambitos-legales-actualizados':
            data = await getAmbitosLegalesActualizadosAuditAction(filters);
            break;
          case 'caracteristicas-eliminadas':
            data = await getCaracteristicasEliminadasAuditAction(filters);
            break;
          case 'caracteristicas-actualizadas':
            data = await getCaracteristicasActualizadasAuditAction(filters);
            break;
          default:
            throw new Error('Tipo de auditoría no válido');
        }
        
        setRecords(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
        console.error('Error loading audit data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [auditType, filters]);

  const handleFilterChange = (key: keyof AuditFilters, value: string | 'asc' | 'desc' | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handleUsuarioChange = (value: string) => {
    handleFilterChange('idUsuario', value || undefined);
  };

  const handleOrdenChange = () => {
    const nuevoOrden = filters.orden === 'desc' ? 'asc' : 'desc';
    handleFilterChange('orden', nuevoOrden);
  };

  return (
    <div className="w-full">
      {/* Encabezado (solo si no está oculto) */}
      {!hideHeader && (
        <>
          <h1 className="text-4xl m-3 font-semibold font-primary">{title}</h1>
          <p className="mb-6 ml-3">{description}</p>
        </>
      )}

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
        className="flex flex-nowrap gap-3 sm:gap-4 items-center w-full px-3 mb-4 md:mb-6 mt-4"
      >
        <div className="flex-1 min-w-0">
          <Search
            value={filters.busqueda || ''}
            onChange={(value) => handleFilterChange('busqueda', value || undefined)}
            placeholder="Buscar..."
          />
        </div>
        <div className="flex gap-3 sm:gap-4 items-center shrink-0">
          <button
            type="button"
            onClick={handleOrdenChange}
            className="h-10 px-4 cursor-pointer rounded-full bg-transparent border border-primary text-foreground flex items-center justify-center gap-1.5 whitespace-nowrap hover:bg-primary-light transition-colors"
            title={(filters.orden || 'desc') === 'desc' ? 'Más reciente primero' : 'Más antiguo primero'}
          >
            {(filters.orden || 'desc') === 'desc' ? (
              <ArrowDown className="w-[18px] h-[18px] text-[#414040]" />
            ) : (
              <ArrowUp className="w-[18px] h-[18px] text-[#414040]" />
            )}
            <span className="text-base text-center">
              {(filters.orden || 'desc') === 'desc' ? 'Más reciente' : 'Más antiguo'}
            </span>
          </button>
          <Filter
            nucleoFilter={usuarioOptions.length > 0 ? (filters.idUsuario || '') : undefined}
            onNucleoChange={usuarioOptions.length > 0 ? handleUsuarioChange : undefined}
            nucleoOptions={usuarioOptions.length > 0 ? usuarioOptions : []}
            tramiteOptions={[]}
            estatusOptions={[]}
            nucleoLabel="Usuario"
            nucleoAllLabel="Todos los usuarios"
            fechaInicio={filters.fechaInicio}
            fechaFin={filters.fechaFin}
            onFechaInicioChange={(value) => handleFilterChange('fechaInicio', value || undefined)}
            onFechaFinChange={(value) => handleFilterChange('fechaFin', value || undefined)}
            showDateRange={true}
          />
        </div>
      </motion.div>

      {/* Contenido */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p>Error: {error}</p>
        </div>
      ) : (
        <AuditList 
          records={records} 
          recordType={recordTypeMap[auditType]}
          emptyMessage={emptyMessage} 
        />
      )}
    </div>
  );
}
