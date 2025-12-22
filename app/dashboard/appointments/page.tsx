import { getCitasAction } from '@/app/actions/citas';
import AppointmentsClient from '@/components/appointments/AppointmentsClient';

export default async function AppointmentsPage() {
  // Cargar citas en el servidor
  const result = await getCitasAction();
  const appointments = result.success ? result.data || [] : [];

  return <AppointmentsClient initialAppointments={appointments} />;
}
