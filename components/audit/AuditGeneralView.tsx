'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import {
    FileText, Calendar, User, Users, UserX, FolderOpen, AlertCircle, Hash, Search,
    Filter, CheckCircle2, Clock, MapPin, Building, Building2, BookOpen, GraduationCap, Briefcase, Activity, Tag, FolderTree, Scale
} from 'lucide-react';
import { useToast } from '@/components/ui/feedback/ToastProvider';
import { UnifiedAuditLog, getUnifiedAuditLogsAction } from '@/app/actions/audit-general';
import Spinner from '@/components/ui/feedback/Spinner';
import AuditRecordCard from './AuditRecordCard';
import type { AuditRecordType } from '@/types/audit';
import CaseTools from '@/components/CaseTools/CaseTools';
import { getUsuariosAction } from '@/app/actions/usuarios';

export default function AuditGeneralView() {
    const [logs, setLogs] = useState<UnifiedAuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEntity, setSelectedEntity] = useState<string>(''); // Renamed usage to match CaseTools prop if needed, or mapped.
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [usuariosOptions, setUsuariosOptions] = useState<{ value: string; label: string }[]>([]);
    const { toast } = useToast();

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const { logs: newLogs } = await getUnifiedAuditLogsAction(page);

            if (newLogs.length === 0) {
                setHasMore(false);
            } else {
                setLogs(prev => page === 1 ? newLogs : [...prev, ...newLogs]);
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar logs de auditoría');
        } finally {
            setLoading(false);
        }
    }, [page, toast]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    useEffect(() => {
        const loadUsuarios = async () => {
            try {
                const result = await getUsuariosAction();
                if (result.success && result.data) {
                    setUsuariosOptions(result.data.map(u => ({
                        value: u.nombre_usuario, // Filtering by username or full name? Log has 'usuario_nombre' which seems to be full name or username.
                        label: `${u.nombres || ''} ${u.apellidos || ''} (${u.nombre_usuario})`.trim()
                    })));
                }
            } catch (error) {
                console.error('Error al cargar usuarios para filtro:', error);
            }
        };
        loadUsuarios();
    }, []);

    // Filtrado en cliente (temporal)
    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            (log.detalles?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (log.usuario_nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (log.accion?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        const matchesEntity = selectedEntity ? log.entidad === selectedEntity : true;

        const matchesUser = selectedUser
            ? (log.usuario_nombre || '').toLowerCase().includes(selectedUser.toLowerCase())
            : true;

        const matchesDate = (() => {
            if (!startDate && !endDate) return true;
            const logDate = log.fecha.substring(0, 10); // YYYY-MM-DD

            if (startDate && logDate < startDate) return false;
            if (endDate && logDate > endDate) return false;

            return true;
        })();

        return matchesSearch && matchesEntity && matchesUser && matchesDate;
    });

    // Lista de entidades disponibles para filtrar
    const availableEntitiesOptions = [
        'Sesión', 'Reporte', 'Caso', 'Usuario', 'Solicitante', 'Beneficiario',
        'Cita', 'Acción', 'Equipo', 'Soporte',
        'Estado', 'Municipio', 'Parroquia', 'Núcleo', 'Materia', 'Semestre',
        'Categoría', 'Subcategoría', 'Ámbito Legal', 'Nivel Educativo',
        'Condición Trabajo', 'Condición Actividad', 'Tipo Característica', 'Característica'
    ].map(e => ({ value: e, label: e }));

    const mapUnifiedLogToAuditRecord = (log: UnifiedAuditLog): { record: any, type: AuditRecordType } | null => {
        // Parsear metadata si es string
        let metadata: any = {};
        try {
            metadata = typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata;
        } catch (e) {
            console.error("Error parsing metadata", e);
            return null;
        }

        const e = log.entidad;
        const a = log.accion.toLowerCase();
        let type: AuditRecordType | null = null;
        let record: any = { ...metadata };

        // Mapeo de tipos
        if (e === 'Caso') {
            if (a.includes('creación')) type = 'caso-creado';
            else if (a.includes('actualización')) type = 'caso-actualizado';
            else if (a.includes('eliminación')) type = 'caso-eliminado';
        }
        else if (e === 'Usuario') {
            if (a.includes('creación')) type = 'usuario-creado';
            else if (a.includes('actualización')) type = 'usuario-actualizado-campos';
            else if (a.includes('eliminación')) type = 'usuario-eliminado';
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

            const prefix = entityMap[e];
            if (prefix) {
                if (a.includes('creación')) type = `${prefix}-insertado` as AuditRecordType;
                else if (a.includes('actualización')) type = `${prefix}-actualizado` as AuditRecordType;
                else if (a.includes('eliminación')) type = `${prefix}-eliminado` as AuditRecordType;
            }
        }

        if (!type) {
            // Fallback para tipos desconocidos (Sesiones, etc no están en AuditRecordCard explícitamente como cards visuales complejas, o sí?)
            // Sesiones no parece estar en AuditRecordCard.
            console.warn(`Tipo de auditoría desconocido: ${e} - ${a}`);
            return null;
        }

        return { record, type };
    };

    return (
        <>
            {/* Filtros y Búsqueda */}
            <div className="mb-6">
                <CaseTools
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    searchPlaceholder="Buscar en logs..."

                    // Filtro de Módulo (usando nucleoFilter)
                    nucleoFilter={selectedEntity}
                    onNucleoChange={setSelectedEntity}
                    nucleoLabel="Módulo"
                    nucleoAllLabel="Todos los módulos"
                    nucleoOptions={availableEntitiesOptions}

                    // Filtro de Usuario (usando estadoCivilFilter)
                    estadoCivilFilter={selectedUser}
                    onEstadoCivilChange={setSelectedUser}
                    estadoCivilLabel="Usuario"
                    estadoCivilOptions={usuariosOptions}

                    // Filtro de Fecha
                    showDateRange={true}
                    fechaInicio={startDate}
                    fechaFin={endDate}
                    onFechaInicioChange={setStartDate}
                    onFechaFinChange={setEndDate}
                />
            </div>

            {/* Lista de Cards */}
            <div className="space-y-4">
                {loading && page === 1 ? (
                    <div className="py-12 text-center text-gray-400">
                        <Spinner size="md" className="mb-2 mx-auto" />
                        <span>Cargando registros...</span>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 bg-white rounded-lg border border-dashed border-gray-200">
                        <div className="flex flex-col items-center justify-center">
                            <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                            <span>No se encontraron registros de auditoría</span>
                        </div>
                    </div>
                ) : (
                    filteredLogs.map((log, index) => {
                        const mapped = mapUnifiedLogToAuditRecord(log);
                        if (!mapped) return null; // O renderizar un card genérico si es necesario
                        return (
                            <motion.div
                                key={`${log.fecha}-${index}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <AuditRecordCard record={mapped.record} type={mapped.type} moduleName={log.entidad} />
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Footer con Paginación */}
            {hasMore && !loading && (
                <div className="p-4 flex justify-center">
                    <button
                        onClick={() => setPage(prev => prev + 1)}
                        className="px-6 py-2 text-sm font-medium text-primary bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:shadow-md transition-all"
                    >
                        Cargar más registros
                    </button>
                </div>
            )}
        </>
    );
}
