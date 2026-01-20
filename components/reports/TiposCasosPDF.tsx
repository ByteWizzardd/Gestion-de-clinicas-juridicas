import React from 'react';
// @ts-ignore - React PDF types issue with React 19
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { CasosGroupedData } from '@/app/actions/reports';

// Registrar League Spartan desde archivos locales
// Los archivos están en: public/fonts/league-spartan/static/
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
        // Si no hay italic, usamos Regular como fallback
        src: '/fonts/league-spartan/static/LeagueSpartan-Regular.ttf',
        fontWeight: 400,
        fontStyle: 'italic',
      },
      {
        src: '/fonts/league-spartan/static/LeagueSpartan-Bold.ttf',
        fontWeight: 700,
        fontStyle: 'normal',
      },
      {
        // SemiBold (600) - usar Bold como aproximación si no existe
        src: '/fonts/league-spartan/static/LeagueSpartan-Bold.ttf',
        fontWeight: 600,
        fontStyle: 'normal',
      },
      {
        // Si no hay BoldItalic, usamos Bold como fallback
        src: '/fonts/league-spartan/static/LeagueSpartan-Bold.ttf',
        fontWeight: 700,
        fontStyle: 'italic',
      },
    ],
  });
} catch (error) {
  console.warn('No se pudo cargar League Spartan, usando Helvetica como fallback');
}

interface TiposCasosPDFProps {
  data: CasosGroupedData[];
  fechaInicio?: string;
  fechaFin?: string;
  chartImages?: Record<string, string>;
  logoBase64?: string; // Logo en base64 para preservar transparencia
  term?: string;
}

// Colores exactos del diseño de Figma (debe coincidir con pdf-generator-react.ts)
const CHART_COLORS = [
  '#8979ff', '#ff928a', '#3cc3df', '#ffae4c', '#537ff1',
  '#6fd195', '#8c63da', '#2bb7dc', '#1f94ff', '#f4cf3b',
  '#55c4ae', '#6186cc',
];

// Estilos del PDF - Ajustados para A4 landscape (842x595 puntos)
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20,
    fontFamily: 'League Spartan',
    overflow: 'hidden', // Evitar desbordamiento que cause páginas adicionales
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
    marginBottom: 15,
    borderRadius: 5,
    width: '80%',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 18,
    fontWeight: 700, // Bold
    fontStyle: 'normal', // NO italic
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'League Spartan',
  },
  // Subtítulo (Materia - Categoría)
  sectionTitle: {
    fontSize: 18,
    fontWeight: 600, // SemiBold
    color: '#000000',
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'League Spartan',
  },
  // Contenedor centrado verticalmente para páginas sin encabezado
  centeredContent: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    width: '100%',
    minHeight: '100%',
  },
  // Título de sección para páginas sin encabezado (sin margen inferior)
  sectionTitleCentered: {
    fontSize: 18,
    fontWeight: 600, // SemiBold
    color: '#000000',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'League Spartan',
  },
  // Contenedor del gráfico
  chartContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 10,
    maxHeight: 400, // Limitar altura máxima para evitar desbordamiento
  },
  // Contenedor del gráfico para páginas centradas (sin margen superior)
  chartContainerCentered: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 0,
    maxHeight: 400,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  chartImage: {
    width: 750,
    height: 500,
    objectFit: 'contain',
  },
  // Leyenda inferior
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    marginRight: 15,
    marginTop: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  legendText: {
    fontSize: 10,
    color: '#000000',
    opacity: 0.7,
    fontFamily: 'Helvetica', // Inter no está disponible, usamos Helvetica
    fontWeight: 400, // Regular
  },
});

/**
 * Agrupa los datos por materia y subcategoría
 */
function groupDataByMateriaSubcategoria(
  data: CasosGroupedData[]
): Record<string, CasosGroupedData[]> {
  const grouped: Record<string, CasosGroupedData[]> = {};

  for (const item of data) {
    const categoria = item.nombre_categoria?.trim() || '';
    const subcategoria = item.nombre_subcategoria?.trim() || '';

    const hasCategoria = categoria && categoria.toLowerCase() !== 'sin categoría';
    const hasSubcategoria = subcategoria && subcategoria.toLowerCase() !== 'sin subcategoría';

    let key = item.nombre_materia;
    if (hasCategoria && hasSubcategoria) {
      // Si hay ambas: "Materia - Categoría Subcategoría" (sin guión entre categoría y subcategoría)
      key += ` - ${categoria} ${subcategoria}`;
    } else if (hasCategoria) {
      // Si solo hay categoría: "Materia - Categoría"
      key += ` - ${categoria}`;
    } else if (hasSubcategoria) {
      // Si solo hay subcategoría: "Materia - Subcategoría"
      key += ` - ${subcategoria}`;
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(item);
  }

  return grouped;
}

/**
 * Formatea el título del grupo (solo muestra categoría/subcategoría si existen)
 */
function formatGroupTitle(item: CasosGroupedData): string {
  let title = item.nombre_materia;

  const categoria = item.nombre_categoria?.trim();
  const subcategoria = item.nombre_subcategoria?.trim();

  const hasCategoria = categoria && categoria.toLowerCase() !== 'sin categoría';
  const hasSubcategoria = subcategoria && subcategoria.toLowerCase() !== 'sin subcategoría';

  if (hasCategoria && hasSubcategoria) {
    // Si hay ambas: "Materia - Categoría Subcategoría" (sin guión entre categoría y subcategoría)
    title += ` - ${categoria} ${subcategoria}`;
  } else if (hasCategoria) {
    // Si solo hay categoría: "Materia - Categoría"
    title += ` - ${categoria}`;
  } else if (hasSubcategoria) {
    // Si solo hay subcategoría: "Materia - Subcategoría"
    title += ` - ${subcategoria}`;
  }

  return title;
}

/**
 * Formatea una fecha a DD/MM/YYYY
 */
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

export const TiposCasosPDF: React.FC<TiposCasosPDFProps> = ({
  data,
  fechaInicio,
  fechaFin,
  chartImages = {},
  logoBase64,
  term
}) => {
  const groupedData = groupDataByMateriaSubcategoria(data);

  return (
    // @ts-ignore - React PDF types issue
    <Document>
      {Object.entries(groupedData).map(([key, groupData], pageIndex) => {
        const pieData = {
          labels: groupData.map(item => item.nombre_ambito_legal),
          values: groupData.map(item => item.cantidad_casos),
          colors: CHART_COLORS.slice(0, groupData.length),
        };
        const chartImage = chartImages[key] || '';
        const isFirstPage = pageIndex === 0;

        return (
          // @ts-ignore - React PDF types issue
          <Page key={key} size="A4" orientation="landscape" style={styles.page}>
            {/* Header con logo - EN TODAS LAS PÁGINAS */}
            {/* @ts-ignore */}
            <View style={styles.header}>
              {/* @ts-ignore */}
              <Image
                src={logoBase64 || "/logo clinica juridica.png"}
                style={styles.logo}
              />
            </View>

            {isFirstPage ? (
              <>
                {/* Banner rojo con título y fechas - Solo en la primera página */}
                {/* @ts-ignore */}
                <View style={styles.titleBanner}>
                  {/* @ts-ignore */}
                  <Text style={styles.titleText}>
                    Tipos de Caso{term ? ` Semestre ${term}` : (fechaInicio && fechaFin ? ` ${formatDate(fechaInicio)} - ${formatDate(fechaFin)}` : '')}
                  </Text>
                </View>

                {/* Subtítulo (Materia - Categoría - Subcategoría) */}
                {/* @ts-ignore */}
                <Text style={styles.sectionTitle}>
                  {formatGroupTitle(groupData[0])}
                </Text>

                {/* Gráfico */}
                {/* @ts-ignore */}
                <View style={styles.chartContainer}>
                  {/* @ts-ignore */}
                  <View style={styles.chartWrapper}>
                    {chartImage && (
                      // @ts-ignore
                      <Image src={chartImage} style={styles.chartImage} />
                    )}
                  </View>

                  {/* Leyenda inferior */}
                  {/* @ts-ignore */}
                  <View style={styles.legendContainer}>
                    {groupData.map((item, index) => (
                      // @ts-ignore
                      <View key={index} style={styles.legendItem}>
                        {/* @ts-ignore */}
                        <View
                          style={[
                            styles.legendDot,
                            { backgroundColor: pieData.colors[index] },
                          ]}
                        />
                        {/* @ts-ignore */}
                        <Text style={styles.legendText}>
                          {item.nombre_ambito_legal}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            ) : (
              <>
                {/* Contenido centrado verticalmente para páginas sin encabezado */}
                {/* @ts-ignore */}
                <View style={styles.centeredContent}>
                  {/* Subtítulo (Materia - Categoría - Subcategoría) */}
                  {/* @ts-ignore */}
                  <Text style={styles.sectionTitleCentered}>
                    {formatGroupTitle(groupData[0])}
                  </Text>

                  {/* Gráfico */}
                  {/* @ts-ignore */}
                  <View style={styles.chartContainerCentered}>
                    {/* @ts-ignore */}
                    <View style={styles.chartWrapper}>
                      {chartImage && (
                        // @ts-ignore
                        <Image src={chartImage} style={styles.chartImage} />
                      )}
                    </View>

                    {/* Leyenda inferior */}
                    {/* @ts-ignore */}
                    <View style={styles.legendContainer}>
                      {groupData.map((item, index) => (
                        // @ts-ignore
                        <View key={index} style={styles.legendItem}>
                          {/* @ts-ignore */}
                          <View
                            style={[
                              styles.legendDot,
                              { backgroundColor: pieData.colors[index] },
                            ]}
                          />
                          {/* @ts-ignore */}
                          <Text style={styles.legendText}>
                            {item.nombre_ambito_legal}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </>
            )}
          </Page>
        );
      })}
    </Document>
  );
};
