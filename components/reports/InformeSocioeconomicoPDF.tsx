import React from 'react';
// @ts-ignore - React PDF types issue with React 19
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { SocioeconomicoData } from '@/app/actions/reports';

// Registrar League Spartan desde archivos locales
try {
    Font.register({
        family: 'League Spartan',
        fonts: [
            {
                src: '/fonts/league-spartan/static/LeagueSpartan-Regular.ttf',
                fontWeight: 400,
                fontStyle: 'normal',
            },
            {
                src: '/fonts/league-spartan/static/LeagueSpartan-Bold.ttf',
                fontWeight: 700,
                fontStyle: 'normal',
            },
            {
                src: '/fonts/league-spartan/static/LeagueSpartan-Bold.ttf',
                fontWeight: 600,
                fontStyle: 'normal',
            },
        ],
    });
} catch (error) {
    console.warn('No se pudo cargar League Spartan');
}

// Registrar Inter desde archivos locales
try {
    Font.register({
        family: 'Inter',
        fonts: [
            {
                src: '/fonts/Inter/static/Inter_18pt-Regular.ttf',
                fontWeight: 400,
                fontStyle: 'normal',
            },
        ],
    });
} catch (error) {
    console.warn('No se pudo cargar Inter');
}

interface InformeSocioeconomicoPDFProps {
    data: SocioeconomicoData;
    fechaInicio?: string;
    fechaFin?: string;
    chartImages?: Record<string, string>;
    logoBase64?: string;
    term?: string;
}

// Estilos del PDF - Ajustados para A4 landscape (842x595 puntos) - IGUAL QUE TiposCasosPDF
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 20,
        fontFamily: 'League Spartan',
        overflow: 'hidden',
    },
    // Header con logo
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 15,
        backgroundColor: 'transparent',
    },
    logo: {
        width: 200,
        height: 35,
        objectFit: 'contain',
    },
    // Banner rojo con título y fechas
    titleBanner: {
        backgroundColor: '#9c2327',
        paddingVertical: 5,
        paddingHorizontal: 20,
        marginBottom: 10,
        borderRadius: 5,
        width: '80%',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleText: {
        fontSize: 18,
        fontWeight: 700,
        fontStyle: 'normal',
        color: '#FFFFFF',
        textAlign: 'center',
        fontFamily: 'League Spartan',
    },
    // Subtítulo (sección)
    sectionTitle: {
        fontSize: 18,
        fontWeight: 600,
        color: '#000000',
        marginBottom: 8,
        textAlign: 'center',
        fontFamily: 'League Spartan',
    },
    // Texto de total (estilo InformeResumenPDF)
    totalText: {
        fontSize: 12,
        fontWeight: 400,
        color: 'rgba(0, 0, 0, 0.7)',
        marginBottom: 10,
        textAlign: 'center',
        fontFamily: 'Inter',
    },
    // Contenedor del gráfico
    chartContainer: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 5,
        maxHeight: 380,
    },
    chartWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    chartImage: {
        width: 750,
        height: 380,
        objectFit: 'contain',
    },
    // Estilo para gráficos agrupados (más altos)
    chartImageLarge: {
        width: 750,
        height: 480,
        objectFit: 'contain',
    },
    chartContainerLarge: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 5,
        maxHeight: 480,
    },
    // Contenedor para páginas posteriores
    centeredContent: {
        flexDirection: 'column',
        width: '100%',
    }
});

function formatDate(dateStr: string): string {
    if (!dateStr) return '';
    if (dateStr.includes('-')) {
        const [year, month, day] = dateStr.split('T')[0].split('-');
        return `${day}/${month}/${year}`;
    }
    const date = new Date(dateStr);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
}

const InformeSocioeconomicoPDF: React.FC<InformeSocioeconomicoPDFProps> = ({
    data,
    fechaInicio,
    fechaFin,
    chartImages = {},
    logoBase64,
    term
}) => {
    // 1. Definir secciones base (Demográfico -> Económico -> Hogar)
    const baseSections = [
        // 1. Datos Personales/Demográficos
        { key: 'genero', title: 'Género', dataKey: 'distribucionPorGenero', totalLabel: 'Solicitantes' },
        { key: 'edad', title: 'Rango de Edad', dataKey: 'distribucionPorEdad', totalLabel: 'Solicitantes' },
        { key: 'estadoCivil', title: 'Estado Civil', dataKey: 'distribucionPorEstadoCivil', totalLabel: 'Solicitantes' },
        { key: 'nivelEducativo', title: 'Nivel Educativo', dataKey: 'distribucionPorNivelEducativo', totalLabel: 'Solicitantes' },

        // 2. Situación Laboral y Económica
        { key: 'condicionTrabajo', title: 'Condición de Trabajo', dataKey: 'distribucionPorCondicionTrabajo', totalLabel: 'Solicitantes' },
        { key: 'condicionActividad', title: 'Condición de Actividad', dataKey: 'distribucionPorCondicionActividad', totalLabel: 'Solicitantes' },
        { key: 'ingresos', title: 'Rangos de Ingresos (en dólares)', dataKey: 'distribucionPorIngresos', totalLabel: 'Solicitantes' },

        // 3. Entorno Familiar y Vivienda
        { key: 'tamanoHogar', title: 'Tamaño del Hogar', dataKey: 'distribucionPorTamanoHogar', totalLabel: 'Solicitantes' },
        { key: 'ninosHogar', title: 'Niños en el Hogar', dataKey: 'distribucionPorNinosHogar', totalLabel: 'Solicitantes' },
        { key: 'trabajadoresHogar', title: 'Trabajadores en el Hogar', dataKey: 'distribucionPorTrabajadoresHogar', totalLabel: 'Solicitantes' },
        { key: 'dependientes', title: 'Dependientes en el Hogar (No trabajan)', dataKey: 'distribucionPorDependientes', totalLabel: 'Solicitantes' },
        { key: 'habitaciones', title: 'Cantidad de Habitaciones', dataKey: 'distribucionPorHabitaciones', totalLabel: 'Solicitantes' },
        { key: 'banos', title: 'Cantidad de Baños', dataKey: 'distribucionPorBanos', totalLabel: 'Solicitantes' },
    ];

    // 2. Identificar secciones dinámicas de Características de Vivienda
    const housingSections: any[] = [];
    if (data.distribucionPorCaracteristicasVivienda?.length > 0) {
        // Definir el orden de prioridad para las características de vivienda
        const priorityOrder = [
            'tipo de vivienda',
            'tipo_vivienda',
            'agua potable',
            'aseo',
            'eliminación aguas negras'
        ];

        // Obtener tipos únicos y ordenar
        const types = Array.from(new Set(data.distribucionPorCaracteristicasVivienda.map(item => item.nombre_tipo_caracteristica)))
            .sort((a, b) => {
                const indexA = priorityOrder.findIndex(p => a.toLowerCase().includes(p));
                const indexB = priorityOrder.findIndex(p => b.toLowerCase().includes(p));

                // Si ambos están en la prioridad, usar el índice de prioridad
                if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                // Si solo uno está, ese va primero
                if (indexA !== -1) return -1;
                if (indexB !== -1) return 1;
                // Si ninguno está, orden alfabético
                return a.localeCompare(b);
            });

        types.forEach(type => {
            const key = `caract_${type.replace(/\s+/g, '_').toLowerCase()}`;
            if (chartImages[key]) {
                housingSections.push({
                    key,
                    title: type,
                    totalLabel: 'Solicitantes',
                    // Para el cálculo del total basado en esta sección específica
                    isDynamicHousing: true,
                    typeName: type
                });
            }
        });
    }


    // 3. Unir todas las secciones en el orden exacto solicitado:
    // Hogar -> Tipo de Vivienda -> Habitaciones/Baños -> Otras Características
    const householdSections = baseSections.filter(s => ['tamanoHogar', 'ninosHogar', 'trabajadoresHogar', 'dependientes'].includes(s.key));
    const roomsBanosSections = baseSections.filter(s => ['habitaciones', 'banos'].includes(s.key));
    const otherBaseSections = baseSections.filter(s => !['tamanoHogar', 'ninosHogar', 'trabajadoresHogar', 'dependientes', 'habitaciones', 'banos'].includes(s.key));

    const tipoViviendaSection = housingSections.filter(s =>
        s.title.toLowerCase().includes('tipo de vivienda') || s.title.toLowerCase().includes('tipo_vivienda')
    );
    const otherHousingSections = housingSections.filter(s =>
        !(s.title.toLowerCase().includes('tipo de vivienda') || s.title.toLowerCase().includes('tipo_vivienda'))
    );

    const allSections = [
        ...otherBaseSections, // Incluye demográficos y la nueva sección laboral fusionada
        ...householdSections,
        ...tipoViviendaSection,
        ...roomsBanosSections,
        ...otherHousingSections
    ];

    // Filtrar secciones que tienen datos/imágenes
    const activeSections = allSections.filter(section => chartImages[section.key]);

    return (
        // @ts-ignore
        <Document title="Informe Socioeconómico">
            {activeSections.map((section, index) => {
                const isFirstPage = index === 0;

                // Calcular el total para esta sección
                // @ts-ignore
                let total = 0;
                // @ts-ignore
                if (section.isDynamicHousing) {
                    total = (data.distribucionPorCaracteristicasVivienda || [])
                        // @ts-ignore
                        .filter(item => item.nombre_tipo_caracteristica === section.typeName)
                        .reduce((sum: number, item: any) => sum + Number(item.cantidad_solicitantes || 0), 0);
                } else {
                    // @ts-ignore
                    const sectionData = data[section.dataKey] || [];
                    total = sectionData.reduce((sum: number, item: any) => sum + Number(item.cantidad_solicitantes || 0), 0);
                }

                return (
                    // @ts-ignore
                    <Page key={section.key} size="A4" orientation="landscape" style={styles.page}>
                        {/* Header con logo (siempre arriba) */}
                        {/* @ts-ignore */}
                        <View style={styles.header}>
                            {/* @ts-ignore */}
                            <Image
                                src={logoBase64 || "/logo clinica juridica.png"}
                                style={styles.logo}
                            />
                        </View>

                        {/* Banner rojo (solo en la primera página activa) */}
                        {isFirstPage && (
                            // @ts-ignore
                            <View style={styles.titleBanner}>
                                {/* @ts-ignore */}
                                <Text style={styles.titleText}>
                                    Datos Socioeconómicos{term ? ` Semestre ${term}` : (fechaInicio && fechaFin ? ` ${formatDate(fechaInicio)} - ${formatDate(fechaFin)}` : '')}
                                </Text>
                            </View>
                        )}

                        {/* Contenido de la sección */}
                        {/* @ts-ignore */}
                        <View style={isFirstPage ? {} : styles.centeredContent}>
                            {/* Subtítulo de la sección */}
                            {/* @ts-ignore */}
                            <Text style={styles.sectionTitle}>
                                {section.title}
                            </Text>

                            {/* Total (Estilo InformeResumenPDF) */}
                            {/* @ts-ignore */}
                            <Text style={styles.totalText}>
                                Total de {section.totalLabel}: {total}
                            </Text>

                            {/* Contenedor del Gráfico */}
                            {/* @ts-ignore */}
                            <View style={section.key === 'serviciosBasicos' ? styles.chartContainerLarge : styles.chartContainer}>
                                {/* @ts-ignore */}
                                <View style={styles.chartWrapper}>
                                    {/* @ts-ignore */}
                                    <Image src={chartImages[section.key]} style={section.key === 'serviciosBasicos' ? styles.chartImageLarge : styles.chartImage} />
                                </View>
                            </View>
                        </View>
                    </Page>
                );
            })}
        </Document>
    );
};

export default InformeSocioeconomicoPDF;
