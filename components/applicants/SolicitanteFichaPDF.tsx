'use client';

import React from 'react';
// @ts-ignore - React PDF types issue with React 19
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { formatDate, calculateAge } from '@/lib/utils/date-formatter';

interface SolicitanteFichaPDFProps {
  data: {
    solicitante: any;
    casos: any[];
    beneficiarios: any[];
  };
  logoBase64: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#9c2327',
    paddingBottom: 10,
  },
  logo: {
    width: 150,
    height: 40,
    objectFit: 'contain',
    marginRight: 20,
  },
  headerText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9c2327',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9c2327',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  col2: {
    width: '50%',
  },
  col3: {
    width: '33.33%',
  },
  fieldLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 10,
    marginBottom: 8,
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    minHeight: 25,
    alignItems: 'center',
  },
  tableHeadCell: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#444',
    padding: 5,
    textAlign: 'left',
  },
  tableCell: {
    fontSize: 9,
    color: '#333',
    padding: 5,
  },
  emptyMessage: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#888',
    padding: 10,
    textAlign: 'center',
    backgroundColor: '#fafafa',
    marginBottom: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#999',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontSize: 9,
    color: 'white',
    alignSelf: 'flex-start',
  }
});

function getStatusColor(status: string) {
  switch (status) {
    case 'En proceso': return '#4A90E2';
    case 'Archivado': return '#7B68EE';
    case 'Entregado': return '#50C878';
    case 'Asesoría': return '#D2691E';
    default: return '#999999';
  }
}

function formatValue(value: any): string {
  if (value === null || value === undefined || value === '') return 'N/A';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  return String(value);
}

export function SolicitanteFichaPDF({ data, logoBase64 }: SolicitanteFichaPDFProps) {
  const { solicitante, casos = [], beneficiarios = [] } = data;
  const sol = solicitante || {};

  // Calculate age safely
  const edad = sol.edad || (sol.fecha_nacimiento ? calculateAge(sol.fecha_nacimiento) : null);

  return (
    // @ts-ignore
    <Document>
      {/* @ts-ignore */}
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        {/* @ts-ignore */}
        <View style={styles.header}>
          {logoBase64 && (
            // @ts-ignore
            <Image style={styles.logo} src={logoBase64} />
          )}
          {/* @ts-ignore */}
          <View style={styles.headerText}>
            {/* @ts-ignore */}
            <Text style={styles.title}>Ficha de Solicitante</Text>
            {/* @ts-ignore */}
            <Text style={styles.subtitle}>Reporte generado el {new Date().toLocaleDateString('es-VE')}</Text>
          </View>
        </View>

        {/* DATOS PERSONALES */}
        {/* @ts-ignore */}
        <View style={styles.section}>
          {/* @ts-ignore */}
          <Text style={styles.sectionTitle}>Datos Personales</Text>

          {/* @ts-ignore */}
          <View style={styles.row}>
            {/* @ts-ignore */}
            <View style={styles.col2}>
              {/* @ts-ignore */}
              <Text style={styles.fieldLabel}>Nombre Completo</Text>
              {/* @ts-ignore */}
              <Text style={styles.fieldValue}>{sol.nombre_completo || 'N/A'}</Text>
            </View>
            {/* @ts-ignore */}
            <View style={styles.col2}>
              {/* @ts-ignore */}
              <Text style={styles.fieldLabel}>Cédula</Text>
              {/* @ts-ignore */}
              <Text style={styles.fieldValue}>{sol.cedula || 'N/A'}</Text>
            </View>
          </View>

          {/* @ts-ignore */}
          <View style={styles.row}>
            {/* @ts-ignore */}
            <View style={styles.col3}>
              {/* @ts-ignore */}
              <Text style={styles.fieldLabel}>Fecha de Nacimiento</Text>
              {/* @ts-ignore */}
              <Text style={styles.fieldValue}>{formatDate(sol.fecha_nacimiento)}</Text>
            </View>
            {/* @ts-ignore */}
            <View style={styles.col3}>
              {/* @ts-ignore */}
              <Text style={styles.fieldLabel}>Edad</Text>
              {/* @ts-ignore */}
              <Text style={styles.fieldValue}>{edad ? `${edad} años` : 'N/A'}</Text>
            </View>
            {/* @ts-ignore */}
            <View style={styles.col3}>
              {/* @ts-ignore */}
              <Text style={styles.fieldLabel}>Género</Text>
              {/* @ts-ignore */}
              <Text style={styles.fieldValue}>
                {sol.sexo === 'M' ? 'Masculino' : sol.sexo === 'F' ? 'Femenino' : sol.sexo || 'N/A'}
              </Text>
            </View>
          </View>

          {/* @ts-ignore */}
          <View style={styles.row}>
            {/* @ts-ignore */}
            <View style={styles.col2}>
              {/* @ts-ignore */}
              <Text style={styles.fieldLabel}>Teléfono Celular</Text>
              {/* @ts-ignore */}
              <Text style={styles.fieldValue}>{sol.telefono_celular || 'N/A'}</Text>
            </View>
            {/* @ts-ignore */}
            <View style={styles.col2}>
              {/* @ts-ignore */}
              <Text style={styles.fieldLabel}>Teléfono Local</Text>
              {/* @ts-ignore */}
              <Text style={styles.fieldValue}>{sol.telefono_local || 'N/A'}</Text>
            </View>
          </View>

          {/* @ts-ignore */}
          <View style={styles.row}>
            {/* @ts-ignore */}
            <View style={styles.col3}>
              {/* @ts-ignore */}
              <Text style={styles.fieldLabel}>Estado Civil</Text>
              {/* @ts-ignore */}
              <Text style={styles.fieldValue}>{sol.estado_civil || 'N/A'}</Text>
            </View>
            {/* @ts-ignore */}
            <View style={styles.col3}>
              {/* @ts-ignore */}
              <Text style={styles.fieldLabel}>Nivel Educativo</Text>
              {/* @ts-ignore */}
              <Text style={styles.fieldValue}>{sol.nombre_nivel_educativo || sol.nivel_educativo || 'N/A'}</Text>
            </View>
            {/* @ts-ignore */}
            <View style={styles.col3}>
              {/* @ts-ignore */}
              <Text style={styles.fieldLabel}>Ocupación</Text>
              {/* @ts-ignore */}
              <Text style={styles.fieldValue}>{sol.ocupacion || 'N/A'}</Text>
            </View>
          </View>

          {/* @ts-ignore */}
          <View style={{ marginTop: 5 }}>
            {/* @ts-ignore */}
            <Text style={styles.fieldLabel}>Dirección de Habitación</Text>
            {/* @ts-ignore */}
            <Text style={styles.fieldValue}>
              {sol.direccion ? `${sol.direccion}, ` : ''}
              {sol.nombre_parroquia || sol.parroquia ? `${sol.nombre_parroquia || sol.parroquia}, ` : ''}
              {sol.nombre_municipio || sol.municipio ? `${sol.nombre_municipio || sol.municipio}, ` : ''}
              {sol.nombre_estado || sol.estado || ''}
            </Text>
          </View>
        </View>

        {/* INFORMACIÓN SOCIOECONÓMICA RESUMIDA */}
        {/* @ts-ignore */}
        <View style={styles.section}>
          {/* @ts-ignore */}
          <Text style={styles.sectionTitle}>Información Socioeconómica</Text>
          {/* @ts-ignore */}
          <View style={styles.row}>
            {/* @ts-ignore */}
            <View style={styles.col3}>
              {/* @ts-ignore */}
              <Text style={styles.fieldLabel}>Tipo de Vivienda</Text>
              {/* @ts-ignore */}
              <Text style={styles.fieldValue}>{sol.tipo_vivienda || 'N/A'}</Text>
            </View>
            {/* @ts-ignore */}
            <View style={styles.col3}>
              {/* @ts-ignore */}
              <Text style={styles.fieldLabel}>Tenencia</Text>
              {/* @ts-ignore */}
              <Text style={styles.fieldValue}>{sol.tenencia_vivienda || 'N/A'}</Text>
            </View>
            {/* @ts-ignore */}
            <View style={styles.col3}>
              {/* @ts-ignore */}
              <Text style={styles.fieldLabel}>Ingreso Mensual Aprox.</Text>
              {/* @ts-ignore */}
              <Text style={styles.fieldValue}>{sol.ingresos_mensuales ? `${sol.ingresos_mensuales} Bs.` : 'N/A'}</Text>
            </View>
          </View>
          {/* @ts-ignore */}
          <View style={styles.row}>
            {/* @ts-ignore */}
            <View style={styles.col3}>
              {/* @ts-ignore */}
              <Text style={styles.fieldLabel}>Grupo Familiar</Text>
              {/* @ts-ignore */}
              <Text style={styles.fieldValue}>{sol.cant_personas || sol.numero_personas_hogar || 0} personas</Text>
            </View>
            {/* @ts-ignore */}
            <View style={styles.col3}>
              {/* @ts-ignore */}
              <Text style={styles.fieldLabel}>Cargas Familiares</Text>
              {/* @ts-ignore */}
              <Text style={styles.fieldValue}>{sol.cargas_familiares || 0} personas</Text>
            </View>
          </View>
        </View>

        {/* CASOS ASOCIADOS */}
        {/* @ts-ignore */}
        <View style={styles.section}>
          {/* @ts-ignore */}
          <Text style={styles.sectionTitle}>Casos Registrados ({casos.length})</Text>
          {casos.length > 0 ? (
            // @ts-ignore
            <View style={styles.table}>
              {/* @ts-ignore */}
              <View style={styles.tableHeader}>
                {/* @ts-ignore */}
                <Text style={[styles.tableHeadCell, { flex: 0.5 }]}>ID</Text>
                {/* @ts-ignore */}
                <Text style={[styles.tableHeadCell, { flex: 1 }]}>Fecha</Text>
                {/* @ts-ignore */}
                <Text style={[styles.tableHeadCell, { flex: 2 }]}>Materia/Trámite</Text>
                {/* @ts-ignore */}
                <Text style={[styles.tableHeadCell, { flex: 1.5 }]}>Responsable</Text>
                {/* @ts-ignore */}
                <Text style={[styles.tableHeadCell, { flex: 1 }]}>Estatus</Text>
              </View>
              {casos.map((caso, index) => (
                // @ts-ignore
                <View key={index} style={styles.tableRow}>
                  {/* @ts-ignore */}
                  <Text style={[styles.tableCell, { flex: 0.5 }]}>#{caso.id_caso}</Text>
                  {/* @ts-ignore */}
                  <Text style={[styles.tableCell, { flex: 1 }]}>{formatDate(caso.fecha_solicitud)}</Text>
                  {/* @ts-ignore */}
                  <Text style={[styles.tableCell, { flex: 2 }]}>
                    {caso.nombre_materia || caso.tramite || 'N/A'}
                  </Text>
                  {/* @ts-ignore */}
                  <Text style={[styles.tableCell, { flex: 1.5 }]}>{caso.nombre_responsable || 'Sin asignar'}</Text>
                  {/* @ts-ignore */}
                  <View style={{ flex: 1, padding: 5 }}>
                    {/* @ts-ignore */}
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(caso.estatus), alignSelf: 'flex-start' }
                    ]}>
                      {/* @ts-ignore */}
                      <Text style={{ color: 'white', fontSize: 8 }}>{caso.estatus}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            // @ts-ignore
            <Text style={styles.emptyMessage}>Este solicitante no tiene casos registrados.</Text>
          )}
        </View>

        {/* BENEFICIARIOS ASOCIADOS */}
        {/* @ts-ignore */}
        <View style={styles.section}>
          {/* @ts-ignore */}
          <Text style={styles.sectionTitle}>Beneficiarios en sus Casos ({beneficiarios.length})</Text>
          {beneficiarios.length > 0 ? (
            // @ts-ignore
            <View style={styles.table}>
              {/* @ts-ignore */}
              <View style={styles.tableHeader}>
                {/* @ts-ignore */}
                <Text style={[styles.tableHeadCell, { flex: 2 }]}>Nombre Completo</Text>
                {/* @ts-ignore */}
                <Text style={[styles.tableHeadCell, { flex: 1 }]}>Parentesco</Text>
                {/* @ts-ignore */}
                <Text style={[styles.tableHeadCell, { flex: 1 }]}>Edad</Text>
                {/* @ts-ignore */}
                <Text style={[styles.tableHeadCell, { flex: 1 }]}>Caso ID</Text>
              </View>
              {beneficiarios.map((ben, index) => (
                // @ts-ignore
                <View key={index} style={styles.tableRow}>
                  {/* @ts-ignore */}
                  <Text style={[styles.tableCell, { flex: 2 }]}>{ben.nombre_completo || 'N/A'}</Text>
                  {/* @ts-ignore */}
                  <Text style={[styles.tableCell, { flex: 1 }]}>{ben.parentesco || 'N/A'}</Text>
                  {/* @ts-ignore */}
                  <Text style={[styles.tableCell, { flex: 1 }]}>{ben.edad} años</Text>
                  {/* @ts-ignore */}
                  <Text style={[styles.tableCell, { flex: 1 }]}>#{ben.id_caso}</Text>
                </View>
              ))}
            </View>
          ) : (
            // @ts-ignore
            <Text style={styles.emptyMessage}>No hay beneficiarios asociados.</Text>
          )}
        </View>

        {/* @ts-ignore */}
        <View style={styles.footer}>
          {/* @ts-ignore */}
          <Text>CJ-UCA Ficha de Solicitante • Generado automáticamente el {new Date().toLocaleDateString('es-VE')}</Text>
          {/* @ts-ignore */}
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}