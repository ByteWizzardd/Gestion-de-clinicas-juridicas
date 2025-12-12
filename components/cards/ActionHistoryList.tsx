'use client';

import ActionHistoryCard from './ActionHistoryCard';

interface Action {
  mainText: string;
  subText?: string;
  caseInfo: string;
  date: string;
  time: string;
  actionType: 'document' | 'appointment' | 'view' | 'update' | 'other';
}

interface ActionHistoryListProps {
  actions: Action[];
}

export default function ActionHistoryList({
  actions,
}: ActionHistoryListProps) {
  return (
    <div className="relative">
      {actions.length === 0 ? (
        <div className="text-xs md:text-sm text-gray-500 text-center py-8">
          <div className="text-gray-400 mb-2">📋</div>
          No hay acciones recientes
        </div>
      ) : (
        <div className="space-y-0">
          {actions.map((action, index) => (
            <ActionHistoryCard
              key={index}
              mainText={action.mainText}
              subText={action.subText}
              caseInfo={action.caseInfo}
              date={action.date}
              time={action.time}
              actionType={action.actionType}
              isLast={index === actions.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

