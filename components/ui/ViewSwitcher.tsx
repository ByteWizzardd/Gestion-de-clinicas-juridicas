'use client';

import { BarChart3, FileText } from 'lucide-react';

export type ViewMode = 'charts' | 'cards';

interface ViewSwitcherProps {
    activeView: ViewMode;
    onViewChange: (view: ViewMode) => void;
}

export default function ViewSwitcher({ activeView, onViewChange }: ViewSwitcherProps) {
    const isChartsActive = activeView === 'charts';

    return (
        <div className="w-full sm:w-[200px] h-[45px] rounded-lg border border-gray-300 overflow-hidden bg-white">
            <label className="inline-flex items-center cursor-pointer w-full h-full">
                <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={!isChartsActive}
                    onChange={(e) => onViewChange(e.target.checked ? 'cards' : 'charts')}
                />
                <div className="relative w-full h-[45px] peer-focus:outline-none peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0 after:left-0 after:bg-primary after:rounded-lg after:h-full after:w-1/2 after:transition-all after:duration-300">
                    {/* Charts Icon */}
                    <div className="absolute left-1/4 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                        <BarChart3
                            className={`w-6 h-6 transition-colors duration-300 ${isChartsActive ? 'text-white' : 'text-primary'
                                }`}
                        />
                    </div>
                    {/* Cards Icon */}
                    <div className="absolute right-1/4 top-1/2 transform translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                        <FileText
                            className={`w-6 h-6 transition-colors duration-300 ${!isChartsActive ? 'text-white' : 'text-primary'
                                }`}
                        />
                    </div>
                </div>
            </label>
        </div>
    );
}
