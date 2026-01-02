'use client';

import { useState, useEffect } from 'react';
import Input from '@/components/forms/Input';
import DatePicker from '@/components/forms/DatePicker';
import Button from '@/components/ui/Button';
import AuditList from '../AuditList';
import AuditRecordCard from '../AuditRecordCard';
import Spinner from '@/components/ui/feedback/Spinner';
import type { AuditFilters } from '@/types/audit';

type AuditType = 'soportes' | 'citas-eliminadas' | 'citas-actualizadas' | 'usuarios-eliminados' | 'usuarios-actualizados';
type AuditRecordType = 'soporte' | 'cita-eliminada' | 'cita-actualizada' | 'usuario-eliminado' | 'usuario-actualizado';

interface AuditDetailClientProps {
  title: string;
  description: string;
  auditType: AuditType;
  emptyMessage?: string;
}

export default function AuditDetailClient({
  title,
  description,
  auditType,
  emptyMessage = 'No se encontraron registros',
}: AuditDetailClientProps) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AuditFilters>({});
  const [usuarioOptions, setUsuarioOptions] = useState<Array<{ value: string; label: string }>>([]);

  // Mapear auditType a tipo de record card
  const recordTypeMap: Record<AuditType, AuditRecordType> = {
    'soportes': 'soporte',
    'citas-eliminadas': 'cita-eliminada',
    'citas-actualizadas': 'cita-actualizada',
    'usuarios-eliminados': 'usuario-eliminado',
    'usuarios-actualizados': 'usuario-actualizado',
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
          getUsuariosActualizadosAuditAction
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
          case 'usuarios-actualizados':
            data = await getUsuariosActualizadosAuditAction(filters);
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

  const handleFilterChange = (key: keyof AuditFilters, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined && v !== '');

  return (
    <div className="w-full">
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-4xl font-semibold font-primary mb-2">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DatePicker
            label="Fecha inicio"
            value={filters.fechaInicio || ''}
            onChange={(value) => handleFilterChange('fechaInicio', value)}
          />
          <DatePicker
            label="Fecha fin"
            value={filters.fechaFin || ''}
            onChange={(value) => handleFilterChange('fechaFin', value)}
          />
          {usuarioOptions.length > 0 && (
            <div className="flex flex-col gap-1">
              <label className="text-base font-normal text-foreground mb-1">Usuario</label>
              <select
                className="w-full h-[40px] px-4 rounded-full border border-transparent bg-[#E5E7EB] focus:outline-none focus:ring-1 focus:ring-primary text-base"
                value={filters.idUsuario || ''}
                onChange={(e) => handleFilterChange('idUsuario', e.target.value || undefined)}
              >
                <option value="">Todos</option>
                {usuarioOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <Input
            label="Búsqueda"
            placeholder="Buscar..."
            value={filters.busqueda || ''}
            onChange={(e) => handleFilterChange('busqueda', e.target.value || undefined)}
          />
        </div>
        {hasActiveFilters && (
          <div className="mt-4">
            <Button variant="outline" onClick={handleClearFilters}>
              Limpiar filtros
            </Button>
          </div>
        )}
      </div>

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
