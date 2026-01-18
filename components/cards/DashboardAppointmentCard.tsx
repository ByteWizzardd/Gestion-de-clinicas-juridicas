'use client';

interface DashboardAppointmentCardProps {
  date: string;
  reason: string;
  onClick?: () => void;
}

export default function DashboardAppointmentCard({
  date,
  reason,
  onClick,
}: DashboardAppointmentCardProps) {

  return (
    <div className="relative flex items-stretch gap-1.5 md:gap-2 cursor-pointer" onClick={onClick}>
      {/* Línea vertical decorativa */}
      <div className="w-0.5 md:w-1 bg-primary rounded-full shrink-0"></div>
      {/* Card */}
      <div className="bg-primary hover:bg-primary-dark rounded-lg md:rounded-xl p-2 md:p-2.5 text-on-primary flex-1 transition-colors">
        <div className="text-xs md:text-sm font-semibold mb-0.5 md:mb-1">
          {date}
        </div>
        <div className="text-[10px] md:text-xs font-normal">{reason}</div>
      </div>
    </div>
  );
}

