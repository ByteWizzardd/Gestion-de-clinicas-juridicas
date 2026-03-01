'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Input from '@/components/forms/Input';
import Button from '@/components/ui/Button';
import { changePasswordAction } from '@/app/actions/auth';

export default function ChangePasswordClient() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name as keyof typeof formData]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof typeof formData];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Este campo es requerido';
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'Este campo es requerido';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Este campo es requerido';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('currentPassword', formData.currentPassword);
      formDataToSend.append('newPassword', formData.newPassword);
      formDataToSend.append('confirmPassword', formData.confirmPassword);

      const result = await changePasswordAction(formDataToSend);

      if (result.success) {
        setSuccess(true);
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setErrors({});
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        // Si el error es de validación, puede ser de contraseña actual
        if (result.error?.code === 'INVALID_PASSWORD') {
          setErrors({ currentPassword: result.error.message });
        } else {
          setErrors({ newPassword: result.error?.message || 'Error al cambiar la contraseña' });
        }
      }
    } catch (err) {
      setErrors({ newPassword: err instanceof Error ? err.message : 'Error al cambiar la contraseña' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1, ease: "easeOut" }}
      >
        <Breadcrumbs
          items={[
            { label: 'Perfil', href: '/dashboard/profile' },
            { label: 'Cambiar Contraseña' },
          ]}
        />
      </motion.div>

      <motion.div
        className="bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--card-border)] max-w-2xl transition-colors"
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1, ease: "easeOut" }}
      >
        <form onSubmit={handleSubmit} noValidate className="flex flex-col">
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <Input
                label="Contraseña Actual"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleInputChange}
                error={errors.currentPassword}
                required
              />
            </div>

            <div>
              <Input
                label="Nueva Contraseña"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleInputChange}
                error={errors.newPassword}
                required
                minLength={6}
              />
            </div>

            <div>
              <Input
                label="Confirmar Nueva Contraseña"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                error={errors.confirmPassword}
                required
                minLength={6}
              />
            </div>

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm"
              >
                Contraseña actualizada correctamente
              </motion.div>
            )}
          </div>

          {/* Footer con botones */}
          <div className="flex flex-col px-6 sm:px-8 py-4">
            <div className="border-t border-[var(--card-border)] mb-4 transition-colors"></div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full sm:w-auto sm:text-lg"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full sm:w-auto sm:text-lg"
                disabled={loading}
                isLoading={loading}
              >
                {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
