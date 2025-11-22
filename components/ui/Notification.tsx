'use client';

import { BellIcon } from '@heroicons/react/24/outline';

interface NotificationProps {
  count?: number;
  onClick?: () => void;
}

export default function Notification({ count = 0, onClick }: NotificationProps) {
  return (
    <button onClick={onClick} className="relative flex items-center justify-center p-2 cursor-pointer" aria-label="Notificaciones">
      <BellIcon className="w-6 h-6 text-foreground"/>
      {count > 0 && (
        <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-primary rounded-full">
          {count > 9 ? '9+' : count}
        </span>)}
    </button>
  );
}