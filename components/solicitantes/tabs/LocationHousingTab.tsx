'use client';

import { MapPin, Home, Sparkles, Package } from 'lucide-react';

interface LocationHousingTabProps {
  solicitante: {
    nombre_estado?: string | null;
    nombre_municipio?: string | null;
    nombre_parroquia?: string | null;
    direccion_habitacion?: string | null;
    tipo_vivienda?: string | null;
    cant_habitaciones?: number | null;
    cant_banos?: number | null;
    material_piso?: string | null;
    material_paredes?: string | null;
    material_techo?: string | null;
    agua_potable?: string | null;
    eliminacion_aguas_n?: string | null;
    aseo?: string | null;
    artefactos_domesticos?: string[] | string | null;
  };
}

export default function LocationHousingTab({ solicitante }: LocationHousingTabProps) {
  // Procesar artefactos domésticos (puede venir como JSON string o array)
  let artefactos: string[] = [];
  if (solicitante.artefactos_domesticos) {
    if (typeof solicitante.artefactos_domesticos === 'string') {
      try {
        const parsed = JSON.parse(solicitante.artefactos_domesticos);
        artefactos = Array.isArray(parsed) ? parsed : [];
      } catch {
        artefactos = [];
      }
    } else if (Array.isArray(solicitante.artefactos_domesticos)) {
      artefactos = solicitante.artefactos_domesticos;
    }
  }

  // Verificar si hay información de ubicación o vivienda
  const hasLocation = solicitante.nombre_estado || solicitante.nombre_municipio || solicitante.nombre_parroquia;
  const hasHousing = solicitante.tipo_vivienda || solicitante.cant_habitaciones !== null || solicitante.cant_banos !== null;
  const hasServices = solicitante.agua_potable || solicitante.eliminacion_aguas_n || solicitante.aseo;
  const hasArtefactos = artefactos.length > 0;

  if (!hasLocation && !hasHousing && !hasServices && !hasArtefactos) {
    return (
      <div className="bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--card-border)] p-8 text-center transition-colors">
        <p className="text-[var(--card-text-muted)] text-lg">No hay información de ubicación y vivienda disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Ubicación Geográfica */}
      {hasLocation && (
        <div className="bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--card-border)] p-4 sm:p-6 transition-colors">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-[var(--card-text)]">
            <MapPin className="w-5 h-5 text-primary" />
            Ubicación Geográfica
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {solicitante.nombre_estado && (
              <div>
                <label className="text-sm font-medium text-[var(--card-text-muted)]">Estado</label>
                <p className="text-base text-[var(--card-text)] mt-1">{solicitante.nombre_estado}</p>
              </div>
            )}
            {solicitante.nombre_municipio && (
              <div>
                <label className="text-sm font-medium text-[var(--card-text-muted)]">Municipio</label>
                <p className="text-base text-[var(--card-text)] mt-1">{solicitante.nombre_municipio}</p>
              </div>
            )}
            {solicitante.nombre_parroquia && (
              <div>
                <label className="text-sm font-medium text-[var(--card-text-muted)]">Parroquia</label>
                <p className="text-base text-[var(--card-text)] mt-1">{solicitante.nombre_parroquia}</p>
              </div>
            )}
            {solicitante.direccion_habitacion && (
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-[var(--card-text-muted)]">Dirección de Habitación</label>
                <p className="text-base text-[var(--card-text)] mt-1">{solicitante.direccion_habitacion}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Características de la Vivienda */}
      {hasHousing && (
        <div className="bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--card-border)] p-4 sm:p-6 transition-colors">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-[var(--card-text)]">
            <Home className="w-5 h-5 text-primary" />
            Características de la Vivienda
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {solicitante.tipo_vivienda && (
              <div>
                <label className="text-sm font-medium text-[var(--card-text-muted)]">Tipo de Vivienda</label>
                <p className="text-base text-[var(--card-text)] mt-1">{solicitante.tipo_vivienda}</p>
              </div>
            )}
            {solicitante.cant_habitaciones !== null && solicitante.cant_habitaciones !== undefined && (
              <div>
                <label className="text-sm font-medium text-[var(--card-text-muted)]">Habitaciones</label>
                <p className="text-base text-[var(--card-text)] mt-1">{solicitante.cant_habitaciones} habitaciones</p>
              </div>
            )}
            {solicitante.cant_banos !== null && solicitante.cant_banos !== undefined && (
              <div>
                <label className="text-sm font-medium text-[var(--card-text-muted)]">Baños</label>
                <p className="text-base text-[var(--card-text)] mt-1">{solicitante.cant_banos} baños</p>
              </div>
            )}
            {solicitante.material_piso && (
              <div>
                <label className="text-sm font-medium text-[var(--card-text-muted)]">Material del Piso</label>
                <p className="text-base text-[var(--card-text)] mt-1">{solicitante.material_piso}</p>
              </div>
            )}
            {solicitante.material_paredes && (
              <div>
                <label className="text-sm font-medium text-[var(--card-text-muted)]">Material de las Paredes</label>
                <p className="text-base text-[var(--card-text)] mt-1">{solicitante.material_paredes}</p>
              </div>
            )}
            {solicitante.material_techo && (
              <div>
                <label className="text-sm font-medium text-[var(--card-text-muted)]">Material del Techo</label>
                <p className="text-base text-[var(--card-text)] mt-1">{solicitante.material_techo}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Servicios Básicos */}
      {hasServices && (
        <div className="bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--card-border)] p-4 sm:p-6 transition-colors">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-[var(--card-text)]">
            <Sparkles className="w-5 h-5 text-primary" />
            Servicios Básicos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {solicitante.agua_potable && (
              <div>
                <label className="text-sm font-medium text-[var(--card-text-muted)]">Agua Potable</label>
                <p className="text-base text-[var(--card-text)] mt-1">{solicitante.agua_potable}</p>
              </div>
            )}
            {solicitante.eliminacion_aguas_n && (
              <div>
                <label className="text-sm font-medium text-[var(--card-text-muted)]">Eliminación de Aguas Negras</label>
                <p className="text-base text-[var(--card-text)] mt-1">{solicitante.eliminacion_aguas_n}</p>
              </div>
            )}
            {solicitante.aseo && (
              <div>
                <label className="text-sm font-medium text-[var(--card-text-muted)]">Servicio de Aseo</label>
                <p className="text-base text-[var(--card-text)] mt-1">{solicitante.aseo}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Artefactos Domésticos */}
      {hasArtefactos && (
        <div className="bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--card-border)] p-4 sm:p-6 transition-colors">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-[var(--card-text)]">
            <Package className="w-5 h-5 text-primary" />
            Artefactos Domésticos
          </h3>
          <div className="flex flex-wrap gap-2">
            {artefactos.map((artefacto, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20 dark:border-primary/30"
              >
                {artefacto}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

