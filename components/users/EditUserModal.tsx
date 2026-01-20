import Button from "../ui/Button";
import Modal from "../ui/feedback/Modal";
import Input from "../forms/Input";
import Select from "../forms/Select";
import { useEffect, useState } from 'react';
import { updateUsuarioByCedulaAction } from '@/app/actions/usuarios';
import { UpdateUserSchema } from '@/lib/validations/user.schema';
import { getSemestres } from '@/app/actions/catalogos/semestres.actions';
import PhoneInput from '../forms/PhoneInput';
import { validateEmailFormat, validateEmailDomain } from '@/lib/utils/email-validation';
import { Loader2 } from 'lucide-react';
import { useEmailVerification } from '@/hooks/useEmailVerification';

interface Usuario {
  cedula: string;
  nombres?: string;
  apellidos?: string;
  nombre_usuario: string;
  tipo_usuario: string;
  correo_electronico?: string;
  telefono?: string;
  [key: string]: unknown;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuario: Usuario | null;
  onSave: (usuarioEditado: Usuario) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, usuario, onSave }) => {
  const [form, setForm] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof Usuario, string>>>({});
  const { verifyEmail, isVerifying: isVerifyingEmail } = useEmailVerification();

  // Sincronizar el estado local solo cuando cambia el usuario y el modal se abre
  useEffect(() => {
    if (isOpen && usuario) {
      // Asegurarse de que el teléfono tenga un código de país si no lo tiene
      const initialFormState = { ...usuario };
      if (initialFormState.telefono && !initialFormState.telefono.startsWith('+')) {
        initialFormState.telefono = `+58${initialFormState.telefono.replace(/^0/, '')}`;
      } else if (!initialFormState.telefono) {
        initialFormState.telefono = '+58';
      }
      setForm(initialFormState);
      setError(null);
      setErrors({});
    }
  }, [isOpen, usuario]);

  const [semesters, setSemesters] = useState<{ value: string; label: string }[]>([]);
  // Cargar los terms al abrir el modal
  useEffect(() => {
    if (isOpen) {
      getSemestres()
        .then((res) => {
          if (res.success && res.data) {
            const enabledSemesters = res.data
              .filter((s: { habilitado: boolean }) => s.habilitado)
              .map((s: { term: string }) => ({ value: s.term, label: s.term }));
            setSemesters(enabledSemesters);
          }
        })
        .catch(() => setSemesters([]));
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (form) {
      setForm({ ...form, [e.target.name]: e.target.value });
      // Limpiar error del campo cuando se modifica
      if (errors[e.target.name as keyof Usuario]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[e.target.name as keyof Usuario];
          return newErrors;
        });
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof Usuario, string>> = {};

    if (!form) return false;

    // Validar correo electrónico
    if (form.correo_electronico && form.correo_electronico.trim()) {
      if (!validateEmailFormat(form.correo_electronico)) {
        newErrors.correo_electronico = 'Correo electrónico inválido';
      }
      // La verificación profunda se hará en onBlur o antes del submit
    }

    // Validar teléfono (si está presente)
    if (form.telefono && form.telefono.trim() && form.telefono.trim() !== '+58') {
      const telefonoTrimmed = form.telefono.trim();
      const codeMatch = telefonoTrimmed.match(/^(\+\d{1,3})/);
      const code = codeMatch ? codeMatch[1] : '';
      const number = telefonoTrimmed.replace(code, '').trim();

      // Si solo tiene el código sin número, es válido (se enviará como null)
      if (number !== '') {
        // Para números venezolanos (+58), el número debe tener 10 dígitos y empezar con 4
        if (code === '+58') {
          if (number.length !== 10 || !number.startsWith('4')) {
            newErrors.telefono = 'Número venezolano inválido. Debe tener 10 dígitos y empezar con 4 (ej: 412...).';
          }
        } else {
          // Para otros países, validar longitud mínima y máxima
          if (number.length < 7 || number.length > 15) {
            newErrors.telefono = 'Número de teléfono inválido';
          }
        }
      }
    }

    // Validar campos específicos según tipo de usuario
    if (form.tipo_usuario === 'Estudiante') {
      if (!form.tipo_estudiante || (typeof form.tipo_estudiante === 'string' && form.tipo_estudiante.trim() === '')) {
        newErrors.tipo_estudiante = 'Este campo es requerido';
      }
      if (!form.term || (typeof form.term === 'string' && form.term.trim() === '')) {
        newErrors.term = 'Este campo es requerido';
      }
    } else if (form.tipo_usuario === 'Profesor') {
      if (!form.tipo_profesor || (typeof form.tipo_profesor === 'string' && form.tipo_profesor.trim() === '')) {
        newErrors.tipo_profesor = 'Este campo es requerido';
      }
      if (!form.term || (typeof form.term === 'string' && form.term.trim() === '')) {
        newErrors.term = 'Este campo es requerido';
      }
    } else if (form.tipo_usuario === 'Coordinador') {
      if (!form.term || (typeof form.term === 'string' && form.term.trim() === '')) {
        newErrors.term = 'Este campo es requerido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form) return;

    // Validar formulario
    if (!validateForm()) {
      return;
    }

    // Validar con Zod antes de enviar
    const validation = UpdateUserSchema.safeParse(form);
    if (!validation.success) {
      // Mapear errores de Zod a errores por campo
      const zodErrors: Partial<Record<keyof Usuario, string>> = {};
      validation.error.errors.forEach((err) => {
        const path = err.path[0] as keyof Usuario;
        if (path) {
          zodErrors[path] = err.message;
        }
      });
      setErrors(zodErrors);
      return;
    }

    setLoading(true);
    try {
      // Si el teléfono está vacío o es solo el prefijo (+58), enviarlo como string vacío
      let telefonoFinal: string | undefined = form.telefono || undefined;
      if (telefonoFinal) {
        const trimmed = telefonoFinal.trim();
        // Si el string coincide estrictamente con un formato de solo código (ej: +58, +1, +584) sin número real adicional
        // Asumimos que si tiene menos de 5-6 dígitos en total, no es un número válido y es solo basura o código
        if (/^\+\d{1,4}$/.test(trimmed)) {
          telefonoFinal = ''; // Enviar cadena vacía para indicar "borrar"
        }
      } else {
        // Si es null/undefined en el form, también enviar cadena vacía si queremos borrar
        telefonoFinal = '';
      }

      const result = await updateUsuarioByCedulaAction(form.cedula, {
        correo_electronico: form.correo_electronico,
        nombre: form.nombres,
        apellidos: form.apellidos,
        nombre_usuario: form.nombre_usuario,
        tipo_usuario: form.tipo_usuario,
        telefono: telefonoFinal,
        estudiante: form.tipo_usuario === 'Estudiante' ? {
          tipo_estudiante: form.tipo_estudiante as
            | 'Voluntario'
            | 'Inscrito'
            | 'Egresado'
            | 'Servicio Comunitario'
            | null
            | undefined,
          nrc: form.nrc as string | null | undefined,
          term: form.term as string | null | undefined,
        } : undefined,
        profesor: form.tipo_usuario === 'Profesor' ? {
          tipo_profesor: form.tipo_profesor as 'Voluntario' | 'Asesor' | null | undefined,
          term: (form.term as string | null | undefined) ?? null,
        } : undefined,
        coordinador: form.tipo_usuario === 'Coordinador' ? {
          term: form.term !== undefined ? (form.term as string | null) : null,
        } : undefined,
      });
      if (result && result.success) {
        onSave({ ...form });
        onClose();
      } else {
        setError(result?.error?.message || 'Error al actualizar usuario');
      }
    } catch {
      setError('Error inesperado al actualizar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="custom"
      className="rounded-[30px] sm:rounded-[40px] lg:rounded-[50px] w-[95vw] sm:w-[85vw] lg:w-[70vw] max-w-300 mx-auto"
      showCloseButton={false}
    >
      {form && ( // Renderizar el contenido solo si hay un formulario
        <div className="p-12 relative">
          {/* Botón de cerrar */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors z-10"
            aria-label="Cerrar modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M18 6L6 18" /><path d="M6 6l12 12" /></svg>
          </button>

          {/* Título */}
          <h2 className="text-2xl font-normal text-foreground mb-6">Editar Usuario</h2>

          {/* Grid de formulario */}
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 text-red-600 text-sm font-medium">{error}</div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-6">
              <Input
                label="Correo"
                name="correo_electronico"
                value={typeof form.correo_electronico === 'string' ? form.correo_electronico : ''}
                onChange={handleChange}
                onBlur={async (e) => {
                  const email = e.target.value;
                  if (email && email.trim() && validateEmailFormat(email)) {
                    const isValid = await verifyEmail(email);
                    if (!isValid) {
                      setErrors((prev) => ({
                        ...prev,
                        correo_electronico: 'El correo electrónico no es válido o no existe',
                      }));
                    }
                  }
                }}
                error={errors.correo_electronico}
                disabled={isVerifyingEmail}
              />
              <Input
                label="Nombre(s)"
                name="nombres"
                value={typeof form.nombres === 'string' ? form.nombres : ''}
                onChange={handleChange}
                error={errors.nombres}
              />
              <Input
                label="Apellido(s)"
                name="apellidos"
                value={typeof form.apellidos === 'string' ? form.apellidos : ''}
                onChange={handleChange}
                error={errors.apellidos}
              />
              <Input
                label="Nombre de usuario"
                name="nombre_usuario"
                value={form.nombre_usuario as string}
                onChange={handleChange}
                error={errors.nombre_usuario}
              />
              <PhoneInput
                label="Teléfono"
                name="telefono"
                value={typeof form.telefono === 'string' ? form.telefono : ''}
                onChange={handleChange}
                placeholder="4121234567"
                error={errors.telefono}
              />
              <Select
                label="Tipo de usuario"
                value={form.tipo_usuario}
                onChange={(e) => {
                  const nuevoTipoUsuario = e.target.value;
                  // Limpiar solo tipo_estudiante y tipo_profesor cuando cambia el tipo de usuario
                  // para evitar falsos registros (term y nrc se mantienen)
                  setForm({
                    ...form,
                    tipo_usuario: nuevoTipoUsuario,
                    tipo_estudiante: undefined,
                    tipo_profesor: undefined,
                  });
                  // Limpiar errores de campos relacionados cuando cambia el tipo de usuario
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.tipo_usuario;
                    delete newErrors.tipo_estudiante;
                    delete newErrors.tipo_profesor;
                    delete newErrors.term;
                    return newErrors;
                  });
                }}
                options={[
                  { value: 'Coordinador', label: 'Coordinador' },
                  { value: 'Profesor', label: 'Profesor' },
                  { value: 'Estudiante', label: 'Estudiante' },
                ]}
                error={errors.tipo_usuario}
              />
              {form.rol !== undefined && (
                <Input
                  label="Rol"
                  name="rol"
                  value={form.rol as string || ''}
                  onChange={handleChange}
                />
              )}

              <Select
                label="TERM"
                value={(form.term as string) || ''}
                onChange={(e) => {
                  if (form) { // Ensure form is not null
                    setForm({ ...form, term: e.target.value });
                    if (errors.term) {
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.term;
                        return newErrors;
                      });
                    }
                  }
                }}
                options={[{ value: '', label: 'Seleccione...' }, ...semesters]}
                error={errors.term}
              />

              {/* Campos adicionales según tipo de usuario */}
              {form.tipo_usuario === 'Estudiante' && (
                <>
                  <Input
                    label="NRC"
                    name="nrc"
                    value={typeof form.nrc === 'string' ? form.nrc : ''}
                    onChange={handleChange}
                  />
                  <Select
                    label="Tipo de Estudiante"
                    value={typeof form.tipo_estudiante === 'string' ? form.tipo_estudiante : ''}
                    onChange={(e) => {
                      setForm({ ...form, tipo_estudiante: e.target.value });
                      // Limpiar error del campo cuando se modifica
                      if (errors.tipo_estudiante) {
                        setErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.tipo_estudiante;
                          return newErrors;
                        });
                      }
                    }}
                    options={[
                      { value: 'Voluntario', label: 'Voluntario' },
                      { value: 'Inscrito', label: 'Inscrito' },
                      { value: 'Egresado', label: 'Egresado' },
                      { value: 'Servicio Comunitario', label: 'Servicio Comunitario' },
                    ]}
                    error={errors.tipo_estudiante}
                  />
                </>
              )}
              {form.tipo_usuario === 'Profesor' && (
                <>
                  <Select
                    label="Tipo de Profesor"
                    value={typeof form.tipo_profesor === 'string' ? form.tipo_profesor : ''}
                    onChange={(e) => {
                      setForm({ ...form, tipo_profesor: e.target.value });
                      // Limpiar error del campo cuando se modifica
                      if (errors.tipo_profesor) {
                        setErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.tipo_profesor;
                          return newErrors;
                        });
                      }
                    }}
                    options={[
                      { value: 'Voluntario', label: 'Voluntario' },
                      { value: 'Asesor', label: 'Asesor' },
                    ]}
                    error={errors.tipo_profesor}
                  />
                </>
              )}
            </div>
            {/* Footer con botón */}
            <div className="flex flex-col border-t border-gray-200 pt-4">
              <div className="flex justify-end gap-4 mt-4">
                <Button type="button" variant="outline" size="xl" onClick={onClose} disabled={loading}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="xl" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
};

export default EditUserModal;
