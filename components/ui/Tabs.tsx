'use client';

import { useState, useEffect, ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
}

export default function Tabs({ tabs, defaultTab, onTabChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  // Sincronizar con defaultTab cuando cambia externamente
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="border-b border-gray-200 mb-4 sm:mb-6">
        <div className="flex space-x-1 overflow-x-auto scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium whitespace-nowrap
                border-b-2 transition-colors duration-200 cursor-pointer
                ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-4 min-h-0">
        {activeTabContent}
      </div>
    </div>
  );
}

