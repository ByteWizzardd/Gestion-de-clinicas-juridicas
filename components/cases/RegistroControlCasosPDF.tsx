'use client';

import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { formatDate } from '@/lib/utils/date-formatter';

interface RegistroControlCasosPDFProps {
    data: {
        caso: any;
        equipo: any[];
        beneficiarios: any[];
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
        marginBottom: 10,
        marginTop: 0,
        flexDirection: 'column',
        alignItems: 'center',
    },
    logo: {
        width: 200,
        height: 60,
        objectFit: 'contain',
        alignSelf: 'flex-start',
        marginBottom: 5,
    },
    mainTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
    },
    redBar: {
        backgroundColor: '#8B1C1C',
        width: '100%',
        padding: 3,
        marginBottom: 20,
    },
    redBarTitle: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    // Form Layout
    formRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    label: {
        fontSize: 9,
        fontWeight: 'bold',
        marginRight: 5,
    },
    valueText: {
        fontSize: 9,
        fontFamily: 'Helvetica',
    },
    // Specific Elements
    dateBoxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateBoxGroup: {
        alignItems: 'center',
        marginRight: 5,
    },
    dateBoxLabel: {
        fontSize: 6,
        marginBottom: 1,
        color: '#666',
    },
    boxField: {
        borderWidth: 1,
        borderColor: '#000',
        padding: 2,
        width: 20,
        height: 15,
        textAlign: 'center',
        justifyContent: 'center',
        fontSize: 9,
    },
    caseNumBox: {
        borderWidth: 1,
        borderColor: '#000',
        width: 15,
        height: 15,
        textAlign: 'center',
        justifyContent: 'center',
        fontSize: 9,
        marginLeft: 2,
    },
    underlinedField: {
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        paddingBottom: 1,
        flexGrow: 1,
        minWidth: 50,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
        width: '45%',
    },
    checkbox: {
        width: 12,
        height: 12,
        borderWidth: 1,
        borderColor: '#000',
        marginLeft: 'auto', // Push to right
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmark: {
        fontSize: 8, // Reduced slightly to fit safely in 12x12 box
        fontWeight: 'bold',
        marginTop: 1, // Slight adjustment for vertical centering
    },
    observationsContainer: {
        marginTop: 10,
        borderWidth: 2,
        borderColor: '#000',
        minHeight: 150,
        padding: 5,
    },
    observationLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        height: 18,
        width: '100%',
        marginBottom: 2,
    },
    sectionLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    gridTwoCols: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginLeft: 50, // Indent for checkboxes
    }
});

// Helper Components adapted from SolicitanteFichaPDF
const CharacterBoxes = ({ value, count }: { value: string, count: number }) => {
    // Ensure value is a string and pad
    const safeValue = String(value || '').padStart(count, '0');
    // Take last 'count' characters if longer, or just split
    const chars = safeValue.slice(-count).split('');
    return (
        <View style={{ flexDirection: 'row' }}>
            {Array.from({ length: count }).map((_, i) => (
                <View key={i} style={styles.caseNumBox}>
                    <Text>{chars[i] || '0'}</Text>
                </View>
            ))}
        </View>
    );
};

const DateBoxes = ({ date }: { date?: string | Date | null }) => {
    let day = '';
    let month = '';
    let year = '';

    if (date) {
        if (date instanceof Date) {
            day = date.getDate().toString().padStart(2, '0');
            month = (date.getMonth() + 1).toString().padStart(2, '0');
            year = date.getFullYear().toString();
        } else if (typeof date === 'string') {
            // Manual check for YYYY-MM-DD
            if (date.includes('-') && date.length >= 10) {
                const part = date.split('T')[0];
                const parts = part.split('-');
                if (parts.length === 3) {
                    year = parts[0];
                    month = parts[1];
                    day = parts[2];
                }
            } else {
                // Fallback
                const d = new Date(date);
                if (!isNaN(d.getTime())) {
                    day = d.getDate().toString().padStart(2, '0');
                    month = (d.getMonth() + 1).toString().padStart(2, '0');
                    year = d.getFullYear().toString();
                }
            }
        }
    }

    // Default to current date if parsing failed or null
    if (!day || !month || !year) {
        const d = new Date();
        day = d.getDate().toString().padStart(2, '0');
        month = (d.getMonth() + 1).toString().padStart(2, '0');
        year = d.getFullYear().toString();
    }

    return (
        <View style={styles.dateBoxContainer}>
            {/* Replicating SolicitanteFichaPDF style: just boxes, no labels */}
            <CharacterBoxes value={day} count={2} />
            <View style={{ width: 10 }} /> {/* Spacer */}

            <CharacterBoxes value={month} count={2} />
            <View style={{ width: 10 }} /> {/* Spacer */}

            <CharacterBoxes value={year} count={4} />
        </View>
    );
};

export function RegistroControlCasosPDF({ data, logoBase64 }: RegistroControlCasosPDFProps) {
    const { caso } = data;

    // Profesores y Alumnos - Case Insensitive Search & Multiple Support
    const profesores = data.equipo?.filter((m: any) =>
        (m.rol?.toLowerCase() === 'profesor' || m.tipo?.toLowerCase() === 'profesor')
    ).map((p: any) => p.cedula).join(', ');

    const alumnos = data.equipo?.filter((m: any) =>
        (m.rol?.toLowerCase() === 'estudiante' || m.tipo?.toLowerCase() === 'estudiante')
    ).map((a: any) => a.cedula).join(', ');

    // Tramite Check logic - Case Insensitive & Trimmed
    const tramite = (caso.tramite || '').trim().toLowerCase();
    const isAsesoria = tramite === 'asesoría' || tramite === 'asesoria';
    const isConciliacion = tramite.includes('conciliación') || tramite.includes('conciliacion');
    const isRedaccion = tramite.includes('redacción') || tramite.includes('redaccion');
    const isJudicial = tramite.includes('judicial');

    // Estatus Check logic - Case Insensitive & Trimmed
    const estatus = (caso.estatus || '').trim().toLowerCase();
    const isEnProceso = estatus === 'en proceso';
    const isArchivado = estatus === 'archivado';
    const isEntregado = estatus === 'entregado';
    const isAsesoriaEstatus = estatus === 'asesoría' || estatus === 'asesoria';

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* Header */}
                <View style={styles.header}>
                    <Image style={styles.logo} src={logoBase64} />
                    <Text style={styles.mainTitle}>REGISTRO Y CONTROL DE CASOS</Text>
                </View>

                {/* Red Bar */}
                <View style={styles.redBar}>
                    <Text style={styles.redBarTitle}>INFORMACIÓN DEL CASO</Text>
                </View>

                {/* Row 1: Fecha, Caso N, CI */}
                <View style={styles.formRow}>
                    {/* 1. Fecha del Caso - Expanded to 50% to fit DateBoxes */}
                    <View style={{ width: '50%', flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.label}>1. Fecha del Caso:</Text>
                        <DateBoxes date={caso.fecha_solicitud || caso.fecha_inicio_caso} />
                    </View>

                    {/* 2. Caso N - Kept at 25% */}
                    <View style={{ width: '25%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={styles.label}>2. Caso N°:</Text>
                        <CharacterBoxes value={String(caso.id_caso || '000').padStart(3, '0')} count={3} />
                    </View>

                    {/* 3. CI - Reduced to 25% */}
                    <View style={{ width: '25%', flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.label}>3. C.I N°:</Text>
                        <View style={[styles.underlinedField, { borderBottomWidth: 2 }]}>
                            <Text style={[styles.valueText, { textAlign: 'center' }]}>{caso.cedula}</Text>
                        </View>
                    </View>
                </View>

                {/* Row 2: Beneficiarios */}
                <View style={styles.formRow}>
                    <Text style={styles.label}>4. N° beneficiarios:</Text>
                    <View style={{ width: 30, borderBottomWidth: 2, borderBottomColor: '#000', marginRight: 10, alignItems: 'center' }}>
                        <Text style={styles.valueText}>{data.beneficiarios?.length || 0}</Text>
                    </View>
                </View>

                {/* Row 3: Tipo de Caso */}
                <View style={styles.formRow}>
                    <Text style={styles.label}>5. Tipo de Caso:</Text>
                    <View style={[styles.underlinedField, { borderBottomWidth: 2 }]}>
                        {(() => {
                            const cat = caso.nombre_categoria;
                            const sub = caso.nombre_subcategoria;
                            const amb = caso.nombre_ambito_legal;

                            const hasCat = cat && cat.toLowerCase() !== 'sin categoría' && cat.toLowerCase() !== 'n/a';
                            const hasSub = sub && sub.toLowerCase() !== 'sin subcategoría' && sub.toLowerCase() !== 'n/a';
                            const hasAmb = amb && amb.toLowerCase() !== 'sin ámbito' && amb.toLowerCase() !== 'n/a';

                            return (
                                <Text style={styles.valueText}>
                                    {`${caso.nombre_materia || ''}${hasCat ? ` (${cat})` : ''}${hasSub ? ` - ${sub}` : ''}${hasAmb ? ` - ${amb}` : ''}`}
                                </Text>
                            );
                        })()}
                    </View>
                </View>

                {/* Row 4: Tramite */}
                <View style={{ marginBottom: 15 }}>
                    <Text style={styles.sectionLabel}>6. Trámite:</Text>
                    <View style={styles.gridTwoCols}>
                        <View style={styles.checkboxContainer}>
                            <Text style={styles.valueText}>1. Asesoría</Text>
                            <View style={styles.checkbox}>
                                {isAsesoria && <Text style={styles.checkmark}>X</Text>}
                            </View>
                        </View>
                        <View style={styles.checkboxContainer}>
                            <Text style={styles.valueText}>3. Redacción documentos y/o convenio</Text>
                            <View style={styles.checkbox}>
                                {isRedaccion && <Text style={styles.checkmark}>X</Text>}
                            </View>
                        </View>
                        <View style={styles.checkboxContainer}>
                            <Text style={styles.valueText}>2. Conciliación y Mediación</Text>
                            <View style={styles.checkbox}>
                                {isConciliacion && <Text style={styles.checkmark}>X</Text>}
                            </View>
                        </View>
                        <View style={styles.checkboxContainer}>
                            <Text style={styles.valueText}>4. Asistencia Judicial - Casos Externos</Text>
                            <View style={styles.checkbox}>
                                {isJudicial && <Text style={styles.checkmark}>X</Text>}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Row 5: Profesores y Alumnos */}
                <View style={styles.formRow}>
                    {/* 7. CI Profesor */}
                    <View style={{ width: '50%', flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.label}>7. C.I Profesor:</Text>
                        <View style={[styles.underlinedField, { borderBottomWidth: 2, marginRight: 20 }]}>
                            <Text style={styles.valueText}>{profesores || ''}</Text>
                        </View>
                    </View>

                    {/* 8. CI Alumno */}
                    <View style={{ width: '50%', flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.label}>8. C.I Alumno:</Text>
                        <View style={[styles.underlinedField, { borderBottomWidth: 2 }]}>
                            <Text style={styles.valueText}>{alumnos || ''}</Text>
                        </View>
                    </View>
                </View>

                {/* Row 6: Estatus */}
                <View style={{ marginBottom: 15 }}>
                    <Text style={styles.sectionLabel}>9. Estatus</Text>
                    <View style={styles.gridTwoCols}>
                        <View style={styles.checkboxContainer}>
                            <Text style={styles.valueText}>1. En proceso</Text>
                            <View style={styles.checkbox}>
                                {isEnProceso && <Text style={styles.checkmark}>X</Text>}
                            </View>
                        </View>
                        <View style={styles.checkboxContainer}>
                            <Text style={styles.valueText}>3. Entregado</Text>
                            <View style={styles.checkbox}>
                                {isEntregado && <Text style={styles.checkmark}>X</Text>}
                            </View>
                        </View>
                        <View style={styles.checkboxContainer}>
                            <Text style={styles.valueText}>2. Archivado</Text>
                            <View style={styles.checkbox}>
                                {isArchivado && <Text style={styles.checkmark}>X</Text>}
                            </View>
                        </View>
                        <View style={styles.checkboxContainer}>
                            <Text style={styles.valueText}>4. Asesoría</Text>
                            <View style={styles.checkbox}>
                                {isAsesoriaEstatus && <Text style={styles.checkmark}>X</Text>}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Row 7: Observaciones */}
                <View>
                    <Text style={styles.sectionLabel}>Observaciones:</Text>
                    <View style={styles.observationsContainer}>
                        {/* First line with text if available */}
                        <Text style={{ fontSize: 9, lineHeight: 1.5, marginBottom: 5 }}>
                            {caso.observaciones || ''}
                        </Text>
                        {/* Lined Background simulation */}
                        {Array.from({ length: 15 }).map((_, i) => (
                            <View key={i} style={styles.observationLine} />
                        ))}
                    </View>
                </View>

            </Page>
        </Document>
    );
}
