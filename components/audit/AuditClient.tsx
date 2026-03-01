'use client';

import { useState, useEffect } from 'react';
import AuditModulesView from '@/components/audit/AuditModulesView';
import AuditGeneralView from '@/components/audit/AuditGeneralView';
import { LayoutGrid, List } from 'lucide-react';

export default function AuditClient() {
  const [activeTab, setActiveTab] = useState<'general' | 'modules'>('general');

  // Load the initial tab state from session storage when component mounts
  useEffect(() => {
    const savedTab = sessionStorage.getItem('auditTabPreference');
    if (savedTab === 'general' || savedTab === 'modules') {
      setActiveTab(savedTab);
    }
  }, []);

  const handleTabChange = (tab: 'general' | 'modules') => {
    setActiveTab(tab);
    sessionStorage.setItem('auditTabPreference', tab);
  };

  return (
    <div className="w-full">
      {/* Tabs de navegación */}
      <div className="flex items-center justify-between border-b border-[var(--card-border)] mb-4 sm:mb-6 transition-colors">
        <div className="flex gap-1 w-full">
          <button
            onClick={() => handleTabChange('general')}
            className={`
              px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-medium whitespace-nowrap shrink border-b-2 transition-all duration-200 cursor-pointer
              ${activeTab === 'general'
                ? 'border-primary text-primary'
                : 'border-transparent text-[var(--card-text-muted)] hover:text-[var(--foreground)] hover:border-[var(--card-border)]'
              }
            `}
          >
            General
          </button>
          <button
            onClick={() => handleTabChange('modules')}
            className={`
              px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-medium whitespace-nowrap shrink border-b-2 transition-all duration-200 cursor-pointer
              ${activeTab === 'modules'
                ? 'border-primary text-primary'
                : 'border-transparent text-[var(--card-text-muted)] hover:text-[var(--foreground)] hover:border-[var(--card-border)]'
              }
            `}
          >
            Módulos
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div>
        {activeTab === 'general' ? (
          <AuditGeneralView />
        ) : (
          <AuditModulesView />
        )}
      </div>
    </div>
  );
}
