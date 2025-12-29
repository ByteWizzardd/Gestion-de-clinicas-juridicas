
import Button from "../ui/Button";
import Modal from "../ui/feedback/Modal";


import { useEffect, useState } from 'react';

interface Usuario {
  cedula: string;
  nombre_completo: string;
  nombre_usuario: string;
  tipo_usuario: string;
  habilitado_sistema: boolean;
  [key: string]: unknown;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuario: Usuario | null;
  onSave: (usuarioEditado: Usuario) => void;
}

export function EditUserModal({ isOpen, onClose, usuario, onSave }: EditUserModalProps) {
  const [form, setForm] = useState<Usuario | null>(usuario);

  useEffect(() => {
    setForm(usuario);
  }, [usuario]);

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
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Usuario">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Correo</label>
          <input
            name="correo"
            value={typeof form.correo === 'string' ? form.correo : ''}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium">Nombre completo</label>
          <input
            name="nombre_completo"
            value={form.nombre_completo}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Nombre de usuario</label>
          <input
            name="nombre_usuario"
            value={form.nombre_usuario}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Teléfono</label>
          <input
            name="telefono"
            value={typeof form.telefono === 'string' ? form.telefono : ''}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Tipo de usuario</label>
          <select
            name="tipo_usuario"
            value={form.tipo_usuario}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            <option value="Coordinador">Coordinador</option>
            <option value="Profesor">Profesor</option>
            <option value="Estudiante">Estudiante</option>
          </select>
        </div>
        
        {form.rol !== undefined && (
          <div>
            <label className="block text-sm font-medium">Rol</label>
            <input
              name="rol"
              value={form.rol as string || ''}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
        )}

        {/* Información adicional según tipo de usuario */}
        {form.tipo_usuario === 'Profesor' && (
          <div>
            <label className="block text-sm font-medium">Información de Profesor</label>
            <input
              name="info_profesor"
              value={form.info_profesor as string || ''}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
        )}
        {form.tipo_usuario === 'Estudiante' && (
          <div>
            <label className="block text-sm font-medium">Información de Estudiante</label>
            <input
              name="info_estudiante"
              value={form.info_estudiante as string || ''}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
        )}
        {form.tipo_usuario === 'Coordinador' && (
          <div>
            <label className="block text-sm font-medium">Información de Coordinador</label>
            <input
              name="info_coordinador"
              value={form.info_coordinador as string || ''}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
        )}
        
        <hr className="my-6 border-t border-gray-200" />
        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" size="xl" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="xl">
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
}