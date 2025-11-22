'use client';

import Sidebar from '../../components/sidebar/Sidebar';
import type { UserRole } from '../../components/sidebar/menu-config';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Obtener el rol del usuario desde la sesión/contexto cuando se implemente autenticación
  // Por ahora, usar 'admin' como valor por defecto para pruebas
  const userRole: UserRole = 'admin';

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Configurado según el rol del usuario - Flotante */}
      <div className="flex-shrink-0">
        <Sidebar role={userRole} />
      </div>

      {/* Área de contenido - Aquí se renderizan las páginas del dashboard */}
      <main className="flex-1 overflow-y-auto p-6 bg-background">
        {children}
      </main>
    </div>
  );
}

