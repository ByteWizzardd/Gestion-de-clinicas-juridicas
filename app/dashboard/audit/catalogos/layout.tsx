import { ReactNode } from 'react';

export default function AuditCatalogosLayout({ children }: { children: ReactNode }) {
    return (
        <div className="w-full">
            {children}
        </div>
    );
}
