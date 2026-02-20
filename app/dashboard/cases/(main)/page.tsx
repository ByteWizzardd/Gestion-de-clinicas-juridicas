import { getCasosAction } from '@/app/actions/casos';
import CasesClient from '@/components/cases/CasesClient';
import { authorizeRole } from '@/lib/utils/auth-utils';

export const dynamic = 'force-dynamic';

export default async function CasesPage() {
  // Permitir a todos los roles autenticados
  await authorizeRole(['coordinator', 'professor', 'student']);

  // Cargar casos en el servidor
  const result = await getCasosAction();
  const casos = result.success ? result.data || [] : [];

  return <CasesClient initialCasos={casos} />;
}
