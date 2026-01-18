import { getCitasAction } from '@/app/actions/citas';
import { getCasosByUsuarioAction, getAccionesRecientesAction } from '@/app/actions/casos';
import DashboardClient from '@/components/dashboard/DashboardClient';
import type { Appointment } from '@/types/appointment';
import { authorizeRole } from '@/lib/utils/auth-utils';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Permitir a todos los roles autenticados
  await authorizeRole(['coordinator', 'professor', 'student']);

  // Cargar citas, casos y acciones en el servidor
  const [citasResult, casosResult, accionesResult] = await Promise.all([
    getCitasAction({ onlyMine: true }),
    getCasosByUsuarioAction(),
    getAccionesRecientesAction(10),
  ]);

  const appointments = citasResult.success && Array.isArray(citasResult.data) ? citasResult.data : [];
  const casos = casosResult.success && Array.isArray(casosResult.data) ? casosResult.data : [];
  const acciones = accionesResult.success && Array.isArray(accionesResult.data) ? accionesResult.data : [];

  // Solo loguear errores reales en el servidor si no es un problema de sesión (que maneja el layout)
  if (!casosResult.success && casosResult.error && (casosResult.error as any).code !== 'UNAUTHORIZED') {
    console.error('Error al obtener casos:', JSON.stringify(casosResult.error));
  }

  if (!accionesResult.success && accionesResult.error && (accionesResult.error as any).code !== 'UNAUTHORIZED') {
    console.error('Error al obtener acciones:', JSON.stringify(accionesResult.error));
  }

  return <DashboardClient initialAppointments={appointments} initialCasos={casos} initialAcciones={acciones} />;
}
