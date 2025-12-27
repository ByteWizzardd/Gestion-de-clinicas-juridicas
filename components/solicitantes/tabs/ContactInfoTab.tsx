'use client';

import { Copy, Check, Phone } from 'lucide-react';
import { useState } from 'react';

interface ContactInfoTabProps {
  solicitante: {
    telefono_local: string | null;
    telefono_celular: string;
    correo_electronico: string;
  };
}

export default function ContactInfoTab({ solicitante }: ContactInfoTabProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  // Verificar si hay información de contacto
  const hasContactInfo = solicitante.telefono_local || solicitante.telefono_celular || solicitante.correo_electronico;

  if (!hasContactInfo) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500 text-lg">No hay información de contacto disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5 text-primary" />
          Información de Contacto
        </h3>
        <div className="space-y-4">
          {/* Teléfono Local */}
          {solicitante.telefono_local && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-500">Teléfono Local</label>
                <a 
                  href={`tel:${solicitante.telefono_local}`}
                  className="text-base text-primary hover:underline block mt-1"
                >
                  {solicitante.telefono_local}
                </a>
              </div>
              <button
                onClick={() => copyToClipboard(solicitante.telefono_local!, 'local')}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Copiar"
              >
                {copied === 'local' ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          )}

          {/* Teléfono Celular */}
          {solicitante.telefono_celular && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="min-w-0 flex-1">
                <label className="text-sm font-medium text-gray-500">Teléfono Celular</label>
                <a 
                  href={`tel:${solicitante.telefono_celular}`}
                  className="text-sm sm:text-base text-primary hover:underline block mt-1 break-words"
                >
                  {solicitante.telefono_celular}
                </a>
              </div>
              <button
                onClick={() => copyToClipboard(solicitante.telefono_celular!, 'celular')}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                title="Copiar"
              >
                {copied === 'celular' ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          )}

          {/* Correo Electrónico */}
          {solicitante.correo_electronico && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="min-w-0 flex-1">
                <label className="text-sm font-medium text-gray-500">Correo Electrónico</label>
                <a 
                  href={`mailto:${solicitante.correo_electronico}`}
                  className="text-sm sm:text-base text-primary hover:underline block mt-1 break-words"
                >
                  {solicitante.correo_electronico}
                </a>
              </div>
              <button
                onClick={() => copyToClipboard(solicitante.correo_electronico, 'email')}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                title="Copiar"
              >
                {copied === 'email' ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

