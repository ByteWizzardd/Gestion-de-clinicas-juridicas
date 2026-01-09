'use client';

import React from 'react';
// @ts-ignore - React PDF types issue with React 19
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { formatDate, calculateAge } from '@/lib/utils/date-formatter';

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
    case 'En proceso': return '#4A90E2'; // Azul
    case 'Archivado': return '#7B68EE';   // Morado
    case 'Entregado': return '#50C878';   // Verde
    case 'Asesoría': return '#D2691E';    // Naranja
    default: return '#999999';
  }
}

export function CasoHistorialPDF({ data, logoBase64 }: CasoHistorialPDFProps) {
  const { caso, acciones = [], citas = [], soportes = [], beneficiarios = [], equipo = [], cambiosEstatus = [] } = data;
  const casoData = caso || {};

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
            <Text style={styles.title}>Historial del Caso</Text>
            {/* @ts-ignore */}
            <Text style={styles.subtitle}>Reporte generado el {new Date().toLocaleDateString('es-VE')}</Text>
          </View>
        </View>

        {/* INFORMACIÓN DEL CASO */}
        {/* @ts-ignore */}
        <View style={styles.section}>
          {/* @ts-ignore */}
          <Text style={styles.sectionTitle}>Información del Caso: #{casoData.id_caso || 'N/A'}</Text>

          {/* @ts-ignore */}
          <View style={styles.row}>
            {/* @ts-ignore */}
            <View style={styles.col3}>
              {/* @ts-ignore */}
              <Text style={styles.fieldLabel}>Solicitante</Text>
              {/* @ts-ignore */}
              <Text style={styles.fieldValue}>{casoData.nombre_completo_solicitante || casoData.cedula || 'N/A'}</Text>
            </View>
            {/* @ts-ignore */}
            <View style={styles.col3}>
              {/* @ts-ignore */}
              <Text style={styles.fieldLabel}>Cédula</Text>
              {/* @ts-ignore */}
              <Text style={styles.fieldValue}>{casoData.cedula || 'N/A'}</Text>
            </View>
            {/* @ts-ignore */}
            <View style={styles.col3}>
              {/* @ts-ignore */}
              <Text style={styles.fieldLabel}>Estatus</Text>
              {/* @ts-ignore */}
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(casoData.estatus) }
              ]}>
                {/* @ts-ignore */}
                <Text>{casoData.estatus || 'Sin estatus'}</Text>
              </View>
            </View>
          </View>

          {/* @ts-ignore */}
          <View style={styles.row}>
            {/* @ts-ignore */}
            <View style={styles.col3}>
              {/* @ts-ignore */}
              <Text style={styles.fieldLabel}>Materia</Text>
              {/* @ts-ignore */}
              <Text style={styles.fieldValue}>{casoData.nombre_materia || 'N/A'}</Text>
            </View>
            {/* @ts-ignore */}
            <View style={styles.col3}>
              {/* @ts-ignore */}
              <Text style={styles.fieldLabel}>Categoría</Text>
              {/* @ts-ignore */}
              <Text style={styles.fieldValue}>{casoData.nombre_categoria || 'N/A'}</Text>
            </View>
            {/* @ts-ignore */}
            <View style={styles.col3}>
              {/* @ts-ignore */}
              <Text style={styles.fieldLabel}>Subcategoría</Text>
              {/* @ts-ignore */}
              <Text style={styles.fieldValue}>{casoData.nombre_subcategoria || 'N/A'}</Text>
            </View>
          </View>

          {/* @ts-ignore */}
          <View style={styles.row}>
            {/* @ts-ignore */}
            <View style={styles.col3}>
              {/* @ts-ignore */}
              <Text style={styles.fieldLabel}>Abogado Responsable</Text>
              {/* @ts-ignore */}
              <Text style={styles.fieldValue}>{casoData.nombre_responsable || 'Sin asignar'}</Text>
            </View>
            {/* @ts-ignore */}
            <View style={styles.col3}>
              {/* @ts-ignore */}
              <Text style={styles.fieldLabel}>Fecha de Solicitud</Text>
              {/* @ts-ignore */}
              <Text style={styles.fieldValue}>{formatDate(casoData.fecha_solicitud)}</Text>
            </View>
            {/* @ts-ignore */}
            <View style={styles.col3}>
              {/* @ts-ignore */}
              <Text style={styles.fieldLabel}>Fecha de Inicio</Text>
              {/* @ts-ignore */}
              <Text style={styles.fieldValue}>{formatDate(casoData.fecha_inicio_caso)}</Text>
            </View>
          </View>

          {casoData.observaciones && (
            // @ts-ignore
            <View style={{ marginTop: 5 }}>
              {/* @ts-ignore */}
              <Text style={styles.fieldLabel}>Observaciones Iniciales</Text>
              {/* @ts-ignore */}
              <Text style={[styles.fieldValue, { fontStyle: 'italic', backgroundColor: '#f5f5f5', padding: 8, borderRadius: 4 }]}>
                {casoData.observaciones}
              </Text>
            </View>
          )}
        </View>

        {/* EQUIPO ASIGNADO */}
        {/* @ts-ignore */}
        <View style={styles.section}>
          {/* @ts-ignore */}
          <Text style={styles.sectionTitle}>Equipo Asignado ({equipo.length})</Text>
          {equipo.length > 0 ? (
            // @ts-ignore
            <View style={styles.table}>
              {/* @ts-ignore */}
              <View style={styles.tableHeader}>
                {/* @ts-ignore */}
                <Text style={[styles.tableHeadCell, { flex: 2 }]}>Nombre</Text>
                {/* @ts-ignore */}
                <Text style={[styles.tableHeadCell, { flex: 1.5 }]}>Rol</Text>
                {/* @ts-ignore */}
                <Text style={[styles.tableHeadCell, { flex: 1.5 }]}>Tipo</Text>
                {/* @ts-ignore */}
                <Text style={[styles.tableHeadCell, { flex: 1 }]}>Estatus</Text>
              </View>
              {equipo.map((miembro, index) => (
                // @ts-ignore
                <View key={index} style={styles.tableRow}>
                  {/* @ts-ignore */}
                  <Text style={[styles.tableCell, { flex: 2 }]}>{miembro.nombre_completo || 'N/A'}</Text>
                  {/* @ts-ignore */}
                  <Text style={[styles.tableCell, { flex: 1.5 }]}>{miembro.rol || 'N/A'}</Text>
                  {/* @ts-ignore */}
                  <Text style={[styles.tableCell, { flex: 1.5 }]}>{miembro.tipo === 'profesor' ? 'Profesor' : 'Estudiante'}</Text>
                  {/* @ts-ignore */}
                  <Text style={[styles.tableCell, { flex: 1 }]}>{miembro.habilitado ? 'Activo' : 'Inactivo'}</Text>
                </View>
              ))}
            </View>
          ) : (
            // @ts-ignore
            <Text style={styles.emptyMessage}>No hay equipo asignado.</Text>
          )}
        </View>

        {/* BENEFICIARIOS */}
        {/* @ts-ignore */}
        <View style={styles.section}>
          {/* @ts-ignore */}
          <Text style={styles.sectionTitle}>Beneficiarios ({beneficiarios.length})</Text>
          {beneficiarios.length > 0 ? (
            // @ts-ignore
            <View style={styles.table}>
              {/* @ts-ignore */}
              <View style={styles.tableHeader}>
                {/* @ts-ignore */}
                <Text style={[styles.tableHeadCell, { flex: 2 }]}>Nombre Completo</Text>
                {/* @ts-ignore */}
                <Text style={[styles.tableHeadCell, { flex: 1 }]}>Edad</Text>
                {/* @ts-ignore */}
                <Text style={[styles.tableHeadCell, { flex: 1.5 }]}>Parentesco</Text>
                {/* @ts-ignore */}
                <Text style={[styles.tableHeadCell, { flex: 1.5 }]}>Tipo</Text>
              </View>
              {beneficiarios.map((ben, index) => (
                // @ts-ignore
                <View key={index} style={styles.tableRow}>
                  {/* @ts-ignore */}
                  <Text style={[styles.tableCell, { flex: 2 }]}>{ben.nombre_completo || 'N/A'}</Text>
                  {/* @ts-ignore */}
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {ben.fecha_nac ? `${calculateAge(ben.fecha_nac)} años` : (ben.edad ? `${ben.edad} años` : 'N/A')}
                  </Text>
                  {/* @ts-ignore */}
                  <Text style={[styles.tableCell, { flex: 1.5 }]}>{ben.parentesco || 'N/A'}</Text>
                  {/* @ts-ignore */}
                  <Text style={[styles.tableCell, { flex: 1.5 }]}>{ben.tipo_beneficiario || 'N/A'}</Text>
                </View>
              ))}
            </View>
          ) : (
            // @ts-ignore
            <Text style={styles.emptyMessage}>No hay beneficiarios registrados en este caso.</Text>
          )}
        </View>

        {/* HISTORIAL DE ACCIONES (SEGUIMIENTO) */}
        {/* @ts-ignore */}
        <View style={styles.section}>
          {/* @ts-ignore */}
          <Text style={styles.sectionTitle}>Historial de Seguimiento ({acciones.length})</Text>
          {acciones.length > 0 ? (
            // @ts-ignore
            <View style={styles.table}>
              {/* @ts-ignore */}
              <View style={styles.tableHeader}>
                {/* @ts-ignore */}
                <Text style={[styles.tableHeadCell, { flex: 1 }]}>Fecha</Text>
                {/* @ts-ignore */}
                <Text style={[styles.tableHeadCell, { flex: 1.5 }]}>Responsable</Text>
                {/* @ts-ignore */}
                <Text style={[styles.tableHeadCell, { flex: 3 }]}>Descripción</Text>
              </View>
              {acciones.map((acc, index) => (
                // @ts-ignore
                <View key={index} style={styles.tableRow}>
                  {/* @ts-ignore */}
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {formatDate(acc.fecha_registro || acc.fecha_accion)}
                  </Text>
                  {/* @ts-ignore */}
                  <Text style={[styles.tableCell, { flex: 1.5 }]}>
                    {acc.nombre_completo_usuario_registra || acc.nombre_responsable || 'Sistema'}
                  </Text>
                  {/* @ts-ignore */}
                  <Text style={[styles.tableCell, { flex: 3 }]}>
                    {acc.detalle_accion || acc.descripcion}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            // @ts-ignore
            <Text style={styles.emptyMessage}>No se han registrado acciones de seguimiento.</Text>
          )}
        </View>

        {/* CITAS Y AUDIENCIAS */}
        {/* @ts-ignore */}
        <View style={styles.section}>
          {/* @ts-ignore */}
          <Text style={styles.sectionTitle}>Citas y Audiencias ({citas.length})</Text>
          {citas.length > 0 ? (
            // @ts-ignore
            <View style={styles.table}>
              {/* @ts-ignore */}
              <View style={styles.tableHeader}>
                {/* @ts-ignore */}
                <Text style={[styles.tableHeadCell, { flex: 1 }]}>Fecha</Text>
                {/* @ts-ignore */}
                <Text style={[styles.tableHeadCell, { flex: 1 }]}>Hora</Text>
                {/* @ts-ignore */}
                <Text style={[styles.tableHeadCell, { flex: 2.5 }]}>Tipo / Orientación</Text>
                {/* @ts-ignore */}
                <Text style={[styles.tableHeadCell, { flex: 1 }]}>Estatus</Text>
              </View>
              {citas.map((cita, index) => {
                const fecha = cita.fecha_encuentro || cita.fecha_cita;
                let hora = 'N/A';
                if (fecha) {
                  hora = new Date(fecha).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
                }
                // Inferir estatus si no existe: Si la fecha ya pasó -> Realizada, sino Pendiente
                let status = cita.estatus;
                if (!status && fecha) {
                  status = new Date(fecha) < new Date() ? 'Realizada' : 'Pendiente';
                }

                return (
                  // @ts-ignore
                  <View key={index} style={styles.tableRow}>
                    {/* @ts-ignore */}
                    <Text style={[styles.tableCell, { flex: 1 }]}>{formatDate(fecha)}</Text>
                    {/* @ts-ignore */}
                    <Text style={[styles.tableCell, { flex: 1 }]}>{hora}</Text>
                    {/* @ts-ignore */}
                    <Text style={[styles.tableCell, { flex: 2.5 }]}>{cita.orientacion || cita.tipo_cita || 'Cita'}</Text>
                    {/* @ts-ignore */}
                    <Text style={[styles.tableCell, { flex: 1, textTransform: 'capitalize' }]}>{status || 'N/A'}</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            // @ts-ignore
            <Text style={styles.emptyMessage}>No hay citas registradas.</Text>
          )}
        </View>

        {/* CAMBIOS DE ESTATUS */}
        {/* @ts-ignore */}
        <View style={styles.section}>
          {/* @ts-ignore */}
          <Text style={styles.sectionTitle}>Historial de Cambios de Estatus ({cambiosEstatus.length})</Text>
          {cambiosEstatus.length > 0 ? (
            // @ts-ignore
            <View style={styles.table}>
              {/* @ts-ignore */}
              <View style={styles.tableHeader}>
                {/* @ts-ignore */}
                <Text style={[styles.tableHeadCell, { flex: 1 }]}>Fecha</Text>
                {/* @ts-ignore */}
                <Text style={[styles.tableHeadCell, { flex: 1 }]}>Estatus</Text>
                {/* @ts-ignore */}
                <Text style={[styles.tableHeadCell, { flex: 2 }]}>Motivo</Text>
                {/* @ts-ignore */}
                <Text style={[styles.tableHeadCell, { flex: 1.5 }]}>Responsable</Text>
              </View>
              {cambiosEstatus.map((cambio, index) => (
                // @ts-ignore
                <View key={index} style={styles.tableRow}>
                  {/* @ts-ignore */}
                  <Text style={[styles.tableCell, { flex: 1 }]}>{formatDate(cambio.fecha)}</Text>
                  {/* @ts-ignore */}
                  <View style={{ flex: 1, padding: 5 }}>
                    {/* @ts-ignore */}
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(cambio.nuevo_estatus), alignSelf: 'flex-start' }
                    ]}>
                      {/* @ts-ignore */}
                      <Text style={{ color: 'white', fontSize: 8 }}>{cambio.nuevo_estatus}</Text>
                    </View>
                  </View>
                  {/* @ts-ignore */}
                  <Text style={[styles.tableCell, { flex: 2 }]}>{cambio.motivo || 'Sin motivo registrado'}</Text>
                  {/* @ts-ignore */}
                  <Text style={[styles.tableCell, { flex: 1.5 }]}>{cambio.nombre_completo_usuario || 'Sistema'}</Text>
                </View>
              ))}
            </View>
          ) : (
            // @ts-ignore
            <Text style={styles.emptyMessage}>No hay cambios de estatus registrados.</Text>
          )}
        </View>

        {/* SOPORTES */}
        {/* @ts-ignore */}
        <View style={styles.section}>
          {/* @ts-ignore */}
          <Text style={styles.sectionTitle}>Documentos y Soportes ({soportes.length})</Text>
          {soportes.length > 0 ? (
            // @ts-ignore
            <View style={styles.table}>
              {/* @ts-ignore */}
              <View style={styles.tableHeader}>
                {/* @ts-ignore */}
                <Text style={[styles.tableHeadCell, { flex: 1 }]}>Fecha</Text>
                {/* @ts-ignore */}
                <Text style={[styles.tableHeadCell, { flex: 2 }]}>Nombre del Archivo</Text>
                {/* @ts-ignore */}
                <Text style={[styles.tableHeadCell, { flex: 1.5 }]}>Subido por</Text>
              </View>
              {soportes.map((doc, index) => (
                // @ts-ignore
                <View key={index} style={styles.tableRow}>
                  {/* @ts-ignore */}
                  <Text style={[styles.tableCell, { flex: 1 }]}>{formatDate(doc.fecha_subida)}</Text>
                  {/* @ts-ignore */}
                  <Text style={[styles.tableCell, { flex: 2 }]}>{doc.nombre_archivo}</Text>
                  {/* @ts-ignore */}
                  <Text style={[styles.tableCell, { flex: 1.5 }]}>{doc.nombre_responsable || 'Usuario'}</Text>
                </View>
              ))}
            </View>
          ) : (
            // @ts-ignore
            <Text style={styles.emptyMessage}>No hay documentos adjuntos.</Text>
          )}
        </View>

        {/* @ts-ignore */}
        <View style={styles.footer}>
          {/* @ts-ignore */}
          <Text>CJ-UCA Reporte de Historial de Caso • Generado automáticamente desde el Sistema de Gestión de Clínicas Jurídicas</Text>
          {/* @ts-ignore */}
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}