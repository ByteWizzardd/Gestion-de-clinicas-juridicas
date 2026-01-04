'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Tabs from '@/components/ui/Tabs';
import AuditDetailClient from '@/components/audit/detail/AuditDetailClient';

interface AuditCasesTabsProps {
    defaultTab: string;
}

export default function AuditCasesTabs({ defaultTab }: AuditCasesTabsProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleTabChange = (tabId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tabId);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const tabs = [
        {
            id: 'casos-creados',
            label: 'Creados',
            content: (
                <AuditDetailClient
                    title="Casos Creados"
                    description="Historial de creación de casos"
                    auditType="casos-creados"
                    hideHeader={true}
                />
            ),
        },
        {
            id: 'casos-actualizados',
            label: 'Actualizados',
            content: (
                <AuditDetailClient
                    title="Casos Actualizados"
                    description="Historial de actualizaciones de casos"
                    auditType="casos-actualizados"
                    hideHeader={true}
                />
            ),
        },
        {
            id: 'casos-eliminados',
            label: 'Eliminados',
            content: (
                <AuditDetailClient
                    title="Casos Eliminados"
                    description="Historial de eliminación de casos"
                    auditType="casos-eliminados"
                    hideHeader={true}
                />
            ),
        },
    ];

    return (
        <Tabs
            tabs={tabs}
            defaultTab={defaultTab}
            onTabChange={handleTabChange}
        />
    );
}
