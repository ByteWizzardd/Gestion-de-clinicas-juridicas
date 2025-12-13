'use client';

import { User, Calendar, MapPin, Building2 } from 'lucide-react';

interface PersonalInfoTabProps {
  cliente: {
    cedula: string;
    nombres: string;
    apellidos: string;
    fecha_nacimiento: string;
    edad: number;
    sexo: string;
    nacionalidad: string;
    estado_civil: string | null;
    concubinato: boolean | null;
    nombre_nucleo: string | null;
    nombre_parroquia: string | null;
    nombre_municipio: string | null;
    nombre_estado: string | null;
  };
}

export default function PersonalInfoTab({ cliente }: PersonalInfoTabProps) {
  const formatNacionalidad = (nacionalidad: string) => {
    const map: Record<string, string> = {
      'V': 'Venezolano',
      'E': 'Extranjero',
      'Ext': 'Extranjero'
    };
    return map[nacionalidad] || nacionalidad;
  };

  const formatSexo = (sexo: string) => {
    return sexo === 'M' ? 'Masculino' : 'Femenino';
  };

  const getTipoCedula = (cedula: string) => {
    if (cedula.startsWith('V')) return 'V';
    if (cedula.startsWith('E')) return 'E';
    return 'Ext';
  };

  return (
    <div className="space-y-6">
      {/* Datos Básicos Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Datos Básicos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Cédula</label>
            <p className="text-base text-gray-900 mt-1">
              {getTipoCedula(cliente.cedula)}-{cliente.cedula.substring(1)}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Nombres</label>
            <p className="text-base text-gray-900 mt-1">{cliente.nombres}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Apellidos</label>
            <p className="text-base text-gray-900 mt-1">{cliente.apellidos}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Fecha de Nacimiento</label>
            <p className="text-base text-gray-900 mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              {new Date(cliente.fecha_nacimiento).toLocaleDateString('es-VE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Edad</label>
            <p className="text-base text-gray-900 mt-1">{cliente.edad} años</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Sexo</label>
            <p className="text-base text-gray-900 mt-1">{formatSexo(cliente.sexo)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Nacionalidad</label>
            <p className="text-base text-gray-900 mt-1">{formatNacionalidad(cliente.nacionalidad)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Estado Civil</label>
            <p className="text-base text-gray-900 mt-1">{cliente.estado_civil || 'No especificado'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Concubinato</label>
            <p className="text-base text-gray-900 mt-1">
              {cliente.concubinato === null ? 'No especificado' : cliente.concubinato ? 'Sí' : 'No'}
            </p>
          </div>
        </div>
      </div>

      {/* Núcleo Asignado Card */}
      {cliente.nombre_nucleo && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Núcleo Asignado
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Núcleo</label>
              <p className="text-base text-gray-900 mt-1">{cliente.nombre_nucleo}</p>
            </div>
            {cliente.nombre_parroquia && (
              <div>
                <label className="text-sm font-medium text-gray-500">Parroquia</label>
                <p className="text-base text-gray-900 mt-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {cliente.nombre_parroquia}
                </p>
              </div>
            )}
            {cliente.nombre_municipio && (
              <div>
                <label className="text-sm font-medium text-gray-500">Municipio</label>
                <p className="text-base text-gray-900 mt-1">{cliente.nombre_municipio}</p>
              </div>
            )}
            {cliente.nombre_estado && (
              <div>
                <label className="text-sm font-medium text-gray-500">Estado</label>
                <p className="text-base text-gray-900 mt-1">{cliente.nombre_estado}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

