// components/users/tabs/RolesTab.tsx
import React from 'react';


interface Usuario {
  tipo_usuario?: string;
  estudiante?: {
    nrc: string | null;
    term: string | null;
    tipo_estudiante: 'Voluntario' | 'Inscrito' | 'Egresado' | 'Servicio Comunitario' | null;
  };
  profesor?: {
    term: string | null;
    tipo_profesor: string | null;
  };
  coordinador?: {
    term: string | null;
  };
}

interface RolesTabProps {
  usuario: Usuario;
}

const RolesTab: React.FC<RolesTabProps> = ({ usuario }) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Rol principal */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="4" y="4" width="16" height="16" rx="2"/>
            <path d="M8 11h8M8 15h6"/>
          </svg>
          Rol Principal
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Tipo de Usuario</label>
            <p className="text-base text-gray-900 mt-1 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M22 9l-10 -4l-10 4l10 4l10 -4v6" />
                <path d="M6 10.6v5.4a6 3 0 0 0 12 0v-5.4" />
              </svg>
              {usuario.tipo_usuario || 'No especificado'}
            </p>
          </div>
        </div>
      </div>
      {/* Información de Estudiante */}
      {usuario.estudiante && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="7" r="4"/>
              <path d="M5.5 21a6.5 6.5 0 0 1 13 0"/>
            </svg>
            Información de Estudiante
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Tipo de Estudiante</label>
              <p className="text-base text-gray-900 mt-1">{usuario.estudiante.tipo_estudiante || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">NRC</label>
              <p className="text-base text-gray-900 mt-1">{usuario.estudiante.nrc || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Term</label>
              <p className="text-base text-gray-900 mt-1">{usuario.estudiante.term || '-'}</p>
            </div>
          </div>
        </div>
      )}
      {/* Información de Profesor */}
      {usuario.profesor && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="4" y="4" width="16" height="16" rx="2"/>
              <path d="M8 11h8M8 15h6"/>
            </svg>
            Información de Profesor
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Tipo de Profesor</label>
              <p className="text-base text-gray-900 mt-1">{usuario.profesor.tipo_profesor || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Term</label>
              <p className="text-base text-gray-900 mt-1">{usuario.profesor.term || '-'}</p>
            </div>
          </div>
        </div>
      )}
      {/* Información de Coordinador */}
      {usuario.coordinador && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="4" y="4" width="16" height="16" rx="2"/>
              <path d="M8 11h8M8 15h6"/>
            </svg>
            Información de Coordinador
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Term</label>
              <p className="text-base text-gray-900 mt-1">{usuario.coordinador.term || '-'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesTab;
