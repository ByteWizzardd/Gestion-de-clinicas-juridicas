'use client';

import { useState } from 'react';
import AuditModulesView from '@/components/audit/AuditModulesView';
import AuditGeneralView from '@/components/audit/AuditGeneralView';
import { LayoutGrid, List } from 'lucide-react';

export default function AuditClient() {
  const [activeTab, setActiveTab] = useState<'general' | 'modules'>('general');

  return (
    <div className="w-full">
      {/* Tabs de navegación */}
      <div className="flex items-center justify-between border-b border-gray-200 mb-4 sm:mb-6">
        <div className="flex gap-1 w-full">
          <button
            onClick={() => setActiveTab('general')}
            className={`
              px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-medium whitespace-nowrap shrink border-b-2 transition-colors duration-200 cursor-pointer
              ${activeTab === 'general'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`
              px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-medium whitespace-nowrap shrink border-b-2 transition-colors duration-200 cursor-pointer
              ${activeTab === 'modules'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Módulos
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="mt-4">
        {activeTab === 'general' ? (
          <AuditGeneralView />
        ) : (
          <AuditModulesView />
        )}
      </div>
    </div>
  );
}
