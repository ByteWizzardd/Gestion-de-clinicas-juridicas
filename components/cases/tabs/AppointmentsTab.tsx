'use client';

import { Calendar, Clock, Users, FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils/date-formatter';

interface AppointmentsTabProps {
  citas?: Array<{
    num_cita: number;
    id_caso: number;
    fecha_encuentro: string;
    fecha_proxima_cita: string | null;
    orientacion: string;
    atenciones: Array<{
      id_usuario: string;
      nombres: string;
      apellidos: string;
      nombre_completo: string;
      fecha_registro: string;
    }>;
  }>;
}

export default function AppointmentsTab({ citas }: AppointmentsTabProps) {
  if (!citas || citas.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No hay citas registradas para este caso</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {citas.map((cita) => (
        <div key={`${cita.num_cita}-${cita.id_caso}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-900">Cita #{cita.num_cita}</h4>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fecha de encuentro: {formatDate(cita.fecha_encuentro)}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {cita.fecha_proxima_cita && (
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Próxima Cita
                </label>
                <p className="text-base text-gray-900 mt-1">{formatDate(cita.fecha_proxima_cita)}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" />
                Orientación
              </label>
              <p className="text-base text-gray-900 mt-1 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 border border-gray-200">
                {cita.orientacion}
              </p>
            </div>

            {cita.atenciones && cita.atenciones.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4" />
                  Atendido por ({cita.atenciones.length})
                </label>
                <div className="space-y-2">
                  {cita.atenciones.map((atencion, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-sm text-gray-900 font-medium">{atencion.nombre_completo}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Fecha de registro: {formatDate(atencion.fecha_registro)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

