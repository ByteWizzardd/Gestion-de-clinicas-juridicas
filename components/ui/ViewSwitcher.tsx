'use client';

import { ChartBarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export type ViewMode = 'charts' | 'cards';

interface ViewSwitcherProps {
    activeView: ViewMode;
    onViewChange: (view: ViewMode) => void;
}

export default function ViewSwitcher({ activeView, onViewChange }: ViewSwitcherProps) {
    const isChartsActive = activeView === 'charts';

    return (
        <div className="w-[200px] h-[45px] rounded-lg border border-gray-300 overflow-hidden bg-white">
            <label className="inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={!isChartsActive}
                    onChange={(e) => onViewChange(e.target.checked ? 'cards' : 'charts')}
                />
                <div className="relative w-[200px] h-[45px] peer-focus:outline-none peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0 after:left-0 after:bg-[#991B1B] after:rounded-lg after:h-full after:w-[100px] after:transition-all after:duration-300">
                    {/* Charts Icon */}
                    <div className="absolute left-[40px] top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
                        <ChartBarIcon
                            className={`w-6 h-6 transition-colors duration-300 ${isChartsActive ? 'text-white' : 'text-[#991B1B]'
                                }`}
                        />
                    </div>
                    {/* Cards Icon */}
                    <div className="absolute right-[40px] top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
                        <DocumentTextIcon
                            className={`w-6 h-6 transition-colors duration-300 ${!isChartsActive ? 'text-white' : 'text-[#991B1B]'
                                }`}
                        />
                    </div>
                </div>
            </label>
        </div>
    );
}
