'use client';

import { Phone, Mail, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ContactInfoTabProps {
  cliente: {
    telefono_local: string | null;
    telefono_celular: string;
    correo_electronico: string;
  };
}

export default function ContactInfoTab({ cliente }: ContactInfoTabProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold mb-4">Información de Contacto</h3>
        <div className="space-y-4">
          {/* Teléfono Local */}
          {cliente.telefono_local && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <label className="text-sm font-medium text-gray-500">Teléfono Local</label>
                  <a 
                    href={`tel:${cliente.telefono_local}`}
                    className="text-base text-primary hover:underline block mt-1"
                  >
                    {cliente.telefono_local}
                  </a>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(cliente.telefono_local!, 'local')}
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
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary" />
              <div>
                <label className="text-sm font-medium text-gray-500">Teléfono Celular</label>
                <a 
                  href={`tel:${cliente.telefono_celular}`}
                  className="text-base text-primary hover:underline block mt-1"
                >
                  {cliente.telefono_celular}
                </a>
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(cliente.telefono_celular, 'celular')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Copiar"
            >
              {copied === 'celular' ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>

          {/* Correo Electrónico */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <label className="text-sm font-medium text-gray-500">Correo Electrónico</label>
                <a 
                  href={`mailto:${cliente.correo_electronico}`}
                  className="text-base text-primary hover:underline block mt-1"
                >
                  {cliente.correo_electronico}
                </a>
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(cliente.correo_electronico, 'email')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Copiar"
            >
              {copied === 'email' ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

