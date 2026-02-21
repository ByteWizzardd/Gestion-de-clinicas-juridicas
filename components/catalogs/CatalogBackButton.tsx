import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CatalogBackButton() {
    return (
        <div className="mb-4">
            <Link
                href="/dashboard/administration"
                className="inline-flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
            >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Volver a administración</span>
            </Link>
        </div>
    );
}
