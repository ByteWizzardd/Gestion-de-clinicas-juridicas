'use client';

import { User, Calendar, MapPin, Building2 } from 'lucide-react';
import { formatDate, calculateAge } from '@/lib/utils/date-formatter';

interface PersonalInfoTabProps {
  solicitante: {
    cedula?: string | null;
    nombres?: string | null;
    apellidos?: string | null;
    fecha_nacimiento?: string | null;
    edad?: number | null;
    sexo?: string | null;
    nacionalidad?: string | null;
    estado_civil?: string | null;
    concubinato?: boolean | null;
    nombre_nucleo?: string | null;
    // Dirección del núcleo
    nucleo_nombre_parroquia?: string | null;
    nucleo_nombre_municipio?: string | null;
    nucleo_nombre_estado?: string | null;
    // Dirección del solicitante (para otros usos)
    nombre_parroquia?: string | null;
    nombre_municipio?: string | null;
    nombre_estado?: string | null;
  };
}

export default function PersonalInfoTab({ solicitante }: PersonalInfoTabProps) {
  const formatNacionalidad = (nacionalidad: string | null) => {
    if (!nacionalidad) return 'No especificado';
    const map: Record<string, string> = {
      'V': 'Venezolano',
      'E': 'Extranjero',
      'Ext': 'Extranjero' // Mantener compatibilidad con datos antiguos
    };
    return map[nacionalidad] || nacionalidad;
  };

  const formatSexo = (sexo: string | null) => {
    if (!sexo) return 'No especificado';
    return sexo === 'M' ? 'Masculino' : 'Femenino';
  };

  // Calcular edad si no viene del backend
  const edad = solicitante.edad ?? (solicitante.fecha_nacimiento ? calculateAge(solicitante.fecha_nacimiento) : null);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Datos Básicos Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Datos Básicos
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {solicitante.cedula && (
            <div>
              <label className="text-sm font-medium text-gray-500">Cédula</label>
              <p className="text-base text-gray-900 mt-1">
                {solicitante.cedula}
              </p>
            </div>
          )}
          {solicitante.nombres && (
            <div>
              <label className="text-sm font-medium text-gray-500">Nombres</label>
              <p className="text-base text-gray-900 mt-1">{solicitante.nombres}</p>
            </div>
          )}
          {solicitante.apellidos && (
            <div>
              <label className="text-sm font-medium text-gray-500">Apellidos</label>
              <p className="text-base text-gray-900 mt-1">{solicitante.apellidos}</p>
            </div>
          )}
          {solicitante.fecha_nacimiento && (
            <div>
              <label className="text-sm font-medium text-gray-500">Fecha de Nacimiento</label>
              <p className="text-base text-gray-900 mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                {formatDate(solicitante.fecha_nacimiento)}
              </p>
            </div>
          )}
          {edad !== null && edad !== undefined && (
            <div>
              <label className="text-sm font-medium text-gray-500">Edad</label>
              <p className="text-base text-gray-900 mt-1">{edad} años</p>
            </div>
          )}
          {solicitante.sexo && (
            <div>
              <label className="text-sm font-medium text-gray-500">Sexo</label>
              <p className="text-base text-gray-900 mt-1">{formatSexo(solicitante.sexo)}</p>
            </div>
          )}
          {solicitante.nacionalidad && (
            <div>
              <label className="text-sm font-medium text-gray-500">Nacionalidad</label>
              <p className="text-base text-gray-900 mt-1">{formatNacionalidad(solicitante.nacionalidad)}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-500">Estado Civil</label>
            <p className="text-base text-gray-900 mt-1">{solicitante.estado_civil || 'No especificado'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Concubinato</label>
            <p className="text-base text-gray-900 mt-1">
              {solicitante.concubinato === null ? 'No especificado' : solicitante.concubinato ? 'Sí' : 'No'}
            </p>
          </div>
        </div>
      </div>

      {/* Núcleo Asignado Card */}
      {solicitante.nombre_nucleo && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Núcleo Asignado
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Núcleo</label>
              <p className="text-base text-gray-900 mt-1">{solicitante.nombre_nucleo}</p>
            </div>
            {(solicitante.nucleo_nombre_parroquia || solicitante.nombre_parroquia) && (
              <div>
                <label className="text-sm font-medium text-gray-500">Parroquia</label>
                <p className="text-base text-gray-900 mt-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {solicitante.nucleo_nombre_parroquia || solicitante.nombre_parroquia}
                </p>
              </div>
            )}
            {(solicitante.nucleo_nombre_municipio || solicitante.nombre_municipio) && (
              <div>
                <label className="text-sm font-medium text-gray-500">Municipio</label>
                <p className="text-base text-gray-900 mt-1">{solicitante.nucleo_nombre_municipio || solicitante.nombre_municipio}</p>
              </div>
            )}
            {(solicitante.nucleo_nombre_estado || solicitante.nombre_estado) && (
              <div>
                <label className="text-sm font-medium text-gray-500">Estado</label>
                <p className="text-base text-gray-900 mt-1">{solicitante.nucleo_nombre_estado || solicitante.nombre_estado}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}