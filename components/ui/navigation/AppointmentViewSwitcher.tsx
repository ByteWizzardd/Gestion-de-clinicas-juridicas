'use client';

import { Calendar, List } from 'lucide-react';

export type AppointmentViewMode = 'calendar' | 'list';

interface AppointmentViewSwitcherProps {
    activeView: AppointmentViewMode;
    onViewChange: (view: AppointmentViewMode) => void;
}

export default function AppointmentViewSwitcher({ activeView, onViewChange }: AppointmentViewSwitcherProps) {
    const isCalendarActive = activeView === 'calendar';

    return (
        <div className="w-full sm:w-[200px] h-[45px] rounded-lg border border-gray-300 overflow-hidden bg-white">
            <label className="inline-flex items-center cursor-pointer w-full h-full">
                <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={!isCalendarActive}
                    onChange={(e) => onViewChange(e.target.checked ? 'list' : 'calendar')}
                />
                <div className="relative w-full h-[45px] peer-focus:outline-none peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0 after:left-0 after:bg-primary after:rounded-lg after:h-full after:w-1/2 after:transition-all after:duration-300">
                    {/* Calendar Icon */}
                    <div className="absolute left-1/4 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                        <Calendar
                            className={`w-6 h-6 transition-colors duration-300 ${isCalendarActive ? 'text-white' : 'text-primary'
                                }`}
                        />
                    </div>
                    {/* List Icon */}
                    <div className="absolute right-1/4 top-1/2 transform translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                        <List
                            className={`w-6 h-6 transition-colors duration-300 ${!isCalendarActive ? 'text-white' : 'text-primary'
                                }`}
                        />
                    </div>
                </div>
            </label>
        </div>
    );
}
