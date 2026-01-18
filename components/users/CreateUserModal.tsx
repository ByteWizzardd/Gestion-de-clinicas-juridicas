import Button from "../ui/Button";
import Modal from "../ui/feedback/Modal";
import Input from "../forms/Input";
import Select from "../forms/Select";
import { useEffect, useState, useRef } from 'react';
import { createUsuarioAction } from '@/app/actions/usuarios';
import { getCurrentTermAction } from '@/app/actions/estudiantes';
import PhoneInput from '../forms/PhoneInput';
import CedulaInput from '../forms/CedulaInput';
import { validateEmailFormat, validateEmailDomain } from '@/lib/utils/email-validation';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/feedback/ToastProvider';
import { useEmailVerification } from '@/hooks/useEmailVerification';

interface CreateUserForm {
  cedulaTipo: string;
  cedulaNumero: string;
  nombres: string;
  apellidos: string;
  correo_electronico: string;
  nombre_usuario: string;
  telefono: string;
  tipo_usuario: string;
  nrc?: string;
  term?: string;
  tipo_estudiante?: string;
  tipo_profesor?: string;
}

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState<CreateUserForm>({
    cedulaTipo: 'V',
    cedulaNumero: '',
    nombres: '',
    apellidos: '',
    correo_electronico: '',
    nombre_usuario: '',
    telefono: '+58',
    tipo_usuario: '',
    nrc: '',
    term: '',
    tipo_estudiante: '',
    tipo_profesor: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateUserForm, string>>>({});
  const cedulaCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emailCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const usernameCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const { verifyEmail, isVerifying: isVerifyingEmail } = useEmailVerification();

  // Resetear formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      // Obtener el término actual primero
      getCurrentTermAction()
        .then((currentTermRes) => {
          const currentTerm = currentTermRes.success && currentTermRes.data
            ? currentTermRes.data.term
            : '';

          setForm({
            cedulaTipo: 'V',
            cedulaNumero: '',
            nombres: '',
            apellidos: '',
            correo_electronico: '',
            nombre_usuario: '',
            telefono: '+58',
            tipo_usuario: '',
            nrc: '',
            term: currentTerm,
            tipo_estudiante: '',
            tipo_profesor: '',
          });
          setError(null);
          setErrors({});
        })
        .catch(() => {
          // Si falla, establecer sin término (se validará después)
          setForm({
            cedulaTipo: 'V',
            cedulaNumero: '',
            nombres: '',
            apellidos: '',
            correo_electronico: '',
            nombre_usuario: '',
            telefono: '+58',
            tipo_usuario: '',
            nrc: '',
            term: '',
            tipo_estudiante: '',
            tipo_profesor: '',
          });
          setError(null);
          setErrors({});
        });
    }
  }, [isOpen]);

  // Estado para almacenar el término actual
  const [currentTerm, setCurrentTerm] = useState<string>('');

  // Cargar el término actual cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      getCurrentTermAction()
        .then((currentTermRes) => {
          // Si hay un término actual, establecerlo automáticamente
          if (currentTermRes.success && currentTermRes.data) {
            const term = currentTermRes.data.term;
            setCurrentTerm(term);
            setForm((prev) => ({
              ...prev,
              term: term,
            }));
          }
        })
        .catch(() => {
          // Si falla, no hacer nada (el término ya se estableció en el reset)
        });
    }
  }, [isOpen]);

  const checkCedulaExists = async (cedulaTipo: string, cedulaNumero: string) => {
    if (!cedulaNumero || cedulaNumero.trim() === '') {
      // Limpiar error si la cédula está vacía
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.cedulaNumero;
        return newErrors;
      });
      return;
    }

    // Construir cédula con formato V-XXXX (con guión)
    const cedula = `${cedulaTipo}-${cedulaNumero}`;

    try {
      // Verificar si la cédula ya está registrada como usuario
      const { getUsuarioInfoByCedulaAction, lookupPersonByCedulaAction } = await import('@/app/actions/usuarios');
      const usuarioResult = await getUsuarioInfoByCedulaAction(cedula);

      if (usuarioResult.success && usuarioResult.data) {
        // Si el usuario existe, mostrar error
        setErrors((prev) => ({
          ...prev,
          cedulaNumero: `La cédula ${cedula} ya está registrada como usuario`,
        }));
      } else {
        // Si no existe como usuario, limpiar el error
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.cedulaNumero;
          return newErrors;
        });

        // Buscar en solicitantes o beneficiarios para auto-completar
        const lookupResult = await lookupPersonByCedulaAction(cedula);
        if (lookupResult.success && lookupResult.data) {
          // Auto-completar campos con los datos encontrados
          setForm((prev) => ({
            ...prev,
            nombres: lookupResult.data!.nombres || prev.nombres,
            apellidos: lookupResult.data!.apellidos || prev.apellidos,
            // Solo llenar correo si viene de solicitante y no está vacío
            correo_electronico: lookupResult.data!.correo_electronico || prev.correo_electronico,
            // Solo llenar teléfono si viene de solicitante y no está vacío
            telefono: lookupResult.data!.telefono_celular || prev.telefono,
          }));
        }
      }
    } catch (err) {
      // En caso de error, no mostrar nada (puede ser un error de red, etc.)
      console.error('Error al verificar cédula:', err);
    }
  };

  const checkEmailExists = async (email: string) => {
    if (!email || email.trim() === '') {
      // Limpiar error si el correo está vacío
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.correo_electronico;
        return newErrors;
      });
      return;
    }

    // Validar formato de email básico antes de verificar
    if (!validateEmailFormat(email)) {
      // No verificar si el formato es inválido, la validación de formato se hará en validateForm
      return;
    }

    // Verificar que el email sea real y exista
    const isEmailValid = await verifyEmail(email);
    if (!isEmailValid) {
      // El hook ya estableció el error, pero lo ponemos en nuestro estado de errores
      setErrors((prev) => ({
        ...prev,
        correo_electronico: 'El correo electrónico no es válido o no existe',
      }));
      return;
    }

    try {
      // Verificar si el correo ya está registrado como usuario
      const { checkEmailExistsUsuarioAction } = await import('@/app/actions/usuarios');
      const emailResult = await checkEmailExistsUsuarioAction(email);

      if (emailResult.success && emailResult.exists) {
        // Si el correo existe en la BD, mostrar error
        setErrors((prev) => ({
          ...prev,
          correo_electronico: `El correo electrónico ${email} ya está registrado como usuario`,
        }));
      } else {
        // Si no existe en la BD y es válido, limpiar el error
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.correo_electronico;
          return newErrors;
        });
      }
    } catch (err) {
      // En caso de error, no mostrar nada (puede ser un error de red, etc.)
      console.error('Error al verificar correo:', err);
    }
  };

  const checkUsernameExists = async (username: string) => {
    if (!username || username.trim() === '') {
      // Limpiar error si el nombre de usuario está vacío
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.nombre_usuario;
        return newErrors;
      });
      return;
    }

    try {
      // Verificar si el nombre de usuario ya está registrado como usuario
      const { checkUsernameExistsUsuarioAction } = await import('@/app/actions/usuarios');
      const usernameResult = await checkUsernameExistsUsuarioAction(username);

      if (usernameResult.success && usernameResult.exists) {
        // Si el nombre de usuario existe, mostrar error
        setErrors((prev) => ({
          ...prev,
          nombre_usuario: `El nombre de usuario ${username} ya está registrado como usuario`,
        }));
      } else {
        // Si no existe, limpiar el error
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.nombre_usuario;
          return newErrors;
        });
      }
    } catch (err) {
      // En caso de error, no mostrar nada (puede ser un error de red, etc.)
      console.error('Error al verificar nombre de usuario:', err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Limpiar error del campo cuando se modifica
    if (errors[e.target.name as keyof CreateUserForm]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[e.target.name as keyof CreateUserForm];
        return newErrors;
      });
    }
  };

  // Efecto para verificar cédula cuando cambia
  useEffect(() => {
    // Limpiar timeout anterior si existe
    if (cedulaCheckTimeoutRef.current) {
      clearTimeout(cedulaCheckTimeoutRef.current);
    }

    // Verificar si hay cédula
    if (form.cedulaNumero && form.cedulaNumero.trim().length > 0) {
      cedulaCheckTimeoutRef.current = setTimeout(() => {
        checkCedulaExists(form.cedulaTipo, form.cedulaNumero);
      }, 500); // Debounce de 500ms
    } else {
      // Si la cédula está vacía, limpiar el error
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.cedulaNumero;
        return newErrors;
      });
    }

    // Cleanup
    return () => {
      if (cedulaCheckTimeoutRef.current) {
        clearTimeout(cedulaCheckTimeoutRef.current);
      }
    };
  }, [form.cedulaTipo, form.cedulaNumero]);

  // Efecto para verificar correo cuando cambia
  useEffect(() => {
    // Limpiar timeout anterior si existe
    if (emailCheckTimeoutRef.current) {
      clearTimeout(emailCheckTimeoutRef.current);
    }

    // Verificar si el correo tiene formato válido y al menos 5 caracteres
    if (form.correo_electronico && form.correo_electronico.trim().length >= 5) {
      emailCheckTimeoutRef.current = setTimeout(() => {
        checkEmailExists(form.correo_electronico);
      }, 500); // Debounce de 500ms
    } else {
      // Si el correo es muy corto, limpiar el error
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.correo_electronico;
        return newErrors;
      });
    }

    // Cleanup
    return () => {
      if (emailCheckTimeoutRef.current) {
        clearTimeout(emailCheckTimeoutRef.current);
      }
    };
  }, [form.correo_electronico]);

  // Efecto para verificar nombre de usuario cuando cambia
  useEffect(() => {
    // Limpiar timeout anterior si existe
    if (usernameCheckTimeoutRef.current) {
      clearTimeout(usernameCheckTimeoutRef.current);
    }

    // Verificar si el nombre de usuario tiene al menos 3 caracteres
    if (form.nombre_usuario && form.nombre_usuario.trim().length >= 3) {
      usernameCheckTimeoutRef.current = setTimeout(() => {
        checkUsernameExists(form.nombre_usuario);
      }, 500); // Debounce de 500ms
    } else {
      // Si el nombre de usuario es muy corto, limpiar el error
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.nombre_usuario;
        return newErrors;
      });
    }

    // Cleanup
    return () => {
      if (usernameCheckTimeoutRef.current) {
        clearTimeout(usernameCheckTimeoutRef.current);
      }
    };
  }, [form.nombre_usuario]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateUserForm, string>> = {};

    // Validar cédula
    if (!form.cedulaNumero || form.cedulaNumero.trim() === '') {
      newErrors.cedulaNumero = 'La cédula es requerida';
    } else if (errors.cedulaNumero && errors.cedulaNumero.includes('ya está registrada')) {
      // Mantener el error de cédula duplicada si existe
      newErrors.cedulaNumero = errors.cedulaNumero;
    }

    // Validar nombres
    if (!form.nombres || form.nombres.trim() === '') {
      newErrors.nombres = 'Los nombres son requeridos';
    }

    // Validar apellidos
    if (!form.apellidos || form.apellidos.trim() === '') {
      newErrors.apellidos = 'Los apellidos son requeridos';
    }

    // Validar correo electrónico
    if (!form.correo_electronico || form.correo_electronico.trim() === '') {
      newErrors.correo_electronico = 'El correo electrónico es requerido';
    } else if (!validateEmailFormat(form.correo_electronico)) {
      newErrors.correo_electronico = 'Correo electrónico inválido';
    } else if (errors.correo_electronico && (errors.correo_electronico.includes('ya está registrado') || errors.correo_electronico.includes('no es válido') || errors.correo_electronico.includes('no existe'))) {
      // Mantener el error de correo si existe (duplicado o inválido)
      newErrors.correo_electronico = errors.correo_electronico;
    }

    // Validar nombre de usuario
    if (!form.nombre_usuario || form.nombre_usuario.trim() === '') {
      newErrors.nombre_usuario = 'El nombre de usuario es requerido';
    } else if (errors.nombre_usuario && errors.nombre_usuario.includes('ya está registrado')) {
      // Mantener el error de nombre de usuario duplicado si existe
      newErrors.nombre_usuario = errors.nombre_usuario;
    }

    // Validar teléfono (si está presente)
    if (form.telefono && form.telefono.trim() && form.telefono.trim() !== '+58') {
      const telefonoTrimmed = form.telefono.trim();
      const codeMatch = telefonoTrimmed.match(/^(\+\d{1,3})/);
      const code = codeMatch ? codeMatch[1] : '';
      const number = telefonoTrimmed.replace(code, '').trim();

      if (code === '+58') {
        // Validación para números venezolanos
        if (number.length < 10 || number.length > 10) {
          newErrors.telefono = 'El número de teléfono debe tener 10 dígitos';
        } else if (!/^[0-9]{10}$/.test(number)) {
          newErrors.telefono = 'El número de teléfono solo debe contener dígitos';
        }
      }
    }

    // Validar tipo de usuario
    if (!form.tipo_usuario || form.tipo_usuario.trim() === '') {
      newErrors.tipo_usuario = 'El tipo de usuario es requerido';
    }

    // Validaciones específicas según tipo de usuario
    if (form.tipo_usuario === 'Estudiante') {
      if (!form.tipo_estudiante || form.tipo_estudiante.trim() === '') {
        newErrors.tipo_estudiante = 'El tipo de estudiante es requerido';
      }
      if (!form.term || form.term.trim() === '') {
        newErrors.term = 'El término es requerido';
      }
      if (!form.nrc || form.nrc.trim() === '') {
        newErrors.nrc = 'El NRC es requerido';
      }
    } else if (form.tipo_usuario === 'Profesor') {
      if (!form.tipo_profesor || form.tipo_profesor.trim() === '') {
        newErrors.tipo_profesor = 'El tipo de profesor es requerido';
      }
      if (!form.term || form.term.trim() === '') {
        newErrors.term = 'El término es requerido';
      }
    } else if (form.tipo_usuario === 'Coordinador') {
      if (!form.term || form.term.trim() === '') {
        newErrors.term = 'El término es requerido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Construir cédula completa
      const cedula = `${form.cedulaTipo}-${form.cedulaNumero}`;

      // Procesar teléfono (si solo es +58, enviar null)
      const telefonoFinal = form.telefono && form.telefono.trim() !== '+58'
        ? form.telefono.trim()
        : null;

      const result = await createUsuarioAction({
        cedula,
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        correo_electronico: form.correo_electronico.trim(),
        nombre_usuario: form.nombre_usuario.trim(),
        contrasena: 'password123',
        telefono: telefonoFinal,
        tipo_usuario: form.tipo_usuario,
        estudiante: form.tipo_usuario === 'Estudiante' ? {
          nrc: form.nrc?.trim() || null,
          term: form.term?.trim() || null,
          tipo_estudiante: form.tipo_estudiante || null,
        } : undefined,
        profesor: form.tipo_usuario === 'Profesor' ? {
          term: form.term?.trim() || null,
          tipo_profesor: form.tipo_profesor || null,
        } : undefined,
        coordinador: form.tipo_usuario === 'Coordinador' ? {
          term: form.term?.trim() || null,
        } : undefined,
      });

      if (result && result.success) {
        toast.success('¡Usuario registrado exitosamente!');
        onSuccess();
        onClose();
      } else {
        toast.error(result?.error?.message || 'Error al crear usuario');
        setError(result?.error?.message || 'Error al crear usuario');
      }
    } catch (err) {
      toast.error('Error inesperado al crear usuario');
      setError('Error inesperado al crear usuario');
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
        <h2 className="text-2xl font-normal text-foreground mb-6">Registrar Usuario</h2>

        {/* Grid de formulario */}
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 text-red-600 text-sm font-medium">{error}</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-6">
            <CedulaInput
              label="Cédula *"
              tipoValue={form.cedulaTipo}
              onTipoChange={(value) => {
                setForm({ ...form, cedulaTipo: value });
                // Limpiar error cuando cambia el tipo de cédula
                if (errors.cedulaNumero) {
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.cedulaNumero;
                    return newErrors;
                  });
                }
              }}
              value={form.cedulaNumero}
              onChange={(e) => {
                setForm({ ...form, cedulaNumero: e.target.value });
                // Limpiar error temporalmente cuando se modifica la cédula
                // El useEffect verificará de nuevo después de 500ms
                if (errors.cedulaNumero) {
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.cedulaNumero;
                    return newErrors;
                  });
                }
              }}
              error={errors.cedulaNumero}
              required
              disableSuggestions={true}
            />
            <Input
              label="Correo *"
              name="correo_electronico"
              type="email"
              value={form.correo_electronico}
              onChange={handleChange}
              error={errors.correo_electronico}
            />
            <Input
              label="Nombre(s) *"
              name="nombres"
              value={form.nombres}
              onChange={handleChange}
              error={errors.nombres}
            />
            <Input
              label="Apellido(s) *"
              name="apellidos"
              value={form.apellidos}
              onChange={handleChange}
              error={errors.apellidos}
            />
            <Input
              label="Nombre de usuario *"
              name="nombre_usuario"
              value={form.nombre_usuario}
              onChange={handleChange}
              error={errors.nombre_usuario}
            />
            <PhoneInput
              label="Teléfono"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              placeholder="4121234567"
              error={errors.telefono}
            />
            <Select
              label="Tipo de usuario *"
              value={form.tipo_usuario}
              onChange={(e) => {
                const nuevoTipoUsuario = e.target.value;
                setForm({
                  ...form,
                  tipo_usuario: nuevoTipoUsuario,
                  tipo_estudiante: '',
                  tipo_profesor: '',
                  term: currentTerm || form.term, // Mantener el término actual
                  nrc: nuevoTipoUsuario === 'Estudiante' ? '15753' : '',
                });
                // Limpiar errores de campos relacionados cuando cambia el tipo de usuario
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.tipo_usuario;
                  delete newErrors.tipo_estudiante;
                  delete newErrors.tipo_profesor;
                  delete newErrors.term;
                  delete newErrors.nrc;
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
            {form.tipo_usuario && (
              <Input
                label="TERM *"
                name="term"
                value={form.term || currentTerm || ''}
                onChange={() => { }} // No permitir cambios
                disabled={true}
                error={errors.term}
              />
            )}

            {/* Campos adicionales según tipo de usuario */}
            {form.tipo_usuario === 'Estudiante' && (
              <>
                <Input
                  label="NRC *"
                  name="nrc"
                  value={form.nrc || ''}
                  onChange={handleChange}
                  error={errors.nrc}
                />
                <Select
                  label="Tipo de Estudiante *"
                  value={form.tipo_estudiante || ''}
                  onChange={(e) => {
                    setForm({ ...form, tipo_estudiante: e.target.value });
                    if (errors.tipo_estudiante) {
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.tipo_estudiante;
                        return newErrors;
                      });
                    }
                  }}
                  options={[
                    { value: '', label: 'Seleccione...' },
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
              <Select
                label="Tipo de Profesor *"
                value={form.tipo_profesor || ''}
                onChange={(e) => {
                  setForm({ ...form, tipo_profesor: e.target.value });
                  if (errors.tipo_profesor) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.tipo_profesor;
                      return newErrors;
                    });
                  }
                }}
                options={[
                  { value: '', label: 'Seleccione...' },
                  { value: 'Voluntario', label: 'Voluntario' },
                  { value: 'Asesor', label: 'Asesor' },
                ]}
                error={errors.tipo_profesor}
              />
            )}
          </div>
          {/* Footer con botón */}
          <div className="flex flex-col border-t border-gray-200">
            {/* Nota sobre campos obligatorios */}
            <div className="flex items-center gap-1 pt-2 pb-2">
              <span className="text-danger font-medium text-sm">*</span>
              <span className="text-sm text-gray-600">Campo obligatorio</span>
            </div>
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" size="xl" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="xl" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  'Registrar'
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateUserModal;
