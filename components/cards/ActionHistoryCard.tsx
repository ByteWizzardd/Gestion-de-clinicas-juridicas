'use client';

interface ActionHistoryCardProps {
  mainText: string;
  subText?: string;
  caseInfo: string;
}

export default function ActionHistoryCard({
  mainText,
  subText,
  caseInfo,
}: ActionHistoryCardProps) {
  return (
    <div className="bg-primary rounded-xl p-3 md:p-4 text-on-primary">
      <div className="text-sm md:text-base font-semibold mb-1">
        {mainText}
      </div>
      {subText && (
        <div className="text-xs md:text-sm font-normal opacity-90 mb-1">
          ({subText})
        </div>
      )}
      <div className="text-xs md:text-sm font-normal opacity-90">
        {caseInfo}
      </div>
    </div>
  );
}

