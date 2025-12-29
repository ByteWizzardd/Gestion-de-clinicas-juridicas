import Button from "../ui/Button";
import Modal from "../ui/feedback/Modal";
import Input from "../forms/Input";
import Select from "../forms/Select";
import { useEffect, useState } from 'react';
import { getSemestresAction } from '@/app/actions/estudiantes';

interface Usuario {
  cedula: string;
  nombre_completo: string;
  nombre_usuario: string;
  tipo_usuario: string;
  habilitado_sistema: boolean;
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
  const [form, setForm] = useState<Usuario | null>(usuario);

  // Sincronizar el estado local solo cuando cambia el usuario (no por isOpen)
  useEffect(() => {
    setForm(usuario);
  }, [usuario]);

  const [terms, setTerms] = useState<Array<{ term: string }>>([]);
  // Cargar los terms al abrir el modal
  useEffect(() => {
    if (isOpen) {
      getSemestresAction()
        .then((res) => {
          if (res.success && res.data) {
            setTerms(res.data);
          }
        })
        .catch(() => setTerms([]));
    }
  }, [isOpen]);

  if (!form) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form) onSave(form);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="custom"
      className="rounded-[50px] max-w-300 mx-auto"
      showCloseButton={false}
    >
      <div className="p-12 relative">
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors z-10"
          aria-label="Cerrar modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6L6 18" /><path d="M6 6l12 12" /></svg>
        </button>

        {/* Título */}
        <h2 className="text-2xl font-normal text-foreground mb-6">Editar Usuario</h2>

        {/* Grid de formulario */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-6">
            <Input
              label="Correo"
              name="correo_electronico"
              value={typeof form.correo_electronico === 'string' ? form.correo_electronico : ''}
              onChange={handleChange}
            />
            <Input
              label="Nombre completo"
              name="nombre_completo"
              value={form.nombre_completo as string}
              onChange={handleChange}
            />
            <Input
              label="Nombre de usuario"
              name="nombre_usuario"
              value={form.nombre_usuario as string}
              onChange={handleChange}
            />
            <Input
              label="Teléfono"
              name="telefono"
              value={typeof form.telefono === 'string' ? form.telefono : ''}
              onChange={handleChange}
            />
            <Select
              label="Tipo de usuario"
              value={form.tipo_usuario}
              onChange={(e) =>
                setForm({ ...form, tipo_usuario: e.target.value })
              }
              options={[
                { value: 'Coordinador', label: 'Coordinador' },
                { value: 'Profesor', label: 'Profesor' },
                { value: 'Estudiante', label: 'Estudiante' },
              ]}
            />
            {form.rol !== undefined && (
              <Input
                label="Rol"
                name="rol"
                value={form.rol as string || ''}
                onChange={handleChange}
              />
            )}

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
                  label="TERM"
                  value={typeof form.term === 'string' ? form.term : ''}
                  onChange={(e) => setForm({ ...form, term: e.target.value })}
                  options={terms.map((t) => ({ value: t.term, label: t.term }))}
                />
                <Select
                  label="Tipo de Estudiante"
                  value={typeof form.tipo_estudiante === 'string' ? form.tipo_estudiante : ''}
                  onChange={(e) => setForm({ ...form, tipo_estudiante: e.target.value })}
                  options={[
                    { value: 'Voluntario', label: 'Voluntario' },
                    { value: 'Inscrito', label: 'Inscrito' },
                    { value: 'Egresado', label: 'Egresado' },
                    { value: 'Servicio Comunitario', label: 'Servicio Comunitario' },
                  ]}
                />
              </>
            )}
            {form.tipo_usuario === 'Profesor' && (
              <>
                <Select
                  label="TERM"
                  value={typeof form.term === 'string' ? form.term : ''}
                  onChange={(e) => setForm({ ...form, term: e.target.value })}
                  options={terms.map((t) => ({ value: t.term, label: t.term }))}
                />
                <Select
                  label="Tipo de Profesor"
                  value={typeof form.tipo_profesor === 'string' ? form.tipo_profesor : ''}
                  onChange={(e) => setForm({ ...form, tipo_profesor: e.target.value })}
                  options={[
                    { value: 'Voluntario', label: 'Voluntario' },
                    { value: 'Asesor', label: 'Asesor' },
                  ]}
                />
              </>
            )}
            {form.tipo_usuario === 'Coordinador' && (
              <Select
                label="TERM"
                value={typeof form.term === 'string' ? form.term : ''}
                onChange={(e) => setForm({ ...form, term: e.target.value })}
                options={terms.map((t) => ({ value: t.term, label: t.term }))}
              />
            )}
          </div>
          {/* Footer con botón */}
          <div className="flex flex-col border-t border-gray-200 pt-4">
            <div className="flex justify-end gap-4 mt-4">
              <Button type="button" variant="outline" size="xl" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="xl">
                Guardar
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditUserModal;
