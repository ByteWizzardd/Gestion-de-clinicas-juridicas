

import Button from "../ui/Button";
import Modal from "../ui/feedback/Modal";
import Input from "../forms/Input";
import Select from "../forms/Select";


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
        <Input
          label="Correo"
          name="correo"
          value={typeof form.correo === 'string' ? form.correo : ''}
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

        {/* Información adicional según tipo de usuario */}
        {form.tipo_usuario === 'Profesor' && (
          <Input
            label="Información de Profesor"
            name="info_profesor"
            value={form.info_profesor as string || ''}
            onChange={handleChange}
          />
        )}
        {form.tipo_usuario === 'Estudiante' && (
          <Input
            label="Información de Estudiante"
            name="info_estudiante"
            value={form.info_estudiante as string || ''}
            onChange={handleChange}
          />
        )}
        {form.tipo_usuario === 'Coordinador' && (
          <Input
            label="Información de Coordinador"
            name="info_coordinador"
            value={form.info_coordinador as string || ''}
            onChange={handleChange}
          />
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