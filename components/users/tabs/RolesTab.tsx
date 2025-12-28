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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 11h8M8 15h6"/></svg>
        Roles y Perfiles
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Tipo de Usuario Principal</label>
          <p className="text-base text-gray-900 mt-1 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M22 9l-10 -4l-10 4l10 4l10 -4v6" />
              <path d="M6 10.6v5.4a6 3 0 0 0 12 0v-5.4" />
            </svg>
            {usuario.tipo_usuario || 'No especificado'}
          </p>
        </div>
        {usuario.info_estudiante && (
          <div>
            <label className="text-sm font-medium text-gray-500">Información de Estudiante</label>
            <p className="text-base text-gray-900 mt-1 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                <path d="M9 17h6" />
                <path d="M9 13h6" />
              </svg>
              {usuario.info_estudiante}
            </p>
          </div>
        )}
        {usuario.info_profesor && (
          <div>
            <label className="text-sm font-medium text-gray-500">Información de Profesor</label>
            <p className="text-base text-gray-900 mt-1 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                <path d="M9 17h6" />
                <path d="M9 13h6" />
              </svg>
              {usuario.info_profesor}
            </p>
          </div>
        )}
        {usuario.info_coordinador && (
          <div>
            <label className="text-sm font-medium text-gray-500">Información de Coordinador</label>
            <p className="text-base text-gray-900 mt-1 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                <path d="M9 17h6" />
                <path d="M9 13h6" />
              </svg>
              {usuario.info_coordinador}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RolesTab;
