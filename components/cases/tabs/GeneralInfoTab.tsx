'use client';

import { Calendar, User, Users, FileText, Building2, Scale } from 'lucide-react';
import Link from 'next/link';
import { formatDate, calculateAge } from '@/lib/utils/date-formatter';

interface GeneralInfoTabProps {
  caso: {
    id_caso: number;
    fecha_solicitud: string | null;
    fecha_inicio_caso: string | null;
    fecha_fin_caso: string | null;
    tramite: string | null;
    estatus: string | null;
    observaciones: string | null;
    nombre_nucleo: string | null;
    nombre_materia: string | null;
    nombre_categoria: string | null;
    nombre_subcategoria: string | null;
    cedula: string | null;
    nombres_solicitante: string | null;
    apellidos_solicitante: string | null;
    nombre_completo_solicitante: string | null;
    beneficiarios?: Array<{
      num_beneficiario: number;
      cedula: string | null;
      nombres: string;
      apellidos: string;
      fecha_nac: string;
      sexo: string;
      tipo_beneficiario: string;
      parentesco: string;
      nombre_completo: string;
    }>;
  };
}

export default function GeneralInfoTab({ caso }: GeneralInfoTabProps) {
  const formatSexo = (sexo: string | null) => {
    if (!sexo) return 'No especificado';
    return sexo === 'M' ? 'Masculino' : 'Femenino';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Información General del Caso */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Información General del Caso
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Código del Caso</label>
            <p className="text-base text-gray-900 mt-1">{caso.id_caso}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Estatus</label>
            <p className="text-base text-gray-900 mt-1">{caso.estatus || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Fecha de Solicitud</label>
            <p className="text-base text-gray-900 mt-1">
              {caso.fecha_solicitud ? formatDate(caso.fecha_solicitud) : 'N/A'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Fecha de Inicio</label>
            <p className="text-base text-gray-900 mt-1">
              {caso.fecha_inicio_caso ? formatDate(caso.fecha_inicio_caso) : 'N/A'}
            </p>
          </div>
          {caso.fecha_fin_caso && (
            <div>
              <label className="text-sm font-medium text-gray-500">Fecha de Fin</label>
              <p className="text-base text-gray-900 mt-1">
                {formatDate(caso.fecha_fin_caso)}
              </p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-500">Trámite</label>
            <p className="text-base text-gray-900 mt-1">{caso.tramite || 'N/A'}</p>
          </div>
          {caso.nombre_nucleo && (
            <div>
              <label className="text-sm font-medium text-gray-500">Núcleo</label>
              <p className="text-base text-gray-900 mt-1">
                {caso.nombre_nucleo}
              </p>
            </div>
          )}
          {caso.nombre_materia && (
            <div>
              <label className="text-sm font-medium text-gray-500">Materia</label>
              <p className="text-base text-gray-900 mt-1">
                {caso.nombre_materia}
              </p>
            </div>
          )}
          {caso.nombre_categoria &&
            caso.nombre_categoria.toLowerCase() !== 'sin categoría' &&
            caso.nombre_categoria.toLowerCase() !== 'n/a' && (
              <div>
                <label className="text-sm font-medium text-gray-500">Categoría</label>
                <p className="text-base text-gray-900 mt-1">{caso.nombre_categoria}</p>
              </div>
            )}
          {caso.nombre_subcategoria &&
            caso.nombre_subcategoria.toLowerCase() !== 'sin subcategoría' &&
            caso.nombre_subcategoria.toLowerCase() !== 'n/a' && (
              <div>
                <label className="text-sm font-medium text-gray-500">Subcategoría</label>
                <p className="text-base text-gray-900 mt-1">{caso.nombre_subcategoria}</p>
              </div>
            )}
        </div>
        {caso.observaciones && (
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-500">Observaciones</label>
            <p className="text-base text-gray-900 mt-1 whitespace-pre-wrap">{caso.observaciones}</p>
          </div>
        )}
      </div>

      {/* Información del Solicitante */}
      {caso.nombre_completo_solicitante && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Solicitante
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nombre Completo</label>
              <p className="text-base mt-1">
                {caso.cedula ? (
                  <Link
                    href={`/dashboard/applicants/${caso.cedula}`}
                    className="text-primary hover:underline font-medium transition-colors"
                  >
                    {caso.nombre_completo_solicitante}
                  </Link>
                ) : (
                  <span className="text-gray-900">{caso.nombre_completo_solicitante}</span>
                )}
              </p>
            </div>
            {caso.cedula && (
              <div>
                <label className="text-sm font-medium text-gray-500">Cédula</label>
                <p className="text-base text-gray-900 mt-1">{caso.cedula}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Beneficiarios */}
      {caso.beneficiarios && caso.beneficiarios.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Beneficiarios ({caso.beneficiarios.length})
          </h3>
          <div className="space-y-4">
            {caso.beneficiarios.map((beneficiario) => {
              const edad = beneficiario.fecha_nac ? calculateAge(beneficiario.fecha_nac) : null;
              return (
                <div key={beneficiario.num_beneficiario} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nombre Completo</label>
                      <p className="text-base text-gray-900 mt-1">{beneficiario.nombre_completo}</p>
                    </div>
                    {beneficiario.cedula && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Cédula</label>
                        <p className="text-base text-gray-900 mt-1">{beneficiario.cedula}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-500">Fecha de Nacimiento</label>
                      <p className="text-base text-gray-900 mt-1">
                        {beneficiario.fecha_nac ? formatDate(beneficiario.fecha_nac) : 'N/A'}
                        {edad !== null && ` (${edad} años)`}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Sexo</label>
                      <p className="text-base text-gray-900 mt-1">{formatSexo(beneficiario.sexo)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tipo de Beneficiario</label>
                      <p className="text-base text-gray-900 mt-1">{beneficiario.tipo_beneficiario}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Parentesco</label>
                      <p className="text-base text-gray-900 mt-1">{beneficiario.parentesco}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(!caso.beneficiarios || caso.beneficiarios.length === 0) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No hay beneficiarios registrados para este caso</p>
        </div>
      )}
    </div>
  );
}

