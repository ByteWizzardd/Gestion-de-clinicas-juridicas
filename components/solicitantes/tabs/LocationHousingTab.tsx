'use client';

import { MapPin, Home, Droplet, Trash2, Sparkles } from 'lucide-react';

interface LocationHousingTabProps {
  solicitante: {
    nombre_estado?: string | null;
    nombre_municipio?: string | null;
    nombre_parroquia?: string | null;
    tipo_vivienda?: string | null;
    cant_habitaciones?: number | null;
    cant_banos?: number | null;
    material_piso?: string | null;
    material_paredes?: string | null;
    material_techo?: string | null;
    agua_potable?: string | null;
    eliminacion_aguas_n?: string | null;
    aseo?: string | null;
  };
}

export default function LocationHousingTab({ solicitante }: LocationHousingTabProps) {
  // Verificar si hay información de ubicación o vivienda
  const hasLocation = solicitante.nombre_estado || solicitante.nombre_municipio || solicitante.nombre_parroquia;
  const hasHousing = solicitante.tipo_vivienda || solicitante.cant_habitaciones !== null || solicitante.cant_banos !== null;
  const hasServices = solicitante.agua_potable || solicitante.eliminacion_aguas_n || solicitante.aseo;

  if (!hasLocation && !hasHousing && !hasServices) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500 text-lg">No hay información de ubicación y vivienda disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Ubicación Geográfica */}
      {hasLocation && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Ubicación Geográfica
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {solicitante.nombre_estado && (
            <div>
              <label className="text-sm font-medium text-gray-500">Estado</label>
              <p className="text-base text-gray-900 mt-1">{solicitante.nombre_estado}</p>
            </div>
          )}
          {solicitante.nombre_municipio && (
            <div>
              <label className="text-sm font-medium text-gray-500">Municipio</label>
              <p className="text-base text-gray-900 mt-1">{solicitante.nombre_municipio}</p>
            </div>
          )}
          {solicitante.nombre_parroquia && (
            <div>
              <label className="text-sm font-medium text-gray-500">Parroquia</label>
              <p className="text-base text-gray-900 mt-1">{solicitante.nombre_parroquia}</p>
            </div>
          )}
          </div>
        </div>
      )}

      {/* Características de la Vivienda */}
      {hasHousing && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
            <Home className="w-5 h-5 text-primary" />
            Características de la Vivienda
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {solicitante.tipo_vivienda && (
            <div>
              <label className="text-sm font-medium text-gray-500">Tipo de Vivienda</label>
              <p className="text-base text-gray-900 mt-1">{solicitante.tipo_vivienda}</p>
            </div>
          )}
          {solicitante.cant_habitaciones !== null && solicitante.cant_habitaciones !== undefined && (
            <div>
              <label className="text-sm font-medium text-gray-500">Habitaciones</label>
              <p className="text-base text-gray-900 mt-1">{solicitante.cant_habitaciones} habitaciones</p>
            </div>
          )}
          {solicitante.cant_banos !== null && solicitante.cant_banos !== undefined && (
            <div>
              <label className="text-sm font-medium text-gray-500">Baños</label>
              <p className="text-base text-gray-900 mt-1">{solicitante.cant_banos} baños</p>
            </div>
          )}
          {solicitante.material_piso && (
            <div>
              <label className="text-sm font-medium text-gray-500">Material del Piso</label>
              <p className="text-base text-gray-900 mt-1">{solicitante.material_piso}</p>
            </div>
          )}
          {solicitante.material_paredes && (
            <div>
              <label className="text-sm font-medium text-gray-500">Material de las Paredes</label>
              <p className="text-base text-gray-900 mt-1">{solicitante.material_paredes}</p>
            </div>
          )}
          {solicitante.material_techo && (
            <div>
              <label className="text-sm font-medium text-gray-500">Material del Techo</label>
              <p className="text-base text-gray-900 mt-1">{solicitante.material_techo}</p>
            </div>
          )}
          </div>
        </div>
      )}

      {/* Servicios Básicos */}
      {hasServices && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Servicios Básicos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {solicitante.agua_potable && (
            <div className="flex items-start gap-3">
              <Droplet className="w-5 h-5 text-primary mt-1" />
              <div>
                <label className="text-sm font-medium text-gray-500">Agua Potable</label>
                <p className="text-base text-gray-900 mt-1">{solicitante.agua_potable}</p>
              </div>
            </div>
          )}
          {solicitante.eliminacion_aguas_n && (
            <div className="flex items-start gap-3">
              <Trash2 className="w-5 h-5 text-primary mt-1" />
              <div>
                <label className="text-sm font-medium text-gray-500">Eliminación de Aguas Negras</label>
                <p className="text-base text-gray-900 mt-1">{solicitante.eliminacion_aguas_n}</p>
              </div>
            </div>
          )}
          {solicitante.aseo && (
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary mt-1" />
              <div>
                <label className="text-sm font-medium text-gray-500">Servicio de Aseo</label>
                <p className="text-base text-gray-900 mt-1">{solicitante.aseo}</p>
              </div>
            </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

