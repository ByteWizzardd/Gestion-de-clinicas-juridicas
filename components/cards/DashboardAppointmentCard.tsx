'use client';

interface DashboardAppointmentCardProps {
  time: string;
  title: string;
  client: string;
  reason: string;
}

export default function DashboardAppointmentCard({
  time,
  title,
  client,
  reason,
}: DashboardAppointmentCardProps) {
  return (
    <div className="relative flex items-stretch gap-2">
      {/* Línea vertical decorativa */}
      <div className="w-1 bg-primary rounded-full flex-shrink-0"></div>
      {/* Card */}
      <div className="bg-primary rounded-xl p-2.5 text-on-primary flex-1">
        <div className="text-sm font-semibold mb-1">
          {time} - {title}
        </div>
        <div className="text-xs font-normal mb-1">{client}</div>
        <div className="text-xs font-normal">{reason}</div>
      </div>
    </div>
  );
}

