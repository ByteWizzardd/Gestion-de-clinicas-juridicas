import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getCurrentUserAction, logoutAction } from '@/app/actions/auth';
import DashboardLayoutClient from '@/components/dashboard/DashboardLayoutClient';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Obtener usuario en el servidor
  const result = await getCurrentUserAction();

  if (!result.success || !result.data) {
    // Si no hay sesión válida, limpiar la cookie mediante logout y redirigir al login
    // Usamos un parámetro especial para indicar al middleware que permita el acceso
    await logoutAction();
    redirect('/auth/login?invalid_token=true');
  }

  // Obtener preferencia del sidebar desde la cookie (específica del usuario)
  const cookieStore = await cookies();
  const isSidebarCollapsed = cookieStore.get(`sidebar_collapsed_${result.data.cedula}`)?.value === 'true';

  // Obtener preferencia de tema desde la cookie (específica del usuario)
  const themePreference = cookieStore.get(`theme_preference_${result.data.cedula}`)?.value as 'light' | 'dark' | undefined;

  return (
    <DashboardLayoutClient
      user={result.data}
      initialSidebarCollapsed={isSidebarCollapsed}
      initialTheme={themePreference || 'light'}
    >
      {children}
    </DashboardLayoutClient>
  );
}