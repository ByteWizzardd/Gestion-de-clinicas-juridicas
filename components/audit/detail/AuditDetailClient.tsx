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

type AuditType = 'soportes' | 'citas-eliminadas' | 'citas-actualizadas' | 'usuarios-eliminados' | 'usuarios-actualizados-campos';
type AuditRecordType = 'soporte' | 'cita-eliminada' | 'cita-actualizada' | 'usuario-eliminado' | 'usuario-actualizado-campos';

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
          getUsuariosActualizadosCamposAuditAction
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
