'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import CaseTools from '@/components/CaseTools/CaseTools';
import Table from '@/components/Table/Table';
import {
    getEstudiantesAction,
} from '@/app/actions/usuarios';
import { getSemestresAction, getCurrentTermAction } from '@/app/actions/estudiantes';

interface Estudiante extends Record<string, unknown> {
    cedula: string;
    nombres?: string;
    apellidos?: string;
    nombre_usuario: string;
    habilitado_sistema?: boolean;
    tipo_usuario: string;
    correo_electronico?: string;
    info_estudiante?: string | null;
    term_estudiante?: string | null;
}

interface StudentsClientProps {
    initialEstudiantes?: Estudiante[];
}

export default function StudentsClient({ initialEstudiantes = [] }: StudentsClientProps) {
    const [usuarios, setUsuarios] = useState<Estudiante[]>(initialEstudiantes);
    const [searchValue, setSearchValue] = useState('');
    const [estadoFilter, setEstadoFilter] = useState('');
    const [tipoFilter, setTipoFilter] = useState('');
    const [semestreFilter, setSemestreFilter] = useState('');
    const [semestres, setSemestres] = useState<Array<{ term: string; fecha_inicio: Date; fecha_fin: Date }>>([]);
    const [loading, setLoading] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);



    const router = useRouter();

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setPrefersReducedMotion(mediaQuery.matches);

        const handleChange = (e: MediaQueryListEvent) => {
            setPrefersReducedMotion(e.matches);
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    useEffect(() => {
        if (initialEstudiantes.length === 0) {
            loadEstudiantes();
        }
        // Cargar semestres para el filtro
        loadSemestres();
    }, [initialEstudiantes.length]);

    const loadSemestres = async () => {
        try {
            const result = await getSemestresAction();
            if (result.success && result.data) {
                setSemestres(result.data);
            }
            // Cargar el semestre actual como valor predeterminado
            const currentTermResult = await getCurrentTermAction();
            if (currentTermResult.success && currentTermResult.data) {
                setSemestreFilter(currentTermResult.data.term);
            }
        } catch (error) {
            console.error('Error al cargar semestres:', error);
        }
    };

    const loadEstudiantes = async () => {
        setLoading(true);
        try {
            const result = await getEstudiantesAction();
            if (result.success && result.data) {
                // Mapeamos los datos para asegurar compatibilidad
                const estudiantesData = result.data.map(item => ({
                    ...item,
                    // Asegurar que info_estudiante sea string o null, no undefined
                    info_estudiante: item.info_estudiante || null
                })) as Estudiante[];
                setUsuarios(estudiantesData);
            }
        } catch (error) {
            console.error('Error al cargar estudiantes:', error);
        } finally {
            setLoading(false);
        }
    };

    const normalizeText = (text: string): string => {
        return text
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    };

    const tiposDisponibles = useMemo(() => {
        // Extraer los tipos de estudiante del formato "2024-51 - Inscrito (NRC: 123)"
        const tipos = new Set<string>();
        usuarios.forEach(u => {
            if (u.info_estudiante && u.info_estudiante !== 'Sin información') {
                // Buscar patrones como "Inscrito", "Voluntario", "Egresado", "Servicio Comunitario"
                const tiposEncontrados = ['Inscrito', 'Voluntario', 'Egresado', 'Servicio Comunitario'];
                tiposEncontrados.forEach(tipo => {
                    if (u.info_estudiante!.includes(tipo)) {
                        tipos.add(tipo);
                    }
                });
            }
        });
        return Array.from(tipos).map(t => ({ value: t, label: t }));
    }, [usuarios]);

    // Opciones de semestres para el filtro
    const semestreOptions = useMemo(() => {
        return semestres.map(s => ({
            value: s.term,
            label: s.term
        }));
    }, [semestres]);

    const filteredUsuarios = useMemo(() => {
        if (!searchValue && !estadoFilter && !tipoFilter && !semestreFilter) {
            return usuarios;
        }

        return usuarios.filter((usuario) => {
            const normalizedSearch = normalizeText(searchValue);
            const matchesSearch =
                !searchValue ||
                usuario.cedula.includes(searchValue) ||
                normalizeText((usuario.nombres || '') + ' ' + (usuario.apellidos || '')).includes(normalizedSearch) ||
                normalizeText(usuario.nombre_usuario || '').includes(normalizedSearch);

            const matchesEstado = !estadoFilter ||
                (estadoFilter === 'Habilitado' && usuario.habilitado_sistema) ||
                (estadoFilter === 'Deshabilitado' && !usuario.habilitado_sistema);

            // Filtrar por tipo: buscar si el tipo está contenido en info_estudiante
            const matchesTipo = !tipoFilter ||
                (usuario.info_estudiante && usuario.info_estudiante.includes(tipoFilter));

            // Filtrar por semestre: buscar en info_estudiante que contiene el term
            const matchesSemestre = !semestreFilter ||
                (usuario.info_estudiante && usuario.info_estudiante.includes(semestreFilter));

            return matchesSearch && matchesEstado && matchesTipo && matchesSemestre;
        });
    }, [usuarios, searchValue, estadoFilter, tipoFilter, semestreFilter]);

    const handleView = (data: Record<string, unknown>) => {
        const usuario = data as Estudiante;
        router.push(`/dashboard/users/${usuario.cedula}`);
    };



    return (
        <>
            <motion.div
                className="mb-4 md:mb-6 mt-4"
                initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: "easeOut" }}
            >
                <h1 className="text-4xl m-3 font-semibold font-primary">Estudiantes</h1>
                <p className="mb-6 ml-3">
                    Visualización y gestión de estudiantes registrados en el sistema.
                </p>
            </motion.div>

            <motion.div
                initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: prefersReducedMotion ? 0 : 0.1, ease: "easeOut" }}
            >
                <div className="flex flex-col md:flex-row md:items-center gap-3 sm:gap-4 w-full px-3">
                    <div className="flex-1 min-w-0">
                        <CaseTools
                            searchValue={searchValue}
                            onSearchChange={setSearchValue}
                            searchPlaceholder="Buscar estudiante..."

                            // Filtro de Estado
                            estatusFilter={estadoFilter}
                            onEstatusChange={setEstadoFilter}
                            estatusLabel="Estado"
                            estatusOptions={[
                                { value: 'Habilitado', label: 'Habilitado' },
                                { value: 'Deshabilitado', label: 'Deshabilitado' }
                            ]}

                            // Filtro de Tipo (usando nucleoFilter)
                            nucleoFilter={tipoFilter}
                            onNucleoChange={setTipoFilter}
                            nucleoLabel="Tipo"
                            nucleoAllLabel="Todos los tipos"
                            nucleoOptions={tiposDisponibles}

                            // Filtro de Semestre (usando tramiteFilter)
                            tramiteFilter={semestreFilter}
                            onTramiteChange={setSemestreFilter}
                            tramiteOptions={semestreOptions.map(s => ({ ...s, label: `Semestre ${s.label}` }))}
                        />
                    </div>
                </div>
            </motion.div>

            <div className="mt-10"></div>

            {loading ? (
                <div className="m-3 p-4 text-center">
                    <p className="text-gray-600">Cargando estudiantes...</p>
                </div>
            ) : (
                <motion.div
                    initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
                >
                    <Table
                        data={filteredUsuarios.map((u) => {
                            // Extraer el semestre más reciente de info_estudiante (formato: "2024-52 - Tipo (NRC: xxx)")
                            let semestreActual = 'Sin semestre';
                            if (u.info_estudiante) {
                                const match = u.info_estudiante.match(/^(\d{4}-\d{2})/);
                                if (match) {
                                    semestreActual = match[1];
                                }
                            }
                            return {
                                cedula: u.cedula,
                                nombre_completo: `${u.nombres || ''} ${u.apellidos || ''}`.trim(),
                                info_estudiante: u.info_estudiante || 'Sin información',
                                semestre: semestreActual,
                                estado: u.habilitado_sistema ? 'Habilitado' : 'Deshabilitado',
                            };
                        })}
                        columns={["Cédula", "Nombre Completo", "Tipo", "Semestre", "Estado"]}
                        onView={handleView}
                        idKey="cedula"
                    />
                </motion.div>
            )}
        </>
    );
}
