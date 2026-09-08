'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';

import {
    FileText, Calendar, User, Users, UserX, FolderOpen, AlertCircle, Hash, Search,
    Filter, CheckCircle2, Clock, MapPin, Building, Building2, BookOpen, GraduationCap, Briefcase, Activity, Tag, FolderTree, Scale, Layers
} from 'lucide-react';
import { useToast } from '@/components/ui/feedback/ToastProvider';
import { UnifiedAuditLog, getUnifiedAuditLogsAction } from '@/app/actions/audit-general';
import { logger } from '@/lib/utils/logger';
import AuditRecordCardSkeleton from '@/components/ui/skeletons/AuditRecordCardSkeleton';
import AuditRecordCard from './AuditRecordCard';
import type { AuditRecordType } from '@/types/audit';
import CaseTools from '@/components/CaseTools/CaseTools';
import { getUsuariosAction } from '@/app/actions/usuarios';
import { filterLogsByVisibleContent } from '@/lib/utils/audit-search';

import { TablePagination } from '@/components/Table/TablePagination';

export default function AuditGeneralView() {
    const [logs, setLogs] = useState<UnifiedAuditLog[]>([]);
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

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const { logs: newLogs, totalCount: count } = await getUnifiedAuditLogsAction(page, rowsPerPage, {
                entidad: selectedEntity || undefined,
                usuarioId: selectedUser || undefined,
                operacion: selectedOperation || undefined,
                fechaInicio: startDate || undefined,
                fechaFin: endDate || undefined,
                orden: sortOrder,
                busqueda: debouncedSearchTerm || undefined
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

    const mapUnifiedLogToAuditRecord = (log: UnifiedAuditLog): { record: any, type: AuditRecordType } | null => {
        // Parsear metadata si es string
        let metadata: any = {};
        try {
            metadata = typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata;
        } catch (e) {
            logger.error("Error parsing metadata", e);
            return null;
        }

        const e = log.entidad;
        const a = log.accion.toLowerCase();
        let type: AuditRecordType | null = null;
        let record: any = { ...metadata };

        // Mapeo de tipos
        if (e === 'Sesión') {
            type = 'sesion';
        }
        else if (e === 'Caso') {
            if (a.includes('creación')) type = 'caso-creado';
            else if (a.includes('actualización')) type = 'caso-actualizado';
            else if (a.includes('eliminación')) type = 'caso-eliminado';
        }
        else if (e === 'Usuario') {
            if (a.includes('creación')) type = 'usuario-creado';
            else if (a.includes('actualización')) type = 'usuario-actualizado-campos';
            else if (a.includes('eliminación')) type = 'usuario-eliminado';
            else if (a.includes('habilitación')) type = 'usuario-actualizado-campos';
        }
        else if (e === 'Estudiante') {
            type = 'estudiante-inscrito';
        }
        else if (e === 'Profesor') {
            type = 'profesor-asignado';
        }
        else if (e === 'Solicitante') {
            if (a.includes('creación')) type = 'solicitante-creado';
            else if (a.includes('actualización')) type = 'solicitante-actualizado';
            else if (a.includes('eliminación')) type = 'solicitante-eliminado';
        }
        else if (e === 'Beneficiario') {
            if (a.includes('creación')) {
                type = 'beneficiario-creado';
                // AuditRecordCard espera 'beneficiario-creado' mapeado a 'BeneficiarioInscritoAuditRecord' ?
                // Revisando AuditRecordCard switch line 4953: case 'beneficiario-creado'
            }
            else if (a.includes('actualización')) type = 'beneficiario-actualizado';
            else if (a.includes('eliminación')) type = 'beneficiario-eliminado';
        }
        else if (e === 'Cita') {
            if (a.includes('programación') || a.includes('creación')) type = 'cita-creada';
            else if (a.includes('actualización')) type = 'cita-actualizada';
            else if (a.includes('eliminación')) type = 'cita-eliminada';
        }
        else if (e === 'Acción') {
            if (a.includes('registro') || a.includes('creación')) type = 'accion-creada';
            else if (a.includes('actualización')) type = 'accion-actualizada';
            else if (a.includes('eliminación')) type = 'accion-eliminada';
        }
        else if (e === 'Soporte') {
            if (a.includes('subida')) type = 'soporte-creado';
            else if (a.includes('eliminación')) type = 'soporte';
            else if (a.includes('descarga')) type = 'soporte-descargado';
        }
        else if (e === 'Reporte') {
            type = 'reporte-generado';
        }
        else if (e === 'Equipo') {
            type = 'equipo-actualizado';
        }
        // Catálogos
        else {
            const entityMap: Record<string, string> = {
                'Estado': 'estado',
                'Municipio': 'municipio',
                'Parroquia': 'parroquia',
                'Núcleo': 'nucleo',
                'Materia': 'materia',
                'Semestre': 'semestre',
                'Categoría': 'categoria',
                'Subcategoría': 'subcategoria',
                'Ámbito Legal': 'ambito-legal',
                'Nivel Educativo': 'nivel-educativo',
                'Condición Trabajo': 'condicion-trabajo',
                'Condición Actividad': 'condicion-actividad',
                'Tipo Característica': 'tipo-caracteristica',
                'Característica': 'caracteristica'
            };

            const feminineEntities = [
                'Materia', 'Parroquia', 'Categoría', 'Subcategoría',
                'Condición Trabajo', 'Condición Actividad', 'Característica'
            ];

            const prefix = entityMap[e];
            if (prefix) {
                const isFeminine = feminineEntities.includes(e);
                const suffix = {
                    insert: isFeminine ? 'insertada' : 'insertado',
                    update: isFeminine ? 'actualizada' : 'actualizado',
                    delete: isFeminine ? 'eliminada' : 'eliminado'
                };

                if (a.includes('creación')) type = `${prefix}-${suffix.insert}` as AuditRecordType;
                else if (a.includes('actualización')) type = `${prefix}-${suffix.update}` as AuditRecordType;
                else if (a.includes('eliminación')) type = `${prefix}-${suffix.delete}` as AuditRecordType;
            }
        }

        if (record) {
            record.fecha = log.fecha;
            record.fecha_actualizacion = log.fecha;

            // Para sesiones, inyectar nombre completo directamente
            if (e === 'Sesión') {
                if (!record.nombre_completo_usuario_accion) {
                    record.nombre_completo_usuario_accion = log.usuario_nombre;
                }
            }

            // Inyectar información del actor si falta en metadata
            // Mapear sufijos de acción a campos de usuario
            let actorSuffix = '';
            if (a.includes('creación') || a.includes('registro') || a.includes('programación') || a.includes('subida') || a.includes('inscripción') || a.includes('asignación')) {
                actorSuffix = 'creo';
                if (a.includes('subida')) actorSuffix = 'subio';
            } else if (a.includes('actualización') || a.includes('modificación')) {
                actorSuffix = 'actualizo';
                if (e === 'Equipo') actorSuffix = 'modifico';
            } else if (a.includes('eliminación')) {
                actorSuffix = 'elimino';
            } else if (a.includes('descarga')) {
                actorSuffix = 'descargo';
            } else if (e === 'Reporte') {
                actorSuffix = 'genero';
            }

            if (actorSuffix) {
                const idField = `id_usuario_${actorSuffix}`;
                const nameField = `nombre_completo_usuario_${actorSuffix}`;

                // Si cedula_descargo es usado en lugar de id_usuario_descargo
                if (actorSuffix === 'descargo') {
                    if (!record.cedula_descargo) record.cedula_descargo = log.usuario_id;
                } else {
                    if (!record[idField]) record[idField] = log.usuario_id;
                }

                if (!record[nameField]) record[nameField] = log.usuario_nombre;

                // Asegurar nombres/apellidos individuales si faltan
                if (!record[`nombres_usuario_${actorSuffix}`] && log.usuario_nombre) {
                    // Intento básico de split si es necesario, o dejar que renderUserLink use el nombre completo
                    // renderUserLink prioriza nombre_completo, asi que con eso basta.
                }
            }
        }

        if (!type) {
            // Fallback para tipos desconocidos (Sesiones, etc no están en AuditRecordCard explícitamente como cards visuales complejas, o sí?)
            // Sesiones no parece estar en AuditRecordCard.
            logger.warn(`Tipo de auditoría desconocido: ${e} - ${a}`);
            return null;
        }

        return { record, type };
    };

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
                            <div key={`${log.fecha}-${index}`}>
                                <AuditRecordCard record={mapped.record} type={mapped.type} moduleName={log.entidad} />
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
