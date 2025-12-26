import { getCitasAction } from '@/app/actions/citas';
import DashboardClient from '@/components/dashboard/DashboardClient';
import type { Appointment } from '@/types/appointment';

export default async function DashboardPage() {
  // Cargar citas en el servidor
  const result = await getCitasAction();
  const appointments: Appointment[] = result.success && Array.isArray(result.data) 
    ? result.data as Appointment[]
    : [];

  return <DashboardClient initialAppointments={appointments} />;
}
