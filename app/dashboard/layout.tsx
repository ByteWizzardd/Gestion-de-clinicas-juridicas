'use client';

import Sidebar from '../../components/sidebar/Sidebar';
import type { UserRole } from '../../components/sidebar/menu-config';
import Notification from '../../components/ui/feedback/Notification';
import DateTime from '../../components/ui/calendar/DateTime';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Rol de usuario, por ahora se usa student pero para pruebas se puede cambiar este valor a admin o professor
  const userRole: UserRole = 'student';

  return (
    <div className="flex h-screen bg-background relative">
      <div className="flex-shrink-0">
        <Sidebar role={userRole} />
      </div>

      <div className="flex-1 flex flex-col w-full">
        <div className="absolute top-6 right-6 flex items-center gap-4 z-10 text-lg bg-white rounded-3xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] px-4 py-2">
          <Notification count={3} />
          <DateTime />
        </div>

        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}