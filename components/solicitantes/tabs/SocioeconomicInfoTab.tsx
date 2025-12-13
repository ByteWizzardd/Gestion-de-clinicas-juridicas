'use client';

import { GraduationCap, Briefcase, Home, CheckCircle } from 'lucide-react';

interface SocioeconomicInfoTabProps {
  cliente: {
    nivel?: number | null;
    anos_cursados?: number | null;
    semestres_cursados?: number | null;
    trimestres_cursados?: number | null;
    condicion_actividad?: string | null;
    buscando_trabajo?: boolean | null;
    condicion_trabajo?: string | null;
    cant_personas?: number | null;
    cant_trabajadores?: number | null;
    cant_ninos?: number | null;
    cant_ninos_estudiando?: number | null;
    jefe_hogar?: boolean | null;
    artefactos?: string[];
  };
}

export default function SocioeconomicInfoTab({ cliente }: SocioeconomicInfoTabProps) {
  const artefactosDisponibles = ['Nevera', 'Lavadora', 'Computadora', 'Cable Satelital', 'Internet', 'Carro', 'Moto'];

  return (
    <div className="space-y-6">
      {/* Educación */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" />
          Educación
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cliente.nivel !== null && cliente.nivel !== undefined && (
            <div>
              <label className="text-sm font-medium text-gray-500">Nivel Educativo</label>
              <p className="text-base text-gray-900 mt-1">Nivel {cliente.nivel}</p>
            </div>
          )}
          {cliente.anos_cursados !== null && cliente.anos_cursados !== undefined && (
            <div>
              <label className="text-sm font-medium text-gray-500">Años Cursados</label>
              <p className="text-base text-gray-900 mt-1">{cliente.anos_cursados} años</p>
            </div>
          )}
          {cliente.semestres_cursados !== null && cliente.semestres_cursados !== undefined && (
            <div>
              <label className="text-sm font-medium text-gray-500">Semestres Cursados</label>
              <p className="text-base text-gray-900 mt-1">{cliente.semestres_cursados} semestres</p>
            </div>
          )}
          {cliente.trimestres_cursados !== null && cliente.trimestres_cursados !== undefined && (
            <div>
              <label className="text-sm font-medium text-gray-500">Trimestres Cursados</label>
              <p className="text-base text-gray-900 mt-1">{cliente.trimestres_cursados} trimestres</p>
            </div>
          )}
        </div>
      </div>

      {/* Trabajo */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          Trabajo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cliente.condicion_actividad && (
            <div>
              <label className="text-sm font-medium text-gray-500">Condición de Actividad</label>
              <span className="inline-block mt-1 px-3 py-1 bg-primary-light text-primary rounded-full text-sm font-medium">
                {cliente.condicion_actividad}
              </span>
            </div>
          )}
          {cliente.buscando_trabajo !== null && cliente.buscando_trabajo !== undefined && (
            <div>
              <label className="text-sm font-medium text-gray-500">Buscando Trabajo</label>
              <p className="text-base text-gray-900 mt-1">
                {cliente.buscando_trabajo ? 'Sí' : 'No'}
              </p>
            </div>
          )}
          {cliente.condicion_trabajo && (
            <div>
              <label className="text-sm font-medium text-gray-500">Condición de Trabajo</label>
              <span className="inline-block mt-1 px-3 py-1 bg-secondary-light text-secondary rounded-full text-sm font-medium">
                {cliente.condicion_trabajo}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Hogar Familiar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Home className="w-5 h-5 text-primary" />
          Hogar Familiar
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {cliente.cant_personas !== null && cliente.cant_personas !== undefined && (
            <div>
              <label className="text-sm font-medium text-gray-500">Cantidad de Personas</label>
              <p className="text-base text-gray-900 mt-1">{cliente.cant_personas} personas</p>
            </div>
          )}
          {cliente.cant_trabajadores !== null && cliente.cant_trabajadores !== undefined && (
            <div>
              <label className="text-sm font-medium text-gray-500">Cantidad de Trabajadores</label>
              <p className="text-base text-gray-900 mt-1">{cliente.cant_trabajadores} trabajadores</p>
            </div>
          )}
          {cliente.cant_ninos !== null && cliente.cant_ninos !== undefined && (
            <div>
              <label className="text-sm font-medium text-gray-500">Cantidad de Niños</label>
              <p className="text-base text-gray-900 mt-1">{cliente.cant_ninos} niños</p>
            </div>
          )}
          {cliente.cant_ninos_estudiando !== null && cliente.cant_ninos_estudiando !== undefined && (
            <div>
              <label className="text-sm font-medium text-gray-500">Niños Estudiando</label>
              <p className="text-base text-gray-900 mt-1">{cliente.cant_ninos_estudiando} niños</p>
            </div>
          )}
          {cliente.jefe_hogar !== null && cliente.jefe_hogar !== undefined && (
            <div>
              <label className="text-sm font-medium text-gray-500">Es Jefe de Hogar</label>
              <p className="text-base text-gray-900 mt-1">
                {cliente.jefe_hogar ? 'Sí' : 'No'}
              </p>
            </div>
          )}
        </div>

        {/* Artefactos Domésticos */}
        {cliente.artefactos && cliente.artefactos.length > 0 && (
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-500 mb-2 block">Artefactos Domésticos</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {artefactosDisponibles.map((artefacto) => {
                const tiene = cliente.artefactos?.includes(artefacto);
                return (
                  <div
                    key={artefacto}
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      tiene ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'
                    }`}
                  >
                    <CheckCircle className={`w-4 h-4 ${tiene ? 'text-green-600' : 'text-gray-300'}`} />
                    <span className="text-sm">{artefacto}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

