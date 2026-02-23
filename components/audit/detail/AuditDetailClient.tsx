'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowUpDown, ArrowDown, ArrowUp } from 'lucide-react';
import Search from '@/components/CaseTools/search';
import Filter from '@/components/CaseTools/Filter';
import AuditList from '../AuditList';
import AuditRecordCard from '../AuditRecordCard';
import AuditRecordCardSkeleton from '@/components/ui/skeletons/AuditRecordCardSkeleton';
import type { AuditFilters, AuditRecordType } from '@/types/audit';

type AuditType = 'soportes' | 'soportes-creados' | 'soportes-descargados' | 'citas-eliminadas' | 'citas-actualizadas' | 'citas-creadas' | 'usuarios-eliminados' | 'usuarios-habilitados' | 'usuarios-actualizados-campos' | 'usuarios-creados'
  | 'solicitantes-eliminados' | 'solicitantes-actualizados' | 'solicitantes-creados'
  | 'estudiantes-inscritos' | 'profesores-asignados'
  | 'estados-eliminados' | 'estados-actualizados' | 'estados-insertados'
  | 'materias-eliminadas' | 'materias-actualizadas' | 'materias-insertadas'
  | 'niveles-educativos-eliminados' | 'niveles-educativos-actualizados' | 'niveles-educativos-insertados'
  | 'nucleos-eliminados' | 'nucleos-actualizados' | 'nucleos-insertados'
  | 'condiciones-trabajo-eliminadas' | 'condiciones-trabajo-actualizadas' | 'condiciones-trabajo-insertadas'
  | 'condiciones-actividad-eliminadas' | 'condiciones-actividad-actualizadas' | 'condiciones-actividad-insertadas'
  | 'tipos-caracteristicas-eliminados' | 'tipos-caracteristicas-actualizados' | 'tipos-caracteristicas-insertados'
  | 'semestres-eliminados' | 'semestres-actualizados' | 'semestres-insertados'
  | 'municipios-eliminados' | 'municipios-actualizados' | 'municipios-insertados'
  | 'parroquias-eliminadas' | 'parroquias-actualizadas' | 'parroquias-insertadas'
  | 'categorias-eliminadas' | 'categorias-actualizadas' | 'categorias-insertadas'
  | 'subcategorias-eliminadas' | 'subcategorias-actualizadas' | 'subcategorias-insertadas'
  | 'ambitos-legales-eliminados' | 'ambitos-legales-actualizados' | 'ambitos-legales-insertados'
  | 'caracteristicas-eliminadas' | 'caracteristicas-actualizadas' | 'caracteristicas-insertadas'
  | 'casos-eliminados' | 'casos-actualizados' | 'casos-creados'
  | 'beneficiarios-eliminados' | 'beneficiarios-actualizados' | 'beneficiarios-creados'
  | 'acciones-creadas' | 'acciones-actualizadas' | 'acciones-eliminadas'
  | 'equipos-actualizados' | 'equipos-creados'
  | 'reportes-generados' | 'reportes-vista-previa';

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
    'soportes-creados': 'soporte-creado',
    'soportes-descargados': 'soporte-descargado',
    'citas-eliminadas': 'cita-eliminada',
    'citas-actualizadas': 'cita-actualizada',
    'citas-creadas': 'cita-creada',
    'usuarios-eliminados': 'usuario-eliminado',
    'usuarios-habilitados': 'usuario-habilitado',
    'usuarios-actualizados-campos': 'usuario-actualizado-campos',
    'usuarios-creados': 'usuario-creado',
    'solicitantes-eliminados': 'solicitante-eliminado',
    'solicitantes-actualizados': 'solicitante-actualizado',
    'solicitantes-creados': 'solicitante-creado',
    'estudiantes-inscritos': 'estudiante-inscrito',
    'profesores-asignados': 'profesor-asignado',
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
    // Inserciones
    'estados-insertados': 'estado-insertado',
    'materias-insertadas': 'materia-insertada',
    'niveles-educativos-insertados': 'nivel-educativo-insertado',
    'nucleos-insertados': 'nucleo-insertado',
    'condiciones-trabajo-insertadas': 'condicion-trabajo-insertada',
    'condiciones-actividad-insertadas': 'condicion-actividad-insertada',
    'tipos-caracteristicas-insertados': 'tipo-caracteristica-insertado',
    'semestres-insertados': 'semestre-insertado',
    'municipios-insertados': 'municipio-insertado',
    'parroquias-insertadas': 'parroquia-insertada',
    'categorias-insertadas': 'categoria-insertada',
    'subcategorias-insertadas': 'subcategoria-insertada',
    'ambitos-legales-insertados': 'ambito-legal-insertado',
    'caracteristicas-insertadas': 'caracteristica-insertada',
    // Casos
    // Casos
    'casos-eliminados': 'caso-eliminado',
    'casos-actualizados': 'caso-actualizado',
    'casos-creados': 'caso-creado',
    // Beneficiarios
    'beneficiarios-eliminados': 'beneficiario-eliminado',
    'beneficiarios-actualizados': 'beneficiario-actualizado',
    'beneficiarios-creados': 'beneficiario-creado',
    // Acciones
    'acciones-creadas': 'accion-creada',
    'acciones-actualizadas': 'accion-actualizada',
    'acciones-eliminadas': 'accion-eliminada',
    'equipos-actualizados': 'equipo-actualizado',
    'equipos-creados': 'equipo-actualizado', // Se reutiliza el tipo ya que la estructura es la misma
    'reportes-generados': 'reporte-generado',
    'reportes-vista-previa': 'reporte-generado',
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
          getSoportesCreadosAuditAction,
          getCitasEliminadasAuditAction,
          getCitasActualizadasAuditAction,
          getCitasCreadasAuditAction,
          getUsuariosEliminadosAuditAction,
          getUsuariosHabilitadosAuditAction,
          getUsuariosActualizadosCamposAuditAction,
          getUsuariosCreadosAuditAction,
          getSolicitantesEliminadosAuditAction,
          getSolicitantesActualizadosAuditAction,
          getSolicitantesCreadosAuditAction,
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
          getCaracteristicasActualizadasAuditAction,
          getEstadosInsertadosAuditAction,
          getMateriasInsertadasAuditAction,
          getNivelesEducativosInsertadosAuditAction,
          getNucleosInsertadosAuditAction,
          getCondicionesTrabajoInsertadasAuditAction,
          getCondicionesActividadInsertadasAuditAction,
          getTiposCaracteristicasInsertadosAuditAction,
          getSemestresInsertadosAuditAction,
          getMunicipiosInsertadosAuditAction,
          getParroquiasInsertadasAuditAction,
          getCategoriasInsertadasAuditAction,
          getSubcategoriasInsertadasAuditAction,
          getAmbitosLegalesInsertadosAuditAction,
          getCaracteristicasInsertadasAuditAction,
          // Casos
          getCasosEliminadosAuditAction,
          getCasosActualizadosAuditAction,
          getCasosCreadosAuditAction,
          // Beneficiarios
          getBeneficiariosEliminadosAuditAction,
          getBeneficiariosActualizadosAuditAction,
          getBeneficiariosInscritosAuditAction,
          getAccionesCreadasAuditAction,
          getAccionesActualizadasAuditAction,
          getAccionesEliminadasAuditAction,
          getEquiposActualizadosAuditAction,
          getEquiposCreadosAuditAction,
          getReportesGeneradosAuditAction
        } = await import('@/app/actions/audit');

        let data: any[];
        switch (auditType) {
          case 'soportes':
            data = await getSoportesAuditAction(filters);
            break;
          case 'soportes-creados':
            data = await getSoportesCreadosAuditAction(filters);
            break;
          case 'soportes-descargados':
            const { getDescargasSoportesAuditAction } = await import('@/app/actions/audit');
            const descargasResult = await getDescargasSoportesAuditAction(filters);
            data = descargasResult.records;
            break;
          case 'citas-eliminadas':
            data = await getCitasEliminadasAuditAction(filters);
            break;
          case 'citas-actualizadas':
            data = await getCitasActualizadasAuditAction(filters);
            break;
          case 'citas-creadas':
            data = await getCitasCreadasAuditAction(filters);
            break;
          case 'usuarios-eliminados':
            data = await getUsuariosEliminadosAuditAction(filters);
            break;
          case 'usuarios-habilitados':
            data = await getUsuariosHabilitadosAuditAction(filters);
            break;
          case 'usuarios-actualizados-campos':
            data = await getUsuariosActualizadosCamposAuditAction(filters);
            break;
          case 'usuarios-creados':
            data = await getUsuariosCreadosAuditAction(filters);
            // Asegurar que el tipo de registro se pase correctamente al componente
            // El backend ahora devuelve 'estudiante-inscrito' y 'profesor-asignado' también
            // No necesitamos hacer nada aquí si los tipos coinciden, pero es bueno recordarlo
            break;
          case 'solicitantes-eliminados':
            data = await getSolicitantesEliminadosAuditAction(filters);
            break;
          case 'solicitantes-actualizados':
            data = await getSolicitantesActualizadosAuditAction(filters);
            break;
          case 'solicitantes-creados':
            data = await getSolicitantesCreadosAuditAction(filters);
            break;
          case 'estudiantes-inscritos':
            const { getEstudiantesInscritosAuditAction } = await import('@/app/actions/audit');
            data = await getEstudiantesInscritosAuditAction(filters);
            break;
          case 'profesores-asignados':
            const { getProfesoresInscritosAuditAction } = await import('@/app/actions/audit');
            data = await getProfesoresInscritosAuditAction(filters);
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
          // Inserciones
          case 'estados-insertados':
            data = await getEstadosInsertadosAuditAction(filters);
            break;
          case 'materias-insertadas':
            data = await getMateriasInsertadasAuditAction(filters);
            break;
          case 'niveles-educativos-insertados':
            data = await getNivelesEducativosInsertadosAuditAction(filters);
            break;
          case 'nucleos-insertados':
            data = await getNucleosInsertadosAuditAction(filters);
            break;
          case 'condiciones-trabajo-insertadas':
            data = await getCondicionesTrabajoInsertadasAuditAction(filters);
            break;
          case 'condiciones-actividad-insertadas':
            data = await getCondicionesActividadInsertadasAuditAction(filters);
            break;
          case 'tipos-caracteristicas-insertados':
            data = await getTiposCaracteristicasInsertadosAuditAction(filters);
            break;
          case 'semestres-insertados':
            data = await getSemestresInsertadosAuditAction(filters);
            break;
          case 'municipios-insertados':
            data = await getMunicipiosInsertadosAuditAction(filters);
            break;
          case 'parroquias-insertadas':
            data = await getParroquiasInsertadasAuditAction(filters);
            break;
          case 'categorias-insertadas':
            data = await getCategoriasInsertadasAuditAction(filters);
            break;
          case 'subcategorias-insertadas':
            data = await getSubcategoriasInsertadasAuditAction(filters);
            break;
          case 'ambitos-legales-insertados':
            data = await getAmbitosLegalesInsertadosAuditAction(filters);
            break;
          case 'caracteristicas-insertadas':
            data = await getCaracteristicasInsertadasAuditAction(filters);
            break;
          // Casos
          case 'casos-eliminados':
            data = await getCasosEliminadosAuditAction(filters);
            break;
          case 'casos-actualizados':
            data = await getCasosActualizadosAuditAction(filters);
            break;
          case 'casos-creados':
            data = await getCasosCreadosAuditAction(filters);
            break;
          // Beneficiarios
          case 'beneficiarios-eliminados':
            data = await getBeneficiariosEliminadosAuditAction(filters);
            break;
          case 'beneficiarios-actualizados':
            data = await getBeneficiariosActualizadosAuditAction(filters);
            break;
          case 'beneficiarios-creados':
            data = await getBeneficiariosInscritosAuditAction(filters);
            break;
          // Acciones
          case 'acciones-creadas':
            data = await getAccionesCreadasAuditAction(filters);
            break;
          case 'acciones-actualizadas':
            data = await getAccionesActualizadasAuditAction(filters);
            break;
          case 'acciones-eliminadas':
            data = await getAccionesEliminadasAuditAction(filters);
            break;
          case 'equipos-actualizados':
            data = await getEquiposActualizadosAuditAction(filters);
            break;
          case 'equipos-creados':
            data = await getEquiposCreadosAuditAction(filters);
            break;
          case 'reportes-generados':
            data = await getReportesGeneradosAuditAction(filters);
            break;
          case 'reportes-vista-previa':
            const { getReportesVistaPreviaAuditAction } = await import('@/app/actions/audit');
            data = await getReportesVistaPreviaAuditAction(filters);
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

  const handleTipoRegistroChange = (value: string) => {
    handleFilterChange('tipoRegistro', value || undefined);
  };

  const handleOrdenChange = () => {
    const nuevoOrden = filters.orden === 'desc' ? 'asc' : 'desc';
    handleFilterChange('orden', nuevoOrden);
  };

  // El usuario solicitó eliminar el filtro de tipo de registro para usuarios
  const estatusOptions: { value: string; label: string }[] = [];

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
      <div className="flex flex-wrap gap-3 sm:gap-4 items-center w-full px-3 mb-4 md:mb-6">
        <div className="w-full sm:flex-1 sm:min-w-0">
          <Search
            value={filters.busqueda || ''}
            onChange={(value) => handleFilterChange('busqueda', value || undefined)}
            placeholder="Buscar..."
          />
        </div>
        <div className="flex w-full sm:w-auto gap-3 sm:gap-4 items-center shrink-0 justify-start sm:justify-end">
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
            nucleoLabel="Usuario"
            nucleoAllLabel="Todos los usuarios"
            fechaInicio={filters.fechaInicio}
            fechaFin={filters.fechaFin}
            onFechaInicioChange={(value) => handleFilterChange('fechaInicio', value || undefined)}
            onFechaFinChange={(value) => handleFilterChange('fechaFin', value || undefined)}
            showDateRange={true}
            estatusOptions={estatusOptions}
            estatusFilter={estatusOptions.length > 0 ? filters.tipoRegistro : undefined}
            onEstatusChange={estatusOptions.length > 0 ? handleTipoRegistroChange : undefined}
            estatusLabel={auditType === 'usuarios-creados' ? "Tipo de Registro" : undefined}
          />
        </div>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="space-y-3 px-3 min-h-[400px]">
          {Array.from({ length: 10 }).map((_, i) => (
            <AuditRecordCardSkeleton key={i} />
          ))}
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
