'use client';

import { useState, useEffect } from 'react';
import Modal from '../ui/feedback/Modal';
import Button from '../ui/Button';
import Select from '../forms/Select';
import { Upload, File, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { bulkCreateEstudiantesAction } from '@/app/actions/estudiantes';
import { getSemestres } from '@/app/actions/catalogos/semestres.actions';
import { BulkUploadResult } from '@/lib/services/estudiantes.service';
import { useToast } from '@/components/ui/feedback/ToastProvider';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BulkUploadModal({
  isOpen,
  onClose,
  onSuccess,
}: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [term, setTerm] = useState('');
  const [semestres, setSemestres] = useState<Array<{ term: string; fecha_inicio: Date; fecha_fin: Date }>>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSemestres, setLoadingSemestres] = useState(false);
  const [preview, setPreview] = useState<BulkUploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const { toast } = useToast();

  // Cargar semestres al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadSemestres();
    } else {
      // Limpiar estado al cerrar
      setFile(null);
      setTerm('');
      setPreview(null);
      setError(null);
      setUploadResult(null);
    }
  }, [isOpen]);

  const loadSemestres = async () => {
    setLoadingSemestres(true);
    try {
      const result = await getSemestres();
      if (result.success && result.data) {
        // Filtrar solo los semestres habilitados
        const enabledSemestres = result.data.filter((s: { habilitado: boolean }) => s.habilitado);
        setSemestres(enabledSemestres);
        if (enabledSemestres.length > 0 && !term) {
          setTerm(enabledSemestres[0].term);
        }
      } else {
        setError('Error al cargar semestres');
      }
    } catch {
      setError('Error al cargar semestres');
    } finally {
      setLoadingSemestres(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileName = selectedFile.name.toLowerCase();
      if (
        fileName.endsWith('.csv') ||
        fileName.endsWith('.xlsx') ||
        fileName.endsWith('.xls')
      ) {
        setFile(selectedFile);
        setError(null);
        setPreview(null);
        setUploadResult(null);
      } else {
        setError('Formato de archivo no válido. Use CSV o Excel (.xlsx, .xls)');
        setFile(null);
      }
    }
  };

  const handlePreview = async () => {
    if (!file || !term) {
      setError('Debe seleccionar un archivo y un semestre');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('term', term);
      formData.append('tipoEstudiante', 'Inscrito');
      formData.append('isPreview', 'true'); // Flag para solo simular/previsualizar

      const result = await bulkCreateEstudiantesAction(formData);

      if (result.success && result.data) {
        setPreview(result.data);
        // NO setUploadResult(result.data) aquí, porque solo es preview
      } else {
        setError(result.error?.message || 'Error al procesar el archivo');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el archivo');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!file || !term || !preview) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('term', term);
      formData.append('tipoEstudiante', 'Inscrito');

      const result = await bulkCreateEstudiantesAction(formData);

      if (result.success && result.data) {
        setUploadResult(result.data);
        toast.success(`¡${result.data.success} estudiantes cargados exitosamente!`);
        if (onSuccess) {
          onSuccess();
        }
        // Cerrar modal después de un breve delay
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        toast.error(result.error?.message || 'Error al cargar estudiantes');
        setError(result.error?.message || 'Error al cargar estudiantes');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cargar estudiantes');
      setError(err instanceof Error ? err.message : 'Error al cargar estudiantes');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setTerm('');
    setPreview(null);
    setError(null);
    setUploadResult(null);
    onClose();
  };

  const semestreOptions = semestres.map(s => ({
    value: s.term,
    label: s.term,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
      title="Cargar Estudiantes por Lotes"
    >
      <div className="p-6">
        {/* Selector de archivo */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--bulk-text)] mb-2">
            Archivo (CSV o Excel)
          </label>
          <div className="relative">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              disabled={loading}
            />
            <label
              htmlFor="file-upload"
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-[var(--bulk-border)] cursor-pointer hover:border-primary transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              <Upload className="w-5 h-5 text-[var(--bulk-icon)]" />
              <span className="text-sm text-[var(--bulk-text)]">
                {file ? file.name : 'Seleccionar archivo CSV o Excel'}
              </span>
            </label>
          </div>
          {file && (
            <div className="mt-2 flex items-center gap-2 text-sm text-[var(--bulk-text)] opacity-80">
              <File className="w-4 h-4" />
              <span>{file.name}</span>
              <span className="opacity-60">({(file.size / 1024).toFixed(2)} KB)</span>
            </div>
          )}
        </div>

        {/* Selector de semestre */}
        <div className="mb-6">
          <Select
            label="Semestre"
            options={semestreOptions}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder={loadingSemestres ? 'Cargando...' : 'Seleccione un semestre'}
            required
            disabled={loading || loadingSemestres}
          />
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-4 p-3 bg-[var(--bulk-error-bg)] border border-[var(--bulk-error-border)] rounded-lg flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--bulk-error-text)]">{error}</p>
          </div>
        )}

        {/* Vista previa / Resultado */}
        {preview && (
          <div className="mb-6 p-4 bg-[var(--bulk-preview-bg)] rounded-lg border border-[var(--bulk-preview-border)]">
            <h3 className="text-lg font-semibold mb-3 text-[var(--foreground)]">Resumen de Procesamiento</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm dark:text-neutral-300">
                  <strong>{preview.success}</strong> exitosos
                </span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm dark:text-neutral-300">
                  <strong>{preview.errors}</strong> con errores
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <span className="text-sm dark:text-neutral-300">
                  <strong>{preview.duplicates}</strong> duplicados
                </span>
              </div>
              <div className="flex items-center gap-2">
                <File className="w-5 h-5 text-gray-500 dark:text-neutral-400" />
                <span className="text-sm dark:text-neutral-300">
                  <strong>{preview.total}</strong> total
                </span>
              </div>
            </div>

            {/* Detalles de errores */}
            {preview.details.some(d => d.errors.length > 0) && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2 text-[var(--bulk-error-text)]">Errores encontrados:</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {preview.details
                    .filter(d => d.errors.length > 0)
                    .map((detail, idx) => (
                      <div key={idx} className="text-xs text-[var(--bulk-error-text)] bg-[var(--bulk-error-bg)] p-2 rounded">
                        <strong>Fila {detail.rowNumber}:</strong> {detail.errors.join(', ')}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Resultado final después de confirmar */}
        {uploadResult && !preview && (
          <div className="mb-6 p-4 bg-[var(--bulk-success-bg)] rounded-lg border border-[var(--bulk-success-border)]">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold text-[var(--bulk-success-text)]">
                Estudiantes cargados exitosamente
              </h3>
            </div>
            <p className="text-sm text-[var(--bulk-success-text)] opacity-90">
              Se procesaron {uploadResult.success} estudiantes correctamente.
            </p>
          </div>
        )}

        {/* Botones */}
        <div className="flex flex-row flex-wrap justify-end gap-3 mt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="sm:w-auto"
          >
            Cancelar
          </Button>
          {!preview && !uploadResult && (
            <Button
              variant="primary"
              onClick={handlePreview}
              disabled={!file || !term || loading}
              isLoading={loading}
              className="sm:w-auto"
            >
              Vista Previa
            </Button>
          )}
          {preview && !uploadResult && (
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={loading}
              isLoading={loading}
              className="sm:w-auto"
            >
              Confirmar Carga
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}