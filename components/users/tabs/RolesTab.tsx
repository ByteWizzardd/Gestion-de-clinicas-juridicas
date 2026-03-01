// components/users/tabs/RolesTab.tsx
import React from 'react';
import { GraduationCap, BookOpen, Shield, Calendar, Hash, User } from 'lucide-react';

interface EstudianteInfo {
  term: string;
  nrc: string | null;
  tipo_estudiante: 'Voluntario' | 'Inscrito' | 'Egresado' | 'Servicio Comunitario' | null;
  habilitado?: boolean;
}

interface ProfesorInfo {
  term: string;
  tipo_profesor: string | null;
  habilitado?: boolean;
}

interface CoordinadorInfo {
  term: string;
  habilitado?: boolean;
}

interface Usuario {
  tipo_usuario?: string;
  estudiantes?: EstudianteInfo[];
  profesores?: ProfesorInfo[];
  coordinadores?: CoordinadorInfo[];
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
  const estudiantes = usuario.estudiantes || (usuario.estudiante?.term ? [{
    term: usuario.estudiante.term,
    nrc: usuario.estudiante.nrc,
    tipo_estudiante: usuario.estudiante.tipo_estudiante,
    habilitado: true
  }] : []);

  const profesores = usuario.profesores || (usuario.profesor?.term ? [{
    term: usuario.profesor.term,
    tipo_profesor: usuario.profesor.tipo_profesor,
    habilitado: true
  }] : []);

  const coordinadores = usuario.coordinadores || (usuario.coordinador?.term ? [{
    term: usuario.coordinador.term,
    habilitado: true
  }] : []);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Rol principal */}
      <div className="bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--card-border)] p-4 sm:p-6 transition-colors">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Rol Principal
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-[var(--card-text-muted)] transition-colors">Tipo de Usuario</label>
            <p className="text-base text-[var(--foreground)] mt-1 flex items-center gap-2 transition-colors">
              <GraduationCap className="w-4 h-4 text-[var(--card-text-muted)] transition-colors" />
              {usuario.tipo_usuario || 'No especificado'}
            </p>
          </div>
        </div>
      </div>

      {/* Inscripciones como Estudiante */}
      {estudiantes.length > 0 && (
        <div className="bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--card-border)] p-4 sm:p-6 transition-colors">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Inscripciones como Estudiante
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr className="border-b border-[var(--card-border)] transition-colors">
                  <th className="text-left py-3 px-4 font-medium text-[var(--card-text-muted)] w-1/3 transition-colors">Semestre</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--card-text-muted)] w-1/3 transition-colors">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--card-text-muted)] w-1/3 transition-colors">NRC</th>
                </tr>
              </thead>
              <tbody>
                {estudiantes.map((est, index) => (
                  <tr
                    key={`${est.term}-${index}`}
                    className="border-b border-[var(--card-border)] hover:bg-[var(--sidebar-hover)] transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 transition-colors">
                        <Calendar className="w-4 h-4 text-[var(--card-text-muted)] flex-shrink-0 transition-colors" />
                        <span className="font-medium text-[var(--foreground)] transition-colors">{est.term}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[var(--card-text)] transition-colors">{est.tipo_estudiante || '-'}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 transition-colors">
                        <Hash className="w-4 h-4 text-[var(--card-text-muted)] flex-shrink-0 transition-colors" />
                        <span className="text-[var(--card-text)] transition-colors">{est.nrc || '-'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[var(--card-text-muted)] mt-3 transition-colors">
            Total: {estudiantes.length} semestre{estudiantes.length !== 1 ? 's' : ''} registrado{estudiantes.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Asignaciones como Profesor */}
      {profesores.length > 0 && (
        <div className="bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--card-border)] p-4 sm:p-6 transition-colors">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Asignaciones como Profesor
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr className="border-b border-[var(--card-border)] transition-colors">
                  <th className="text-left py-3 px-4 font-medium text-[var(--card-text-muted)] w-1/2 transition-colors">Semestre</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--card-text-muted)] w-1/2 transition-colors">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {profesores.map((prof, index) => (
                  <tr
                    key={`${prof.term}-${index}`}
                    className="border-b border-[var(--card-border)] hover:bg-[var(--sidebar-hover)] transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 transition-colors">
                        <Calendar className="w-4 h-4 text-[var(--card-text-muted)] flex-shrink-0 transition-colors" />
                        <span className="font-medium text-[var(--foreground)] transition-colors">{prof.term}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[var(--card-text)] transition-colors">{prof.tipo_profesor || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[var(--card-text-muted)] mt-3 transition-colors">
            Total: {profesores.length} semestre{profesores.length !== 1 ? 's' : ''} registrado{profesores.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Asignaciones como Coordinador */}
      {coordinadores.length > 0 && (
        <div className="bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--card-border)] p-4 sm:p-6 transition-colors">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Asignaciones como Coordinador
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr className="border-b border-[var(--card-border)] transition-colors">
                  <th className="text-left py-3 px-4 font-medium text-[var(--card-text-muted)] w-full transition-colors">Semestre</th>
                </tr>
              </thead>
              <tbody>
                {coordinadores.map((coord, index) => (
                  <tr
                    key={`${coord.term}-${index}`}
                    className="border-b border-[var(--card-border)] hover:bg-[var(--sidebar-hover)] transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 transition-colors">
                        <Calendar className="w-4 h-4 text-[var(--card-text-muted)] flex-shrink-0 transition-colors" />
                        <span className="font-medium text-[var(--foreground)] transition-colors">{coord.term}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[var(--card-text-muted)] mt-3 transition-colors">
            Total: {coordinadores.length} semestre{coordinadores.length !== 1 ? 's' : ''} registrado{coordinadores.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Mensaje si no tiene ningún rol adicional */}
      {estudiantes.length === 0 && profesores.length === 0 && coordinadores.length === 0 && (
        <div className="bg-[var(--sidebar-hover)] rounded-lg border border-[var(--card-border)] p-6 text-center transition-colors">
          <User className="w-12 h-12 text-[var(--card-text-muted)] mx-auto mb-3 transition-colors" />
          <p className="text-[var(--card-text)] transition-colors">Este usuario no tiene inscripciones en ningún semestre.</p>
        </div>
      )}
    </div>
  );
};

export default RolesTab;
