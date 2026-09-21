'use client';

import React from 'react';
import { Text, StyleSheet } from '@react-pdf/renderer';
import { getExportStamp } from '@/lib/utils/export-timestamp';

const styles = StyleSheet.create({
    stamp: {
        position: 'absolute',
        // Helvetica es una fuente base de PDF: no depende de Font.register,
        // así que la marca se ve igual en todos los reportes.
        fontFamily: 'Helvetica',
        fontSize: 7,
        color: '#8a8a8a',
        textAlign: 'right',
    },
});

interface ExportStampProps {
    /** Momento de la exportación. Por defecto, el instante en que se arma el PDF. */
    exportedAt?: Date;
    /**
     * Distancia al borde de la hoja, en puntos. En react-pdf el posicionamiento
     * absoluto se mide desde el borde del papel (ignora el padding del <Page>),
     * así que este valor debe coincidir con el padding de la página para que la
     * marca quede alineada con el resto del contenido.
     */
    offset?: number;
}

/**
 * Marca "Exportado: DD/MM/YYYY, hh:mm a. m." anclada a la esquina superior
 * derecha. Va como hijo directo de un <Page>: al ser `fixed` se repite en
 * todas las páginas que ese <Page> genere, y al ser absoluta no desplaza el
 * contenido existente.
 */
export const ExportStamp: React.FC<ExportStampProps> = ({ exportedAt, offset = 20 }) => (
    <Text fixed style={[styles.stamp, { top: offset, right: offset }]}>
        {getExportStamp(exportedAt)}
    </Text>
);

export default ExportStamp;
