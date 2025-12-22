import { getCitasAction } from '@/app/actions/citas';
import DashboardClient from '@/components/dashboard/DashboardClient';

export default async function DashboardPage() {
  // Cargar citas en el servidor
  const result = await getCitasAction();
  const appointments = result.success ? result.data || [] : [];

  return <DashboardClient initialAppointments={appointments} />;
}
