import React from 'react';
// @ts-ignore - React PDF types issue with React 19
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { logger } from '@/lib/utils/logger';

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
        src: '/fonts/league-spartan/static/LeagueSpartan-Bold.ttf',
        fontWeight: 600,
        fontStyle: 'normal',
      },
      {
        src: '/fonts/league-spartan/static/LeagueSpartan-Bold.ttf',
        fontWeight: 700,
        fontStyle: 'italic',
      },
    ],
  });
} catch (error) {
  logger.warn('No se pudo cargar League Spartan, usando Helvetica como fallback');
}

export interface EstatusGroupedData {
  nombre_estatus: string;
  cantidad_casos: number;
}

interface EstatusCasosPDFProps {
  data: EstatusGroupedData[];
  fechaInicio?: string;
  fechaFin?: string;
  chartImage?: string;
  logoBase64?: string;
  term?: string;
  isWordFormat?: boolean;
}

// Colores para los estatus (debe coincidir con pdf-generator-react.ts)
const ESTATUS_COLORS: Record<string, string> = {
  'En proceso': '#3b82f6', // Azul (blue-500)
  'Archivado': '#6b7280',  // Gris (gray-500)
  'Entregado': '#22c55e',  // Verde (green-500)
  'Asesoría': '#a855f7',   // Morado (purple-500)
};

// Estilos del PDF - Ajustados para A4 landscape (842x595 puntos)
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20,
    fontFamily: 'League Spartan',
    overflow: 'hidden',
  },
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
    fontWeight: 700,
    fontStyle: 'normal',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'League Spartan',
  },
  centeredContent: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    width: '100%',
    minHeight: '100%',
  },
  chartContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 10,
    maxHeight: 400,
  },
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
    fontFamily: 'Helvetica',
    fontWeight: 400,
  },
});

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

export const EstatusCasosPDF: React.FC<EstatusCasosPDFProps> = ({
  data,
  fechaInicio,
  fechaFin,
  chartImage,
  logoBase64,
  term,
  isWordFormat = false
}) => {
  // Obtener colores para cada estatus
  const pieData = {
    labels: data.map(item => item.nombre_estatus),
    values: data.map(item => item.cantidad_casos),
    colors: data.map(item => ESTATUS_COLORS[item.nombre_estatus] || '#9E9E9E'),
  };

  return (
    // @ts-ignore - React PDF types issue
    <Document>
      {/* Página en blanco vertical (solo para formato Word) */}
      {isWordFormat && (
        // @ts-ignore
        <Page size="A4" orientation="portrait" style={{ backgroundColor: '#FFFFFF' }} />
      )}

      {/* @ts-ignore */}
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header con logo */}
        {/* @ts-ignore */}
        <View style={styles.header}>
          {/* @ts-ignore */}
          <Image
            src={logoBase64 || "/logo clinica juridica.png"}
            style={styles.logo}
          />
        </View>

        {/* Banner rojo con título y fechas */}
        {/* @ts-ignore */}
        <View style={styles.titleBanner}>
          {/* @ts-ignore */}
          <Text style={styles.titleText}>
            Estatus de Casos{term ? ` Semestre ${term}` : (fechaInicio && fechaFin ? ` ${formatDate(fechaInicio)} - ${formatDate(fechaFin)}` : '')}
          </Text>
        </View>

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
            {data.map((item, index) => (
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
                  {item.nombre_estatus}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
};

