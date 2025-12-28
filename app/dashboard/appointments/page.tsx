import { getCitasAction } from '@/app/actions/citas';
import AppointmentsClient from '@/components/appointments/AppointmentsClient';

export const dynamic = 'force-dynamic';

export default async function AppointmentsPage() {
  // Cargar citas en el servidor
  const result = await getCitasAction();
  const appointments = result.success && Array.isArray(result.data) ? result.data : [];

  return <AppointmentsClient initialAppointments={appointments} />;
}