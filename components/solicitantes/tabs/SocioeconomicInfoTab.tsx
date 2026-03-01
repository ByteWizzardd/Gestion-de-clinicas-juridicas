'use client';

import { GraduationCap, Briefcase, Home, CheckCircle } from 'lucide-react';

interface SocioeconomicInfoTabProps {
  solicitante: {
    nivel?: string | number | null;
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
  };
}

export default function SocioeconomicInfoTab({ solicitante }: SocioeconomicInfoTabProps) {

  // Verificar si hay información socioeconómica
  const hasEducation = solicitante.nivel !== null && solicitante.nivel !== undefined;
  const hasWork = solicitante.condicion_actividad || solicitante.condicion_trabajo;
  const hasHome = solicitante.cant_personas !== null || solicitante.cant_trabajadores !== null;

  if (!hasEducation && !hasWork && !hasHome) {
    return (
      <div className="bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--card-border)] p-8 text-center transition-colors">
        <p className="text-[var(--card-text-muted)] text-lg">No hay información socioeconómica disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Educación */}
      {hasEducation && (
        <div className="bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--card-border)] p-4 sm:p-6 transition-colors">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-[var(--card-text)]">
            <GraduationCap className="w-5 h-5 text-primary" />
            Educación
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {solicitante.nivel !== null && solicitante.nivel !== undefined && (
              <div>
                <label className="text-sm font-medium text-[var(--card-text-muted)]">Nivel Educativo</label>
                <p className="text-base text-[var(--card-text)] mt-1">Nivel {solicitante.nivel}</p>
              </div>
            )}
            {solicitante.anos_cursados !== null && solicitante.anos_cursados !== undefined && (
              <div>
                <label className="text-sm font-medium text-[var(--card-text-muted)]">Años Cursados</label>
                <p className="text-base text-[var(--card-text)] mt-1">{solicitante.anos_cursados} años</p>
              </div>
            )}
            {solicitante.semestres_cursados !== null && solicitante.semestres_cursados !== undefined && (
              <div>
                <label className="text-sm font-medium text-[var(--card-text-muted)]">Semestres Cursados</label>
                <p className="text-base text-[var(--card-text)] mt-1">{solicitante.semestres_cursados} semestres</p>
              </div>
            )}
            {solicitante.trimestres_cursados !== null && solicitante.trimestres_cursados !== undefined && (
              <div>
                <label className="text-sm font-medium text-[var(--card-text-muted)]">Trimestres Cursados</label>
                <p className="text-base text-[var(--card-text)] mt-1">{solicitante.trimestres_cursados} trimestres</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trabajo */}
      {hasWork && (
        <div className="bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--card-border)] p-4 sm:p-6 transition-colors">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-[var(--card-text)]">
            <Briefcase className="w-5 h-5 text-primary" />
            Trabajo
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {solicitante.condicion_actividad && (
              <div className="flex flex-col items-start gap-2">
                <label className="text-sm font-medium text-[var(--card-text-muted)]">Condición de Actividad</label>
                <span className="px-3 py-1 bg-primary/10 text-primary dark:bg-primary/20 rounded-full text-sm font-medium">
                  {solicitante.condicion_actividad}
                </span>
              </div>
            )}
            {solicitante.buscando_trabajo !== null && solicitante.buscando_trabajo !== undefined && (
              <div>
                <label className="text-sm font-medium text-[var(--card-text-muted)]">Buscando Trabajo</label>
                <p className="text-base text-[var(--card-text)] mt-1">
                  {solicitante.buscando_trabajo ? 'Sí' : 'No'}
                </p>
              </div>
            )}
            {solicitante.condicion_trabajo && (
              <div className="flex flex-col items-start gap-2">
                <label className="text-sm font-medium text-[var(--card-text-muted)]">Condición de Trabajo</label>
                <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-sm font-medium">
                  {solicitante.condicion_trabajo}
                </span>
              </div>
            )}
          </div>
        </div>
      )}



      {/* Hogar Familiar */}
      {
        hasHome && (
          <div className="bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--card-border)] p-4 sm:p-6 transition-colors">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-[var(--card-text)]">
              <Home className="w-5 h-5 text-primary" />
              Hogar Familiar
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {solicitante.cant_personas !== null && solicitante.cant_personas !== undefined && (
                <div>
                  <label className="text-sm font-medium text-[var(--card-text-muted)]">Cantidad de Personas</label>
                  <p className="text-base text-[var(--card-text)] mt-1">{solicitante.cant_personas} personas</p>
                </div>
              )}
              {solicitante.cant_trabajadores !== null && solicitante.cant_trabajadores !== undefined && (
                <div>
                  <label className="text-sm font-medium text-[var(--card-text-muted)]">Cantidad de Trabajadores</label>
                  <p className="text-base text-[var(--card-text)] mt-1">{solicitante.cant_trabajadores} trabajadores</p>
                </div>
              )}
              {solicitante.cant_ninos !== null && solicitante.cant_ninos !== undefined && (
                <div>
                  <label className="text-sm font-medium text-[var(--card-text-muted)]">Cantidad de Niños</label>
                  <p className="text-base text-[var(--card-text)] mt-1">{solicitante.cant_ninos} niños</p>
                </div>
              )}
              {solicitante.cant_ninos_estudiando !== null && solicitante.cant_ninos_estudiando !== undefined && (
                <div>
                  <label className="text-sm font-medium text-[var(--card-text-muted)]">Niños Estudiando</label>
                  <p className="text-base text-[var(--card-text)] mt-1">{solicitante.cant_ninos_estudiando} niños</p>
                </div>
              )}
              {solicitante.jefe_hogar !== null && solicitante.jefe_hogar !== undefined && (
                <div>
                  <label className="text-sm font-medium text-[var(--card-text-muted)]">Es Jefe de Hogar</label>
                  <p className="text-base text-[var(--card-text)] mt-1">
                    {solicitante.jefe_hogar ? 'Sí' : 'No'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )
      }
    </div >
  );
}

