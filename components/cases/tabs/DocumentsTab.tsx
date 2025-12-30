'use client';

import { FileText, Download, Calendar, File } from 'lucide-react';
import { formatDate } from '@/lib/utils/date-formatter';

interface DocumentsTabProps {
  soportes?: Array<{
    num_soporte: number;
    id_caso: number;
    nombre_archivo: string;
    tipo_mime: string;
    descripcion: string | null;
    fecha_consignacion: string;
    tamano_bytes: number;
  }>;
}

export default function DocumentsTab({ soportes }: DocumentsTabProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    return '📎';
  };

  if (!soportes || soportes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No hay documentos registrados para este caso</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {soportes.map((soporte) => (
        <div key={`${soporte.num_soporte}-${soporte.id_caso}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{getFileIcon(soporte.tipo_mime)}</div>
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-gray-900">{soporte.nombre_archivo}</h4>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(soporte.fecha_consignacion)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Tipo de Archivo</label>
                <p className="text-base text-gray-900 mt-1">{soporte.tipo_mime}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tamaño</label>
                <p className="text-base text-gray-900 mt-1">{formatFileSize(soporte.tamano_bytes)}</p>
              </div>
            </div>

            {soporte.descripcion && (
              <div>
                <label className="text-sm font-medium text-gray-500">Descripción</label>
                <p className="text-base text-gray-900 mt-1 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 border border-gray-200">
                  {soporte.descripcion}
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-gray-200">
              <button
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                onClick={() => {
                  // TODO: Implementar descarga de archivo
                  alert('Funcionalidad de descarga en desarrollo');
                }}
              >
                <Download className="w-4 h-4" />
                Descargar Archivo
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

