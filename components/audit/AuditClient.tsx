'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuditModulesView from '@/components/audit/AuditModulesView';
import AuditGeneralView from '@/components/audit/AuditGeneralView';
import AuditMaintenanceView from '@/components/audit/AuditMaintenanceView';

type AuditTab = 'general' | 'modules' | 'maintenance';

const TABS: { id: AuditTab; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'modules', label: 'Módulos' },
  { id: 'maintenance', label: 'Mantenimiento' },
];

/** Pestaña visible + si hay que desplegar el modal de depuración. */
interface VistaAuditoria {
  tab: AuditTab;
  abrirPurga: boolean;
}

export default function AuditClient() {
  const [vista, setVista] = useState<VistaAuditoria>({ tab: 'general', abrirPurga: false });
  const router = useRouter();
  const searchParams = useSearchParams();

  // Dos cosas en un solo efecto: la pestaña recordada en sessionStorage y el
  // ?purgeLogs=true con el que llega la notificación de retención — que abre
  // Mantenimiento con el modal ya desplegado, igual que ?archiveInactive=true
  // hace con los casos inactivos.
  useEffect(() => {
    if (searchParams.get('purgeLogs') === 'true') {
      sessionStorage.setItem('auditTabPreference', 'maintenance');
      setVista((actual) =>
        actual.tab === 'maintenance' && actual.abrirPurga
          ? actual
          : { tab: 'maintenance', abrirPurga: true }
      );

      // Se limpia la URL para que recargar no vuelva a abrir el modal.
      const params = new URLSearchParams(searchParams.toString());
      params.delete('purgeLogs');
      const query = params.toString();
      router.replace(query ? `/dashboard/audit?${query}` : '/dashboard/audit');
      return;
    }

    const savedTab = sessionStorage.getItem('auditTabPreference');
    if (savedTab === 'general' || savedTab === 'modules' || savedTab === 'maintenance') {
      setVista((actual) => (actual.tab === savedTab ? actual : { ...actual, tab: savedTab }));
    }
  }, [searchParams, router]);

  const activeTab = vista.tab;

  const handleTabChange = (tab: AuditTab) => {
    setVista((actual) => ({ ...actual, tab }));
    sessionStorage.setItem('auditTabPreference', tab);
  };

  return (
    <div className="w-full">
      {/* Tabs de navegación */}
      <div className="flex items-center justify-between border-b border-[var(--card-border)] mb-4 sm:mb-6 transition-colors">
        <div className="flex gap-1 w-full">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                px-4 sm:px-4 md:px-6 py-2 sm:py-3 text-sm sm:text-sm md:text-base font-medium whitespace-nowrap flex-none border-b-2 transition-colors duration-200 cursor-pointer
                ${activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-[var(--card-text-muted)] hover:text-[var(--foreground)] hover:border-[var(--ui-border)]'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido principal */}
      <div>
        {activeTab === 'general' && <AuditGeneralView />}
        {activeTab === 'modules' && <AuditModulesView />}
        {activeTab === 'maintenance' && (
          <AuditMaintenanceView
            abrirPurga={vista.abrirPurga}
            onPurgaCerrada={() => setVista((actual) => ({ ...actual, abrirPurga: false }))}
          />
        )}
      </div>
    </div>
  );
}
