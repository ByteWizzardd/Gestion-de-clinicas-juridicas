'use client';

import { useEffect, useState } from 'react';

export default function DateTime() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      // Formatear hora (HH:MM)
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);

      // Formatear fecha (DD-MM-YYYY)
      const day = now.getDate().toString().padStart(2, '0');
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const year = now.getFullYear();
      setCurrentDate(`${day}-${month}-${year}`);
    };

    // Actualizar inmediatamente
    updateDateTime();

    // Actualizar cada minuto
    const interval = setInterval(updateDateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <span className="text-foreground">{currentTime}</span>
      <span className="text-foreground">{currentDate}</span>
    </div>
  );
}