// components/profile/tabs/GeneralInfoTab.tsx
import React from 'react';
import { motion } from 'motion/react';

interface User {
  cedula: string;
  nombres: string;
  apellidos: string;
  correo: string;
  rol: string;
}

interface GeneralInfoTabProps {
  user: User;
}

const GeneralInfoTab: React.FC<GeneralInfoTabProps> = ({ user }) => {
  const nombreCompleto = `${user.nombres} ${user.apellidos}`;

  const getRoleLabel = (rol: string): string => {
    const roleLabels: Record<string, string> = {
      'Coordinador': 'Coordinador',
      'Profesor': 'Profesor',
      'Estudiante': 'Estudiante',
    };
    return roleLabels[rol] || rol;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Información de Contacto */}
      <motion.div
        className="bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--card-border)] p-4 sm:p-6 transition-colors"
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1, ease: "easeOut" }}
      >
        <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-[var(--foreground)] transition-colors">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 9h6M9 13h6M9 17h6" />
          </svg>
          Información de Contacto
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-[var(--card-text-muted)] transition-colors">Correo</label>
            <p className="text-base text-[var(--card-text)] mt-1 flex items-center gap-2 transition-colors">
              <svg className="w-4 h-4 text-[var(--card-text-muted)] transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" /><polyline points="3 7 12 13 21 7" /></svg>
              {user.correo}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Datos Personales */}
      <motion.div
        className="bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--card-border)] p-4 sm:p-6 transition-colors"
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1, ease: "easeOut" }}
      >
        <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-[var(--foreground)] transition-colors">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4" /><path d="M5.5 21a6.5 6.5 0 0 1 13 0" /></svg>
          Datos Personales
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-[var(--card-text-muted)] transition-colors">Nombre Completo</label>
            <p className="text-base text-[var(--card-text)] mt-1 flex items-center gap-2 transition-colors">
              <svg className="w-4 h-4 text-[var(--card-text-muted)] transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4" /><path d="M5.5 21a6.5 6.5 0 0 1 13 0" /></svg>
              {nombreCompleto}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--card-text-muted)] transition-colors">Cédula</label>
            <p className="text-base text-[var(--card-text)] mt-1 flex items-center gap-2 transition-colors">
              <svg className="w-4 h-4 text-[var(--card-text-muted)] transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 11h8M8 15h6" /></svg>
              {user.cedula}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--card-text-muted)] transition-colors">Rol</label>
            <p className="text-base text-[var(--card-text)] mt-1 flex items-center gap-2 transition-colors">
              <svg className="w-4 h-4 text-[var(--card-text-muted)] transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              {getRoleLabel(user.rol)}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GeneralInfoTab;
