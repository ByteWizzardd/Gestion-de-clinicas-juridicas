'use client';

import React from 'react';
// @ts-ignore - React PDF types issue with React 19
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { formatDate } from '@/lib/utils/date-formatter';

/**
 * PDF Generator that replicates the "Formato UCAB" Excel design
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

// Register fonts if needed, but we'll stick to Helvetica for simplicity/reliability
// Font.register({ family: 'Arial', src: '/fonts/Arial.ttf' }); 

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#000',
  },
  header: {
    // Default flexDirection is column
    marginBottom: 20,
    marginTop: 10,
  },
  logo: {
    width: 200,
    height: 60,
    objectFit: 'contain',
    marginBottom: 10, // Add space below logo
    alignSelf: 'flex-start', // Logo to the left
  },
  mainTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 0,
    width: '100%', // Ensure it takes full width to center text
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
    minHeight: 60, // 5 lines approx
    marginTop: 2,
    marginBottom: 10,
  },

  // Section II Tables
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
    width: '30%', // Default
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
  const sortedCitas = [...citas].sort((a, b) => new Date(a.fecha_encuentro || a.fecha_cita).getTime() - new Date(b.fecha_encuentro || b.fecha_cita).getTime()).slice(0, 4);

  // Format ID for boxes
  const idStr = (casoData.id_caso || '').toString().padStart(3, '0');
  const d1 = idStr[idStr.length - 3] || '0';
  const d2 = idStr[idStr.length - 2] || '0';
  const d3 = idStr[idStr.length - 1] || '0';

  return (
    // @ts-ignore
    <Document>
      {/* @ts-ignore */}
      <Page size="A4" style={styles.page}>

        {/* HEADER */}
        {/* @ts-ignore */}
        <View style={styles.header}>
          {logoBase64 ? (
            // @ts-ignore
            <Image style={styles.logo} src={logoBase64} />
          ) : (
            // @ts-ignore
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>UCAB</Text>
          )}
          {/* @ts-ignore */}
          <Text style={styles.mainTitle}>HISTORIAL DE CASOS</Text>
        </View>

        {/* SECTION I */}
        {/* @ts-ignore */}
        <Text style={styles.sectionTitleMain}>I. HISTORIA DEL CASO</Text>

        {/* ROW 1: CI, Caso N, Materia */}
        {/* @ts-ignore */}
        <View style={styles.formRow}>
          {/* 1. C.I. */}
          {/* @ts-ignore */}
          <Text style={styles.label}>1. C.I. N°:</Text>
          {/* @ts-ignore */}
          <View style={[styles.underlinedField, { width: 80, flexGrow: 0, marginRight: 20 }]}>
            {/* @ts-ignore */}
            <Text style={[styles.valueText, { textAlign: 'center' }]}>{casoData.cedula}</Text>
          </View>

          {/* 2. Caso N */}
          {/* @ts-ignore */}
          <Text style={styles.label}>2. Caso N°:</Text>
          {/* @ts-ignore */}
          <View style={{ flexDirection: 'row', marginRight: 20 }}>
            {/* @ts-ignore */}
            <View style={styles.smallBox}><Text>{d1}</Text></View>
            {/* @ts-ignore */}
            <View style={styles.smallBox}><Text>{d2}</Text></View>
            {/* @ts-ignore */}
            <View style={styles.smallBox}><Text>{d3}</Text></View>
          </View>

          {/* 3. Caso (Materia) */}
          {/* @ts-ignore */}
          <Text style={styles.label}>3. Caso (Materia):</Text>
          {/* @ts-ignore */}
          <View style={[styles.boxField, { flex: 1 }]}>
            {/* @ts-ignore */}
            <Text style={styles.valueText}>
              {`${casoData.nombre_materia || ''} ${casoData.nombre_categoria || ''}`}
            </Text>
          </View>
        </View>

        {/* ROW 2: Sintesis */}
        {/* @ts-ignore */}
        <Text style={[styles.label, { marginTop: 5 }]}>4. Síntesis del problema:</Text>
        {/* @ts-ignore */}
        <View style={styles.largeTextBox}>
          {/* @ts-ignore */}
          <Text style={styles.valueText}>{casoData.observaciones || casoData.asunto || ''}</Text>
        </View>

        {/* ROW 3: Direccion */}
        {/* @ts-ignore */}
        <View style={[styles.formRow, { marginTop: 5 }]}>
          {/* @ts-ignore */}
          <Text style={styles.label}>5. Dirección habitación:</Text>
          {/* @ts-ignore */}
          <View style={styles.underlinedField}>
            {/* @ts-ignore */}
            <Text style={styles.valueText}>{casoData.direccion_habitacion || ''}</Text>
          </View>
        </View>

        {/* ROW 4: Citas */}
        {/* @ts-ignore */}
        <View style={[styles.formRow, { marginTop: 5, justifyContent: 'space-between' }]}>
          {/* @ts-ignore */}
          <Text style={[styles.label, { marginRight: 10 }]}>6. Próximas citas:</Text>

          {/* Render 4 boxes evenly */}
          {[0, 1, 2, 3].map(i => (
            // @ts-ignore
            <View key={i} style={[styles.boxField, { width: '20%', alignItems: 'center' }]}>
              {/* @ts-ignore */}
              <Text style={{ fontSize: 9 }}>
                {sortedCitas[i] ? formatDate(sortedCitas[i].fecha_encuentro || sortedCitas[i].fecha_cita) : ''}
              </Text>
            </View>
          ))}
        </View>

        {/* ROW 5: Recaudos */}
        {/* @ts-ignore */}
        <Text style={[styles.label, { marginTop: 10 }]}>7. Recaudos consignados:</Text>
        {/* @ts-ignore */}
        <View style={[styles.largeTextBox, { minHeight: 45 }]}>
          {/* @ts-ignore */}
          <Text style={styles.valueText}>
            {soportes.map(s => s.nombre_archivo).join(', ')}
          </Text>
        </View>

        {/* ROW 6: Orientacion */}
        {/* @ts-ignore */}
        <Text style={[styles.label, { marginTop: 5 }]}>8. Orientación dada por el alumno responsable:</Text>
        {/* @ts-ignore */}
        <View style={[styles.largeTextBox, { minHeight: 60 }]}>
          {/* @ts-ignore */}
          <Text style={styles.valueText}>
            {acciones.map(a => `${formatDate(a.fecha_registro)}: ${a.detalle_accion}`).join('. ')}
          </Text>
        </View>

        {/* ROW 7: Firma */}
        {/* @ts-ignore */}
        <View style={[styles.formRow, { marginTop: 15 }]}>
          {/* @ts-ignore */}
          <Text style={styles.label}>9. Firma:</Text>
          {/* @ts-ignore */}
          <View style={[styles.underlinedField, { maxWidth: 200 }]} />
        </View>


        {/* SECTION II */}
        {/* @ts-ignore */}
        <Text style={styles.sectionTitleSec}>II. INFORMACIÓN ADICIONAL</Text>

        {/* Equipo */}
        {/* @ts-ignore */}
        <View style={{ marginLeft: 10, marginBottom: 15 }}>
          {/* @ts-ignore */}
          <Text style={[styles.label, { marginBottom: 2 }]}>Equipo:</Text>
          {equipo.map((m, i) => (
            // @ts-ignore
            <Text key={i} style={{ fontSize: 10, paddingLeft: 10 }}>• {m.nombre_completo} - {m.rol}</Text>
          ))}
        </View>

        {/* Beneficiarios */}
        {/* @ts-ignore */}
        <View style={{ marginLeft: 10, marginBottom: 15 }}>
          {/* @ts-ignore */}
          <Text style={[styles.label, { marginBottom: 2 }]}>Beneficiarios:</Text>
          {beneficiarios.map((b, i) => (
            // @ts-ignore
            <Text key={i} style={{ fontSize: 10, paddingLeft: 10 }}>• {b.nombre_completo} ({b.parentesco})</Text>
          ))}
        </View>

        {/* Historial Estatus */}
        {/* @ts-ignore */}
        <View style={{ marginLeft: 10 }}>
          {/* @ts-ignore */}
          <Text style={[styles.label, { marginBottom: 2 }]}>Historial de Estatus:</Text>
          {cambiosEstatus.map((c, i) => (
            // @ts-ignore
            <Text key={i} style={{ fontSize: 10, paddingLeft: 10 }}>• {formatDate(c.fecha)}: {c.nuevo_estatus} - {c.motivo}</Text>
          ))}
        </View>


      </Page>
    </Document>
  );
}