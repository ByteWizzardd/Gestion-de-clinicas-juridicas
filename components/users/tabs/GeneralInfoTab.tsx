// components/users/tabs/GeneralInfoTab.tsx
import React from 'react';

interface Usuario {
  cedula: string;
  nombres: string;
  apellidos: string;
  correo_electronico: string;
  telefono_celular: string | null;
  nombre_completo: string;
  nombre_usuario: string;
  habilitado_sistema?: boolean;
}

interface GeneralInfoTabProps {
  usuario: Usuario;
}

const GeneralInfoTab: React.FC<GeneralInfoTabProps> = ({ usuario }) => {
  return (
    <div className="bg-white rounded shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h2 className="font-semibold mb-2">Información de Contacto</h2>
        <div className="flex items-center mb-2">
          <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/></svg>
          <span><b>Correo:</b> {usuario.correo_electronico}</span>
        </div>
        <div className="flex items-center mb-2">  
          <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92V19a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3 5.18 2 2 0 0 1 5 3h2.09a2 2 0 0 1 2 1.72c.13 1.13.37 2.25.72 3.32a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c1.07.35 2.19.59 3.32.72A2 2 0 0 1 22 16.92z"/></svg>
          <span><b>Teléfono:</b> {usuario.telefono_celular || '-'}</span>
        </div>
      </div>
      <div>
        <h2 className="font-semibold mb-2">Datos Personales y de Sistema</h2>
        <div className="flex items-center mb-2">
          <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a6.5 6.5 0 0 1 13 0"/></svg>
          <span><b>Nombre Completo:</b> {usuario.nombre_completo}</span>
        </div>
        <div className="flex items-center mb-2">
          <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 11h8M8 15h6"/></svg>
          <span><b>Cédula:</b> {usuario.cedula}</span>
        </div>
        <div className="flex items-center mb-2">
            <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span><b>Estado:</b> {usuario.habilitado_sistema ? 'Habilitado' : 'Deshabilitado'}</span>
        </div>
        <div className="flex items-center mb-2">
          <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span><b>Usuario:</b> {usuario.nombre_usuario}</span>
        </div>
      </div>
    </div>
  );
};

export default GeneralInfoTab;
