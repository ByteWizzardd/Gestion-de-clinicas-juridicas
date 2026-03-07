'use client';

import { useState } from 'react';
import Modal from '@/components/ui/feedback/Modal';
import Button from '@/components/ui/Button';
import { Upload, File, X } from 'lucide-react';
import { uploadSoportesAction } from '@/app/actions/casos';

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  idCaso: number;
  onSuccess?: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB en bytes

export default function AddDocumentModal({ isOpen, onClose, idCaso, onSuccess }: AddDocumentModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setError(null);

      // Validar tamaño de cada archivo
      const invalidFiles = newFiles.filter(file => file.size > MAX_FILE_SIZE);
      if (invalidFiles.length > 0) {
        const fileNames = invalidFiles.map(f => f.name).join(', ');
        setError(`Los siguientes archivos exceden el límite de 10MB: ${fileNames}`);
        // Solo añadir archivos válidos
        const validFiles = newFiles.filter(file => file.size <= MAX_FILE_SIZE);
        setFiles((prev) => [...prev, ...validFiles]);
        return;
      }

      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (files.length === 0) {
      setError('Debe seleccionar al menos un archivo');
      return;
    }

    // Validar tamaño nuevamente antes de enviar (por si acaso)
    const invalidFiles = files.filter(file => file.size > MAX_FILE_SIZE);
    if (invalidFiles.length > 0) {
      const fileNames = invalidFiles.map(f => f.name).join(', ');
      setError(`Los siguientes archivos exceden el límite de 10MB: ${fileNames}`);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('archivos', file);
      });

      const result = await uploadSoportesAction(idCaso, formData);

      if (!result.success) {
        setError(result.error?.message || 'Error al subir los documentos');
        return;
      }

      setFiles([]);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir los documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFiles([]);
      setError(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Agregar Documento"
      size="md"
    >
      <form onSubmit={handleSubmit} className="px-6 pb-6 pt-6">
        <div className="mb-6">
          <div className="flex flex-col gap-1">
            <label className="text-base font-normal text-[var(--card-text)] mb-1">
              Archivos
            </label>
            <div className="relative">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.webp,.mp3,.wav,.ogg,.mp4,.avi,.mov,.wmv,.flv,.webm,.m4a,.aac,.wma"
                disabled={loading}
              />
              <label
                htmlFor="file-upload"
                className={`flex items-center gap-2 px-4 py-2 rounded-full border ${error && files.length === 0 ? 'border-danger' : 'border-[var(--ui-border)]'
                  } bg-[var(--input-bg)] cursor-pointer hover:bg-[var(--sidebar-hover)] transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                <Upload className="w-5 h-5 text-[var(--dropdown-text)]" />
                <span className="text-base text-[var(--card-text)]">
                  Seleccionar archivos
                </span>
              </label>
            </div>
            {error && (
              <p className="text-xs text-danger mt-1">{error}</p>
            )}
            <p className="text-xs text-[var(--card-text-muted)] mt-1 opacity-70">
              Tamaño máximo por archivo: 10MB
            </p>
          </div>
        </div>

        {files.length > 0 && (
          <div className={`mb-6 space-y-2 ${files.length >= 4 ? 'max-h-[200px] overflow-y-auto pr-2' : ''}`}>
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 bg-[var(--ui-bg-muted)] rounded-lg border border-[var(--dropdown-border)] transition-colors"
              >
                <File className="w-4 h-4 text-[var(--card-text-muted)]" />
                <span className="flex-1 text-sm text-[var(--card-text)] truncate">
                  {file.name}
                </span>
                <span className={`text-xs ${file.size > MAX_FILE_SIZE ? 'text-red-500 font-medium' : 'text-[var(--card-text-muted)]'}`}>
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1 text-[var(--card-text-muted)] hover:text-red-500 transition-colors"
                  disabled={loading}
                >
                  <X className="w-4 h-4 cursor-pointer" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading || files.length === 0}
            isLoading={loading}
          >
            Subir Documentos
          </Button>
        </div>
      </form>
    </Modal>
  );
}