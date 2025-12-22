import { redirect } from 'next/navigation';
import { getCurrentUserAction } from '@/app/actions/auth';
import DashboardLayoutClient from '@/components/dashboard/DashboardLayoutClient';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Obtener usuario en el servidor
  const result = await getCurrentUserAction();

  if (!result.success || !result.data) {
    // Si no hay sesión, redirigir al login
    redirect('/auth/login');
  }

  return (
    <DashboardLayoutClient user={result.data}>
      {children}
    </DashboardLayoutClient>
  );
}