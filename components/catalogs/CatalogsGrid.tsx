'use client';

import {
    BookOpen,
    FolderTree,
    FileText,
    Scale,
    Tag,
    Tags,
    MapPin,
    Building2,
    Home,
    Calendar,
    Building,
    Briefcase,
    Activity,
    GraduationCap
} from 'lucide-react';
import CatalogCard from '@/components/cards/CatalogCard';

export interface CatalogCount {
    materias: number;
    categorias: number;
    subcategorias: number;
    ambitos_legales: number;
    tipos_caracteristicas: number;
    caracteristicas: number;
    estados: number;
    municipios: number;
    parroquias: number;
    semestres: number;
    nucleos: number;
    condiciones_trabajo: number;
    condiciones_actividad: number;
    niveles_educativos: number;
}

interface CatalogsGridProps {
    counts: CatalogCount;
    searchQuery?: string;
}

export default function CatalogsGrid({ counts, searchQuery = '' }: CatalogsGridProps) {
    const catalogs = [
        // 1. Materias y jerarquía legal (ID: 1-4)
        {
            id: 1,
            title: 'Materias',
            description: 'Áreas principales del derecho que se manejan en el sistema. Define las categorías generales de casos legales.',
            count: counts.materias,
            icon: BookOpen,
            href: '/dashboard/catalogs/materias'
        },
        {
            id: 2,
            title: 'Categorías',
            description: 'Clasificaciones específicas dentro de cada materia legal. Permite organizar los casos por tipo de problema jurídico.',
            count: counts.categorias,
            icon: FolderTree,
            href: '/dashboard/catalogs/categorias'
        },
        {
            id: 3,
            title: 'Subcategorías',
            description: 'Subdivisiones detalladas de las categorías. Proporciona una clasificación más granular de los casos.',
            count: counts.subcategorias,
            icon: FileText,
            href: '/dashboard/catalogs/subcategorias'
        },
        {
            id: 4,
            title: 'Ámbitos Legales',
            description: 'Ámbitos específicos de aplicación legal dentro de cada subcategoría. Define el alcance preciso de cada caso.',
            count: counts.ambitos_legales,
            icon: Scale,
            href: '/dashboard/catalogs/ambitos-legales'
        },

        // 2. Características de vivienda (ID: 5-6)
        {
            id: 5,
            title: 'Tipos de Características',
            description: 'Categorías principales de características de vivienda (tipo, materiales, servicios). Agrupa las características por tipo.',
            count: counts.tipos_caracteristicas,
            icon: Tag,
            href: '/dashboard/catalogs/tipos-caracteristicas'
        },
        {
            id: 6,
            title: 'Características',
            description: 'Características específicas de viviendas de los solicitantes. Incluye detalles sobre materiales, servicios y condiciones.',
            count: counts.caracteristicas,
            icon: Tags,
            href: '/dashboard/catalogs/caracteristicas'
        },

        // 3. Ubicación geográfica (ID: 7-10)
        {
            id: 7,
            title: 'Estados',
            description: 'Estados del país registrados en el sistema. Nivel superior de la jerarquía geográfica.',
            count: counts.estados,
            icon: MapPin,
            href: '/dashboard/catalogs/estados'
        },
        {
            id: 8,
            title: 'Municipios',
            description: 'Municipios asociados a cada estado. Segundo nivel de la jerarquía geográfica para ubicar casos y solicitantes.',
            count: counts.municipios,
            icon: Building2,
            href: '/dashboard/catalogs/municipios'
        },
        {
            id: 9,
            title: 'Parroquias',
            description: 'Parroquias asociadas a cada municipio. Nivel más específico de ubicación geográfica en el sistema.',
            count: counts.parroquias,
            icon: Home,
            href: '/dashboard/catalogs/parroquias'
        },
        {
            id: 10,
            title: 'Núcleos',
            description: 'Centros de atención legal donde se originan y gestionan los casos. Cada núcleo tiene una ubicación geográfica específica.',
            count: counts.nucleos,
            icon: Building,
            href: '/dashboard/catalogs/nucleos'
        },

        // 4. Datos académicos y socioeconómicos (ID: 11-13)
        {
            id: 11,
            title: 'Semestres',
            description: 'Períodos académicos registrados en el sistema. Define los términos en los que estudiantes y profesores participan.',
            count: counts.semestres,
            icon: Calendar,
            href: '/dashboard/catalogs/semestres'
        },
        {
            id: 12,
            title: 'Condiciones de Trabajo',
            description: 'Tipos de condiciones laborales de los solicitantes. Permite clasificar la situación de empleo de cada persona.',
            count: counts.condiciones_trabajo,
            icon: Briefcase,
            href: '/dashboard/catalogs/condiciones-trabajo'
        },
        {
            id: 13,
            title: 'Condiciones de Actividad',
            description: 'Tipos de actividades económicas de los solicitantes. Complementa la información laboral y socioeconómica.',
            count: counts.condiciones_actividad,
            icon: Activity,
            href: '/dashboard/catalogs/condiciones-actividad'
        },
        {
            id: 14,
            title: 'Niveles Educativos',
            description: 'Niveles educativos de los solicitantes y jefes de hogar. Permite clasificar el nivel de educación alcanzado.',
            count: counts.niveles_educativos,
            icon: GraduationCap,
            href: '/dashboard/catalogs/niveles-educativos'
        }
    ];

    const filteredCatalogs = catalogs.filter(catalog =>
        catalog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        catalog.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Ordenar alfabéticamente por título
    const sortedCatalogs = filteredCatalogs.sort((a, b) => 
        a.title.localeCompare(b.title, 'es', { sensitivity: 'base' })
    );

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {sortedCatalogs.length > 0 ? (
                sortedCatalogs.map((catalog) => (
                    <CatalogCard
                        key={catalog.id}
                        title={catalog.title}
                        description={catalog.description}
                        count={catalog.count}
                        icon={catalog.icon}
                        href={catalog.href}
                    />
                ))
            ) : (
                <div className="col-span-full text-center py-12 text-gray-500">
                    No se encontraron catálogos que coincidan con "{searchQuery}"
                </div>
            )}
        </div>
    );
}
