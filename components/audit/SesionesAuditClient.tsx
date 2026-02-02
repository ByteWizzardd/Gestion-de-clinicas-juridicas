'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, LogOut, ChevronDown, ChevronUp, XCircle } from 'lucide-react';
import Spinner from '@/components/ui/feedback/Spinner';
import Search from '@/components/CaseTools/search';
import Tabs from '@/components/ui/Tabs';
import { getSesionesAuditAction } from '@/app/actions/audit';
import type { SesionAuditRecord } from '@/types/audit';
import Link from 'next/link';

interface SesionExtended extends SesionAuditRecord {
    nombre_completo_usuario_accion?: string;
}

function formatDate(dateInput: string | Date | null | undefined): string {
    if (!dateInput) return 'Fecha no disponible';

    let date: Date;
    if (dateInput instanceof Date) {
        date = dateInput;
    } else if (typeof dateInput === 'string') {
        if (dateInput.includes('T') || dateInput.includes(' ')) {
            const normalizedInput = dateInput.replace(' ', 'T');
            const isoMatch = normalizedInput.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
            if (isoMatch) {
                const [, year, month, day, hour, minute] = isoMatch.map(Number);
                date = new Date(year, month - 1, day, hour, minute);
            } else {
                date = new Date(dateInput);
            }
        } else {
            const parts = dateInput.split('-');
            if (parts.length === 3) {
                const [year, month, day] = parts.map(Number);
                date = new Date(year, month - 1, day);
            } else {
                date = new Date(dateInput);
            }
        }
    } else {
        return 'Fecha no disponible';
    }

    if (isNaN(date.getTime())) return 'Fecha inválida';

    return date.toLocaleDateString('es-VE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/Caracas',
    });
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

    if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';

    if (ua.includes('Windows NT 10')) os = 'Windows 10/11';
    else if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac OS X')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div
                className="flex items-start justify-between gap-4 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex-1">
                    {/* Summary Section - mismo estilo que AuditRecordCard */}
                    <div className="flex items-center gap-3">
                        {sesion.exitoso ? (
                            isActive ? (
                                <LogIn className="w-5 h-5 text-gray-600" />
                            ) : (
                                <LogOut className="w-5 h-5 text-gray-600" />
                            )
                        ) : (
                            <XCircle className="w-5 h-5 text-gray-600" />
                        )}
                        <div className="flex-1">
                            <p className="font-semibold text-gray-900">
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
                                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                        Activa
                                    </span>
                                )}
                                {!sesion.exitoso && (
                                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                                        Fallido
                                    </span>
                                )}
                            </p>
                            <p className="text-sm text-gray-600">
                                IP: {sesion.ip_direccion || 'No registrada'} • {browser} / {os}
                            </p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        {formatDate(sesion.fecha_inicio)}
                    </p>
                </div>
                <div className="shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors">
                    {expanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
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
                        <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-700 mb-1">Usuario</p>
                                    <p className="text-sm text-gray-600">
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
                                    <p className="text-sm text-gray-600">Cédula: {sesion.cedula_usuario || 'N/A'}</p>
                                    {sesion.nombre_usuario && (
                                        <p className="text-sm text-gray-600">Username: {sesion.nombre_usuario}</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-700 mb-1">Conexión</p>
                                    <p className="text-sm text-gray-600">Dirección IP: {sesion.ip_direccion || 'No registrada'}</p>
                                    <p className="text-sm text-gray-600">Navegador: {browser}</p>
                                    <p className="text-sm text-gray-600">Sistema Operativo: {os}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-700 mb-1">Tiempos</p>
                                    <p className="text-sm text-gray-600">Inicio: {formatDate(sesion.fecha_inicio)}</p>
                                    <p className="text-sm text-gray-600">
                                        Cierre: {sesion.fecha_cierre ? formatDate(sesion.fecha_cierre) : 'Sin cerrar (Activa)'}
                                    </p>
                                    {sesion.fecha_cierre && (
                                        <p className="text-sm text-gray-600">Duración: {formatDuration(sesion.fecha_inicio, sesion.fecha_cierre)}</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-700 mb-1">Estado</p>
                                    <p className={`text-sm ${sesion.exitoso ? 'text-green-600' : 'text-red-600'}`}>
                                        {sesion.exitoso ? 'Autenticación exitosa' : 'Credenciales incorrectas o usuario no encontrado'}
                                    </p>
                                </div>
                            </div>
                            {sesion.dispositivo && (
                                <div>
                                    <p className="text-sm font-semibold text-gray-700 mb-1">User Agent</p>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded font-mono text-xs break-all">{sesion.dispositivo}</p>
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
    const limit = 20;

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
                limit,
                offset: (page - 1) * limit,
                type // Pasamos el tipo
            });
            setSesiones(result.records as SesionExtended[]);
            setTotal(result.total);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar sesiones');
            console.error('Error loading sesiones:', err);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, page, type]);

    useEffect(() => {
        loadSesiones();
    }, [loadSesiones]);

    const totalPages = Math.ceil(total / limit);

    if (error) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
                className="flex flex-wrap gap-3 sm:gap-4 items-center w-full px-3 mb-4 md:mb-6 mt-4"
            >
                <div className="w-full sm:flex-1 sm:min-w-0">
                    <Search
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Buscar por usuario, IP o dispositivo..."
                    />
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="mx-3"
            >
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Spinner size="lg" />
                    </div>
                ) : sesiones.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <LogIn className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No se encontraron registros de este tipo</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sesiones.map((sesion) => (
                            <SesionCard key={sesion.id_sesion} sesion={sesion} />
                        ))}
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Anterior
                        </button>
                        <span className="text-sm text-gray-600">
                            Página {page} de {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </motion.div>
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
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <h1 className="text-4xl m-3 font-semibold font-primary">Auditoría de Sesiones</h1>
                <p className="mb-6 ml-3 text-gray-600">
                    Registro de actividad y seguridad de accesos al sistema
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <Tabs tabs={tabs} defaultTab="logins" />
            </motion.div>
        </div>
    );
}
