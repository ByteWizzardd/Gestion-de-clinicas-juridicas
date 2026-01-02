'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, File, Loader2, Image, FileEdit, FileSpreadsheet, Trash2, User } from 'lucide-react';
import { formatDate } from '@/lib/utils/date-formatter';
import { downloadSoporteAction, deleteSoporteAction } from '@/app/actions/casos';
import ConfirmModal from '@/components/ui/feedback/ConfirmModal';

interface DocumentsTabProps {
  soportes?: Array<{
    num_soporte: number;
    id_caso: number;
    nombre_archivo: string;
    tipo_mime: string;
    descripcion: string | null;
    fecha_consignacion: string;
    tamano_bytes: number;
    // Información de auditoría: usuario que subió
    id_usuario_subio: string | null;
    nombres_usuario_subio: string | null;
    apellidos_usuario_subio: string | null;
    nombre_completo_usuario_subio: string | null;
    fecha_subida: string | null;
  }>;
  onSoporteDeleted?: () => void;
}

export default function DocumentsTab({ soportes, onSoporteDeleted }: DocumentsTabProps) {
  const [downloading, setDownloading] = useState<{ idCaso: number; numSoporte: number } | null>(null);
  const [deleting, setDeleting] = useState<{ idCaso: number; numSoporte: number } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ idCaso: number; numSoporte: number; nombreArchivo: string } | null>(null);
  const [motivoEliminacion, setMotivoEliminacion] = useState('');
  const [soportesState, setSoportesState] = useState(soportes || []);

  // Sincronizar estado cuando cambien los soportes desde el padre
  useEffect(() => {
    setSoportesState(soportes || []);
  }, [soportes]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDownload = async (idCaso: number, numSoporte: number, nombreArchivo: string) => {
    setDownloading({ idCaso, numSoporte });
    try {
      const result = await downloadSoporteAction(idCaso, numSoporte);
      
      if (!result.success || !result.data) {
        alert(result.error?.message || 'Error al descargar el archivo');
        return;
      }

      // Convertir base64 a blob
      const byteCharacters = atob(result.data.documento_data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: result.data.tipo_mime });

      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.data.nombre_archivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar:', error);
      alert('Error al descargar el archivo');
    } finally {
      setDownloading(null);
    }
  };

  const handleDelete = async (idCaso: number, numSoporte: number) => {
    if (!confirmDelete) return;
    
    if (!motivoEliminacion.trim()) {
      alert('Debe proporcionar un motivo para la eliminación');
      return;
    }
    
    setDeleting({ idCaso, numSoporte });
    try {
      const result = await deleteSoporteAction(idCaso, numSoporte, motivoEliminacion.trim());
      
      if (!result.success) {
        alert(result.error?.message || 'Error al eliminar el archivo');
        return;
      }

      // Remover el soporte del estado local
      setSoportesState(prev => prev.filter(s => 
        !(s.id_caso === idCaso && s.num_soporte === numSoporte)
      ));
      
      setConfirmDelete(null);
      setMotivoEliminacion('');
      
      // Notificar al padre para que recargue los datos
      onSoporteDeleted?.();
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar el archivo');
    } finally {
      setDeleting(null);
    }
  };

  const getFileIcon = (mimeType: string) => {
    const mimeLower = mimeType.toLowerCase();
    
    // PDF: application/pdf
    if (mimeLower === 'application/pdf' || mimeLower.includes('pdf')) {
      return <FileText className="w-8 h-8 text-gray-600" />;
    }
    
    // Imágenes: image/*
    if (mimeLower.startsWith('image/')) {
      return <Image className="w-8 h-8 text-gray-600" />;
    }
    
    // Word: application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document
    if (mimeLower.includes('msword') || 
        mimeLower.includes('wordprocessingml') || 
        mimeLower.includes('application/vnd.ms-word') ||
        mimeLower.includes('docx')) {
      return <FileEdit className="w-8 h-8 text-gray-600" />;
    }
    
    // Excel: application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
    if (mimeLower.includes('ms-excel') || 
        mimeLower.includes('spreadsheetml') || 
        mimeLower.includes('application/vnd.ms-excel') ||
        mimeLower.includes('xlsx')) {
      return <FileSpreadsheet className="w-8 h-8 text-gray-600" />;
    }
    
    // Por defecto
    return <File className="w-8 h-8 text-gray-600" />;
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
    <>
      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => {
          setConfirmDelete(null);
          setMotivoEliminacion('');
        }}
        onConfirm={() => confirmDelete && handleDelete(confirmDelete.idCaso, confirmDelete.numSoporte)}
        title="Eliminar Soporte"
        message={
          <div>
            <p className="mb-4 text-base text-foreground">
              ¿Estás seguro de que deseas eliminar el archivo <strong>{confirmDelete?.nombreArchivo}</strong>?
            </p>
            <p className="mb-6 text-red-600 font-semibold text-base">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex flex-col gap-1">
              <label className="text-base font-normal text-foreground mb-1">
                Motivo de la eliminación
              </label>
              <textarea
                className={`
                  w-full p-4 rounded-lg border bg-[#E5E7EB] border-transparent
                  focus:outline-none focus:ring-1 focus:ring-primary
                  text-base placeholder:text-[#717171] resize-none
                  ${deleting ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                rows={4}
                maxLength={500}
                value={motivoEliminacion}
                onChange={(e) => setMotivoEliminacion(e.target.value)}
                placeholder="Describe el motivo de la eliminación..."
                disabled={!!deleting}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {motivoEliminacion.length} / 500 caracteres
              </div>
            </div>
          </div>
        }
        confirmLabel={deleting ? 'Eliminando...' : 'Eliminar'}
        cancelLabel="Cancelar"
        disabled={!!deleting || !motivoEliminacion.trim()}
      />
      
    <div className="space-y-4">
        {soportesState.map((soporte) => {
          const isDeleting = deleting?.idCaso === soporte.id_caso && deleting?.numSoporte === soporte.num_soporte;
          
          return (
        <div key={`${soporte.num_soporte}-${soporte.id_caso}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 relative group">
          {/* Icono de eliminar en la esquina superior derecha */}
          <button
            onClick={() => setConfirmDelete({ idCaso: soporte.id_caso, numSoporte: soporte.num_soporte, nombreArchivo: soporte.nombre_archivo })}
            disabled={isDeleting || downloading?.idCaso === soporte.id_caso && downloading?.numSoporte === soporte.num_soporte}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title="Eliminar archivo"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>

          <div className="flex items-start justify-between mb-4 pr-8">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center">{getFileIcon(soporte.tipo_mime)}</div>
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
                <p className="text-base text-gray-900 mt-1">{soporte.tipo_mime.replace(/^application\//, '')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tamaño</label>
                <p className="text-base text-gray-900 mt-1">{formatFileSize(soporte.tamano_bytes)}</p>
              </div>
            </div>

            {soporte.nombre_completo_usuario_subio && (
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Subido por
                </label>
                <p className="text-base text-gray-900 mt-1">{soporte.nombre_completo_usuario_subio}</p>
                {soporte.fecha_subida && (
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(soporte.fecha_subida)}
                  </p>
                )}
              </div>
            )}

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
                className="inline-flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary-light rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                onClick={() => handleDownload(soporte.id_caso, soporte.num_soporte, soporte.nombre_archivo)}
                disabled={downloading?.idCaso === soporte.id_caso && downloading?.numSoporte === soporte.num_soporte || isDeleting}
              >
                {downloading?.idCaso === soporte.id_caso && downloading?.numSoporte === soporte.num_soporte ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Descargando...
                  </>
                ) : (
                  <>
                <Download className="w-4 h-4" />
                    Descargar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
          );
        })}
    </div>
    </>
  );
}

