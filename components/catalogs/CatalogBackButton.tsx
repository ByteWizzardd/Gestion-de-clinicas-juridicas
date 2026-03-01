import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CatalogBackButton() {
    return (
        <div className="mb-4">
            <Link
                href="/dashboard/administration"
                className="inline-flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[var(--sidebar-hover)] transition-colors text-[var(--card-text-muted)] hover:text-[var(--foreground)]"
            >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Volver a administración</span>
            </Link>
        </div>
    );
}
