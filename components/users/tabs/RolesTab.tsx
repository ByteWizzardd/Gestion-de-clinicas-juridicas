// components/users/tabs/RolesTab.tsx
import React from 'react';

interface Usuario {
  tipo_usuario?: string;
  info_estudiante?: string | null;
  info_profesor?: string | null;
  info_coordinador?: string | null;
}

interface RolesTabProps {
  usuario: Usuario;
}

const RolesTab: React.FC<RolesTabProps> = ({ usuario }) => {
  return (
    <div className="bg-white rounded shadow p-6">
      <h2 className="font-semibold mb-4">Roles y Perfiles</h2>
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-gray-800">Tipo de Usuario Principal</h3>
          <p className="text-gray-600">{usuario.tipo_usuario || 'No especificado'}</p>
        </div>
        {usuario.info_estudiante && (
          <div>
            <h3 className="font-medium text-gray-800">Información de Estudiante</h3>
            <p className="text-gray-600">{usuario.info_estudiante}</p>
          </div>
        )}
        {usuario.info_profesor && (
          <div>
            <h3 className="font-medium text-gray-800">Información de Profesor</h3>
            <p className="text-gray-600">{usuario.info_profesor}</p>
          </div>
        )}
        {usuario.info_coordinador && (
          <div>
            <h3 className="font-medium text-gray-800">Información de Coordinador</h3>
            <p className="text-gray-600">{usuario.info_coordinador}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RolesTab;
