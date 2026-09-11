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
import type { AuditRecordType } from '@/types/audit';
import CaseTools from '@/components/CaseTools/CaseTools';
import { getUsuariosAction } from '@/app/actions/usuarios';
import { filterLogsByVisibleContent } from '@/lib/utils/audit-search';

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

    const mapUnifiedLogToAuditRecord = (log: AuditoriaEvento): { record: any, type: AuditRecordType } | null => {
        const e = log.entidad;
        const a = log.operacion;
        let type: AuditRecordType | null = null;
        
        let record: any = { ...(log.metadata || {}) };
        
        // Merge datos
        if (a === 'insercion' || a === 'generacion_reporte' || a === 'descarga_soporte' || a === 'inicio_sesion' || a === 'cierre_sesion' || a === 'intento_fallido') {
            record = { ...record, ...(log.datos_nuevos || {}) };
        } else if (a === 'eliminacion') {
            record = { ...record, ...(log.datos_anteriores || {}) };
        } else if (a === 'actualizacion') {
            const ant = log.datos_anteriores || {};
            const nue = log.datos_nuevos || {};
            
            // Merge all keys with _anterior and _nuevo suffixes
            const allKeys = new Set([...Object.keys(ant), ...Object.keys(nue)]);
            allKeys.forEach(k => {
                record[`${k}_anterior`] = ant[k];
                record[`${k}_nuevo`] = nue[k];
                // Also put raw keys in case some card parts rely on it
                if (nue[k] !== undefined) record[k] = nue[k];
                else record[k] = ant[k];
            });
        }

        // Mapeo de tipos
        if (e === 'sesion') {
            type = 'sesion';
        }
        else if (e === 'caso') {
            if (a === 'insercion') type = 'caso-creado';
            else if (a === 'actualizacion') type = 'caso-actualizado';
            else if (a === 'eliminacion') type = 'caso-eliminado';
        }
        else if (e === 'usuario') {
            if (a === 'insercion') type = 'usuario-creado';
            else if (a === 'actualizacion') type = 'usuario-actualizado-campos';
            else if (a === 'eliminacion') type = 'usuario-eliminado';
        }
        else if (e === 'estudiante') {
            type = 'estudiante-inscrito';
        }
        else if (e === 'profesor') {
            type = 'profesor-asignado';
        }
        else if (e === 'solicitante') {
            if (a === 'insercion') type = 'solicitante-creado';
            else if (a === 'actualizacion') type = 'solicitante-actualizado';
            else if (a === 'eliminacion') type = 'solicitante-eliminado';
        }
        else if (e === 'beneficiario') {
            if (a === 'insercion') type = 'beneficiario-creado';
            else if (a === 'actualizacion') type = 'beneficiario-actualizado';
            else if (a === 'eliminacion') type = 'beneficiario-eliminado';
        }
        else if (e === 'cita') {
            if (a === 'insercion') type = 'cita-creada';
            else if (a === 'actualizacion') type = 'cita-actualizada';
            else if (a === 'eliminacion') type = 'cita-eliminada';
        }
        else if (e === 'accion_ejecutores') {
            if (a === 'insercion') type = 'accion-creada';
            else if (a === 'actualizacion') type = 'accion-actualizada';
            else if (a === 'eliminacion') type = 'accion-eliminada';
        }
        else if (e === 'accion') {
            // Registro de la propia acción de seguimiento (tabla `acciones`,
            // vía trigger genérico) — distinto de accion_ejecutores. No tiene
            // tarjeta dedicada todavía; usa el fallback genérico de
            // AuditRecordCard en vez de perderse silenciosamente.
            type = 'accion-registro' as AuditRecordType;
        }
        else if (e === 'solicitante_artefactos') {
            // Cambios de artefactos domésticos del solicitante. Sin tarjeta
            // dedicada todavía; usa el fallback genérico.
            type = 'solicitante-artefactos' as AuditRecordType;
        }
        else if (e === 'soporte') {
            if (a === 'insercion') type = 'soporte-creado';
            else if (a === 'eliminacion') type = 'soporte';
            else if (a === 'descarga_soporte') type = 'soporte-descargado';
        }
        else if (e === 'reporte') {
            type = 'reporte-generado';
        }
        else if (e === 'equipo') {
            type = 'equipo-actualizado';
        }
        // Catálogos
        else {
            const technicalToPrefix: Record<string, string> = {
                'estado': 'estado',
                'municipio': 'municipio',
                'parroquia': 'parroquia',
                'nucleo': 'nucleo',
                'materia': 'materia',
                'semestre': 'semestre',
                'categoria': 'categoria',
                'subcategoria': 'subcategoria',
                'ambito_legal': 'ambito-legal',
                'nivel_educativo': 'nivel-educativo',
                'condicion_trabajo': 'condicion-trabajo',
                'condicion_actividad': 'condicion-actividad',
                'tipo_caracteristica': 'tipo-caracteristica',
                'caracteristica': 'caracteristica'
            };

            const feminineEntities = [
                'materia', 'parroquia', 'categoria', 'subcategoria',
                'condicion_trabajo', 'condicion_actividad', 'caracteristica'
            ];

            const prefix = technicalToPrefix[e];
            if (prefix) {
                const isFeminine = feminineEntities.includes(e);
                const suffix = {
                    insert: isFeminine ? 'insertada' : 'insertado',
                    update: isFeminine ? 'actualizada' : 'actualizado',
                    delete: isFeminine ? 'eliminada' : 'eliminado'
                };

                if (a === 'insercion') type = `${prefix}-${suffix.insert}` as AuditRecordType;
                else if (a === 'actualizacion') type = `${prefix}-${suffix.update}` as AuditRecordType;
                else if (a === 'eliminacion') type = `${prefix}-${suffix.delete}` as AuditRecordType;
            }
        }

        if (record) {
            // auditoria_eventos solo tiene una fecha real (fecha_evento); las
            // tarjetas viejas fueron escritas contra columnas por-entidad de
            // las tablas originales (fecha_creacion, fecha_generacion,
            // fecha_registro, fecha_eliminacion, fecha_inicio...) — se
            // rellenan como fallback (solo si no vinieron ya del merge de
            // datos_nuevos/datos_anteriores) para que cada tarjeta encuentre
            // el nombre de campo que espera sin pisar datos reales — ej.
            // semestres.fecha_inicio es una columna de negocio real, no la
            // fecha del evento de auditoría.
            record.fecha = log.fecha_evento;
            record.fecha_actualizacion = log.fecha_evento;
            record.fecha_creacion ??= log.fecha_evento;
            record.fecha_eliminacion ??= log.fecha_evento;
            record.fecha_registro ??= log.fecha_evento;
            record.fecha_generacion ??= log.fecha_evento;
            record.fecha_inicio ??= log.fecha_evento;

            // Inyectar nombres de actor según la operación
            let actorSuffix = '';
            if (a === 'insercion' || a === 'inicio_sesion' || a === 'intento_fallido' || a === 'cierre_sesion') {
                actorSuffix = 'creo';
                if (e === 'soporte') actorSuffix = 'subio';
            } else if (a === 'actualizacion') {
                actorSuffix = 'actualizo';
                if (e === 'equipo') actorSuffix = 'modifico';
            } else if (a === 'eliminacion') {
                actorSuffix = 'elimino';
            } else if (a === 'descarga_soporte') {
                actorSuffix = 'descargo';
            } else if (a === 'generacion_reporte' || a === 'vista_previa_reporte') {
                actorSuffix = 'genero';
            }

            if (actorSuffix) {
                const idField = `id_usuario_${actorSuffix}`;
                const nameField = `nombre_completo_usuario_${actorSuffix}`;

                if (actorSuffix === 'descargo') {
                    if (!record.cedula_descargo) record.cedula_descargo = log.id_usuario;
                } else {
                    if (!record[idField]) record[idField] = log.id_usuario;
                }

                if (!record[nameField]) record[nameField] = log.nombre_completo_usuario;
            }

            // Para sesiones, inyectar nombre completo, cédula e IP directo
            // (la tarjeta de sesión espera cedula_usuario/ip_direccion, no
            // id_usuario/metadata.ip).
            if (e === 'sesion') {
                if (!record.nombre_completo_usuario_accion) {
                    record.nombre_completo_usuario_accion = log.nombre_completo_usuario;
                }
                record.cedula_usuario = log.id_usuario;
                record.ip_direccion = log.metadata?.ip ?? null;
            }

            // Para reportes, la tarjeta compara record.operacion === 'vista_previa'
            // (valor legado); el enum real es 'vista_previa_reporte'.
            if (e === 'reporte') {
                record.operacion = a === 'vista_previa_reporte' ? 'vista_previa' : 'generacion';
            }

            // Para casos, la tarjeta espera cedula_solicitante/
            // nombre_completo_solicitante (no la columna cruda `cedula`), y
            // en eliminación el id va en `caso_eliminado`, no `id_caso`.
            if (e === 'caso') {
                record.cedula_solicitante = record.cedula;
                record.nombre_completo_solicitante = log.nombre_completo_solicitante || null;
                if (a === 'eliminacion') {
                    record.caso_eliminado = record.id_caso;
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
