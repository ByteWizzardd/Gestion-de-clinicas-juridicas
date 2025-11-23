'use client';

import { ChartBarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export type ViewMode = 'charts' | 'cards';

interface ViewSwitcherProps {
    activeView: ViewMode;
    onViewChange: (view: ViewMode) => void;
}

export default function ViewSwitcher({ activeView, onViewChange }: ViewSwitcherProps) {
    const buttonClass = (view: ViewMode) => `
        flex items-center justify-center p-3 rounded-lg transition-all
        ${activeView === view
            ? 'bg-primary text-white shadow-md'
            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
        }
    `;

    return (
        <div className="flex gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
            <button
                onClick={() => onViewChange('charts')}
                className={buttonClass('charts')}
                title="Vista de Gráficas"
                aria-label="Vista de Gráficas"
            >
                <ChartBarIcon className="w-5 h-5" />
            </button>
            <button
                onClick={() => onViewChange('cards')}
                className={buttonClass('cards')}
                title="Vista de Reportes"
                aria-label="Vista de Reportes"
            >
                <DocumentTextIcon className="w-5 h-5" />
            </button>
        </div>
    );
}
