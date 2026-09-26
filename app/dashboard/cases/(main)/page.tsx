import { getCasosAction } from '@/app/actions/casos';
import CasesClient from '@/components/cases/CasesClient';
import { authorizeRole } from '@/lib/utils/auth-utils';
import { mapSystemRoleToSidebarRole } from '@/lib/utils/role-mapper';

export const dynamic = 'force-dynamic';

export default async function CasesPage() {
  // Permitir a todos los roles autenticados
  const user = await authorizeRole(['coordinator', 'professor', 'student']);
  const isCoordinador = mapSystemRoleToSidebarRole(user.rol) === 'coordinator';

  // Cargar casos en el servidor
  const result = await getCasosAction();
  const casos = result.success ? result.data || [] : [];

  return <CasesClient initialCasos={casos} isCoordinador={isCoordinador} />;
}
