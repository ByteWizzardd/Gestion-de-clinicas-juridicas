'use client';

import { Users, User, Mail, Phone, GraduationCap, Briefcase } from 'lucide-react';

interface TeamTabProps {
  equipo?: Array<{
    tipo: 'profesor' | 'estudiante';
    cedula: string;
    nombres: string;
    apellidos: string;
    nombre_completo: string;
    correo_electronico: string | null;
    telefono_celular: string | null;
    term: string | null;
    habilitado: boolean;
    rol: string;
  }>;
}

export default function TeamTab({ equipo }: TeamTabProps) {
  if (!equipo || equipo.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No hay equipo asignado a este caso</p>
      </div>
    );
  }

  const profesores = equipo.filter(m => m.tipo === 'profesor');
  const estudiantes = equipo.filter(m => m.tipo === 'estudiante');

  return (
    <div className="space-y-6">
      {/* Profesores */}
      {profesores.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Profesores Supervisores ({profesores.length})
          </h3>
          <div className="space-y-4">
            {profesores.map((profesor) => (
              <div key={profesor.cedula} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nombre Completo</label>
                    <p className="text-base text-gray-900 mt-1 flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      {profesor.nombre_completo}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Cédula</label>
                    <p className="text-base text-gray-900 mt-1">{profesor.cedula}</p>
                  </div>
                  {profesor.correo_electronico && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Correo Electrónico</label>
                      <p className="text-base text-gray-900 mt-1 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {profesor.correo_electronico}
                      </p>
                    </div>
                  )}
                  {profesor.telefono_celular && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Teléfono</label>
                      <p className="text-base text-gray-900 mt-1 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {profesor.telefono_celular}
                      </p>
                    </div>
                  )}
                  {profesor.term && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Término</label>
                      <p className="text-base text-gray-900 mt-1">{profesor.term}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Estado</label>
                    <p className="text-base text-gray-900 mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${profesor.habilitado
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}>
                        {profesor.habilitado ? 'Activo' : 'Inactivo'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estudiantes */}
      {estudiantes.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Estudiantes ({estudiantes.length})
          </h3>
          <div className="space-y-4">
            {estudiantes.map((estudiante) => (
              <div key={estudiante.cedula} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nombre Completo</label>
                    <p className="text-base text-gray-900 mt-1 flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      {estudiante.nombre_completo}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Cédula</label>
                    <p className="text-base text-gray-900 mt-1">{estudiante.cedula}</p>
                  </div>
                  {estudiante.correo_electronico && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Correo Electrónico</label>
                      <p className="text-base text-gray-900 mt-1 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {estudiante.correo_electronico}
                      </p>
                    </div>
                  )}
                  {estudiante.telefono_celular && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Teléfono</label>
                      <p className="text-base text-gray-900 mt-1 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {estudiante.telefono_celular}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Rol</label>
                    <p className="text-base text-gray-900 mt-1">{estudiante.rol}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

