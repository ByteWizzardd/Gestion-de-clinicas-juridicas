'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, LogOut, ChevronDown, ChevronUp, XCircle, ArrowDown, ArrowUp } from 'lucide-react';
import AuditRecordCardSkeleton from '@/components/ui/skeletons/AuditRecordCardSkeleton';
import Search from '@/components/CaseTools/search';
import Tabs from '@/components/ui/Tabs';
import Filter from '@/components/CaseTools/Filter';
import { TablePagination } from '@/components/Table/TablePagination';
import { logger } from '@/lib/utils/logger';
import { getSesionesAuditAction } from '@/app/actions/audit';
import { getUsuariosAction } from '@/app/actions/usuarios';
import type { SesionAuditRecord, AuditFilters } from '@/types/audit';
import Link from 'next/link';

interface SesionExtended extends SesionAuditRecord {
    nombre_completo_usuario_accion?: string;
}

// Recibe la fecha ya en hora local de Venezuela desde el backend
// Parseamos manualmente para evitar conversión de zona horaria
function formatDate(dateInput: string | Date | null | undefined): string {
    if (!dateInput) return 'Fecha no disponible';

    try {
        let dateStr = typeof dateInput === 'string' ? dateInput : dateInput.toISOString();

        // Parsear los componentes del string (ej: "2026-02-02T04:25:11")
        const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
        if (!match) return 'Fecha inválida';

        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10); // 1-12
        const day = parseInt(match[3], 10);
        let hour = parseInt(match[4], 10);
        const minute = parseInt(match[5], 10);

        // Nombres de meses en español
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const monthName = meses[month - 1];

        // Formato 12 horas
        const ampm = hour >= 12 ? 'p. m.' : 'a. m.';
        let displayHour = hour % 12;
        displayHour = displayHour || 12; // 0 -> 12

        return `${day} de ${monthName} de ${year}, ${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`;
    } catch {
        return 'Fecha inválida';
    }
}

function formatDuration(inicio: string, cierre: string | null): string {
    if (!cierre) return 'Activa';
    const start = new Date(inicio);
    const end = new Date(cierre);
    const diff = end.getTime() - start.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

function parseUserAgent(ua: string | null): { browser: string; os: string } {
    if (!ua) return { browser: 'Desconocido', os: 'Desconocido' };

    let browser = 'Desconocido';
    let os = 'Desconocido';

    if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
    else if (ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';

    if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    else if (ua.includes('Windows NT 10')) os = 'Windows 10/11';
    else if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac OS X')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';

    return { browser, os };
}

function SesionCard({ sesion }: { sesion: SesionExtended }) {
    const [expanded, setExpanded] = useState(false);
    const { browser, os } = parseUserAgent(sesion.dispositivo);
    const isActive = !sesion.fecha_cierre;

    // Construir nombre completo
    let nombreUsuario = sesion.nombre_completo_usuario_accion;
    if (!nombreUsuario && (sesion.nombres || sesion.apellidos)) {
        nombreUsuario = `${sesion.nombres || ''} ${sesion.apellidos || ''}`.trim();
    }
    if (!nombreUsuario) {
        nombreUsuario = sesion.nombre_usuario || 'Usuario desconocido';
    }

    return (
        <div className="bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--card-border)] p-5 hover:shadow-md transition-all transition-colors duration-200">
            <div
                className="flex items-start justify-between gap-4 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex-1">
                    {/* Summary Section - mismo estilo que AuditRecordCard */}
                    <div className="flex items-center gap-3">
                        {sesion.exitoso ? (
                            isActive ? (
                                <LogIn className="w-5 h-5 text-[var(--card-text-muted)]" />
                            ) : (
                                <LogOut className="w-5 h-5 text-[var(--card-text-muted)]" />
                            )
                        ) : (
                            <XCircle className="w-5 h-5 text-[var(--card-text-muted)]" />
                        )}
                        <div className="flex-1">
                            <p className="font-semibold text-[var(--card-text)] transition-colors">
                                {sesion.exitoso ? (
                                    isActive ? 'Inicio de sesión' : 'Sesión cerrada'
                                ) : (
                                    'Intento de acceso fallido'
                                )}
                                {' - '}
                                {sesion.cedula_usuario ? (
                                    <Link
                                        href={`/dashboard/users/${sesion.cedula_usuario}`}
                                        className="text-primary hover:underline font-medium transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {nombreUsuario}
                                    </Link>
                                ) : (
                                    <span>{nombreUsuario}</span>
                                )}
                                {isActive && sesion.exitoso && (
                                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-500/10 text-green-600 rounded-full">
                                        Activa
                                    </span>
                                )}
                                {!sesion.exitoso && (
                                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-500/10 text-red-600 rounded-full">
                                        Fallido
                                    </span>
                                )}
                            </p>
                            <p className="text-sm text-[var(--card-text-muted)]">
                                IP: {sesion.ip_direccion || 'No registrada'} • {browser} / {os}
                            </p>
                        </div>
                    </div>
                    <p className="text-xs text-[var(--card-text-muted)] mt-2 transition-colors">
                        {formatDate(sesion.fecha_inicio)}
                    </p>
                </div>
                <div className="shrink-0 p-2 hover:bg-[var(--sidebar-hover)] rounded-full transition-colors">
                    {expanded ? (
                        <ChevronUp className="w-5 h-5 text-[var(--card-text-muted)]" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-[var(--card-text-muted)]" />
                    )}
                </div>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        {/* Details Section - mismo estilo que AuditRecordCard */}
                        <div className="mt-4 space-y-3 pt-4 border-t border-[var(--card-border)] transition-colors">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-[var(--card-text)] mb-1">Usuario</p>
                                    <p className="text-sm text-[var(--card-text-muted)]">
                                        Nombre:{' '}
                                        {sesion.cedula_usuario ? (
                                            <Link
                                                href={`/dashboard/users/${sesion.cedula_usuario}`}
                                                className="text-primary hover:underline"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {nombreUsuario}
                                            </Link>
                                        ) : (
                                            nombreUsuario
                                        )}
                                    </p>
                                    <p className="text-sm text-[var(--card-text-muted)]">Cédula: {sesion.cedula_usuario || 'N/A'}</p>
                                    {sesion.nombre_usuario && (
                                        <p className="text-sm text-[var(--card-text-muted)]">Username: {sesion.nombre_usuario}</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-[var(--card-text)] mb-1">Conexión</p>
                                    <p className="text-sm text-[var(--card-text-muted)]">Dirección IP: {sesion.ip_direccion || 'No registrada'}</p>
                                    <p className="text-sm text-[var(--card-text-muted)]">Navegador: {browser}</p>
                                    <p className="text-sm text-[var(--card-text-muted)]">Sistema Operativo: {os}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-[var(--card-text)] mb-1">Tiempos</p>
                                    <p className="text-sm text-[var(--card-text-muted)]">Inicio: {formatDate(sesion.fecha_inicio)}</p>
                                    <p className="text-sm text-[var(--card-text-muted)]">
                                        Cierre: {sesion.fecha_cierre ? formatDate(sesion.fecha_cierre) : 'Sin cerrar (Activa)'}
                                    </p>
                                    {sesion.fecha_cierre && (
                                        <p className="text-sm text-[var(--card-text-muted)]">Duración: {formatDuration(sesion.fecha_inicio, sesion.fecha_cierre)}</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-[var(--card-text)] mb-1">Estado</p>
                                    <p className={`text-sm ${sesion.exitoso ? 'text-[var(--success)]' : 'text-[var(--danger)]'} transition-colors`}>
                                        {sesion.exitoso
                                            ? (sesion.detalle || 'Autenticación exitosa')
                                            : (sesion.detalle || 'Credenciales incorrectas o usuario no encontrado')}
                                    </p>
                                </div>
                            </div>
                            {sesion.dispositivo && (
                                <div>
                                    <p className="text-sm font-semibold text-[var(--card-text)] mb-1">User Agent</p>
                                    <p className="text-sm text-[var(--card-text-muted)] bg-[var(--ui-bg-muted)] p-2 rounded font-mono text-xs break-all transition-colors">{sesion.dispositivo}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function SesionesList({ type }: { type: 'logins' | 'logouts' | 'failed' }) {
    const [sesiones, setSesiones] = useState<SesionExtended[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<AuditFilters>({ orden: 'desc' });
    const [usuarioOptions, setUsuarioOptions] = useState<Array<{ value: string; label: string }>>([]);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Cargar opciones de usuarios
    useEffect(() => {
        async function loadUsuarios() {
            try {
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
                logger.error('Error loading usuarios:', err);
            }
        }
        loadUsuarios();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const loadSesiones = useCallback(async () => {
        try {
            setLoading(true);
            const result = await getSesionesAuditAction({
                busqueda: debouncedSearch || undefined,
                limit: rowsPerPage,
                offset: (page - 1) * rowsPerPage,
                type,
                sortOrder: filters.orden || 'desc',
                idUsuario: filters.idUsuario,
                fechaInicio: filters.fechaInicio,
                fechaFin: filters.fechaFin
            });
            setSesiones(result.records as unknown as SesionExtended[]);
            setTotal(result.total);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar sesiones');
            logger.error('Error loading sesiones:', err);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, page, type, filters, rowsPerPage]);

    useEffect(() => {
        loadSesiones();
    }, [loadSesiones]);

    const handleFilterChange = (key: keyof AuditFilters, value: string | 'asc' | 'desc' | undefined) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value || undefined,
        }));
        setPage(1);
    };

    const handleUsuarioChange = (value: string) => {
        handleFilterChange('idUsuario', value || undefined);
    };

    const handleOrdenChange = () => {
        const nuevoOrden = (filters.orden || 'desc') === 'desc' ? 'asc' : 'desc';
        handleFilterChange('orden', nuevoOrden);
    };

    const totalPages = Math.ceil(total / rowsPerPage);

    if (error) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex flex-wrap gap-3 sm:gap-4 items-center w-full px-3 mb-4 md:mb-6">
                <div className="w-full sm:flex-1 sm:min-w-0">
                    <Search
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Buscar por usuario, IP o dispositivo..."
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
                            <ArrowDown className="w-[18px] h-[18px] text-[var(--card-text-muted)] transition-colors" />
                        ) : (
                            <ArrowUp className="w-[18px] h-[18px] text-[var(--card-text-muted)] transition-colors" />
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
            </div>

            <div className="mx-3">
                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: rowsPerPage }).map((_, i) => (
                            <AuditRecordCardSkeleton key={i} />
                        ))}
                    </div>
                ) : sesiones.length === 0 ? (
                    <div className="text-center py-12 bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] transition-colors">
                        <LogIn className="w-12 h-12 text-[var(--card-text-muted)] opacity-20 mx-auto mb-4" />
                        <p className="text-[var(--card-text-muted)]">No se encontraron registros de este tipo</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sesiones.map((sesion) => (
                            <SesionCard key={sesion.id_sesion} sesion={sesion} />
                        ))}
                    </div>
                )}

                {(totalPages > 1 || sesiones.length > 0) && (
                    <TablePagination
                        currentPage={page}
                        totalPages={totalPages}
                        rowsPerPage={rowsPerPage}
                        onPageChange={setPage}
                        onRowsPerPageChange={(rows) => {
                            setRowsPerPage(rows);
                            setPage(1);
                        }}
                    />
                )}
            </div>
        </div>
    );
}

export default function SesionesAuditClient() {
    const tabs = [
        {
            id: 'logins',
            label: 'Historial',
            content: <SesionesList type="logins" />
        },
        {
            id: 'failed',
            label: 'Intentos Fallidos',
            content: <SesionesList type="failed" />
        },
    ];

    return (
        <div className="w-full">
            <div className="px-0">
                <Tabs tabs={tabs} defaultTab="logins" />
            </div>
        </div>
    );
}
