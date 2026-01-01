'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X, User, Edit, Trash2 } from 'lucide-react';
import { uploadFotoPerfilAction } from '@/app/actions/usuarios';
import { motion, AnimatePresence } from 'motion/react';

interface PhotoUploadProps {
  currentPhoto?: string | null;
  onPhotoUpdated?: () => void;
  nombreInicial?: string;
}

export default function PhotoUpload({ currentPhoto, onPhotoUpdated, nombreInicial = 'U' }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentPhoto || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
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
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
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
    setSuccess(false);
    setIsUploading(true);
    setShowMenu(false);

    try {
      const formData = new FormData();
      formData.append('foto', file);

      const result = await uploadFotoPerfilAction(formData);

      if (result.success) {
        setSuccess(true);
        // Crear preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        onPhotoUpdated?.();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error?.message || 'Error al subir la foto');
      }
    } catch (err) {
      setError('Error inesperado al subir la foto');
      console.error(err);
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
    setSuccess(false);
    setIsDeleting(true);
    setShowMenu(false);

    try {
      const { deleteFotoPerfilAction } = await import('@/app/actions/usuarios');
      const result = await deleteFotoPerfilAction();

      if (result.success) {
        setSuccess(true);
        setPreview(null);
        onPhotoUpdated?.();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error?.message || 'Error al eliminar la foto');
      }
    } catch (err) {
      setError('Error inesperado al eliminar la foto');
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        {/* Preview de la foto con hover effect */}
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
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 transition-all duration-200"
              />
            ) : (
              <div 
                className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200 transition-all duration-200"
              >
                <User className="w-16 h-16 text-gray-400" />
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
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
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
                className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 z-30 py-2"
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
                  id="photo-upload-profile"
                />
                
                <label
                  htmlFor="photo-upload-profile"
                  className="group w-full px-4 py-2.5 text-left text-base text-gray-600 hover:text-gray-900 hover:bg-gray-50 flex items-center gap-3 transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-gray-500 group-hover:text-gray-900 transition-colors" />
                  {isUploading ? 'Subiendo...' : 'Subir foto'}
                </label>

                {preview && (
                  <>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="group w-full px-4 py-2.5 text-left text-base text-gray-600 hover:text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4 text-gray-500 group-hover:text-red-600 transition-colors" />
                      {isDeleting ? 'Eliminando...' : 'Eliminar foto'}
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm"
        >
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-700 hover:text-red-900"
          >
            <X className="w-4 h-4 inline" />
          </button>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm"
        >
          {preview ? 'Foto actualizada correctamente' : 'Foto eliminada correctamente'}
        </motion.div>
      )}

      <p className="text-xs text-gray-500">
        Formatos permitidos: JPG, PNG, WEBP. Tamaño máximo: 5MB
      </p>
    </div>
  );
}
