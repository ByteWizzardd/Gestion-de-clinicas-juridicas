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
  fotoPerfil?: string | null;
}

interface GeneralInfoTabProps {
  usuario: Usuario;
}

const GeneralInfoTab: React.FC<GeneralInfoTabProps> = ({ usuario }) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Información de Contacto */}
      <div className="bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--card-border)] p-4 sm:p-6 transition-colors">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 9h6M9 13h6M9 17h6" />
          </svg>
          Información de Contacto
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-[var(--card-text-muted)] transition-colors">Correo</label>
            <p className="text-base text-[var(--foreground)] mt-1 flex items-center gap-2 transition-colors">
              <svg className="w-4 h-4 text-[var(--card-text-muted)] transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" /><polyline points="3 7 12 13 21 7" /></svg>
              {usuario.correo_electronico}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--card-text-muted)] transition-colors">Teléfono</label>
            <p className="text-base text-[var(--foreground)] mt-1 flex items-center gap-2 transition-colors">
              <svg className="w-4 h-4 text-[var(--card-text-muted)] transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92V19a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3 5.18 2 2 0 0 1 5 3h2.09a2 2 0 0 1 2 1.72c.13 1.13.37 2.25.72 3.32a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c1.07.35 2.19.59 3.32.72A2 2 0 0 1 22 16.92z" /></svg>
              {usuario.telefono_celular || '-'}
            </p>
          </div>
        </div>
      </div>
      {/* Datos Personales */}
      <div className="bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--card-border)] p-4 sm:p-6 transition-colors">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4" /><path d="M5.5 21a6.5 6.5 0 0 1 13 0" /></svg>
          Datos Personales
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-[var(--card-text-muted)] transition-colors">Nombre Completo</label>
            <p className="text-base text-[var(--foreground)] mt-1 flex items-center gap-2 transition-colors">
              <svg className="w-4 h-4 text-[var(--card-text-muted)] transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4" /><path d="M5.5 21a6.5 6.5 0 0 1 13 0" /></svg>
              {usuario.nombre_completo}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--card-text-muted)] transition-colors">Cédula</label>
            <p className="text-base text-[var(--foreground)] mt-1 flex items-center gap-2 transition-colors">
              <svg className="w-4 h-4 text-[var(--card-text-muted)] transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 11h8M8 15h6" /></svg>
              {usuario.cedula}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--card-text-muted)] transition-colors">Estado</label>
            <p className="text-base text-[var(--foreground)] mt-1 flex items-center gap-2 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[var(--card-text-muted)] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z" />
                <path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" />
                <path d="M8 11v-4a4 4 0 1 1 8 0v4" />
              </svg>
              {usuario.habilitado_sistema ? 'Habilitado' : 'Deshabilitado'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--card-text-muted)] transition-colors">Usuario</label>
            <p className="text-base text-[var(--foreground)] mt-1 flex items-center gap-2 transition-colors">
              <svg className="w-4 h-4 text-[var(--card-text-muted)] transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              {usuario.nombre_usuario}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralInfoTab;
