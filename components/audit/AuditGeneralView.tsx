'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';

import {
    FileText, Calendar, User, Users, UserX, FolderOpen, AlertCircle, Hash, Search,
    Filter, CheckCircle2, Clock, MapPin, Building, Building2, BookOpen, GraduationCap, Briefcase, Activity, Tag, FolderTree, Scale, Layers
} from 'lucide-react';
import { useToast } from '@/components/ui/feedback/ToastProvider';
import { getAuditEventsAction } from '@/app/actions/audit-events.actions';
import type { AuditoriaEvento, AuditOperacion, AuditEntidad } from '@/types/audit-events';
import { logger } from '@/lib/utils/logger';
import AuditRecordCardSkeleton from '@/components/ui/skeletons/AuditRecordCardSkeleton';
import AuditRecordCard from './AuditRecordCard';
import CaseTools from '@/components/CaseTools/CaseTools';
import { getUsuariosAction } from '@/app/actions/usuarios';
import { filterLogsByVisibleContent } from '@/lib/utils/audit-search';
import { mapUnifiedLogToAuditRecord } from '@/lib/utils/audit-record-mapper';

import { TablePagination } from '@/components/Table/TablePagination';

export default function AuditGeneralView() {
    const [logs, setLogs] = useState<AuditoriaEvento[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [selectedEntity, setSelectedEntity] = useState<string>('');
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [selectedOperation, setSelectedOperation] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<string>('desc');
    const [usuariosOptions, setUsuariosOptions] = useState<{ value: string; label: string }[]>([]);
    const { toast } = useToast();

    // Debounce del término de búsqueda (400ms) para no saturar el servidor
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Etiqueta bonita para mostrar junto a cada tarjeta (moduleName), a partir
    // del valor crudo que guarda auditoria_eventos.entidad. Cubre todos los
    // valores reales vistos en la BD (incluye 'accion' y 'accion_ejecutores'
    // como entidades separadas, y 'solicitante_artefactos').
    const entityLabels: Record<string, string> = {
        sesion: 'Sesión', reporte: 'Reporte', caso: 'Caso', usuario: 'Usuario',
        solicitante: 'Solicitante', solicitante_artefactos: 'Solicitante',
        beneficiario: 'Beneficiario', cita: 'Cita', accion: 'Acción',
        accion_ejecutores: 'Acción', estudiante: 'Estudiante', profesor: 'Profesor',
        equipo: 'Equipo', soporte: 'Soporte', estado: 'Estado', municipio: 'Municipio',
        parroquia: 'Parroquia', nucleo: 'Núcleo', materia: 'Materia', semestre: 'Semestre',
        categoria: 'Categoría', subcategoria: 'Subcategoría', ambito_legal: 'Ámbito Legal',
        nivel_educativo: 'Nivel Educativo', condicion_trabajo: 'Condición Trabajo',
        condicion_actividad: 'Condición Actividad', tipo_caracteristica: 'Tipo Característica',
        caracteristica: 'Característica',
    };
    const getEntityLabel = (entidad: string) => entityLabels[entidad] || entidad;

    const entityMapToTechnical: Record<string, AuditEntidad> = {
        'Sesión': 'sesion', 'Reporte': 'reporte', 'Caso': 'caso', 'Usuario': 'usuario',
        'Solicitante': 'solicitante', 'Beneficiario': 'beneficiario', 'Cita': 'cita',
        'Acción': 'accion_ejecutores', 'Estudiante': 'estudiante', 'Profesor': 'profesor',
        'Equipo': 'equipo', 'Soporte': 'soporte', 'Estado': 'estado', 'Municipio': 'municipio',
        'Parroquia': 'parroquia', 'Núcleo': 'nucleo', 'Materia': 'materia', 'Semestre': 'semestre',
        'Categoría': 'categoria', 'Subcategoría': 'subcategoria', 'Ámbito Legal': 'ambito_legal',
        'Nivel Educativo': 'nivel_educativo', 'Condición Trabajo': 'condicion_trabajo',
        'Condición Actividad': 'condicion_actividad', 'Tipo Característica': 'tipo_caracteristica',
        'Característica': 'caracteristica'
    };

    const operationMapToTechnical: Record<string, AuditOperacion> = {
        'Creación': 'insercion', 'Actualización': 'actualizacion', 'Eliminación': 'eliminacion',
        'Habilitación': 'actualizacion', 'Inscripción': 'insercion', 'Asignación': 'insercion',
        'Inicio de Sesión': 'inicio_sesion', 'Cierre de Sesión': 'cierre_sesion', 'Intento Fallido': 'intento_fallido',
        'Generación': 'generacion_reporte', 'Descarga': 'descarga_soporte'
    };

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const { eventos: newLogs, total: count } = await getAuditEventsAction({
                entidad: selectedEntity ? entityMapToTechnical[selectedEntity] : undefined,
                idUsuario: selectedUser || undefined,
                operacion: selectedOperation ? operationMapToTechnical[selectedOperation] : undefined,
                fechaInicio: startDate || undefined,
                fechaFin: endDate || undefined,
                orden: sortOrder as 'asc' | 'desc',
                busqueda: debouncedSearchTerm || undefined,
                limit: rowsPerPage,
                offset: (page - 1) * rowsPerPage
            });
            setLogs(newLogs);
            setTotalCount(count);
        } catch (error) {
            logger.error(error);
            toast.error('Error al cargar los registros de auditoría');
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, selectedEntity, selectedUser, selectedOperation, startDate, endDate, sortOrder, debouncedSearchTerm, toast]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    // Resetear a página 1 cuando cambian los filtros
    useEffect(() => {
        setPage(1);
    }, [selectedEntity, selectedUser, selectedOperation, startDate, endDate, sortOrder, debouncedSearchTerm]);


    useEffect(() => {
        const loadUsuarios = async () => {
            try {
                const result = await getUsuariosAction();
                if (result.success && result.data) {
                    setUsuariosOptions(result.data.map(u => ({
                        value: u.cedula,
                        label: `${u.nombres || ''} ${u.apellidos || ''}`.trim()
                    })));
                }
            } catch (error) {
                logger.error('Error al cargar usuarios para filtro:', error);
            }
        };
        loadUsuarios();
    }, []);

    // Filtrado híbrido: el servidor retorna un superset (metadata::text match),
    // luego el cliente filtra dejando solo registros donde el término aparece
    // en datos realmente visibles (campos que cambiaron para actualizaciones).
    const displayLogs = useMemo(() => {
        if (!debouncedSearchTerm) return logs;
        return filterLogsByVisibleContent(logs, debouncedSearchTerm);
    }, [logs, debouncedSearchTerm]);

    // Lista de entidades disponibles para filtrar
    const availableEntitiesOptions = [
        'Sesión', 'Reporte', 'Caso', 'Usuario', 'Solicitante', 'Beneficiario',
        'Cita', 'Acción', 'Estudiante', 'Profesor', 'Equipo', 'Soporte',
        'Estado', 'Municipio', 'Parroquia', 'Núcleo', 'Materia', 'Semestre',
        'Categoría', 'Subcategoría', 'Ámbito Legal', 'Nivel Educativo',
        'Condición Trabajo', 'Condición Actividad', 'Tipo Característica', 'Característica'
    ].map(e => ({ value: e, label: e }));

    // Lista de tipos de operación
    const operationOptions = [
        'Creación', 'Actualización', 'Eliminación',
        'Habilitación', 'Inscripción', 'Asignación',
        'Inicio de Sesión', 'Cierre de Sesión', 'Intento Fallido',
        'Generación', 'Descarga'
    ].map(o => ({ value: o, label: o }));

    // Opciones de ordenamiento
    const sortOptions = [
        { value: 'desc', label: 'Más reciente' },
        { value: 'asc', label: 'Más antiguo' }
    ];

    return (
        <div className="w-full">
            {/* Filtros y Búsqueda */}
            <div className="mb-6 px-3">
                <CaseTools
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    searchPlaceholder="Buscar por usuario, acción o detalle..."

                    // Filtro de Módulo (usando nucleoFilter)
                    nucleoFilter={selectedEntity}
                    onNucleoChange={setSelectedEntity}
                    nucleoLabel="Módulo"
                    nucleoAllLabel="Todos los módulos"
                    nucleoOptions={availableEntitiesOptions}
                    nucleoIcon={Layers}

                    // Filtro de Operación
                    operacionFilter={selectedOperation}
                    onOperacionChange={setSelectedOperation}
                    operacionOptions={operationOptions}

                    // Filtro de Usuario (usando estadoCivilFilter)
                    estadoCivilFilter={selectedUser}
                    onEstadoCivilChange={setSelectedUser}
                    estadoCivilLabel="Usuarios"
                    estadoCivilOptions={usuariosOptions}

                    // Filtro de Fecha
                    showDateRange={true}
                    fechaInicio={startDate}
                    fechaFin={endDate}
                    onFechaInicioChange={setStartDate}
                    onFechaFinChange={setEndDate}

                    // Filtro de Orden
                    sortFilter={sortOrder}
                    onSortChange={setSortOrder}
                    sortLabel="Orden"
                    sortOptions={sortOptions}
                />
            </div>

            {/* Lista de Cards */}
            {loading ? (
                <div className="space-y-3 px-3">
                    {Array.from({ length: rowsPerPage }).map((_, i) => (
                        <AuditRecordCardSkeleton key={i} />
                    ))}
                </div>
            ) : displayLogs.length === 0 ? (
                <div className="py-12 text-center text-[var(--card-text-muted)] bg-[var(--card-bg)] rounded-lg border border-dashed border-[var(--card-border)] px-3 transition-colors">
                    <div className="flex flex-col items-center justify-center">
                        <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                        <span>No se encontraron registros de auditoría</span>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 px-3">
                    {displayLogs.map((log, index) => {
                        const mapped = mapUnifiedLogToAuditRecord(log);
                        if (!mapped) return null;
                        return (
                            <div key={`${log.fecha_evento}-${index}`}>
                                <AuditRecordCard record={mapped.record} type={mapped.type} moduleName={getEntityLabel(log.entidad)} />
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Footer con Paginación */}
            {!loading && totalCount > 0 && (
                <div className="p-4 flex justify-end w-full">
                    <TablePagination
                        currentPage={page}
                        totalPages={Math.ceil(totalCount / rowsPerPage)}
                        rowsPerPage={rowsPerPage}
                        onPageChange={(newPage) => {
                            setPage(newPage);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        onRowsPerPageChange={(newRows) => {
                            setRowsPerPage(newRows);
                            setPage(1);
                        }}
                    />
                </div>
            )}
        </div>
    );
}
