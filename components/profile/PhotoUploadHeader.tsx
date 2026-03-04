'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X, User, Edit, Trash2 } from 'lucide-react';
import { uploadFotoPerfilAction } from '@/app/actions/usuarios';
import { logger } from '@/lib/utils/logger';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '@/components/ui/feedback/ToastProvider';

interface PhotoUploadHeaderProps {
  currentPhoto?: string | null;
  onPhotoUpdated?: () => void;
  nombreInicial?: string;
  onSuccess?: (success: boolean) => void;
}

export default function PhotoUploadHeader({ currentPhoto, onPhotoUpdated, nombreInicial = 'U', onSuccess }: PhotoUploadHeaderProps) {
  const [preview, setPreview] = useState<string | null>(currentPhoto || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [showEditIcon, setShowEditIcon] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPreview(currentPhoto || null);
  }, [currentPhoto]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
        setShowEditIcon(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  // Ocultar el icono de edición cuando el menú se cierra
  useEffect(() => {
    if (!showMenu) {
      setShowEditIcon(false);
    }
  }, [showMenu]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Formato no permitido. Solo se permiten: JPG, PNG, WEBP');
      return;
    }

    // Validar tamaño (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('El archivo es demasiado grande. Tamaño máximo: 5MB');
      return;
    }

    setError(null);
    setIsUploading(true);
    setShowMenu(false);

    try {
      const formData = new FormData();
      formData.append('foto', file);

      const result = await uploadFotoPerfilAction(formData);

      if (result.success) {
        toast.success('Foto de perfil actualizada exitosamente');
        onSuccess?.(true);
        // Crear preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        onPhotoUpdated?.();
        // Disparar evento para actualizar el sidebar
        window.dispatchEvent(new CustomEvent('photoProfileUpdated'));
      } else {
        toast.error(result.error?.message || 'Error al subir la foto');
        setError(result.error?.message || 'Error al subir la foto');
      }
    } catch (err) {
      setError('Error inesperado al subir la foto');
      logger.error(err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar tu foto de perfil?')) {
      return;
    }

    setError(null);
    setIsDeleting(true);
    setShowMenu(false);

    try {
      const { deleteFotoPerfilAction } = await import('@/app/actions/usuarios');
      const result = await deleteFotoPerfilAction();

      if (result.success) {
        toast.success('Foto de perfil eliminada exitosamente');
        onSuccess?.(true);
        setPreview(null);
        onPhotoUpdated?.();
        // Disparar evento para actualizar el sidebar
        window.dispatchEvent(new CustomEvent('photoProfileUpdated'));
      } else {
        toast.error(result.error?.message || 'Error al eliminar la foto');
        setError(result.error?.message || 'Error al eliminar la foto');
      }
    } catch (err) {
      setError('Error inesperado al eliminar la foto');
      logger.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative">
      <div
        className="relative"
        onMouseEnter={() => setShowEditIcon(true)}
        onMouseLeave={() => {
          if (!showMenu) {
            setShowEditIcon(false);
          }
        }}
      >
        <div
          className="relative cursor-pointer"
          onClick={() => setShowMenu(!showMenu)}
        >
          {preview ? (
            <img
              src={preview}
              alt="Foto de perfil"
              className="w-20 h-20 rounded-full object-cover border-4 border-[var(--background)] flex-shrink-0 transition-all duration-200"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-full bg-[var(--sidebar-hover)] flex items-center justify-center border-4 border-[var(--background)] flex-shrink-0 transition-all duration-200"
            >
              <span className="text-[var(--card-text-muted)] text-2xl font-medium">
                {nombreInicial.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          <AnimatePresence>
            {showEditIcon && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-0 right-0 pointer-events-none"
              >
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center border-2 border-[var(--background)] shadow-lg transition-all duration-300">
                  <Edit className="w-4 h-4 text-white" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-0 mt-2 w-48 bg-[var(--card-bg)] rounded-xl shadow-xl border border-[var(--card-border)] z-30 py-2 transition-colors"
              onMouseEnter={() => setShowEditIcon(true)}
              onMouseLeave={() => {
                setShowEditIcon(false);
                setShowMenu(false);
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
                id="photo-upload-header"
              />

              <label
                htmlFor="photo-upload-header"
                className="group w-full px-4 py-2.5 text-left text-base text-[var(--dropdown-text)] hover:text-[var(--dropdown-text-hover)] hover:bg-[var(--dropdown-hover)] flex items-center gap-3 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 text-[var(--dropdown-text)] group-hover:text-[var(--dropdown-text-hover)] transition-colors" />
                {isUploading ? 'Subiendo...' : 'Subir foto'}
              </label>

              {preview && (
                <>
                  <div className="border-t border-[var(--dropdown-divider)] my-1 transition-all duration-300"></div>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="group w-full px-4 py-2.5 text-left text-base text-[var(--dropdown-text)] hover:text-red-500 hover:bg-red-500/10 flex items-center gap-3 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 text-[var(--dropdown-text)] group-hover:text-red-500 transition-colors" />
                    {isDeleting ? 'Eliminando...' : 'Eliminar foto'}
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mensajes de error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 mt-2 p-3 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 rounded-lg text-sm whitespace-nowrap z-40 shadow-md backdrop-blur-sm"
        >
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200 transition-colors"
          >
            <X className="w-4 h-4 inline" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
