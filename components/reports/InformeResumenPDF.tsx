import React from 'react';
// @ts-ignore - React PDF types issue with React 19
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { CasosGroupedData } from '@/app/actions/reports';

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
  console.warn('No se pudo cargar League Spartan, usando Helvetica como fallback');
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
  console.warn('No se pudo cargar Inter, usando Helvetica como fallback');
}

export interface InformeResumenData {
  casosPorMateria: Array<{
    id_materia: number;
    num_categoria: number;
    num_subcategoria: number;
    nombre_materia: string;
    nombre_categoria: string;
    nombre_subcategoria: string;
    cantidad_casos: number;
  }>;
  solicitantesPorGenero: Array<{ genero: string; cantidad_solicitantes: number }>;
  solicitantesPorEstado: Array<{ nombre_estado: string; cantidad_solicitantes: number }>;
  solicitantesPorParroquia: Array<{ nombre_parroquia: string; cantidad_solicitantes: number }>;
  casosPorAmbitoLegal: Array<{ nombre_ambito_legal: string; cantidad_casos: number }>;
  estudiantesPorMateria: Array<{
    nombre_materia: string;
    nombre_categoria: string | null;
    nombre_subcategoria: string | null;
    cantidad_estudiantes: number
  }>;
  profesoresPorMateria: Array<{
    nombre_materia: string;
    nombre_categoria: string | null;
    nombre_subcategoria: string | null;
    cantidad_profesores: number
  }>;
  tiposDeCaso: CasosGroupedData[];
  beneficiariosPorTipo: Array<{
    tipo_beneficiario: string;
    id_materia: number;
    num_categoria: number;
    num_subcategoria: number;
    nombre_materia: string;
    nombre_categoria: string;
    nombre_subcategoria: string;
    cantidad_beneficiarios: number;
  }>;
  beneficiariosPorParentesco: Array<{ parentesco: string; cantidad_beneficiarios: number }>;
}

interface InformeResumenPDFProps {
  data: InformeResumenData;
  fechaInicio?: string;
  fechaFin?: string;
  chartImages: {
    casosPorMateria?: string;
    solicitantesPorGenero?: string;
    solicitantesPorEstado?: string;
    solicitantesPorParroquia?: string;
    casosPorAmbitoLegal?: string;
    estudiantesPorMateria?: Record<string, string>;
    profesoresPorMateria?: Record<string, string>;
    tiposDeCaso?: Record<string, string>;
    beneficiariosDirectos?: string;
    beneficiariosIndirectos?: string;
    beneficiariosPorParentesco?: string;
  };
  logoBase64?: string;
  portadaBase64?: string;
  term?: string;
}

// Colores para gráficos de barras
const BAR_CHART_COLORS = [
  '#8979ff', '#ff928a', '#3cc3df', '#ffae4c', '#537ff1',
  '#6fd195', '#8c63da', '#2bb7dc', '#1f94ff', '#f4cf3b',
  '#55c4ae', '#6186cc',
];

// Colores para pie chart (igual que TiposCasosPDF)
const CHART_COLORS = [
  '#8979ff', '#ff928a', '#3cc3df', '#ffae4c', '#537ff1',
  '#6fd195', '#8c63da', '#2bb7dc', '#1f94ff', '#f4cf3b',
  '#55c4ae', '#6186cc',
];

// Estilos del PDF
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#000000',
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'League Spartan',
  },
  sectionTitleCentered: {
    fontSize: 18,
    fontWeight: 600,
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'League Spartan',
  },
  totalText: {
    fontSize: 12,
    fontWeight: 400,
    color: 'rgba(0, 0, 0, 0.7)',
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'Inter',
  },
  centeredContent: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingTop: 10, // Reducir padding superior
    paddingBottom: 10, // Reducir padding inferior
  },
  chartContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 10,
    maxHeight: 400, // Limitar altura máxima para evitar desbordamiento (igual que TiposCasosPDF)
  },
  // Contenedor para diagramas de barras centrados verticalmente
  chartContainerBarChart: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 5, // Reducir margen superior
    maxHeight: 380, // Limitar altura máxima para evitar desbordamiento
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
    height: 400, // Reducir altura para evitar salto de página
    objectFit: 'contain',
  },
  chartImageSmall: {
    width: 700,
    height: 380, // Reducir altura para evitar salto de página
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
  coverPage: {
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0, // Quitamos el padding para que la imagen se ajuste mejor al formato vertical
    backgroundColor: '#FFFFFF',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain', // Mantiene la proporción sin recortar
  },
});

/**
 * Formatea una fecha a DD/MM/YYYY
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Formatea el título del grupo (Materia - Categoría - Subcategoría)
 */
function formatGroupTitle(item: {
  nombre_materia: string;
  nombre_categoria?: string | null;
  nombre_subcategoria?: string | null;
}): string {
  let title = item.nombre_materia;

  const categoria = item.nombre_categoria?.trim();
  const subcategoria = item.nombre_subcategoria?.trim();

  const hasCategoria = categoria && categoria.toLowerCase() !== 'sin categoría';
  const hasSubcategoria = subcategoria && subcategoria.toLowerCase() !== 'sin subcategoría';

  if (hasCategoria && hasSubcategoria) {
    title += ` - ${categoria} ${subcategoria}`;
  } else if (hasCategoria) {
    title += ` - ${categoria}`;
  } else if (hasSubcategoria) {
    title += ` - ${subcategoria}`;
  }

  return title;
}

/**
 * Agrupa los datos por materia y subcategoría (igual que TiposCasosPDF)
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
      key += ` - ${categoria} ${subcategoria}`;
    } else if (hasCategoria) {
      key += ` - ${categoria}`;
    } else if (hasSubcategoria) {
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
 * Agrupa beneficiarios por materia y subcategoría (igual que tipos de caso)
 */
function groupBeneficiariosByMateriaSubcategoria(
  data: InformeResumenData['beneficiariosPorTipo']
): Record<string, InformeResumenData['beneficiariosPorTipo']> {
  const grouped: Record<string, InformeResumenData['beneficiariosPorTipo']> = {};

  for (const item of data) {
    const categoria = item.nombre_categoria?.trim() || '';
    const subcategoria = item.nombre_subcategoria?.trim() || '';

    const hasCategoria = categoria && categoria.toLowerCase() !== 'sin categoría';
    const hasSubcategoria = subcategoria && subcategoria.toLowerCase() !== 'sin subcategoría';

    let key = item.nombre_materia;
    if (hasCategoria && hasSubcategoria) {
      key += ` - ${categoria} ${subcategoria}`;
    } else if (hasCategoria) {
      key += ` - ${categoria}`;
    } else if (hasSubcategoria) {
      key += ` - ${subcategoria}`;
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(item);
  }

  return grouped;
}

export const InformeResumenPDF: React.FC<InformeResumenPDFProps> = ({
  data,
  fechaInicio,
  fechaFin,
  chartImages,
  logoBase64,
  portadaBase64,
  term
}) => {
  // Componente reutilizable para el encabezado con logo
  const ReportHeader = () => (
    // @ts-ignore
    <View style={styles.header}>
      {/* @ts-ignore */}
      <Image
        src={logoBase64 || "/logo clinica juridica.png"}
        style={styles.logo}
      />
    </View>
  );

  // PRIMERO: Tipos de Caso (igual que el reporte de tipos de caso)
  const tiposDeCasoGrouped = data.tiposDeCaso && data.tiposDeCaso.length > 0
    ? groupDataByMateriaSubcategoria(data.tiposDeCaso)
    : {};

  return (
    // @ts-ignore - React PDF types issue
    <Document>
      {/* PORTADA - Primera hoja */}
      {portadaBase64 && (
        // @ts-ignore
        <Page size="A4" orientation="portrait" style={styles.coverPage}>
          {/* @ts-ignore */}
          <Image src={portadaBase64} style={styles.coverImage} />
        </Page>
      )}

      {/* PRIMERO: Páginas de Tipos de Caso (igual que el reporte de tipos de caso) */}
      {Object.entries(tiposDeCasoGrouped).map(([key, groupData], pageIndex) => {
        const chartImage = chartImages.tiposDeCaso?.[key] || '';
        const isFirstPage = pageIndex === 0;
        const pieData = {
          labels: groupData.map(item => item.nombre_ambito_legal),
          values: groupData.map(item => item.cantidad_casos),
          colors: CHART_COLORS.slice(0, groupData.length),
        };

        return (
          // @ts-ignore
          <Page key={key} size="A4" orientation="landscape" style={styles.page}>
            {isFirstPage ? (
              <>
                {/* Header con logo */}
                <ReportHeader />

                {/* Banner rojo con título - Solo en la primera página */}
                {/* @ts-ignore */}
                <View style={styles.titleBanner}>
                  {/* @ts-ignore */}
                  <Text style={styles.titleText}>
                    Informe Resumen de Casos{term ? ` Semestre ${term}` : (fechaInicio && fechaFin ? ` ${formatDate(fechaInicio)} - ${formatDate(fechaFin)}` : '')}
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
                {/* Header con logo */}
                <ReportHeader />

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

      {/* DESPUÉS: Páginas con otras gráficas - UNA POR PÁGINA */}
      {/* Página: Casos por Materia */}
      {chartImages.casosPorMateria && data.casosPorMateria && (
        // @ts-ignore
        <Page size="A4" orientation="landscape" style={styles.page}>
          <ReportHeader />
          {/* @ts-ignore */}
          <View style={styles.centeredContent}>
            {/* @ts-ignore */}
            <Text style={styles.sectionTitleCentered}>Casos por Materia</Text>
            {/* @ts-ignore */}
            <Text style={styles.totalText}>
              Total de Casos: {data.casosPorMateria.reduce((sum, item) => sum + Number(item.cantidad_casos || 0), 0)}
            </Text>
            {/* @ts-ignore */}
            <View style={styles.chartContainerBarChart}>
              {/* @ts-ignore */}
              <View style={styles.chartWrapper}>
                {/* @ts-ignore */}
                <Image src={chartImages.casosPorMateria} style={styles.chartImageSmall} />
              </View>
            </View>
          </View>
        </Page>
      )}

      {/* Página: Solicitantes por Género */}
      {chartImages.solicitantesPorGenero && data.solicitantesPorGenero && (
        // @ts-ignore
        <Page size="A4" orientation="landscape" style={styles.page}>
          <ReportHeader />
          {/* @ts-ignore */}
          <View style={styles.centeredContent}>
            {/* @ts-ignore */}
            <Text style={styles.sectionTitleCentered}>Solicitantes por Género</Text>
            {/* @ts-ignore */}
            <Text style={styles.totalText}>
              Total de Solicitantes: {data.solicitantesPorGenero.reduce((sum, item) => sum + Number(item.cantidad_solicitantes || 0), 0)}
            </Text>
            {/* @ts-ignore */}
            <View style={styles.chartContainerBarChart}>
              {/* @ts-ignore */}
              <View style={styles.chartWrapper}>
                {/* @ts-ignore */}
                <Image src={chartImages.solicitantesPorGenero} style={styles.chartImageSmall} />
              </View>
            </View>
          </View>
        </Page>
      )}

      {/* Página: Solicitantes por Estado */}
      {chartImages.solicitantesPorEstado && data.solicitantesPorEstado && (
        // @ts-ignore
        <Page size="A4" orientation="landscape" style={styles.page}>
          <ReportHeader />
          {/* @ts-ignore */}
          <View style={styles.centeredContent}>
            {/* @ts-ignore */}
            <Text style={styles.sectionTitleCentered}>Solicitantes por Estado</Text>
            {/* @ts-ignore */}
            <Text style={styles.totalText}>
              Total de Solicitantes: {data.solicitantesPorEstado.reduce((sum, item) => sum + Number(item.cantidad_solicitantes || 0), 0)}
            </Text>
            {/* @ts-ignore */}
            <View style={styles.chartContainerBarChart}>
              {/* @ts-ignore */}
              <View style={styles.chartWrapper}>
                {/* @ts-ignore */}
                <Image src={chartImages.solicitantesPorEstado} style={styles.chartImageSmall} />
              </View>
            </View>
          </View>
        </Page>
      )}

      {/* Página: Solicitantes por Parroquia */}
      {chartImages.solicitantesPorParroquia && data.solicitantesPorParroquia && (
        // @ts-ignore
        <Page size="A4" orientation="landscape" style={styles.page}>
          <ReportHeader />
          {/* @ts-ignore */}
          <View style={styles.centeredContent}>
            {/* @ts-ignore */}
            <Text style={styles.sectionTitleCentered}>Solicitantes por Parroquia</Text>
            {/* @ts-ignore */}
            <Text style={styles.totalText}>
              Total de Solicitantes: {data.solicitantesPorParroquia.reduce((sum, item) => sum + Number(item.cantidad_solicitantes || 0), 0)}
            </Text>
            {/* @ts-ignore */}
            <View style={styles.chartContainerBarChart}>
              {/* @ts-ignore */}
              <View style={styles.chartWrapper}>
                {/* @ts-ignore */}
                <Image src={chartImages.solicitantesPorParroquia} style={styles.chartImageSmall} />
              </View>
            </View>
          </View>
        </Page>
      )}

      {/* Página: Beneficiarios Directos (un solo diagrama de barras) */}
      {chartImages.beneficiariosDirectos && data.beneficiariosPorTipo && (
        // @ts-ignore
        <Page size="A4" orientation="landscape" style={styles.page}>
          <ReportHeader />
          {/* @ts-ignore */}
          <View style={styles.centeredContent}>
            {/* @ts-ignore */}
            <Text style={styles.sectionTitleCentered}>Beneficiarios Directos</Text>
            {/* @ts-ignore */}
            <Text style={styles.totalText}>
              Total de Beneficiarios Directos: {data.beneficiariosPorTipo
                .filter(item => item.tipo_beneficiario === 'Directo')
                .reduce((sum, item) => sum + Number(item.cantidad_beneficiarios || 0), 0)}
            </Text>
            {/* @ts-ignore */}
            <View style={styles.chartContainerBarChart}>
              {/* @ts-ignore */}
              <View style={styles.chartWrapper}>
                {/* @ts-ignore */}
                <Image src={chartImages.beneficiariosDirectos} style={styles.chartImageSmall} />
              </View>
            </View>
          </View>
        </Page>
      )}

      {/* Página: Beneficiarios Indirectos (un solo diagrama de barras) */}
      {chartImages.beneficiariosIndirectos && data.beneficiariosPorTipo && (
        // @ts-ignore
        <Page size="A4" orientation="landscape" style={styles.page}>
          <ReportHeader />
          {/* @ts-ignore */}
          <View style={styles.centeredContent}>
            {/* @ts-ignore */}
            <Text style={styles.sectionTitleCentered}>Beneficiarios Indirectos</Text>
            {/* @ts-ignore */}
            <Text style={styles.totalText}>
              Total de Beneficiarios Indirectos: {data.beneficiariosPorTipo
                .filter(item => item.tipo_beneficiario === 'Indirecto')
                .reduce((sum, item) => sum + Number(item.cantidad_beneficiarios || 0), 0)}
            </Text>
            {/* @ts-ignore */}
            <View style={styles.chartContainerBarChart}>
              {/* @ts-ignore */}
              <View style={styles.chartWrapper}>
                {/* @ts-ignore */}
                <Image src={chartImages.beneficiariosIndirectos} style={styles.chartImageSmall} />
              </View>
            </View>
          </View>
        </Page>
      )}

      {/* Página: Beneficiarios por Parentesco */}
      {chartImages.beneficiariosPorParentesco && data.beneficiariosPorParentesco && (
        // @ts-ignore
        <Page size="A4" orientation="landscape" style={styles.page}>
          <ReportHeader />
          {/* @ts-ignore */}
          <View style={styles.centeredContent}>
            {/* @ts-ignore */}
            <Text style={styles.sectionTitleCentered}>Beneficiarios por Parentesco</Text>
            {/* @ts-ignore */}
            <Text style={styles.totalText}>
              Total de Beneficiarios: {data.beneficiariosPorParentesco.reduce((sum, item) => sum + Number(item.cantidad_beneficiarios || 0), 0)}
            </Text>
            {/* @ts-ignore */}
            <View style={styles.chartContainerBarChart}>
              {/* @ts-ignore */}
              <View style={styles.chartWrapper}>
                {/* @ts-ignore */}
                <Image src={chartImages.beneficiariosPorParentesco} style={styles.chartImageSmall} />
              </View>
            </View>
          </View>
        </Page>
      )}

      {/* Página: Estudiantes Involucrados (un solo diagrama con todas las materias) */}
      {data.estudiantesPorMateria && chartImages.estudiantesPorMateria?.total && (
        // @ts-ignore
        <Page size="A4" orientation="landscape" style={styles.page}>
          <ReportHeader />
          {/* @ts-ignore */}
          <View style={styles.centeredContent}>
            {/* @ts-ignore */}
            <Text style={styles.sectionTitleCentered}>Estudiantes Involucrados</Text>
            {/* @ts-ignore */}
            <Text style={styles.totalText}>
              Total de Estudiantes Involucrados: {data.estudiantesPorMateria.reduce((sum, item) => sum + Number(item.cantidad_estudiantes || 0), 0)}
            </Text>
            {/* @ts-ignore */}
            <View style={styles.chartContainerBarChart}>
              {/* @ts-ignore */}
              <View style={styles.chartWrapper}>
                {/* @ts-ignore */}
                <Image src={chartImages.estudiantesPorMateria.total} style={styles.chartImageSmall} />
              </View>
            </View>
          </View>
        </Page>
      )}

      {/* Página: Profesores Involucrados (un solo diagrama con todas las materias) */}
      {data.profesoresPorMateria && chartImages.profesoresPorMateria?.total && (
        // @ts-ignore
        <Page size="A4" orientation="landscape" style={styles.page}>
          <ReportHeader />
          {/* @ts-ignore */}
          <View style={styles.centeredContent}>
            {/* @ts-ignore */}
            <Text style={styles.sectionTitleCentered}>Profesores Involucrados</Text>
            {/* @ts-ignore */}
            <Text style={styles.totalText}>
              Total de Profesores Involucrados: {data.profesoresPorMateria.reduce((sum, item) => sum + Number(item.cantidad_profesores || 0), 0)}
            </Text>
            {/* @ts-ignore */}
            <View style={styles.chartContainerBarChart}>
              {/* @ts-ignore */}
              <View style={styles.chartWrapper}>
                {/* @ts-ignore */}
                <Image src={chartImages.profesoresPorMateria.total} style={styles.chartImageSmall} />
              </View>
            </View>
          </View>
        </Page>
      )}
    </Document>
  );
};

