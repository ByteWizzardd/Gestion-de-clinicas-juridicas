import { getCitasAction } from '@/app/actions/citas';
import AppointmentsClient from '@/components/appointments/AppointmentsClient';
import { authorizeRole } from '@/lib/utils/auth-utils';

export const dynamic = 'force-dynamic';

export default async function AppointmentsPage() {
  // Permitir a todos los roles autenticados
  await authorizeRole(['coordinator', 'professor', 'student']);

  // Cargar citas en el servidor
  const result = await getCitasAction();
  const appointments = result.success && Array.isArray(result.data) ? result.data : [];

  return <AppointmentsClient initialAppointments={appointments} />;
}