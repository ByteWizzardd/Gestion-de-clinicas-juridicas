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

// Estilos para replicar el formulario "Registro y Control de Beneficiarios"
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#000',
  },
  // Header
  headerContainer: {
    marginBottom: 10,
    marginTop: 10,
    alignItems: 'center', // Default align for column
  },
  logo: {
    width: 200,
    height: 50,
    objectFit: 'contain',
    alignSelf: 'flex-start', // Logo Left
    marginBottom: 5,
  },
  titleContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#000',
    textAlign: 'center',
  },
  // Sections
  sectionHeader: {
    backgroundColor: '#8B1C1C',
    padding: 3,
    borderWidth: 1,
    borderColor: '#8B1C1C',
    marginBottom: 10,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFFFFF',
  },
  // Rows & Grids
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 8,
    fontWeight: 'bold',
    marginRight: 4,
  },
  valueText: {
    fontSize: 8,
    fontFamily: 'Helvetica',
  },
  // Form elements
  underlined: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingHorizontal: 2,
    flexGrow: 1,
  },
  checkbox: {
    width: 9,
    height: 9,
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
    marginRight: 6,
  },
  checkMark: {
    fontSize: 7,
    marginTop: -2,
  },
  dateBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  charBox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 1,
  },
  charText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  // Signatures
  signatureLine: {
    borderTopWidth: 1,
    borderColor: '#000',
    width: '80%',
    marginTop: 30,
    marginBottom: 5,
  },
  signatureContainer: {
    width: '45%',
    alignItems: 'center',
  }
});

// Helper Components
const Checkbox = ({ label, checked }: { label: string, checked?: boolean }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 5, marginBottom: 3 }}>
    <Text style={styles.valueText}>{label}</Text>
    <View style={styles.checkbox}>
      {checked && <Text style={styles.checkMark}>X</Text>}
    </View>
  </View>
);

const CharacterBoxes = ({ value, count }: { value: string, count: number }) => {
  const chars = value.split('');
  return (
    <View style={styles.dateBoxContainer}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.charBox}>
          <Text style={styles.charText}>{chars[i] || ''}</Text>
        </View>
      ))}
    </View>
  );
};

const DateBoxes = ({ date, label }: { date?: string | Date, label?: string }) => {
  // If no date provided for DOB, show empty boxes? Or Today?
  // For 'Fecha Header' we want today. For DOB we want empty if null.
  // Assuming if label contains 'Nacimiento' or 'Nac' we might want empty if null.
  let d: Date | null = null;
  if (date) d = new Date(date);
  else if (label?.includes('Fecha:')) d = new Date(); // Default for Header Date

  const day = d ? String(d.getDate()).padStart(2, '0') : '';
  const month = d ? String(d.getMonth() + 1).padStart(2, '0') : '';
  const year = d ? String(d.getFullYear()) : '';

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {label && <Text style={[styles.label, { marginRight: 3 }]}>{label}</Text>}
      {/* DD */}
      <CharacterBoxes value={day} count={2} />
      <View style={{ width: 4 }} />
      {/* MM */}
      <CharacterBoxes value={month} count={2} />
      <View style={{ width: 4 }} />
      {/* AAAA */}
      <CharacterBoxes value={year} count={4} />
    </View>
  );
};

export function SolicitanteFichaPDF({ data, logoBase64 }: SolicitanteFichaPDFProps) {
  const { solicitante, beneficiarios = [] } = data;
  const s = solicitante || {};

  // Helpers logic
  const trabaja = !!s.nombre_trabajo && !['No trabaja', 'Desempleado'].includes(s.nombre_trabajo);

  // Calculate kids 7-12
  const ninos = (beneficiarios || []).filter((b: any) => {
    const age = b.edad || (b.fecha_nac ? calculateAge(b.fecha_nac) : 0);
    return age >= 7 && age <= 12;
  }).length;

  return (
    // @ts-ignore
    <Document>
      {/* @ts-ignore */}
      <Page size="A4" style={styles.page}>

        {/* HEADER */}
        {/* @ts-ignore */}
        <View style={styles.headerContainer}>
          {logoBase64 ? (
            // @ts-ignore
            <Image style={styles.logo} src={logoBase64} />
          ) : (
            // @ts-ignore
            <Text style={[styles.logo, { paddingTop: 10 }]}>UCAB</Text>
          )}
          {/* @ts-ignore */}
          <View style={styles.titleContainer}>
            {/* @ts-ignore */}
            <Text style={styles.mainTitle}>REGISTRO Y CONTROL DE BENEFICIARIOS</Text>
          </View>
        </View>

        {/* I. IDENTIFICACIÓN */}
        {/* @ts-ignore */}
        <View style={styles.sectionHeader}>
          {/* @ts-ignore */}
          <Text style={styles.sectionTitle}>I. IDENTIFICACIÓN</Text>
        </View>

        {/* Fecha y Nucleo header right */}
        {/* @ts-ignore */}
        <View style={{ alignItems: 'flex-end', marginBottom: 10 }}>
          <DateBoxes date={new Date()} label="1. Fecha:" />
          {/* @ts-ignore */}
          <View style={[styles.row, { marginTop: 5, justifyContent: 'flex-end' }]}>
            {/* @ts-ignore */}
            <Text style={styles.label}>2. Núcleo:</Text>
            {/* @ts-ignore */}
            <View style={[styles.underlined, { width: 150, flexGrow: 0 }]}>
              {/* @ts-ignore */}
              <Text style={[styles.valueText, { textAlign: 'center' }]}>{s.nombre_nucleo || s.nucleo || ''}</Text>
            </View>
          </View>
        </View>

        {/* Nombres y Apellidos | CI */}
        {/* @ts-ignore */}
        <View style={styles.row}>
          {/* @ts-ignore */}
          <Text style={styles.label}>Nombres y Apellidos:</Text>
          {/* @ts-ignore */}
          <View style={styles.underlined}>
            {/* @ts-ignore */}
            <Text style={styles.valueText}>{s.nombres} {s.apellidos}</Text>
          </View>
          {/* @ts-ignore */}
          <Text style={[styles.label, { marginLeft: 10 }]}>3. C.I. N°:</Text>
          {/* @ts-ignore */}
          <View style={[styles.underlined, { maxWidth: 80 }]}>
            {/* @ts-ignore */}
            <Text style={[styles.valueText, { textAlign: 'center' }]}>{s.cedula}</Text>
          </View>
        </View>

        {/* Telefonos y Correo */}
        {/* @ts-ignore */}
        <View style={styles.row}>
          {/* @ts-ignore */}
          <Text style={styles.label}>4. Teléfono local:</Text>
          {/* @ts-ignore */}
          <View style={styles.underlined}>
            {/* @ts-ignore */}
            <Text style={styles.valueText}>{s.telefono_local}</Text>
          </View>
          {/* @ts-ignore */}
          <Text style={[styles.label, { marginLeft: 5 }]}>5. Teléfono celular:</Text>
          {/* @ts-ignore */}
          <View style={styles.underlined}>
            {/* @ts-ignore */}
            <Text style={styles.valueText}>{s.telefono_celular}</Text>
          </View>
          {/* @ts-ignore */}
          <Text style={[styles.label, { marginLeft: 5 }]}>6. Correo electrónico:</Text>
          {/* @ts-ignore */}
          <View style={styles.underlined}>
            {/* @ts-ignore */}
            <Text style={styles.valueText}>{s.correo_electronico}</Text>
          </View>
        </View>

        {/* Dirección */}
        {/* @ts-ignore */}
        <View style={[styles.row, { marginTop: 10 }]}>
          {/* @ts-ignore */}
          <Text style={styles.label}>7. Estado, Municipio y Parroquia de Residencia:</Text>
          {/* @ts-ignore */}
          <View style={styles.underlined}>
            {/* @ts-ignore */}
            <Text style={styles.valueText}>
              {[s.nombre_estado, s.nombre_municipio, s.nombre_parroquia].filter(Boolean).join(', ') || ''}
            </Text>
          </View>
        </View>

        {/* Education 13 */}
        {/* @ts-ignore */}
        <View style={{ marginTop: 15 }}>
          {/* @ts-ignore */}
          <Text style={[styles.label, { marginBottom: 5 }]}>13. Educación alcanzada:</Text>
          {/* @ts-ignore */}
          <View style={{ flexDirection: 'row', marginTop: 5 }}>
            {/* Left Column Education */}
            {/* @ts-ignore */}
            <View style={{ width: '55%', paddingRight: 5 }}>
              <Checkbox label="0. Sin Nivel" checked={s.nivel_educativo === 'Sin Nivel'} />
              <Checkbox label="1-6. Primaria (grado)" checked={s.nivel_educativo === 'Primaria'} />
              <Checkbox label="7-9. Básica (1er-3er año/7mo-9no grado)" checked={s.nivel_educativo === 'Básica'} />
              <Checkbox label="10-11. Media Diversificada (4to-5to año)" checked={s.nivel_educativo === 'Media Diversificada'} />
            </View>

            {/* Right Column Education */}
            {/* @ts-ignore */}
            <View style={{ width: '45%' }}>
              {/* @ts-ignore */}
              <View style={{ flexDirection: 'row' }}>
                {/* @ts-ignore */}
                <View style={{ width: '60%' }}>
                  <Checkbox label="12. Técnico Medio" checked={s.nivel_educativo === 'Técnico Medio'} />
                  <Checkbox label="13. Técnico Superior" checked={s.nivel_educativo === 'Técnico Superior'} />
                  <Checkbox label="14. Universitaria" checked={s.nivel_educativo === 'Universitaria'} />
                </View>
                {/* @ts-ignore */}
                <View style={{ width: '40%' }}>
                  {/* @ts-ignore */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 5, marginBottom: 3 }}>
                    <Text style={styles.valueText}>a. Años</Text>
                    <View style={styles.checkbox}>
                      {s.tipo_tiempo_estudio === 'Años' && <Text style={styles.checkMark}>{s.tiempo_estudio || ''}</Text>}
                    </View>
                  </View>
                  {/* @ts-ignore */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 5, marginBottom: 3 }}>
                    <Text style={styles.valueText}>b. Semestres</Text>
                    <View style={styles.checkbox}>
                      {s.tipo_tiempo_estudio === 'Semestres' && <Text style={styles.checkMark}>{s.tiempo_estudio || ''}</Text>}
                    </View>
                  </View>
                  {/* @ts-ignore */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 5, marginBottom: 3 }}>
                    <Text style={styles.valueText}>c. Trimestres</Text>
                    <View style={styles.checkbox}>
                      {s.tipo_tiempo_estudio === 'Trimestres' && <Text style={styles.checkMark}>{s.tiempo_estudio || ''}</Text>}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Trabajo 14 */}
        {/* Row 1: Trabaja + Condicion Trabajo */}
        {/* @ts-ignore */}
        <View style={[styles.row, { marginTop: 15 }]}>
          {/* @ts-ignore */}
          <Text style={styles.label}>14. ¿Trabaja?</Text>
          <Checkbox label="a. Sí" checked={trabaja} />
          <Checkbox label="b. No" checked={!trabaja} />

          {/* @ts-ignore */}
          <Text style={[styles.label, { marginLeft: 15, marginRight: 5 }]}>{'-> 14a. Condición en el trabajo:'}</Text>
          <View style={{ flexWrap: 'wrap', flexDirection: 'row', width: 250 }}>
            <Checkbox label="a. Patrono" checked={s.nombre_trabajo === 'Patrono'} />
            <Checkbox label="b. Empleado" checked={s.nombre_trabajo === 'Empleado'} />
            <Checkbox label="c. Obrero" checked={s.nombre_trabajo === 'Obrero'} />
            <Checkbox label="d. Cuenta propia" checked={s.nombre_trabajo === 'Cuenta propia'} />
          </View>
        </View>

        {/* Row 2: Buscando Trabjo + Condicion Actividad */}
        {/* @ts-ignore */}
        <View style={[styles.row, { marginTop: 15 }]}>
          {/* @ts-ignore */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* @ts-ignore */}
            <Text style={styles.label}>{'-> 14b. ¿Está buscando Trabajo?'}</Text>
            <Checkbox label="a. Sí" checked={s.id_actividad === 0} />
            <Checkbox label="b. No" checked={!trabaja && s.id_actividad !== 0 && s.id_actividad !== null} />
          </View>

          {/* @ts-ignore */}
          <View style={{ marginLeft: 15 }}>
            {/* @ts-ignore */}
            <Text style={[styles.label, { marginBottom: 3 }]}>{'-> 14c. Condición actividad:'}</Text>
            {/* @ts-ignore */}
            <View style={{ flexDirection: 'row' }}>
              {/* @ts-ignore */}
              <View style={{ marginRight: 15 }}>
                <Checkbox label="a. Ama de casa" checked={s.nombre_actividad === 'Ama de Casa' || s.nombre_actividad === 'Ama de casa'} />
                <Checkbox label="b. Estudiante" checked={s.nombre_actividad === 'Estudiante'} />
              </View>
              {/* @ts-ignore */}
              <View>
                <Checkbox label="c. Pensionado/Jubilado" checked={s.nombre_actividad === 'Pensionado/Jubilado' || s.nombre_actividad === 'Pensionado' || s.nombre_actividad === 'Jubilado'} />
                <Checkbox label="d. Otra" checked={s.nombre_actividad === 'Otra'} />
              </View>
            </View>
          </View>
        </View>

        {/* II. VIVIENDA */}
        {/* @ts-ignore */}
        <View style={[styles.sectionHeader, { marginTop: 20 }]}>
          {/* @ts-ignore */}
          <Text style={styles.sectionTitle}>II. VIVIENDA Y SERVICIOS CONEXOS</Text>
        </View>

        {/* Row 1: Q15 label */}
        {/* @ts-ignore */}
        <View style={{ marginBottom: 5 }}>
          {/* @ts-ignore */}
          <Text style={styles.label}>15. ¿En qué tipo de vivienda habita?</Text>
        </View>

        {/* Q15 Options - horizontal */}
        {/* @ts-ignore */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
          <Checkbox label="1. Quinta/Casa" checked={s.tipo_vivienda === 'Quinta' || s.tipo_vivienda === 'Casa Urb.'} />
          <Checkbox label="2. Apto" checked={s.tipo_vivienda === 'Apartamento'} />
          <Checkbox label="3. Bloque" checked={s.tipo_vivienda === 'Bloque'} />
          <Checkbox label="4. Casa Barrio" checked={s.tipo_vivienda === 'Casa de Barrio'} />
          <Checkbox label="5. Casa rural" checked={s.tipo_vivienda === 'Casa rural'} />
          <Checkbox label="6. Rancho" checked={s.tipo_vivienda === 'Rancho'} />
          <Checkbox label="7. Refugio" checked={s.tipo_vivienda === 'Refugio'} />
          <Checkbox label="8. Otro" checked={false} />
        </View>

        {/* Q16 and Q17 below */}
        {/* @ts-ignore */}
        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          {/* @ts-ignore */}
          <View style={{ width: '50%', flexDirection: 'row', alignItems: 'center' }}>
            {/* @ts-ignore */}
            <Text style={styles.label}>16. ¿Cuántas habitaciones tienen para dormir?</Text>
            <CharacterBoxes value={String(s.cant_habitaciones || '')} count={2} />
          </View>
          {/* @ts-ignore */}
          <View style={{ width: '50%', flexDirection: 'row', alignItems: 'center' }}>
            {/* @ts-ignore */}
            <Text style={styles.label}>17. ¿Cuántos baños tiene su vivienda?</Text>
            <CharacterBoxes value={String(s.cant_banos || '')} count={2} />
          </View>
        </View>

        {/* Materials Row: 18, 19, 20 */}
        {/* @ts-ignore */}
        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          {/* 18. Piso */}
          {/* @ts-ignore */}
          <View style={{ width: '33%' }}>
            {/* @ts-ignore */}
            <Text style={[styles.label, { marginBottom: 2 }]}>18. Material del piso</Text>
            <Checkbox label="1. Tierra" checked={s.material_piso === 'Tierra'} />
            <Checkbox label="2. Cemento" checked={s.material_piso === 'Cemento'} />
            <Checkbox label="3. Cerámica" checked={s.material_piso === 'Cerámica'} />
            <Checkbox label="4. Granito/Mármol" checked={s.material_piso?.includes('Granito')} />
          </View>

          {/* 19. Paredes */}
          {/* @ts-ignore */}
          <View style={{ width: '33%' }}>
            {/* @ts-ignore */}
            <Text style={[styles.label, { marginBottom: 2 }]}>19. Material paredes</Text>
            <Checkbox label="1. Cartón/Palma" checked={s.material_paredes?.includes('Cartón')} />
            <Checkbox label="2. Bahareque" checked={s.material_paredes === 'Bahareque'} />
            <Checkbox label="3. Bloque sin frizar" checked={s.material_paredes === 'Bloque sin frizar'} />
            <Checkbox label="4. Bloque frizado" checked={s.material_paredes === 'Bloque frizado'} />
          </View>

          {/* 20. Techo */}
          {/* @ts-ignore */}
          <View style={{ width: '33%' }}>
            {/* @ts-ignore */}
            <Text style={[styles.label, { marginBottom: 2 }]}>20. Material techo</Text>
            <Checkbox label="1. Madera/Cartón" checked={s.material_techo?.includes('Madera')} />
            <Checkbox label="2. Zinc/Acerolit" checked={s.material_techo?.includes('Zinc')} />
            <Checkbox label="3. Platabanda/Tejas" checked={s.material_techo?.includes('Platabanda')} />
          </View>
        </View>

        {/* Services Row: 21, 22, 23 */}
        {/* @ts-ignore */}
        <View style={{ flexDirection: 'row' }}>
          {/* 21. Agua Potable */}
          {/* @ts-ignore */}
          <View style={{ width: '33%' }}>
            {/* @ts-ignore */}
            <Text style={[styles.label, { marginBottom: 2 }]}>21. Agua potable</Text>
            <Checkbox label="1. Dentro vivienda" checked={s.agua_potable === 'Dentro de la vivienda'} />
            <Checkbox label="2. Fuera vivienda" checked={s.agua_potable === 'Fuera de la vivienda'} />
            <Checkbox label="3. No tiene" checked={s.agua_potable === 'No tiene'} />
          </View>

          {/* 22. Excretas */}
          {/* @ts-ignore */}
          <View style={{ width: '33%' }}>
            {/* @ts-ignore */}
            <Text style={[styles.label, { marginBottom: 2 }]}>22. Eliminación excretas</Text>
            <Checkbox label="1. Poceta/cloaca" checked={s.eliminacion_aguas_n?.includes('Poceta')} />
            <Checkbox label="2. Poceta sin conexión" checked={s.eliminacion_aguas_n?.includes('sin conexión')} />
            <Checkbox label="3. Letrina" checked={s.eliminacion_aguas_n?.includes('letrina')} />
            <Checkbox label="4. No tiene" checked={s.eliminacion_aguas_n === 'No tiene'} />
          </View>

          {/* 23. Aseo */}
          {/* @ts-ignore */}
          <View style={{ width: '33%' }}>
            {/* @ts-ignore */}
            <Text style={[styles.label, { marginBottom: 2 }]}>23. Servicio aseo</Text>
            <Checkbox label="1. Llega a vivienda" checked={s.aseo === 'Llega a la vivienda'} />
            <Checkbox label="2. No llega" checked={s.aseo === 'No llega a la vivienda' || s.aseo === 'Container'} />
            <Checkbox label="3. No tiene" checked={s.aseo === 'No tiene'} />
          </View>
        </View>

        {/* 23. Artefactos Domesticos */}
        {/* @ts-ignore */}
        <View style={{ marginTop: 15 }}>
          {/* @ts-ignore */}
          <Text style={[styles.label, { marginBottom: 5 }]}>23. Artefactos domésticos, bienes o servicios del hogar</Text>
          {/* @ts-ignore */}
          <View style={{ flexDirection: 'row' }}>
            {/* @ts-ignore */}
            <View style={{ width: '25%' }}>
              <Checkbox label="1. Nevera" checked={s.artefactos_domesticos?.includes && s.artefactos_domesticos.includes('Nevera')} />
              <Checkbox label="2. Lavadora" checked={s.artefactos_domesticos?.includes && s.artefactos_domesticos.includes('Lavadora')} />
              <Checkbox label="3. Computadora" checked={s.artefactos_domesticos?.includes && s.artefactos_domesticos.includes('Computadora')} />
              <Checkbox label="4. Cable Satelital" checked={s.artefactos_domesticos?.includes && s.artefactos_domesticos.includes('Cable Satelital')} />
            </View>
            {/* @ts-ignore */}
            <View style={{ width: '25%' }}>
              <Checkbox label="5. Internet" checked={s.artefactos_domesticos?.includes && s.artefactos_domesticos.includes('Internet')} />
              <Checkbox label="6. Carro" checked={s.artefactos_domesticos?.includes && s.artefactos_domesticos.includes('Carro')} />
              <Checkbox label="7. Moto" checked={s.artefactos_domesticos?.includes && s.artefactos_domesticos.includes('Moto')} />
            </View>
          </View>
        </View>

      </Page>
      {/* PAGE 2 */}
      {/* @ts-ignore */}
      <Page size="A4" style={styles.page}>
        {/* HEADER REPEATED */}
        {/* @ts-ignore */}
        <View style={styles.headerContainer}>
          {logoBase64 ? (
            // @ts-ignore
            <Image style={styles.logo} src={logoBase64} />
          ) : (
            // @ts-ignore
            <Text style={[styles.logo, { paddingTop: 10 }]}>UCAB</Text>
          )}
          {/* @ts-ignore */}
          <View style={styles.titleContainer}>
            {/* @ts-ignore */}
            <Text style={styles.mainTitle}>REGISTRO Y CONTROL DE BENEFICIARIOS</Text>
          </View>
        </View>

        {/* III. FAMILIA */}
        {/* @ts-ignore */}
        <View style={[styles.sectionHeader, { marginTop: 15 }]}>
          {/* @ts-ignore */}
          <Text style={styles.sectionTitle}>III. FAMILIA Y HOGAR</Text>
        </View>

        {/* @ts-ignore */}
        <View style={styles.row}>
          {/* @ts-ignore */}
          <Text style={styles.label}>24. ¿Cuántas personas viven en la vivienda, incluyéndolo a usted?</Text>
          <CharacterBoxes value={String(s.cant_personas || 0)} count={2} />
        </View>

        {/* 25. Jefe de Hogar & 25a. Educacion Jefe */}
        {/* @ts-ignore */}
        <View style={{ flexDirection: 'row', marginTop: 5 }}>
          {/* Left: 25 */}
          {/* @ts-ignore */}
          <View style={{ width: '30%' }}>
            {/* @ts-ignore */}
            <Text style={styles.label}>25. ¿Es usted el jefe de hogar?</Text>
            <Checkbox label="1. Sí" checked={s.jefe_hogar} />
            <Checkbox label="2. No" checked={!s.jefe_hogar} />
          </View>

          {/* Right: 25a Education Jefe */}
          {/* @ts-ignore */}
          <View style={{ width: '70%', paddingLeft: 10 }}>
            {/* @ts-ignore */}
            <Text style={styles.label}>{'-> 25a. Educación alcanzada por el jefe de hogar:'}</Text>
            {/* @ts-ignore */}
            <View style={{ flexDirection: 'row', marginTop: 3 }}>
              {/* Levels */}
              {/* @ts-ignore */}
              <View style={{ width: '60%' }}>
                <Checkbox label="0. Sin Nivel" checked={s.nivel_educativo_jefe === 'Sin Nivel'} />
                <Checkbox label="1-6. Primaria" checked={s.nivel_educativo_jefe === 'Primaria'} />
                <Checkbox label="7-9. Básica" checked={s.nivel_educativo_jefe === 'Básica'} />
                <Checkbox label="10-11. Media Div." checked={s.nivel_educativo_jefe === 'Media Diversificada'} />
                <Checkbox label="12. Tec. Medio" checked={s.nivel_educativo_jefe === 'Técnico Medio'} />
                <Checkbox label="13. Tec. Superior" checked={s.nivel_educativo_jefe === 'Técnico Superior'} />
                <Checkbox label="14. Univ." checked={s.nivel_educativo_jefe === 'Universitaria'} />
              </View>
              {/* Duration */}
              {/* @ts-ignore */}
              <View style={{ width: '40%' }}>
                {/* @ts-ignore */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 5, marginBottom: 3 }}>
                  <Text style={styles.valueText}>a. Años</Text>
                  <View style={styles.checkbox}>
                    {s.tipo_tiempo_estudio_jefe === 'Años' && <Text style={styles.checkMark}>{s.tiempo_estudio_jefe || ''}</Text>}
                  </View>
                </View>
                {/* @ts-ignore */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 5, marginBottom: 3 }}>
                  <Text style={styles.valueText}>b. Semestres</Text>
                  <View style={styles.checkbox}>
                    {s.tipo_tiempo_estudio_jefe === 'Semestres' && <Text style={styles.checkMark}>{s.tiempo_estudio_jefe || ''}</Text>}
                  </View>
                </View>
                {/* @ts-ignore */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 5, marginBottom: 3 }}>
                  <Text style={styles.valueText}>c. Trimestres</Text>
                  <View style={styles.checkbox}>
                    {s.tipo_tiempo_estudio_jefe === 'Trimestres' && <Text style={styles.checkMark}>{s.tiempo_estudio_jefe || ''}</Text>}
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>


        {/* 26 Trabajan & 27 No Trabajan */}
        {/* @ts-ignore */}
        <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
          {/* 26 */}
          {/* @ts-ignore */}
          <View style={{ width: '50%', flexDirection: 'row', alignItems: 'center' }}>
            {/* @ts-ignore */}
            <View>
              {/* @ts-ignore */}
              <Text style={styles.label}>26. ¿Cuántos miembros del hogar trabajan?</Text>
              {/* @ts-ignore */}
              <Text style={[styles.valueText, { fontSize: 7, fontStyle: 'italic' }]}>{'(Asegúrese que la suma sea igual a los miembros del Hogar)'}</Text>
            </View>
            <CharacterBoxes value={String(s.cant_trabajadores || '')} count={2} />
          </View>
          {/* 27 */}
          {/* @ts-ignore */}
          <View style={{ width: '50%', flexDirection: 'row', alignItems: 'center' }}>
            {/* @ts-ignore */}
            <View>
              {/* @ts-ignore */}
              <Text style={styles.label}>27. ¿Cuántos NO trabajan?</Text>
              {/* @ts-ignore */}
              <Text style={[styles.valueText, { fontSize: 7, fontStyle: 'italic' }]}>{'(Incluya niños y adultos mayores)'}</Text>
            </View>
            <CharacterBoxes value={String(s.cant_no_trabajadores || '')} count={2} />
          </View>
        </View>

        {/* 28 Niños & 28a Estudian */}
        {/* @ts-ignore */}
        <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
          {/* 28 */}
          {/* @ts-ignore */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
            {/* @ts-ignore */}
            <Text style={styles.label}>28. Número de Niños entre 7 y 12 años en el hogar:</Text>
            <CharacterBoxes value={String(ninos)} count={2} />
          </View>
          {/* 28a */}
          {/* @ts-ignore */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* @ts-ignore */}
            <Text style={styles.label}>{'-> 28a. ¿Cuántos estudian?'}</Text>
            <CharacterBoxes value={String(s.cant_ninos_estudiando || '')} count={2} />
          </View>
        </View>

        {/* 29 Ingresos */}
        {/* @ts-ignore */}
        <View style={[styles.row, { marginTop: 10 }]}>
          {/* @ts-ignore */}
          <Text style={styles.label}>29. Ingresos mensuales del hogar:</Text>
          {/* @ts-ignore */}
          <View style={[styles.underlined, { width: 200, flexGrow: 0 }]}>
            {/* @ts-ignore */}
            <Text style={styles.valueText}>{s.ingresos_mensuales}</Text>
          </View>
        </View>

        {/* SIGNATURES */}
        {/* @ts-ignore */}
        <View style={[styles.row, { marginTop: 40, justifyContent: 'space-between' }]}>
          {/* @ts-ignore */}
          <View style={styles.signatureContainer}>
            {/* @ts-ignore */}
            <Text style={styles.label}>30. Alumno:</Text>
            {/* @ts-ignore */}
            <View style={styles.signatureLine} />
          </View>
          {/* @ts-ignore */}
          <View style={styles.signatureContainer}>
            {/* @ts-ignore */}
            <Text style={styles.label}>31. Profesor:</Text>
            {/* @ts-ignore */}
            <View style={styles.signatureLine} />
          </View>
        </View>

      </Page>
    </Document>
  );
}