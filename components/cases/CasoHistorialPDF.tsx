'use client';

import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { formatDate } from '@/lib/utils/date-formatter';

/**
 * PDF Generator Excel "Historial de Caso"
 */

interface CasoHistorialPDFProps {
  data: {
    caso: any;
    acciones: any[];
    citas: any[];
    soportes: any[];
    beneficiarios: any[];
    equipo: any[];
    cambiosEstatus: any[];
  };
  logoBase64: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#000',
  },
  header: {
    marginBottom: 20,
    marginTop: 10,
  },
  logo: {
    width: 200,
    height: 60,
    objectFit: 'contain',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  mainTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 0,
    width: '100%',
  },
  sectionTitleMain: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 10,
    textTransform: 'uppercase',
  },
  sectionTitleSec: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 20,
    textTransform: 'uppercase',
  },
  // Form Rows
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    minHeight: 15,
  },
  // Text Styles
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    marginRight: 5,
  },
  valueText: {
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  // Box Styles
  underlinedField: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingHorizontal: 5,
    paddingVertical: 2,
    flexGrow: 1,
  },
  boxField: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 4,
    minHeight: 18,
    justifyContent: 'center',
  },
  smallBox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  largeTextBox: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 5,
    minHeight: 60,
    marginTop: 2,
    marginBottom: 10,
  },

  table: {
    width: '100%',
    marginBottom: 10,
    marginTop: 5,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCellHeader: {
    fontWeight: 'bold',
    fontSize: 10,
    padding: 2,
    width: '30%',
  },
  tableCellValue: {
    fontSize: 10,
    padding: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flex: 1,
  }
});

export function CasoHistorialPDF({ data, logoBase64 }: CasoHistorialPDFProps) {
  const { caso, acciones = [], citas = [], soportes = [], beneficiarios = [], equipo = [], cambiosEstatus = [] } = data;
  const casoData = caso || {};

  // Sort citas
  const sortedCitas = [...citas].sort((a, b) => new Date(a.fecha_encuentro || a.fecha_cita).getTime() - new Date(b.fecha_encuentro || b.fecha_cita).getTime());

  // Format ID for boxes
  const idStr = (casoData.id_caso || '').toString().padStart(3, '0');
  const d1 = idStr[idStr.length - 3] || '0';
  const d2 = idStr[idStr.length - 2] || '0';
  const d3 = idStr[idStr.length - 1] || '0';

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* HEADER */}
        <View style={styles.header}>
          {logoBase64 ? (
            <Image style={styles.logo} src={logoBase64} />
          ) : (
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>UCAB</Text>
          )}
          <Text style={styles.mainTitle}>HISTORIAL DE CASOS</Text>
        </View>

        {/* SECTION I */}
        <Text style={styles.sectionTitleMain}>I. HISTORIA DEL CASO</Text>

        {/* ROW 1: CI, Caso N, Materia */}
        <View style={styles.formRow}>
          {/* 1. C.I. */}
          <Text style={styles.label}>1. C.I. N°:</Text>
          <View style={[styles.underlinedField, { width: 80, flexGrow: 0, marginRight: 20 }]}>
            <Text style={[styles.valueText, { textAlign: 'center' }]}>{casoData.cedula}</Text>
          </View>

          {/* 2. Caso N */}
          <Text style={styles.label}>2. Caso N°:</Text>
          <View style={{ flexDirection: 'row', marginRight: 20 }}>
            <View style={styles.smallBox}><Text>{d1}</Text></View>
            <View style={styles.smallBox}><Text>{d2}</Text></View>
            <View style={styles.smallBox}><Text>{d3}</Text></View>
          </View>

          {/* 3. Caso (Materia) */}
          <Text style={styles.label}>3. Caso (Materia):</Text>
          <View style={[styles.boxField, { flex: 1 }]}>
            <Text style={styles.valueText}>
              {`${casoData.nombre_materia || ''} ${casoData.nombre_categoria || ''}`}
            </Text>
          </View>
        </View>

        {/* ROW 2: Sintesis */}
        <Text style={[styles.label, { marginTop: 5 }]}>4. Síntesis del problema:</Text>
        <View style={styles.largeTextBox}>
          <Text style={styles.valueText}>{casoData.observaciones || casoData.asunto || ''}</Text>
        </View>

        {/* ROW 3: Direccion */}
        <View style={[styles.formRow, { marginTop: 5 }]}>
          <Text style={styles.label}>5. Dirección habitación:</Text>
          <View style={styles.underlinedField}>
            <Text style={styles.valueText}>{casoData.direccion_habitacion || ''}</Text>
          </View>
        </View>

        {/* ROW 4: Citas */}
        <View style={{ marginTop: 5 }}>
          <Text style={[styles.label, { marginBottom: 5 }]}>6. Próximas citas:</Text>

          {/* Render citas in rows of 4 */}
          {Array.from({ length: Math.ceil(Math.max(sortedCitas.length, 4) / 4) }).map((_, rowIndex) => (
            <View key={rowIndex} style={[styles.formRow, { justifyContent: 'flex-start', marginBottom: 3 }]}>
              {[0, 1, 2, 3].map(colIndex => {
                const citaIndex = rowIndex * 4 + colIndex;
                const cita = sortedCitas[citaIndex];
                return (
                  <View key={colIndex} style={[styles.boxField, { width: '23%', alignItems: 'center', marginRight: '2%' }]}>
                    <Text style={{ fontSize: 9 }}>
                      {cita ? formatDate(cita.fecha_encuentro || cita.fecha_cita) : ''}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        {/* ROW 5: Recaudos */}
        <Text style={[styles.label, { marginTop: 10 }]}>7. Recaudos consignados:</Text>
        <View style={[styles.largeTextBox, { minHeight: 45 }]}>
          <Text style={styles.valueText}>
            {soportes.map(s => s.nombre_archivo).join(', ')}
          </Text>
        </View>

        {/* ROW 6: Orientacion */}
        <Text style={[styles.label, { marginTop: 5 }]}>8. Orientación dada por el alumno responsable:</Text>
        <View style={[styles.largeTextBox, { minHeight: 60 }]}>
          <Text style={styles.valueText}>
            {acciones.map(a => `${formatDate(a.fecha_registro)}: ${a.detalle_accion}`).join('. ')}
          </Text>
        </View>

        {/* ROW 7: Firma */}
        <View style={[styles.formRow, { marginTop: 15 }]}>
          <Text style={styles.label}>9. Firma:</Text>
          <View style={[styles.underlinedField, { maxWidth: 200 }]} />
        </View>


        {/* SECTION II */}
        <Text style={styles.sectionTitleSec}>II. INFORMACIÓN ADICIONAL</Text>

        {/* Equipo */}
        <View style={{ marginLeft: 10, marginBottom: 15 }}>
          <Text style={[styles.label, { marginBottom: 2 }]}>Equipo:</Text>
          {equipo.map((m, i) => (
            <Text key={i} style={{ fontSize: 10, paddingLeft: 10 }}>• {m.nombre_completo} - {m.rol}</Text>
          ))}
        </View>

        {/* Beneficiarios */}
        <View style={{ marginLeft: 10, marginBottom: 15 }}>
          <Text style={[styles.label, { marginBottom: 2 }]}>Beneficiarios:</Text>
          {beneficiarios.map((b, i) => (
            <Text key={i} style={{ fontSize: 10, paddingLeft: 10 }}>• {b.nombre_completo} ({b.parentesco})</Text>
          ))}
        </View>

        {/* Historial Estatus */}
        <View style={{ marginLeft: 10 }}>
          <Text style={[styles.label, { marginBottom: 2 }]}>Historial de Estatus:</Text>
          {cambiosEstatus.map((c, i) => (
            <Text key={i} style={{ fontSize: 10, paddingLeft: 10 }}>• {formatDate(c.fecha)}: {c.nuevo_estatus} - {c.motivo}</Text>
          ))}
        </View>
      </Page>
    </Document>
  );
}