'use client';

import ActionHistoryCard from './ActionHistoryCard';

interface Action {
  mainText: string;
  subText?: string;
  caseInfo: string;
}

interface ActionHistoryListProps {
  actions: Action[];
}

export default function ActionHistoryList({
  actions,
}: ActionHistoryListProps) {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {actions.length === 0 ? (
        <div className="text-xs md:text-sm text-gray-500 text-center py-4">
          No hay acciones recientes
        </div>
      ) : (
        actions.map((action, index) => (
          <ActionHistoryCard
            key={index}
            mainText={action.mainText}
            subText={action.subText}
            caseInfo={action.caseInfo}
          />
        ))
      )}
    </div>
  );
}

